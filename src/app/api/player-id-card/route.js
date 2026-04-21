/**
 * GET /api/player-id-card?playerId= – returns PDF download (player ID card with unique QR code)
 */
import { getFirestore } from '@/lib/firebase-admin'
import { COLLECTIONS } from '@/lib/firestore-collections'
import { badRequest, notFound, serverError } from '@/app/api/lib/responses'
import PDFDocument from 'pdfkit'
import QRCode from 'qrcode'

/** Smart Football “system” greens (aligned with pitch / brand) */
const GREEN = {
  deep: '#022c22',
  mid: '#047857',
  bright: '#059669',
  accent: '#6ee7b7',
  ring: '#a7f3d0'
}

function getBaseUrl (request) {
  try {
    const url = request?.url || request?.nextUrl?.href
    if (url) {
      const u = typeof url === 'string' ? new URL(url) : new URL(url.href)
      return `${u.protocol}//${u.host}`
    }
  } catch (_) {}
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

async function fetchPlayerAndClub (playerId) {
  const db = getFirestore()
  const playerSnap = await db.collection(COLLECTIONS.clubPlayers).doc(playerId).get()
  if (!playerSnap.exists) return { player: null, club: null }
  const player = { id: playerSnap.id, ...playerSnap.data() }
  if (!player.clubId) return { player, club: null }
  const clubSnap = await db.collection(COLLECTIONS.clubs).doc(player.clubId).get()
  const club = clubSnap.exists ? { id: clubSnap.id, ...clubSnap.data() } : null
  return { player, club }
}

function formatExpiryIso (date) {
  if (!date || Number.isNaN(date.getTime())) return '—'
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function calculateAge (dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return '—'
  let age = new Date().getFullYear() - d.getFullYear()
  const m = new Date().getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && new Date().getDate() < d.getDate())) age--
  return String(Math.max(0, age))
}

/** Given name(s) and family name (last token), Freja-style layout */
function splitNameForCard (fullName) {
  const s = (fullName || '').trim()
  if (!s) return { given: '—', family: '—' }
  const parts = s.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return { given: parts[0], family: '—' }
  return { given: parts.slice(0, -1).join(' '), family: parts[parts.length - 1] }
}

function hostFromUrl (verifyUrl) {
  try {
    return new URL(verifyUrl).host
  } catch (_) {
    return 'Smart Football'
  }
}

async function buildPdfBuffer (player, club, verifyUrl) {
  const cardW = 270
  const cardH = 430
  const corner = 14
  const qrSize = 118

  const qrBuffer = await QRCode.toBuffer(verifyUrl, { width: qrSize * 2, margin: 1, color: { dark: '#0f172a', light: '#ffffff' } })

  const now = new Date()
  const expiry = new Date(now)
  expiry.setFullYear(expiry.getFullYear() + 1)
  const expiryStr = formatExpiryIso(expiry)
  const { given, family } = splitNameForCard(player.fullName)
  const age = calculateAge(player.dateOfBirth)
  const idLabel = player.nicOrPassport?.trim() ? 'NIC / Passport' : 'Player #'
  const idVal = player.nicOrPassport?.trim() || player.playerId || '—'
  const host = hostFromUrl(verifyUrl)

  const doc = new PDFDocument({ size: [cardW, cardH], margin: 0 })
  const chunks = []
  doc.on('data', chunk => chunks.push(chunk))

  await new Promise((resolve, reject) => {
    doc.on('end', resolve)
    doc.on('error', reject)

    // --- Outer card: rounded + vertical green gradient ---
    doc.save()
    doc.roundedRect(0, 0, cardW, cardH, corner).clip()
    const grad = doc.linearGradient(0, 0, 0, cardH)
    grad.stop(0, GREEN.bright).stop(0.45, GREEN.mid).stop(1, GREEN.deep)
    doc.rect(0, 0, cardW, cardH).fill(grad)
    doc.restore()

    const cx = cardW / 2
    const photoR = 46
    const photoCY = 78

    // Soft outer ring (glow)
    doc.lineWidth(2)
    doc.strokeColor(GREEN.ring)
    doc.circle(cx, photoCY, photoR + 4)
    doc.stroke()

    // Photo clipped to circle
    doc.save()
    doc.circle(cx, photoCY, photoR).clip()
    if (player.photo) {
      try {
        const base64 = player.photo.replace(/^data:image\/\w+;base64,/, '')
        const imgBuf = Buffer.from(base64, 'base64')
        doc.image(imgBuf, cx - photoR, photoCY - photoR, { width: photoR * 2, height: photoR * 2 })
      } catch (_) {
        doc.fillColor('rgba(255,255,255,0.15)').rect(cx - photoR, photoCY - photoR, photoR * 2, photoR * 2).fill()
      }
    } else {
      doc.fillColor('rgba(255,255,255,0.12)').rect(cx - photoR, photoCY - photoR, photoR * 2, photoR * 2).fill()
      doc.fillColor('rgba(255,255,255,0.7)').fontSize(8).font('Helvetica').text('Photo', cx - photoR, photoCY - 4, { width: photoR * 2, align: 'center' })
    }
    doc.restore()

    // Inner ring on top of photo edge
    doc.lineWidth(1.5)
    doc.strokeColor(GREEN.accent)
    doc.circle(cx, photoCY, photoR + 1)
    doc.stroke()

    // --- Profile text (white, centered) ---
    let ty = photoCY + photoR + 18
    const labelLine = (label, value) => {
      const v = value != null && value !== '' ? String(value) : '—'
      doc.font('Helvetica-Bold').fontSize(8.4).fillColor('#ffffff')
      doc.text(`${label}: ${v}`, 20, ty, { width: cardW - 40, align: 'center' })
      ty += 15
    }

    labelLine('Expiry date', expiryStr)
    labelLine('Surname', family)
    labelLine('Name', given)
    labelLine('Age', age)

    // --- Bottom: white “nested” verify panel ---
    const innerX = 18
    const innerY = Math.min(ty + 14, cardH - 198)
    const innerW = cardW - 36
    const innerH = cardH - innerY - 16
    const headerH = 34

    doc.roundedRect(innerX, innerY, innerW, innerH, 10).fill('#ffffff')

    doc.fillColor('#141414').rect(innerX, innerY, innerW, headerH).fill()
    doc.fillColor('#ffffff').font('Helvetica').fontSize(6.2)
    const hint = `Verify ID: scan QR below or open verify page · ${host}`
    doc.text(hint, innerX + 8, innerY + 11, { width: innerW - 16, align: 'center' })

    doc.strokeColor(GREEN.bright).lineWidth(1.2)
    doc.moveTo(innerX, innerY + headerH).lineTo(innerX + innerW, innerY + headerH).stroke()

    let vy = innerY + headerH + 10
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#0f172a')
    doc.text(`${idLabel}: ${idVal}`, innerX, vy, { width: innerW, align: 'center' })
    vy += 18

    const qrX = innerX + (innerW - qrSize) / 2
    doc.image(qrBuffer, qrX, vy, { width: qrSize, height: qrSize })
    vy += qrSize + 8

    doc.font('Helvetica').fontSize(6.8).fillColor(GREEN.mid)
    doc.text('Data shared via QR code', innerX, vy, { width: innerW, align: 'center', underline: true, link: verifyUrl })
    vy += 11

    doc.font('Helvetica').fontSize(5.8).fillColor('#94a3b8')
    doc.text(club?.clubName ? `${club.clubName} · Official player ID` : 'Smart Football · Official player ID', innerX + 6, vy, { width: innerW - 12, align: 'center' })

    doc.end()
  })

  return Buffer.concat(chunks)
}

export async function GET (request) {
  try {
    const { searchParams } = new URL(request.url)
    const playerId = searchParams.get('playerId')
    if (!playerId) return badRequest('playerId is required')
    const { player, club } = await fetchPlayerAndClub(playerId)
    if (!player) return notFound('Player not found')
    const baseUrl = getBaseUrl(request)
    const verifyUrl = `${baseUrl}/player/verify/${playerId}`
    const pdfBuffer = await buildPdfBuffer(player, club, verifyUrl)
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="player-id-${player.playerId || playerId}.pdf"`
      }
    })
  } catch (e) {
    console.error(e)
    return serverError(e?.message || 'Failed to generate ID card')
  }
}
