/**
 * GET /api/player-requests/[id]
 * PATCH /api/player-requests/[id] � approve or reject (federation)
 */
import { getFirestore } from '@/lib/firebase-admin'
import { COLLECTIONS } from '@/lib/firestore-collections'
import { notFound, badRequest, serverError } from '@/app/api/lib/responses'

export async function GET (request, { params }) {
  try {
    const id = await Promise.resolve(params?.id)
    if (!id) return badRequest('id required')
    const db = getFirestore()
    const doc = await db.collection(COLLECTIONS.playerRequests).doc(id).get()
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
    const { status, reason = '' } = body

    if (status !== 'approved' && status !== 'rejected') {
      return badRequest('status must be approved or rejected')
    }
    if (status === 'rejected' && !reason.trim()) {
      return badRequest('Rejection reason is required')
    }

    const db = getFirestore()
    const requestRef = db.collection(COLLECTIONS.playerRequests).doc(id)
    const requestDoc = await requestRef.get()
    if (!requestDoc.exists) return notFound('Request not found')

    const requestData = requestDoc.data() || {}
    if ((requestData.status || '') !== 'pending') {
      return badRequest('Only pending requests can be reviewed')
    }

    const nowIso = new Date().toISOString()

    if (status === 'approved') {
      const duplicate = await db
        .collection(COLLECTIONS.clubPlayers)
        .where('clubId', '==', requestData.clubId)
        .where('playerId', '==', requestData.playerId)
        .get()

      if (duplicate.empty) {
        const playerRef = db.collection(COLLECTIONS.clubPlayers).doc()
        await playerRef.set({
          clubId: requestData.clubId,
          playerId: requestData.playerId,
          fullName: requestData.fullName || '',
          email: requestData.email || '',
          commentaryName: requestData.commentaryName || '',
          jerseyNo: requestData.jerseyNo || '',
          nicOrPassport: requestData.nicOrPassport || '',
          dateOfBirth: requestData.dateOfBirth || '',
          residentStatus: requestData.residentStatus || 'local',
          visaNo: requestData.visaNo || '',
          position: requestData.position || 'Forward',
          photo: requestData.photo ?? null,
          status: 'approved',
          approvedFromRequestId: id,
          createdAt: nowIso,
          updatedAt: nowIso
        })
      }
    }

    await requestRef.update({
      status,
      reviewReason: status === 'rejected' ? reason.trim() : '',
      reviewedAt: nowIso,
      updatedAt: nowIso,
      ...(status === 'approved' ? { approvedAt: nowIso } : {})
    })

    return Response.json({ id, status })
  } catch (e) {
    console.error(e)
    return serverError(e.message)
  }
}
