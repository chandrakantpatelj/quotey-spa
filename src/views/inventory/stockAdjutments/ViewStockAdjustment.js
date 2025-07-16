// ** Next Import
import { Close, MoreVert } from '@mui/icons-material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import {
  Box,
  Button,
  Card,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import Link from 'next/link'
import Router from 'next/router'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { UndoStockAdjustmentConfirmationQuery } from 'src/@core/components/graphql/stock-adjustment-queries'
import Icon from 'src/@core/components/icon'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import { RendorDimensions, RendorItemData, ViewItemsTableWrapper } from 'src/common-components/CommonPdfDesign'
import CommonStyledMenu from 'src/common-components/CommonStyledMenu'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { EDIT_STOCK, STATUS_CONFIRMED } from 'src/common-functions/utils/Constants'
import {
  DateFunction,
  hasPermission,
  NumberFormat,
  rowStatusChip,
  toTitleCase
} from 'src/common-functions/utils/UtilityFunctions'
import useIsDesktop from 'src/hooks/IsDesktop'
import { createAlert } from 'src/store/apps/alerts'
import { setSelectedStock, setUpdateStock } from 'src/store/apps/stock-adjustments'

export default function ViewStockAdjustment({ loading, adjustData }) {
  const theme = useTheme()
  const route = Router
  const dispatch = useDispatch()
  const isDesktop = useIsDesktop()
  const tenantId = useSelector(state => state.tenants?.selectedTenant.tenantId)
  const userProfile = useSelector(state => state.userProfile)

  const { stockAdjustments, warehouses, currencies, generalStockAdujstmentSettings } = adjustData
  const selectedStock = useSelector(state => state.stockAdjustments?.selectedStock)

  let currency = currencies.find(cur => cur?.currencyId === selectedStock?.currency)
  const warehouse = warehouses?.find(item => item?.warehouseId === selectedStock?.warehouseId) || {}

  const reason = generalStockAdujstmentSettings
    ?.find(item => item?.stockMovement === selectedStock?.stockMovement)
    ?.reasons?.find(val => val?.reasonCode === selectedStock?.reason)

  let getTotal = key => selectedStock?.adjustmentItems?.reduce((total, item) => total + (item[key] || 0), 0)

  let getTotalQty = () => getTotal('qty')
  let getTotalValue = () => getTotal('totalValue')

  useEffect(() => {
    if (Object.keys(selectedStock).length === 0) {
      route.push('/inventory/stock-adjustments/')
    }
  }, [selectedStock, tenantId])

  const [anchorEl, setAnchorEl] = useState(null)

  const open = Boolean(anchorEl)

  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const [isListVisible, setIsListVisible] = useState(true)

  const UndoStatus = async data => {
    setAnchorEl(null)
    const { tenantId, stockAdjustmentId } = data
    try {
      // setLoading(true)

      const response = await writeData(UndoStockAdjustmentConfirmationQuery(), { tenantId, stockAdjustmentId })
      if (response && response.undoStockAdjustmentConfirmation) {
        dispatch(setUpdateStock(response.undoStockAdjustmentConfirmation))
        dispatch(setSelectedStock(response.undoStockAdjustmentConfirmation))
        dispatch(createAlert({ message: 'Status changed successfully!', type: 'success' }))
      } else {
        dispatch(createAlert({ message: 'Failed to undo the status', type: 'error' }))
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      // setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        title={
          <Typography
            sx={{
              fontSize: { xs: '16px', md: '18px' },
              fontWeight: '500'
            }}
          >
            View Stock Adjustment - {selectedStock?.adjustmentNo}
          </Typography>
        }
        button={
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            <Button
              variant='contained'
              color='primary'
              sx={{ display: { xs: 'none', sm: 'flex' } }}
              startIcon={<AddOutlinedIcon />}
              component={Link}
              scroll={true}
              href={`/inventory/stock-adjustments/new/`}
            >
              New
            </Button>
            {hasPermission(userProfile, EDIT_STOCK) && selectedStock?.status !== STATUS_CONFIRMED && (
              <IconButton
                variant='outlined'
                sx={{ fontSize: '21px' }}
                component={Link}
                scroll={true}
                href={`/inventory/stock-adjustments/edit/${selectedStock?.stockAdjustmentId}`}
              >
                <Icon icon='tabler:edit' />
              </IconButton>
            )}
            <IconButton
              variant='outlined'
              color='default'
              sx={{ fontSize: '21px' }}
              component={Link}
              scroll={true}
              href='/inventory/stock-adjustments/'
            >
              <Close sx={{ color: theme => theme.palette.primary.main }} />
            </IconButton>
            {selectedStock?.status === STATUS_CONFIRMED ? (
              <div>
                <IconButton
                  aria-label='more'
                  id='long-button'
                  aria-controls={open ? 'long-menu' : undefined}
                  aria-expanded={open ? 'true' : undefined}
                  aria-haspopup='true'
                  onClick={handleClick}
                >
                  <MoreVert />
                </IconButton>
                {/* )} */}

                <CommonStyledMenu anchorEl={anchorEl} open={open} onClose={handleClose}>
                  <MenuItem onClick={() => UndoStatus(selectedStock)} disableRipple>
                    <Icon icon={'iconamoon:do-undo-light'} />
                    Undo Confirmation
                  </MenuItem>
                </CommonStyledMenu>
              </div>
            ) : null}
          </Box>
        }
      />

      <PageWrapper>
        {loading ? (
          <LinearProgress sx={{ height: '5px' }} />
        ) : (
          <div>
            <Grid container spacing={{ xs: 5, xl: 10 }}>
              <Grid item xs={12}>
                <Grid item xs={12} sm={6} md={6} lg={4} xl={4}>
                  <CustomAutocomplete
                    options={stockAdjustments || []}
                    getOptionLabel={option => `${option.adjustmentNoPrefix || ''}${option.adjustmentNo || ''}`}
                    value={
                      stockAdjustments.find(option => option.stockAdjustmentId === selectedStock.stockAdjustmentId) ||
                      null
                    }
                    onChange={(e, newValue) => {
                      dispatch(setSelectedStock(newValue))
                    }}
                    disableClearable
                    renderInput={params => <CustomTextField {...params} fullWidth label='Stocks' />}
                  />
                </Grid>
              </Grid>
              <Grid item xs={12} md={8} lg={8} xl={8}>
                <Card sx={{ p: 6 }}>
                  <Grid item xs={12}>
                    <Table
                      sx={{
                        width: '100%',
                        border: 0,
                        marginBottom: '30px',
                        '& .MuiTableCell-root': {
                          border: 0,
                          padding: '0px !important',
                          verticalAlign: 'top',
                          width: '50%'
                        },
                        '& .MuiTableCell-root .data-name': {
                          fontSize: '13px',
                          color: '#818181',
                          lineHeight: '28px'
                        },
                        '& .MuiTableCell-root .data-value': {
                          fontSize: '13px',
                          fontWeight: 500,
                          color: '#000',
                          lineHeight: '28px'
                        }
                      }}
                    >
                      <TableBody>
                        <TableRow>
                          <TableCell colSpan={2}>
                            <Typography
                              sx={{
                                fontSize: '14px',
                                fontWeight: 500,
                                lineHeight: '26px',
                                color: '#4567c6 !important',
                                textAlign: 'left'
                              }}
                            >
                              #{selectedStock?.adjustmentNoPrefix}
                              {selectedStock?.adjustmentNo}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Typography className='data-name'>
                              Status: {rowStatusChip(selectedStock?.status)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Typography className='data-name'>
                              Date: {DateFunction(selectedStock?.adjustmentDate)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Typography className='data-name'>
                              Stock Movement: {toTitleCase(selectedStock?.stockMovement)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Typography className='data-name'>warehouse: {warehouse?.name || '-'}</Typography>
                          </TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell>
                            <Typography className='data-name'>Reference: {selectedStock?.reference || ''} </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            {/* {selectedStock?.reason ? ( */}
                            <Typography className='data-name'>Reason: {reason?.reasonName || '-'} </Typography>
                            {/* ) : null} */}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Grid>
                  <Grid item xs={12}>
                    <ViewItemsTableWrapper>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ width: '3%' }}>#</TableCell>
                          <TableCell sx={{ width: '45%' }}>Item</TableCell>
                          {isDesktop && <TableCell sx={{ width: '12%' }}>Dimensions</TableCell>}
                          <TableCell sx={{ width: '8%' }}>Total Qty</TableCell>
                          <TableCell sx={{ width: '10%' }}>Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedStock?.adjustmentItems?.length > 0 ? (
                          selectedStock?.adjustmentItems?.map((orderItem, index) => {
                            return (
                              <TableRow key={orderItem?.itemId}>
                                <TableCell>{index + 1}</TableCell>
                                <RendorItemData
                                  index={index}
                                  orderItem={orderItem}
                                  currency={currency}
                                  showData={true}
                                />
                                {isDesktop ? (
                                  <TableCell>
                                    <RendorDimensions orderItem={orderItem} />{' '}
                                  </TableCell>
                                ) : null}

                                <TableCell>
                                  {orderItem?.qty} {orderItem?.uom}
                                </TableCell>

                                <TableCell>
                                  <NumberFormat value={orderItem?.totalValue} currency={currency} />
                                </TableCell>
                              </TableRow>
                            )
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5}>
                              <Box
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  p: '30px 10px'
                                }}
                              >
                                <Typography variant='h5' align='center' display='block'>
                                  No Items
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </ViewItemsTableWrapper>
                  </Grid>
                  <Grid item xs={12}>
                    <Grid
                      container
                      spacing={6}
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column-reverse', md: 'row' },
                        justifyContent: 'space-between'
                      }}
                    >
                      <Grid item xs={12} md={6}>
                        <Box sx={{ p: 4 }}>
                          {selectedStock?.notes ? (
                            <>
                              <Typography
                                sx={{
                                  fontSize: '14px',
                                  fontWeight: 600,
                                  lineHeight: '22px'
                                }}
                              >
                                Notes
                              </Typography>

                              <Typography sx={{ fontSize: '12px', color: '#818181', lineHeight: '22px' }}>
                                <div>
                                  <pre
                                    style={{
                                      fontFamily: 'inherit',
                                      whiteSpace: 'pre-wrap'
                                    }}
                                  >
                                    {selectedStock?.notes}
                                  </pre>
                                </div>
                              </Typography>
                            </>
                          ) : null}
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Table
                          sx={{
                            '& .MuiTableCell-root': {
                              padding: '8px 10px !important',
                              borderBottom: '1px dashed #EBEBEB',
                              textAlign: 'right',
                              fontSize: '12px'
                            },
                            '& .data-value p': {
                              textWrap: 'nowrap'
                            }
                          }}
                        >
                          <TableRow>
                            <TableCell>
                              {' '}
                              <Typography
                                sx={{
                                  fontFamily: 'Kanit',
                                  fontSize: '14px',
                                  fontWeight: 400,
                                  color: '#667380',
                                  textAlign: 'right'
                                }}
                              >
                                Total Qty:
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography sx={{ fontSize: 'inherit', fontWeight: 500 }}>{getTotalQty()}</Typography>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              {' '}
                              <Typography
                                sx={{
                                  fontFamily: 'Kanit',
                                  fontSize: '14px',
                                  fontWeight: 400,
                                  color: '#667380',
                                  textAlign: 'right'
                                }}
                              >
                                Total Value:
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography sx={{ fontSize: 'inherit', fontWeight: 500 }}>
                                <NumberFormat value={parseFloat(getTotalValue())?.toFixed(2)} currency={currency} />
                              </Typography>
                            </TableCell>
                          </TableRow>
                        </Table>
                      </Grid>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
            </Grid>
          </div>
        )}
      </PageWrapper>
    </div>
  )
}
