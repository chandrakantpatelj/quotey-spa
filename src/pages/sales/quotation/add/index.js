import Link from 'next/link'
import Router from 'next/router'
import React, { useState, useEffect, useMemo } from 'react'
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
  LinearProgress
} from '@mui/material'
import CustomDatePicker from 'src/views/forms/form-elements/pickers/CustomDatePicker'
import CustomTextField from 'src/@core/components/mui/text-field'
import { Close } from '@mui/icons-material'
import {
  convertCurrency,
  findObjectByCurrencyId,
  safeNumber,
  parseDate,
  trimStrings,
  getLeadDays,
  checkAuthorizedRoute
} from 'src/common-functions/utils/UtilityFunctions'
import { preference } from 'src/@fake-db/autocomplete'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import { useDispatch, useSelector } from 'react-redux'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { createQuotationMutation, newQuotationsQuery } from 'src/@core/components/graphql/quotation-queries'
import { fetchData, writeData } from 'src/common-functions/GraphqlOperations'
import { createAlert } from 'src/store/apps/alerts'
import CustomFilesUpload from 'src/views/forms/form-elements/custom-inputs/CustomFilesUpload'
import { UploadMultipleFileS3Api } from 'src/views/forms/form-elements/custom-inputs/UploadMultipleFileS3Api'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import SaveOtherSettingOtherOption from 'src/views/forms/form-elements/custom-inputs/SaveOtherSettingOtherOption'
import {
  CREATE_QUOTATION,
  QUOTATION_PDF,
  STATUS_CONFIRMED,
  STATUS_DRAFT,
  STATUS_SENT
} from 'src/common-functions/utils/Constants'
import SalesOrderItemsTable from 'src/views/sales/SalesOrder/SalesOrderItemsTable'
import { setAddQuotation } from 'src/store/apps/quotations'
import useCustomers from 'src/hooks/getData/useCustomers'
import AddCustomerPopup from 'src/common-components/AddCustomerPopup'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import useCountries from 'src/hooks/getData/useCountries'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import usePaymentTerms from 'src/hooks/getData/usePaymnetTerms'
import useWarehouses from 'src/hooks/getData/useWarehouses'
import { useSalesModule } from 'src/hooks/getData/useSalesModule'
import useTradings from 'src/hooks/getData/useTradings'
import useOtherSettings from 'src/hooks/getData/useOtherSettings'

const AddressFields = {
  addressLine1: '',
  addressLine2: '',
  cityOrTown: '',
  state: '',
  postcode: '',
  country: ''
}

const DefaultQuotation = {
  schemaVersion: '1.0',
  tradingId: null,
  customerId: null,
  quotationNoPrefix: '',
  reference: '',
  quotationDate: new Date(),
  dueDate: new Date(),
  deliveryDate: '',
  paymentTerms: '',
  status: '',
  shippingPreference: '',
  currency: '',
  billingAddress: AddressFields,
  deliveryAddress: AddressFields,
  quotationItems: [
    {
      itemId: '',
      itemName: '',
      itemCodePrefix: '',
      itemCode: '',
      itemDescription: '',
      itemDimension: {
        length: 0,
        width: 0,
        height: 0,
        qty: 0
      },
      packingUnit: {
        unitType: '',
        description: '',
        qtyPerUnit: 0
      },
      qty: 0,
      uom: '',
      sellingPrice: 0,
      subtotal: 0,
      discount: 0,
      warehouseId: '',
      serviceDate: new Date()
    }
  ],
  otherCharges: [
    {
      key: '',
      chargeName: '',
      accountReceivableAccountId: null,
      accruedOtherRevenueAccountId: null,
      cashOtherRevenueAccountId: null,
      chargedAmount: 0,
      totalChargeValue: 0,
      includingTax: true,
      chargedAmountCurrency: '',
      taxes: [
        {
          key: '',
          taxName: '',
          taxRate: 0,
          taxAuthorityId: null,
          accountReceivableAccountId: null,
          accruedTaxCollectedAccountId: null,
          cashTaxCollectedAccountId: null,
          taxValue: 0,
          taxValueCurrency: ''
        }
      ]
    }
  ],
  taxes: [
    {
      key: '',
      taxName: '',
      taxRate: 0,
      taxAuthorityId: null,
      accountReceivableAccountId: null,
      accruedTaxCollectedAccountId: null,
      cashTaxCollectedAccountId: null,
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
  paymentId: null,
  paymentMethod: null,
  paymentReference: '',
  depositAmount: 0,
  totalAmount: 0,
  files: []
}

function Quotation() {
  const router = Router
  const dispatch = useDispatch()
  const [open, setOpen] = useState(false)
  const tenant = useSelector(state => state.tenants?.selectedTenant)
  const { tenantId } = tenant || ''
  const [isAuthorized, setIsAuthorized] = useState(false)
  const { tradings, fetchTradings } = useTradings(tenantId)
  const { customers } = useCustomers(tenantId)
  const { currencies } = useCurrencies()
  const { countries } = useCountries()
  const { paymentTerms } = usePaymentTerms()
  const { warehouses } = useWarehouses(tenantId)
  const currency = useSelector(state => state?.currencies?.selectedCurrency)
  const [selectedCurrency, setSelectedCurrency] = useState(currency)
  const [loader, setLoader] = React.useState(false)
  const [selectedPdFile, setSelectedPdFile] = useState([])
  const [quotationObject, setQuotationObject] = useState({})
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [checked, setChecked] = useState(false)
  const [itemList, setItemList] = useState([])
  const userProfile = useSelector(state => state.userProfile)

  const { salesModules } = useSalesModule(tenantId)
  const { fetchOtherSettings } = useOtherSettings(tenantId)

  async function getQuotations() {
    try {
      setLoading(true)
      const quotationObject = await fetchData(newQuotationsQuery(tenantId))
      const otherSettings = await fetchOtherSettings()
      fetchTradings()
      const { getAllPriceList } = quotationObject

      setQuotationObject({
        settings: otherSettings,
        priceLists: getAllPriceList
      })
    } catch (error) {
      console.error('Error fetching data for quotation:', error)
    } finally {
      setLoading(false)
    }
  }

  const { settings = [], priceLists = [] } = quotationObject || {}
  const { taxes = [], otherCharges = [] } = salesModules || {}

  const [separateOtherCharges, setSeparateOtherCharges] = useState([])
  const enabledTaxes = useMemo(
    () =>
      taxes
        .filter(tax => tax.enabled)
        .map(({ enabled, ...rest }) => ({ ...rest, taxValueCurrency: currency?.currencyId })),
    [taxes]
  )
  useEffect(() => {
    const enabledTaxesData = otherCharges.map(charges => {
      const { enabled, taxes, ...remaningField } = charges
      return {
        ...remaningField,
        taxes: taxes.filter(tax => tax.enabled).map(({ enabled, ...rest }) => rest)
      }
    })

    setSeparateOtherCharges(enabledTaxesData)
  }, [quotationObject])

  useEffect(() => {
    getQuotations()
  }, [tenantId])

  const [isAddNewModalOpen, setIsAddNewModalOpen] = useState(false)

  const handleAddNewCustomer = () => {
    setIsAddNewModalOpen(true)
  }

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

  useEffect(() => {
    const defaultValue = {
      ...DefaultQuotation,
      taxes: taxes.map(item => ({ ...DefaultQuotation.taxes[0], ...item })),
      tradingId: trading,
      billingAddress: {
        ...AddressFields,
        state: tenant?.billingAddress?.state,
        country: tenant?.billingAddress?.country
      },
      deliveryAddress: {
        ...AddressFields,
        state: tenant?.address?.state,
        country: tenant?.address?.country
      }
    }
    reset(defaultValue)
    setValue('currency', currency)
    setSelectedCurrency(currency)
  }, [tenant, currency])

  useEffect(() => {
    setValue('tradingId', trading)
  }, [tenant, trading])

  useEffect(() => {
    setBillingAddressCountry(findObjectById(countries, tenant?.billingAddress?.country))
    setDeliveryAddressCountry(findObjectById(countries, tenant?.address?.country))
  }, [tenant, countries])

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
  const check = status => {
    setStatus(status)
    setOpen(true)
    const fieldName = Object.keys(errors)[0]
    const errName = document.getElementById(fieldName)
    errName?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
  }

  const handleNewQuotationSave = async newquotation => {
    setOpen(false)
    setLoader(true)
    const tenantId = tenant?.tenantId
    const currency = selectedCurrency?.currencyId || null

    const quotation = {
      ...newquotation,
      status,
      totalAmount: safeNumber(newquotation.totalAmount),
      discountValue: safeNumber(newquotation.discountValue),
      customerId: newquotation.customerId?.customerId,
      quotationDate: parseDate(newquotation.quotationDate),
      dueDate: parseDate(newquotation.dueDate),
      quotationItems: newquotation?.quotationItems?.map(item => {
        return {
          itemId: item?.itemId,
          itemName: item?.itemName,
          qty: safeNumber(item?.qty),
          itemCodePrefix: item?.itemCodePrefix,
          sellingPrice: item?.sellingPrice,
          itemCode: item?.itemCode,
          uom: item?.uom,
          itemDescription: item?.itemDescription,
          serviceDate: parseDate(item?.serviceDate),
          subtotal: safeNumber(item?.subtotal),
          discount: safeNumber(item?.discount),
          itemDimension: {
            length: item.itemDimension?.length,
            width: item.itemDimension?.width,
            height: item.itemDimension?.height,
            qty: item.itemDimension?.qty
          },
          packingUnit: {
            unit: item?.packingUnit?.unit,
            qty: safeNumber(item?.packingUnit?.qty),
            qtyPerUnit: safeNumber(item?.packingUnit?.qtyPerUnit),
            description: item?.packingUnit?.description
          },
          warehouseId: item?.warehouseId
        }
      }),
      currency,
      otherCharges: separateOtherCharges
    }

    // delete quotation?.deliveryDate
    delete quotation?.paymentStatus
    delete quotation.balance
    delete quotation?.paymentDate

    SaveOtherSettingOtherOption(tenantId, settings, newquotation, dispatch, 'quotation')
    try {
      const response = await writeData(createQuotationMutation(), { tenantId, quotation })
      if (response.createQuotation) {
        if (selectedPdFile?.length !== 0) {
          await UploadMultipleFileS3Api(selectedPdFile, dispatch)
        }
        dispatch(setAddQuotation(response.createQuotation))
        dispatch(createAlert({ message: 'Quotation created successfully !', type: 'success' }))
        router.push('/sales/quotation')
      } else {
        setLoader(false)
        dispatch(createAlert({ message: 'Quotation creation failed !', type: 'error' }))
      }
    } catch (error) {
      setLoader(false)
      console.error(error)
    }
  }
  const handleCancel = () => {
    router.push('/sales/quotation')
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

  const areAddressesSame = (a, b) => {
    return JSON.stringify(trimStrings(a)) === JSON.stringify(trimStrings(b))
  }

  useEffect(() => {
    setChecked(areAddressesSame(billingAddress, deliveryAddress))
  }, [billingAddress, deliveryAddress])

  useEffect(() => {
    if (checkAuthorizedRoute(CREATE_QUOTATION, router, userProfile)) {
      setIsAuthorized(true)
    } else {
      setIsAuthorized(false)
    }
  }, [tenantId, userProfile])

  return (
    <ErrorBoundary tenantId={tenant?.tenantId} dispatch={dispatch}>
      <PageHeader
        title={
          <Typography
            sx={{
              fontSize: { xs: '16px', md: '18px' },
              fontWeight: '500'
            }}
          >
            Add Quotation
          </Typography>
        }
        button={
          <IconButton
            variant='outlined'
            color='default'
            sx={{ fontSize: '21px' }}
            component={Link}
            scroll={true}
            href={`/sales/quotation`}
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
          <form onSubmit={handleSubmit(handleNewQuotationSave)}>
            <Grid container spacing={{ xs: 5 }}>
              <Grid item xs={12} md={12} lg={9}>
                <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                  {tenant?.useTradingInfo === true && tradings?.length > 0 ? (
                    <Grid item xs={6} sm={4} md={3}>
                      <Controller
                        name='tradingId'
                        control={control}
                        rules={{ required: false }}
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
                            let orderItems = getValues('orderItems')
                            if (currentCustomerCurrency) {
                              if (orderItems?.length > 0) {
                                orderItems.forEach((item, i) => {
                                  if (item.sellingPrice !== null) {
                                    let convCp = convertCurrency(
                                      selectedCurrency?.exchangeRate,
                                      1,
                                      currentCustomerCurrency?.exchangeRate,
                                      item.sellingPrice || 0
                                    ).toFixed(2)
                                    setValue(`orderItems[${i}].sellingPrice`, convCp)
                                    update(`orderItems[${i}].sellingPrice`, convCp)
                                  }
                                })
                              }
                            }

                            field.onChange(newValue)
                            setValue('deliveryAddress', newValue?.deliveryAddress)
                            setValue('billingAddress', newValue?.billingAddress)
                            setValue('paymentTerms', newValue?.paymentTerms)
                            setValue('shippingPreference', newValue?.shippingPreference)
                            const currency = findObjectByCurrencyId(currencies, newValue?.currencyId) || ''
                            setValue('currency', currency)
                            setSelectedCurrency(currency)
                            const filterlist = priceLists?.find(priceList =>
                              priceList?.customers?.some(customer => customer.customerId === newValue?.customerId)
                            )
                            setItemList(filterlist?.itemList)
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
                </Grid>
              </Grid>
              <Grid item xs={12} md={12} lg={9}>
                <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                  <Grid item xs={6} sm={4} md={3}>
                    <Controller
                      name='quotationDate'
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <CustomDatePicker
                          //disabled={true}
                          label={'Date'}
                          fullWidth={true}
                          date={field.value}
                          onChange={field.onChange}
                          error={Boolean(errors?.quotationDate)}
                        />
                      )}
                    />
                    {errors?.quotationDate && <FormHelperText error>Quotation Date is required</FormHelperText>}
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
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
                          renderOption={(props, option) => (
                            <Box component='li' {...props}>
                              {option.symbol} - {option.currencyId}
                            </Box>
                          )}
                          onChange={(e, newValue) => {
                            let quotationItems = getValues('quotationItems')
                            let depositAmount = getValues('depositAmount')
                            let discountValue = getValues('discountValue')
                            let discountType = getValues('discountType')
                            let totalAmount = getValues('totalAmount')
                            field.onChange(newValue)
                            if (selectedCurrency) {
                              if (quotationItems?.length > 0) {
                                quotationItems.map((item, i) => {
                                  if (item.sellingPrice !== null || item.sellingPrice !== '') {
                                    let convCp = convertCurrency(
                                      selectedCurrency?.exchangeRate,
                                      1,
                                      newValue?.exchangeRate,
                                      item.sellingPrice
                                    ).toFixed(2)
                                    setValue(`quotationItems[${i}].sellingPrice`, convCp)
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

              <Grid item xs={12} md={12} lg={9}>
                <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                  <Grid item xs={12} sm={4} md={3}>
                    <Controller
                      name='reference'
                      control={control}
                      rules={{ required: false }}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          fullWidth
                          label='Reference'
                          error={Boolean(errors.reference)}
                          {...(errors.reference && { helperText: 'Payment Reference is required' })}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <Controller
                      name='shippingPreference'
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <CustomAutocomplete
                          id='shippingPreference'
                          {...field}
                          onChange={(event, newValue) => {
                            field.onChange(newValue)
                          }}
                          options={preference || []}
                          getOptionLabel={option => option || ''}
                          renderInput={params => (
                            <CustomTextField
                              {...params}
                              label='Shipping Preference'
                              error={Boolean(errors.shippingPreference)}
                              {...(errors.shippingPreference && { helperText: 'Shipping Preference is required' })}
                            />
                          )}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
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
                </Grid>
              </Grid>

              <Grid item xs={12} md={12} lg={9}>
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
                          rules={{ required: true }}
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
                          rules={{ required: false }}
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
                          rules={{ required: true }}
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
                          name='billingAddress.country'
                          control={control}
                          rules={{ required: true }}
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
                      </Grid>{' '}
                      <Grid item xs={12} sm={12} md={6}>
                        <Controller
                          name='billingAddress.state'
                          control={control}
                          rules={{ required: true }}
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
                          name='billingAddress.postcode'
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <CustomTextField
                              // id='billingAddress.postcode'
                              {...field}
                              fullWidth
                              label='Zip Code'
                              error={Boolean(errors.billingAddress?.postcode)}
                              {...(errors.billingAddress?.postcode && { helperText: 'ZIP Code is required' })}
                            />
                          )}
                        />
                      </Grid>{' '}
                      <Grid item xs={12} sm={12}>
                        {/* <FormControlLabel
                          control={<Checkbox onChange={e => handleSameBillingAddress(e)} />}
                          label='Set Delivery Address Same As Billing Address'
                          size='small'
                        /> */}
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
                  <Grid item xs={12} sm={6} id='deliveryAddress'>
                    <FormLabel sx={{ fontSize: '15px', fontWeight: 500, lineHeight: '40px' }}>
                      Delivery Address
                    </FormLabel>

                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={12} md={6}>
                        <Controller
                          name='deliveryAddress.addressLine1'
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <CustomTextField
                              {...field}
                              fullWidth
                              label='Address Line 1'
                              error={Boolean(errors.deliveryAddress?.addressLine1)}
                              {...(errors.deliveryAddress?.addressLine1 && {
                                helperText: ' Address Line 1 is required'
                              })}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={12} md={6}>
                        <Controller
                          name='deliveryAddress.addressLine2'
                          control={control}
                          rules={{ required: false }}
                          render={({ field }) => (
                            <CustomTextField fullWidth label='Address Line 2' {...field} onChange={field.onChange} />
                          )}
                        />
                      </Grid>{' '}
                      <Grid item xs={12} sm={12} md={6}>
                        <Controller
                          name='deliveryAddress.cityOrTown'
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <CustomTextField
                              {...field}
                              fullWidth
                              label='City / Town'
                              error={Boolean(errors.deliveryAddress?.cityOrTown)}
                              {...(errors.deliveryAddress?.cityOrTown && { helperText: 'City is required' })}
                            />
                          )}
                        />
                      </Grid>{' '}
                      <Grid item xs={12} sm={12} md={6}>
                        <Controller
                          name='deliveryAddress.country'
                          control={control}
                          rules={{ required: true }}
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
                                <CustomTextField
                                  {...params}
                                  label='Select Country'
                                  fullWidth
                                  error={Boolean(errors.deliveryAddress?.country)}
                                  {...(errors.deliveryAddress?.country && { helperText: ' Country is required' })}
                                />
                              )}
                            />
                          )}
                        />
                      </Grid>{' '}
                      <Grid item xs={12} sm={12} md={6}>
                        <Controller
                          name='deliveryAddress.state'
                          control={control}
                          rules={{ required: true }}
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
                              renderInput={params => (
                                <CustomTextField
                                  {...params}
                                  label='Select State'
                                  fullWidth
                                  error={Boolean(errors.deliveryAddress?.state)}
                                  {...(errors.deliveryAddress?.state && { helperText: 'State is required' })}
                                />
                              )}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={12} md={6}>
                        <Controller
                          name='deliveryAddress.postcode'
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <CustomTextField
                              {...field}
                              fullWidth
                              label='Zip Code'
                              error={Boolean(errors.deliveryAddress?.postcode)}
                              {...(errors.deliveryAddress?.postcode && { helperText: 'ZIP Code is required' })}
                            />
                          )}
                        />
                      </Grid>{' '}
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} lg={12} xl={11} id='quotationItems'>
                <SalesOrderItemsTable
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
                  arrayName={'quotationItems'}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomFilesUpload
                  setValue={setValue}
                  selectedPdFile={selectedPdFile}
                  setSelectedPdFile={setSelectedPdFile}
                  folderName={QUOTATION_PDF}
                />
              </Grid>
            </Grid>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: { xs: 'center', sm: 'start' },
                gap: { xs: '10px', md: '20px' },
                marginTop: { xs: '25px', sm: '30px' }
              }}
            >
              <Button variant='contained' type='submit' onClick={() => check(STATUS_DRAFT)}>
                Save
              </Button>

              <Button variant='contained' type='submit' onClick={() => check(STATUS_SENT)}>
                Save And Send
              </Button>
              <Button variant='contained' type='submit' onClick={() => check(STATUS_CONFIRMED)}>
                Save As Confirmed
              </Button>
              <Button variant='outlined' onClick={handleCancel}>
                Cancel
              </Button>
            </Box>
          </form>
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

export default Quotation
