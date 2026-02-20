'use client'

// React Imports
import { useState, useMemo } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import TablePagination from '@mui/material/TablePagination'
import useMediaQuery from '@mui/material/useMediaQuery'

// Third-party Imports
import classnames from 'classnames'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'

// Component Imports
import OptionMenu from '@core/components/option-menu'
import HorizontalWithSubtitle from '@components/card-statistics/HorizontalWithSubtitle'
import AssignRefereesDrawer from '@views/federation/components/match/AssignRefereesDrawer'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const MATCHES_DATA = [
  { id: '1', homeTeamName: 'City FC', awayTeamName: 'United SC', date: '2025-02-15', time: '15:00', venue: 'National Stadium', leagueName: 'Premier League' },
  { id: '2', homeTeamName: 'Rovers FC', awayTeamName: 'Athletic Club', date: '2025-02-16', time: '17:00', venue: 'City Arena', leagueName: 'Premier League' },
  { id: '3', homeTeamName: 'Stars FC', awayTeamName: 'Dynamo FC', date: '2025-02-18', time: '14:00', venue: 'Regional Ground', leagueName: 'Division One' },
  { id: '4', homeTeamName: 'City FC', awayTeamName: 'Rovers FC', date: '2025-02-20', time: '16:00', venue: 'National Stadium', leagueName: 'Premier League' }
]

const AssignCardsData = [
  { title: 'Total Matches', value: '24', avatarIcon: 'ri-calendar-line', avatarColor: 'primary', change: 'positive', changeNumber: '5', subTitle: 'Scheduled matches' },
  { title: 'Pending', value: '8', avatarIcon: 'ri-time-line', avatarColor: 'warning', change: 'negative', changeNumber: '2', subTitle: 'Awaiting referees' },
  { title: 'Assigned', value: '16', avatarIcon: 'ri-checkbox-circle-line', avatarColor: 'success', change: 'positive', changeNumber: '5', subTitle: 'Referees assigned' }
]

const columnHelper = createColumnHelper()

const MatchAssignReferees = () => {
  const [matches] = useState(MATCHES_DATA)
  const [assignments, setAssignments] = useState({
    '1': { mainReferee: '1', assistant1: '2', assistant2: '3', fourthOfficial: '4' },
    '2': { mainReferee: '2', assistant1: '1', assistant2: '4', fourthOfficial: '3' }
  })
  const [globalFilter, setGlobalFilter] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState(null)
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'))

  const getRefereeName = id => REFEREES_OPTIONS.find(r => r.id === id)?.fullName || '-'
  const isAssigned = matchId => !!assignments[matchId]?.mainReferee

  const dataWithAssignments = useMemo(() => matches.map(m => ({
    ...m,
    mainRefereeName: getRefereeName(assignments[m.id]?.mainReferee),
    assistant1Name: getRefereeName(assignments[m.id]?.assistant1),
    assistant2Name: getRefereeName(assignments[m.id]?.assistant2),
    fourthOfficialName: getRefereeName(assignments[m.id]?.fourthOfficial),
    assigned: isAssigned(m.id)
  })), [matches, assignments])

  const columns = useMemo(
    () => [
      columnHelper.accessor(row => `${row.homeTeamName} vs ${row.awayTeamName}`, {
        id: 'match',
        header: 'Match',
        cell: ({ row }) => (
          <Box>
            <Typography className='font-medium' color='text.primary'>
              {row.original.homeTeamName} vs {row.original.awayTeamName}
            </Typography>
            <Typography variant='caption' color='text.secondary'>{row.original.leagueName}</Typography>
          </Box>
        )
      }),
      columnHelper.accessor('date', {
        header: 'Date & Time',
        cell: ({ row }) => (
          <Typography variant='body2'>{row.original.date} {row.original.time}</Typography>
        )
      }),
      columnHelper.accessor('venue', {
        header: 'Venue',
        cell: ({ row }) => <Typography variant='body2'>{row.original.venue}</Typography>
      }),
      columnHelper.accessor('mainRefereeName', {
        header: 'Main Referee',
        cell: ({ row }) => <Typography variant='body2'>{row.original.mainRefereeName}</Typography>
      }),
      columnHelper.accessor('assistant1Name', {
        header: 'AR 1',
        cell: ({ row }) => <Typography variant='body2'>{row.original.assistant1Name}</Typography>
      }),
      columnHelper.accessor('assistant2Name', {
        header: 'AR 2',
        cell: ({ row }) => <Typography variant='body2'>{row.original.assistant2Name}</Typography>
      }),
      columnHelper.accessor('fourthOfficialName', {
        header: 'Fourth Official',
        cell: ({ row }) => <Typography variant='body2'>{row.original.fourthOfficialName}</Typography>
      }),
      columnHelper.accessor('assigned', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            variant='tonal'
            size='small'
            label={row.original.assigned ? 'Assigned' : 'Pending'}
            color={row.original.assigned ? 'success' : 'warning'}
          />
        )
      }),
      columnHelper.accessor('action', {
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center gap-1'>
            <IconButton
              size='small'
              onClick={() => {
                setSelectedMatch(row.original)
                setDrawerOpen(true)
              }}
            >
              <i className='ri-edit-box-line text-[22px] text-textSecondary' />
            </IconButton>
            <OptionMenu
              iconClassName='text-[22px] text-textSecondary'
              options={[
                {
                  text: row.original.assigned ? 'Edit Assignment' : 'Assign Referees',
                  icon: 'ri-user-add-line text-[22px]',
                  menuItemProps: {
                    className: 'flex items-center gap-2 text-textSecondary',
                    onClick: () => {
                      setSelectedMatch(row.original)
                      setDrawerOpen(true)
                    }
                  }
                }
              ]}
            />
          </div>
        ),
        enableSorting: false
      })
    ],
    [assignments]
  )

  const table = useReactTable({
    data: dataWithAssignments,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } }
  })

  const handleSaveAssignment = formData => {
    if (!selectedMatch) return
    setAssignments(prev => ({
      ...prev,
      [selectedMatch.id]: {
        mainReferee: formData.mainReferee,
        assistant1: formData.assistant1,
        assistant2: formData.assistant2,
        fourthOfficial: formData.fourthOfficial
      }
    }))
    setDrawerOpen(false)
    setSelectedMatch(null)
  }

  return (
    <>
      <div className='space-y-6'>
        <div>
          <Typography variant='h4' className='font-semibold mb-1'>
            Assign Referees to Matches
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Assign main referee, assistant referees, and fourth official to scheduled matches.
          </Typography>
        </div>

        <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
          {AssignCardsData.map((item, i) => (
            <HorizontalWithSubtitle key={i} {...item} />
          ))}
        </div>

        <Card>
          <CardHeader
            title='Match Referee Assignments'
            action={
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'stretch', sm: 'center' },
                  gap: 2,
                  width: { xs: '100%', sm: 'auto' },
                  minWidth: { xs: 0, sm: 200 }
                }}
              >
                <TextField
                  size='small'
                  placeholder='Search matches...'
                  value={globalFilter ?? ''}
                  onChange={e => setGlobalFilter(e.target.value)}
                  sx={{
                    minWidth: { xs: 0, sm: 200 },
                    flex: { xs: '1 1 auto', sm: '0 0 auto' }
                  }}
                />
              </Box>
            }
            sx={{
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'center' },
              gap: 2,
              '& .MuiCardHeader-action': {
                margin: 0,
                alignSelf: { xs: 'stretch', sm: 'center' },
                width: { xs: '100%', sm: 'auto' }
              }
            }}
          />
          <Divider />
          {isMobile ? (
            <div className='p-4 flex flex-col gap-4'>
              {table.getFilteredRowModel().rows.length === 0 ? (
                <Typography color='text.secondary' className='text-center py-8'>No matches found</Typography>
              ) : (
                table.getRowModel().rows.map(row => {
                  const match = row.original
                  return (
                    <Card
                      key={match.id}
                      elevation={0}
                      variant='outlined'
                      sx={{
                        borderRadius: 2,
                        transition: 'box-shadow 0.2s ease',
                        '&:hover': { boxShadow: 1 }
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 2 }}>
                          <Box>
                            <Typography variant='subtitle1' fontWeight={600} color='text.primary'>
                              {match.homeTeamName} vs {match.awayTeamName}
                            </Typography>
                            <Typography variant='caption' color='text.secondary'>
                              {match.leagueName} • {match.date} {match.time}
                            </Typography>
                          </Box>
                          <Chip
                            label={match.assigned ? 'Assigned' : 'Pending'}
                            color={match.assigned ? 'success' : 'warning'}
                            size='small'
                            variant='tonal'
                          />
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <i className='ri-map-pin-line text-base text-textSecondary' />
                            <Typography variant='body2' color='text.secondary'>{match.venue}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <i className='ri-user-star-line text-base text-textSecondary' />
                            <Typography variant='body2' color='text.secondary'>Main: {match.mainRefereeName}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <i className='ri-team-line text-base text-textSecondary' />
                            <Typography variant='body2' color='text.secondary'>AR1: {match.assistant1Name} • AR2: {match.assistant2Name} • 4th: {match.fourthOfficialName}</Typography>
                          </Box>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Button
                            size='small'
                            variant='outlined'
                            startIcon={<i className='ri-user-add-line' />}
                            onClick={() => { setSelectedMatch(match); setDrawerOpen(true) }}
                          >
                            {match.assigned ? 'Edit' : 'Assign'} Referees
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className={tableStyles.table}>
                <thead>
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <th key={header.id}>
                          {header.isPlaceholder ? null : (
                            <div
                              className={classnames({ 'cursor-pointer select-none': header.column.getCanSort() })}
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </div>
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getFilteredRowModel().rows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length} className='text-center'>
                        No matches found
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map(row => (
                      <tr key={row.id}>
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component='div'
            count={table.getFilteredRowModel().rows.length}
            rowsPerPage={table.getState().pagination.pageSize}
            page={table.getState().pagination.pageIndex}
            onPageChange={(_, page) => table.setPageIndex(page)}
            onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
          />
        </Card>
      </div>

      <AssignRefereesDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setSelectedMatch(null) }}
        match={selectedMatch}
        assignments={assignments}
        onSave={handleSaveAssignment}
      />
    </>
  )
}

export default MatchAssignReferees
