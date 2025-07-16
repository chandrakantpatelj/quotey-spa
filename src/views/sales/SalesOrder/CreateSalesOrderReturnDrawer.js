import { useMemo, useState } from 'react'
import {
  Alert,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Drawer,
  Grid,
  IconButton,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography
} from '@mui/material'
import { useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import Icon from 'src/@core/components/icon'
import {
  DateFunction,
  findObjectByCurrencyId,
  NumberFormat,
  rowStatusChip
} from 'src/common-functions/utils/UtilityFunctions'
import { STATUS_DRAFT } from 'src/common-functions/utils/Constants'
import { CommonAddress, CommonViewTable, ShowAddress } from 'src/common-components/CommonPdfDesign'
import AddCustomerPopup from 'src/common-components/AddCustomerPopup'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import useWarehouses from 'src/hooks/getData/useWarehouses'
import ReturnSalesOrderItemsTable from './ReturnSalesOrderItemsTable'
import { NumericFormat } from 'react-number-format'
import CommonCustomerPopup from 'src/common-components/CommonCustomerPopup'
import StyledButton from 'src/common-components/StyledMuiButton'
import useCustomers from 'src/hooks/getData/useCustomers'

function CreateSalesOrderReturnDrawer({ setOpenDrawer, openDrawer }) {
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId)
  const { customers } = useCustomers(tenantId)
  const selectedSO = useSelector(state => state.sales?.selectedSalesOrder) || {}

  const [loader, setLoader] = useState(false)

  const { currencies } = useCurrencies()
  const { warehouses } = useWarehouses(tenantId)

  const currency = useMemo(() => findObjectByCurrencyId(currencies, selectedSO?.currency), [currencies, selectedSO])

  const customer = useMemo(
    () => customers?.find(item => item?.customerId === selectedSO?.customerId) || {},
    [customers, selectedSO?.customerId]
  )
  const { subtotal = 0, totalQty = 0, discountValue = 0, taxes = [], otherCharges = [] } = selectedSO || {}

  const { reset, control, setValue, getValues, watch, handleSubmit, trigger } = useForm({
    defaultValues: selectedSO,
    mode: 'onChange'
  })
  let totalAmount = getValues('totalAmount')

  const [openCustomerDialog, setOpenCustomerDialog] = useState(false)

  const handleCustomerDialoge = () => {
    setOpenCustomerDialog(!openCustomerDialog)
  }
  const [open, setOpen] = useState(false)

  const [isAddNewModalOpen, setIsAddNewModalOpen] = useState(false)

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setOpen(false)
    reset()
  }

  const handleCancel = () => {
    setOpenDrawer(false)
    reset()
  }

  const handleUpdateOrderSave = async editsalesorder => {
    setOpenDrawer(false)
    reset()
  }

  const toggleDrawer = open => event => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return
    }
    setOpenDrawer(open)
  }

  return (
    <Drawer
      anchor='right'
      open={openDrawer}
      onClose={toggleDrawer(false)}
      sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 1000 } } }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: { xs: '20px', lg: '22px' },
          borderBottom: '1px solid #DBDBDB'
        }}
      >
        <Typography sx={{ fontSize: { xs: '16px', md: '20px' }, fontWeight: 500 }}>Create Sales Return</Typography>

        <IconButton
          sx={{ fontSize: '28px' }}
          color='primary'
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <Icon icon='tabler:x' />
        </IconButton>
      </Box>
      <Box sx={{ p: { xs: '20px', lg: '20px' } }}>
        <form onSubmit={handleSubmit(handleUpdateOrderSave)}>
          <Grid container spacing={5}>
            <Grid item xs={12}>
              <Grid container spacing={5}>
                <Grid item xs={12} sm={7} md={6.5} xl={7.1}>
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
                      <TableRow>
                        <CommonAddress data={customer} />
                      </TableRow>
                    </TableBody>
                  </CommonViewTable>
                </Grid>

                <Grid item xs={12} sm={5} md={4} lg={4} xl={3.7}>
                  <CommonViewTable>
                    <TableBody>
                      {' '}
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
                            {DateFunction(selectedSO?.orderDate)}
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
                            {DateFunction(selectedSO?.dueDate)}
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
                            Exp. Packing Date
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography className='data-value' sx={{ fontWeight: 400, lineHeight: '22px' }}>
                            {selectedSO?.expectedPackingDate ? DateFunction(selectedSO?.expectedPackingDate) : '-'}
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
                            {selectedSO?.paymentTerms ? selectedSO?.paymentTerms : '-'}
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
                            #{selectedSO?.orderNo}
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
                            Status
                          </Typography>
                        </TableCell>
                        <TableCell>{rowStatusChip(selectedSO?.status)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ width: '50%' }}>
                          <Typography
                            className='data-name'
                            sx={{
                              lineHeight: '22px'
                            }}
                          >
                            Payment Status
                          </Typography>
                        </TableCell>
                        <TableCell>{rowStatusChip(selectedSO?.paymentStatus)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ width: '50%' }}>
                          <Typography
                            className='data-name'
                            sx={{
                              lineHeight: '22px'
                            }}
                          >
                            Delivery Status
                          </Typography>
                        </TableCell>
                        <TableCell>{rowStatusChip(selectedSO?.deliveryStatus)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </CommonViewTable>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid
                container
                spacing={5}
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' }
                }}
              >
                <Grid item xs={12} sm={6} md={5} xl={3.5}>
                  <Typography
                    sx={{
                      fontSize: '13px',
                      fontWeight: 600,
                      lineHeight: '24px'
                    }}
                  >
                    Billing Address
                  </Typography>
                  <CommonViewTable>
                    <TableBody>
                      <ShowAddress data={selectedSO?.billingAddress} />
                    </TableBody>
                  </CommonViewTable>
                </Grid>
                <Grid item xs={0} sm={0} md={1.5} xl={3.6} sx={{ display: { xs: 'none', md: 'block' } }}></Grid>
                <Grid item xs={12} sm={5} md={4} lg={4} xl={3.7}>
                  {' '}
                  <Typography
                    sx={{
                      fontSize: '13px',
                      fontWeight: 600,
                      lineHeight: '24px'
                    }}
                  >
                    Delivery Address
                  </Typography>
                  <CommonViewTable>
                    <TableBody>
                      <ShowAddress data={selectedSO?.deliveryAddress} />
                    </TableBody>
                  </CommonViewTable>
                </Grid>{' '}
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <ReturnSalesOrderItemsTable
                control={control}
                currency={currency}
                allWarehouses={warehouses}
                getValues={getValues}
                trigger={trigger}
                watch={watch}
              />
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
                    {selectedSO?.customerNotes ? (
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
                        {/* <Typography sx={{ fontSize: '12px', color: '#818181', lineHeight: '22px' }}> */}

                        <pre
                          style={{
                            fontFamily: 'inherit',
                            whiteSpace: 'pre-wrap',
                            fontSize: '12px',
                            color: '#818181',
                            lineHeight: '22px'
                          }}
                        >
                          {selectedSO?.customerNotes}
                        </pre>

                        {/* </Typography>{' '} */}
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

                      {taxes
                        ?.filter(tax => tax.taxValue !== 0)
                        ?.map(item => (
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

                      {otherCharges
                        ?.filter(val => val.chargedAmount !== 0 || val.totalChargeValue !== 0)
                        ?.map(item => {
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
                                {item.taxes
                                  ?.filter(tax => tax.taxValue !== 0)
                                  .map(tax => (
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
                                {item.taxes
                                  ?.filter(tax => tax.taxValue !== 0)
                                  .map(tax => (
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
                  </Table>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <CommonViewTable>
                <TableBody>
                  {' '}
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
                        {selectedSO?.reference ? selectedSO?.reference : '-'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </CommonViewTable>
            </Grid>
            <Grid item xs={12}>
              {selectedSO?.termsAndConditions ? (
                <>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: 600
                    }}
                  >
                    Terms and Conditions
                  </Typography>
                  <Typography sx={{ fontSize: '12px', color: '#818181', lineHeight: '22px' }}>
                    <div>
                      <pre
                        style={{
                          fontFamily: 'inherit',
                          whiteSpace: 'pre-wrap'
                        }}
                      >
                        {selectedSO?.termsAndConditions}
                      </pre>
                    </div>
                  </Typography>
                </>
              ) : null}
            </Grid>
          </Grid>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: { xs: 'center', sm: 'start' },
              gap: { xs: '10px', md: '20px' },
              marginTop: { xs: '20px', sm: '25px' }
            }}
          >
            <Button variant='contained' type='submit' onClick={() => check(STATUS_DRAFT)}>
              Save
            </Button>

            <Button variant='outlined' onClick={() => handleCancel()}>
              Cancel
            </Button>
          </Box>
        </form>
      </Box>
      {isAddNewModalOpen && <AddCustomerPopup open={isAddNewModalOpen} setOpen={setIsAddNewModalOpen} />}
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity='error' variant='filled' sx={{ width: '100%' }}>
          Please enter all required data
        </Alert>
      </Snackbar>

      {loader ? (
        <Backdrop sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }} open={loader}>
          <CircularProgress color='inherit' />
        </Backdrop>
      ) : null}
    </Drawer>
  )
}

export default CreateSalesOrderReturnDrawer
