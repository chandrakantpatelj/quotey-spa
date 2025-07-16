// ** Next Import
import Link from 'next/link'
import Router from 'next/router'
import React, { useEffect, useMemo, useState } from 'react'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import {
  Box,
  Button,
  IconButton,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  TableHead,
  MenuItem,
  LinearProgress
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import { Close } from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { NumericFormat } from 'react-number-format'
import {
  checkAuthorizedRoute,
  DateFunction,
  findObjectByCurrencyId,
  hasPermission,
  NumberFormat,
  rowStatusChip
} from 'src/common-functions/utils/UtilityFunctions'
import { useTheme, alpha } from '@mui/material/styles'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import CommonStyledMenu from 'src/common-components/CommonStyledMenu'
import StyledButton from 'src/common-components/StyledMuiButton'
import CommonCustomerPopup from 'src/common-components/CommonCustomerPopup'
import { setSelectedQuotation } from 'src/store/apps/quotations'
import {
  CommonAddress,
  CommonViewTable,
  PdfLayout,
  RendorDimensions,
  RendorSalesItemData
} from 'src/common-components/CommonPdfDesign'
import {
  CREATE_QUOTATION,
  LIST_QUOTATION,
  EDIT_QUOTATION,
  CREATE_SALES_ORDER
} from 'src/common-functions/utils/Constants'
import useIsDesktop from 'src/hooks/IsDesktop'

export default function ViewQuotation({ loading, quotationObject }) {
  const route = Router
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId)
  const dispatch = useDispatch()
  const theme = useTheme()
  const isDesktop = useIsDesktop()
  const userProfile = useSelector(state => state.userProfile)

  const [isAuthorized, setIsAuthorized] = useState(false)
  const { quotations = [], customers = [], currencies = [], warehouses = [] } = quotationObject || {}

  const quotation = useSelector(state => state.quotations?.selectedQuotation) || {}

  useEffect(() => {
    if (Object.keys(quotation).length === 0) {
      route.push('/sales/quotation/')
    }
  }, [quotation, tenantId])

  const {
    totalAmount = 0,
    subtotal = 0,
    totalQty = 0,
    discountValue = 0,
    taxes = [],
    otherCharges = []
  } = quotation || {}

  const currency = useMemo(() => findObjectByCurrencyId(currencies, quotation?.currency), [currencies, quotation])

  const customer = useMemo(
    () => customers?.find(item => item?.customerId === quotation?.customerId) || {},
    [customers, quotation?.customerId]
  )

  const discountType =
    currencies?.find(currency => currency.currencyId === quotation.discountType)?.symbol || quotation.discountType

  const [anchorEl, setAnchorEl] = React.useState(null)

  const open = Boolean(anchorEl)

  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const [openCustomerDialog, setOpenCustomerDialog] = useState(false)

  const handleCustomerDialoge = () => {
    setOpenCustomerDialog(!openCustomerDialog)
  }

  useEffect(() => {
    if (checkAuthorizedRoute(LIST_QUOTATION, route, userProfile)) {
      setIsAuthorized(true)
    } else {
      setIsAuthorized(false)
    }
  }, [userProfile])

  if (!isAuthorized) {
    return null
  }
  return (
    <>
      <PageHeader
        title={
          <Typography
            sx={{
              fontSize: { xs: '16px', md: '18px' },
              fontWeight: '500'
            }}
          >
            View Quotation - {quotation?.quotationNo}
          </Typography>
        }
        button={
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            {hasPermission(userProfile, CREATE_QUOTATION) && (
              <Button
                variant='contained'
                color='primary'
                sx={{ display: { xs: 'none', sm: 'flex' } }}
                startIcon={<AddOutlinedIcon />}
                component={Link}
                scroll={true}
                href={`/sales/quotation/add`}
              >
                Add New
              </Button>
            )}
            {hasPermission(userProfile, EDIT_QUOTATION) && (
              <IconButton
                component={Link}
                scroll={true}
                href={`/sales/quotation/edit/${quotation?.quotationId}`}
                onClick={() => dispatch(setSelectedQuotation(quotation))}
              >
                {' '}
                <Icon icon='tabler:edit' />
              </IconButton>
            )}
            <IconButton color='default' component={Link} scroll={true} href='/sales/quotation'>
              <Close sx={{ color: theme => theme.palette.primary.main }} />
            </IconButton>
            {quotation?.status === 'confirmed' ? (
              <div>
                {hasPermission(userProfile, CREATE_SALES_ORDER) && (
                  <IconButton
                    aria-label='more'
                    id='long-button'
                    aria-controls={open ? 'long-menu' : undefined}
                    aria-expanded={open ? 'true' : undefined}
                    aria-haspopup='true'
                    onClick={handleClick}
                  >
                    <MoreVertIcon />
                  </IconButton>
                )}

                <CommonStyledMenu anchorEl={anchorEl} open={open} onClose={handleClose}>
                  <MenuItem
                    component={Link}
                    scroll={true}
                    href={`/sales/sales-order/add-salesorder`}
                    onClick={() => dispatch(setSelectedQuotation(quotation))}
                  >
                    <Icon icon={'ph:package'} />
                    Create Order
                  </MenuItem>
                </CommonStyledMenu>
              </div>
            ) : null}
          </Box>
        }
      />
      <PageWrapper>
        {loading ? (
          <LinearProgress />
        ) : (
          <PdfLayout
            data={quotation}
            currency={currency}
            DataList={
              <>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Quotation No</TableCell>
                    <TableCell>Customer</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {quotations?.map((orderItem, index) => {
                    const customer =
                      customers.find(item => {
                        if (item?.customerId === orderItem?.customerId) {
                          return item
                        }
                      }) || {}

                    return (
                      <TableRow
                        key={orderItem.quotationId}
                        onClick={() => {
                          dispatch(setSelectedQuotation(orderItem))
                          route.push(`/sales/quotation/view/${orderItem?.quotationId}`)
                        }}
                        sx={{
                          background:
                            quotation?.quotationId === orderItem?.quotationId
                              ? `${alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity)} !important`
                              : 'inherit'
                        }}
                      >
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Typography variant='h6' sx={{ fontSize: '12px', fontWeight: 500, lineHeight: '20px' }}>
                            {orderItem?.quotationNoPrefix} {orderItem?.quotationNo}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant='h6' sx={{ fontSize: '12px', fontWeight: 500, lineHeight: '20px' }}>
                            {customer?.customerName}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </>
            }
            section2={
              <>
                <TableRow>
                  <TableCell sx={{ width: '50%' }}>
                    <Typography
                      className='data-name'
                      sx={{
                        lineHeight: '22px'
                      }}
                    >
                      Order Date
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography className='data-value' sx={{ fontWeight: 400, lineHeight: '22px' }}>
                      {DateFunction(quotation?.orderDate)}
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ width: '50%' }}>
                    <Typography
                      className='data-name'
                      sx={{
                        lineHeight: '22px'
                      }}
                    >
                      Due Date
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography className='data-value' sx={{ fontWeight: 400, lineHeight: '22px' }}>
                      {DateFunction(quotation?.dueDate)}
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ width: '50%' }}>
                    <Typography
                      className='data-name'
                      sx={{
                        lineHeight: '22px'
                      }}
                    >
                      Terms
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography className='data-value' sx={{ fontWeight: 400, lineHeight: '22px' }}>
                      {quotation?.paymentTerms ? quotation?.paymentTerms : '-'}
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ width: '50%' }}>
                    <Typography
                      className='data-name'
                      sx={{
                        lineHeight: '22px'
                      }}
                    >
                      Quotation No
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      className='data-value'
                      sx={{
                        fontWeight: 400,
                        lineHeight: '22px',
                        color: '#4567c6 !important'
                      }}
                    >
                      #{quotation?.quotationNo}
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ width: '50%' }}>
                    <Typography
                      className='data-name'
                      sx={{
                        lineHeight: '22px'
                      }}
                    >
                      Status{' '}
                    </Typography>
                  </TableCell>
                  <TableCell>{rowStatusChip(quotation?.status)}</TableCell>
                </TableRow>
              </>
            }
            section3={
              <>
                <Typography
                  sx={{
                    fontSize: '13px',
                    fontWeight: 600,
                    lineHeight: '24px'
                  }}
                >
                  Customer
                </Typography>
                <CommonViewTable>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <StyledButton color='primary' onClick={handleCustomerDialoge}>
                          {' '}
                          {customer?.customerName}
                        </StyledButton>
                        {openCustomerDialog && (
                          <CommonCustomerPopup
                            customerId={customer?.customerId}
                            open={openCustomerDialog}
                            setOpen={setOpenCustomerDialog}
                          />
                        )}
                      </TableCell>
                    </TableRow>

                    <CommonAddress data={customer} />
                  </TableBody>
                </CommonViewTable>
              </>
            }
            itemsSection={
              <>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: '3%' }}>#</TableCell>
                    <TableCell sx={{ width: '40%' }}>Item</TableCell>
                    {isDesktop ? <TableCell sx={{ width: '6%' }}>Dimensions</TableCell> : null}
                    <TableCell sx={{ width: '8%' }}>Qty</TableCell>
                    {isDesktop ? <TableCell sx={{ width: '10%' }}>Warehouse</TableCell> : null}
                    {isDesktop ? <TableCell sx={{ width: '11%' }}>Rate</TableCell> : null}
                    <TableCell sx={{ width: '18%' }}>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {quotation?.quotationItems?.length > 0 ? (
                    quotation?.quotationItems?.map((orderItem, index) => {
                      const warehouse = warehouses?.find(item => item?.warehouseId === orderItem?.warehouseId) || {}
                      return (
                        <TableRow key={orderItem.itemCode}>
                          <TableCell>{index + 1}</TableCell>

                          <RendorSalesItemData index={index} orderItem={orderItem} currency={currency} />

                          {isDesktop ? (
                            <TableCell>
                              <RendorDimensions orderItem={orderItem} />
                            </TableCell>
                          ) : null}

                          <TableCell>
                            {orderItem?.qty} {orderItem?.uom}
                          </TableCell>

                          {isDesktop ? <TableCell>{warehouse?.name}</TableCell> : null}

                          {isDesktop ? (
                            <TableCell>
                              <NumberFormat value={orderItem?.sellingPrice} currency={currency} />
                            </TableCell>
                          ) : null}
                          <TableCell>
                            <NumberFormat value={orderItem?.subtotal} currency={currency} />
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8}>
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
              </>
            }
            notesSection={
              quotation?.customerNotes ? (
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
                        {quotation?.customerNotes}
                      </pre>
                    </div>
                  </Typography>{' '}
                </>
              ) : null
            }
            totalsSection={
              <TableBody>
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
                    <Typography sx={{ fontSize: 'inherit', fontWeight: 400 }}>{totalQty}</Typography>
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
                      Sub Total:
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 'inherit', fontWeight: 400 }}>
                      <NumberFormat value={subtotal} currency={currency} />
                    </Typography>
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
                      Discount:
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {discountValue <= 0 ? (
                      <Typography sx={{ fontSize: 'inherit', fontWeight: 400 }}>0.00</Typography>
                    ) : (
                      <Typography color='error' sx={{ fontSize: 'inherit', fontWeight: 400 }}>
                        -{' '}
                        <NumericFormat
                          value={parseFloat(discountValue || 0).toFixed(2)}
                          thousandSeparator=','
                          displayType={'text'}
                          prefix={
                            discountType !== 'PERCENTAGE' && currency?.displayAlignment === 'left'
                              ? `${currency?.symbol}`
                              : ''
                          }
                          suffix={
                            discountType === 'PERCENTAGE'
                              ? '%'
                              : currency?.displayAlignment === 'right'
                              ? `${currency?.symbol}`
                              : ''
                          }
                        />
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
                {taxes?.map(item => (
                  <TableRow key={item.taxName}>
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
                        {item.taxName}({item.taxRate}%):
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 'inherit', fontWeight: 400 }}>
                        <NumberFormat value={item.taxValue} currency={currency} />
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}

                {otherCharges?.map(item => {
                  return (
                    <TableRow key={item.chargeName}>
                      <TableCell>
                        <Typography
                          sx={{
                            fontFamily: 'Kanit',
                            fontSize: '14px',
                            fontWeight: 400,
                            color: '#667380',
                            textAlign: 'right',
                            minWidth: 'max-content'
                          }}
                        >
                          {item.chargeName}
                          {/* {'(Exc. Tax)'}: */}
                          {item.includingTax && item.taxes.length === 0 ? '(Inc. Tax)' : '(Exc. Tax)'}:
                        </Typography>
                        {item.taxes.map(tax => (
                          <Typography
                            key={tax.taxName}
                            sx={{
                              fontFamily: 'Kanit',
                              fontSize: '12px',
                              fontWeight: 400,
                              color: '#667380',
                              textAlign: 'right'
                            }}
                          >
                            {tax.taxName}({tax.taxRate}%):
                          </Typography>
                        ))}
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: 'inherit', fontWeight: 400 }}>
                          <NumberFormat
                            value={item.includingTax ? item.chargedAmount : item.totalChargeValue}
                            currency={currency}
                          />
                        </Typography>
                        {item.taxes.map(tax => (
                          <Typography
                            key={tax.taxName}
                            sx={{
                              fontFamily: 'Kanit',
                              fontSize: 'inherit',
                              fontWeight: 400,
                              color: '#667380',
                              textAlign: 'right'
                            }}
                          >
                            <NumberFormat value={tax.taxValue} currency={currency} />
                          </Typography>
                        ))}
                      </TableCell>
                    </TableRow>
                  )
                })}
                <TableRow>
                  <TableCell>
                    {' '}
                    <Typography
                      sx={{
                        fontFamily: 'Kanit',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#667380',
                        textAlign: 'right'
                      }}
                    >
                      Total (Inc. GST):
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 'inherit', fontWeight: 600 }}>
                      <NumberFormat value={totalAmount} currency={currency} />
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            }
            lastSection={
              <>
                <TableRow>
                  <TableCell sx={{ width: '20%' }}>
                    <Typography
                      className='data-name'
                      sx={{ fontSize: '12px', fontWeight: 400, lineHeight: '22px', pr: '6px' }}
                    >
                      Reference
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ width: '80%' }}>
                    <Typography className='data-value' sx={{ fontSize: '12px', fontWeight: 400, lineHeight: '22px' }}>
                      {quotation?.reference ? quotation?.reference : '-'}
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Typography
                      className='data-name'
                      sx={{ fontSize: '12px', fontWeight: 400, lineHeight: '22px', pr: '6px' }}
                    >
                      Shipment Preference
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography className='data-value' sx={{ fontSize: '12px', fontWeight: 400, lineHeight: '22px' }}>
                      {quotation?.shippingPreference ? quotation?.shippingPreference : '-'}
                    </Typography>
                  </TableCell>
                </TableRow>
              </>
            }
          />
        )}
      </PageWrapper>
    </>
  )
}
