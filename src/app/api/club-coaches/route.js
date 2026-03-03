/**
 * GET /api/club-coaches?clubId= – list coaches for a club
 * POST /api/club-coaches – add coach (club)
 */
import { getFirestore } from '@/lib/firebase-admin'
import { COLLECTIONS } from '@/lib/firestore-collections'
import { created, badRequest, serverError } from '@/app/api/lib/responses'

export async function GET (request) {
  try {
    const { searchParams } = new URL(request.url)
    const clubId = searchParams.get('clubId')
    if (!clubId) return badRequest('clubId query required')
    const db = getFirestore()
    // Avoid Firestore composite index requirements: fetch by clubId then sort in memory.
    const snap = await db.collection(COLLECTIONS.clubCoaches).where('clubId', '==', clubId).get()
    const list = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => String(a?.fullName || '').localeCompare(String(b?.fullName || '')))
    return Response.json(list)
  } catch (e) {
    console.error(e)
    return serverError(e.message)
  }
}

export async function POST (request) {
  try {
    const body = await request.json()
    const { clubId, coachId, fullName, role, license, nicOrPassport, dateOfBirth, status = 'approved' } = body
    if (!clubId || !coachId?.trim() || !fullName?.trim()) {
      return badRequest('clubId, coachId and fullName are required')
    }
    const db = getFirestore()
    const ref = db.collection(COLLECTIONS.clubCoaches).doc()
    await ref.set({
      clubId,
      coachId: coachId.trim(),
      fullName: fullName.trim(),
      role: role ?? 'assistant_coach',
      license: license ?? '',
      nicOrPassport: nicOrPassport ?? '',
      dateOfBirth: dateOfBirth ?? '',
      status: status === 'pending' ? 'pending' : 'approved',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    return created({ id: ref.id })
  } catch (e) {
    console.error(e)
    return serverError(e.message)
  }
}
