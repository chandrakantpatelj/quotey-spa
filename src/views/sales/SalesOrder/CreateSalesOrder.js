import {
  Alert,
  Backdrop,
  Box,
  Checkbox,
  CircularProgress,
  FormHelperText,
  FormLabel,
  Grid,
  LinearProgress,
  Snackbar,
  Typography
} from '@mui/material'
import Button from '@mui/material/Button'
import Router from 'next/router'
import React, { useEffect, useMemo, useState } from 'react'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import {
  createSalesOrderAndIssueTaxInvoiceMutation,
  createSalesOrderAndProcessAsDeliveredMutation,
  createSalesOrderMutation
} from 'src/@core/components/graphql/sales-order-queries'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'
import AddCustomerPopup from 'src/common-components/AddCustomerPopup'
import { writeData } from 'src/common-functions/GraphqlOperations'
import {
  CREATE_SALES_ORDER,
  SALES_ORDER_PDF,
  SCHEMA_VERSION,
  STATUS_CONFIRMED,
  STATUS_DRAFT
} from 'src/common-functions/utils/Constants'
import { greaterThanOrEqual } from 'src/common-functions/utils/DecimalUtils'
import {
  capitalizeFirstLetterOnly,
  checkAuthorizedRoute,
  convertCurrency,
  findObjectByCurrencyId,
  generateId,
  getLeadDays,
  parseDate,
  safeNumber
} from 'src/common-functions/utils/UtilityFunctions'
import useCountries from 'src/hooks/getData/useCountries'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import useCustomers from 'src/hooks/getData/useCustomers'
import useOtherSettings from 'src/hooks/getData/useOtherSettings'
import usePaymentTerms from 'src/hooks/getData/usePaymnetTerms'
import usePriceLists from 'src/hooks/getData/usePriceLists'
import useProducts from 'src/hooks/getData/useProducts'
import { useSalesModule } from 'src/hooks/getData/useSalesModule'
import useTradings from 'src/hooks/getData/useTradings'
import useUserAccounts from 'src/hooks/getData/useUserAccounts'
import useWarehouses from 'src/hooks/getData/useWarehouses'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import { createAlert } from 'src/store/apps/alerts'
import { setUpdateCustomer } from 'src/store/apps/customers'
import { resetPackage } from 'src/store/apps/packages'
import { addSalesOrder } from 'src/store/apps/sales'
import { resetInvoice } from 'src/store/apps/sales-invoices'
import CustomFilesUpload from 'src/views/forms/form-elements/custom-inputs/CustomFilesUpload'
import SaveOtherSettingOtherOption from 'src/views/forms/form-elements/custom-inputs/SaveOtherSettingOtherOption'
import { UploadMultipleFileS3Api } from 'src/views/forms/form-elements/custom-inputs/UploadMultipleFileS3Api'
import CustomDatePicker from 'src/views/forms/form-elements/pickers/CustomDatePicker'
import SalesOrderItemsTable from 'src/views/sales/SalesOrder/SalesOrderItemsTable'

const AddressFields = {
  addressLine1: '',
  addressLine2: '',
  cityOrTown: '',
  state: '',
  postcode: '',
  country: ''
}

const DefaultSalesOrder = {
  schemaVersion: SCHEMA_VERSION,
  tradingId: null,
  customerId: null,
  salesQuotationId: null,
  salesQuotationNoPrefix: '',
  salesQuotationNo: '',
  reference: '',
  orderDate: new Date(),
  dueDate: new Date(),
  deliveryDate: new Date(),
  paymentDate: new Date(),
  expectedPackingDate: new Date(),
  expectedDeliveryDate: new Date(),
  paymentTerms: '',
  status: '',
  shippingPreference: null,
  currency: '',
  billingAddress: AddressFields,
  deliveryAddress: AddressFields,
  deliveredBy: '',
  assignedTo: null,
  orderItems: [
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
      totalNetAmount: 0,
      warehouseId: ''
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
  paymentId: null,
  paymentMethod: '',
  paymentReference: '',
  totalOtherCharges: 0,
  totalOtherChargesTax: 0,
  depositAmount: 0,
  totalAmount: 0,
  files: []
}

function CreateSalesOrder({ isSalesDrawer = false, handleCancelDrawer }) {
  const router = Router
  const dispatch = useDispatch()

  const tenant = useSelector(state => state.tenants?.selectedTenant)
  const { tenantId } = tenant || ''
  const customer = useSelector(state => state.customers?.selectedCustomer) || {}
  const userProfile = useSelector(state => state.userProfile)
  const quotation = useSelector(state => state.quotations?.selectedQuotation || {})
  const currency = useSelector(state => state?.currencies?.selectedCurrency)

  const { currencies } = useCurrencies()
  const { countries } = useCountries()
  const { customers, customerLoading, fetchCustomers } = useCustomers(tenantId)
  const { warehouses, loading: warehouseLoading } = useWarehouses(tenantId)
  const { tradings, fetchTradings } = useTradings(tenantId)
  const { userAccounts } = useUserAccounts()
  const { salesModules } = useSalesModule(tenantId)
  const { paymentTerms } = usePaymentTerms()
  const { fetchOtherSettings, loadingOtherSetting } = useOtherSettings(tenantId)
  const [otherSettings, setOtherSettings] = useState()
  const [open, setOpen] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState(currency)
  const [loader, setLoader] = React.useState(false)
  const [selectedPdFile, setSelectedPdFile] = useState([])
  const [status, setStatus] = useState('')
  const [itemList, setItemList] = useState([])
  const [manualLoading, setManualLoading] = useState(true)
  const [checked, setChecked] = useState(false)
  const [submitType, setSubmitType] = useState('')
  const { priceLists, fetchPriceLists } = usePriceLists(tenantId)
  const { productsLoading } = useProducts(tenantId)

  const loading = manualLoading || loadingOtherSetting || customerLoading || warehouseLoading || productsLoading

  const loadCustomers = async () => {
    setManualLoading(true)
    await fetchCustomers()
    await fetchPriceLists()
    await fetchTradings()
    setManualLoading(false)
  }

  const { taxes = [], otherCharges = [] } = salesModules || {}

  const filteredCustomers = customers?.filter(item => salesModules?.currencies?.includes(item?.currencyId))

  const [separateOtherCharges, setSeparateOtherCharges] = useState([])
  const [separateOrderTaxes, setSeparateOrderTaxes] = useState([])
  const enabledTaxes = useMemo(
    () =>
      taxes
        ?.filter(tax => tax.enabled)
        ?.map(
          ({
            enabled,
            accountReceivableAccountId,
            accruedTaxCollectedAccountId,
            cashTaxCollectedAccountId,
            ...rest
          }) => ({ ...rest, taxValueCurrency: currency?.currencyId })
        ) || [],
    [salesModules]
  )

  useEffect(() => {
    const enabledTaxesData = otherCharges.map(charges => {
      const { enabled, taxes, ...remaningField } = charges
      return {
        ...remaningField,
        chargedAmountCurrency: currency?.currencyId,
        taxes: taxes
          .filter(tax => tax.enabled)
          .map(({ enabled, ...item }) => ({
            ...item,
            taxValueCurrency: currency?.currencyId
          }))
      }
    })

    setSeparateOtherCharges(enabledTaxesData)
  }, [taxes, otherCharges, salesModules])

  useEffect(() => {
    if (checkAuthorizedRoute(CREATE_SALES_ORDER, router, userProfile)) {
      loadCustomers()
    }
  }, [tenantId, fetchCustomers, fetchPriceLists, fetchTradings, userProfile])

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
  const selectedSendEmailCheckBox = watch('sendEmail')

  const trading = tenant?.tradingId || null
  useEffect(() => {
    if (Object.keys(quotation).length) {
      const defaultValue = {
        schemaVersion: quotation?.schemaVersion,
        reference: quotation?.quotationNo,
        orderDate: new Date(),
        dueDate: new Date(),
        deliveryDate: new Date(),
        paymentDate: new Date(),
        files: quotation?.files,
        billingAddress: quotation?.billingAddress,
        deliveryAddress: quotation?.deliveryAddress,
        customerId: customers.find(customer => customer.customerId === quotation.customerId),
        paymentTerms: quotation?.paymentTerms,
        currency: quotation?.currency,
        tradingId: trading,
        shippingPreference: quotation?.shippingPreference,
        customerNotes: quotation?.customerNotes,
        notes: quotation?.notes,
        termsAndConditions: quotation?.termsAndConditions,
        discountType: quotation?.discountType,
        discountValue: quotation?.discountValue,
        paymentDate: new Date(),
        paymentMethod: quotation?.paymentMethod,
        paymentReference: quotation?.paymentReference,
        depositAmount: quotation?.depositAmount,
        status: quotation?.status,
        salesQuotationId: quotation?.quotationId,
        salesQuotationNo: quotation?.quotationNo,
        orderItems: quotation?.quotationItems,
        taxes: quotation?.taxes,
        otherCharges: quotation?.otherCharges,
        totalOtherCharges: quotation?.totalOtherCharges,
        totalOtherChargesTax: quotation?.totalOtherChargesTax
      }

      reset(defaultValue)
      setValue('currency', currency)
      setSelectedCurrency(currency)
    } else {
      const setDefaultData = async () => {
        const otherSettings = await fetchOtherSettings()
        setOtherSettings(otherSettings)
        const { salesOrderTermsAndConditions = [], salesOrderCustomerNotes = [] } = otherSettings ?? {}

        const defaultValue = {
          ...DefaultSalesOrder,
          otherCharges: otherCharges.map(item => ({
            ...DefaultSalesOrder.otherCharges[0], // Spread the default charge object structure
            ...item,
            taxes: (item.taxes || []).map((itemTax, index) => ({
              ...DefaultSalesOrder.otherCharges[0].taxes[index], // Spread the default tax object structure
              ...itemTax
            }))
          })),
          customerId: isSalesDrawer ? customer : null,
          taxes: enabledTaxes,
          tradingId: trading,
          currency: selectedCurrency,
          sendEmail: salesModules.sendInvoiceAutomatically || false,
          billingAddress: {
            ...AddressFields,
            country: tenant?.billingAddress?.country
          },
          deliveryAddress: {
            ...AddressFields,
            country: tenant?.address?.country
          },
          customerNotes:
            salesOrderCustomerNotes.length > 0 ? salesOrderCustomerNotes[salesOrderCustomerNotes.length - 1] : '',
          termsAndConditions:
            salesOrderTermsAndConditions.length > 0
              ? salesOrderTermsAndConditions[salesOrderTermsAndConditions.length - 1]
              : ''
        }
        reset(defaultValue)
        setValue('currency', currency)
        setSelectedCurrency(currency)
      }
      setDefaultData()
    }
  }, [tenant, currency, salesModules, fetchOtherSettings])

  useEffect(() => {
    setValue('tradingId', trading)
  }, [tenant, trading])

  useEffect(() => {
    setBillingAddressCountry(findObjectById(countries, tenant?.billingAddress?.country))
    setDeliveryAddressCountry(findObjectById(countries, tenant?.address?.country))
  }, [tenant, countries])

  const getCurrency = watch('currency')
  let selectedPaymentTerms = watch('paymentTerms')
  let orderDate = watch('orderDate')

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
    const compare = greaterThanOrEqual(totalAmount || 0, 20000)
    setIsRequired(compare)
  }, [totalAmount])

  useEffect(() => {
    trigger(['billingAddress.addressLine1', 'billingAddress.state', 'billingAddress.country'])
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
  const updateCustomer = salesOrder => {
    const customer = customers.find(c => c.customerId === salesOrder.customerId)

    if (customer) {
      const updatedCustomer = {
        ...customer,
        billingAddress: salesOrder.billingAddress,
        deliveryAddress: salesOrder.deliveryAddress,
        emailAddress: salesOrder.emailAddress
      }

      dispatch(setUpdateCustomer(updatedCustomer))
    }
  }
  const handleNewOrderSave = async newSalesOrder => {
    setOpen(false)
    setLoader(true)
    const tenantId = tenant?.tenantId
    const currency = selectedCurrency?.currencyId || null
    const salesOrder = {
      ...newSalesOrder,
      status,
      totalAmount: safeNumber(newSalesOrder.totalAmount),
      discountValue: safeNumber(newSalesOrder.discountValue),
      customerId: newSalesOrder.customerId?.customerId,
      orderDate: parseDate(newSalesOrder.orderDate),
      dueDate: parseDate(newSalesOrder.dueDate),
      deliveryDate: parseDate(newSalesOrder.deliveryDate),
      expectedDeliveryDate: parseDate(newSalesOrder.expectedDeliveryDate),
      expectedPackingDate: parseDate(newSalesOrder.expectedPackingDate),
      paymentDate: parseDate(newSalesOrder.paymentDate),
      orderItems: newSalesOrder?.orderItems?.map(item => {
        // const { sellingPriceCurrency, originalPrice, serviceDate, sellingPriceTaxInclusive, ...items } = item
        // return { ...items, serviceDate: parseDate(serviceDate) }
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
          serviceDate: parseDate(item?.serviceDate),
          warehouseId: item?.warehouseId
        }
      }),
      depositAmount: newSalesOrder?.depositAmount || 0,
      taxes: separateOrderTaxes,
      otherCharges: separateOtherCharges,
      currency
    }
    delete salesOrder.paymentStatus
    delete salesOrder.balance

    SaveOtherSettingOtherOption(tenantId, otherSettings, newSalesOrder, dispatch, 'salesOrder')

    if (submitType === 'delivered') {
      try {
        const response = await writeData(createSalesOrderAndProcessAsDeliveredMutation(), { tenantId, salesOrder })
        const result = response.createSalesOrderAndProcessAsDelivered
        if (result) {
          if (selectedPdFile?.length) {
            await UploadMultipleFileS3Api(selectedPdFile, dispatch)
          }
          dispatch(addSalesOrder(result))
          updateCustomer(salesOrder)
          dispatch(createAlert({ message: 'Sales Order created and delivered successfully !', type: 'success' }))
          isSalesDrawer ? handleCancelDrawer() : router.push('/sales/sales-order/')
        } else {
          setLoader(false)
          const errorMessage = response?.errors?.[0]
            ? response.errors[0].message
            : 'Failed to create and deliver the sales order!'
          dispatch(createAlert({ message: errorMessage, type: 'error' }))
        }
      } catch (error) {
        setLoader(false)
        console.error(error)
      }
    } else if (submitType === 'taxInvoice') {
      try {
        const response = await writeData(createSalesOrderAndIssueTaxInvoiceMutation(), { tenantId, salesOrder })
        const result = response.createSalesOrderAndIssueTaxInvoice

        if (result) {
          if (selectedPdFile?.length) {
            await UploadMultipleFileS3Api(selectedPdFile, dispatch)
          }
          dispatch(addSalesOrder(result))
          updateCustomer(salesOrder)
          dispatch(resetInvoice())
          dispatch(
            createAlert({ message: 'Sales Order created and issued tax invoice successfully !', type: 'success' })
          )
          isSalesDrawer ? handleCancelDrawer() : router.push('/sales/sales-order/')
        } else {
          setLoader(false)
          const errorMessage = response?.errors?.[0]
            ? response.errors[0].message
            : 'Failed to create and deliver the sales order!'
          dispatch(createAlert({ message: errorMessage, type: 'error' }))
        }
      } catch (error) {
        setLoader(false)
        console.error(error)
      }
    } else {
      try {
        const response = await writeData(createSalesOrderMutation(), { tenantId, salesOrder })
        const result = response.createSalesOrder

        if (result) {
          if (selectedPdFile?.length) {
            await UploadMultipleFileS3Api(selectedPdFile, dispatch)
          }
          if (status === 'CONFIRMED') {
            updateCustomer(salesOrder)
            dispatch(resetPackage())
          }

          dispatch(addSalesOrder(result))
          dispatch(createAlert({ message: 'Sales Order created successfully !', type: 'success' }))
          isSalesDrawer ? handleCancelDrawer() : router.push('/sales/sales-order/')
        } else {
          setLoader(false)
          const errorMessage = response?.errors?.[0] ? response.errors[0].message : 'Sales Order creation failed !'
          dispatch(createAlert({ message: errorMessage, type: 'error' }))
        }
      } catch (error) {
        setLoader(false)
        console.error(error)
      }
    }
  }

  const handleCancel = () => {
    isSalesDrawer ? handleCancelDrawer() : router.push('/sales/sales-order/')
    reset()
  }

  // const customerField = useWatch({ control, name: 'customerId' })
  const orderItems = getValues('orderItems')

  // const handleCustomerChange = customerField => {
  //   if (!customerField) {
  //     return
  //   }

  //   setValue('billingAddress', customerField?.billingAddress)
  //   setValue('deliveryAddress', customerField?.deliveryAddress)
  //   setValue('paymentTerms', customerField?.paymentTerms)
  //   const currency = findObjectByCurrencyId(currencies, customerField?.currencyId) || ''
  //   setValue('currency', currency)
  //   setSelectedCurrency(currency)
  //   const filterlist = priceLists?.find(priceList =>
  //     priceList?.customers?.some(item => item.customerId === customerField?.customerId)
  //   )
  //   setItemList(filterlist?.itemList)
  //   trigger(['paymentTerms', 'currency'])
  // }
  // useEffect(() => {
  //   handleCustomerChange(customerField)
  // }, [customerField])

  const billingAddress = useWatch({ control, name: 'billingAddress' })

  const handleAddressCheck = e => {
    setChecked(e.target.checked)
    if (e.target.checked) {
      setValue('deliveryAddress', billingAddress)
    }
  }

  const { update } = useFieldArray({
    control,
    name: 'orderItems'
  })
  return (
    <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
      <>
        {loading ? (
          <LinearProgress />
        ) : (
          <form onSubmit={handleSubmit(handleNewOrderSave)}>
            <Grid container spacing={{ xs: 5 }}>
              <Grid item xs={12} md={12} xl={10}>
                <Grid container spacing={{ xs: 2, md: 3 }}>
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
                            field.onChange(newValue)

                            let currentCustomerCurrency = currencies.find(
                              cur => cur?.currencyId === newValue?.currencyId
                            )
                            const customerRate = currentCustomerCurrency?.exchangeRate
                            const selectedRate = selectedCurrency?.exchangeRate

                            if (orderItems?.length && customerRate && selectedRate) {
                              orderItems.forEach((item, i) => {
                                if (item?.originalPrice != null) {
                                  const converted = convertCurrency(
                                    selectedRate,
                                    1,
                                    customerRate,
                                    item.originalPrice
                                  ).toFixed(2)
                                  setValue(`orderItems[${i}].originalPrice`, converted)
                                  update(`orderItems[${i}].originalPrice`, converted)
                                }
                              })
                            }

                            setValue('billingAddress.addressLine1', newValue?.billingAddress?.addressLine1 || '')
                            setValue('billingAddress.addressLine2', newValue?.billingAddress?.addressLine2 || '')
                            setValue('billingAddress.cityOrTown', newValue?.billingAddress?.cityOrTown || '')
                            setValue('billingAddress.state', newValue?.billingAddress?.state || '')
                            setValue('billingAddress.postcode', newValue?.billingAddress?.postcode || '')
                            setValue('billingAddress.country', newValue?.billingAddress?.country || '')

                            setValue('deliveryAddress.addressLine1', newValue?.deliveryAddress?.addressLine1 || '')
                            setValue('deliveryAddress.addressLine2', newValue?.deliveryAddress?.addressLine2 || '')
                            setValue('deliveryAddress.cityOrTown', newValue?.deliveryAddress?.cityOrTown || '')
                            setValue('deliveryAddress.state', newValue?.deliveryAddress?.state || '')
                            setValue('deliveryAddress.postcode', newValue?.deliveryAddress?.postcode || '')
                            setValue('deliveryAddress.country', newValue?.deliveryAddress?.country || '')
                            setValue('emailAddress', newValue?.emailAddress || '')
                            setValue('paymentTerms', newValue?.paymentTerms)
                            const currency = findObjectByCurrencyId(currencies, newValue?.currencyId) || ''
                            setValue('currency', currency)
                            setSelectedCurrency(currency)
                            const filterlist = priceLists?.find(priceList =>
                              priceList?.filteredCustomers?.some(item => item.customerId === newValue?.customerId)
                            )
                            setItemList(filterlist?.itemList)

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
                            trigger(['emailAddress', 'sendEmail', 'paymentTerms', 'shippingPreference', 'currency'])
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

                            return (
                              <li {...props}>
                                {option?.customerNoPrefix || ''}
                                {option?.customerNo || ''}-{option?.customerName || ''}
                              </li>
                            )
                          }}
                          options={[{ customerName: 'Add New', customerId: 'add-new' }, ...filteredCustomers]}
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
                          value={currencies.find(cur => cur.currencyId === field.value?.currencyId) || null}
                          onChange={(e, newValue) => {
                            field.onChange(newValue)
                            let depositAmount = getValues('depositAmount')
                            let discountValue = getValues('discountValue')
                            let discountType = getValues('discountType')

                            const oldRate = selectedCurrency?.exchangeRate
                            const newRate = newValue?.exchangeRate

                            if (orderItems?.length && oldRate && newRate) {
                              orderItems.forEach((item, i) => {
                                if (item?.originalPrice != null) {
                                  const converted = convertCurrency(oldRate, 1, newRate, item.originalPrice).toFixed(2)
                                  setValue(`orderItems[${i}].originalPrice`, converted)
                                  update(`orderItems[${i}].originalPrice`, converted)
                                }
                              })
                            }

                            if (selectedCurrency) {
                              if (discountValue !== null || discountType !== 'VALUE' || selectedCurrency !== '') {
                                let convdiscountTypeCp = convertCurrency(
                                  selectedCurrency?.exchangeRate,
                                  1,
                                  newValue?.exchangeRate,
                                  discountValue || 0
                                ).toFixed(2)
                                setValue(`discountValue`, convdiscountTypeCp)
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

                            setSelectedCurrency(newValue)
                          }}
                          renderInput={params => (
                            <CustomTextField
                              {...params}
                              fullWidth
                              disabled
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
              <Grid item xs={12} md={12} xl={10}>
                <Grid container spacing={{ xs: 2, md: 3 }}>
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
                          onChange={date => {
                            field.onChange(date)
                            const leadDays = getLeadDays(selectedPaymentTerms, paymentTerms)

                            if (leadDays > 0) {
                              const newDate = new Date(date)
                              newDate.setDate(newDate.getDate() + leadDays)
                              setValue('dueDate', newDate)
                            } else if (leadDays === 0) {
                              setValue('dueDate', new Date(date))
                            } else {
                              setValue('dueDate', null)
                            }

                            setValue('paymentDate', date)
                            setValue('deliveryDate', date)
                            setValue('expectedPackingDate', date)
                          }}
                          error={Boolean(errors?.orderDate)}
                        />
                      )}
                    />
                    {errors?.orderDate && <FormHelperText error>Order Date is required</FormHelperText>}
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
                          value={field?.value || ''}
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
                </Grid>
              </Grid>
              <Grid item xs={12} md={12} xl={10}>
                <Grid container spacing={{ xs: 2, md: 3 }}>
                  <Grid item xs={6} sm={4} md={3}>
                    <Controller
                      name='reference'
                      control={control}
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
                      name='deliveryDate'
                      control={control}
                      render={({ field }) => (
                        <CustomDatePicker
                          //disabled={true}
                          label={'Exp. Delivery  Date'}
                          fullWidth={true}
                          date={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <Controller
                      name='expectedPackingDate'
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <CustomDatePicker
                          label={'Exp. Packing Date'}
                          fullWidth={true}
                          date={field.value}
                          onChange={date => {
                            field.onChange(date)
                            // setValue('paymentDate', newValue)
                          }}
                          error={Boolean(errors?.expectedPackingDate)}
                        />
                      )}
                    />
                    {errors?.expectedPackingDate && (
                      <FormHelperText error>Expected Packing Date is required</FormHelperText>
                    )}
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={12} xl={10}>
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
                              onChange={e => {
                                const formattedValue = capitalizeFirstLetterOnly(e.target.value)
                                field.onChange(formattedValue)

                                if (checked) {
                                  setValue('deliveryAddress.addressLine1', formattedValue)
                                }
                              }}
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
                              {...field}
                              onChange={e => {
                                const formattedValue = capitalizeFirstLetterOnly(e.target.value)
                                field.onChange(formattedValue)
                                if (checked) {
                                  setValue('deliveryAddress.addressLine2', formattedValue)
                                }
                              }}
                              fullWidth
                              label='Address Line 2'
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={12} md={6}>
                        <Controller
                          name='billingAddress.cityOrTown'
                          control={control}
                          rules={{ required: false }}
                          render={({ field }) => (
                            <CustomTextField
                              // id='billingAddress.cityOrTown'
                              {...field}
                              onChange={e => {
                                const formattedValue = capitalizeFirstLetterOnly(e.target.value)
                                field.onChange(formattedValue)
                                if (checked) {
                                  setValue('deliveryAddress.cityOrTown', formattedValue)
                                }
                              }}
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
                          rules={{ required: false }}
                          render={({ field }) => (
                            <CustomTextField
                              // id='billingAddress.postcode'
                              {...field}
                              onChange={e => {
                                const formattedValue = capitalizeFirstLetterOnly(e.target.value)
                                field.onChange(formattedValue)
                                if (checked) {
                                  setValue('deliveryAddress.postcode', formattedValue)
                                }
                              }}
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
                              disableClearable={false}
                              options={billingAddressCountry?.states?.length ? billingAddressCountry?.states : []}
                              getOptionLabel={option => option.name || ''}
                              getOptionSelected={(option, value) => {
                                return option.name === value.name
                              }}
                              isOptionEqualToValue={(option, value) => option.name === value?.name}
                              value={{ name: field.value }}
                              onChange={(event, newValue) => {
                                field.onChange(newValue?.name)
                                if (checked) {
                                  setValue('deliveryAddress.state', newValue?.name)
                                }
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
                              disableClearable={false}
                              options={countries}
                              getOptionLabel={option => option.name || ''}
                              getOptionSelected={(option, value) => {
                                return option.name === value.name
                              }}
                              isOptionEqualToValue={(option, value) => option.name === value?.name}
                              value={field.value ? { name: field.value } : null}
                              onChange={(event, newValue) => {
                                field.onChange(newValue ? newValue.name : '')
                                setValue('billingAddress.state', '')
                                setBillingAddressCountry(newValue)
                                if (checked) {
                                  setValue('deliveryAddress.state', '')
                                  setDeliveryAddressCountry(newValue)
                                  setValue('deliveryAddress.country', newValue?.name)
                                }
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
                            onChange={e => handleAddressCheck(e)}
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
                          render={({ field }) => (
                            <CustomTextField
                              {...field}
                              onChange={e => {
                                const formattedValue = capitalizeFirstLetterOnly(e.target.value)
                                field.onChange(formattedValue)
                              }}
                              fullWidth
                              label='Address Line 1'
                            />
                          )}
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
                              onChange={e => {
                                const formattedValue = capitalizeFirstLetterOnly(e.target.value)
                                field.onChange(formattedValue)
                              }}
                            />
                          )}
                        />
                      </Grid>{' '}
                      <Grid item xs={12} sm={12} md={6}>
                        <Controller
                          name='deliveryAddress.cityOrTown'
                          control={control}
                          render={({ field }) => (
                            <CustomTextField
                              {...field}
                              onChange={e => {
                                const formattedValue = capitalizeFirstLetterOnly(e.target.value)
                                field.onChange(formattedValue)
                              }}
                              fullWidth
                              label='City / Town'
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={12} md={6}>
                        <Controller
                          name='deliveryAddress.postcode'
                          control={control}
                          render={({ field }) => (
                            <CustomTextField
                              {...field}
                              onChange={e => {
                                const formattedValue = capitalizeFirstLetterOnly(e.target.value)
                                field.onChange(formattedValue)
                              }}
                              fullWidth
                              label='Pin Code'
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={12} md={6}>
                        <Controller
                          name='deliveryAddress.state'
                          control={control}
                          render={({ field }) => (
                            <CustomAutocomplete
                              {...field}
                              disableClearable={false}
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
                              disableClearable={false}
                              options={countries}
                              getOptionLabel={option => option.name || ''}
                              isOptionEqualToValue={(option, value) => option?.name === value?.name}
                              value={field.value ? { name: field.value } : null} // Fix value resetting issue
                              onChange={(event, newValue) => {
                                field.onChange(newValue ? newValue.name : '') // Ensure it clears properly
                                setValue('deliveryAddress.state', '')
                                setDeliveryAddressCountry(newValue)
                              }}
                              renderInput={params => <CustomTextField {...params} label='Select Country' fullWidth />}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={12} md={6}>
                        <Controller
                          name='assignedTo'
                          control={control}
                          rules={{ required: false }}
                          render={({ field }) => (
                            <CustomAutocomplete
                              id='assignedTo'
                              {...field}
                              value={userAccounts.find(option => option.username === field.value) || null} // Ensure the selected value persists
                              onChange={(event, newValue) => {
                                field.onChange(newValue?.username || '')
                              }}
                              getOptionLabel={option => option?.name || ''} // Show the name in the dropdown
                              isOptionEqualToValue={(option, value) => option.username === value} // Compare based on username
                              renderOption={(props, option) => (
                                <Box component='li' {...props}>
                                  {`${option?.name}`}
                                </Box>
                              )}
                              options={userAccounts} // Options to display in the dropdown
                              renderInput={params => (
                                <CustomTextField
                                  {...params}
                                  label='Assigned To'
                                  error={Boolean(errors.assignedTo)}
                                  {...(errors.assignedTo && { helperText: 'User is required' })}
                                />
                              )}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={12} md={6}>
                        <Controller
                          name='deliveredBy'
                          control={control}
                          rules={{ required: false }}
                          render={({ field }) => (
                            <CustomTextField
                              {...field}
                              fullWidth
                              label='Delivered By'
                              error={Boolean(errors.deliveredBy)}
                              {...(errors.deliveredBy && { helperText: 'Deliver by is required' })}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={6} lg={5} xl={4}>
                <FormLabel sx={{ fontSize: '15px', fontWeight: 500, lineHeight: '40px' }}>Email</FormLabel>

                <Box sx={{ display: 'flex', flexWrap: { xs: 'wrap', sm: 'nowrap' }, gap: 2, alignItems: 'center' }}>
                  <Controller
                    name='emailAddress'
                    control={control}
                    rules={{
                      validate: value => {
                        if (selectedSendEmailCheckBox) {
                          if (!value || value.trim() === '') {
                            return 'Email address is required if Send Invoice is checked'
                          }
                        }

                        return true
                      }
                    }}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        value={field.value || ''}
                        onChange={e => {
                          const newValue = e.target.value
                          field.onChange(newValue)
                          if (newValue && newValue.trim() !== '') {
                            setValue('sendEmail', true, { shouldValidate: true })
                          } else {
                            setValue('sendEmail', false, { shouldValidate: true })
                          }

                          trigger(['emailAddress', 'sendEmail'])
                        }}
                        label='Email Address'
                        InputLabelProps={{ shrink: true }}
                        error={Boolean(errors.emailAddress)} // Only show error if checkbox is checked
                        helperText={errors.emailAddress?.message || ''}
                      />
                    )}
                  />
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', width: '40%' }}>
                    <Controller
                      name='sendEmail'
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          sx={{ p: '4px', flexShrink: 0 }}
                          {...field}
                          defaultChecked={field.value}
                          checked={field.value || false}
                          onChange={e => {
                            const checked = e.target.checked
                            field.onChange(checked)
                            trigger(['emailAddress', 'sendEmail'])
                          }}
                        />
                      )}
                    />
                    <Typography sx={{ fontSize: '13px', display: 'flex' }}>Send Invoice</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} lg={12} xl={12} id='orderItems'>
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
                  setSeparateOrderTaxes={setSeparateOrderTaxes}
                  arrayName={'orderItems'}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomFilesUpload
                  setValue={setValue}
                  selectedPdFile={selectedPdFile}
                  setSelectedPdFile={setSelectedPdFile}
                  folderName={SALES_ORDER_PDF}
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
              <Button
                variant='contained'
                type='submit'
                onClick={() => {
                  check(STATUS_DRAFT)
                  setSubmitType(null)
                }}
              >
                Save As Draft
              </Button>
              <Button
                variant='contained'
                type='submit'
                onClick={() => {
                  check(STATUS_CONFIRMED)
                  setSubmitType(null)
                }}
              >
                Save As Confirmed
              </Button>
              <Button
                variant='contained'
                type='submit'
                onClick={() => {
                  check(STATUS_CONFIRMED)
                  setSubmitType('delivered')
                }}
              >
                Save As Delivered
              </Button>
              <Button
                variant='contained'
                type='submit'
                onClick={() => {
                  check(STATUS_CONFIRMED)
                  setSubmitType('taxInvoice')
                }}
              >
                Save And Issue Tax Invoice
              </Button>
              <Button variant='outlined' onClick={() => handleCancel()}>
                Cancel
              </Button>
            </Box>
          </form>
        )}
      </>

      {isAddNewModalOpen && (
        <AddCustomerPopup open={isAddNewModalOpen} setOpen={setIsAddNewModalOpen} setFormValue={setValue} />
      )}

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

export default CreateSalesOrder
