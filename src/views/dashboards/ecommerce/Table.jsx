'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'

// Third-party Imports
import classnames from 'classnames'
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'

// Components Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Util Imports
import { getInitials } from '@/utils/getInitials'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Column Definitions
const columnHelper = createColumnHelper()

// Vars
const invoiceStatusObj = {
  Sent: { color: 'secondary', icon: 'ri-send-plane-2-line' },
  Paid: { color: 'success', icon: 'ri-check-line' },
  Draft: { color: 'primary', icon: 'ri-mail-line' },
  'Partial Payment': { color: 'warning', icon: 'ri-pie-chart-2-line' },
  'Past Due': { color: 'error', icon: 'ri-information-line' },
  Downloaded: { color: 'info', icon: 'ri-arrow-down-line' }
}

const columns = [
  columnHelper.accessor('id', {
    header: '#ID',
    cell: ({ row }) => (
      <Typography
        component={Link}
        href={`/apps/invoice/preview/${row.original.id}`}
        color='primary'
      >{`${row.original.id}`}</Typography>
    )
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status
      const statusObj = invoiceStatusObj[status]

      if (!statusObj) {
        return <Typography color='text.secondary'>Unknown</Typography>
      }

      return (
        <Tooltip
          title={
            <div>
              <Typography variant='body2' component='span' className='text-inherit'>
                {status}
              </Typography>
              <br />
              <Typography variant='body2' component='span' className='text-inherit'>
                Balance:
              </Typography>{' '}
              {row.original.balance}
              <br />
              <Typography variant='body2' component='span' className='text-inherit'>
                Due Date:
              </Typography>{' '}
              {row.original.dueDate}
            </div>
          }
        >
          <CustomAvatar skin='light' color={statusObj.color} size={28}>
            <i className={classnames('text-base', statusObj.icon)} />
          </CustomAvatar>
        </Tooltip>
      )
    }
  }),
  columnHelper.accessor('name', {
    header: 'Client',
    cell: ({ row }) => (
      <div className='flex items-center gap-3'>
        {getAvatar({ avatar: row.original.avatar, name: row.original.name })}
        <div className='flex flex-col'>
          <Typography className='font-medium' color='text.primary'>
            {row.original.name}
          </Typography>
          <Typography variant='body2'>{row.original.email}</Typography>
        </div>
      </div>
    )
  }),
  columnHelper.accessor('amount', {
    header: 'Total',
    cell: ({ row }) => <Typography>{row.original.amount}</Typography>
  }),
  columnHelper.accessor('balance', {
    header: 'Balance',
    cell: ({ row }) => {
      return row.original.balance === '$0.00' || row.original.balance === 0 ? (
        <Chip label='Paid' color='success' size='small' variant='tonal' />
      ) : (
        <Typography color='text.primary'>{row.original.balance}</Typography>
      )
    }
  })
]

const getAvatar = params => {
  const { avatar, name } = params

  if (avatar) {
    return <CustomAvatar src={avatar} skin='light' size={34} />
  } else {
    return (
      <CustomAvatar skin='light' size={34}>
        {getInitials(name)}
      </CustomAvatar>
    )
  }
}

const DashboardTables = ({ invoiceData }) => {
  // States
  const [data, setData] = useState([...invoiceData])

  // Hooks
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    filterFns: {
      fuzzy: () => false
    }
  })

  return (
    <Card>
      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export default DashboardTables
