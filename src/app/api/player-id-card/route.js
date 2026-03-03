/**
 * GET /api/player-id-card?playerId= – returns PDF download (player ID card with unique QR code)
 */
import { getFirestore } from '@/lib/firebase-admin'
import { COLLECTIONS } from '@/lib/firestore-collections'
import { badRequest, notFound, serverError } from '@/app/api/lib/responses'
import PDFDocument from 'pdfkit'
import QRCode from 'qrcode'

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

function formatDob (dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  const months = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'
  const month = months.split(' ')[d.getMonth()]
  return `${month} ${d.getFullYear()}`
}

function splitName (fullName) {
  const s = (fullName || '').trim()
  if (!s) return { first: '—', last: '—' }
  const parts = s.split(/\s+/)
  if (parts.length === 1) return { first: parts[0], last: '—' }
  return { first: parts[0], last: parts.slice(1).join(' ').toUpperCase() }
}

async function buildPdfBuffer (player, club, verifyUrl) {
  const qrSize = 72
  const qrBuffer = await QRCode.toBuffer(verifyUrl, { width: qrSize, margin: 1, color: { dark: '#000', light: '#fff' } })

  // Landscape ID card: green header/footer, white body (like sample)
  const cardW = 576
  const cardH = 360
  const green = '#00a651'
  const headerH = 44
  const footerH = 40
  const contentTop = headerH
  const contentBottom = cardH - footerH

  const doc = new PDFDocument({ size: [cardW, cardH], margin: 0 })
  const chunks = []
  doc.on('data', chunk => chunks.push(chunk))
  await new Promise((resolve, reject) => {
    doc.on('end', resolve)
    doc.on('error', reject)

    // Green header band
    doc.rect(0, 0, cardW, headerH).fill(green)
    doc.fillColor('#ffffff').fontSize(14).text('Smart Football', 24, 12, { continued: false })
    doc.fontSize(10).fillColor('rgba(255,255,255,0.95)').text('Official Player ID Card', 24, 28, { continued: false })

    // Green footer band
    doc.rect(0, contentBottom, cardW, footerH).fill(green)

    // White content area
    const left = 24
    const rowH = 18
    let y = contentTop + 14
    const { first: firstName, last: lastName } = splitName(player.fullName)

    const line = (label, value) => {
      const v = value != null && value !== '' ? String(value) : '—'
      doc.fontSize(9).fillColor('#000').font('Helvetica').text(`${label}: `, left, y, { continued: true })
      doc.font('Helvetica-Bold').text(v)
      y += rowH
    }

    doc.fontSize(9).fillColor('#000')
    line('First Name', firstName)
    line('Last Name', lastName)
    line('DOB', formatDob(player.dateOfBirth))
    line('Gender', player.gender || '—')
    line('Player #', player.playerId)
    line('Club', club?.clubName || '—')
    line('Level of Play', player.position || player.residentStatus || '—')

    // QR code – between details and photo, prominent and easy to scan
    const qrX = 228
    const qrY = contentTop + 12
    doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize })
    doc.fontSize(7).fillColor('#555').text('Scan to verify', qrX, qrY + qrSize + 2, { width: qrSize, align: 'center' })

    // Player photo (right side, large)
    const photoW = 118
    const photoH = 142
    const photoX = cardW - 24 - photoW
    const photoY = contentTop + 10
    if (player.photo) {
      try {
        const base64 = player.photo.replace(/^data:image\/\w+;base64,/, '')
        doc.image(Buffer.from(base64, 'base64'), photoX, photoY, { width: photoW, height: photoH })
      } catch (_) {
        doc.rect(photoX, photoY, photoW, photoH).stroke('#ccc')
        doc.fontSize(8).fillColor('#999').text('Photo', photoX, photoY + photoH / 2 - 6, { width: photoW, align: 'center' })
      }
    } else {
      doc.rect(photoX, photoY, photoW, photoH).stroke('#ccc')
      doc.fontSize(8).fillColor('#999').text('Photo', photoX, photoY + photoH / 2 - 6, { width: photoW, align: 'center' })
    }

    // Issue date – Expiry date box (below photo, green border)
    const boxX = photoX
    const boxY = photoY + photoH + 8
    const boxW = photoW
    const boxH = 38
    doc.fillColor('#ffffff').rect(boxX, boxY, boxW, boxH).fill()
    doc.strokeColor(green).rect(boxX, boxY, boxW, boxH).stroke()
    const now = new Date()
    const expiry = new Date(now)
    expiry.setFullYear(expiry.getFullYear() + 1)
    const fmt = d => `${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
    doc.fontSize(7).fillColor('#333').text('ISSUE DATE - EXPIRY DATE:', boxX + 6, boxY + 6, { width: boxW - 12 })
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#000').text(`${fmt(now)} - ${fmt(expiry)}`, boxX + 6, boxY + 18, { width: boxW - 12 })

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

