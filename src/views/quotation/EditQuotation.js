// ** Next Import
import Link from 'next/link'
import Router, { useRouter } from 'next/router'
import * as React from 'react'
import { useState } from 'react'
import {
  Box,
  IconButton,
  Typography,
  Grid,
  FormLabel,
  FormHelperText,
  Checkbox,
  Button,
  Snackbar,
  Alert,
  Backdrop,
  CircularProgress,
  LinearProgress
} from '@mui/material'
import CustomTextField from 'src/@core/components/mui/text-field'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import CustomDatePicker from 'src/views/forms/form-elements/pickers/CustomDatePicker'
import {
  GetObjectFromName,
  checkAuthorizedRoute,
  convertCurrency,
  fetchPdfFile,
  getLeadDays,
  parseDate,
  safeNumber,
  trimStrings
} from 'src/common-functions/utils/UtilityFunctions'
import { Close } from '@mui/icons-material'
import { findObjectByCurrencyId } from 'src/common-functions/utils/UtilityFunctions'
import { preference } from 'src/@fake-db/autocomplete'
import { useSelector, useDispatch } from 'react-redux'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import PageHeader from 'src/@core/components/page-header'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useEffect } from 'react'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { updateQuotationMutation } from 'src/@core/components/graphql/quotation-queries'
import { createAlert } from 'src/store/apps/alerts'
import CustomFilesUpload from 'src/views/forms/form-elements/custom-inputs/CustomFilesUpload'
import DeleteUploadFile from 'src/views/forms/form-elements/custom-inputs/DeleteUploadFile'
import { UploadMultipleFileS3Api } from 'src/views/forms/form-elements/custom-inputs/UploadMultipleFileS3Api'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import SaveOtherSettingOtherOption from 'src/views/forms/form-elements/custom-inputs/SaveOtherSettingOtherOption'
import {
  QUOTATION_PDF,
  EDIT_QUOTATION,
  STATUS_CONFIRMED,
  STATUS_DRAFT,
  STATUS_SENT
} from 'src/common-functions/utils/Constants'
import SalesOrderItemsTable from '../sales/SalesOrder/SalesOrderItemsTable'
import { setUpdateQuotation } from 'src/store/apps/quotations'
import AddCustomerPopup from 'src/common-components/AddCustomerPopup'
import useCustomers from 'src/hooks/getData/useCustomers'
import useWarehouses from 'src/hooks/getData/useWarehouses'

export default function EditQuotation({ quotationObject, loading }) {
  const route = Router
  const dispatch = useDispatch()
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState('')
  const router = useRouter()
  const userProfile = useSelector(state => state.userProfile)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const quotation = useSelector(state => state.quotations?.selectedQuotation) || {}
  const [itemList, setItemList] = useState([])

  const {
    tradings = [],
    currencies = [],
    countries = [],
    paymentTerms = [],
    settings = [],
    priceLists = []
  } = quotationObject || {}

  const [separateOtherCharges, setSeparateOtherCharges] = useState([])

  useEffect(() => {
    setSeparateOtherCharges(quotation?.otherCharges)
  }, [quotation])
  // Function to find an object by id
  function findObjectById(array, countryId) {
    return array.find(obj => obj.name === countryId)
  }
  const tenant = useSelector(state => state.tenants?.selectedTenant)
  const { tenantId } = tenant || ''
  const { customers, fetchCustomers } = useCustomers(tenantId)
  const { warehouses } = useWarehouses(tenantId)
  const [shippingPreference, setShippingPreference] = useState(preference)
  const [paymentTerm, setPaymentTerm] = useState(paymentTerms)
  const [selectedPdFile, setSelectedPdFile] = useState([])
  const [deletedPdFiles, setDeletedPdFiles] = useState([])
  const [checked, setChecked] = useState(false)
  const [loader, setLoader] = React.useState(false)

  const [customer, setCustomer] = useState({})

  useEffect(() => {
    if (!tenantId) return
    const loadCustomers = async () => {
      await fetchCustomers()
    }

    loadCustomers()
  }, [tenantId, fetchCustomers])

  useEffect(() => {
    if (Object.keys(quotation).length === 0) {
      router.push('/sales/quotation/')
    }
  }, [quotation, tenantId])

  const [billingAddressCountry, setBillingAddressCountry] = useState(
    findObjectById(countries, quotation?.billingAddress?.country)
  )

  const [deliveryAddressCountry, setDeliveryAddressCountry] = useState(
    findObjectById(countries, quotation?.deliveryAddress?.country)
  )
  useEffect(() => {
    if (quotation?.files?.length > 0) {
      quotation?.files?.map(item => {
        fetchPdfFile(setSelectedPdFile, item)
      })
      setDeletedPdFiles(quotation?.files)
    }
  }, [quotation])
  useEffect(() => {
    setBillingAddressCountry(findObjectById(countries, quotation?.billingAddress?.country))
    setDeliveryAddressCountry(findObjectById(countries, quotation?.deliveryAddress?.country))
  }, [quotation, countries])

  const [selectedCurrency, setSelectedCurrency] = useState()
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
    mode: 'onChange'
  })

  useEffect(() => {
    const currency = currencies?.find(currency => currency.currencyId === quotation.currency) || ''
    const discountType =
      currencies?.find(currency => currency.currencyId === quotation.discountType) || quotation.discountType

    reset({
      ...quotation,
      currency: currency,
      discountType: discountType,
      quotationItems: quotation?.quotationItems?.map(item => ({
        ...item,
        enableDimension: products?.find(val => val.itemId === item.itemId)?.enableDimension || false,
        enablePackingUnit: products?.find(val => val.itemId === item.itemId)?.enablePackingUnit || false,
        packingUnits: products?.find(val => val.itemId === item.itemId)?.packingUnits || []
      }))
    })
    setSelectedCurrency(currency)
  }, [quotation, customers, currencies])

  const getCurrency = watch('currency')
  const [typeOptions, setTypeOptions] = React.useState([])
  const resetOptions = () => {
    const staticType = [{ key: '%', value: 'PERCENTAGE' }]
    const currency = currencies?.find(val => val?.currencyId === getCurrency?.currencyId)
    const newOption = { key: currency?.symbol, value: 'VALUE' }
    const updatedOptions = [...staticType, newOption]
    setTypeOptions(updatedOptions)
  }

  useEffect(() => {
    resetOptions()
  }, [getCurrency])

  const [isAddNewModalOpen, setIsAddNewModalOpen] = useState(false)

  const handleAddNewCustomer = () => {
    setIsAddNewModalOpen(true)
  }

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

  const handleUpdateQuotationSave = async editQuotation => {
    setOpen(false)
    setLoader(true)
    let payload = {
      ...editQuotation,
      status,
      totalAmount: safeNumber(editQuotation.totalAmount),
      discountValue: safeNumber(editQuotation.discountValue),
      customerId: editQuotation?.customerId,
      currency: editQuotation?.currency?.currencyId,
      dueDate: parseDate(editQuotation.dueDate),
      quotationDate: parseDate(editQuotation.quotationDate),
      quotationItems: editQuotation?.quotationItems?.map(item => {
        const { sellingPriceCurrency, originalPrice, packedQty, serviceDate, ...items } = item

        return {
          itemId: item?.itemId,
          itemName: item?.itemName,
          qty: item?.qty,
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
      otherCharges: separateOtherCharges
    }
    const tenantId = payload?.tenantId
    const quotationId = payload?.quotationId

    delete payload?.quotationId
    delete payload?.tenantId
    delete payload?.quotationNo
    delete payload?.paymentStatus
    delete payload?.createdBy
    delete payload?.modifiedBy
    delete payload?.createdDateTime
    delete payload?.modifiedDateTime
    delete payload?.balance
    delete payload?.deletedDateTime
    delete payload?.deletedBy
    delete payload?.paymentDate

    const quotation = payload

    SaveOtherSettingOtherOption(tenantId, settings, editQuotation, dispatch, 'salesOrder')

    try {
      const response = await writeData(updateQuotationMutation(), { tenantId, quotationId, quotation })
      if (response.updateQuotation) {
        if (deletedPdFiles.length > 0 && selectedPdFile) {
          deletedPdFiles.forEach(async element => {
            const findDeleted = selectedPdFile.find(item => item.key === element.key)
            if (!findDeleted) {
              await DeleteUploadFile(element.key)
            }
          })
        }
        if (selectedPdFile || selectedPdFile?.length !== 0 || selectedPdFile[0]) {
          await UploadMultipleFileS3Api(selectedPdFile, dispatch)
        }
        dispatch(setUpdateQuotation(response.updateQuotation))
        dispatch(createAlert({ message: 'Quotation Updated successfully !', type: 'success' }))
        route.push(`/sales/quotation`)
      } else {
        setLoader(false)
        dispatch(createAlert({ message: 'Quotation Updation failed !', type: 'error' }))
      }
    } catch (error) {
      setLoader(false)
      console.error('error', error)
    }
  }

  const handleSameBillingAddress = e => {
    setChecked(e.target.checked)
    const checked = e.target.checked
    if (checked == true) {
      setValue('deliveryAddress', getValues('billingAddress'))
    } else if (checked == false) {
      const addressFields = {
        addressLine1: '',
        addressLine2: '',
        cityOrTown: '',
        state: '',
        postcode: '',
        country: ''
      }
      setValue('deliveryAddress', addressFields)
    }
    trigger(['deliveryAddress'])
  }
  const billingAddressObject = quotation?.billingAddress || {}
  const deliveryAddressObject = quotation?.deliveryAddress || {}

  useEffect(() => {
    const areAddressesEqual = JSON.stringify(billingAddressObject) === JSON.stringify(deliveryAddressObject)
    setChecked(areAddressesEqual)
  }, [billingAddressObject, deliveryAddressObject])

  const billingAddress = useWatch({ control, name: 'billingAddress' })
  const deliveryAddress = useWatch({ control, name: 'deliveryAddress' })

  const areAddressesSame = (a, b) => {
    return JSON.stringify(trimStrings(a)) === JSON.stringify(trimStrings(b))
  }

  useEffect(() => {
    setChecked(areAddressesSame(billingAddress, deliveryAddress))
  }, [billingAddress, deliveryAddress])

  useEffect(() => {
    if (checkAuthorizedRoute(EDIT_QUOTATION, router, userProfile)) {
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
            Edit Quotation - {quotation?.quotationNo}
          </Typography>
        }
        button={
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
            <IconButton
              variant='outlined'
              color='default'
              sx={{ fontSize: '21px' }}
              component={Link}
              href='/sales/quotation'
              onClick={() => reset(quotation)}
            >
              <Close sx={{ color: theme => theme.palette.primary.main }} />
            </IconButton>
          </Box>
        }
      />
      <PageWrapper>
        {loading ? (
          <LinearProgress />
        ) : (
          <form onSubmit={handleSubmit(handleUpdateQuotationSave)}>
            <Grid container spacing={{ xs: 5 }}>
              <Grid item xs={12} md={12} lg={9}>
                <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                  {tenant?.useTradingInfo === true && tradings?.length > 0 && quotation?.tradingId !== null && (
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
                            value={tradings.find(option => option.tradingId === field.value) || null}
                            onChange={(event, newValue) => {
                              field.onChange(newValue ? newValue.tradingId : null)
                            }}
                            sx={{ flexGrow: 1 }}
                            renderInput={params => <CustomTextField {...params} fullWidth label='Trading Name' />}
                          />
                        )}
                      />
                    </Grid>
                  )}
                  <Grid item xs={12} sm={4} md={3}>
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
                          value={customers.find(option => option.customerId === field.value) || null}
                          onChange={(e, newValue) => {
                            if (newValue?.customerId === 'add-new') {
                              handleAddNewCustomer()
                              return
                            }
                            field.onChange(newValue ? newValue.customerId : null)
                            setValue('paymentTerms', newValue?.paymentTerms)
                            setPaymentTerm(paymentTerms?.map(item => item?.paymentTerms))
                            setValue('shippingPreference', newValue?.shippingPreference)
                            setShippingPreference(preference)
                            setDeliveryAddressCountry(
                              GetObjectFromName(newValue?.deliveryAddress?.country, countries) || countries[0]
                            )
                            const country =
                              GetObjectFromName(newValue?.deliveryAddress?.country, countries) || countries[0]
                            const state = GetObjectFromName(newValue?.deliveryAddress?.state, country?.states)
                            setValue('deliveryAddress.country', country?.name)
                            setValue('deliveryAddress.state', state?.name)
                            setValue('deliveryAddress.cityOrTown', newValue?.deliveryAddress?.cityOrTown)
                            setValue('deliveryAddress.postcode', newValue?.deliveryAddress?.postcode)
                            setValue('deliveryAddress.addressLine1', newValue?.deliveryAddress?.addressLine1)
                            setValue('deliveryAddress.addressLine2', newValue?.deliveryAddress?.addressLine2)
                            setValue('billingAddress.country', country?.name)
                            setValue('billingAddress.state', state?.name)
                            setValue('billingAddress.cityOrTown', newValue?.billingAddress?.cityOrTown)
                            setValue('billingAddress.postcode', newValue?.billingAddress?.postcode)
                            setValue('billingAddress.addressLine1', newValue?.billingAddress?.addressLine1)
                            setValue('billingAddress.addressLine2', newValue?.billingAddress?.addressLine2)
                            const currency = findObjectByCurrencyId(currencies, newValue?.currencyId)
                            setValue('currency', currency)
                            setSelectedCurrency(currency)
                            setValue('discountType', currency)
                            const filterlist = priceLists?.find(priceList =>
                              priceList?.customers?.some(customer => customer.customerId === newValue?.customerId)
                            )
                            setItemList(filterlist?.itemList)

                            trigger([
                              'deliveryAddress.country',
                              'deliveryAddress.state',
                              'deliveryAddress.cityOrTown',
                              'deliveryAddress.postcode',
                              'deliveryAddress.addressLine1',
                              'deliveryAddress.addressLine2',
                              'billingAddress.country',
                              'billingAddress.state',
                              'billingAddress.cityOrTown',
                              'billingAddress.postcode',
                              'billingAddress.addressLine1',
                              'billingAddress.addressLine2',
                              'paymentTerms',
                              'shippingPreference',
                              'currency'
                            ])
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
                          label={'Date'}
                          fullWidth={true}
                          date={field.value ? new Date(field.value) : new Date()}
                          onChange={field.onChange}
                          error={Boolean(errors?.quotationDate)}
                        />
                      )}
                    />
                    {errors?.quotationDate && <FormHelperText error>Order Date is required</FormHelperText>}
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
                          date={field.value ? new Date(field.value) : null}
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
                      rules={{ required: false }}
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
                            console.log('selectedCurrency:', selectedCurrency)
                            if (selectedCurrency) {
                              if (quotationItems?.length > 0) {
                                console.log('quotationItems?.length ::', quotationItems?.length)
                                quotationItems.map((item, i) => {
                                  if (item.sellingPrice !== null || item.sellingPrice !== '') {
                                    console.log('item.sellingPrice !== null ::', item.sellingPrice)

                                    let convCp = convertCurrency(
                                      selectedCurrency?.exchangeRate,
                                      1,
                                      newValue?.exchangeRate,
                                      item.sellingPrice
                                    ).toFixed(2)
                                    console.log('convCp::', convCp)
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
                          {...(errors.reference && { helperText: 'Reference is required' })}
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
                          options={shippingPreference}
                          getOptionLabel={option => option || ''}
                          renderInput={params => (
                            <CustomTextField
                              {...params}
                              label='Shipment Preference'
                              error={Boolean(errors.shippingPreference)}
                              {...(errors.shippingPreference && { helperText: 'shippingPreference is required' })}
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
                              setValue('dueDate', '')
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
              <Grid item xs={12} lg={12} xl={12} id='quotationItems'>
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
                  settings={settings}
                  itemList={itemList}
                  separateOtherCharges={separateOtherCharges}
                  setSeparateOtherCharges={setSeparateOtherCharges}
                  enabledTaxes={quotation.taxes}
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

              <Button component={Link} href='/sales/quotation' variant='outlined' onClick={() => reset(quotation)}>
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
    </>
  )
}
