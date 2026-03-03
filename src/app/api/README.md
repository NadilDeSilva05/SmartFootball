# SmartFootball API (Next.js Route Handlers + Firebase Admin)

Base URL: `/api` (e.g. `GET /api/clubs`).

## Environment

Copy `.env.local.example` to `.env.local` and set:

- Firebase Admin credentials (for API routes)
- **`FIREBASE_DATABASE_URL`** (optional, server) – Realtime Database URL so IoT ingest/stop write live metrics to RTDB.
- **`NEXT_PUBLIC_FIREBASE_DATABASE_URL`** (optional, client) – Same RTDB URL for the coach dashboard to listen to live metrics in real time. If unset, the dashboard polls `/api/iot/live` instead.
- `FEDERATION_ADMIN_SECRET_CODE` – security code required for federation admin registration
- `NEXT_PUBLIC_FIREBASE_*` – Firebase client config (for login/auth)

**Club logos:** Stored as base64 in Firestore (no Firebase Storage required). Keep images small (e.g. under ~500 KB) to stay within Firestore’s 1 MB document limit.

---

## Auth Endpoints

| Method | Path | Description |
|--------|------|--------------|
| POST | `/api/auth/register-federation-admin` | Register federation admin (body: email, password, fullName, **securityCode**) |
| POST | `/api/auth/register` | Register other roles (body: email, password, fullName, role) |
| GET | `/api/auth/me` | Get current user (requires `Authorization: Bearer <token>`) |

---

## Other Endpoints

### Clubs
| Method | Path | Description |
|--------|------|--------------|
| GET | `/api/clubs` | List all clubs |
| POST | `/api/clubs` | Create club (body: clubId, clubName, city, league, logo?, adminFullName, adminEmail, adminPassword?, status?) |
| GET | `/api/clubs/[id]` | Get one club |
| PUT | `/api/clubs/[id]` | Update club |
| DELETE | `/api/clubs/[id]` | Delete club |

### Referees
| Method | Path | Description |
|--------|------|--------------|
| GET | `/api/referees` | List all referees |
| POST | `/api/referees` | Create referee |
| GET | `/api/referees/[id]` | Get one |
| PUT | `/api/referees/[id]` | Update |
| DELETE | `/api/referees/[id]` | Delete |

### Leagues
| Method | Path | Description |
|--------|------|--------------|
| GET | `/api/leagues` | List all leagues |
| POST | `/api/leagues` | Create league |
| GET | `/api/leagues/[id]` | Get one |
| PUT | `/api/leagues/[id]` | Update |
| DELETE | `/api/leagues/[id]` | Delete |

### Standings (points table, top scorers)
| Method | Path | Description |
|--------|------|--------------|
| GET | `/api/standings?leagueId=` | Standings computed from played matches. Returns `{ standings, topScorers }` |

### Matches
| Method | Path | Description |
|--------|------|--------------|
| GET | `/api/matches` | List (query: `?leagueId=`, `?status=`) |
| POST | `/api/matches` | Create match |
| GET | `/api/matches/[id]` | Get one |
| PUT | `/api/matches/[id]` | Update (incl. referees, result) |
| DELETE | `/api/matches/[id]` | Delete |

### Player requests (federation)
| Method | Path | Description |
|--------|------|--------------|
| GET | `/api/player-requests` | List (`?status=pending|approved|rejected`, optional `?clubId=`) |
| POST | `/api/player-requests` | Club submits request |
| GET | `/api/player-requests/[id]` | Get one |
| PATCH | `/api/player-requests/[id]` | Approve/reject (body: `{ status: "approved" | "rejected", reason?: string }`) |

### Coach requests (federation)
| Method | Path | Description |
|--------|------|--------------|
| GET | `/api/coach-requests` | List (`?status=`) |
| POST | `/api/coach-requests` | Club submits request |
| GET | `/api/coach-requests/[id]` | Get one |
| PATCH | `/api/coach-requests/[id]` | Approve/reject |

### Club players
| Method | Path | Description |
|--------|------|--------------|
| GET | `/api/club-players?clubId=` | List players for club |
| POST | `/api/club-players` | Add player |
| GET | `/api/club-players/[id]` | Get one |
| PUT | `/api/club-players/[id]` | Update |
| DELETE | `/api/club-players/[id]` | Remove |

### Club coaches
| Method | Path | Description |
|--------|------|--------------|
| GET | `/api/club-coaches?clubId=` | List coaches for club |
| POST | `/api/club-coaches` | Add coach |
| GET | `/api/club-coaches/[id]` | Get one |
| PUT | `/api/club-coaches/[id]` | Update |
| DELETE | `/api/club-coaches/[id]` | Remove |

### IoT (ESP32 / energy management devices)
| Method | Path | Description |
|--------|------|--------------|
| GET | `/api/iot/devices` | List registered devices (for referee UI) |
| POST | `/api/iot/devices` | Register device (body: deviceId, name, type?). ESP32 calls this on boot. |
| GET | `/api/iot/player-device-link?matchId=` | List device–player links for a match |
| POST | `/api/iot/player-device-link` | Link device to player (body: playerId, deviceId, matchId). Referee uses after scanning player. |
| POST | `/api/iot/ingest` | Device sends metrics. Writes to **Firestore** and **Firebase Realtime Database** (when `FIREBASE_DATABASE_URL` is set). Body: (matchId, playerId) or **deviceId**; plus heartRate, fatigueLevel, playerLoad, sprintCount, highIntensityDist, workRate, injuryRisk?. |
| POST | `/api/iot/ingest/stop` | Stop device stream (matchId, playerId). Updates Firestore and RTDB. Coach uses on substitute. |
| GET | `/api/iot/live?matchId=` | Get current live metrics for match |

### Sessions (performance history)
| Method | Path | Description |
|--------|------|--------------|
| GET | `/api/sessions` | List (`?playerId=`, `?matchId=`, or all) |
| POST | `/api/sessions` | Save completed session (substitute or full_time) |

### Referee (scan / register)
| Method | Path | Description |
|--------|------|--------------|
| POST | `/api/referee/register-player` | Register player for match (matchId, playerId, playerName?, matchName?, startTime?, club?, jerseyNumber?) |
| GET | `/api/referee/registered?matchId=` | List registered players for match |

---

## Firestore collections

Defined in `@/lib/firestore-collections.js`: `clubs`, `referees`, `leagues`, `matches`, `player_requests`, `coach_requests`, `club_players`, `club_coaches`, `match_sessions`, `match_registrations`, `live_metrics`, `iot_devices`, `player_device_links`.

For real-time UI, use the Firebase **client** SDK and listen to `live_metrics` (e.g. where `matchId == currentMatch` and `status == 'live'`).

## Firebase: Firestore vs Realtime Database

- **Firestore** – used for all other app data (clubs, matches, players, referees, registrations, etc.).
- **Realtime Database (RTDB)** – used for **IoT player performance metrics** from devices. The coach dashboard reads live metrics from RTDB when **`NEXT_PUBLIC_FIREBASE_DATABASE_URL`** is set in env.

If **`FIREBASE_DATABASE_URL`** is set on the **server** (API routes), IoT ingest and stop write to RTDB:

- **Path:** `live_metrics/{matchId}/{playerId}` — payload: heartRate, fatigueLevel, playerLoad, sprintCount, highIntensityDist, workRate, injuryRisk, status, updatedAt, etc.
- The **coach dashboard** uses the **client** SDK and **`NEXT_PUBLIC_FIREBASE_DATABASE_URL`** to listen in real time to `live_metrics/{matchId}`. If that env is not set, the dashboard falls back to polling **GET /api/iot/live?matchId=** every 3 seconds. In Firebase Console → Realtime Database → Rules, allow read for authenticated users on `live_metrics` (e.g. `"live_metrics": { ".read": "auth != null" }`).

