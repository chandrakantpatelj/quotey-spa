// ** Next Import
import { Close } from '@mui/icons-material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
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
  TableBody,
  TableCell,
  TableRow,
  Typography
} from '@mui/material'
import Link from 'next/link'
import Router from 'next/router'
import { useEffect, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import {
  updatePurchaseOrderAndMoveToFirstStageMutation,
  updatePurchaseOrderMutation
} from 'src/@core/components/graphql/purchase-order-queries'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import { preference } from 'src/@fake-db/autocomplete'
import AddVendorPopup from 'src/common-components/AddVendorPopup'
import { CommonViewTable, ShowAddress } from 'src/common-components/CommonPdfDesign'
import CommonVendorPopup from 'src/common-components/CommonVendorPopup'
import StyledButton from 'src/common-components/StyledMuiButton'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { PURCHASE_ORDER_PDF, STATUS_DRAFT } from 'src/common-functions/utils/Constants'
import { multiplyDecimalsWithoutRounding } from 'src/common-functions/utils/DecimalUtils'
import {
  DateFunction,
  fetchPdfFile,
  findObjectByCurrencyId,
  getExchangeRate,
  parseDate,
  rowStatusChip,
  safeNumber
} from 'src/common-functions/utils/UtilityFunctions'
import useProducts from 'src/hooks/getData/useProducts'
import { createAlert } from 'src/store/apps/alerts'
import { setUpdatePurchaseOrder } from 'src/store/apps/purchaseorder'
import CustomFilesUpload from 'src/views/forms/form-elements/custom-inputs/CustomFilesUpload'
import DeleteUploadFile from 'src/views/forms/form-elements/custom-inputs/DeleteUploadFile'
import { UploadMultipleFileS3Api } from 'src/views/forms/form-elements/custom-inputs/UploadMultipleFileS3Api'
import CustomDatePicker from 'src/views/forms/form-elements/pickers/CustomDatePicker'
import ItemsTable from 'src/views/purchase/purchase-order/ItemsTable'

export default function EditPurchaseOrder({ purchaseOrderData, loading }) {
  const route = Router
  const dispatch = useDispatch()
  const tenantId = useSelector(state => state.tenants?.selectedTenant.tenantId)
  const { products, fetchProducts } = useProducts(tenantId)
  const {
    currencies = [],
    countries = [],
    vendors = [],
    paymentTerms = [],
    tradings = [],
    warehouses = [],
    purchaseModuleSetting = []
  } = purchaseOrderData || {}

  const order = useSelector(state => state?.purchaseOrder?.selectedPurchaseOrder)
  const vendor = vendors?.find(item => item?.vendorId === order?.vendorId) ?? ''

  const [paymentTerm, setPaymentTerm] = useState(paymentTerms)
  const [shippingPreference, setShippingPreference] = useState(preference)
  const [loader, setLoader] = useState(false)
  const [selectedPdFile, setSelectedPdFile] = useState([])
  const [deletedPdFiles, setDeletedPdFiles] = useState([])
  const [vendorCurrency, setVendorCurrency] = useState(findObjectByCurrencyId(currencies, order?.currency))
  const [vendorExchangeRate, setVendorExchangeRate] = useState(vendorCurrency?.exchangeRate)
  const [status, setStatus] = useState(order?.status)
  const localCurrency = useSelector(state => state?.currencies?.selectedCurrency)

  useEffect(() => {
    if (Object.keys(order).length === 0) {
      route.push('/purchases/purchase-order/')
    }
    fetchProducts()
  }, [order, tenantId, fetchProducts])

  function findObjectById(array, countryId) {
    return array.find(obj => obj.name === countryId)
  }

  const [billingAddressCountry, setBillingAddressCountry] = useState(
    findObjectById(countries, order?.billingAddress?.country)
  )

  const [deliveryAddressCountry, setDeliveryAddressCountry] = useState(
    findObjectById(countries, order?.deliveryAddress?.country)
  )

  const selectedtenant = useSelector(state => state.tenants?.selectedTenant) || ''
  const trading = tradings?.find(val => val.tradingId === order?.tradingId || '') || {}
  const isTradingProfile = Object.keys(trading).length >= 1

  useEffect(() => {
    setBillingAddressCountry(findObjectById(countries, order?.billingAddress?.country))
    setDeliveryAddressCountry(findObjectById(countries, order?.deliveryAddress?.country))
  }, [order, countries])

  const tenant = {
    ...selectedtenant,
    businessName: isTradingProfile ? trading?.tradingName : selectedtenant?.businessName
  }

  const defaultData = {
    ...order,
    currency: vendorCurrency,
    warehouseId: warehouses?.find(item => item?.warehouseId === order?.warehouseId) || '',
    taxes: [],
    expenses: [],
    orderItems: order?.orderItems?.map(item => {
      const product = products?.find(val => val.itemId === item.itemId)

      return {
        ...item,
        dimensions: product?.dimensions || {},
        enableDimension: product?.enableDimension ?? false,
        enablePackingUnit: product?.enablePackingUnit || false,
        packingUnits: product?.packingUnits || [],
        localPurchasePrice: multiplyDecimalsWithoutRounding(item?.purchasePrice, order?.currencyExchangeRate)
      }
    })
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
    defaultValues: defaultData,
    mode: 'onChange'
  })

  useEffect(() => {
    if (order?.files?.length > 0) {
      setSelectedPdFile([])
      order?.files?.map(item => {
        fetchPdfFile(setSelectedPdFile, item)
      })
      setDeletedPdFiles(order?.files)
    }
  }, [order])
  let orderItems = getValues('orderItems')
  let allExpenses = getValues('expenses')
  let allTaxes = getValues('taxes')
  let currencyExchangeRate = getValues('currencyExchangeRate')
  let purchaseType = getValues('purchaseType')
  let orderDate = watch('orderDate')
  let selectedPaymentTerms = watch('paymentTerms')
  let selectedVendor = watch('vendorId')

  let mainVendor = vendors?.find(val => val?.vendorId === selectedVendor)

  let settingPurchaseData = purchaseModuleSetting?.find(item => item?.purchaseType === purchaseType)

  let { taxes = [], expenses = [] } = settingPurchaseData || {}
  const setValueFieldByKey = (section, key, updatedField, value) => {
    const currentValues = getValues(section)
    const index = currentValues.findIndex(item => item.key === key)

    if (index !== -1) {
      setValue(`${section}[${index}].${updatedField}`, value)
    }
  }

  useEffect(() => {
    const mapTaxes = order?.taxes?.flatMap(val => {
      return taxes
        .filter(item => item.taxId === val.taxId)
        .map(item => ({ ...val, inLocalCurrency: item?.inLocalCurrency }))
    })

    setValue(`taxes`, mapTaxes)

    const mapExpenses = order?.expenses?.flatMap(val => {
      return expenses
        .filter(item => item.expenseId === val.expenseId)
        .map(item => ({ ...val, inLocalCurrency: item?.inLocalCurrency }))
    })

    setValue(`expenses`, mapExpenses)
  }, [order, loading])

  const { update } = useFieldArray({
    control,
    name: 'orderItems'
  })
  const filteredVendors = vendors?.filter(item => settingPurchaseData?.currencies?.includes(item?.currencyId))

  const [isAddNewModalOpen, setIsAddNewModalOpen] = useState(false)

  const handleAddNewVendor = () => {
    setIsAddNewModalOpen(true)
  }

  const [open, setOpen] = useState(false)
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }

    setOpen(false)
  }

  const [openVendorDialog, setOpenVendorDialog] = useState(false)

  const handleVendorDialoge = () => {
    setOpenVendorDialog(!openVendorDialog)
  }

  const [submitType, setSubmitType] = useState('')

  const check = status => {
    setStatus(status)
    setOpen(true)
    const fieldName = Object.keys(errors)[0]
    const errName = document.getElementById(fieldName)
    errName?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
  }

  const handleUpdateOrderSave = async data => {
    setOpen(false)
    setLoader(true)

    const {
      orderNo,
      stages,
      accountingEvents,
      lockedComponents,
      currentStage,
      previousStatus,
      previousStage,
      nextStatus,
      nextStage,
      moveToNextStage,
      undoCurrentStage,
      createdBy,
      createdDateTime,
      deletedBy,
      modifiedBy,
      modifiedDateTime,
      deletedDateTime,
      orderNoPrefix,
      deliveryStatus,
      paymentStatus,
      purchaseModuleSettingVersion,
      ...editOrder
    } = data

    const mapOrderItems = ({
      subTotalInLocal,
      packingUnits,
      enablePackingUnit,
      localPurchasePrice,
      enableDimension,
      dimensions,
      totalPackedQty,
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

    let payload = {
      ...editOrder,
      status: status,
      warehouseId: editOrder?.warehouseId?.warehouseId || '',
      orderDate: parseDate(editOrder?.orderDate),
      dueDate: parseDate(editOrder?.dueDate),
      deliveryDate: parseDate(editOrder?.deliveryDate),
      orderItems: editOrder?.orderItems?.map(mapOrderItems),
      currency: editOrder?.currency?.currencyId,
      taxes: editOrder?.taxes?.map(({ inLocalCurrency, ...rest }) => rest),
      expenses: editOrder?.expenses?.map(({ inLocalCurrency, ...rest }) => rest),
      subtotal: settingPurchaseData?.subtotalInLocalCurrency
        ? safeNumber(editOrder?.subTotalInLocal)
        : safeNumber(editOrder?.subtotal)
    }

    console.log('payload', payload)

    delete payload.orderId
    delete payload.tenantId
    delete payload.subTotalInLocal

    const { tenantId, orderId } = order
    const purchaseOrder = payload

    if (submitType === 'confirmed') {
      try {
        const response = await writeData(updatePurchaseOrderAndMoveToFirstStageMutation(), {
          tenantId,
          orderId,
          purchaseOrder
        })
        if (response?.updatePurchaseOrderAndMoveToFirstStage) {
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
          dispatch(setUpdatePurchaseOrder(response.updatePurchaseOrderAndMoveToFirstStage))
          dispatch(createAlert({ message: 'PurchaseOrder Updated and confrimed successfully !', type: 'success' }))
          route.push('/purchases/purchase-order/')
        } else {
          setLoader(false)
          const errorMessage = response?.errors?.[0] ? response.errors[0].message : 'PurchaseOrder Updation  failed !'
          dispatch(createAlert({ message: errorMessage, type: 'error' }))
        }
      } catch (error) {
        // Handle any errors and optionally dispatch an error action
        setLoader(false)
        dispatch(createAlert({ message: 'PurchaseOrder Updation  failed !', type: 'error' }))
        reset(editOrder)
      }
    } else {
      try {
        const response = await writeData(updatePurchaseOrderMutation(), { tenantId, orderId, purchaseOrder })
        if (response?.updatePurchaseOrder) {
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
          dispatch(setUpdatePurchaseOrder(response.updatePurchaseOrder))
          dispatch(createAlert({ message: 'PurchaseOrder Updated  successfully !', type: 'success' }))
          route.push('/purchases/purchase-order/')
        } else {
          setLoader(false)
          const errorMessage = response?.errors?.[0] ? response.errors[0].message : 'PurchaseOrder Updation  failed !'
          dispatch(createAlert({ message: errorMessage, type: 'error' }))
        }
      } catch (error) {
        // Handle any errors and optionally dispatch an error action
        setLoader(false)
        dispatch(createAlert({ message: 'PurchaseOrder Updation  failed !', type: 'error' }))
        reset(editOrder)
      }
    }
  }

  const getLeadDays = terms => {
    const leadDays = paymentTerms?.find(item => item?.paymentTerms === terms)
    if (leadDays?.leadDays === '999') {
      return -1
    } else {
      return parseInt(leadDays?.leadDays)
    }
  }

  const isOrderDetailLocked = order?.lockedComponents?.includes('ORDER_DETAILS')
  const isExchangeRateLocked = order?.lockedComponents?.includes('EXCHANGE_RATE')

  return (
    <div>
      <PageHeader
        title={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography
              sx={{
                fontSize: { xs: '16px', md: '18px' },
                fontWeight: '500'
              }}
            >
              Edit Order- {order?.orderNo}
            </Typography>
          </Box>
        }
        button={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              variant='contained'
              color='primary'
              sx={{ display: { xs: 'none', sm: 'flex' } }}
              startIcon={<AddOutlinedIcon />}
              component={Link}
              href={`/purchases/purchase-order/add-purchaseorder`}
            >
              Add New
            </Button>
            <IconButton color='default' component={Link} href='/purchases/purchase-order/'>
              <Close sx={{ color: theme => theme.palette.primary.main }} />
            </IconButton>
          </Box>
        }
      />
      <PageWrapper>
        {loading ? (
          <LinearProgress />
        ) : (
          <form onSubmit={handleSubmit(handleUpdateOrderSave)}>
            <Grid container spacing={{ xs: 5 }}>
              {isOrderDetailLocked ? (
                <Grid item xs={12} md={12} xl={9}>
                  <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                    <Grid item xs={12}>
                      <Grid
                        container
                        spacing={5}
                        sx={{
                          display: 'flex',
                          flexDirection: { xs: 'column', sm: 'row' }
                        }}
                      >
                        <Grid item xs={12} sm={6} md={5.5} xl={4}>
                          <Typography
                            sx={{
                              fontSize: '15px',
                              // color: '#818181',
                              fontWeight: 500,
                              wordBreak: 'break-all',
                              lineHeight: '26px'
                            }}
                          >
                            {tenant?.businessName}
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: '12px',
                              color: '#818181',
                              lineHeight: '23px'
                            }}
                          >
                            Reference: {order?.reference ? order?.reference : '-'}
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: '12px',
                              color: '#818181',
                              lineHeight: '23px'
                            }}
                          >
                            Shipment Preference: {order?.shippingPreference ? order?.shippingPreference : '-'}
                          </Typography>
                        </Grid>
                        <Grid item xs={0} sm={0} md={1} xl={3.1} sx={{ display: { xs: 'none', md: 'block' } }}></Grid>

                        <Grid item xs={12} sm={6} md={5} lg={5.5} xl={4.6} sx={{ width: '80%' }}>
                          <CommonViewTable>
                            <TableBody>
                              <TableRow>
                                <TableCell sx={{ width: '50%' }}>
                                  <Typography className='data-name'>Order Date</Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography className='data-value'>{DateFunction(order?.orderDate)}</Typography>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ width: '50%' }}>
                                  <Typography className='data-name'>Due Date</Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography
                                    className='data-value'
                                    sx={{ fontSize: '12px', fontWeight: 400, lineHeight: '22px' }}
                                  >
                                    {DateFunction(order?.dueDate)}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ width: '50%' }}>
                                  <Typography className='data-name'>Terms</Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography
                                    className='data-value'
                                    sx={{ fontSize: '12px', fontWeight: 400, lineHeight: '22px' }}
                                  >
                                    {order?.paymentTerms ? order?.paymentTerms : '-'}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ width: '50%' }}>
                                  <Typography className='data-name'>Order No</Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography
                                    className='data-value'
                                    sx={{
                                      fontSize: '12px',
                                      fontWeight: 400,
                                      lineHeight: '22px',
                                      color: '#4567c6 !important'
                                    }}
                                  >
                                    #{order?.orderNo}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ width: '50%' }}>
                                  <Typography className='data-name'>Delivery Status </Typography>
                                </TableCell>
                                <TableCell>{rowStatusChip(order?.deliveryStatus)}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ width: '50%' }}>
                                  <Typography className='data-name'>Status </Typography>
                                </TableCell>
                                <TableCell>{rowStatusChip(order?.status)}</TableCell>
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
                          display: 'flex'
                          // flexDirection: { xs: 'column', sm: 'row' }
                        }}
                      >
                        {' '}
                        <Grid item xs={6} sm={6} md={5} xl={3.5}>
                          <Typography
                            sx={{
                              fontSize: '13px',
                              fontWeight: 500,
                              lineHeight: '24px'
                            }}
                          >
                            Vendor
                          </Typography>
                          <CommonViewTable>
                            <TableBody>
                              <TableRow>
                                <TableCell>
                                  <StyledButton color='primary' onClick={handleVendorDialoge}>
                                    {vendor?.displayName}
                                  </StyledButton>
                                  {openVendorDialog && (
                                    <CommonVendorPopup
                                      vendorId={vendor?.vendorId}
                                      openVendorDialog={openVendorDialog}
                                      setOpenVendorDialog={setOpenVendorDialog}
                                    />
                                  )}
                                </TableCell>
                              </TableRow>
                              <ShowAddress data={vendor?.billingAddress} />
                            </TableBody>
                          </CommonViewTable>
                        </Grid>
                        <Grid item xs={0} sm={0} md={1.5} xl={3.6} sx={{ display: { xs: 'none', md: 'block' } }}></Grid>
                        <Grid item xs={6} sm={6} md={5} lg={4} xl={3.7}>
                          {' '}
                          <Typography
                            sx={{
                              fontSize: '13px',
                              fontWeight: 500,
                              lineHeight: '24px'
                            }}
                          >
                            Delivery Address
                          </Typography>
                          <CommonViewTable>
                            <TableBody>
                              <ShowAddress data={order?.deliveryAddress} />{' '}
                            </TableBody>
                          </CommonViewTable>
                        </Grid>{' '}
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        {isExchangeRateLocked ? (
                          <Typography
                            sx={{
                              fontSize: '13px',
                              fontWeight: 500,
                              lineHeight: '24px'
                            }}
                          >
                            <span> Exchange Rate: </span>
                            {getValues('currencyExchangeRate')}
                          </Typography>
                        ) : (
                          <Controller
                            name='currencyExchangeRate'
                            control={control}
                            render={({ field }) => (
                              <CustomTextField
                                {...field}
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
                                sx={{ width: '230px', float: 'right' }}
                                label='Exchange Rate'
                              />
                            )}
                          />
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
              ) : (
                <>
                  <Grid item xs={12} md={12} xl={9}>
                    <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                      <Grid item xs={6} sm={4} md={3}>
                        <Controller
                          name='purchaseType'
                          control={control}
                          rules={{ required: false }}
                          render={({ field }) => (
                            <CustomAutocomplete
                              {...field}
                              options={purchaseModuleSetting}
                              getOptionLabel={option => option?.purchaseType || ''}
                              value={
                                purchaseModuleSetting?.find(option => option.purchaseType === field?.value) || null
                              }
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
                    <Grid container spacing={{ xs: 4 }}>
                      {tenant?.useTradingInfo === true && tradings?.length > 0 && order?.tradingId !== null && (
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
                              value={filteredVendors?.find(option => option.vendorId === field.value) || null}
                              onChange={(event, newValue) => {
                                if (newValue?.vendorId === 'add-new') {
                                  handleAddNewVendor()
                                  return
                                }
                                field.onChange(newValue ? newValue.vendorId : null)
                                let curretVendorCurrency = currencies.find(
                                  cur => cur?.currencyId === newValue?.currencyId
                                )
                                const getRate = getExchangeRate(
                                  curretVendorCurrency?.exchangeRate || 1,
                                  localCurrency?.exchangeRate
                                )
                                setValue(`currencyExchangeRate`, getRate)
                                const vendorRate = getExchangeRate(
                                  vendorExchangeRate,
                                  curretVendorCurrency?.exchangeRate
                                )
                                orderItems?.map((item, i) => {
                                  let convCp = multiplyDecimalsWithoutRounding(item?.purchasePrice, vendorRate)
                                  setValue(`orderItems[${i}].purchasePrice`, parseFloat(convCp)?.toFixed(2))
                                  update(`orderItems[${i}].purchasePrice`, parseFloat(convCp)?.toFixed(2))

                                  let convLocalCp = multiplyDecimalsWithoutRounding(item?.purchasePrice, getRate)
                                  setValue(`orderItems[${i}].localPurchasePrice`, parseFloat(convLocalCp)?.toFixed(2))
                                  update(`orderItems[${i}].localPurchasePrice`, parseFloat(convLocalCp)?.toFixed(2))
                                })

                                allTaxes?.map((item, i) => {
                                  !item?.inLocalCurrency &&
                                    setValueFieldByKey(
                                      'taxes',
                                      item.key,
                                      'taxValueCurrency',
                                      curretVendorCurrency?.currencyId
                                    )
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
                                // setValue('vendorId', newValue)

                                trigger(['paymentTerms', 'shippingPreference', 'currency'])
                                const leadDays = getLeadDays(newValue?.paymentTermsId)
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
                              isOptionEqualToValue={(option, value) => option.vendorId === value.vendorId}
                              disableClearable
                              renderOption={(props, option) => {
                                // Check if the option is "Add New Customer"
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
                                  <li {...props}>
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
                                const getRate = getExchangeRate(
                                  newValue?.exchangeRate || 1,
                                  localCurrency?.exchangeRate
                                )

                                setValue(`currencyExchangeRate`, getRate)

                                const vendorRate = getExchangeRate(vendorExchangeRate, newValue?.exchangeRate)

                                orderItems?.map((item, i) => {
                                  let convCp = multiplyDecimalsWithoutRounding(item?.purchasePrice, vendorRate)
                                  setValue(`orderItems[${i}].purchasePrice`, parseFloat(convCp)?.toFixed(2))
                                  update(`orderItems[${i}].purchasePrice`, parseFloat(convCp)?.toFixed(2))

                                  let convLocalCp = multiplyDecimalsWithoutRounding(item?.purchasePrice, getRate)
                                  setValue(`orderItems[${i}].localPurchasePrice`, parseFloat(convLocalCp)?.toFixed(2))
                                  update(`orderItems[${i}].localPurchasePrice`, parseFloat(convLocalCp)?.toFixed(2))
                                })

                                allTaxes?.map((item, i) => {
                                  !item?.inLocalCurrency &&
                                    setValueFieldByKey('taxes', item.key, 'taxValueCurrency', newValue?.currencyId)
                                })
                                allExpenses
                                  ?.filter(a => a.paidToMainVendor)
                                  ?.forEach(item => {
                                    item.expenseValueCurrency = newValue?.currencyId
                                  })

                                setVendorExchangeRate(newValue?.exchangeRate)
                                setVendorCurrency(newValue)
                              }}
                              renderInput={params => <CustomTextField {...params} fullWidth label='Currency' />}
                            />
                          )}
                        />
                      </Grid>
                      {vendorCurrency?.exchangeRate !== localCurrency?.exchangeRate && (
                        <Grid item xs={6} sm={4} md={3}>
                          {isExchangeRateLocked ? (
                            <Typography
                              sx={{
                                fontSize: '13px',
                                fontWeight: 500,
                                lineHeight: '24px'
                              }}
                            >
                              <span style={{ color: '#818181' }}> Exchange Rate:</span>{' '}
                              {getValues('currencyExchangeRate')}
                            </Typography>
                          ) : (
                            <Controller
                              name='currencyExchangeRate'
                              control={control}
                              render={({ field }) => (
                                <CustomTextField
                                  {...field}
                                  onChange={e => {
                                    const newValue = e.target.value
                                    field.onChange(newValue)

                                    orderItems?.map((item, i) => {
                                      const convLocalCp = multiplyDecimalsWithoutRounding(item?.purchasePrice, newValue)
                                      setValue(
                                        `orderItems[${i}].localPurchasePrice`,
                                        parseFloat(convLocalCp)?.toFixed(2)
                                      )
                                      update(`orderItems[${i}].localPurchasePrice`, parseFloat(convLocalCp)?.toFixed(2))
                                    })
                                  }}
                                  fullWidth
                                  label='Exchange Rate'
                                />
                              )}
                            />
                          )}
                        </Grid>
                      )}
                    </Grid>{' '}
                  </Grid>
                  <Grid item xs={12} md={12} xl={9}>
                    <Grid container spacing={{ xs: 4 }}>
                      <Grid item xs={6} sm={6} md={3}>
                        <Controller
                          name='orderDate'
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <CustomDatePicker
                              label={'Date'}
                              fullWidth={true}
                              date={field.value ? new Date(field.value) : new Date()}
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
                      <Grid item xs={6} sm={6} md={3}>
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
                      <Grid item xs={6} sm={6} md={3}>
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
                                const leadDays = getLeadDays(newValue)
                                if (leadDays > 0) {
                                  const newDate = new Date(orderDate)
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
                  <Grid item xs={12} md={12} xl={9}>
                    <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Controller
                          name='reference'
                          control={control}
                          render={({ field }) => <CustomTextField {...field} fullWidth label='Reference' />}
                        />
                      </Grid>
                      <Grid item xs={6} sm={6} md={3}>
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
                                  label='Shipping Preference'
                                  error={Boolean(errors.shippingPreference)}
                                  {...(errors.shippingPreference && {
                                    helperText: 'Shipping Preference is required'
                                  })}
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
                          <Grid item xs={6} sm={12} md={6}>
                            <Controller
                              name='billingAddress.postcode'
                              control={control}
                              rules={{ required: true }}
                              render={({ field }) => (
                                <CustomTextField
                                  id='billingAddress.postcode'
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
                      <Grid item xs={12} sm={6} id='deliveryAddress'>
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
                                value={warehouses?.length === 1 ? warehouses[0] : field?.value}
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
                                    'deliveryAddress.country',
                                    'deliveryAddress.state',
                                    'deliveryAddress.cityOrTown',
                                    'deliveryAddress.postcode',
                                    'deliveryAddress.addressLine1',
                                    'deliveryAddress.addressLine2'
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
                              rules={{ required: false }}
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
                          </Grid>{' '}
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </>
              )}
              <ItemsTable
                products={products}
                control={control}
                errors={errors}
                watch={watch}
                trigger={trigger}
                localCurrency={localCurrency}
                vendorCurrency={vendorCurrency}
                vendors={vendors}
                currencyExchangeRate={currencyExchangeRate}
                setValue={setValue}
                getValues={getValues}
                settingPurchaseData={settingPurchaseData}
                order={order}
                isOrderDetailLocked={isOrderDetailLocked}
                mainVendor={mainVendor}
              />
              {!isOrderDetailLocked && (
                <Grid item xs={12}>
                  <CustomFilesUpload
                    setValue={setValue}
                    selectedPdFile={selectedPdFile}
                    setSelectedPdFile={setSelectedPdFile}
                    folderName={PURCHASE_ORDER_PDF}
                  />
                </Grid>
              )}
            </Grid>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: { xs: 'center', sm: 'start' },
                gap: '20px',
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
              {order?.status === STATUS_DRAFT && (
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
              )}

              <Button
                variant='outlined'
                component={Link}
                href='/purchases/purchase-order/'
                type='reset'
                onClick={() => reset()}
              >
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
        <Alert onClose={handleClose} severity='error' variant='filled' sx={{ width: '100%' }}>
          Please enter all required data
        </Alert>
      </Snackbar>
      {loader ? (
        <Backdrop sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }} open={loader}>
          <CircularProgress color='inherit' />
        </Backdrop>
      ) : null}
    </div>
  )
}
