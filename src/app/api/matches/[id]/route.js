/**
 * GET /api/matches/[id] – get one match
 * PUT /api/matches/[id] – update match (e.g. assign referees, result)
 * DELETE /api/matches/[id] – delete match
 */
import { getFirestore } from '@/lib/firebase-admin'
import { COLLECTIONS } from '@/lib/firestore-collections'
import { json, noContent, notFound, badRequest, serverError } from '@/app/api/lib/responses'

export async function GET (request, { params }) {
  try {
    const id = await Promise.resolve(params?.id)
    if (!id) return badRequest('id required')
    const db = getFirestore()
    const doc = await db.collection(COLLECTIONS.matches).doc(id).get()
    if (!doc.exists) return notFound('Match not found')
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
    const ref = db.collection(COLLECTIONS.matches).doc(id)
    const doc = await ref.get()
    if (!doc.exists) return notFound('Match not found')
    const allowed = ['leagueId', 'homeClubId', 'awayClubId', 'matchDate', 'matchTime', 'venue', 'referees', 'status', 'homeScore', 'awayScore', 'resultNotes']
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
    const ref = db.collection(COLLECTIONS.matches).doc(id)
    const doc = await ref.get()
    if (!doc.exists) return notFound('Match not found')
    await ref.delete()
    return noContent()
  } catch (e) {
    console.error(e)
    return serverError(e.message)
  }
}
