/**
 * GET /api/leagues/[id] – get one league
 * PUT /api/leagues/[id] – update league
 * DELETE /api/leagues/[id] – delete league
 */
import { getFirestore } from '@/lib/firebase-admin'
import { COLLECTIONS } from '@/lib/firestore-collections'
import { json, noContent, notFound, badRequest, serverError } from '@/app/api/lib/responses'

export async function GET (request, { params }) {
  try {
    const id = await Promise.resolve(params?.id)
    if (!id) return badRequest('id required')
    const db = getFirestore()
    const doc = await db.collection(COLLECTIONS.leagues).doc(id).get()
    if (!doc.exists) return notFound('League not found')
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
    const ref = db.collection(COLLECTIONS.leagues).doc(id)
    const doc = await ref.get()
    if (!doc.exists) return notFound('League not found')
    const updates = { updatedAt: new Date().toISOString() }
    if (body.name !== undefined) updates.name = body.name
    if (body.season !== undefined) updates.season = body.season
    if (body.status !== undefined) updates.status = body.status
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
    const ref = db.collection(COLLECTIONS.leagues).doc(id)
    const doc = await ref.get()
    if (!doc.exists) return notFound('League not found')
    await ref.delete()
    return noContent()
  } catch (e) {
    console.error(e)
    return serverError(e.message)
  }
}
