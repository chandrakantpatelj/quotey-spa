import Link from 'next/link'
import Router from 'next/router'
import React, { useState, useEffect } from 'react'
import PageHeader from 'src/@core/components/page-header'
import Button from '@mui/material/Button'
import {
  Box,
  Typography,
  Grid,
  IconButton,
  FormLabel,
  FormHelperText,
  Snackbar,
  Alert,
  Backdrop,
  Checkbox,
  CircularProgress,
  LinearProgress,
  Card
} from '@mui/material'
import CustomDatePicker from 'src/views/forms/form-elements/pickers/CustomDatePicker'
import CustomTextField from 'src/@core/components/mui/text-field'
import { Close } from '@mui/icons-material'
import {
  convertCurrency,
  findObjectByCurrencyId,
  safeNumber,
  parseDate,
  getLeadDays,
  checkAuthorizedRoute,
  trimStrings
} from 'src/common-functions/utils/UtilityFunctions'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import { useDispatch, useSelector } from 'react-redux'
import { useForm, Controller, useFieldArray, useWatch } from 'react-hook-form'
import { newSalesOrdersQuery } from 'src/@core/components/graphql/sales-order-queries'
import { fetchData, writeData } from 'src/common-functions/GraphqlOperations'
import { createAlert } from 'src/store/apps/alerts'
import CustomFilesUpload from 'src/views/forms/form-elements/custom-inputs/CustomFilesUpload'
import { UploadMultipleFileS3Api } from 'src/views/forms/form-elements/custom-inputs/UploadMultipleFileS3Api'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import {
  EDIT_SALES_INVOICE,
  SALES_INVOICE_PDF,
  STATUS_DRAFT,
  STATUS_ISSUED
} from 'src/common-functions/utils/Constants'
import AddCustomerPopup from 'src/common-components/AddCustomerPopup'
import { greaterThanOrEqual } from 'src/common-functions/utils/DecimalUtils'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import useCustomers from 'src/hooks/getData/useCustomers'
import useCountries from 'src/hooks/getData/useCountries'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import useWarehouses from 'src/hooks/getData/useWarehouses'
import usePaymentTerms from 'src/hooks/getData/usePaymnetTerms'
import useTradings from 'src/hooks/getData/useTradings'
import useProducts from 'src/hooks/getData/useProducts'
import CustomerViewSection from 'src/views/sales/customer/CustomerViewSection'
import SalesInvoiceItemsTable from 'src/views/sales/SalesInvoice/SalesInvoiceItemsTable'
import { updateSalesInvoiceMutation } from 'src/@core/components/graphql/sales-invoice-queries'
import { setUpdateInvoice } from 'src/store/apps/sales-invoices'
import SaveOtherSettingOtherOption from 'src/views/forms/form-elements/custom-inputs/SaveOtherSettingOtherOption'
import useOtherSettings from 'src/hooks/getData/useOtherSettings'

const AddressFields = {
  addressLine1: '',
  addressLine2: '',
  cityOrTown: '',
  state: '',
  postcode: '',
  country: ''
}

function EditSalesInvoice() {
  const router = Router
  const dispatch = useDispatch()

  const tenant = useSelector(state => state.tenants?.selectedTenant)
  const selectedInvoice = useSelector(state => state.salesInvoices?.selectedInvoice) || {}
  const { tenantId } = tenant || ''
  const { currencies } = useCurrencies()
  const { countries } = useCountries()
  const { customers, fetchCustomers } = useCustomers(tenantId)
  const { warehouses } = useWarehouses(tenantId)
  const { tradings, fetchTradings } = useTradings(tenantId)
  const { products, fetchProducts } = useProducts(tenantId)
  const { paymentTerms } = usePaymentTerms()

  const [open, setOpen] = useState(false)
  const userProfile = useSelector(state => state.userProfile)

  const currency = useSelector(state => state?.currencies?.selectedCurrency)
  const [selectedCurrency, setSelectedCurrency] = useState(currency)
  const [loader, setLoader] = React.useState(false)
  const [selectedPdFile, setSelectedPdFile] = useState([])
  const [invoiceObject, setInvoiceObject] = useState({})
  const [status, setStatus] = useState('')
  const [itemList, setItemList] = useState([])
  const [loading, setLoading] = useState(true)
  const [checked, setChecked] = useState(false)
  const { fetchOtherSettings } = useOtherSettings(tenantId)

  useEffect(() => {
    if (!tenantId) return
    const loadCustomers = async () => {
      fetchCustomers()
      fetchProducts()
      fetchTradings()
    }

    loadCustomers()
  }, [tenantId, fetchCustomers, fetchProducts, fetchTradings])

  async function getSalesOrder() {
    try {
      setLoading(true)
      const invoiceObject = await fetchData(newSalesOrdersQuery(tenantId))
      const { getAllPriceList, getAllConfirmedSalesOrders } = invoiceObject
      const distructObject = {
        priceLists: getAllPriceList,
        salesOrders: getAllConfirmedSalesOrders
      }
      setInvoiceObject(distructObject)
    } catch (error) {
      console.error('Error fetching data to edit sales invoice:', error)
    } finally {
      setLoading(false)
    }
  }

  const { priceLists = [], salesOrders = [] } = invoiceObject || {}

  const [separateOtherCharges, setSeparateOtherCharges] = useState([])

  useEffect(() => {
    setSeparateOtherCharges(selectedInvoice?.otherCharges)
  }, [selectedInvoice])

  useEffect(() => {
    if (
      checkAuthorizedRoute(EDIT_SALES_INVOICE, router, userProfile) &&
      (process.env.NEXT_PUBLIC_APP_ENV === 'dev' || process.env.NEXT_PUBLIC_APP_ENV === 'test')
    ) {
      getSalesOrder()
    } else {
      router.push('/unauthorized')
    }
  }, [tenantId])

  function findObjectById(array, countryId) {
    return array.find(obj => obj.name === countryId)
  }
  const [billingAddressCountry, setBillingAddressCountry] = useState(
    findObjectById(countries, selectedInvoice?.billingAddress?.country)
  )

  const [deliveryAddressCountry, setDeliveryAddressCountry] = useState(
    findObjectById(countries, selectedInvoice?.address?.country)
  )

  const {
    reset,
    control,
    getValues,
    setValue,
    trigger,
    watch,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: selectedInvoice,
    mode: 'onChange'
  })

  const trading = tenant?.tradingId || null
  useEffect(() => {
    // setValue('currency', currency)
    setSelectedCurrency(currency)
  }, [tenant, currency])

  const [enabledTaxes, setEnabledTaxes] = useState(selectedInvoice?.taxes)

  useEffect(() => {
    setValue('tradingId', selectedInvoice?.tradingId)
  }, [selectedInvoice])

  const getCurrency = watch('currency')
  const [typeOptions, setTypeOptions] = React.useState([])

  const resetOptions = () => {
    const staticType = [{ key: '%', value: 'PERCENTAGE' }]

    const currency = currencies?.find(val => val?.currencyId === getCurrency?.currencyId)
    const newOption = { key: currency?.symbol, value: 'VALUE' }
    const updatedOptions = staticType.slice()
    updatedOptions.push(newOption)

    setTypeOptions(updatedOptions)
  }

  useEffect(() => {
    resetOptions()
  }, [getCurrency, currencies])

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setOpen(false)
  }

  let totalAmount = getValues('totalAmount')

  const [isRequired, setIsRequired] = useState(false)

  useEffect(() => {
    const compare = greaterThanOrEqual(totalAmount || 0, 1000)
    setIsRequired(compare)
  }, [totalAmount])

  useEffect(() => {
    trigger([
      'billingAddress.addressLine1',
      'billingAddress.cityOrTown',
      'billingAddress.state',
      'billingAddress.postcode',
      'billingAddress.country'
    ])
  }, [isRequired])

  const [isAddNewModalOpen, setIsAddNewModalOpen] = useState(false)

  const handleAddNewCustomer = () => {
    setIsAddNewModalOpen(true)
  }

  const check = status => {
    setStatus(status)
    setOpen(true)
    const fieldName = Object.keys(errors)[0]
    const errName = document.getElementById(fieldName)
    errName?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
  }

  const handleNewOrderSave = async editInvoice => {
    setOpen(false)
    setLoader(true)
    const tenantId = tenant?.tenantId
    const currency = selectedCurrency?.currencyId || null
    const { shippingPreference, salesOrderNo, salesOrderNoPrefix, ...data } = editInvoice
    const salesInvoice = {
      ...data,
      status,
      totalAmount: safeNumber(editInvoice.totalAmount),
      discountValue: safeNumber(editInvoice.discountValue),
      invoiceDate: parseDate(editInvoice.invoiceDate),
      dueDate: parseDate(editInvoice.dueDate),
      invoiceItems: editInvoice?.invoiceItems?.map(item => {
        return {
          lineItemId: item?.lineItemId,
          itemId: item?.itemId,
          itemName: item?.itemName,
          itemGroup: item?.itemGroup,
          itemCodePrefix: item?.itemCodePrefix,
          itemCode: item?.itemCode,
          itemDescription: item?.itemDescription,
          packingUnit: {
            unit: item?.packingUnit?.unit,
            description: item?.packingUnit?.description,
            qtyPerUnit: item?.packingUnit?.qtyPerUnit,
            qty: item?.packingUnit?.qty
          },
          itemDimension: {
            length: item.itemDimension?.length,
            width: item.itemDimension?.width,
            height: item.itemDimension?.height,
            qty: item.itemDimension?.qty
          },
          qty: safeNumber(item?.qty),
          uom: item?.uom,
          originalPrice: item?.originalPrice,
          taxFree: item?.taxFree,
          taxInclusive: item?.taxInclusive,
          sellingPrice: item?.sellingPrice,
          discountPerUnit: item?.discountPerUnit,
          taxes: item?.taxes?.map(tax => ({
            taxId: tax?.taxId,
            taxType: tax?.taxType,
            taxName: tax?.taxName,
            taxRate: tax?.taxRate,
            taxAuthorityId: tax?.taxAuthorityId,
            taxValuePerUnit: tax?.taxValuePerUnit,
            taxValue: tax?.taxValue,
            taxValueCurrency: tax?.taxValueCurrency
          })),
          subtotal: safeNumber(item?.subtotal),
          totalDiscount: safeNumber(item?.totalDiscount),
          totalTax: safeNumber(item?.totalTax),
          totalNetAmount: safeNumber(item?.totalNetAmount),
          serviceDate: parseDate(item?.serviceDate)
        }
      }),
      otherCharges: separateOtherCharges,
      currency
    }
    delete salesInvoice.paymentStatus
    delete salesInvoice.balance
    delete salesInvoice.invoiceId
    delete salesInvoice.tenantId
    delete salesInvoice.invoiceNo
    delete salesInvoice.invoiceNoPrefix
    delete salesInvoice.totalClearedAmount
    delete salesInvoice.totalOutstandingAmount
    delete salesInvoice.createdDateTime
    delete salesInvoice.createdBy
    delete salesInvoice.modifiedDateTime
    delete salesInvoice.modifiedBy
    delete salesInvoice.deletedDateTime
    delete salesInvoice.deletedBy
    const otherSettings = await fetchOtherSettings()
    SaveOtherSettingOtherOption(tenantId, otherSettings, editInvoice, dispatch, 'salesInvoice')

    try {
      const response = await writeData(updateSalesInvoiceMutation(), {
        tenantId,
        invoiceId: editInvoice.invoiceId,
        salesInvoice
      })
      if (response.updateSalesInvoice) {
        if (selectedPdFile?.length) {
          await UploadMultipleFileS3Api(selectedPdFile, dispatch)
        }
        dispatch(setUpdateInvoice(response.updateSalesInvoice))
        dispatch(createAlert({ message: 'Sales invoice updated successfully !', type: 'success' }))
        reset()
        router.push('/sales/invoice/')
      } else {
        setLoader(false)
        dispatch(createAlert({ message: 'Failed to update sales invoice !', type: 'error' }))
      }
    } catch (error) {
      setLoader(false)
      console.error(error)
    }
  }

  const handleCancel = () => {
    router.push('/sales/invoice/')
    reset()
  }

  const handleSameBillingAddress = e => {
    setChecked(e.target.checked)
    const checked = e.target.checked

    if (checked) {
      setValue('deliveryAddress', getValues('billingAddress'))
    } else if (!checked) {
      setValue('deliveryAddress', AddressFields)
    }
    trigger(['deliveryAddress'])
  }
  const billingAddress = useWatch({ control, name: 'billingAddress' }) || getValues('billingAddress')
  const deliveryAddress = useWatch({ control, name: 'deliveryAddress' })
  const customerField = useWatch({ control, name: 'customerId' })

  const areAddressesSame = (a, b) => {
    return JSON.stringify(trimStrings(a)) === JSON.stringify(trimStrings(b))
  }

  useEffect(() => {
    setChecked(areAddressesSame(billingAddress, deliveryAddress))
  }, [billingAddress, deliveryAddress, customerField])

  const { update } = useFieldArray({
    control,
    name: 'invoiceItems'
  })
  const customer = watch('customerId')
  return (
    <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
      <PageHeader
        title={
          <Typography
            sx={{
              fontSize: { xs: '16px', md: '18px' },
              fontWeight: '500'
            }}
          >
            Edit Invoice
          </Typography>
        }
        button={
          <IconButton variant='outlined' color='default' component={Link} scroll={true} href={`/sales/invoice/`}>
            <Close sx={{ color: theme => theme.palette.primary.main }} />
          </IconButton>
          // )
        }
      />
      <PageWrapper>
        {loading ? (
          <LinearProgress />
        ) : (
          <Grid container spacing={{ xs: 6, md: 8, xl: 10 }}>
            <Grid item xs={12} md={12} lg={12} xl={8}>
              <form onSubmit={handleSubmit(handleNewOrderSave)}>
                <Grid container spacing={{ xs: 5 }}>
                  <Grid item xs={12} md={12} lg={12}>
                    <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                      {tenant?.useTradingInfo === true && tradings.length > 0 && selectedInvoice?.tradingId !== null ? (
                        <Grid item xs={6} sm={4} md={3}>
                          <Controller
                            name='tradingId'
                            control={control}
                            render={({ field }) => (
                              <CustomAutocomplete
                                {...field}
                                options={tradings || []}
                                getOptionLabel={option => option.tradingName || ''}
                                value={tradings?.find(option => option.tradingId === field.value) || null}
                                onChange={(event, newValue) => {
                                  field.onChange(newValue ? newValue.tradingId : null)
                                }}
                                sx={{ flexGrow: 1 }}
                                renderInput={params => <CustomTextField {...params} fullWidth label='Trading Name' />}
                              />
                            )}
                          />
                        </Grid>
                      ) : null}
                      <Grid item xs={6} sm={4} md={3}>
                        <Controller
                          name='salesOrderId'
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <CustomAutocomplete
                              id='salesOrderId'
                              {...field}
                              value={salesOrders.find(order => order.orderId === field.value) || null}
                              onChange={(event, newValue) => {
                                field.onChange(newValue)
                                const invoiceItems = newValue?.orderItems?.map(item => {
                                  const product = products?.find(val => val?.itemId === item?.itemId)
                                  return {
                                    ...item,
                                    dimensions: product?.dimensions || {},
                                    enableDimension: product?.enableDimension,
                                    enablePackingUnit: product?.enablePackingUnit,
                                    packingUnits: product?.packingUnits
                                  }
                                })
                                const customer = customers.find(
                                  customer => customer.customerId === newValue?.customerId
                                )
                                setValue('customerId', customer)
                                setEnabledTaxes(newValue?.taxes)
                                setValue('salesOrderNo', newValue?.orderNo)
                                setValue('saleOrderNoPrefix', newValue?.orderNoPrefix)
                                setValue('invoiceItems', invoiceItems)
                                setValue('invoiceDate', new Date(newValue?.orderDate))
                                setValue('paymentTerms', newValue?.paymentTerms)
                                setValue('dueDate', new Date(newValue?.dueDate))
                                setValue('notes', newValue?.notes)
                                setValue('discountType', newValue?.discountType)
                                setValue('discountValue', newValue?.discountValue)
                                setValue('customerNotes', newValue?.customerNotes)
                                setValue('billingAddress', newValue?.billingAddress)
                                setValue('deliveryAddress', newValue?.deliveryAddress)

                                setValue('tradingId', newValue?.tradingId)
                              }}
                              options={salesOrders || []}
                              isOptionEqualToValue={(option, value) => !!option && !!value && option.orderId === value}
                              getOptionLabel={option => `${option?.orderNo || ''}`}
                              renderOption={(props, option) => {
                                const customer = customers?.find(val => val?.customerId === option?.customerId)
                                return (
                                  <Box component='li' {...props} key={option?.orderId}>
                                    {`${option?.orderNo} (${customer?.customerName || ''})`}
                                  </Box>
                                )
                              }}
                              renderInput={params => (
                                <CustomTextField
                                  {...params}
                                  label='Sales Order'
                                  error={Boolean(errors.salesOrderId)}
                                  helperText={errors.salesOrderId ? 'Sales Order is required' : ''}
                                />
                              )}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={6} sm={4} md={3}>
                        <Controller
                          name='customerId'
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <CustomAutocomplete
                              id='customerId'
                              {...field}
                              value={customers.find(option => option.customerId === field.value) || null}
                              getOptionLabel={option => {
                                if (!option || typeof option === 'string') return option || ''
                                return `${option?.customerNoPrefix || ''} ${option?.customerNo || ''} - ${
                                  option?.customerName || ''
                                }`
                              }}
                              onChange={(e, newValue) => {
                                if (newValue?.customerId === 'add-new') {
                                  handleAddNewCustomer()
                                  return
                                }

                                let currentCustomerCurrency = currencies.find(
                                  cur => cur?.currencyId === newValue?.currencyId
                                )
                                let invoiceItems = getValues('invoiceItems') || []

                                if (currentCustomerCurrency && invoiceItems.length > 0) {
                                  invoiceItems.forEach((item, i) => {
                                    if (item.sellingPrice !== null) {
                                      let convCp = convertCurrency(
                                        selectedCurrency?.exchangeRate,
                                        1,
                                        currentCustomerCurrency?.exchangeRate,
                                        item.sellingPrice || 0
                                      ).toFixed(2)
                                      setValue(`invoiceItems[${i}].sellingPrice`, convCp)
                                      update(`invoiceItems[${i}].sellingPrice`, convCp)
                                    }
                                  })
                                }

                                field.onChange(newValue?.customerId || '')
                                setValue('deliveryAddress', newValue?.deliveryAddress || {})
                                setValue('billingAddress', newValue?.billingAddress || {})
                                setValue('paymentTerms', newValue?.paymentTerms || '')
                                setValue('shippingPreference', newValue?.shippingPreference || '')

                                const currency = findObjectByCurrencyId(currencies, newValue?.currencyId) || ''
                                setValue('currency', currency)
                                setSelectedCurrency(currency)

                                const filterlist = priceLists?.find(priceList =>
                                  priceList?.customers?.some(customer => customer.customerId === newValue?.customerId)
                                )
                                setItemList(filterlist?.itemList || [])

                                trigger(['paymentTerms', 'shippingPreference', 'currency'])

                                const leadDays = getLeadDays(newValue?.paymentTerms, paymentTerms)
                                if (leadDays > 0) {
                                  const newDate = new Date()
                                  newDate.setDate(newDate.getDate() + leadDays)
                                  setValue('dueDate', newDate)
                                } else if (leadDays === 0) {
                                  setValue('dueDate', new Date())
                                } else {
                                  setValue('dueDate', null)
                                }
                              }}
                              isOptionEqualToValue={(option, value) =>
                                !!option && !!value && option.customerId === value
                              }
                              renderOption={(props, option) => {
                                if (option?.customerId === 'add-new') {
                                  return (
                                    <li
                                      {...props}
                                      style={{ display: 'flex', justifyContent: 'center', fontWeight: 'bold' }}
                                    >
                                      <Button
                                        variant='contained'
                                        color='primary'
                                        sx={{ width: '100%' }}
                                        onClick={handleAddNewCustomer}
                                      >
                                        + Add New
                                      </Button>
                                    </li>
                                  )
                                }

                                return (
                                  <li {...props}>
                                    {option?.customerNoPrefix || ''} {option?.customerNo || ''} -{' '}
                                    {option?.customerName || ''}
                                  </li>
                                )
                              }}
                              options={[{ customerName: 'Add New', customerId: 'add-new' }, ...customers]}
                              renderInput={params => (
                                <CustomTextField
                                  {...params}
                                  label='Customer'
                                  error={Boolean(errors.customerId)}
                                  helperText={errors.customerId ? 'Customer is required' : ''}
                                />
                              )}
                            />
                          )}
                        />
                      </Grid>{' '}
                      <Grid item xs={6} sm={4} md={3}>
                        <Controller
                          name='currency'
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <CustomAutocomplete
                              id='currency'
                              {...field}
                              options={currencies}
                              disableClearable
                              fullWidth
                              openOnFocus={true}
                              getOptionLabel={option => {
                                if (typeof option === 'string') {
                                  return option
                                }
                                // Regular option
                                else return `${option?.currencyId}`
                              }}
                              isOptionEqualToValue={(option, value) => option.currencyId === value?.currencyId}
                              renderOption={(props, option) => (
                                <Box component='li' {...props}>
                                  {option.symbol} - {option.currencyId}
                                </Box>
                              )}
                              onChange={(e, newValue) => {
                                field.onChange(newValue)
                                let invoiceItems = getValues('invoiceItems')
                                let depositAmount = getValues('depositAmount')
                                let discountValue = getValues('discountValue')
                                let discountType = getValues('discountType')
                                let totalAmount = getValues('totalAmount')

                                if (selectedCurrency) {
                                  if (invoiceItems?.length > 0) {
                                    invoiceItems.map((item, i) => {
                                      if (item.sellingPrice !== null || selectedCurrency !== '') {
                                        let convCp = convertCurrency(
                                          selectedCurrency?.exchangeRate,
                                          1,
                                          newValue?.exchangeRate,
                                          item.sellingPrice || 0
                                        ).toFixed(2)
                                        setValue(`invoiceItems[${i}].sellingPrice`, convCp)
                                      }
                                    })
                                    if (discountValue !== null || discountType !== 'VALUE' || selectedCurrency !== '') {
                                      let convdiscountTypeCp = convertCurrency(
                                        selectedCurrency?.exchangeRate,
                                        1,
                                        newValue?.exchangeRate,
                                        discountValue || 0
                                      ).toFixed(2)
                                      setValue(`discountValue`, convdiscountTypeCp)
                                    }

                                    if (totalAmount !== null || selectedCurrency !== '') {
                                      let convtotalAmountCp = convertCurrency(
                                        selectedCurrency?.exchangeRate,
                                        1,
                                        newValue?.exchangeRate,
                                        totalAmount || 0
                                      ).toFixed(2)
                                      setValue(`totalAmount`, convtotalAmountCp)
                                    }
                                    if (depositAmount !== null || selectedCurrency !== '') {
                                      let convdepositAmountCp = convertCurrency(
                                        selectedCurrency?.exchangeRate,
                                        1,
                                        newValue?.exchangeRate,
                                        depositAmount || 0
                                      ).toFixed(2)
                                      setValue(`depositAmount`, convdepositAmountCp)
                                    }
                                  }
                                }

                                setSelectedCurrency(newValue)
                              }}
                              renderInput={params => (
                                <CustomTextField
                                  {...params}
                                  fullWidth
                                  label='Currency'
                                  error={Boolean(errors.currency)}
                                  {...(errors.currency && { helperText: 'Currency is required' })}
                                />
                              )}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} md={12} lg={12}>
                    <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                      <Grid item xs={12} sm={4} md={3}>
                        <Controller
                          name='invoiceDate'
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <CustomDatePicker
                              label={'Date'}
                              fullWidth={true}
                              date={field.value && new Date(field.value)}
                              onChange={date => {
                                field.onChange(date)
                                // setValue('paymentDate', newValue)
                              }}
                              error={Boolean(errors?.invoiceDate)}
                            />
                          )}
                        />
                        {errors?.invoiceDate && <FormHelperText error>Order Date is required</FormHelperText>}
                      </Grid>
                      <Grid item xs={12} sm={4} md={3}>
                        <Controller
                          name='paymentTerms'
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <CustomAutocomplete
                              id='paymentTerms'
                              {...field}
                              onChange={(event, newValue) => {
                                field.onChange(newValue)
                                const leadDays = getLeadDays(newValue, paymentTerms)
                                if (leadDays > 0) {
                                  const newDate = new Date()
                                  newDate.setDate(newDate.getDate() + leadDays)
                                  setValue('dueDate', newDate)
                                } else if (leadDays === 0) {
                                  setValue('dueDate', new Date())
                                } else {
                                  setValue('dueDate', null)
                                }
                              }}
                              options={paymentTerms?.map(item => item?.paymentTerms)}
                              getOptionLabel={option => option || ''}
                              renderInput={params => (
                                <CustomTextField
                                  {...params}
                                  label='Payment Term'
                                  error={Boolean(errors.paymentTerms)}
                                  {...(errors.paymentTerms && { helperText: 'Payment Term is required' })}
                                />
                              )}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4} md={3}>
                        <Controller
                          name='dueDate'
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <CustomDatePicker
                              //disabled={true}
                              label={'Due Date'}
                              fullWidth={true}
                              date={field.value && new Date(field.value)}
                              onChange={field.onChange}
                              error={Boolean(errors?.dueDate)}
                            />
                          )}
                        />
                        {errors?.dueDate && <FormHelperText error>Due Date is required</FormHelperText>}
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} md={12} lg={12}>
                    <Grid container spacing={{ xs: 2, sm: 12, md: 12, lg: 12, xl: 12 }}>
                      <Grid item xs={12} sm={6} id='billingAddress'>
                        <FormLabel sx={{ fontSize: '15px', fontWeight: 500, lineHeight: '40px' }}>
                          Billing Address
                        </FormLabel>
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={12} md={6}>
                            <Controller
                              name='billingAddress.addressLine1'
                              control={control}
                              rules={{ required: isRequired }}
                              render={({ field }) => (
                                <CustomTextField
                                  // id='billingAddress.addressLine1'
                                  {...field}
                                  fullWidth
                                  label='Address Line 1'
                                  error={Boolean(errors.billingAddress?.addressLine1)}
                                  {...(errors.billingAddress?.addressLine1 && {
                                    helperText: ' Address Line 1 is required'
                                  })}
                                />
                              )}
                            />
                          </Grid>
                          <Grid item xs={12} sm={12} md={6}>
                            <Controller
                              name='billingAddress.addressLine2'
                              control={control}
                              render={({ field }) => (
                                <CustomTextField
                                  // id='billingAddress.addressLine2'
                                  fullWidth
                                  label='Address Line 2'
                                  {...field}
                                />
                              )}
                            />
                          </Grid>
                          <Grid item xs={12} sm={12} md={6}>
                            <Controller
                              name='billingAddress.cityOrTown'
                              control={control}
                              rules={{ required: isRequired }}
                              render={({ field }) => (
                                <CustomTextField
                                  // id='billingAddress.cityOrTown'
                                  {...field}
                                  fullWidth
                                  label='City / Town'
                                  error={Boolean(errors.billingAddress?.cityOrTown)}
                                  {...(errors.billingAddress?.cityOrTown && { helperText: 'City is required' })}
                                />
                              )}
                            />
                          </Grid>{' '}
                          <Grid item xs={12} sm={12} md={6}>
                            <Controller
                              name='billingAddress.postcode'
                              control={control}
                              rules={{ required: isRequired }}
                              render={({ field }) => (
                                <CustomTextField
                                  // id='billingAddress.postcode'
                                  {...field}
                                  fullWidth
                                  label='Pin Code'
                                  error={Boolean(errors.billingAddress?.postcode)}
                                  {...(errors.billingAddress?.postcode && { helperText: 'Pin Code is required' })}
                                />
                              )}
                            />
                          </Grid>
                          <Grid item xs={12} sm={12} md={6}>
                            <Controller
                              name='billingAddress.state'
                              control={control}
                              rules={{ required: isRequired }}
                              render={({ field }) => (
                                <CustomAutocomplete
                                  {...field}
                                  disableClearable
                                  options={billingAddressCountry?.states?.length ? billingAddressCountry?.states : []}
                                  getOptionLabel={option => option.name || ''}
                                  getOptionSelected={(option, value) => {
                                    return option.name === value.name
                                  }}
                                  isOptionEqualToValue={(option, value) => option.name === value?.name}
                                  value={{ name: field.value }}
                                  onChange={(event, newValue) => {
                                    field.onChange(newValue?.name)
                                  }}
                                  renderInput={params => (
                                    <CustomTextField
                                      // id='billingAddress.country'
                                      {...params}
                                      label='Select State'
                                      fullWidth
                                      error={Boolean(errors.billingAddress?.state)}
                                      {...(errors.billingAddress?.state && { helperText: 'State is required' })}
                                    />
                                  )}
                                />
                              )}
                            />
                          </Grid>
                          <Grid item xs={12} sm={12} md={6}>
                            <Controller
                              name='billingAddress.country'
                              control={control}
                              rules={{ required: isRequired }}
                              render={({ field }) => (
                                <CustomAutocomplete
                                  {...field}
                                  disableClearable
                                  options={countries}
                                  getOptionLabel={option => option.name || ''}
                                  getOptionSelected={(option, value) => {
                                    return option.name === value.name
                                  }}
                                  isOptionEqualToValue={(option, value) => option.name === value?.name}
                                  value={{ name: field.value }}
                                  onChange={(event, newValue) => {
                                    field.onChange(newValue?.name)
                                    setValue('billingAddress.state', '')
                                    setBillingAddressCountry(newValue)
                                  }}
                                  renderInput={params => (
                                    <CustomTextField
                                      // id='billingAddress.country'
                                      {...params}
                                      label='Select Country'
                                      fullWidth
                                      error={Boolean(errors.billingAddress?.country)}
                                      {...(errors.billingAddress?.country && { helperText: ' Country is required' })}
                                    />
                                  )}
                                />
                              )}
                            />
                          </Grid>
                          <Grid item xs={12} sm={12}>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                              <Checkbox
                                size='small'
                                checked={checked}
                                onChange={e => handleSameBillingAddress(e)}
                                sx={{ p: '0px' }}
                              />
                              <Typography sx={{ fontSize: '13px' }}>
                                Set Delivery Address Same As Billing Address
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormLabel sx={{ fontSize: '15px', fontWeight: 500, lineHeight: '40px' }}>
                          Delivery Address
                        </FormLabel>

                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={12} md={6}>
                            <Controller
                              name='deliveryAddress.addressLine1'
                              control={control}
                              render={({ field }) => <CustomTextField {...field} fullWidth label='Address Line 1' />}
                            />
                          </Grid>
                          <Grid item xs={12} sm={12} md={6}>
                            <Controller
                              name='deliveryAddress.addressLine2'
                              control={control}
                              render={({ field }) => (
                                <CustomTextField
                                  fullWidth
                                  label='Address Line 2'
                                  {...field}
                                  onChange={field.onChange}
                                />
                              )}
                            />
                          </Grid>{' '}
                          <Grid item xs={12} sm={12} md={6}>
                            <Controller
                              name='deliveryAddress.cityOrTown'
                              control={control}
                              render={({ field }) => <CustomTextField {...field} fullWidth label='City / Town' />}
                            />
                          </Grid>
                          <Grid item xs={12} sm={12} md={6}>
                            <Controller
                              name='deliveryAddress.postcode'
                              control={control}
                              render={({ field }) => <CustomTextField {...field} fullWidth label='Pin Code' />}
                            />
                          </Grid>
                          <Grid item xs={12} sm={12} md={6}>
                            <Controller
                              name='deliveryAddress.state'
                              control={control}
                              render={({ field }) => (
                                <CustomAutocomplete
                                  {...field}
                                  disableClearable
                                  options={
                                    !deliveryAddressCountry?.states?.length <= 0 ? deliveryAddressCountry?.states : []
                                  }
                                  getOptionLabel={option => option.name || ''}
                                  getOptionSelected={(option, value) => {
                                    return option.name === value.name
                                  }}
                                  isOptionEqualToValue={(option, value) => option.name === value?.name}
                                  value={{ name: field.value }}
                                  onChange={(event, newValue) => {
                                    field.onChange(newValue?.name)
                                  }}
                                  renderInput={params => <CustomTextField {...params} label='Select State' fullWidth />}
                                />
                              )}
                            />
                          </Grid>
                          <Grid item xs={12} sm={12} md={6}>
                            <Controller
                              name='deliveryAddress.country'
                              control={control}
                              render={({ field }) => (
                                <CustomAutocomplete
                                  {...field}
                                  disableClearable
                                  options={countries}
                                  getOptionLabel={option => option.name || ''}
                                  isOptionEqualToValue={(option, value) => option.name === value?.name}
                                  value={{ name: field.value }}
                                  onChange={(event, newValue) => {
                                    field.onChange(newValue?.name)
                                    setValue('deliveryAddress.state', '')
                                    setDeliveryAddressCountry(newValue)
                                  }}
                                  renderInput={params => (
                                    <CustomTextField {...params} label='Select Country' fullWidth />
                                  )}
                                />
                              )}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} lg={12} xl={12} id='invoiceItems'>
                    <SalesInvoiceItemsTable
                      items={products}
                      control={control}
                      errors={errors}
                      currency={selectedCurrency}
                      getValues={getValues}
                      setValue={setValue}
                      trigger={trigger}
                      typeOptions={typeOptions}
                      allWarehouses={warehouses}
                      watch={watch}
                      itemList={itemList}
                      separateOtherCharges={separateOtherCharges}
                      setSeparateOtherCharges={setSeparateOtherCharges}
                      enabledTaxes={enabledTaxes}
                      arrayName={'invoiceItems'}
                      invoiceObject={invoiceObject}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomFilesUpload
                      setValue={setValue}
                      selectedPdFile={selectedPdFile}
                      setSelectedPdFile={setSelectedPdFile}
                      folderName={SALES_INVOICE_PDF}
                    />
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
                    Save As Draft
                  </Button>
                  <Button variant='contained' type='submit' onClick={() => check(STATUS_ISSUED)}>
                    Save As Issued
                  </Button>
                  <Button variant='outlined' onClick={handleCancel}>
                    Cancel
                  </Button>
                </Box>
              </form>
            </Grid>
            {customer?.customerId && (
              <Grid item xs={0} md={0} lg={12} xl={4} sx={{ display: { xs: 'none', lg: 'block' } }}>
                <Card sx={{ p: 6, width: '100%' }}>
                  <Box sx={{ mb: 5 }}>
                    <Alert severity='info' sx={{ color: 'rgba(0,0,0,0.8)' }}>
                      Customer Details
                    </Alert>
                  </Box>
                  <CustomerViewSection customerId={customer?.customerId} defaultTab='notes' />
                </Card>
              </Grid>
            )}
          </Grid>
        )}
      </PageWrapper>
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
    </ErrorBoundary>
  )
}

export default EditSalesInvoice
