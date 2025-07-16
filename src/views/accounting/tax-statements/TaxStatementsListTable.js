import Link from 'next/link'
import Router from 'next/router'

// ** MUI Imports
import Box from '@mui/material/Box'
import { Grid, IconButton, MenuItem, Tooltip, Typography, alpha } from '@mui/material'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Icon from 'src/@core/components/icon'
import CustomNoRowsOverlay from 'src/common-components/CustomNoRowsOverlay'
import CommonStyledMenu from 'src/common-components/CommonStyledMenu'
import useIsDesktop from 'src/hooks/IsDesktop'
import {
  dataTextStyles,
  dataTitleStyles,
  DateFunction,
  findObjectByCurrencyId,
  hasPermission,
  NumberFormat,
  rowStatusChip
} from 'src/common-functions/utils/UtilityFunctions'
import { resettaxStatement, setSelectedTaxStatement, setUpdatetaxStatement } from 'src/store/apps/tax-statements'
import { DELETE_STATEMENT, MANAGE_STATEMENT, VIEW_STATEMENT } from 'src/common-functions/utils/Constants'
import DeleteTaxStatement from './DeleteTaxStatement'
import { writeData } from 'src/common-functions/GraphqlOperations'
import {
  markedStatementAsConfirmedQuery,
  undoConfirmedTaxStatementQuery
} from 'src/@core/components/graphql/tax-statement-queries'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import RefreshIcon from '@mui/icons-material/Refresh'
import { undoPaymentClearingForTaxStatementMutation } from 'src/@core/components/graphql/tax-payments-queries'
import { createAlert } from 'src/store/apps/alerts'
import MobileDataGrid from 'src/common-components/MobileDataGrid'

const TaxStatementsListTable = ({ tenantId, taxesData }) => {
  const dispatch = useDispatch()
  const userProfile = useSelector(state => state.userProfile)
  const router = Router
  const isDesktop = useIsDesktop()
  const { currencies } = useCurrencies()
  const selectedTaxStatement = useSelector(state => state?.taxStatements?.selectedTaxStatement)

  const [openDialog, setOpenDialog] = useState(false)
  const { taxStatements = [], taxAuthorities = [] } = taxesData || {}

  const [anchorElMap, setAnchorElMap] = useState({})

  const handleClick = (event, row) => {
    dispatch(setSelectedTaxStatement(row))
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.statementId] = event.currentTarget
    setAnchorElMap(updatedAnchorElMap)
  }

  const handleClose = row => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.statementId] = null
    setAnchorElMap(updatedAnchorElMap)
  }

  const handleDelete = row => {
    dispatch(setSelectedTaxStatement(row))
    handleClose(row)
    setOpenDialog(true)
  }

  const MarkStatus = async data => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[data.statementId] = null
    setAnchorElMap(updatedAnchorElMap)
    const { tenantId, statementId } = data
    try {
      const response = await writeData(markedStatementAsConfirmedQuery(), { tenantId, statementId })
      if (response.markedStatementAsConfirmed) {
        dispatch(setUpdatetaxStatement(response.markedStatementAsConfirmed))
        dispatch(createAlert({ message: 'Status changed successfully!', type: 'success' }))
      } else {
        dispatch(createAlert({ message: response?.errors?.[0]?.message, type: 'error' }))
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const UndoStatus = async data => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[data.statementId] = null
    setAnchorElMap(updatedAnchorElMap)
    const { tenantId, statementId } = data
    try {
      const response = await writeData(undoConfirmedTaxStatementQuery(), { tenantId, statementId })
      if (response.undoConfirmedTaxStatement) {
        dispatch(setUpdatetaxStatement(response.undoConfirmedTaxStatement))
        dispatch(createAlert({ message: 'Status changed successfully!', type: 'success' }))
      } else {
        dispatch(
          createAlert({
            message: response?.errors ? response?.errors?.[0]?.message : 'Failed to change status',
            type: 'error'
          })
        )
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }
  const handleUndoClearedTaxStatement = async row => {
    const { statementId } = row
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.statementId] = null
    setAnchorElMap(updatedAnchorElMap)
    try {
      const response = await writeData(undoPaymentClearingForTaxStatementMutation(), {
        tenantId,
        taxStatementId: statementId
      })
      const { undoPaymentClearingForTaxStatement } = response
      if (undoPaymentClearingForTaxStatement) {
        dispatch(resettaxStatement())
        dispatch(createAlert({ message: 'Undo Payment Clearing successfully!', type: 'success' }))
      } else {
        dispatch(createAlert({ message: response?.errors?.[0]?.message, type: 'error' }))
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }
  const mobileColumns = [
    {
      field: 'statementNo',
      headerName: '',
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => {
        return (
          <Box sx={{ width: '100%', p: 2 }}>
            <Grid container spacing={3} sx={{ alignItems: 'center' }}>
              <Grid item xs={10.5}>
                <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                  <Grid item xs={12} sm={4} md={2} lg={1.5} xl={1.5}>
                    <Typography sx={{ ...dataTextStyles, fontSize: '12px', fontWeight: 500, lineHeight: '28px' }}>
                      {row?.statementNoPrefix}
                      {row?.statementNo || ''}
                    </Typography>
                    <Typography sx={{ ...dataTitleStyles, color: '#818181' }}>No</Typography>
                  </Grid>
                  <Grid item xs={6} sm={2} md={2} lg={1.5} xl={1.5}>
                    <Typography sx={dataTextStyles}>{DateFunction(row?.statementDate) || '-'}</Typography>
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
                  <Grid item xs={6} sm={2} md={2} lg={1} xl={1}>
                    {row?.netStatementAmount ? (
                      <NumberFormat
                        value={row?.netStatementAmount}
                        currency={findObjectByCurrencyId(currencies, row?.currency)}
                      />
                    ) : (
                      '-'
                    )}
                    <Typography sx={dataTitleStyles}>Amount</Typography>
                  </Grid>
                  <Grid item xs={6} sm={2} md={2} lg={1.5} xl={1.5}>
                    {rowStatusChip(row?.status) || '-'}
                    <Typography sx={dataTitleStyles}>Status</Typography>
                  </Grid>
                  <Grid item xs={6} sm={2} md={2} lg={2} xl={2}>
                    {rowStatusChip(row?.paymentStatus) || '-'}
                    <Typography sx={dataTitleStyles}>Payment Status</Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={1.5} sx={{ alignSelf: 'flex-start' }}>
                {isDesktop ? (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', minWidth: '100px' }}>
                    {hasPermission(userProfile, VIEW_STATEMENT) && (
                      <IconButton
                        component={Link}
                        href={`/accounting/tax-statements/view/${row?.statementId}`}
                        onClick={() => dispatch(setSelectedTaxStatement(row))}
                      >
                        <Icon icon='tabler:eye' />
                      </IconButton>
                    )}
                    <IconButton onClick={event => handleClick(event, row)}>
                      <Icon icon='iconamoon:menu-kebab-vertical-circle-light' width={25} height={25} />
                    </IconButton>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <IconButton onClick={event => handleClick(event, row)}>
                      <Icon icon='iconamoon:menu-kebab-vertical-circle-light' width={27} height={27} />
                    </IconButton>
                  </Box>
                )}

                <CommonStyledMenu
                  anchorEl={anchorElMap[row.statementId]}
                  open={Boolean(anchorElMap[row.statementId])}
                  onClose={() => handleClose(row)}
                >
                  {!isDesktop && hasPermission(userProfile, VIEW_STATEMENT) && (
                    <MenuItem
                      component={Link}
                      href={`/accounting/tax-statements/view/${row?.statementId}`}
                      onClick={() => dispatch(setSelectedTaxStatement(row))}
                    >
                      <Icon icon='tabler:eye' /> View
                    </MenuItem>
                  )}
                  {hasPermission(userProfile, MANAGE_STATEMENT) && row?.status === 'DRAFT' && (
                    <MenuItem onClick={() => MarkStatus(row)}>
                      <Icon icon='teenyicons:file-tick-outline' /> Mark As Confirmed
                    </MenuItem>
                  )}
                  {hasPermission(userProfile, MANAGE_STATEMENT) && row?.status === 'CONFIRMED' && (
                    <MenuItem onClick={() => UndoStatus(row)}>
                      <Icon icon='iconamoon:do-undo-light' /> Undo Confirmation
                    </MenuItem>
                  )}
                  {hasPermission(userProfile, MANAGE_STATEMENT) && row?.status === 'CONFIRMED' && (
                    <MenuItem onClick={() => handleUndoClearedTaxStatement(row)}>
                      <Icon icon='iconamoon:do-undo-light' /> Undo Cleared Payment
                    </MenuItem>
                  )}
                  {hasPermission(userProfile, DELETE_STATEMENT) && row?.status === 'DRAFT' && (
                    <MenuItem
                      onClick={() => handleDelete(row)}
                      sx={{
                        color: theme => theme?.palette?.error?.main,
                        '&:hover': {
                          color: theme => theme?.palette?.error?.main + ' !important',
                          backgroundColor: theme =>
                            alpha(theme.palette.error.main, theme.palette.action.selectedOpacity) + ' !important'
                        }
                      }}
                    >
                      <Icon icon='mingcute:delete-2-line' /> Delete
                    </MenuItem>
                  )}
                </CommonStyledMenu>
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
              dispatch(resettaxStatement())
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <MobileDataGrid
        rows={taxStatements || []}
        columns={mobileColumns}
        getRowId={row => row?.statementId}
        initialState={{
          sorting: {
            sortModel: [{ field: 'statementNo', sort: 'desc' }]
          }
        }}
        styles={{
          '& .MuiDataGrid-row:hover': {
            cursor: 'pointer'
          }
        }}
        s
        onCellClick={(params, event) => {
          event.defaultMuiPrevented = false
        }}
        onRowClick={(params, event) => {
          if (event.target.closest('.MuiIconButton-root')) {
            event.defaultMuiPrevented = true
            return
          }
          dispatch(setSelectedTaxStatement(params.row))
          router.push(`/accounting/tax-statements/view/${params?.row?.statementId}`)
        }}
        slots={{
          columnHeaders: () => null,
          noRowsOverlay: CustomNoRowsOverlay
        }}
        slotProps={{
          noRowsOverlay: {
            mainText: 'Empty Tax Statements',
            subText: 'No tax statements available here. Click "Add New" button above to get started.'
          }
        }}
      />
      {openDialog && (
        <DeleteTaxStatement
          tenantId={tenantId}
          statementId={selectedTaxStatement?.statementId}
          openDialog={openDialog}
          setOpenDialog={setOpenDialog}
        />
      )}
    </>
  )
}

export default TaxStatementsListTable
