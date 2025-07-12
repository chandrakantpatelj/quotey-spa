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
  trimStrings,
  generateId
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
  CREATE_SALES_INVOICE,
  SALES_INVOICE_PDF,
  SCHEMA_VERSION,
  STATUS_DRAFT,
  STATUS_ISSUED
} from 'src/common-functions/utils/Constants'
import AddCustomerPopup from 'src/common-components/AddCustomerPopup'
import { greaterThanOrEqual } from 'src/common-functions/utils/DecimalUtils'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import useCustomers from 'src/hooks/getData/useCustomers'
import useCountries from 'src/hooks/getData/useCountries'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import usePaymentTerms from 'src/hooks/getData/usePaymnetTerms'
import useTradings from 'src/hooks/getData/useTradings'
import useProducts from 'src/hooks/getData/useProducts'
import CustomerViewSection from 'src/views/sales/customer/CustomerViewSection'
import SalesInvoiceItemsTable from 'src/views/sales/SalesInvoice/SalesInvoiceItemsTable'
import { createSalesInvoiceMutation } from 'src/@core/components/graphql/sales-invoice-queries'
import { setAddInvoice } from 'src/store/apps/sales-invoices'
import SaveOtherSettingOtherOption from 'src/views/forms/form-elements/custom-inputs/SaveOtherSettingOtherOption'
import useOtherSettings from 'src/hooks/getData/useOtherSettings'
import usePriceLists from 'src/hooks/getData/usePriceLists'

const AddressFields = {
  addressLine1: '',
  addressLine2: '',
  cityOrTown: '',
  state: '',
  postcode: '',
  country: ''
}

const DefaultInvoice = {
  schemaVersion: SCHEMA_VERSION,
  tradingId: null,
  customerId: null,
  salesOrderId: null,
  salesOrderNo: null,
  saleOrderNoPrefix: null,
  invoiceDate: new Date(),
  dueDate: new Date(),
  paymentTerms: '',
  status: '',
  currency: '',
  billingAddress: AddressFields,
  deliveryAddress: AddressFields,
  invoiceItems: [
    {
      lineItemId: generateId(),
      itemId: '',
      itemName: '',
      itemGroup: '',
      itemCodePrefix: '',
      itemCode: '',
      serviceDate: null,
      enableDimension: false,
      enablePackingUnit: false,
      dimensions: {},
      itemDescription: '',
      itemDimension: {
        length: 0,
        width: 0,
        height: 0,
        qty: 0
      },
      packingUnit: {
        unit: '',
        description: '',
        qtyPerUnit: 0,
        qty: 0
      },
      qty: 0,
      uom: '',
      originalPrice: 0,
      taxFree: false,
      taxInclusive: true,
      sellingPrice: 0,
      discountPerUnit: 0,
      taxes: [],
      subtotal: 0,
      totalDiscount: 0,
      totalTax: 0,
      totalNetAmount: 0
    }
  ],
  otherCharges: [
    {
      chargeId: '',
      chargeType: '',
      chargeName: '',
      chargedAmount: 0,
      totalChargeValue: 0,
      includingTax: true,
      chargedAmountCurrency: '',
      taxes: [
        {
          taxId: '',
          taxType: '',
          taxName: '',
          taxRate: 0,
          taxAuthorityId: null,
          taxValue: 0,
          taxValueCurrency: ''
        }
      ]
    }
  ],
  taxes: [
    {
      taxId: null,
      taxType: null,
      taxName: '',
      taxRate: 0,
      taxAuthorityId: null,
      taxValue: 0,
      taxValueCurrency: ''
    }
  ],
  customerNotes: '',
  notes: '',
  termsAndConditions: '',
  totalQty: 0,
  subtotal: 0,
  totalTax: 0,
  discountType: 'PERCENTAGE',
  discountValue: 0,
  totalDiscount: 0,
  totalOtherCharges: 0,
  totalOtherChargesTax: 0,
  totalAmount: 0,
  files: []
}

function NewInvoice() {
  const router = Router
  const dispatch = useDispatch()

  const tenant = useSelector(state => state.tenants?.selectedTenant)
  const { tenantId } = tenant || ''

  const { currencies } = useCurrencies()
  const { countries } = useCountries()
  const { customers } = useCustomers(tenantId)
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
  const { fetchPriceLists, priceLists } = usePriceLists(tenantId)

  async function getSalesOrder() {
    try {
      setLoading(true)
      fetchPriceLists()
      fetchProducts()
      fetchTradings()
      const invoiceObject = await fetchData(newSalesOrdersQuery(tenantId))
      const { getAllConfirmedSalesOrders } = invoiceObject

      setInvoiceObject({
        salesOrders: getAllConfirmedSalesOrders
      })
    } catch (error) {
      console.error('Error fetching data to create sales invoice:', error)
    } finally {
      setLoading(false)
    }
  }

  const { salesOrders = [] } = invoiceObject || {}
  const [separateOtherCharges, setSeparateOtherCharges] = useState([])

  const [enabledTaxes, setEnabledTaxes] = useState([])

  useEffect(() => {
    if (
      checkAuthorizedRoute(CREATE_SALES_INVOICE, router, userProfile) &&
      (process.env.NEXT_PUBLIC_APP_ENV === 'dev' || process.env.NEXT_PUBLIC_APP_ENV === 'test')
    ) {
      getSalesOrder()
    } else {
      router.push('/unauthorized')
    }
  }, [tenantId, fetchPriceLists, fetchProducts, fetchTradings])

  function findObjectById(array, countryId) {
    return array.find(obj => obj.name === countryId)
  }
  const [billingAddressCountry, setBillingAddressCountry] = useState(
    findObjectById(countries, tenant?.billingAddress?.country)
  )

  const [deliveryAddressCountry, setDeliveryAddressCountry] = useState(
    findObjectById(countries, tenant?.address?.country)
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
    mode: 'onChange'
  })

  const trading = tenant?.tradingId || null
  const [otherSettings, setOtherSettings] = useState()
  useEffect(() => {
    const setDefaultData = async () => {
      const otherSettings = await fetchOtherSettings()
      setOtherSettings(otherSettings)
      const { salesInvoiceTermsAndConditions = [], salesInvoiceCustomerNotes = [], uom = [] } = otherSettings ?? {}

      const defaultValue = {
        ...DefaultInvoice,
        taxes: enabledTaxes,
        tradingId: trading,
        currency: selectedCurrency,
        billingAddress: {
          ...AddressFields,
          country: tenant?.billingAddress?.country
        },
        deliveryAddress: {
          ...AddressFields,
          country: tenant?.address?.country
        },
        customerNotes:
          salesInvoiceCustomerNotes.length > 0 ? salesInvoiceCustomerNotes[salesInvoiceCustomerNotes.length - 1] : '',
        termsAndConditions:
          salesInvoiceTermsAndConditions.length > 0
            ? salesInvoiceTermsAndConditions[salesInvoiceTermsAndConditions.length - 1]
            : ''
      }
      reset(defaultValue)
      setValue('currency', currency)
      setSelectedCurrency(currency)
    }

    setDefaultData()
  }, [tenant, currency, fetchOtherSettings])

  useEffect(() => {
    setValue('tradingId', trading)
  }, [tenant, trading])

  useEffect(() => {
    setBillingAddressCountry(findObjectById(countries, tenant?.billingAddress?.country))
    setDeliveryAddressCountry(findObjectById(countries, tenant?.address?.country))
  }, [tenant, countries])

  const getCurrency = watch('currency')

  let salesOrderId = watch('salesOrderId')

  useEffect(() => {
    setSeparateOtherCharges(salesOrderId?.otherCharges)
  }, [salesOrderId])

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

  const handleNewOrderSave = async newSalesInvoice => {
    setOpen(false)
    setLoader(true)

    const tenantId = tenant?.tenantId
    const currency = selectedCurrency?.currencyId || null
    const { ...data } = newSalesInvoice
    const salesInvoice = {
      ...data,
      status,
      totalAmount: safeNumber(newSalesInvoice.totalAmount),
      discountValue: safeNumber(newSalesInvoice.discountValue),
      customerId: newSalesInvoice.customerId?.customerId,
      invoiceDate: parseDate(newSalesInvoice.invoiceDate),
      salesOrderId: newSalesInvoice.salesOrderId.orderId,
      dueDate: parseDate(newSalesInvoice.dueDate),
      invoiceItems: newSalesInvoice?.invoiceItems?.map(item => {
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
    SaveOtherSettingOtherOption(tenantId, otherSettings, newSalesInvoice, dispatch, 'salesInvoice')

    try {
      const response = await writeData(createSalesInvoiceMutation(), { tenantId, salesInvoice })
      if (response.createSalesInvoice) {
        if (selectedPdFile?.length) {
          await UploadMultipleFileS3Api(selectedPdFile, dispatch)
        }
        dispatch(setAddInvoice(response.createSalesInvoice))
        dispatch(createAlert({ message: 'Sales invoice created successfully !', type: 'success' }))
        reset()
        router.push('/sales/invoice/')
      } else {
        setLoader(false)
        dispatch(createAlert({ message: 'Sales invoice creation failed !', type: 'error' }))
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
            New Invoice
          </Typography>
        }
        button={
          <IconButton
            variant='outlined'
            color='default'
            sx={{ fontSize: '21px' }}
            component={Link}
            scroll={true}
            href={`/sales/invoice/`}
          >
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
                      {tenant?.useTradingInfo === true && tradings.length > 0 ? (
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
                          rules={{ required: false }}
                          render={({ field }) => (
                            <CustomAutocomplete
                              id='salesOrderId'
                              {...field}
                              value={salesOrders.find(order => order.orderId === field.value)}
                              onChange={(event, newValue) => {
                                field.onChange(newValue)
                                const invoiceItems = newValue?.orderItems?.map(item => {
                                  const product = products?.find(val => val?.itemId === item?.itemId)
                                  return {
                                    ...item,
                                    dimensions: product?.dimensions || {},
                                    enableDimension: product?.enableDimension,
                                    enablePackingUnit: product?.enablePackingUnit,
                                    packingUnits: product?.packingUnits,
                                    taxFree: item?.taxFree ?? false,
                                    taxInclusive: item?.taxInclusive ?? true
                                  }
                                })
                                const customer = customers.find(
                                  customer => customer.customerId === newValue?.customerId
                                )
                                setValue('customerId', customer)
                                setEnabledTaxes(newValue?.taxes)
                                // setSeparateOtherCharges(newValue?.otherCharges)
                                setValue('salesOrderNo', newValue?.orderNo)
                                setValue('saleOrderNoPrefix', newValue?.orderNoPrefix)
                                setValue('invoiceItems', invoiceItems)
                                setValue('invoiceDate', new Date(newValue?.orderDate))
                                setValue('paymentTerms', newValue?.paymentTerms)
                                setValue('dueDate', new Date(newValue?.dueDate))
                                setValue('notes', newValue?.notes)
                                setValue('discountType', newValue?.discountType)
                                setValue('discountValue', newValue?.discountValue)
                                setValue('billingAddress', newValue?.billingAddress)
                                setValue('deliveryAddress', newValue?.deliveryAddress)

                                setValue('tradingId', newValue?.tradingId)
                                // trigger(['customerId'])
                              }}
                              options={salesOrders || []}
                              isOptionEqualToValue={(option, value) => option.orderId === value.orderId}
                              getOptionLabel={option => `${option?.orderNo || ''}`}
                              renderOption={(props, option) => {
                                const customer = customers?.find(val => val?.customerId === option?.customerId)
                                return (
                                  <Box component='li' {...props} key={option?.orderId}>
                                    {`${option?.orderNo} (${customer?.customerName})`}
                                  </Box>
                                )
                              }}
                              renderInput={params => <CustomTextField {...params} label='Sales Order' />}
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
                              getOptionLabel={option => {
                                if (typeof option === 'string') {
                                  return option
                                } else
                                  return `${option?.customerNoPrefix || ''}  ${option?.customerNo || ''} - ${
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
                                let invoiceItems = getValues('invoiceItems')
                                if (currentCustomerCurrency) {
                                  if (invoiceItems?.length > 0) {
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
                                }

                                field.onChange(newValue)
                                setValue('deliveryAddress', newValue?.deliveryAddress)
                                setValue('billingAddress', newValue?.billingAddress)
                                setValue('paymentTerms', newValue?.paymentTerms)
                                const currency = findObjectByCurrencyId(currencies, newValue?.currencyId) || ''
                                setValue('currency', currency)
                                setSelectedCurrency(currency)
                                const filterlist = priceLists?.find(priceList =>
                                  priceList?.customers?.some(customer => customer.customerId === newValue?.customerId)
                                )
                                setItemList(filterlist?.itemList)
                                trigger(['paymentTerms', 'currency'])

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
                              isOptionEqualToValue={(option, value) => option.customerId === value.customerId}
                              renderOption={(props, option) => {
                                // Check if the option is "Add New Customer"
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

                                // Normal customer option rendering
                                return (
                                  <li {...props}>
                                    {option?.customerNoPrefix || ''}
                                    {option?.customerNo || ''}-{option?.customerName || ''}
                                  </li>
                                )
                              }}
                              options={[{ customerName: 'Add New', customerId: 'add-new' }, ...customers]}
                              renderInput={params => (
                                <CustomTextField
                                  {...params}
                                  label='Customer'
                                  error={Boolean(errors.customerId)}
                                  {...(errors.customerId && { helperText: 'Customer is required' })}
                                />
                              )}
                            />
                          )}
                        />
                      </Grid>{' '}
                      <Grid item xs={4} sm={4} md={3}>
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
                      <Grid item xs={4} sm={4} md={3}>
                        <Controller
                          name='invoiceDate'
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <CustomDatePicker
                              label={'Date'}
                              fullWidth={true}
                              date={field.value}
                              onChange={date => {
                                field.onChange(date)
                                // setValue('paymentDate', newValue)
                              }}
                              error={Boolean(errors?.invoiceDate)}
                            />
                          )}
                        />
                        {errors?.invoiceDate && <FormHelperText error>Invoice Date is required</FormHelperText>}
                      </Grid>
                      <Grid item xs={4} sm={4} md={3}>
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
                      <Grid item xs={4} sm={4} md={3}>
                        <Controller
                          name='dueDate'
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <CustomDatePicker
                              //disabled={true}
                              label={'Due Date'}
                              fullWidth={true}
                              date={field.value}
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

export default NewInvoice
