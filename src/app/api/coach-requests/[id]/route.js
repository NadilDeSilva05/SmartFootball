/**
 * GET /api/coach-requests/[id]
 * PATCH /api/coach-requests/[id] – approve or reject (federation)
 */
import { getFirestore } from '@/lib/firebase-admin'
import { COLLECTIONS } from '@/lib/firestore-collections'
import { json, notFound, badRequest, serverError } from '@/app/api/lib/responses'

export async function GET (request, { params }) {
  try {
    const id = await Promise.resolve(params?.id)
    if (!id) return badRequest('id required')
    const db = getFirestore()
    const doc = await db.collection(COLLECTIONS.coachRequests).doc(id).get()
    if (!doc.exists) return notFound('Request not found')
    return Response.json({ id: doc.id, ...doc.data() })
  } catch (e) {
    console.error(e)
    return serverError(e.message)
  }
}

export async function PATCH (request, { params }) {
  try {
    const id = await Promise.resolve(params?.id)
    if (!id) return badRequest('id required')
    const body = await request.json()
    const { status } = body
    if (status !== 'approved' && status !== 'rejected') {
      return badRequest('status must be approved or rejected')
    }
    const db = getFirestore()
    const ref = db.collection(COLLECTIONS.coachRequests).doc(id)
    const doc = await ref.get()
    if (!doc.exists) return notFound('Request not found')
    await ref.update({
      status,
      updatedAt: new Date().toISOString(),
      ...(status === 'approved' ? { approvedAt: new Date().toISOString() } : {})
    })
    return Response.json({ id, status })
  } catch (e) {
    console.error(e)
    return serverError(e.message)
  }
}
