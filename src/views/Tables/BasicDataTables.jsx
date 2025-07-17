'use client'

import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'

import styles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper()

export default function BasicDataTables({ leads }) {
  const data = leads ?? []

  const columns = [
    columnHelper.accessor('leadId', {
      header: 'Reference ID',
      cell: info => info.getValue()
    }),

    columnHelper.accessor(row => row.contacts?.[0]?.name ?? 'N/A', {
      id: 'fullName',
      header: 'Name',
      cell: info => info.getValue()
    }),

    columnHelper.accessor(row => row.companyDetails?.address ?? 'N/A', {
      id: 'address',
      header: 'Property Address',
      cell: info => info.getValue()
    }),

    columnHelper.accessor('source', {
      header: 'Source',
      cell: info => info.getValue()
    }),

    columnHelper.accessor(row => row.dates?.createdAt ?? 'N/A', {
      id: 'created',
      header: 'Created',
      cell: info => {
        const date = info.getValue()

        return date !== 'N/A'
          ? new Date(date).toLocaleString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          : 'N/A'
      }
    }),

    columnHelper.accessor(row => row.dates?.updatedAt ?? 'N/A', {
      id: 'updated',
      header: 'Updated',
      cell: info => {
        const date = info.getValue()

        return date !== 'N/A'
          ? new Date(date).toLocaleString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          : 'N/A'
      }
    }),

    columnHelper.accessor(row => row.assignedPeople?.[0]?.role ?? 'Unassigned', {
      id: 'assignee',
      header: 'Assignee',
      cell: info => info.getValue()
    })
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  return (
    <Card>
      <CardHeader title='Basic Table' />
      <div className='overflow-x-auto'>
        <table className={styles.table}>
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
