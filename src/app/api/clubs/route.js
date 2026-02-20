/**
 * GET /api/clubs – list all clubs
 * POST /api/clubs – create club
 */
import { getFirestore } from '@/lib/firebase-admin'
import { COLLECTIONS } from '@/lib/firestore-collections'
import { created, badRequest, serverError } from '@/app/api/lib/responses'

export async function GET () {
  try {
    const db = getFirestore()
    const snap = await db.collection(COLLECTIONS.clubs).orderBy('clubName').get()
    const clubs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    return Response.json(clubs)
  } catch (e) {
    console.error(e)
    return serverError(e.message)
  }
}

export async function POST (request) {
  try {
    const body = await request.json()
    const { clubId, clubName, city, league, logo, adminFullName, adminEmail, adminPassword, status = 'active' } = body
    if (!clubId?.trim() || !clubName?.trim() || !adminEmail?.trim()) {
      return badRequest('clubId, clubName and adminEmail are required')
    }
    const db = getFirestore()
    const ref = db.collection(COLLECTIONS.clubs).doc()
    await ref.set({
      clubId: clubId.trim(),
      clubName: clubName.trim(),
      city: city?.trim() ?? '',
      league: league ?? '',
      logo: logo ?? null,
      adminFullName: adminFullName?.trim() ?? '',
      adminEmail: adminEmail.trim(),
      status: status === 'pending' || status === 'inactive' ? status : 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    return created({ id: ref.id, clubId: body.clubId, clubName: body.clubName })
  } catch (e) {
    console.error(e)
    return serverError(e.message)
  }
}
