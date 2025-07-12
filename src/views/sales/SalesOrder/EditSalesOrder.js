// ** Next Import
import { Close } from '@mui/icons-material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import {
  Alert,
  Backdrop,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormHelperText,
  FormLabel,
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
import * as React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import {
  updateSalesOrderAndIssueTaxInvoiceMutation,
  updateSalesOrderAndProcessAsDeliveredMutation,
  updateSalesOrderMutation
} from 'src/@core/components/graphql/sales-order-queries'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import AddCustomerPopup from 'src/common-components/AddCustomerPopup'
import { CommonViewTable, CompanyData } from 'src/common-components/CommonPdfDesign'
import LogoBox from 'src/common-components/LogoBox'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { SALES_ORDER_PDF, STATUS_CONFIRMED, STATUS_DRAFT, STATUS_INVOICED } from 'src/common-functions/utils/Constants'
import { greaterThanOrEqual } from 'src/common-functions/utils/DecimalUtils'
import {
  capitalizeFirstLetterOnly,
  convertCurrency,
  fetchPdfFile,
  findObjectByCurrencyId,
  getLeadDays,
  parseDate,
  rowStatusChip,
  safeNumber,
  trimStrings
} from 'src/common-functions/utils/UtilityFunctions'
import useCustomers from 'src/hooks/getData/useCustomers'
import useUserAccounts from 'src/hooks/getData/useUserAccounts'
import { createAlert } from 'src/store/apps/alerts'
import { setUpdateSalesOrder } from 'src/store/apps/sales'
import CustomFilesUpload from 'src/views/forms/form-elements/custom-inputs/CustomFilesUpload'
import DeleteUploadFile from 'src/views/forms/form-elements/custom-inputs/DeleteUploadFile'
import SaveOtherSettingOtherOption from 'src/views/forms/form-elements/custom-inputs/SaveOtherSettingOtherOption'
import { UploadMultipleFileS3Api } from 'src/views/forms/form-elements/custom-inputs/UploadMultipleFileS3Api'
import CustomDatePicker from 'src/views/forms/form-elements/pickers/CustomDatePicker'
import SalesOrderItemsTable from './SalesOrderItemsTable'

export default function EditSalesOrder({ salesOrdersObject, loading, setLoading }) {
  const route = Router
  const dispatch = useDispatch()
  const tenant = useSelector(state => state.tenants?.selectedTenant || {})
  const { tenantId = '' } = tenant
  const { userAccounts } = useUserAccounts()
  const { customers, fetchCustomers } = useCustomers(tenantId)

  const {
    warehouses = [],
    countries = [],
    currencies = [],
    products = [],
    settings = [],
    tradings = [],
    salesModules = {},
    paymentTerms = [],
    priceLists = []
  } = salesOrdersObject || {}

  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState('')
  const [itemList, setItemList] = useState([])
  const [checked, setChecked] = useState(false)
  // Function to find an object by id
  function findObjectById(array, countryId) {
    return array.find(obj => obj.name === countryId)
  }
  const selectedSO = useSelector(state => state.sales?.selectedSalesOrder) || {}
  // const [selectedPaymentTerm, setPaymentTerm] = useState(paymentTerms)
  const [selectedPdFile, setSelectedPdFile] = useState([])
  const [deletedPdFiles, setDeletedPdFiles] = useState([])
  const [loader, setLoader] = React.useState(false)
  const [submitType, setSubmitType] = useState('')

  useEffect(() => {
    if (!tenantId) return
    const loadCustomers = async () => {
      await fetchCustomers()
    }

    loadCustomers()
  }, [tenantId, fetchCustomers])

  const filteredCustomers = customers?.filter(item => salesModules?.currencies?.includes(item?.currencyId))

  const [billingAddressCountry, setBillingAddressCountry] = useState(
    findObjectById(countries, selectedSO?.billingAddress?.country)
  )

  const [deliveryAddressCountry, setDeliveryAddressCountry] = useState(
    findObjectById(countries, selectedSO?.deliveryAddress?.country)
  )

  const [separateOtherCharges, setSeparateOtherCharges] = useState([])
  const [separateOrderTaxes, setSeparateOrderTaxes] = useState([])

  useEffect(() => {
    if (selectedSO?.files?.length > 0) {
      selectedSO?.files?.map(item => {
        fetchPdfFile(setSelectedPdFile, item)
      })
      setDeletedPdFiles(selectedSO?.files)
    }
  }, [selectedSO])

  useEffect(() => {
    setBillingAddressCountry(findObjectById(countries, selectedSO?.billingAddress?.country))
    setDeliveryAddressCountry(findObjectById(countries, selectedSO?.deliveryAddress?.country))
  }, [selectedSO, countries])
  const currency = useMemo(() => findObjectByCurrencyId(currencies, selectedSO?.currency), [currencies, selectedSO])
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
    defaultValues: selectedSO,
    mode: 'onChange'
  })
  const { update } = useFieldArray({
    control,
    name: 'orderItems'
  })
  const selectedPaymentTerm = watch('paymentTerms')
  const selectedOrderDate = watch('orderDate')
  const selectedSendEmailCheckBox = watch('sendEmail')
  const discountType =
    currencies?.find(currency => currency.currencyId === selectedSO.discountType)?.symbol || selectedSO.discountType

  useEffect(() => {
    const currency = currencies?.find(currency => currency.currencyId === selectedSO.currency) || ''
    const discountType =
      currencies?.find(currency => currency.currencyId === selectedSO.discountType) || selectedSO.discountType

    reset({
      ...selectedSO,
      paymentDate: selectedSO?.paymentDate ? new Date(selectedSO?.paymentDate) : null,
      currency: currency,
      discountType: discountType,
      orderItems: selectedSO?.orderItems?.map(item => {
        const product = products?.find(val => val.itemId === item.itemId)
        return {
          ...item,
          dimensions: product?.dimensions || {},
          enableDimension: product?.enableDimension ?? false,
          enablePackingUnit: product?.enablePackingUnit ?? false,
          packingUnits: product?.packingUnits || []
        }
      })
    })

    setSelectedCurrency(currency)
  }, [selectedSO, customers, currencies])

  useEffect(() => {
    setSeparateOtherCharges(selectedSO?.otherCharges)
    setSeparateOrderTaxes(selectedSO?.taxes)
  }, [selectedSO])

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

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setOpen(false)
  }

  const check = (status, type) => {
    setStatus(status)
    setSubmitType(type)

    setOpen(true)

    // Ensure errors object is not empty
    const errorKeys = Object.keys(errors)
    if (errorKeys.length > 0) {
      const fieldName = errorKeys[0]
      const errName = document.getElementById(fieldName)

      if (errName) {
        errName.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
      }
    }
  }

  let totalAmount = getValues('totalAmount')

  const [isRequired, setIsRequired] = useState(false)

  useEffect(() => {
    const compare = greaterThanOrEqual(totalAmount || 0, 20000)
    setIsRequired(compare)
  }, [totalAmount])

  const [isAddNewModalOpen, setIsAddNewModalOpen] = useState(false)

  const handleAddNewCustomer = () => {
    setIsAddNewModalOpen(true)
  }

  // const billingAddressObject = selectedSO?.billingAddress || {}
  // const deliveryAddressObject = selectedSO?.deliveryAddress || {}

  // useEffect(() => {
  //   const areAddressesEqual = JSON.stringify(billingAddressObject) === JSON.stringify(deliveryAddressObject)
  //   setChecked(areAddressesEqual)
  // }, [billingAddressObject, deliveryAddressObject])

  const billingAddress = useWatch({ control, name: 'billingAddress' })
  const deliveryAddress = useWatch({ control, name: 'deliveryAddress' })

  const areAddressesSame = (a, b) => {
    return JSON.stringify(trimStrings(a)) === JSON.stringify(trimStrings(b))
  }

  useEffect(() => {
    setChecked(areAddressesSame(billingAddress, deliveryAddress))
  }, [])

  const handleAddressCheck = e => {
    setChecked(e.target.checked)
    if (e.target.checked) {
      setValue('deliveryAddress', billingAddress)
    }
  }

  const handleUpdateOrderSave = async editSalesOrder => {
    setOpen(false)
    setLoader(true)
    let payload = {
      ...editSalesOrder,
      status: status,
      discountValue: safeNumber(editSalesOrder?.discountValue),
      totalAmount: safeNumber(editSalesOrder?.totalAmount),
      customerId: editSalesOrder?.customerId,
      currency: selectedCurrency?.currencyId,
      orderDate: parseDate(editSalesOrder?.orderDate),
      dueDate: parseDate(editSalesOrder?.dueDate),
      expectedDeliveryDate: parseDate(editSalesOrder.expectedDeliveryDate),
      expectedPackingDate: parseDate(editSalesOrder.expectedPackingDate),
      paymentDate: parseDate(editSalesOrder?.paymentDate),

      orderItems: editSalesOrder?.orderItems?.map(item => {
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
      taxes: separateOrderTaxes,
      otherCharges: separateOtherCharges
    }

    const tenantId = payload?.tenantId
    const orderId = payload?.orderId

    delete payload?.orderId
    delete payload?.salesInvoiceId
    delete payload?.tenantId
    delete payload?.orderNo
    delete payload?.orderNoPrefix
    delete payload?.createdBy
    delete payload?.modifiedDateTime
    delete payload?.modifiedBy
    delete payload?.createdDateTime
    delete payload?.paymentStatus
    delete payload?.modifiedDateTime
    delete payload?.modifiedBy
    delete payload?.createdDateTime
    delete payload?.createdBy
    delete payload?.balance
    delete payload?.deletedDateTime
    delete payload?.deletedBy
    delete payload?.deliveryStatus

    const salesOrder = payload

    SaveOtherSettingOtherOption(tenantId, settings, editSalesOrder, dispatch, 'salesOrder')

    if (submitType === 'delivered') {
      try {
        const [updatedSO] = await Promise.all([
          writeData(updateSalesOrderAndProcessAsDeliveredMutation(), { tenantId, orderId, salesOrder })
        ])
        if (updatedSO.updateSalesOrderAndProcessAsDelivered) {
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
          dispatch(setUpdateSalesOrder(updatedSO.updateSalesOrderAndProcessAsDelivered))
          dispatch(createAlert({ message: 'Sales Order Updated and delivered successfully !', type: 'success' }))
          route.push(`/sales/sales-order/`)
        } else {
          setLoader(false)
          const errorMessage = updatedSO.errors[0]
            ? updatedSO.errors[0].message
            : 'Failed to update and deliver the sales selected Sales Order!'
          dispatch(createAlert({ message: errorMessage, type: 'error' }))
        }
      } catch (error) {
        setLoader(false)
        console.error('error', error)
      }
    } else if (submitType === 'taxinvoice') {
      try {
        const [updatedSO] = await Promise.all([
          writeData(updateSalesOrderAndIssueTaxInvoiceMutation(), { tenantId, orderId, salesOrder })
        ])
        if (updatedSO.updateSalesOrderAndIssueTaxInvoice) {
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
          dispatch(setUpdateSalesOrder(updatedSO.updateSalesOrderAndIssueTaxInvoice))
          dispatch(
            createAlert({ message: 'Sales Order Updated and taxinvoice issued successfully !', type: 'success' })
          )
          route.push(`/sales/sales-order/`)
        } else {
          setLoader(false)
          const errorMessage = updatedSO.errors[0]
            ? updatedSO.errors[0].message
            : 'Failed to update and issue the tax invoice for selected Sales Order!'
          dispatch(createAlert({ message: errorMessage, type: 'error' }))
        }
      } catch (error) {
        setLoader(false)
        console.error('error', error)
      }
    } else {
      try {
        const [updatedSO] = await Promise.all([
          writeData(updateSalesOrderMutation(), { tenantId, orderId, salesOrder })
        ])
        if (updatedSO.updateSalesOrder) {
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
          dispatch(setUpdateSalesOrder(updatedSO.updateSalesOrder))
          dispatch(createAlert({ message: 'Sales Order Updated successfully !', type: 'success' }))
          route.push(`/sales/sales-order/`)
        } else {
          setLoader(false)
          const errorMessage = updatedSO.errors[0] ? updatedSO.errors[0].message : 'Sales Order Updation failed!'
          dispatch(createAlert({ message: errorMessage, type: 'error' }))
        }
      } catch (error) {
        setLoader(false)
        console.error('error', error)
      }
    }
  }

  // let itemList = priceLists?.itemList
  return (
    <React.Fragment>
      <PageHeader
        title={
          <Typography
            sx={{
              fontSize: { xs: '16px', md: '18px' },
              fontWeight: '500'
            }}
          >
            Edit Order -{selectedSO?.orderNo}
          </Typography>
        }
        button={
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            <Button
              variant='contained'
              color='primary'
              sx={{ display: { xs: 'none', sm: 'flex' } }}
              startIcon={<AddOutlinedIcon />}
              component={Link}
              scroll={true}
              href={`/sales/sales-order/add-salesorder`}
            >
              Add New
            </Button>
            <IconButton
              variant='outlined'
              color='default'
              component={Link}
              href='/sales/sales-order/'
              // onClick={() => reset(selectedSO)}
            >
              <Close sx={{ color: theme => theme.palette.primary.main }} />
            </IconButton>
          </Box>
        }
      />
      <PageWrapper>
        <form onSubmit={handleSubmit(handleUpdateOrderSave)}>
          {loading ? (
            <LinearProgress />
          ) : (
            <>
              {selectedSO?.status !== STATUS_DRAFT ? (
                <Grid container spacing={{ xs: 5, xl: 10 }}>
                  <Grid item xs={12} md={12} lg={10} xl={9}>
                    <Grid container spacing={5}>
                      <Grid item xs={12}>
                        <Grid
                          container
                          spacing={5}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            flexDirection: { xs: 'column', sm: 'row' }
                          }}
                        >
                          <Grid item xs={12} sm={7} md={6.5} xl={7.1}>
                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', md: 'row' },
                                flexWrap: { xs: 'wrap', md: 'nowrap' },
                                gap: 2
                              }}
                            >
                              <LogoBox data={selectedSO} />
                              <div>
                                <CompanyData data={selectedSO} />
                              </div>
                            </Box>
                          </Grid>

                          <Grid item xs={12} sm={5} md={4} lg={4} xl={3.7}>
                            <CommonViewTable
                              sx={{
                                '& .MuiTableRow-root > td': {
                                  py: 1.5, // Apply vertical padding to all cells
                                  borderBottom: 'none' // optional: removes dividing lines if you want a cleaner look
                                }
                              }}
                            >
                              <TableBody>
                                {' '}
                                <TableRow>
                                  <TableCell sx={{ width: '50%' }}>
                                    <Typography className='data-name' sx={{ lineHeight: '22px' }}>
                                      Order Date
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Box sx={{ mb: 2 }}>
                                      <Controller
                                        name='orderDate'
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                          <CustomDatePicker
                                            label={'Date'}
                                            fullWidth
                                            date={field.value ? new Date(field.value) : null}
                                            onChange={date => {
                                              field.onChange(date)

                                              const leadDays = getLeadDays(selectedPaymentTerm, paymentTerms)

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
                                      {errors?.orderDate && (
                                        <FormHelperText error>Order Date is required</FormHelperText>
                                      )}
                                    </Box>
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
                                    <Box sx={{ mb: 2 }}>
                                      <Controller
                                        name='dueDate'
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                          <CustomDatePicker
                                            label={'Date'}
                                            fullWidth
                                            disabled={selectedPaymentTerm !== 'Custom'}
                                            date={field.value ? new Date(field.value) : null}
                                            onChange={date => {
                                              field.onChange(date)
                                              setValue('dueDate', date)
                                              setValue('paymentDate', date)
                                              setValue('deliveryDate', date)
                                              setValue('expectedPackingDate', date)
                                            }}
                                            error={Boolean(errors?.dueDate)}
                                          />
                                        )}
                                      />
                                      {errors?.orderDate && (
                                        <FormHelperText error>Order Date is required</FormHelperText>
                                      )}
                                    </Box>
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
                                  <TableCell sx={{ width: '50%' }}>
                                    <Box sx={{ mb: 2 }}>
                                      <Controller
                                        name='expectedPackingDate'
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                          <CustomDatePicker
                                            label={'Exp. Packing Date'}
                                            fullWidth={true}
                                            date={field.value ? new Date(field.value) : null}
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
                                    </Box>
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
                                    <Box sx={{ mb: 2 }}>
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
                                                const newDate = new Date(selectedOrderDate)
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
                                    </Box>
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
                      <Grid item xs={12} md={12}>
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
                                      fullWidth
                                      label='Address Line 2'
                                      value={field.value}
                                      onChange={e => {
                                        const formattedValue = capitalizeFirstLetterOnly(e.target.value)
                                        field.onChange(formattedValue)
                                        if (checked) {
                                          setValue('deliveryAddress.addressLine2', formattedValue)
                                        }
                                      }}
                                    />
                                  )}
                                />
                              </Grid>
                              <Grid item xs={12} sm={12} md={6}>
                                <Controller
                                  name='billingAddress.cityOrTown'
                                  control={control}
                                  render={({ field }) => (
                                    <CustomTextField
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
                                    />
                                  )}
                                />
                              </Grid>{' '}
                              <Grid item xs={12} sm={12} md={6}>
                                <Controller
                                  name='billingAddress.postcode'
                                  control={control}
                                  render={({ field }) => (
                                    <CustomTextField
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
                                      options={
                                        billingAddressCountry?.states?.length ? billingAddressCountry?.states : []
                                      }
                                      getOptionLabel={option => option.name || ''}
                                      getOptionSelected={(option, value) => {
                                        return option.name === value.name
                                      }}
                                      isOptionEqualToValue={(option, value) => option.name === value?.name}
                                      value={field.value ? { name: field.value } : null}
                                      onChange={(event, newValue) => {
                                        field.onChange(newValue ? newValue.name : '')
                                        if (checked) {
                                          setValue('deliveryAddress.postcode', newValue.name)
                                        }
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
                                          setValue('deliveryAddress.country', newValue)
                                        }
                                      }}
                                      renderInput={params => (
                                        <CustomTextField
                                          {...params}
                                          label='Select Country'
                                          fullWidth
                                          error={Boolean(errors.billingAddress?.country)}
                                          {...(errors.billingAddress?.country && {
                                            helperText: ' Country is required'
                                          })}
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
                          <Grid item xs={12} sm={6} id='deliveryAddress'>
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
                              </Grid>{' '}
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
                                        !deliveryAddressCountry?.states?.length <= 0
                                          ? deliveryAddressCountry?.states
                                          : []
                                      }
                                      getOptionLabel={option => option.name || ''}
                                      getOptionSelected={(option, value) => {
                                        return option.name === value.name
                                      }}
                                      isOptionEqualToValue={(option, value) => option.name === value?.name}
                                      value={field.value ? { name: field.value } : null}
                                      onChange={(event, newValue) => {
                                        field.onChange(newValue ? newValue.name : '')
                                      }}
                                      renderInput={params => (
                                        <CustomTextField {...params} label='Select State' fullWidth />
                                      )}
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
                                      isOptionEqualToValue={(option, value) => option.name === value?.name}
                                      value={field.value ? { name: field.value } : null}
                                      onChange={(event, newValue) => {
                                        field.onChange(newValue ? newValue.name : '')
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
                      <Grid item xs={12} md={6} lg={5} xl={4}>
                        <FormLabel sx={{ fontSize: '15px', fontWeight: 500, lineHeight: '40px' }}>Email</FormLabel>

                        <Box
                          sx={{ display: 'flex', flexWrap: { xs: 'wrap', sm: 'nowrap' }, gap: 2, alignItems: 'center' }}
                        >
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
                                  checked={field.value || false} // Ensure checkbox reflects form state
                                  // Make sure checkbox reflects form state
                                  onChange={e => {
                                    const checked = e.target.checked
                                    field.onChange(checked)
                                    trigger('emailAddress')
                                  }}
                                />
                              )}
                            />

                            <Typography sx={{ fontSize: '13px', display: 'flex' }}>Send Invoice</Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <SalesOrderItemsTable
                          control={control}
                          errors={errors}
                          currency={selectedCurrency}
                          allWarehouses={warehouses}
                          getValues={getValues}
                          setValue={setValue}
                          trigger={trigger}
                          watch={watch}
                          typeOptions={typeOptions}
                          itemList={itemList}
                          separateOtherCharges={separateOtherCharges}
                          setSeparateOtherCharges={setSeparateOtherCharges}
                          enabledTaxes={selectedSO.taxes || []}
                          setSeparateOrderTaxes={setSeparateOrderTaxes}
                          arrayName={'orderItems'}
                          selectedSO={selectedSO}
                          setLoading={setLoading}
                        />
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
                                <Typography
                                  className='data-value'
                                  sx={{ fontSize: '12px', fontWeight: 400, lineHeight: '22px' }}
                                >
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
                  </Grid>
                </Grid>
              ) : (
                <Grid container spacing={{ xs: 6, md: 8, xl: 10 }}>
                  <Grid item xs={12} md={12} lg={12} xl={11}>
                    <Grid container spacing={{ xs: 5 }}>
                      <Grid item xs={12} md={12} xl={10}>
                        <Grid container spacing={{ xs: 2, md: 3 }}>
                          {tenant?.useTradingInfo === true && tradings.length > 0 && selectedSO?.tradingId !== null && (
                            <Grid item xs={6} sm={4} md={3}>
                              <Controller
                                name='tradingId'
                                control={control}
                                render={({ field }) => (
                                  <CustomAutocomplete
                                    {...field}
                                    options={tradings || []}
                                    getOptionLabel={option => option.tradingName || ''}
                                    value={tradings.find(option => option.tradingId === field.value) || null}
                                    onChange={(event, newValue) => {
                                      field.onChange(newValue ? newValue.tradingId : null)
                                    }}
                                    renderInput={params => (
                                      <CustomTextField {...params} fullWidth label='Trading Name' />
                                    )}
                                  />
                                )}
                              />
                            </Grid>
                          )}
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
                                  value={filteredCustomers.find(option => option.customerId === field.value) || null}
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

                                    field.onChange(newValue ? newValue.customerId : null)

                                    setValue(
                                      'billingAddress.addressLine1',
                                      newValue?.billingAddress?.addressLine1 || ''
                                    )
                                    setValue(
                                      'billingAddress.addressLine2',
                                      newValue?.billingAddress?.addressLine2 || ''
                                    )
                                    setValue('billingAddress.cityOrTown', newValue?.billingAddress?.cityOrTown || '')
                                    setValue('billingAddress.state', newValue?.billingAddress?.state || '')
                                    setValue('billingAddress.postcode', newValue?.billingAddress?.postcode || '')
                                    setValue('billingAddress.country', newValue?.billingAddress?.country || '')

                                    // if (checked) {
                                    // setValue('deliveryAddress', newValue?.deliveryAddress)
                                    setValue(
                                      'deliveryAddress.addressLine1',
                                      newValue?.deliveryAddress?.addressLine1 || ''
                                    )
                                    setValue(
                                      'deliveryAddress.addressLine2',
                                      newValue?.deliveryAddress?.addressLine2 || ''
                                    )
                                    setValue('deliveryAddress.cityOrTown', newValue?.deliveryAddress?.cityOrTown || '')
                                    setValue('deliveryAddress.state', newValue?.deliveryAddress?.state || '')
                                    setValue('deliveryAddress.postcode', newValue?.deliveryAddress?.postcode || '')
                                    setValue('deliveryAddress.country', newValue?.deliveryAddress?.country || '')
                                    // }
                                    setValue('paymentTerms', newValue?.paymentTerms)
                                    const currency = findObjectByCurrencyId(currencies, newValue?.currencyId) || ''
                                    setValue('currency', currency)
                                    setSelectedCurrency(currency)
                                    const filterlist = priceLists?.find(priceList =>
                                      priceList?.customers?.some(
                                        customer => customer.customerId === newValue?.customerId
                                      )
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
                                    field.onChange(newValue)
                                    let orderItems = getValues('orderItems')
                                    let depositAmount = getValues('depositAmount')
                                    let discountValue = getValues('discountValue')
                                    let discountType = getValues('discountType')
                                    let totalAmount = getValues('totalAmount')

                                    if (selectedCurrency) {
                                      if (orderItems?.length > 0) {
                                        orderItems.map((item, i) => {
                                          if (item.sellingPrice !== null || item.sellingPrice !== '') {
                                            let convCp = convertCurrency(
                                              selectedCurrency?.exchangeRate,
                                              1,
                                              newValue?.exchangeRate,
                                              item.sellingPrice
                                            ).toFixed(2)

                                            setValue(`orderItems[${i}].sellingPrice`, convCp)
                                          }
                                        })
                                        if (
                                          discountValue !== null ||
                                          discountType !== 'VALUE' ||
                                          selectedCurrency !== ''
                                        ) {
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
                                    // resetOptions(newValue)
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
                                  date={field.value ? new Date(field.value) : null}
                                  onChange={date => {
                                    field.onChange(date)
                                    setValue('dueDate', date)
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
                                  date={field.value ? new Date(field.value) : null}
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
                        <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
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
                                  date={field.value ? new Date(field.value) : null}
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
                                  date={field.value ? new Date(field.value) : null}
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
                                      fullWidth
                                      label='Address Line 2'
                                      value={field.value}
                                      onChange={e => {
                                        const formattedValue = capitalizeFirstLetterOnly(e.target.value)
                                        field.onChange(formattedValue)
                                        if (checked) {
                                          setValue('deliveryAddress.addressLine2', formattedValue)
                                        }
                                      }}
                                    />
                                  )}
                                />
                              </Grid>
                              <Grid item xs={12} sm={12} md={6}>
                                <Controller
                                  name='billingAddress.cityOrTown'
                                  control={control}
                                  render={({ field }) => (
                                    <CustomTextField
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
                                    />
                                  )}
                                />
                              </Grid>{' '}
                              <Grid item xs={12} sm={12} md={6}>
                                <Controller
                                  name='billingAddress.postcode'
                                  control={control}
                                  render={({ field }) => (
                                    <CustomTextField
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
                                      options={
                                        billingAddressCountry?.states?.length ? billingAddressCountry?.states : []
                                      }
                                      getOptionLabel={option => option.name || ''}
                                      getOptionSelected={(option, value) => {
                                        return option.name === value.name
                                      }}
                                      isOptionEqualToValue={(option, value) => option.name === value?.name}
                                      value={field.value ? { name: field.value } : null}
                                      onChange={(event, newValue) => {
                                        field.onChange(newValue ? newValue.name : '')
                                        if (checked) {
                                          setValue('deliveryAddress.state', newValue.name)
                                        }
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
                                          {...params}
                                          label='Select Country'
                                          fullWidth
                                          error={Boolean(errors.billingAddress?.country)}
                                          {...(errors.billingAddress?.country && {
                                            helperText: ' Country is required'
                                          })}
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
                          <Grid item xs={12} sm={6} id='deliveryAddress'>
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
                              </Grid>{' '}
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
                                        !deliveryAddressCountry?.states?.length <= 0
                                          ? deliveryAddressCountry?.states
                                          : []
                                      }
                                      getOptionLabel={option => option.name || ''}
                                      getOptionSelected={(option, value) => {
                                        return option.name === value.name
                                      }}
                                      isOptionEqualToValue={(option, value) => option.name === value?.name}
                                      value={field.value ? { name: field.value } : null}
                                      onChange={(event, newValue) => {
                                        field.onChange(newValue ? newValue.name : '')
                                      }}
                                      renderInput={params => (
                                        <CustomTextField {...params} label='Select State' fullWidth />
                                      )}
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
                                      isOptionEqualToValue={(option, value) => option.name === value?.name}
                                      value={field.value ? { name: field.value } : null}
                                      onChange={(event, newValue) => {
                                        field.onChange(newValue ? newValue.name : '')
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

                        <Box
                          sx={{ display: 'flex', flexWrap: { xs: 'wrap', sm: 'nowrap' }, gap: 2, alignItems: 'center' }}
                        >
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
                                onChange={e => {
                                  const newValue = e.target.value
                                  field.onChange(newValue)

                                  // Automatically check or uncheck checkbox based on email content
                                  if (newValue && newValue.trim() !== '') {
                                    setValue('sendEmail', true, { shouldValidate: true })
                                  } else {
                                    setValue('sendEmail', false, { shouldValidate: true })
                                  }

                                  trigger(['emailAddress', 'sendEmail'])
                                }}
                                label='Email Address'
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
                                  defaultChecked={field.value}
                                  {...field}
                                  checked={field.value || false}
                                  onChange={e => {
                                    const checked = e.target.checked
                                    field.onChange(checked)

                                    trigger('emailAddress')
                                  }}
                                />
                              )}
                            />

                            <Typography sx={{ fontSize: '13px', display: 'flex' }}>Send Invoice</Typography>
                          </Box>{' '}
                        </Box>
                      </Grid>
                      <Grid item xs={12} xl={12} id='orderItems'>
                        <SalesOrderItemsTable
                          control={control}
                          errors={errors}
                          currency={selectedCurrency}
                          allWarehouses={warehouses}
                          getValues={getValues}
                          setValue={setValue}
                          trigger={trigger}
                          watch={watch}
                          typeOptions={typeOptions}
                          itemList={itemList}
                          separateOtherCharges={separateOtherCharges}
                          setSeparateOtherCharges={setSeparateOtherCharges}
                          enabledTaxes={selectedSO.taxes || []}
                          setSeparateOrderTaxes={setSeparateOrderTaxes}
                          arrayName={'orderItems'}
                          selectedSO={selectedSO}
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
                  </Grid>
                  {/* {customerId && (
                    <Grid item xs={0} md={0} lg={12} xl={4} sx={{ display: { xs: 'none', lg: 'block' } }}>
                      <Card sx={{ p: 6, width: '100%' }}>
                        <Box sx={{ mb: 5 }}>
                          <Alert severity='info' sx={{ color: 'rgba(0,0,0,0.8)' }}>
                            Customer Details
                          </Alert>
                        </Box>
                        <CustomerViewSection customerId={customerId} defaultTab='notes' />
                      </Card>
                    </Grid>
                  )} */}
                </Grid>
              )}
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: { xs: 'center', sm: 'start' },
                  gap: { xs: '10px', md: '20px' },
                  marginTop: { xs: '20px', sm: '25px' }
                }}
              >
                <>
                  {selectedSO?.status === STATUS_DRAFT && (
                    <Button
                      type='submit'
                      variant='contained'
                      onClick={() => {
                        check(STATUS_DRAFT, null)
                      }}
                    >
                      Save As Draft
                    </Button>
                  )}
                  {selectedSO?.status !== STATUS_INVOICED && (
                    <Button
                      variant='contained'
                      type='submit'
                      onClick={() => {
                        check(STATUS_CONFIRMED, null)
                      }}
                    >
                      {selectedSO?.status === STATUS_DRAFT && 'Save As Confirmed'}
                      {selectedSO?.status === STATUS_CONFIRMED && 'Save '}
                    </Button>
                  )}

                  {selectedSO?.status === STATUS_DRAFT && (
                    <Button
                      variant='contained'
                      type='submit'
                      onClick={() => {
                        check(STATUS_CONFIRMED, 'delivered')
                      }}
                    >
                      Save As Delivered
                    </Button>
                  )}
                  {(selectedSO?.status === STATUS_DRAFT || selectedSO?.status === STATUS_CONFIRMED) && (
                    <Button
                      variant='contained'
                      type='submit'
                      onClick={() => {
                        check(STATUS_CONFIRMED, 'taxinvoice')
                      }}
                    >
                      Save And Issue Tax Invoice
                    </Button>
                  )}
                  {selectedSO?.status === STATUS_INVOICED && (
                    <Button
                      type='submit'
                      variant='contained'
                      onClick={() => {
                        check(STATUS_INVOICED, null)
                      }}
                    >
                      Save
                    </Button>
                  )}
                </>

                <Button
                  component={Link}
                  href='/sales/sales-order/'
                  variant='outlined'
                  onClick={() => reset(selectedSO)}
                >
                  Cancel
                </Button>
              </Box>
            </>
          )}
        </form>
      </PageWrapper>
      {isAddNewModalOpen && (
        <AddCustomerPopup open={isAddNewModalOpen} setOpen={setIsAddNewModalOpen} setValue={setValue} />
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
    </React.Fragment>
  )
}
