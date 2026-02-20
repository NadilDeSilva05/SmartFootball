/**
 * GET /api/clubs/[id] – get one club
 * PUT /api/clubs/[id] – update club
 * DELETE /api/clubs/[id] – delete club
 */
import { getFirestore } from '@/lib/firebase-admin'
import { COLLECTIONS } from '@/lib/firestore-collections'
import { json, noContent, notFound, badRequest, serverError } from '@/app/api/lib/responses'

export async function GET (request, { params }) {
  try {
    const id = await Promise.resolve(params?.id)
    if (!id) return badRequest('id required')
    const db = getFirestore()
    const doc = await db.collection(COLLECTIONS.clubs).doc(id).get()
    if (!doc.exists) return notFound('Club not found')
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
    const { clubName, city, logo, adminEmail, status } = body
    const db = getFirestore()
    const ref = db.collection(COLLECTIONS.clubs).doc(id)
    const doc = await ref.get()
    if (!doc.exists) return notFound('Club not found')
    const updates = { updatedAt: new Date().toISOString() }
    if (clubName !== undefined) updates.clubName = clubName
    if (city !== undefined) updates.city = city
    if (logo !== undefined) updates.logo = logo
    if (adminEmail !== undefined) updates.adminEmail = adminEmail
    if (status !== undefined) updates.status = status
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
    const ref = db.collection(COLLECTIONS.clubs).doc(id)
    const doc = await ref.get()
    if (!doc.exists) return notFound('Club not found')
    await ref.delete()
    return noContent()
  } catch (e) {
    console.error(e)
    return serverError(e.message)
  }
}
