/**
 * GET /api/leagues – list all leagues
 * POST /api/leagues – create league
 */
import { getFirestore } from '@/lib/firebase-admin'
import { COLLECTIONS } from '@/lib/firestore-collections'
import { created, badRequest, serverError } from '@/app/api/lib/responses'

export async function GET () {
  try {
    const db = getFirestore()
    const snap = await db.collection(COLLECTIONS.leagues).orderBy('name').get()
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
    const { name, season, status = 'active' } = body
    if (!name?.trim()) return badRequest('name is required')
    const db = getFirestore()
    const ref = db.collection(COLLECTIONS.leagues).doc()
    await ref.set({
      name: name.trim(),
      season: season ?? '',
      status: status === 'inactive' ? 'inactive' : 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    return created({ id: ref.id, name: body.name })
  } catch (e) {
    console.error(e)
    return serverError(e.message)
  }
}
