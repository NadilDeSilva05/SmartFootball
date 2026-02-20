'use client'

// React Imports
import { useState, useMemo } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import TablePagination from '@mui/material/TablePagination'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
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
import HorizontalWithSubtitle from '@components/card-statistics/HorizontalWithSubtitle'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Current club (can come from auth/context later)
const MY_CLUB = 'City FC'

const MATCHES_DATA = [
  { id: '1', leagueName: 'Premier League', homeTeamName: 'City FC', awayTeamName: 'Rovers FC', venue: 'National Stadium', date: '2025-02-15', time: '15:00' },
  { id: '2', leagueName: 'Premier League', homeTeamName: 'Athletic Club', awayTeamName: 'Stars FC', venue: 'City Arena', date: '2025-02-16', time: '17:00' },
  { id: '3', leagueName: 'Division One', homeTeamName: 'United SC', awayTeamName: 'City FC', venue: 'Regional Ground', date: '2025-02-18', time: '14:00' },
  { id: '4', leagueName: 'Premier League', homeTeamName: 'Dynamo FC', awayTeamName: 'Rovers FC', venue: 'Stadium A', date: '2025-02-20', time: '16:00' },
  { id: '5', leagueName: 'Premier League', homeTeamName: 'City FC', awayTeamName: 'United SC', venue: 'National Stadium', date: '2025-02-22', time: '15:00' }
]

const isMyClubMatch = (homeTeamName, awayTeamName) => homeTeamName === MY_CLUB || awayTeamName === MY_CLUB

function getStatsForData(data) {
  const total = data.length
  const today = new Date().toISOString().slice(0, 10)
  const todayCount = data.filter(m => m.date === today).length
  const weekFromNow = new Date()
  weekFromNow.setDate(weekFromNow.getDate() + 7)
  const weekEnd = weekFromNow.toISOString().slice(0, 10)
  const thisWeekCount = data.filter(m => m.date >= today && m.date <= weekEnd).length
  return [
    { title: 'Scheduled', value: String(total), avatarIcon: 'ri-calendar-check-line', avatarColor: 'primary', change: 'positive', changeNumber: '0', subTitle: 'Upcoming matches' },
    { title: 'Today', value: String(todayCount), avatarIcon: 'ri-calendar-today-line', avatarColor: 'success', change: 'neutral', changeNumber: '0', subTitle: 'Matches today' },
    { title: 'This Week', value: String(thisWeekCount), avatarIcon: 'ri-calendar-week-line', avatarColor: 'info', change: 'positive', changeNumber: '0', subTitle: 'Next 7 days' },
    { title: 'Total', value: String(total), avatarIcon: 'ri-calendar-line', avatarColor: 'secondary', change: 'neutral', changeNumber: '0', subTitle: 'In this list' }
  ]
}

const columnHelper = createColumnHelper()

const ClubMatchUpcoming = () => {
  const [tabValue, setTabValue] = useState(0)
  const [globalFilter, setGlobalFilter] = useState('')
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'))

  const filteredByTab = useMemo(() => {
    return tabValue === 0
      ? MATCHES_DATA.filter(m => isMyClubMatch(m.homeTeamName, m.awayTeamName))
      : MATCHES_DATA.filter(m => !isMyClubMatch(m.homeTeamName, m.awayTeamName))
  }, [tabValue])

  const matchCardsData = useMemo(() => getStatsForData(filteredByTab), [filteredByTab])

  const columns = useMemo(
    () => [
      columnHelper.accessor('leagueName', {
        header: 'League',
        cell: ({ row }) => <Typography variant='body2'>{row.original.leagueName || '-'}</Typography>
      }),
      columnHelper.accessor('homeTeamName', {
        header: 'Home Team',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.homeTeamName}
          </Typography>
        )
      }),
      columnHelper.accessor('awayTeamName', {
        header: 'Away Team',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.awayTeamName}
          </Typography>
        )
      }),
      columnHelper.accessor('venue', {
        header: 'Venue',
        cell: ({ row }) => <Typography variant='body2'>{row.original.venue || '-'}</Typography>
      }),
      columnHelper.accessor('date', {
        header: 'Date & Time',
        cell: ({ row }) => (
          <Typography variant='body2'>
            {row.original.date} {row.original.time}
          </Typography>
        )
      })
    ],
    []
  )

  const table = useReactTable({
    data: filteredByTab,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } }
  })

  return (
    <div className='space-y-6'>
      <div>
        <Typography variant='h4' className='font-semibold mb-1'>
          Upcoming Matches
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          View scheduled fixtures. Matches involving <strong>{MY_CLUB}</strong> are in My Club matches.
        </Typography>
      </div>

      <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tab label='My Club matches' />
        <Tab label='Other team matches' />
      </Tabs>

      <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
        {matchCardsData.map((item, i) => (
          <HorizontalWithSubtitle key={i} {...item} />
        ))}
      </div>

      <Card>
        <CardHeader
          title='Matches'
          action={
            <TextField
              size='small'
              placeholder='Search matches...'
              value={globalFilter ?? ''}
              onChange={e => setGlobalFilter(e.target.value)}
              sx={{ minWidth: { xs: 0, sm: 200 }, flex: { xs: '1 1 auto', sm: '0 0 auto' } }}
            />
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
                      <Box sx={{ mb: 2 }}>
                        <Typography variant='subtitle1' fontWeight={600} color='text.primary'>
                          {match.homeTeamName} vs {match.awayTeamName}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {match.leagueName}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <i className='ri-map-pin-line text-base text-textSecondary' />
                          <Typography variant='body2' color='text.secondary'>{match.venue}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <i className='ri-calendar-line text-base text-textSecondary' />
                          <Typography variant='body2' color='text.secondary'>{match.date} {match.time}</Typography>
                        </Box>
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
  )
}

export default ClubMatchUpcoming
