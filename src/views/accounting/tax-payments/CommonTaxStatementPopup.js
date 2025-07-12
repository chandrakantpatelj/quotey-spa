import {
  Alert,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { NumericFormat } from 'react-number-format'
import { useSelector } from 'react-redux'
import Icon from 'src/@core/components/icon'
import {
  DateFunction,
  findObjectByCurrencyId,
  NumberFormat,
  rowStatusChip
} from 'src/common-functions/utils/UtilityFunctions'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import useCustomers from 'src/hooks/getData/useCustomers'
import useTaxStatements from 'src/hooks/getData/useTaxStatements'
import useWarehouses from 'src/hooks/getData/useWarehouses'
import useIsDesktop from 'src/hooks/IsDesktop'
import CommonCustomerPopup from './CommonCustomerPopup'
import { CommonPageLayoutForPopup } from './CommonPageLayoutForPopup'
import { CommonViewTable, RendorDimensions, RendorSalesItemData, ShowAddress } from './CommonPdfDesign'
import CustomCloseButton from './CustomCloseButton'
import StyledButton from './StyledMuiButton'

function CommonTaxStatementPopup({ statementId, open, onClose }) {
  const isDesktop = useIsDesktop()
  const tenant = useSelector(state => state.tenants?.selectedTenant)
  const { tenantId = '' } = tenant
  const { taxStatements } = useTaxStatements(tenantId)

  const statements = taxStatements?.find(item => item?.statementId === statementId) || {}

  const { currencies } = useCurrencies()
  const { warehouses } = useWarehouses(tenantId)
  const { fetchSingleCustomer } = useCustomers(tenantId)
  const [customer, setCustomer] = useState({})
  const [openCustomerDialog, setOpenCustomerDialog] = useState(false)
  const discountType =
    currencies?.find(currency => currency.currencyId === statements.discountType)?.symbol || statements.discountType
  const currency = useMemo(() => findObjectByCurrencyId(currencies, statements?.currency), [currencies, statements])
  const {
    totalAmount = 0,
    subtotal = 0,
    totalQty = 0,
    discountValue = 0,
    taxes = [],
    otherCharges = []
  } = statements || {}

  useEffect(() => {
    const getCustomerObject = async () => {
      const customer = await fetchSingleCustomer(statements?.customerId)
      if (customer) {
        setCustomer(customer)
      }
    }
    getCustomerObject()
  }, [tenantId, statements?.customerId])

  const handleCustomerDialoge = () => {
    setOpenCustomerDialog(!openCustomerDialog)
  }

  return (
    <Dialog
      open={open}
      disableEscapeKeyDown
      maxWidth='md'
      fullWidth={true}
      scroll='paper'
      aria-labelledby='alert-dialog-title'
      aria-describedby='alert-dialog-description'
      onClose={(event, reason) => {
        if (reason !== 'backdropClick') {
          onClose
        }
      }}
      sx={{
        '& .MuiDialog-paper': {
          overflow: 'visible',
          p: '20px 0px !important',
          verticalAlign: 'top'
        }
      }}
    >
      <DialogTitle id='alert-dialog-title'>
        <Alert severity='info' sx={{ color: 'rgba(0,0,0,0.8)' }}>
          Sales Order
        </Alert>{' '}
      </DialogTitle>
      <DialogContent sx={{ py: 8 }}>
        <CustomCloseButton onClick={onClose}>
          <Icon icon='tabler:x' fontSize='1.25rem' />
        </CustomCloseButton>

        <CommonPageLayoutForPopup
          data={statements}
          currency={currency}
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
                    {DateFunction(statements?.orderDate)}
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
                    {DateFunction(statements?.dueDate)}
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
                    {statements?.paymentTerms ? statements?.paymentTerms : '-'}
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
                    Invoice No
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
                    #{statements?.orderNo}
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
                <TableCell>{rowStatusChip(statements?.status)}</TableCell>
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

                  <ShowAddress data={customer?.billingAddress} />
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
                {statements?.orderItems?.length > 0 ? (
                  statements?.orderItems?.map((orderItem, index) => {
                    const warehouse = warehouses.find(item => item?.warehouseId === orderItem?.warehouseId) || {}
                    return (
                      <TableRow key={orderItem.itemId}>
                        <TableCell>{index + 1}</TableCell>

                        <RendorSalesItemData index={index} orderItem={orderItem} currency={currency} showData={true} />

                        {isDesktop ? (
                          <TableCell>
                            <RendorDimensions orderItem={orderItem} />{' '}
                          </TableCell>
                        ) : null}
                        <TableCell>
                          {orderItem?.qty} {orderItem?.uom}
                        </TableCell>

                        {isDesktop ? <TableCell>{warehouse?.name}</TableCell> : null}

                        {isDesktop ? (
                          <TableCell>
                            <NumberFormat value={orderItem?.sellingPrice.toFixed(2)} currency={currency} />
                          </TableCell>
                        ) : null}
                        <TableCell>
                          {/* <NumberFormat value={getRowTotal(orderItem)} currency={currency} /> */}
                          <NumberFormat value={orderItem?.subtotal?.toFixed(2)} currency={currency} />
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
            statements?.customerNotes ? (
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
                      {statements?.customerNotes}
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

              {taxes.map(item => (
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

              {otherCharges.map(item => {
                const totalTaxes = item.taxes.reduce((acc, tax) => acc + tax.taxValue, 0)

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
                    Total (Inc. Tax):
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
                    {statements?.reference ? statements?.reference : '-'}
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
                    {statements?.shippingPreference ? statements?.shippingPreference : '-'}
                  </Typography>
                </TableCell>
              </TableRow>
            </>
          }
        />
      </DialogContent>
    </Dialog>
  )
}

export default CommonTaxStatementPopup
