// ** Next Import
import { Close } from '@mui/icons-material'
import {
  Alert,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  FormHelperText,
  Grid,
  IconButton,
  LinearProgress,
  Snackbar,
  Typography
} from '@mui/material'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import {
  createPurchaseOrderAndMoveToFirstStageMutation,
  createPurchaseOrderMutation
} from 'src/@core/components/graphql/purchase-order-queries'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import { preference } from 'src/@fake-db/autocomplete'
import AddVendorPopup from 'src/common-components/AddVendorPopup'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { CREATE_PURCHASE_ORDER, PURCHASE_ORDER_PDF, SCHEMA_VERSION } from 'src/common-functions/utils/Constants'
import { multiplyDecimalsWithoutRounding } from 'src/common-functions/utils/DecimalUtils'
import {
  checkAuthorizedRoute,
  findObjectByCurrencyId,
  getExchangeRate,
  getLeadDays,
  parseDate,
  safeNumber
} from 'src/common-functions/utils/UtilityFunctions'
import useCountries from 'src/hooks/getData/useCountries'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import usePaymentTerms from 'src/hooks/getData/usePaymnetTerms'
import useProducts from 'src/hooks/getData/useProducts'
import usePurchaseSettings from 'src/hooks/getData/usePurchaseSettings'
import useTradings from 'src/hooks/getData/useTradings'
import useVendors from 'src/hooks/getData/useVendors'
import useWarehouses from 'src/hooks/getData/useWarehouses'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import { createAlert } from 'src/store/apps/alerts'
import { resetPurchasePackage } from 'src/store/apps/purchase-packages'
import { setAddPurchaseOrder } from 'src/store/apps/purchaseorder'
import CustomFilesUpload from 'src/views/forms/form-elements/custom-inputs/CustomFilesUpload'
import { UploadMultipleFileS3Api } from 'src/views/forms/form-elements/custom-inputs/UploadMultipleFileS3Api'
import CustomDatePicker from 'src/views/forms/form-elements/pickers/CustomDatePicker'
import ItemsTable from 'src/views/purchase/purchase-order/ItemsTable'

function PurchaseOrder() {
  const router = useRouter()
  const userProfile = useSelector(state => state.userProfile)

  const [isAuthorized, setIsAuthorized] = useState(false)
  const dispatch = useDispatch()
  const tenant = useSelector(state => state.tenants?.selectedTenant) || {}
  const { tenantId = '' } = tenant
  const { tradings, fetchTradings, tradingLoading } = useTradings(tenantId)

  const trading = tenant?.tradingId || null

  const { paymentTerms } = usePaymentTerms()
  const { currencies, loading: currencyLoading } = useCurrencies()
  const { countries, loading: countriesLoading } = useCountries()
  const { vendors, loading: vendorLoading } = useVendors(tenantId)
  const { warehouses, loading: warehouseLoading } = useWarehouses(tenantId)
  const { products, fetchProducts } = useProducts(tenantId)

  const { purchaseModuleSetting: purchaseSettingData, loading: purchaseSettingLoading } = usePurchaseSettings(tenantId)

  // const purchaseSettingData = useMemo(
  //   () => purchaseModuleSetting?.filter(item => item?.latestVersion) || [],
  //   [purchaseModuleSetting]
  // )

  const loading =
    vendorLoading || warehouseLoading || currencyLoading || countriesLoading || purchaseSettingLoading || tradingLoading

  const currency = useSelector(state => state?.currencies?.selectedCurrency) || {}
  const [loader, setLoader] = useState(false)
  const [paymentTerm, setPaymentTerm] = useState([])
  const [selectedPdFile, setSelectedPdFile] = useState([])
  const [vendorExchangeRate, setVendorExchangeRate] = useState(1)

  const [vendorCurrency, setVendorCurrency] = useState(currency)

  const [submitType, setSubmitType] = useState(null)

  function findObjectById(array, countryId) {
    return array.find(obj => obj.name === countryId)
  }

  const [billingAddressCountry, setBillingAddressCountry] = useState(
    findObjectById(countries, tenant?.billingAddress?.country)
  )

  const [deliveryAddressCountry, setDeliveryAddressCountry] = useState(
    findObjectById(countries, warehouses[0]?.address?.country)
  )

  useEffect(() => {
    if (!tenantId) return
    fetchProducts()
    fetchTradings()
  }, [tenantId, fetchProducts, fetchTradings])

  const localCurrency = currency

  const defaultWarehouse = warehouses[0]

  const orderData = {
    schemaVersion: SCHEMA_VERSION,
    tradingId: trading,
    purchaseType: purchaseSettingData?.find(item => item?.default)?.purchaseType,
    vendorId: null,
    warehouseId: defaultWarehouse,
    reference: '',
    orderDate: new Date(),
    dueDate: new Date(),
    deliverType: 'warehouse',
    currencyExchangeRate: 1,
    billingAddress: {
      cityOrTown: tenant?.billingAddress?.cityOrTown,
      state: tenant?.billingAddress?.state,
      postcode: tenant?.billingAddress?.postcode,
      addressLine1: tenant?.billingAddress?.addressLine1,
      addressLine2: tenant?.billingAddress?.addressLine2,
      country: tenant?.billingAddress?.country
    },
    deliveryAddress: {
      addressLine1: defaultWarehouse?.address?.addressLine1 || '',
      addressLine2: defaultWarehouse?.address?.addressLine2 || '',
      cityOrTown: defaultWarehouse?.address?.cityOrTown || '',
      state: defaultWarehouse?.address?.state || '',
      postcode: defaultWarehouse?.address?.postcode || '',
      country: defaultWarehouse?.address?.country || ''
    },
    deliveryDate: new Date(),
    status: 'DRAFT',
    paymentTerms: '',
    shippingPreference: '',
    notes: '',
    termsAndConditions: '',
    vendorNotes: '',
    currency: '',
    totalAmount: 0,
    files: [],
    orderItems: [
      {
        itemId: '',
        itemCode: '',
        itemCodePrefix: '',
        itemName: '',
        enableDimension: false,
        enablePackingUnit: false,
        dimensions: {},
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
        packingUnits: [],
        qty: 0,
        uom: '',
        itemDescription: '',
        purchasePrice: 0,
        localPurchasePrice: 0,
        subtotal: 0.0,
        subTotalInLocal: 0.0
      }
    ],
    taxes: [
      {
        taxId: '',
        taxType: '',
        taxName: '',
        taxRate: 0.0,
        taxAuthorityId: '',
        isManuallyEntered: false,
        paidToTaxAuthority: false,
        paidToMainVendor: false,
        vendorId: '',
        eligibleForTaxCredit: false,
        taxValue: 0.0,
        inLocalCurrency: true,
        taxValueCurrency: ''
      }
    ],
    expenses: [
      {
        expenseId: '',
        expenseType: '',
        expenseName: '',
        vendorId: '',
        paidToMainVendor: false,
        accountableForOrderTaxes: false,
        additionalTaxes: false,
        eligibleForTaxCredit: false,
        distributionMethod: '',
        expenseValue: 0.0,
        taxValue: 0.0,
        inLocalCurrency: false,
        expenseValueCurrency: ''
      }
    ],
    subtotal: 0.0,
    subTotalInLocal: 0.0,
    subtotalCurrency: '',
    totalAmount: 0.0,
    totalAmountCurrency: ''
  }

  const {
    reset,
    control,
    setValue,
    getValues,
    trigger,
    watch,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: orderData,
    mode: 'all'
  })

  const { update } = useFieldArray({
    control,
    name: 'orderItems'
  })

  let purchaseType = watch('purchaseType')
  let orderDate = watch('orderDate')
  let selectedPaymentTerms = watch('paymentTerms')
  let mainVendor = watch('vendorId')

  const defaultPurchaseType = purchaseSettingData?.find(item => item?.default)?.purchaseType

  const settingPurchaseData = purchaseSettingData?.find(item => item?.purchaseType === purchaseType)

  const filteredVendors = vendors?.filter(item => settingPurchaseData?.currencies?.includes(item?.currencyId))

  useEffect(() => {
    setValue('purchaseType', defaultPurchaseType)
  }, [purchaseSettingData])

  const { taxes = [], expenses = [] } = settingPurchaseData || {}

  const filterTaxes = taxes
    ?.filter(tax => tax?.enabled)
    ?.map(item => ({
      taxId: item?.taxId,
      taxType: item?.taxType,
      taxName: item?.taxName,
      taxRate: item?.taxRate,
      isManuallyEntered: item?.isManuallyEntered,
      taxAuthorityId: item?.taxAuthorityId,
      paidToTaxAuthority: item?.paidToTaxAuthority,
      paidToMainVendor: item?.paidToMainVendor,
      vendorId: item?.vendorId,
      eligibleForTaxCredit: item?.eligibleForTaxCredit,
      taxValue: 0.0,
      inLocalCurrency: item?.inLocalCurrency,
      taxValueCurrency: item?.inLocalCurrency ? localCurrency?.currencyId : vendorCurrency?.currencyId
    }))
  const filterExpenses = expenses
    ?.filter(expense => expense?.enabled)
    ?.map(item => {
      const vendor = vendors?.find(val => val?.vendorId === item?.vendorId) || {}
      return {
        expenseId: item?.expenseId,
        expenseType: item?.expenseType,
        expenseName: item?.expenseName,
        vendorId: item?.vendorId,
        paidToMainVendor: item?.paidToMainVendor,
        accountableForOrderTaxes: item?.accountableForOrderTaxes,
        additionalTaxes: item?.additionalTaxes,
        eligibleForTaxCredit: item?.eligibleForTaxCredit,
        distributionMethod: item?.distributionMethod,
        expenseValue: 0.0,
        taxValue: 0.0,
        inLocalCurrency: item?.inLocalCurrency,
        expenseValueCurrency: vendor?.currencyId || localCurrency?.currencyId
      }
    })

  useEffect(() => {
    setValue('taxes', filterTaxes)
    setValue('expenses', filterExpenses)
  }, [settingPurchaseData])

  const [isAddNewModalOpen, setIsAddNewModalOpen] = useState(false)

  const handleAddNewVendor = () => {
    setIsAddNewModalOpen(true)
  }

  const orderItems = watch('orderItems')

  let allTaxes = getValues('taxes')
  let allExpenses = getValues('expenses')

  let currencyExchangeRate = watch('currencyExchangeRate')

  const [open, setOpen] = useState(false)

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }

    setOpen(false)
  }

  const check = status => {
    // setStatus(status)
    setOpen(true)
    const fieldName = Object.keys(errors)[0]
    const errName = document.getElementById(fieldName)
    errName?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
  }

  const handleNewOrderSave = async newOrder => {
    setOpen(false)
    setLoader(true)
    const { vendorId, warehouseId, orderDate, dueDate, deliveryDate } = newOrder

    const purchaseOrder = {
      ...newOrder,
      // status: status,
      vendorId: vendorId?.vendorId,
      warehouseId: warehouseId?.warehouseId,
      orderDate: parseDate(orderDate),
      dueDate: parseDate(dueDate),
      deliveryDate: parseDate(deliveryDate),
      currency: newOrder?.currency?.currencyId,
      orderItems: newOrder?.orderItems?.map(
        ({
          subTotalInLocal,
          packingUnits,
          enablePackingUnit,
          localPurchasePrice,
          enableDimension,
          dimensions,
          itemDimension = {},
          qty,
          purchasePrice,
          ...rest
        }) => ({
          ...rest,
          itemDimension: {
            length: safeNumber(itemDimension.length),
            width: safeNumber(itemDimension.width),
            height: safeNumber(itemDimension.height),
            qty: safeNumber(itemDimension.qty)
          },
          qty: safeNumber(qty),
          purchasePrice: safeNumber(purchasePrice)
        })
      ),

      taxes: newOrder?.taxes?.map(({ inLocalCurrency, ...rest }) => rest),
      expenses: newOrder?.expenses?.map(({ inLocalCurrency, ...rest }) => rest),
      subtotal: settingPurchaseData?.subtotalInLocalCurrency
        ? safeNumber(newOrder?.subTotalInLocal)
        : safeNumber(newOrder?.subtotal),
      totalAmount: safeNumber(newOrder?.totalAmount)
    }

    delete purchaseOrder?.subTotalInLocal
    if (submitType === 'confirmed') {
      try {
        const response = await writeData(createPurchaseOrderAndMoveToFirstStageMutation(), { tenantId, purchaseOrder })
        if (response.createPurchaseOrderAndMoveToFirstStage) {
          if (selectedPdFile?.length) {
            await UploadMultipleFileS3Api(selectedPdFile, dispatch)
          }
          dispatch(resetPurchasePackage())
          dispatch(setAddPurchaseOrder(response.createPurchaseOrderAndMoveToFirstStage))
          dispatch(createAlert({ message: 'PurchaseOrder created and confirmed successfully !', type: 'success' }))
          router.push('/purchases/purchase-order/')
        } else {
          setLoader(false)
          const errorMessage = response?.errors?.[0] ? response.errors[0].message : 'PurchaseOrder creation failed !'
          dispatch(createAlert({ message: errorMessage, type: 'error' }))
        }
      } catch (error) {
        console.error('error', error)
        setLoader(false)
      }
    } else {
      try {
        const response = await writeData(createPurchaseOrderMutation(), { tenantId, purchaseOrder })
        if (response.createPurchaseOrder) {
          if (selectedPdFile?.length) {
            await UploadMultipleFileS3Api(selectedPdFile, dispatch)
          }
          dispatch(setAddPurchaseOrder(response.createPurchaseOrder))
          dispatch(createAlert({ message: 'PurchaseOrder created successfully !', type: 'success' }))
          router.push('/purchases/purchase-order/')
        } else {
          setLoader(false)
          const errorMessage = response?.errors?.[0] ? response.errors[0].message : 'PurchaseOrder creation failed !'
          dispatch(createAlert({ message: errorMessage, type: 'error' }))
        }
      } catch (error) {
        console.error('error', error)
        setLoader(false)
      }
    }
  }
  const handleCancel = () => {
    router.push('/purchases/purchase-order/')
    reset()
  }

  useEffect(() => {
    if (checkAuthorizedRoute(CREATE_PURCHASE_ORDER, router, userProfile)) {
      setIsAuthorized(true)
    } else {
      setIsAuthorized(false)
    }
  }, [tenantId, userProfile])

  if (!isAuthorized) {
    return null
  }

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
            New Purchase Order
          </Typography>
        }
        button={
          <IconButton color='default' component={Link} scroll={true} href={`/purchases/purchase-order/`}>
            <Close sx={{ color: theme => theme.palette.primary.main }} />
          </IconButton>
        }
      />
      <PageWrapper>
        {loading ? (
          <LinearProgress />
        ) : (
          <form onSubmit={handleSubmit(handleNewOrderSave)}>
            <Grid container spacing={{ xs: 5 }}>
              <Grid item xs={12} md={12} xl={9}>
                <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                  <Grid item xs={6} sm={4} md={3}>
                    <Controller
                      name='purchaseType'
                      control={control}
                      render={({ field }) => (
                        <CustomAutocomplete
                          {...field}
                          options={purchaseSettingData}
                          getOptionLabel={option => option?.purchaseType || ''}
                          value={purchaseSettingData?.find(option => option.purchaseType === field?.value) || null}
                          onChange={(e, newValue) => {
                            field.onChange(newValue.purchaseType)
                          }}
                          disableClearable
                          renderInput={params => <CustomTextField {...params} fullWidth label='Purchase Type' />}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={12} xl={9}>
                <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                  {tenant?.useTradingInfo === true && tradings?.length > 0 ? (
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
                      name='vendorId'
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <CustomAutocomplete
                          id='vendorId'
                          {...field}
                          fullWidth
                          getOptionLabel={option => {
                            if (typeof option === 'string') {
                              return option
                            } else
                              return `${option?.vendorNoPrefix || ''}  ${option?.vendorNo || ''} - ${
                                option?.displayName || ''
                              }`
                          }}
                          onChange={(event, newValue) => {
                            if (newValue?.vendorId === 'add-new') {
                              handleAddNewVendor()
                              return
                            }
                            field.onChange(newValue)

                            let curretVendorCurrency = currencies.find(cur => cur?.currencyId === newValue?.currencyId)
                            const getRate = getExchangeRate(
                              curretVendorCurrency?.exchangeRate || 1,
                              localCurrency?.exchangeRate
                            )
                            setValue(`currencyExchangeRate`, getRate)
                            const vendorRate = getExchangeRate(vendorExchangeRate, curretVendorCurrency?.exchangeRate)
                            orderItems?.map((item, i) => {
                              let convCp = multiplyDecimalsWithoutRounding(item?.purchasePrice, vendorRate)
                              setValue(`orderItems[${i}].purchasePrice`, parseFloat(convCp)?.toFixed(2))
                              update(`orderItems[${i}].purchasePrice`, parseFloat(convCp)?.toFixed(2))

                              let convLocalCp = multiplyDecimalsWithoutRounding(item?.purchasePrice, getRate)
                              setValue(`orderItems[${i}].localPurchasePrice`, parseFloat(convLocalCp)?.toFixed(2))
                              update(`orderItems[${i}].localPurchasePrice`, parseFloat(convLocalCp)?.toFixed(2))
                            })

                            allTaxes?.forEach(item => {
                              item.taxValueCurrency = item?.inLocalCurrency
                                ? localCurrency?.currencyId
                                : curretVendorCurrency?.currencyId
                            })

                            allExpenses
                              ?.filter(a => a.paidToMainVendor)
                              ?.forEach(item => {
                                item.expenseValueCurrency = curretVendorCurrency?.currencyId
                              })

                            setVendorExchangeRate(curretVendorCurrency?.exchangeRate)
                            const currency = findObjectByCurrencyId(currencies, newValue?.currencyId) || ''
                            setVendorCurrency(currency)
                            setValue('paymentTerms', newValue?.paymentTermsId)
                            setPaymentTerm(paymentTerm)
                            setValue('shippingPreference', newValue?.shippingPreference)
                            setValue('currency', currency)
                            trigger(['vendorId', 'paymentTerms', 'shippingPreference', 'currency'])

                            const leadDays = getLeadDays(newValue?.paymentTermsId, paymentTerms)
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
                          isOptionEqualToValue={(option, value) => option.vendorId === value?.vendorId}
                          renderOption={(props, option) => {
                            // Check if the option is "Add New Vendor"
                            if (option?.vendorId === 'add-new') {
                              return (
                                <li
                                  {...props}
                                  style={{ display: 'flex', justifyContent: 'center', fontWeight: 'bold' }}
                                >
                                  <Button
                                    variant='contained'
                                    color='primary'
                                    sx={{ width: '100%' }}
                                    onClick={handleAddNewVendor}
                                  >
                                    + Add New
                                  </Button>
                                </li>
                              )
                            }

                            // Normal customer option rendering
                            return (
                              <li {...props} key={option?.vendorId}>
                                {option?.vendorNoPrefix || ''}
                                {option?.vendorNo || ''}-{option?.displayName || ''}
                              </li>
                            )
                          }}
                          options={[{ displayName: 'Add New', vendorId: 'add-new' }, ...filteredVendors]}
                          renderInput={params => (
                            <CustomTextField
                              {...params}
                              label='Vendor'
                              error={Boolean(errors.vendorId)}
                              {...(errors.vendorId && { helperText: 'Vendor is required' })}
                            />
                          )}
                        />
                      )}
                    />
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
                          disabled
                          disableClearable
                          fullWidth
                          getOptionLabel={option => {
                            if (typeof option === 'string') {
                              return option
                            } else return `${option?.currencyId}`
                          }}
                          renderOption={(props, option) => (
                            <Box component='li' {...props}>
                              {option.symbol} - {option.currencyId}
                            </Box>
                          )}
                          onChange={(e, newValue) => {
                            field.onChange(newValue)
                            const getRate = getExchangeRate(newValue?.exchangeRate || 1, localCurrency?.exchangeRate)

                            setValue(`currencyExchangeRate`, getRate)
                            const vendorRate = getExchangeRate(vendorExchangeRate, newValue?.exchangeRate)

                            orderItems?.map((item, i) => {
                              let convCp = item?.purchasePrice * vendorRate
                              setValue(`orderItems[${i}].purchasePrice`, parseFloat(convCp)?.toFixed(2))
                              update(`orderItems[${i}].purchasePrice`, parseFloat(convCp)?.toFixed(2))

                              let convLocalCp = multiplyDecimalsWithoutRounding(convCp, getRate)
                              setValue(`orderItems[${i}].localPurchasePrice`, parseFloat(convLocalCp)?.toFixed(2))
                              update(`orderItems[${i}].localPurchasePrice`, parseFloat(convLocalCp)?.toFixed(2))
                            })

                            allTaxes?.forEach(item => {
                              item.taxValueCurrency = item?.inLocalCurrency
                                ? localCurrency?.currencyId
                                : newValue?.currencyId
                            })

                            allExpenses
                              ?.filter(a => a.paidToMainVendor)
                              ?.forEach(item => {
                                item.expenseValueCurrency = newValue?.currencyId
                              })

                            setVendorCurrency(newValue)
                            setVendorExchangeRate(newValue?.exchangeRate)
                          }}
                          renderInput={params => <CustomTextField {...params} fullWidth label='Currency' />}
                        />
                      )}
                    />
                  </Grid>
                  {vendorCurrency?.exchangeRate !== localCurrency?.exchangeRate && (
                    <Grid item xs={6} sm={4} md={3}>
                      <Controller
                        name='currencyExchangeRate'
                        control={control}
                        render={({ field }) => (
                          <CustomTextField
                            value={field.value}
                            onChange={e => {
                              const newValue = e.target.value
                              field.onChange(newValue)

                              orderItems?.map((item, i) => {
                                const convLocalCp = multiplyDecimalsWithoutRounding(item?.purchasePrice, newValue)
                                setValue(`orderItems[${i}].localPurchasePrice`, parseFloat(convLocalCp)?.toFixed(2))
                                update(`orderItems[${i}].localPurchasePrice`, parseFloat(convLocalCp)?.toFixed(2))
                              })
                            }}
                            fullWidth
                            label='Exchange Rate'
                          />
                        )}
                      />{' '}
                    </Grid>
                  )}
                </Grid>
              </Grid>
              <Grid item xs={12} md={12} xl={9}>
                <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                  <Grid item xs={6} sm={4} md={3}>
                    <Controller
                      name='orderDate'
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <CustomDatePicker
                          label={'Date'}
                          fullWidth={true}
                          date={field.value}
                          onChange={newValue => {
                            field.onChange(newValue)
                            const leadDays = getLeadDays(selectedPaymentTerms, paymentTerms)

                            if (leadDays > 0) {
                              const newDate = new Date(newValue)
                              newDate.setDate(newDate.getDate() + leadDays)
                              setValue('dueDate', newDate)
                            } else if (leadDays === 0) {
                              setValue('dueDate', new Date(newValue))
                            } else {
                              setValue('dueDate', null)
                            }
                          }}
                          error={Boolean(errors?.orderDate)}
                        />
                      )}
                    />
                    {errors?.orderDate && <FormHelperText error>Order Date is required</FormHelperText>}
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <Controller
                      name='dueDate'
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <CustomDatePicker
                          label={'Due Date'}
                          fullWidth={true}
                          date={field.value}
                          onChange={newValue => {
                            field.onChange(newValue)
                          }}
                          error={Boolean(errors?.dueDate)}
                        />
                      )}
                    />
                    {errors?.dueDate && <FormHelperText error>Due Date is required</FormHelperText>}
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <Controller
                      name='paymentTerms'
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <CustomAutocomplete
                          {...field}
                          onChange={(event, newValue) => {
                            field.onChange(newValue)
                            const leadDays = getLeadDays(newValue, paymentTerms)
                            if (leadDays > 0) {
                              const newDate = new Date(orderDate)
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
                          // isOptionEqualToValue={(option, value) => option.paymentTermsId === value?.paymentTermsId}
                          renderInput={params => (
                            <CustomTextField
                              {...params}
                              id='paymentTerms'
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

              <Grid item xs={12} md={12} xl={9}>
                <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                  <Grid item xs={6} sm={4} md={3}>
                    <Controller
                      name='reference'
                      control={control}
                      render={({ field }) => <CustomTextField {...field} fullWidth label='Reference' />}
                    />{' '}
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
                </Grid>
              </Grid>
              <Grid item xs={12} md={12} lg={11} xl={9}>
                <Grid container spacing={{ xs: 2, sm: 12, md: 12, lg: 12, xl: 12 }}>
                  <Grid item xs={12} sm={6} id='billingAddress'>
                    <Typography sx={{ fontSize: '15px', fontWeight: 500, lineHeight: '40px', mb: 5 }}>
                      Billing Address
                    </Typography>
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
                      <Grid item xs={6} sm={12} md={6}>
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
                      <Grid item xs={6} sm={12} md={6}>
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
                              value={{ name: field.value }}
                              onChange={(event, newValue) => {
                                field.onChange(newValue?.name)
                                setValue('billingAddress.state', '')
                                setBillingAddressCountry(newValue)
                              }}
                              renderInput={params => (
                                <CustomTextField
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
                      <Grid item xs={6} sm={12} md={6}>
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
                              value={{ name: field.value }}
                              onChange={(event, newValue) => {
                                field.onChange(newValue?.name)
                              }}
                              renderInput={params => (
                                <CustomTextField
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
                      <Grid item xs={6} sm={12} md={6}>
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
                    </Grid>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography sx={{ fontSize: '15px', fontWeight: 500, lineHeight: '40px', mb: 2 }}>
                      Delivery:
                    </Typography>
                    <Box sx={{ width: { xs: '100%', md: '50%' }, mb: 6 }}>
                      <Controller
                        name='warehouseId'
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <CustomAutocomplete
                            {...field}
                            value={field?.value}
                            options={warehouses}
                            getOptionLabel={option => option?.name || ''}
                            disableClearable
                            onChange={(e, newValue) => {
                              field.onChange(newValue)
                              setValue('deliveryAddress.cityOrTown', newValue?.address?.cityOrTown)
                              setValue('deliveryAddress.postcode', newValue?.address?.postcode)
                              setValue('deliveryAddress.addressLine1', newValue?.address?.addressLine1)
                              setValue('deliveryAddress.addressLine2', newValue?.address?.addressLine2)
                              setValue('deliveryAddress.country', newValue?.address?.country)
                              setValue('deliveryAddress.state', newValue?.address?.state)
                              trigger([
                                'warehouseId',
                                'deliveryAddress.country',
                                'deliveryAddress.state',
                                'deliveryAddress.cityOrTown',
                                'deliveryAddress.postcode',
                                'deliveryAddress.addressLine1'
                              ])
                            }}
                            renderInput={params => (
                              <CustomTextField
                                {...params}
                                label='Select Warehouse'
                                fullWidth
                                error={Boolean(errors.warehouseId)}
                                {...(errors.warehouseId && { helperText: 'Warehouse is required' })}
                              />
                            )}
                          />
                        )}
                      />
                    </Box>
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
                          render={({ field }) => (
                            <CustomTextField fullWidth label='Address Line 2' {...field} onChange={field.onChange} />
                          )}
                        />
                      </Grid>{' '}
                      <Grid item xs={6} sm={12} md={6}>
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
                      <Grid item xs={6} sm={12} md={6}>
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
                              value={{ name: field.value }}
                              onChange={(event, newValue) => {
                                field.onChange(newValue?.name)
                                setValue('deliveryAddress.state', '')
                                setDeliveryAddressCountry(newValue)
                                // setDeliveryAddressCountry(newValue)
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
                      <Grid item xs={6} sm={12} md={6}>
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
                      <Grid item xs={6} sm={12} md={6}>
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
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <ItemsTable
                products={products}
                vendors={vendors}
                control={control}
                errors={errors}
                watch={watch}
                trigger={trigger}
                localCurrency={localCurrency}
                vendorCurrency={vendorCurrency}
                currencyExchangeRate={currencyExchangeRate}
                setValue={setValue}
                getValues={getValues}
                settingPurchaseData={settingPurchaseData}
                mainVendor={mainVendor}
              />
              <Grid item xs={12}>
                <CustomFilesUpload
                  setValue={setValue}
                  selectedPdFile={selectedPdFile}
                  setSelectedPdFile={setSelectedPdFile}
                  folderName={PURCHASE_ORDER_PDF}
                />
              </Grid>
            </Grid>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: { xs: 'center', sm: 'start' },
                gap: { xs: '10px', md: '20px' },
                marginTop: { xs: '20px', sm: '30px' }
              }}
            >
              <Button
                variant='contained'
                type='submit'
                onClick={() => {
                  // check(STATUS_DRAFT)
                  setSubmitType(null)
                }}
              >
                Save
              </Button>

              <Button
                variant='contained'
                type='submit'
                onClick={() => {
                  // check(STATUS_DRAFT)
                  setSubmitType('confirmed')
                }}
              >
                Save As Confirmed
              </Button>

              <Button variant='outlined' onClick={() => handleCancel()}>
                Cancel
              </Button>
            </Box>
          </form>
        )}
      </PageWrapper>
      {isAddNewModalOpen && (
        <AddVendorPopup open={isAddNewModalOpen} setOpen={setIsAddNewModalOpen} setValue={setValue} />
      )}
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity='error' variant='filled'>
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

export default PurchaseOrder
