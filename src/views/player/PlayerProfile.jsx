'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import Skeleton from '@mui/material/Skeleton'
import HorizontalWithSubtitle from '@components/card-statistics/HorizontalWithSubtitle'
import {
  PlayerHero,
  PlayerIdentityCard,
  SectionTitle,
  DetailItem,
  getStatusColor,
  formatDateLabel
} from './playerShared'

const PlayerProfile = () => {
  const user = useSelector(state => state?.authenticationReducer?.loginData?.user)
  const token = useSelector(state => state?.authenticationReducer?.loginData?.token)

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [resolvedPlayerDocId, setResolvedPlayerDocId] = useState(null)

  const playerDocId = user?.clubPlayerDocId || resolvedPlayerDocId || ''
  const displayName = profile?.fullName || user?.fullName || user?.email?.split('@')[0] || 'Player'

  useEffect(() => {
    if (user?.clubPlayerDocId) {
      setResolvedPlayerDocId(user.clubPlayerDocId)

      return
    }

    if (!token) {
      setLoading(false)

      return
    }

    let cancelled = false

    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(me => {
        if (!cancelled && me?.clubPlayerDocId) setResolvedPlayerDocId(me.clubPlayerDocId)
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [token, user?.clubPlayerDocId])

  useEffect(() => {
    if (!playerDocId) {
      setLoading(false)

      return
    }

    let cancelled = false
    setLoading(true)
    setError('')

    fetch(`/api/club-players/${encodeURIComponent(playerDocId)}`)
      .then(r => r.json().catch(() => ({})))
      .then(data => {
        if (cancelled) return
        if (data.error) throw new Error(data.error)
        setProfile(data)
      })
      .catch(e => {
        if (!cancelled) setError(e?.message || 'Failed to load profile')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [playerDocId])

  const summaryStats = useMemo(
    () => [
      {
        title: 'Status',
        value: profile?.status ? String(profile.status).toUpperCase() : 'APPROVED',
        avatarIcon: 'ri-shield-check-line',
        avatarColor: getStatusColor(profile?.status || 'approved'),
        change: 'positive',
        changeNumber: '0',
        subTitle: 'Registration state'
      },
      {
        title: 'Position',
        value: profile?.position || '-',
        avatarIcon: 'ri-football-line',
        avatarColor: 'primary',
        change: 'positive',
        changeNumber: '0',
        subTitle: 'Primary role'
      },
      {
        title: 'Jersey',
        value: profile?.jerseyNo ? `#${profile.jerseyNo}` : '-',
        avatarIcon: 'ri-t-shirt-line',
        avatarColor: 'info',
        change: 'positive',
        changeNumber: '0',
        subTitle: 'Squad number'
      },
      {
        title: 'Member Since',
        value: profile?.createdAt ? formatDateLabel(profile.createdAt) : '-',
        avatarIcon: 'ri-calendar-check-line',
        avatarColor: 'success',
        change: 'positive',
        changeNumber: '0',
        subTitle: 'Profile created'
      }
    ],
    [profile]
  )

  return (
    <Box sx={{ p: { xs: 3, sm: 4 } }}>
      <PlayerHero
        title='Player profile'
        description='A cleaner registration and identity view with the same dashboard polish used by federation admin screens.'
        image='/images/illustrations/football-player.svg'
        badge={<Chip size='small' color='primary' variant='tonal' label='Verified Player Record' sx={{ mb: 2 }} />}
        actions={[
          <Button key='dashboard' variant='contained' href='/player' startIcon={<i className='ri-home-5-line' />}>
            Dashboard
          </Button>,
          <Button key='performance' variant='outlined' href='/player/performance' startIcon={<i className='ri-line-chart-line' />}>
            Performance
          </Button>
        ]}
      />

      {!playerDocId && !loading ? (
        <Alert severity='warning' sx={{ mt: 3 }}>
          No club player profile is linked to this account yet. Ask your club admin to connect this email to your player record.
        </Alert>
      ) : null}

      {error ? (
        <Alert severity='error' sx={{ mt: 3 }}>
          {error}
        </Alert>
      ) : null}

      <Box sx={{ mt: 4 }}>
        <SectionTitle title='Profile overview' subtitle='Key registration and squad details in the federation dashboard card style.' />
        {loading ? (
          <Grid container spacing={3}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6, xl: 3 }}>
                <Skeleton variant='rectangular' height={110} sx={{ borderRadius: 3 }} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={3}>
            {summaryStats.map((item, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6, xl: 3 }}>
                <HorizontalWithSubtitle {...item} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <Box sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 4 }}>
            {loading ? (
              <Skeleton variant='rectangular' height={220} sx={{ borderRadius: 3 }} />
            ) : (
              <PlayerIdentityCard
                profile={profile}
                displayName={displayName}
                chipLabel={profile?.status || 'approved'}
                chipColor={getStatusColor(profile?.status || 'approved')}
                subtitle={`${profile?.position || 'Player'}${profile?.jerseyNo ? ` | #${profile.jerseyNo}` : ''}${profile?.clubId ? ` | ${profile.clubId}` : ''}`}
                image='/images/illustrations/sports-core.svg'
              />
            )}
          </Grid>

          <Grid size={{ xs: 12, lg: 8 }}>
            <Card sx={{ height: '100%' }}>
              <CardHeader title='Registration summary' subheader='Live profile details pulled from your linked club player record.' />
              <CardContent sx={{ pt: 0 }}>
                {loading ? (
                  <Skeleton variant='rectangular' height={160} sx={{ borderRadius: 2 }} />
                ) : (
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <DetailItem label='Player ID' value={profile?.playerId || '-'} icon='ri-fingerprint-line' />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <DetailItem label='Club ID' value={profile?.clubId || '-'} icon='ri-building-line' />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <DetailItem label='Commentary name' value={profile?.commentaryName || '-'} icon='ri-mic-line' />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <DetailItem
                        label='Registration status'
                        value={<Chip size='small' label={profile?.status || 'approved'} color={getStatusColor(profile?.status || 'approved')} variant='tonal' />}
                        icon='ri-shield-check-line'
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <DetailItem label='Created' value={formatDateLabel(profile?.createdAt)} icon='ri-calendar-line' />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <DetailItem label='Last updated' value={formatDateLabel(profile?.updatedAt)} icon='ri-refresh-line' />
                    </Grid>
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mt: 4 }}>
        <SectionTitle title='Profile details' subtitle='Personal information and club registration data presented in a cleaner card layout.' />
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Card sx={{ height: '100%' }}>
              <CardHeader title='Personal details' subheader='Identity and residency information.' />
              <CardContent sx={{ pt: 0 }}>
                {loading ? (
                  <Grid container spacing={2}>
                    {Array.from({ length: 6 }).map((_, index) => (
                      <Grid key={index} size={{ xs: 12 }}>
                        <Skeleton variant='rectangular' height={72} sx={{ borderRadius: 2 }} />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                      <DetailItem label='Full name' value={displayName} icon='ri-user-line' />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <DetailItem label='Date of birth' value={formatDateLabel(profile?.dateOfBirth)} icon='ri-cake-2-line' />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <DetailItem label='Email' value={user?.email || '-'} icon='ri-mail-line' />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <DetailItem label='NIC / passport' value={profile?.nicOrPassport || '-'} icon='ri-id-card-line' />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <DetailItem label='Resident status' value={profile?.residentStatus || '-'} icon='ri-home-heart-line' />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <DetailItem label='Visa number' value={profile?.visaNo || '-'} icon='ri-passport-line' />
                    </Grid>
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <Card sx={{ height: '100%' }}>
              <CardHeader title='Squad details' subheader='Club assignment and on-field role information.' />
              <CardContent sx={{ pt: 0 }}>
                {loading ? (
                  <Grid container spacing={2}>
                    {Array.from({ length: 6 }).map((_, index) => (
                      <Grid key={index} size={{ xs: 12 }}>
                        <Skeleton variant='rectangular' height={72} sx={{ borderRadius: 2 }} />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <DetailItem label='Club ID' value={profile?.clubId || '-'} icon='ri-building-2-line' />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <DetailItem label='Player ID' value={profile?.playerId || '-'} icon='ri-hashtag' />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <DetailItem label='Position' value={profile?.position || '-'} icon='ri-football-line' />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <DetailItem label='Jersey number' value={profile?.jerseyNo ? `#${profile.jerseyNo}` : '-'} icon='ri-t-shirt-air-line' />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <DetailItem
                        label='Registration status'
                        value={<Chip size='small' label={profile?.status || 'approved'} color={getStatusColor(profile?.status || 'approved')} variant='tonal' />}
                        icon='ri-award-line'
                      />
                    </Grid>
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default PlayerProfile
