'use client'
import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Drawer,
  FormHelperText,
  Grid,
  IconButton,
  LinearProgress,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import Icon from 'src/@core/components/icon'
import { DateFunction, fetchPdfFile, parseDate, rowStatusChip } from 'src/common-functions/utils/UtilityFunctions'
import CustomFilesUpload from 'src/views/forms/form-elements/custom-inputs/CustomFilesUpload'
import { PACKAGES_PDF, STATUS_CONFIRMED, STATUS_DRAFT } from 'src/common-functions/utils/Constants'
import CustomDatePicker from 'src/views/forms/form-elements/pickers/CustomDatePicker'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'
import { UploadMultipleFileS3Api } from 'src/views/forms/form-elements/custom-inputs/UploadMultipleFileS3Api'
import { fetchData, writeData } from 'src/common-functions/GraphqlOperations'
import { createAlert } from 'src/store/apps/alerts'
import DeleteUploadFile from 'src/views/forms/form-elements/custom-inputs/DeleteUploadFile'
import { CommonAddress, CommonViewTable, ShowAddress } from 'src/common-components/CommonPdfDesign'
import StyledButton from 'src/common-components/StyledMuiButton'
import { subtractDecimalsWithoutRounding } from 'src/common-functions/utils/DecimalUtils'
import useUserAccounts from 'src/hooks/getData/useUserAccounts'
import useCustomers from 'src/hooks/getData/useCustomers'
import AddCustomerPopup from 'src/common-components/AddCustomerPopup'
import { getSalesOrderToBePackedQuery } from 'src/@core/components/graphql/sales-order-queries'
import {
  updateSalesOrderPackageAndProcessAsDeliveredMutation,
  updateSalesOrderPackageAndProcessAsFulfilledMutation,
  updateSalesOrderPackageMutation
} from 'src/@core/components/graphql/sales-order-package-queries'
import { Router } from 'next/router'
import PackageItemsTable from './PackageItemsTable'
import { setLoading, setUpdatePackage } from 'src/store/apps/packages'
import usePackages from 'src/hooks/getData/usePackages'
import CommonCustomerPopup from 'src/common-components/CommonCustomerPopup'
import useSalesOrders from 'src/hooks/getData/useSalesOrders'

function EditSalesPackageDrawer({ setOpenDrawer, openDrawer, reloadPackages, setReloadPackages }) {
  const route = Router
  const dispatch = useDispatch()
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId)
  const { customers, fetchCustomers } = useCustomers(tenantId)
  const { reloadSalesOrderInStore } = useSalesOrders(tenantId)

  const products = useSelector(state => state?.products?.data) || []
  const salesOrders = useSelector(state => state?.sales.data) || []
  const { userAccounts } = useUserAccounts()
  const selectedPackage = useSelector(state => state.packages?.selectedPackages) || {}
  const order = salesOrders.find(item => item.orderId === selectedPackage.salesOrderId)
  const [selectedPdFile, setSelectedPdFile] = useState([])
  const [deletedPdFiles, setDeletedPdFiles] = useState([])
  const [status, setStatus] = useState('')
  const [loader, setLoader] = useState(false)
  const [submitType, setSubmitType] = useState(null)
  const [editPackageLoader, setEditPackageLoader] = useState(false)
  const { salesPackagesLoading } = usePackages(tenantId)
  // const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!tenantId) return
    const loadCustomers = async () => {
      await fetchCustomers()
    }

    loadCustomers()
  }, [tenantId, fetchCustomers])

  console.log('selectedPackage', selectedPackage)

  const {
    reset,
    control,
    setValue,
    getValues,
    handleSubmit,
    trigger,
    formState: { errors }
  } = useForm({
    defaultValues: {
      ...selectedPackage,
      salesOrderId: order || {},
      assignedTo: userAccounts?.find(item => item?.username === selectedPackage?.assignedTo)
    },
    mode: 'onChange'
  })

  // const [selectedSalesOrder, setSelectedSalesOrder] = useState(order)
  console.log('getValues', getValues())
  const customer = useMemo(
    () => customers?.find(item => item?.customerId === selectedPackage?.customerId) || {},
    [customers, selectedPackage?.customerId]
  )

  useEffect(() => {
    // setSelectedSalesOrder(order)
    setValue('salesOrderId', order)
    const filterData = order?.orderItems?.filter((value, index, self) => {
      return self.findIndex(v => v.itemId === value.itemId) === index
    })

    setFilteredItem(filterData)
  }, [selectedPackage, salesOrders])

  const salesOrder = getValues('salesOrderId')
  const [filteredItems, setFilteredItem] = useState([])

  const getSalesOrderData = async () => {
    const orderId = salesOrder?.orderId

    setEditPackageLoader(true)

    try {
      const response = await fetchData(getSalesOrderToBePackedQuery(tenantId, orderId))
      const { getSalesOrderToBePacked = {} } = response || {}

      const salesOrderItems = getSalesOrderToBePacked?.orderItems.filter(val => val?.itemGroup === 'product')
      setFilteredItem(salesOrderItems)

      const orderItems = salesOrderItems
        ? selectedPackage.packageItems.map(item => {
            const order = salesOrderItems.find(order => order.itemId === item.itemId)
            let qtyToPack = subtractDecimalsWithoutRounding(order.qty || 0, order.totalPackedQty || 0)

            return {
              ...order,
              qtyToPack: qtyToPack,
              packedQty: order.totalPackedQty,
              packedQtyUom: order?.uom,
              warehouseId: order?.warehouseId
            }
          })
        : []

      setValue('packageItems', orderItems)
    } catch (error) {
      console.error(error)
    } finally {
      setEditPackageLoader(false)
    }
  }

  useEffect(() => {
    salesOrder?.orderId && getSalesOrderData()
  }, [salesOrder?.orderId])

  useEffect(() => {
    if (selectedPackage?.files?.length > 0) {
      selectedPackage?.files?.map(item => {
        fetchPdfFile(setSelectedPdFile, item)
      })
      setDeletedPdFiles(selectedPackage?.files)
    }
  }, [selectedPackage])

  const [open, setOpen] = useState(false)
  const isEdit = true

  const [isAddNewModalOpen, setIsAddNewModalOpen] = useState(false)

  const handleAddNewCustomer = () => {
    setIsAddNewModalOpen(true)
  }
  const [openCustomerDialog, setOpenCustomerDialog] = useState(false)

  const handleCustomerDialoge = () => {
    setOpenCustomerDialog(!openCustomerDialog)
  }
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setOpen(false)
  }

  const getTotal = key => selectedPackage?.packageItems?.reduce((total, item) => total + (item[key] || 0), 0)

  const getTotalQty = () => getTotal('qty')
  const getTotalQtyToPack = () => getTotal('qtyToPack')

  const check = status => {
    setStatus(status)
    setOpen(true)
    const fieldName = Object.keys(errors)[0]
    const errName = document.getElementById(fieldName)
    errName?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
  }
  const handleCancel = () => {
    setOpenDrawer(false)
    reset()
  }

  const handleUpdatePackage = async editPackage => {
    setOpen(false)
    setLoader(true)
    dispatch(setLoading(true))
    handleCancel()

    const {
      packageId,
      tenantId,
      packageNo,
      packageNoPrefix,
      packedByUsername,
      deliveredByUsername,
      deliveryDate,
      createdBy,
      createdDateTime,
      deletedBy,
      deletedDateTime,
      modifiedBy,
      modifiedDateTime,
      ...data
    } = editPackage
    let payload = {
      ...data,
      customerId: editPackage?.customerId,
      salesOrderId: editPackage?.salesOrderId?.orderId,
      packageDate: parseDate(editPackage?.packageDate),
      expectedDeliveryDate: parseDate(editPackage.expectedDeliveryDate),
      expectedPackingDate: parseDate(editPackage.expectedPackingDate),
      assignedTo: editPackage?.assignedTo?.username,
      packageItems: editPackage?.packageItems?.map(item => ({
        lineItemId: item?.lineItemId,
        itemId: item?.itemId,
        itemCodePrefix: item?.itemCodePrefix,
        itemCode: item?.itemCode,
        itemName: item?.itemName,
        itemDescription: item?.itemDescription,
        itemGroup: item?.itemGroup,
        itemDimension: item?.itemDimension,
        packingUnit: item?.packingUnit,
        packedQty: item?.qtyToPack,
        packedQtyUom: item?.packedQtyUom,
        warehouseId: item?.warehouseId
      })),
      status: status
    }

    const salesOrderPackage = payload

    if (submitType === 'fulfilled') {
      try {
        const response = await writeData(updateSalesOrderPackageAndProcessAsFulfilledMutation(), {
          tenantId,
          packageId,
          salesOrderPackage
        })
        if (response.updateSalesOrderPackageAndProcessAsFulfilled) {
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
          dispatch(setUpdatePackage(response.updateSalesOrderPackageAndProcessAsFulfilled))
          dispatch(createAlert({ message: 'Updated package as fulfilled successfully!', type: 'success' }))
          route.push('/sales/packages/')
        } else {
          setLoader(false)
          dispatch(createAlert({ message: 'Failed to update package as fulfilled!', type: 'error' }))
        }
      } catch (error) {
        console.log('error', error)
        setLoader(false)
      }
    } else if (submitType === 'delivered') {
      try {
        const response = await writeData(updateSalesOrderPackageAndProcessAsDeliveredMutation(), {
          tenantId,
          packageId,
          salesOrderPackage
        })
        if (response.updateSalesOrderPackageAndProcessAsDelivered) {
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
          dispatch(setUpdatePackage(response.updateSalesOrderPackageAndProcessAsDelivered))
          reloadSalesOrderInStore(response.updateSalesOrderPackageAndProcessAsDelivered.salesOrderId)

          dispatch(createAlert({ message: 'Package Updated and delivered successfully !', type: 'success' }))
          route.push('/sales/packages/')
        } else {
          setLoader(false)
          dispatch(createAlert({ message: 'Failed to update and deliver the package!', type: 'error' }))
        }
      } catch (error) {
        console.log('error', error)
        setLoader(false)
      }
    } else {
      try {
        const response = await writeData(updateSalesOrderPackageMutation(), { tenantId, packageId, salesOrderPackage })
        if (response.updateSalesOrderPackage) {
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
          dispatch(setUpdatePackage(response.updateSalesOrderPackage))
          dispatch(createAlert({ message: 'Package Updated successfully !', type: 'success' }))
          route.push('/sales/packages/')
        } else {
          setLoader(false)
          dispatch(createAlert({ message: 'Package Updation failed !', type: 'error' }))
        }
      } catch (error) {
        console.log('error', error)
        setLoader(false)
      }
    }
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
        <Typography sx={{ fontSize: { xs: '16px', md: '20px' }, fontWeight: 500 }}>Edit Sales Package</Typography>

        <IconButton
          sx={{ fontSize: '28px' }}
          color='primary'
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <Icon icon='tabler:x' />
        </IconButton>
      </Box>
      <Box sx={{ p: { xs: '20px', lg: '40px' } }}>
        {editPackageLoader || salesPackagesLoading ? (
          <LinearProgress />
        ) : selectedPackage?.status === STATUS_DRAFT ? (
          <form onSubmit={handleSubmit(handleUpdatePackage)}>
            <Grid container spacing={{ xs: 5 }}>
              <Grid item xs={12}>
                <Grid container spacing={{ xs: 2, md: 3 }}>
                  <Grid item xs={6} sm={3} lg={3}>
                    <Controller
                      name='packageDate'
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <CustomDatePicker
                          label={'Package Date'}
                          fullWidth={true}
                          date={field?.value && new Date(field.value)}
                          onChange={field.onChange}
                          error={Boolean(errors?.packageDate)}
                        />
                      )}
                    />
                    {errors?.packageDate && <FormHelperText error> Date is required</FormHelperText>}
                  </Grid>
                  <Grid item xs={6} sm={3} lg={3}>
                    <Controller
                      name='salesOrderId'
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <CustomAutocomplete
                          id='salesOrderId'
                          {...field}
                          onChange={(event, newValue) => {
                            field.onChange(newValue)
                            const customer = customers.find(customer => customer.customerId === newValue?.customerId)
                            setValue('customerId', customer)
                            const assignedTo = userAccounts?.find(val => val?.username === newValue?.assignedTo)
                            setValue('assignedTo', assignedTo)
                            getSalesOrderData()
                            setValue('salesOrderNo', newValue?.orderNo)
                            setValue('salesOrderNoPrefix', newValue?.orderNoPrefix)
                            setValue('packageDate', newValue?.orderDate ? new Date(newValue?.orderDate) : new Date())
                            setValue(
                              'expectedPackingDate',
                              newValue?.expectedPackingDate ? new Date(newValue?.expectedPackingDate) : new Date()
                            )
                            setValue(
                              'expectedDeliveryDate',
                              newValue?.expectedDeliveryDate ? new Date(newValue?.expectedDeliveryDate) : new Date()
                            )
                            setValue('notes', newValue?.notes)
                            setValue('deliveryAddress', newValue?.deliveryAddress)
                            setValue('tradingId', newValue?.tradingId)
                            trigger(['customerId', 'packageItems'])
                          }}
                          options={salesOrders || []}
                          isOptionEqualToValue={(option, value) => option.orderId === value.orderId}
                          getOptionLabel={option => `${option?.orderNo || ''}`}
                          renderOption={(props, option) => {
                            const customer = customers?.find(val => val?.customerId === option?.customerId)
                            return (
                              <Box component='li' {...props} key={option?.orderId}>
                                {`${option?.orderNo} (${customer?.displayName})`}
                              </Box>
                            )
                          }}
                          renderInput={params => (
                            <CustomTextField
                              {...params}
                              label='Sales Order'
                              error={Boolean(errors.salesOrderId)}
                              {...(errors.salesOrderId && { helperText: 'Sales Order is required' })}
                            />
                          )}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} lg={3}>
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
                          onChange={(event, newValue) => {
                            if (newValue?.customerId === 'add-new') {
                              handleAddNewCustomer()
                              return
                            }
                            field.onChange(newValue ? newValue.customerId : null)
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
                          // options={customers || []}
                          // getOptionLabel={option => option?.displayName || ''}
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
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={{ xs: 2, md: 3 }}>
                  <Grid item xs={6} sm={3} lg={3}>
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
                  <Grid item xs={6} sm={3} lg={3}>
                    <Controller
                      name='expectedDeliveryDate'
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <CustomDatePicker
                          //disabled={true}
                          label={'Exp. Delivery Date'}
                          fullWidth={true}
                          date={field.value ? new Date(field.value) : null}
                          onChange={field.onChange}
                          error={Boolean(errors?.expectedDeliveryDate)}
                        />
                      )}
                    />
                    {errors?.expectedDeliveryDate && (
                      <FormHelperText error>Expected Delivery Date is required</FormHelperText>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6} lg={3}>
                    <Controller
                      name='assignedTo'
                      control={control}
                      render={({ field }) => (
                        <CustomAutocomplete
                          {...field}
                          getOptionLabel={option => option?.name}
                          onChange={(event, newValue) => {
                            field.onChange(newValue)
                          }}
                          isOptionEqualToValue={(option, value) => option.name === value.name}
                          renderOption={(props, option) => (
                            <Box component='li' {...props}>
                              {`${option?.name}`}
                            </Box>
                          )}
                          options={userAccounts}
                          renderInput={params => <CustomTextField {...params} label='Assigned To' />}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <PackageItemsTable
                  isEdit={isEdit}
                  control={control}
                  setValue={setValue}
                  getValues={getValues}
                  trigger={trigger}
                  products={products}
                  productOptions={filteredItems}
                  selectedPackage={selectedPackage}
                />
              </Grid>

              <Grid item xs={12}>
                <CustomFilesUpload
                  setValue={setValue}
                  selectedPdFile={selectedPdFile}
                  setSelectedPdFile={setSelectedPdFile}
                  folderName={PACKAGES_PDF}
                />
              </Grid>
            </Grid>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: { xs: 'center', sm: 'start' },
                gap: '20px',
                marginTop: { xs: '25px', sm: '50px' }
              }}
            >
              <Button variant='contained' type='submit' onClick={() => check(STATUS_DRAFT)}>
                Save
              </Button>
              {/* {selectedPackage?.status === STATUS_DRAFT && (
                            <Button variant='contained' type='submit' onClick={() => check(STATUS_CONFIRMED)}>
                              Save As Confirmed
                            </Button>
                          )} */}
              <Button
                variant='contained'
                type='submit'
                onClick={() => {
                  check(STATUS_CONFIRMED)
                }}
              >
                Save As Confirmed
              </Button>
              <Button
                variant='contained'
                type='submit'
                onClick={() => {
                  check(STATUS_CONFIRMED)
                  setSubmitType('fulfilled')
                }}
              >
                Save As Fulfilled
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
              <Button variant='outlined' scroll={true} href='/sales/packages/' onClick={() => reset(selectedPackage)}>
                Cancel
              </Button>
            </Box>
          </form>
        ) : (
          <Grid container>
            <Grid item xs={12}>
              <Grid container spacing={{ xs: 2, md: 3 }}>
                <Grid item xs={12}>
                  <Grid
                    container
                    spacing={5}
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' }
                    }}
                  >
                    <Grid item xs={12} sm={6} md={5.5} xl={4}></Grid>
                    <Grid item xs={0} sm={0} md={1} xl={3.1} sx={{ display: { xs: 'none', md: 'block' } }}></Grid>
                    <Grid item xs={12} sm={6} md={5} lg={5.5} xl={4.6} sx={{ width: '80%' }}>
                      <CommonViewTable>
                        <TableBody>
                          <TableRow>
                            <TableCell sx={{ width: '50%' }}>
                              <Typography className='data-name'>Order Date</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography className='data-value'>{DateFunction(selectedPackage?.orderDate)}</Typography>
                            </TableCell>
                          </TableRow>
                          {selectedPackage?.deliveryDate && (
                            <TableRow>
                              <TableCell sx={{ width: '50%' }}>
                                <Typography className='data-name'>Delivery Date</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography
                                  className='data-value'
                                  sx={{ fontSize: '12px', fontWeight: 400, lineHeight: '22px' }}
                                >
                                  {DateFunction(selectedPackage?.deliveryDate)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          )}

                          <TableRow>
                            <TableCell sx={{ width: '50%' }}>
                              <Typography className='data-name'>Expected Packing Date</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography
                                className='data-value'
                                sx={{ fontSize: '12px', fontWeight: 400, lineHeight: '22px' }}
                              >
                                {DateFunction(selectedPackage?.expectedDeliveryDate)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ width: '50%' }}>
                              <Typography className='data-name'>Expected Delivery Date</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography
                                className='data-value'
                                sx={{ fontSize: '12px', fontWeight: 400, lineHeight: '22px' }}
                              >
                                {DateFunction(selectedPackage?.expectedPackingDate)}
                              </Typography>
                            </TableCell>
                          </TableRow>

                          <TableRow>
                            <TableCell sx={{ width: '50%' }}>
                              <Typography className='data-name'>Status </Typography>
                            </TableCell>
                            <TableCell>{rowStatusChip(selectedPackage?.status)}</TableCell>
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
                                {' '}
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

                          <CommonAddress data={customer} />
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
                          <ShowAddress data={selectedPackage?.deliveryAddress} />{' '}
                        </TableBody>
                      </CommonViewTable>
                    </Grid>{' '}
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <PackageItemsTable
                    isEdit={isEdit}
                    control={control}
                    setValue={setValue}
                    getValues={getValues}
                    products={products}
                    trigger={trigger}
                    productOptions={filteredItems}
                    selectedPackage={selectedPackage}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Grid
                    container
                    direction={{ xs: 'column-reverse', md: 'row' }}
                    sx={{ alignItems: { xs: 'flex-end', md: 'flex-start' } }}
                    spacing={{ xs: 6, md: 8, xl: 8 }}
                  >
                    <Grid item xs={12} sm={12} md={8.5} lg={7.5} xl={8} sx={{ width: '100%' }}>
                      <Box sx={{ p: 4 }}>
                        {selectedPackage?.notes ? (
                          <Box sx={{ mb: 4 }}>
                            <Typography
                              sx={{
                                fontSize: '14px',
                                fontWeight: 500,
                                lineHeight: '22px'
                              }}
                            >
                              Notes
                            </Typography>
                            <Typography sx={{ fontSize: '12px', color: '#818181', lineHeight: '22px' }}>
                              <div>
                                <pre
                                  style={{
                                    fontFamily: 'inherit',
                                    whiteSpace: 'pre-wrap'
                                  }}
                                >
                                  {selectedPackage?.notes}
                                </pre>
                              </div>
                            </Typography>
                          </Box>
                        ) : null}
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3.5} lg={4.5} xl={4}>
                      <Box sx={{ width: '100%', ml: 'auto' }}>
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
                                <Typography sx={{ fontSize: 'inherit', fontWeight: 500 }}>{getTotalQty()}</Typography>
                              </TableCell>
                            </TableRow>
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
                                  Total Qty To Pack:
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography sx={{ fontSize: 'inherit', fontWeight: 600 }}>
                                  {getTotalQtyToPack()}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        )}
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

export default EditSalesPackageDrawer
