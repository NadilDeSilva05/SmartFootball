// ============================================================
// ESP32-C3 + BMI160 (motion / steps) + MAX30102 (heart) → Firebase RTDB
//
//   Shared I2C — SDA GPIO8, SCL GPIO9  (Wire)
//   BMI160 and MAX30102 on the same bus (different 7-bit addresses).
//   Share 3.3V and GND.
//
// Libraries: DFRobot_BMI160, SparkFun MAX3010x + heartRate, FirebaseESP32
// ============================================================

#include "DFRobot_BMI160.h"
#include "MAX30105.h"
#include "heartRate.h"
#include <FirebaseESP32.h>
#include <WiFi.h>
#include <Wire.h>

// ---------------- WIFI ----------------
#define WIFI_SSID "nadil_desktop"
#define WIFI_PASSWORD "12345678"

// ---------------- FIREBASE ----------------
#define API_KEY "AIzaSyDgQk7MrHaitSkESqk72IJ-r4POR_TlosE"
#define DATABASE_URL "https://smart-football-c0a93-default-rtdb.firebaseio.com/"

// ---------------- I2C ----------------
#define SDA_PIN 8
#define SCL_PIN 9

// ---------------- BMI160 ----------------
DFRobot_BMI160 bmi160;

static const float ACCEL_LSB_PER_G = 16384.0f;
static const float GYRO_LSB_PER_DPS = 16.4f;

static const unsigned STEP_SENSOR_SCALE = 3u;
static const float PHYSICAL_STRIDE_M = 1.3f;
// Reject BMI160 step-counter spikes (bad I2C read / uint16 wrap).
static const uint16_t MAX_RAW_STEP_DELTA = 150u;
static const float MAX_SPEED_KMH = 45.0f;

static const int BMI160_STEP_INT_LINE = 2;

// ---------------- MAX30102 ----------------
MAX30105 particleSensor;

const byte RATE_SIZE = 8;
byte rates[RATE_SIZE];
byte rateSpot = 0;
long lastBeat = 0;
volatile float beatsPerMinute = 0;
volatile int beatAvg = 0;

const int FINGER_THRESHOLD = 30000;

volatile long sharedIrValue = 0;
volatile bool sharedFingerOn = false;

// ---------------- Firebase ----------------
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;
bool signupOK = false;

// ---------------- Runtime ----------------
unsigned long lastUpload = 0;
const long UPLOAD_INTERVAL_MS = 2000;
String deviceId = "";

static bool stepsOk = false;
static bool heartOk = false;
static uint16_t lastRawSteps = 0;
static bool haveLastRawSteps = false;
static uint32_t sessionPhysicalSteps = 0;
static bool stepSessionResetPending = false;
static unsigned long prevStepSampleMs = 0;
static bool havePrevStepSample = false;

// ---------------- I2C Scanner ----------------
static void i2cScanBus(TwoWire &bus, const char *busName, int sdaGpio,
                       int sclGpio) {
  Serial.print("I2C ");
  Serial.print(busName);
  Serial.print(" SDA=GPIO");
  Serial.print(sdaGpio);
  Serial.print(" SCL=GPIO");
  Serial.println(sclGpio);
  Serial.println("  scan (7-bit addresses)...");
  uint8_t found = 0;
  for (uint8_t a = 1; a < 127; a++) {
    bus.beginTransmission(a);
    if (bus.endTransmission() == 0) {
      Serial.print("    0x");
      if (a < 16)
        Serial.print('0');
      Serial.println(a, HEX);
      found++;
    }
  }
  if (!found)
    Serial.println("    (none — check wiring, power, pull-ups)");
  Serial.println();
}

// ---------------- BMI160 ----------------
static bool bmi160InitAuto() {
  const uint8_t addrs[] = {BMI160_I2C_ADDR, (uint8_t)0x69};
  for (uint8_t i = 0; i < sizeof(addrs); i++) {
    Serial.print("Trying BMI160 at 0x");
    Serial.println(addrs[i], HEX);
    if (bmi160.I2cInit((int8_t)addrs[i]) == BMI160_OK) {
      Serial.println("BMI160 OK");
      return true;
    }
  }
  return false;
}

static bool bmi160StepCounterBegin() {
  if (bmi160.setInt(BMI160_STEP_INT_LINE) != BMI160_OK) {
    Serial.println("BMI160 setInt failed — step counter not started");
    return false;
  }
  if (bmi160.setStepCounter() != BMI160_OK) {
    Serial.println("BMI160 setStepCounter failed");
    return false;
  }
  if (bmi160.setStepPowerMode(bmi160.stepNormalPowerMode) != BMI160_OK) {
    Serial.println("BMI160 setStepPowerMode failed");
    return false;
  }
  Serial.println("Step counter on");
  return true;
}

// ---------------- MAX30102 ----------------
static bool max30102Init() {
  if (!particleSensor.begin(Wire, I2C_SPEED_STANDARD)) {
    Serial.println(
        "MAX30102 not found — heart rate disabled (check I2C address / wiring)");
    return false;
  }
  particleSensor.setup();
  particleSensor.setPulseAmplitudeRed(0x0A);
  particleSensor.setPulseAmplitudeGreen(0);
  Serial.println("MAX30102 OK — place finger on sensor for BPM");
  return true;
}

void max30102Task(void *parameter) {
  while (true) {
    particleSensor.check();
    while (particleSensor.available()) {
      long irValueFIFO = particleSensor.getFIFOIR();
      bool finger = (irValueFIFO > FINGER_THRESHOLD);

      sharedIrValue = irValueFIFO;
      sharedFingerOn = finger;

      if (finger && checkForBeat(irValueFIFO)) {
        long delta = millis() - lastBeat;
        lastBeat = millis();
        if (delta > 300 && delta < 2000) {
          float bpm = 60 / (delta / 1000.0);
          if (bpm > 40 && bpm < 200) {
            beatsPerMinute = bpm;
            rates[rateSpot++] = (byte)bpm;
            rateSpot %= RATE_SIZE;
            int sum = 0;
            for (byte i = 0; i < RATE_SIZE; i++)
              sum += rates[i];
            beatAvg = sum / RATE_SIZE;
          }
        }
      }
      particleSensor.nextSample();
    }
    vTaskDelay(pdMS_TO_TICKS(10));
  }
}

// ---------------- SETUP ----------------
void setup() {
  Serial.begin(115200);
  delay(2000);  // IMPORTANT for ESP32-C3
  Serial.println("STARTING...");

  Wire.begin(SDA_PIN, SCL_PIN);
  Wire.setClock(100000);
  delay(100);
  i2cScanBus(Wire, "Wire (BMI160 + MAX30102)", SDA_PIN, SCL_PIN);

  if (!bmi160InitAuto()) {
    Serial.println("BMI160 init failed — fix I2C, then upload again.");
    while (1)
      delay(1000);
  }

  stepsOk = bmi160StepCounterBegin();
  havePrevStepSample = false;

  heartOk = max30102Init();
  if (heartOk) {
    xTaskCreate(max30102Task, "max30102Task", 4096, NULL, 1, NULL);
  }

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected: " + WiFi.localIP().toString());

  deviceId = WiFi.macAddress();
  deviceId.replace(":", "");
  Serial.println("Device ID: " + deviceId);

  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  Firebase.reconnectNetwork(true);

  if (Firebase.signUp(&config, &auth, "", "")) {
    signupOK = true;
    Serial.println("Firebase anonymous sign-up OK");
  } else {
    Serial.print("Firebase sign-up error: ");
    Serial.println(config.signer.signupError.message.c_str());
  }

  Firebase.begin(&config, &auth);
}

// ---------------- LOOP ----------------
void loop() {
  long irValue = sharedIrValue;
  bool fingerOn = sharedFingerOn;

  int16_t raw[6];
  if (bmi160.getAccelGyroData(raw) != BMI160_OK) {
    delay(50);
    return;
  }

  float gx = raw[0] / GYRO_LSB_PER_DPS;
  float gy = raw[1] / GYRO_LSB_PER_DPS;
  float gz = raw[2] / GYRO_LSB_PER_DPS;
  float ax = raw[3] / ACCEL_LSB_PER_G;
  float ay = raw[4] / ACCEL_LSB_PER_G;
  float az = raw[5] / ACCEL_LSB_PER_G;

  Serial.print("ACC ");
  Serial.print(ax, 2);
  Serial.print(",");
  Serial.print(ay, 2);
  Serial.print(",");
  Serial.print(az, 2);
  Serial.print(" | IR=");
  Serial.print(irValue);
  Serial.print(" BPM~");
  Serial.print(beatAvg);
  if (heartOk && !fingerOn)
    Serial.print(" (no finger)");
  Serial.println();

  if (millis() - lastUpload >= UPLOAD_INTERVAL_MS) {
    lastUpload = millis();

    if (Firebase.ready() && signupOK) {
      if (Firebase.getString(fbdo, "/devices/" + deviceId + "/control/command")) {
        String cmd = fbdo.stringData();
        if (cmd == "reset") {
          Serial.println("Reset command received. Zeroing step session.");
          stepSessionResetPending = true;
          Firebase.setString(fbdo, "/devices/" + deviceId + "/control/command",
                             "ack");
        }
      }

      String basePath = "/devices/" + deviceId + "/sensor";

      if (heartOk) {
        FirebaseJson heartJson;
        heartJson.set("bpm", beatAvg);
        heartJson.set("bpm_instant", (int)beatsPerMinute);
        heartJson.set("ir", irValue);
        heartJson.set("finger", fingerOn);
        heartJson.set("status", fingerOn ? "measuring" : "no_finger");
        heartJson.set("timestamp", (unsigned long)millis());
        if (!Firebase.setJSON(fbdo, basePath + "/heartRate", heartJson)) {
          Serial.println("Firebase heart: " + fbdo.errorReason());
        } else {
          Serial.println("Firebase uploaded heartRate");
        }
      }

      FirebaseJson motionJson;
      motionJson.set("accel/x", ax);
      motionJson.set("accel/y", ay);
      motionJson.set("accel/z", az);
      motionJson.set("gyro/x", gx);
      motionJson.set("gyro/y", gy);
      motionJson.set("gyro/z", gz);
      motionJson.set("timestamp_ms", (unsigned long)millis());

      if (stepsOk) {
        uint16_t rawSteps = 0;
        if (bmi160.readStepCounter(&rawSteps) == BMI160_OK) {
          if (stepSessionResetPending) {
            sessionPhysicalSteps = 0;
            haveLastRawSteps = false;
            havePrevStepSample = false;
            stepSessionResetPending = false;
          }

          bool stepGlitch = false;
          uint16_t rawDelta = 0;
          if (haveLastRawSteps) {
            rawDelta = (uint16_t)(rawSteps - lastRawSteps);
            if (rawDelta > MAX_RAW_STEP_DELTA) {
              stepGlitch = true;
              Serial.println("Step glitch ignored");
              lastRawSteps = rawSteps;
            } else {
              sessionPhysicalSteps += (uint32_t)rawDelta / STEP_SENSOR_SCALE;
              lastRawSteps = rawSteps;
            }
          } else {
            lastRawSteps = rawSteps;
            haveLastRawSteps = true;
          }

          uint32_t physicalSteps = sessionPhysicalSteps;
          float distance_m = (float)physicalSteps * PHYSICAL_STRIDE_M;
          motionJson.set("steps", physicalSteps);
          motionJson.set("stride_m", PHYSICAL_STRIDE_M);
          motionJson.set("distance_m", distance_m);

          float speed_kmh = 0.0f;
          unsigned long nowMs = millis();
          if (!stepGlitch && havePrevStepSample) {
            unsigned long dt_ms = nowMs - prevStepSampleMs;
            if (nowMs < prevStepSampleMs)
              dt_ms = (unsigned long)UPLOAD_INTERVAL_MS;
            float dt_s = dt_ms / 1000.0f;
            if (dt_s > 0.2f) {
              uint32_t intervalSteps = (uint32_t)rawDelta / STEP_SENSOR_SCALE;
              float speed_mps =
                  ((float)intervalSteps * PHYSICAL_STRIDE_M) / dt_s;
              speed_kmh = speed_mps * 3.6f;
              if (speed_kmh > MAX_SPEED_KMH)
                speed_kmh = MAX_SPEED_KMH;
              if (speed_kmh < 0.0f)
                speed_kmh = 0.0f;
            }
          } else if (!havePrevStepSample) {
            havePrevStepSample = true;
          }
          motionJson.set("speed_kmh", speed_kmh);
          if (!stepGlitch)
            prevStepSampleMs = nowMs;

          Serial.print("steps=");
          Serial.print(physicalSteps);
          Serial.print(" dist_m=");
          Serial.print(distance_m, 2);
          Serial.print(" speed_kmh=");
          Serial.println(speed_kmh, 2);
        }
      }

      if (!Firebase.setJSON(fbdo, basePath + "/motion", motionJson)) {
        Serial.println("Firebase motion: " + fbdo.errorReason());
      } else {
        Serial.println("Firebase uploaded motion");
      }
    } else {
      Serial.println("Firebase not ready");
    }
  }

  delay(50);
}
