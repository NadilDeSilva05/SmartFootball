/**
 * GET /api/referees – list all referees
 * POST /api/referees – create referee
 */
import { getFirestore } from '@/lib/firebase-admin'
import { COLLECTIONS } from '@/lib/firestore-collections'
import { created, badRequest, serverError } from '@/app/api/lib/responses'

export async function GET () {
  try {
    const db = getFirestore()
    const snap = await db.collection(COLLECTIONS.referees).orderBy('fullName').get()
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    return Response.json(list)
  } catch (e) {
    console.error(e)
    return serverError(e.message)
  }
}

export async function POST (request) {
  try {
    const body = await request.json()
    const { refereeId, fullName, licenseLevel, nicOrPassport, email, status = 'active' } = body
    if (!refereeId?.trim() || !fullName?.trim()) {
      return badRequest('refereeId and fullName are required')
    }
    const db = getFirestore()
    const ref = db.collection(COLLECTIONS.referees).doc()
    await ref.set({
      refereeId: refereeId.trim(),
      fullName: fullName.trim(),
      licenseLevel: licenseLevel ?? '',
      nicOrPassport: nicOrPassport ?? '',
      email: email ?? '',
      status: status === 'inactive' ? 'inactive' : 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    return created({ id: ref.id, refereeId: body.refereeId, fullName: body.fullName })
  } catch (e) {
    console.error(e)
    return serverError(e.message)
  }
}
