/**
 * GET /api/club-players/[id] – get one player
 * PUT /api/club-players/[id] – update player
 * DELETE /api/club-players/[id] – remove player from club
 */
import { getFirestore } from '@/lib/firebase-admin'
import { COLLECTIONS } from '@/lib/firestore-collections'
import { json, noContent, notFound, badRequest, serverError } from '@/app/api/lib/responses'

export async function GET (request, { params }) {
  try {
    const id = await Promise.resolve(params?.id)
    if (!id) return badRequest('id required')
    const db = getFirestore()
    const doc = await db.collection(COLLECTIONS.clubPlayers).doc(id).get()
    if (!doc.exists) return notFound('Player not found')
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
    const ref = db.collection(COLLECTIONS.clubPlayers).doc(id)
    const doc = await ref.get()
    if (!doc.exists) return notFound('Player not found')
    const allowed = ['fullName', 'commentaryName', 'jerseyNo', 'nicOrPassport', 'dateOfBirth', 'residentStatus', 'visaNo', 'position', 'photo', 'status']
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
    const ref = db.collection(COLLECTIONS.clubPlayers).doc(id)
    const doc = await ref.get()
    if (!doc.exists) return notFound('Player not found')
    await ref.delete()
    return noContent()
  } catch (e) {
    console.error(e)
    return serverError(e.message)
  }
}
