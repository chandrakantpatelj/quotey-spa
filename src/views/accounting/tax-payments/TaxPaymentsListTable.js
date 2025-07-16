import Link from 'next/link'
// ** MUI Imports
import Box from '@mui/material/Box'
import { Grid, IconButton, MenuItem, Tooltip, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { useDispatch, useSelector } from 'react-redux'
import Icon from 'src/@core/components/icon'
import CustomNoRowsOverlay from 'src/common-components/CustomNoRowsOverlay'
import CommonStyledMenu from 'src/common-components/CommonStyledMenu'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import useIsDesktop from 'src/hooks/IsDesktop'
import {
  dataTextStyles,
  dataTitleStyles,
  DateFunction,
  findObjectByCurrencyId,
  formatDateString,
  hasPermission,
  lastMonthDate,
  NumberFormat,
  rowStatusChip
} from 'src/common-functions/utils/UtilityFunctions'
import { resettaxPayments, setSelectedTaxPayment } from 'src/store/apps/tax-payments'
import RefreshIcon from '@mui/icons-material/Refresh'
import { VIEW_TAX_PAYMENT } from 'src/common-functions/utils/Constants'
import MobileDataGrid from 'src/common-components/MobileDataGrid'
import Router from 'next/router'
export const MOBILE_COLUMNS = {
  taxAuthorityId: false,
  description: false,
  status: false
}
export const ALL_COLUMNS = {}

const TaxPaymentsListTable = ({ taxPaymentsData }) => {
  const dispatch = useDispatch()
  const isDesktop = useIsDesktop()
  const userProfile = useSelector(state => state.userProfile)
  const { taxPayments = [], taxAuthorities = [], currencies = [] } = taxPaymentsData || {}
  const router = Router
  const [anchorElMap, setAnchorElMap] = useState({})

  const handleClick = (event, row) => {
    dispatch(setSelectedTaxPayment(row))
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.paymentId] = event.currentTarget
    setAnchorElMap(updatedAnchorElMap)
  }

  const handleClose = row => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.paymentId] = null
    setAnchorElMap(updatedAnchorElMap)
  }

  const [columnVisible, setColumnVisible] = useState(ALL_COLUMNS)
  useEffect(() => {
    const newColumns = isDesktop ? ALL_COLUMNS : MOBILE_COLUMNS
    setColumnVisible(newColumns)
  }, [isDesktop])

  const mobileColumns = [
    {
      field: 'paymentInfo',
      headerName: '',
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => {
        return (
          <Box sx={{ width: '100%', p: 2 }}>
            <Grid container spacing={3} sx={{ alignItems: 'center', flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
              <Grid item xs={11}>
                <Grid container spacing={3} sx={{ alignItems: 'center', flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
                  <Grid item xs={12} sm={4} md={2} lg={2} xl={2}>
                    <Typography sx={{ ...dataTextStyles, fontSize: '14px', fontWeight: 500, lineHeight: '28px' }}>
                      {row?.paymentNoPrefix}
                      {row?.paymentNo || ''}
                    </Typography>
                    <Typography sx={{ ...dataTitleStyles, color: '#818181' }}>No</Typography>
                  </Grid>
                  <Grid item xs={6} sm={2} md={2} lg={2} xl={2}>
                    <Typography sx={dataTextStyles}>{DateFunction(row?.paymentDate) || '-'}</Typography>
                    <Typography sx={dataTitleStyles}>Date</Typography>
                  </Grid>
                  <Grid item xs={6} sm={2} md={2} lg={2} xl={2}>
                    <Typography sx={dataTextStyles}>
                      {taxAuthorities?.find(item => item?.taxAuthorityId === row?.taxAuthorityId)?.taxAuthorityName ||
                        '-'}
                    </Typography>
                    <Typography sx={dataTitleStyles}>Tax Authority</Typography>
                  </Grid>
                  <Grid item xs={12} sm={3} md={2} lg={2} xl={2}>
                    <Typography sx={dataTextStyles}>{row?.description || '-'}</Typography>
                    <Typography sx={dataTitleStyles}>Description</Typography>
                  </Grid>
                  <Grid item xs={6} sm={2} md={2} lg={2} xl={2}>
                    {row?.amount ? (
                      <NumberFormat value={row?.amount} currency={findObjectByCurrencyId(currencies, row?.currency)} />
                    ) : (
                      '-'
                    )}
                    <Typography sx={dataTitleStyles}>Amount</Typography>
                  </Grid>
                  <Grid item xs={6} sm={2} md={2} lg={2.5} xl={2.5}>
                    {rowStatusChip(row?.status) || '-'}
                    <Typography sx={dataTitleStyles}>Status</Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={1} sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconButton
                    component={Link}
                    href={`/accounting/tax-payments/view/${row?.paymentId}`}
                    onClick={() => dispatch(setSelectedTaxPayment(row))}
                  >
                    <Icon icon='tabler:eye' />
                  </IconButton>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )
      }
    }
  ]
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 3,
          mb: 3
        }}
      >
        <Tooltip title='Reload' placement='top'>
          <IconButton
            color='default'
            sx={{ fontSize: '21px' }}
            onClick={() => {
              dispatch(resettaxPayments())
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <MobileDataGrid
        rows={taxPayments || []}
        columns={mobileColumns}
        getRowId={row => row?.paymentId}
        initialState={{
          sorting: {
            sortModel: [{ field: 'paymentNo', sort: 'desc' }]
          }
        }}
        onCellClick={(params, event) => {
          event.defaultMuiPrevented = false
        }}
        onRowClick={(params, event) => {
          if (event.target.closest('.MuiIconButton-root')) {
            event.defaultMuiPrevented = true
            return
          }
          dispatch(setSelectedTaxPayment(params.row))
          router.push(`/accounting/tax-payments/view/${params?.row?.paymentId}`)
        }}
        slots={{
          columnHeaders: () => null,
          noRowsOverlay: CustomNoRowsOverlay
        }}
        slotProps={{
          noRowsOverlay: {
            mainText: 'Empty Tax Payments',
            subText: 'No tax payments available here. Click "Add New" button above to get started.'
          }
        }}
      />
    </>
  )
}

export default TaxPaymentsListTable
