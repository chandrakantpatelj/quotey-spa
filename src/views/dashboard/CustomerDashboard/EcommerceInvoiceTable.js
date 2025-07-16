// ** React Imports
import { useState } from 'react'

// ** Next Import
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import MenuItem from '@mui/material/MenuItem'
import { styled } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { DataGrid } from '@mui/x-data-grid'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Store & Actions Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Custom Component Imports
import CustomAvatar from 'src/@core/components/mui/avatar'
import OptionsMenu from 'src/@core/components/option-menu'
import CustomTextField from 'src/@core/components/mui/text-field'
import { DateFunction } from 'src/common-functions/utils/UtilityFunctions'

const LinkStyled = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.primary.main,
  fontSize: theme.typography.body1.fontSize
}))

// ** Vars
const statusObj = {
  DRAFT: { color: 'secondary', icon: 'tabler:circle-check' },
  ISSUED: { color: 'success', icon: 'tabler:circle-half-2' }
  // Draft: { color: 'primary', icon: 'tabler:device-floppy' },
  // 'Partial Payment': { color: 'warning', icon: 'tabler:chart-pie' },
  // 'Past Due': { color: 'error', icon: 'tabler:alert-circle' },
  // Downloaded: { color: 'info', icon: 'tabler:arrow-down-circle' }
}

const defaultColumns = [
  {
    flex: 0.2,
    field: 'invoiceId',
    minWidth: 90,
    headerName: '# ID',
    renderCell: ({ row }) => (
      <LinkStyled href={`/apps/invoice/preview/${row.invoiceId}`}>{`#${row.invoiceNo}`}</LinkStyled>
    )
  },
  {
    flex: 0.15,
    minWidth: 80,
    field: 'status',
    renderHeader: () => <Icon icon='tabler:trending-up' fontSize={20} />,
    renderCell: ({ row }) => {
      const { dueDate, balance, status } = row
      const color = statusObj[status] ? statusObj[status].color : 'primary'

      return (
        <Tooltip
          title={
            <>
              <Typography variant='caption' sx={{ color: 'common.white', fontWeight: 600 }}>
                {status}
              </Typography>
              <br />
              <Typography variant='caption' sx={{ color: 'common.white', fontWeight: 600 }}>
                Balance:
              </Typography>{' '}
              {balance}
              <br />
              <Typography variant='caption' sx={{ color: 'common.white', fontWeight: 600 }}>
                Due Date:
              </Typography>{' '}
              {dueDate}
            </>
          }
        >
          <CustomAvatar skin='light' color={color} sx={{ width: 30, height: 30 }}>
            <Icon icon={statusObj[status].icon} fontSize='1rem' />
          </CustomAvatar>
        </Tooltip>
      )
    }
  },
  {
    flex: 0.25,
    minWidth: 90,
    field: 'totalAmount',
    headerName: 'Total',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>${row.totalAmount || 0}</Typography>
  },
  {
    flex: 0.3,
    minWidth: 125,
    field: 'invoiceDate',
    headerName: 'Issued Date',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{DateFunction(row.invoiceDate)}</Typography>
  }
]

const EcommerceInvoiceTable = () => {
  // ** State
  const [value, setValue] = useState('')
  const [statusValue, setStatusValue] = useState('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 6 })
  const salesInvoices = useSelector(state => state.salesInvoices?.data || [])

  // ** Hooks

  const columns = [
    ...defaultColumns,
    {
      flex: 0.1,
      minWidth: 130,
      sortable: false,
      field: 'actions',
      headerName: 'Actions',
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title='Delete Invoice'>
            <IconButton size='small'>
              <Icon icon='tabler:trash' />
            </IconButton>
          </Tooltip>
          <Tooltip title='View'>
            <IconButton size='small' component={Link} href={`/apps/invoice/preview/${row.id}`}>
              <Icon icon='tabler:eye' />
            </IconButton>
          </Tooltip>
          <OptionsMenu
            iconButtonProps={{ size: 'small' }}
            menuProps={{ sx: { '& .MuiMenuItem-root svg': { mr: 2 } } }}
            options={[
              {
                text: 'Download',
                icon: <Icon icon='tabler:download' fontSize='1.25rem' />
              },
              {
                text: 'Edit',
                href: `/apps/invoice/edit/${row.id}`,
                icon: <Icon icon='tabler:pencil' fontSize='1.25rem' />
              },
              {
                text: 'Duplicate',
                icon: <Icon icon='tabler:copy' fontSize='1.25rem' />
              }
            ]}
          />
        </Box>
      )
    }
  ]

  return (
    <Card>
      <CardContent
        sx={{ gap: 4, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Button component={Link} variant='contained' href='/apps/invoice/add' startIcon={<Icon icon='tabler:plus' />}>
          Create Invoice
        </Button>
        <Box sx={{ gap: 4, display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
          <CustomTextField value={value} placeholder='Search Invoice' onChange={e => setValue(e.target.value)} />
          <CustomTextField
            select
            sx={{ pr: 4, '& .MuiFilledInput-input.MuiSelect-select': { minWidth: '8rem !important' } }}
            SelectProps={{
              displayEmpty: true,
              value: statusValue,
              onChange: e => setStatusValue(e.target.value)
            }}
          >
            <MenuItem value=''>Select Status</MenuItem>
            <MenuItem value='downloaded'>Downloaded</MenuItem>
            <MenuItem value='draft'>Draft</MenuItem>
            <MenuItem value='paid'>Paid</MenuItem>
            <MenuItem value='partial payment'>Partial Payment</MenuItem>
            <MenuItem value='past due'>Past Due</MenuItem>
            <MenuItem value='sent'>Sent</MenuItem>
          </CustomTextField>
        </Box>
      </CardContent>
      <DataGrid
        autoHeight
        rowHeight={54}
        rows={salesInvoices}
        getRowId={row => row.invoiceId}
        columns={columns}
        disableRowSelectionOnClick
        paginationModel={paginationModel}
        pageSizeOptions={[6, 10, 25, 50]}
        onPaginationModelChange={setPaginationModel}
      />
    </Card>
  )
}

export default EcommerceInvoiceTable
