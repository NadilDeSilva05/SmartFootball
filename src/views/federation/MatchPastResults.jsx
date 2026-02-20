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
import HorizontalWithSubtitle from '@components/card-statistics/HorizontalWithSubtitle'
import ResultDetailDrawer from '@views/federation/components/match/ResultDetailDrawer'
import AddResultDialog from '@views/federation/components/match/AddResultDialog'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const RESULTS_DATA = [
  {
    id: '1',
    homeTeam: 'City FC',
    awayTeam: 'United SC',
    homeScore: 2,
    awayScore: 1,
    date: '2025-02-01',
    venue: 'National Stadium',
    leagueName: 'Premier League',
    referee: 'John Silva',
    attendance: 12500,
    halfTimeScore: '1-0',
    goals: [
      { minute: 23, scorer: 'A. Smith', team: 'home', type: 'open_play' },
      { minute: 67, scorer: 'B. Jones', team: 'home', type: 'penalty' },
      { minute: 89, scorer: 'C. Brown', team: 'away', type: 'open_play' }
    ],
    cards: [
      { minute: 45, player: 'D. Lee', team: 'away', type: 'yellow' },
      { minute: 78, player: 'E. Wilson', team: 'home', type: 'yellow' }
    ]
  },
  {
    id: '2',
    homeTeam: 'Rovers FC',
    awayTeam: 'Athletic Club',
    homeScore: 0,
    awayScore: 0,
    date: '2025-01-28',
    venue: 'City Arena',
    leagueName: 'Premier League',
    referee: 'Maria Perera',
    attendance: 8200,
    halfTimeScore: '0-0',
    goals: [],
    cards: [
      { minute: 34, player: 'F. Davis', team: 'home', type: 'yellow' },
      { minute: 56, player: 'G. Taylor', team: 'away', type: 'yellow' }
    ]
  },
  {
    id: '3',
    homeTeam: 'Stars FC',
    awayTeam: 'Dynamo FC',
    homeScore: 3,
    awayScore: 2,
    date: '2025-01-25',
    venue: 'Regional Ground',
    leagueName: 'Division One',
    referee: 'David Fernando',
    attendance: 5400,
    halfTimeScore: '2-1',
    goals: [
      { minute: 12, scorer: 'H. Martinez', team: 'home', type: 'open_play' },
      { minute: 28, scorer: 'I. Garcia', team: 'away', type: 'free_kick' },
      { minute: 41, scorer: 'J. Lopez', team: 'home', type: 'open_play' },
      { minute: 65, scorer: 'K. Hernandez', team: 'away', type: 'open_play' },
      { minute: 82, scorer: 'L. Rodriguez', team: 'home', type: 'penalty' }
    ],
    cards: []
  },
  {
    id: '4',
    homeTeam: 'United SC',
    awayTeam: 'City FC',
    homeScore: 1,
    awayScore: 2,
    date: '2025-01-20',
    venue: 'National Stadium',
    leagueName: 'Premier League',
    referee: 'Sarah Gomes',
    attendance: 11200,
    halfTimeScore: '0-1',
    goals: [
      { minute: 19, scorer: 'M. Clark', team: 'away', type: 'open_play' },
      { minute: 52, scorer: 'N. White', team: 'home', type: 'penalty' },
      { minute: 76, scorer: 'O. Green', team: 'away', type: 'open_play' }
    ],
    cards: [{ minute: 88, player: 'P. Hall', team: 'home', type: 'red' }]
  }
]

const ResultCardsData = [
  { title: 'Total Matches', value: '48', avatarIcon: 'ri-calendar-check-line', avatarColor: 'primary', change: 'positive', changeNumber: '12', subTitle: 'Completed' },
  { title: 'Home Wins', value: '22', avatarIcon: 'ri-home-heart-line', avatarColor: 'success', change: 'positive', changeNumber: '46%', subTitle: 'Home victories' },
  { title: 'Draws', value: '10', avatarIcon: 'ri-equal-line', avatarColor: 'info', change: 'neutral', changeNumber: '21%', subTitle: 'Draws' },
  { title: 'Away Wins', value: '16', avatarIcon: 'ri-roadster-line', avatarColor: 'secondary', change: 'positive', changeNumber: '33%', subTitle: 'Away victories' }
]

const columnHelper = createColumnHelper()

const MatchPastResults = () => {
  const [data, setData] = useState(RESULTS_DATA)
  const [globalFilter, setGlobalFilter] = useState('')
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false)
  const [addResultDrawerOpen, setAddResultDrawerOpen] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState(null)
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'))

  const handleAddResult = newResult => {
    const id = String(Math.max(0, ...data.map(r => parseInt(r.id, 10))) + 1)
    setData(prev => [{ ...newResult, id }, ...prev])
    setAddResultDrawerOpen(false)
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('date', {
        header: 'Date',
        cell: ({ row }) => <Typography variant='body2'>{row.original.date}</Typography>
      }),
      columnHelper.accessor(row => `${row.homeTeam} vs ${row.awayTeam}`, {
        id: 'match',
        header: 'Match',
        cell: ({ row }) => (
          <Box>
            <Typography className='font-medium' color='text.primary'>
              {row.original.homeTeam} vs {row.original.awayTeam}
            </Typography>
            <Typography variant='caption' color='text.secondary'>{row.original.venue} • {row.original.leagueName}</Typography>
          </Box>
        )
      }),
      columnHelper.accessor(row => `${row.homeScore}-${row.awayScore}`, {
        id: 'score',
        header: 'Score',
        cell: ({ row }) => {
          const m = row.original
          const isDraw = m.homeScore === m.awayScore
          const homeWon = m.homeScore > m.awayScore
          return (
            <Chip
              variant='tonal'
              size='small'
              label={`${m.homeScore} – ${m.awayScore}`}
              color={isDraw ? 'info' : homeWon ? 'success' : 'secondary'}
              sx={{ fontWeight: 600, minWidth: 64 }}
            />
          )
        }
      }),
      columnHelper.accessor('referee', {
        header: 'Referee',
        cell: ({ row }) => <Typography variant='body2'>{row.original.referee}</Typography>
      }),
      columnHelper.accessor('action', {
        header: '',
        cell: ({ row }) => (
          <Button
            size='small'
            variant='outlined'
            onClick={() => {
              setSelectedMatch(row.original)
              setDetailDrawerOpen(true)
            }}
          >
            View
          </Button>
        ),
        enableSorting: false
      })
    ],
    []
  )

  const table = useReactTable({
    data,
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
    <>
      <div className='space-y-6'>
        <div>
          <Typography variant='h4' className='font-semibold mb-1'>
            Past Match Results
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            View completed match results and statistics.
          </Typography>
        </div>

        <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
          {ResultCardsData.map((item, i) => (
            <HorizontalWithSubtitle key={i} {...item} />
          ))}
        </div>

        <Card>
          <CardHeader
            title='Results'
            action={
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, width: { xs: '100%', sm: 'auto' }, minWidth: { xs: 0, sm: 200 } }}>
                <TextField
                  size='small'
                  placeholder='Search matches...'
                  value={globalFilter ?? ''}
                  onChange={e => setGlobalFilter(e.target.value)}
                  sx={{ minWidth: { xs: 0, sm: 220 }, flex: { xs: '1 1 auto', sm: '0 0 auto' } }}
                />
                <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={() => setAddResultDrawerOpen(true)} sx={{ flexShrink: 0 }}>
                  Add Result
                </Button>
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
                <Typography color='text.secondary' className='text-center py-8'>No results found</Typography>
              ) : (
                table.getRowModel().rows.map(row => {
                  const m = row.original
                  const isDraw = m.homeScore === m.awayScore
                  const homeWon = m.homeScore > m.awayScore
                  return (
                    <Card
                      key={m.id}
                      elevation={0}
                      variant='outlined'
                      sx={{
                        borderRadius: 2,
                        transition: 'box-shadow 0.2s ease',
                        '&:hover': { boxShadow: 1 }
                      }}
                    >
                      <CardContent>
                        <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>
                          {m.date} • {m.leagueName}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                          <Typography variant='body2' fontWeight={600} color='text.primary' sx={{ flex: '1 1 0', minWidth: 0 }}>
                            {m.homeTeam}
                          </Typography>
                          <Chip
                            variant='tonal'
                            size='small'
                            label={`${m.homeScore} – ${m.awayScore}`}
                            color={isDraw ? 'info' : homeWon ? 'success' : 'secondary'}
                            sx={{ fontWeight: 600, flexShrink: 0 }}
                          />
                          <Typography variant='body2' fontWeight={600} color='text.primary' sx={{ flex: '1 1 0', minWidth: 0, textAlign: 'right' }}>
                            {m.awayTeam}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <i className='ri-map-pin-line text-base text-textSecondary' />
                          <Typography variant='body2' color='text.secondary'>{m.venue}</Typography>
                        </Box>
                        <Button
                          size='small'
                          variant='outlined'
                          fullWidth
                          onClick={() => { setSelectedMatch(m); setDetailDrawerOpen(true) }}
                        >
                          View details
                        </Button>
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
                        No results found
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

      <ResultDetailDrawer
        open={detailDrawerOpen}
        onClose={() => { setDetailDrawerOpen(false); setSelectedMatch(null) }}
        match={selectedMatch}
      />
      <AddResultDialog open={addResultDrawerOpen} onClose={() => setAddResultDrawerOpen(false)} onSave={handleAddResult} />
    </>
  )
}

export default MatchPastResults
