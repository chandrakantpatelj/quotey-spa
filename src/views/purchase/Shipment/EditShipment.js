import Link from 'next/link'
import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AddOutlined, Close } from '@mui/icons-material'
import {
  Button,
  Box,
  IconButton,
  Typography,
  Grid,
  FormHelperText,
  CircularProgress,
  Backdrop,
  Snackbar,
  Alert,
  LinearProgress,
  Table,
  TableBody,
  TableRow,
  TableCell
} from '@mui/material'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import { useRouter } from 'next/router'
import { UploadMultipleFileS3Api } from 'src/views/forms/form-elements/custom-inputs/UploadMultipleFileS3Api'
import { createAlert } from 'src/store/apps/alerts'
import { PURCHASE_SHIPMENT_PDF, STATUS_DRAFT } from 'src/common-functions/utils/Constants'
import { Controller, useForm } from 'react-hook-form'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomDatePicker from 'src/views/forms/form-elements/pickers/CustomDatePicker'
import {
  DateFunction,
  fetchPdfFile,
  findObjectByCurrencyId,
  getExchangeRate,
  rowStatusChip
} from 'src/common-functions/utils/UtilityFunctions'
import { writeData } from 'src/common-functions/GraphqlOperations'
import PurchaseOrdersShipmentsTable from './PurchaseOrdersShipmentsTable'
import CustomFilesUpload from 'src/views/forms/form-elements/custom-inputs/CustomFilesUpload'
import CustomTextField from 'src/@core/components/mui/text-field'
import {
  updatePurchaseOrderShipmentAndMoveToFirstStageMutation,
  updatePurchaseOrderShipmentMutation
} from 'src/@core/components/graphql/purchase-order-shipment-queries'
import { setUpdatePurchaseShipment } from 'src/store/apps/purchase-shipments'
import { CommonAddress, CommonViewTable, ShowAddress } from 'src/common-components/CommonPdfDesign'
import CommonVendorPopup from 'src/common-components/CommonVendorPopup'
import StyledButton from 'src/common-components/StyledMuiButton'
import DeleteUploadFile from 'src/views/forms/form-elements/custom-inputs/DeleteUploadFile'

function EditShipment({ loading, shipmentData }) {
  const router = useRouter()
  const dispatch = useDispatch()

  const tenant = useSelector(state => state.tenants?.selectedTenant) || {}

  const shipment = useSelector(state => state.purchaseShipments?.selectedPurchaseShipment) || {}

  const { currencies, countries, vendors, tradings, warehouses, purchaseSettingData } = shipmentData

  const localCurrency = useSelector(state => state?.currencies?.selectedCurrency) || {}
  const [loader, setLoader] = useState(false)
  const [selectedPdFile, setSelectedPdFile] = useState([])
  const [deletedPdFiles, setDeletedPdFiles] = useState([])

  function findObjectById(array, countryId) {
    return array.find(obj => obj.name === countryId)
  }
  let deliveryAddressCountry = findObjectById(countries, tenant?.address?.country)

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
    defaultValues: shipment,
    mode: 'all'
  })

  let shipmentType = watch('shipmentType')

  const settingPurchaseData = purchaseSettingData?.find(item => item?.purchaseType === shipmentType)

  const { shipmentTaxes = [], shipmentExpenses = [] } = settingPurchaseData || {}

  const filterTaxes = shipmentTaxes?.map(item => {
    return {
      taxId: item?.taxId,
      taxType: item?.taxType,
      taxName: item?.taxName,
      paidToTaxAuthority: item?.paidToTaxAuthority,
      taxAuthorityId: item?.taxAuthorityId,
      paidToVendor: item?.paidToMainVendor,
      vendorId: item?.vendorId,
      distributionMethod: item?.distributionMethod,
      eligibleForTaxCredit: item?.eligibleForTaxCredit,
      taxValue: 0.0,
      taxValueCurrency: item?.inLocalCurrency ? localCurrency?.currencyId : currency?.currencyId
    }
  })
  const filterExpenses = shipmentExpenses?.map(item => {
    const vendor = vendors?.find(val => val?.vendorId === item?.vendorId)
    return {
      expenseId: item?.expenseId,
      expenseType: item?.expenseType,
      expenseName: item?.expenseName,
      vendorId: item?.vendorId,
      paidToMainVendor: item?.paidToMainVendor,
      additionalTaxes: item?.additionalTaxes,
      eligibleForTaxCredit: item?.eligibleForTaxCredit,
      distributionMethod: item?.distributionMethod,
      expenseValue: 0.0,
      taxValue: 0.0,
      expenseValueCurrency: vendor?.currencyId || localCurrency?.currencyId
    }
  })

  useMemo(() => {
    setValue('taxes', filterTaxes)
    setValue('expenses', filterExpenses)
  }, [shipmentType])

  useEffect(() => {
    const mapTaxes = shipment?.taxes?.map(val => {
      const shipmentTax = shipmentTaxes.find(item => item.taxId === val.taxId)
      return { ...val, inLocalCurrency: shipmentTax?.inLocalCurrency }
    })

    setValue(`taxes`, mapTaxes)
    setValue(`expenses`, shipment?.expenses)
  }, [shipment, loading])

  const vendor = vendors?.find(val => val?.vendorId === shipment?.vendorId)
  const warehouse = warehouses?.find(val => val?.warehouseId === shipment?.warehouseId)
  const findCurrency = currencies?.find(val => val?.currencyId === shipment?.currency)

  useEffect(() => {
    setValue('currency', findCurrency)
    setValue('warehouseId', warehouse)
    setValue('vendorId', vendor)
  }, [shipment])

  useEffect(() => {
    if (shipment?.files?.length > 0) {
      shipment?.files?.map(item => {
        fetchPdfFile(setSelectedPdFile, item)
      })
      setDeletedPdFiles(shipment?.files)
    }
  }, [shipment])

  let currency = getValues('currency')
  let allExpenses = getValues('expenses')

  const [openVendorDialog, setOpenVendorDialog] = useState(false)

  const handleVendorDialoge = () => {
    setOpenVendorDialog(!openVendorDialog)
  }

  const [open, setOpen] = useState(false)

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }

    setOpen(false)
  }

  const [submitType, setSubmitType] = useState(null)

  const check = saveType => {
    setSubmitType(saveType)
    setOpen(true)
    const fieldName = Object.keys(errors)[0]
    const errName = document.getElementById(fieldName)
    errName?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
  }

  const handleNewDataSave = async formData => {
    setOpen(false)
    setLoader(true)

    const {
      tenantId,
      shipmentId,
      shipmentNoPrefix,
      shipmentNo,
      purchaseModuleSettingVersion,
      subtotal,
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
      deletedDateTime,
      modifiedBy,
      modifiedDateTime,
      deliveryStatus,
      paymentStatus,
      ...data
    } = formData
    const purchaseOrderShipment = {
      ...data,
      vendorId: data?.vendorId?.vendorId,
      currency: data?.currency?.currencyId,
      warehouseId: data?.warehouseId?.warehouseId || '',
      packages: data?.packages?.map(({ subtotal, ...rest }) => ({
        ...rest
      })),
      taxes: data?.taxes?.map(({ inLocalCurrency, ...rest }) => rest)
    }

    if (submitType === 'confirmed') {
      try {
        const response = await writeData(updatePurchaseOrderShipmentAndMoveToFirstStageMutation(), {
          tenantId,
          shipmentId,
          purchaseOrderShipment
        })
        if (response.updatePurchaseOrderShipmentAndMoveToFirstStage) {
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

          dispatch(setUpdatePurchaseShipment(response.updatePurchaseOrderShipmentAndMoveToFirstStage))
          dispatch(createAlert({ message: 'Purchase Shipment updated  successfully !', type: 'success' }))
          router.push('/purchases/shipments/')
        } else {
          setLoader(false)
          dispatch(
            createAlert({
              message: response.errors[0].message || 'Failed to  update purchase shipment!',
              type: 'error'
            })
          )
        }
        return response
      } catch (error) {
        // Handle any errors and optionally dispatch an error action
        console.error('error: ', error)
        setLoader(false)
      }
    } else {
      try {
        const response = await writeData(updatePurchaseOrderShipmentMutation(), {
          tenantId,
          shipmentId,
          purchaseOrderShipment
        })
        if (response.updatePurchaseOrderShipment) {
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

          dispatch(setUpdatePurchaseShipment(response.updatePurchaseOrderShipment))
          dispatch(createAlert({ message: 'Purchase Shipment updated  successfully !', type: 'success' }))
          router.push('/purchases/shipments/')
        } else {
          setLoader(false)
          dispatch(
            createAlert({
              message: response.errors[0].message || 'Failed to  update purchase shipment!',
              type: 'error'
            })
          )
        }
        return response
      } catch (error) {
        // Handle any errors and optionally dispatch an error action
        console.error('error: ', error)
        setLoader(false)
      }
    }
  }
  const handleCancel = () => {
    router.push('/purchases/shipments/')
    reset()
  }

  const isShipmentDetailLocked = shipment?.lockedComponents?.includes('SHIPMENT_DETAILS')
  const isExchangeRateLocked = shipment?.lockedComponents?.includes('EXCHANGE_RATE')

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
            Edit Purchase Shipment - {shipment?.shipmentNo}
          </Typography>
        }
        button={
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            <Button
              variant='contained'
              color='primary'
              sx={{ display: { xs: 'none', sm: 'flex' } }}
              startIcon={<AddOutlined />}
              component={Link}
              scroll={true}
              href={`/purchases/shipments/add-new`}
            >
              Add New
            </Button>
            <IconButton variant='outlined' color='default' component={Link} scroll={true} href='/purchases/shipments/'>
              <Close sx={{ color: theme => theme.palette.primary.main }} />
            </IconButton>
          </Box>
        }
      />
      <PageWrapper>
        {loading ? (
          <LinearProgress />
        ) : (
          <form onSubmit={handleSubmit(handleNewDataSave)}>
            <Grid container spacing={{ xs: 5 }}>
              <Grid item xs={12} md={12} lg={9.5} xl={8.5}>
                <Grid container spacing={{ xs: 5 }}>
                  {isShipmentDetailLocked ? (
                    <Grid item xs={12} md={12} lg={10.5}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={12}>
                          <Table
                            sx={{
                              width: '100%',
                              border: 0,
                              '& .MuiTableCell-root': {
                                border: 0,
                                padding: '0px !important',
                                verticalAlign: 'top',
                                width: '50%'
                              },
                              '& .MuiTableCell-root .data-name': {
                                fontSize: '13px',
                                color: '#818181',
                                lineHeight: '28px'
                              },
                              '& .MuiTableCell-root .data-value': {
                                fontSize: '13px',
                                fontWeight: 500,
                                color: '#000',
                                lineHeight: '28px'
                              }
                            }}
                          >
                            <TableBody>
                              <TableRow>
                                <TableCell>
                                  <Typography
                                    sx={{
                                      fontSize: '14px',
                                      fontWeight: 500,
                                      lineHeight: '26px',
                                      color: '#4567c6 !important',
                                      textAlign: 'left'
                                    }}
                                  >
                                    #{shipment?.shipmentNoPrefix}
                                    {shipment?.shipmentNo}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>
                                  <Typography className='data-name'>
                                    Status:
                                    {rowStatusChip(shipment?.status)}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>
                                  <Typography className='data-name'>
                                    Shipment Date:
                                    {DateFunction(shipment?.shipmentDate)}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography
                            sx={{
                              fontSize: '13px',
                              fontWeight: 600,
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

                              <CommonAddress data={vendor} />
                            </TableBody>
                          </CommonViewTable>
                        </Grid>
                        <Grid item xs={12} md={6}>
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
                              <ShowAddress data={shipment?.deliveryAddress} />
                            </TableBody>
                          </CommonViewTable>
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
                                rules={{ required: false }}
                                render={({ field }) => (
                                  <CustomTextField
                                    value={field.value}
                                    onChange={e => {
                                      const newValue = e.target.value
                                      field.onChange(newValue)
                                    }}
                                    fullWidth
                                    label='Exchange Rate'
                                    sx={{ width: '230px', float: 'right' }}
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
                      <Grid item xs={12} md={12} lg={12}>
                        <Grid container spacing={{ xs: 2, md: 3 }}>
                          <Grid item xs={6} sm={4} md={3}>
                            <Controller
                              name='shipmentType'
                              control={control}
                              rules={{ required: false }}
                              render={({ field }) => (
                                <CustomAutocomplete
                                  {...field}
                                  value={
                                    purchaseSettingData?.find(option => option.purchaseType === field?.value) || null
                                  }
                                  onChange={(e, newValue) => {
                                    field.onChange(newValue.purchaseType)
                                    const shipmentCurrency = currencies?.find(
                                      val => val?.currencyId === newValue?.shipmentCurrency
                                    )
                                    setValue('currency', shipmentCurrency)
                                    setValue(
                                      'currencyExchangeRate',
                                      getExchangeRate(shipmentCurrency?.exchangeRate || 1, localCurrency?.exchangeRate)
                                    )
                                  }}
                                  options={purchaseSettingData}
                                  getOptionLabel={option => option?.purchaseType || ''}
                                  disableClearable
                                  renderInput={params => (
                                    <CustomTextField {...params} fullWidth label='Purchase Type' />
                                  )}
                                />
                              )}
                            />
                          </Grid>
                          <Grid item xs={6} sm={4} md={3}>
                            <Controller
                              name='shipmentDate'
                              control={control}
                              rules={{ required: true }}
                              render={({ field }) => (
                                <CustomDatePicker
                                  label={'Date'}
                                  fullWidth={true}
                                  date={field?.value && new Date(field.value)}
                                  onChange={field.onChange}
                                  error={Boolean(errors?.shipmentDate)}
                                />
                              )}
                            />
                            {errors?.shipmentDate && <FormHelperText error>Shipment Date is required</FormHelperText>}
                          </Grid>
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
                                    renderInput={params => (
                                      <CustomTextField {...params} fullWidth label='Trading Name' />
                                    )}
                                  />
                                )}
                              />
                            </Grid>
                          ) : null}
                        </Grid>
                      </Grid>
                      <Grid item xs={12} md={12} lg={12}>
                        <Grid container spacing={{ xs: 2, md: 3 }}>
                          <Grid item xs={6} sm={4} md={4}>
                            <Controller
                              name='vendorId'
                              control={control}
                              rules={{ required: true }}
                              render={({ field }) => (
                                <CustomAutocomplete
                                  id='vendorId'
                                  {...field}
                                  fullWidth
                                  getOptionLabel={option =>
                                    `${option?.vendorNoPrefix || ''} ${option?.vendorNo || ''} - ${
                                      option?.displayName || ''
                                    }`
                                  }
                                  onChange={(event, newValue) => {
                                    if (newValue?.vendorId === 'add-new') {
                                      handleAddNewVendor()
                                      return
                                    }
                                    field.onChange(newValue)

                                    let curretVendorCurrency = currencies.find(
                                      cur => cur?.currencyId === newValue?.currencyId
                                    )
                                    const getRate = getExchangeRate(
                                      curretVendorCurrency?.exchangeRate || 1,
                                      localCurrency?.exchangeRate
                                    )
                                    setValue(`currencyExchangeRate`, getRate)

                                    const currency = findObjectByCurrencyId(currencies, newValue?.currencyId) || ''
                                    setValue('currency', currency)

                                    allExpenses
                                      ?.filter(a => a.paidToMainVendor)
                                      ?.forEach(item => {
                                        item.expenseValueCurrency = curretVendorCurrency?.currencyId
                                      })

                                    trigger(['vendorId', 'currency'])
                                  }}
                                  isOptionEqualToValue={(option, value) => option.vendorId === value?.vendorId}
                                  renderOption={(props, option) => {
                                    return (
                                      <li {...props}>
                                        {option?.vendorNoPrefix || ''}
                                        {option?.vendorNo || ''}-{option?.displayName || ''}
                                      </li>
                                    )
                                  }}
                                  options={vendors}
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

                          <Grid item xs={6} sm={4} md={2.5}>
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
                                  }}
                                  renderInput={params => <CustomTextField {...params} fullWidth label='Currency' />}
                                />
                              )}
                            />
                          </Grid>
                          <Grid item xs={6} sm={4} md={2.5}>
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
                                rules={{ required: false }}
                                render={({ field }) => (
                                  <CustomTextField
                                    value={field.value}
                                    onChange={e => {
                                      const newValue = e.target.value
                                      field.onChange(newValue)
                                    }}
                                    fullWidth
                                    label='Exchange Rate'
                                  />
                                )}
                              />
                            )}
                          </Grid>
                          {/* )} */}
                        </Grid>
                      </Grid>
                      <Grid item xs={12} md={7} lg={8}>
                        <Typography sx={{ fontSize: '15px', fontWeight: 500, lineHeight: '40px', mb: 2 }}>
                          Delivery Address:
                        </Typography>

                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={12} md={6} lg={6}>
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
                          </Grid>
                          <Grid item xs={12}></Grid>
                          <Grid item xs={12} sm={12} md={6}>
                            <Controller
                              name='deliveryAddress.addressLine1'
                              control={control}
                              render={({ field }) => (
                                <CustomTextField
                                  {...field}
                                  fullWidth
                                  label='Address Line 1'
                                  error={Boolean(errors.deliveryAddress?.addressLine1)}
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
                                  onChange={field.onChange}
                                />
                              )}
                            />
                          </Grid>{' '}
                          <Grid item xs={6} sm={12} md={6}>
                            <Controller
                              name='deliveryAddress.cityOrTown'
                              control={control}
                              render={({ field }) => <CustomTextField {...field} fullWidth label='City / Town' />}
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
                              render={({ field }) => <CustomTextField {...field} fullWidth label='Zip Code' />}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                    </>
                  )}

                  <PurchaseOrdersShipmentsTable
                    vendors={vendors}
                    watch={watch}
                    control={control}
                    currency={currency}
                    setValue={setValue}
                    getValues={getValues}
                    shipment={shipment}
                    isShipmentDetailLocked={isShipmentDetailLocked}
                    settingPurchaseData={settingPurchaseData}
                  />
                  {!isShipmentDetailLocked && (
                    <Grid item xs={12}>
                      <CustomFilesUpload
                        setValue={setValue}
                        selectedPdFile={selectedPdFile}
                        setSelectedPdFile={setSelectedPdFile}
                        folderName={PURCHASE_SHIPMENT_PDF}
                      />
                    </Grid>
                  )}
                </Grid>
              </Grid>
            </Grid>

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: { xs: 'center', sm: 'start' },
                gap: '20px',
                marginTop: { xs: '20px', sm: '50px' }
              }}
            >
              <Button
                variant='contained'
                type='submit'
                onClick={() => {
                  check(null)
                }}
              >
                Save
              </Button>
              {shipment?.status === STATUS_DRAFT && (
                <Button
                  variant='contained'
                  type='submit'
                  onClick={() => {
                    check('confirmed')
                  }}
                >
                  Save As Confirmed
                </Button>
              )}
              <Button type='reset' variant='outlined' onClick={handleCancel}>
                Cancel
              </Button>
            </Box>
          </form>
        )}
      </PageWrapper>
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

export default EditShipment
