/**
 * GET /api/referees/[id] – get one referee
 * PUT /api/referees/[id] – update referee
 * DELETE /api/referees/[id] – delete referee
 */
import { getFirestore } from '@/lib/firebase-admin'
import { COLLECTIONS } from '@/lib/firestore-collections'
import { json, noContent, notFound, badRequest, serverError } from '@/app/api/lib/responses'

export async function GET (request, { params }) {
  try {
    const id = await Promise.resolve(params?.id)
    if (!id) return badRequest('id required')
    const db = getFirestore()
    const doc = await db.collection(COLLECTIONS.referees).doc(id).get()
    if (!doc.exists) return notFound('Referee not found')
    return json({ id: doc.id, ...doc.data() })
  } catch (e) {
    console.error(e)
    return serverError(e.message)
  }
}

export async function PUT (request, { params }) {
  try {
    const id = await Promise.resolve(params?.id)
    if (!id) return badRequest('id required')
    const body = await request.json()
    const db = getFirestore()
    const ref = db.collection(COLLECTIONS.referees).doc(id)
    const doc = await ref.get()
    if (!doc.exists) return notFound('Referee not found')
    const allowed = ['refereeId', 'fullName', 'licenseLevel', 'nicOrPassport', 'email', 'age', 'homeTown', 'status']
    const updates = { updatedAt: new Date().toISOString() }
    allowed.forEach(k => { if (body[k] !== undefined) updates[k] = body[k] })
    await ref.update(updates)
    return json({ id, ...updates })
  } catch (e) {
    console.error(e)
    return serverError(e.message)
  }
}

export async function DELETE (request, { params }) {
  try {
    const id = await Promise.resolve(params?.id)
    if (!id) return badRequest('id required')
    const db = getFirestore()
    const ref = db.collection(COLLECTIONS.referees).doc(id)
    const doc = await ref.get()
    if (!doc.exists) return notFound('Referee not found')
    await ref.delete()
    return noContent()
  } catch (e) {
    console.error(e)
    return serverError(e.message)
  }
}
