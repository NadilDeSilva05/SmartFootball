/**
 * GET /api/club-coaches/[id] – get one coach
 * PUT /api/club-coaches/[id] – update coach
 * DELETE /api/club-coaches/[id] – remove coach from club
 */
import { getFirestore } from '@/lib/firebase-admin'
import { COLLECTIONS } from '@/lib/firestore-collections'
import { json, noContent, notFound, badRequest, serverError } from '@/app/api/lib/responses'

export async function GET (request, { params }) {
  try {
    const id = await Promise.resolve(params?.id)
    if (!id) return badRequest('id required')
    const db = getFirestore()
    const doc = await db.collection(COLLECTIONS.clubCoaches).doc(id).get()
    if (!doc.exists) return notFound('Coach not found')
    return Response.json({ id: doc.id, ...doc.data() })
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
    const ref = db.collection(COLLECTIONS.clubCoaches).doc(id)
    const doc = await ref.get()
    if (!doc.exists) return notFound('Coach not found')
    const allowed = ['fullName', 'role', 'license', 'nicOrPassport', 'dateOfBirth', 'status']
    const updates = { updatedAt: new Date().toISOString() }
    allowed.forEach(k => { if (body[k] !== undefined) updates[k] = body[k] })
    await ref.update(updates)
    return Response.json({ id, ...updates })
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
    const ref = db.collection(COLLECTIONS.clubCoaches).doc(id)
    const doc = await ref.get()
    if (!doc.exists) return notFound('Coach not found')
    await ref.delete()
    return noContent()
  } catch (e) {
    console.error(e)
    return serverError(e.message)
  }
}
