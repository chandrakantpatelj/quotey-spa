'use client'
import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Drawer,
  FormHelperText,
  Grid,
  IconButton,
  LinearProgress,
  Snackbar,
  Typography
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import Icon from 'src/@core/components/icon'
import { parseDate } from 'src/common-functions/utils/UtilityFunctions'
import CustomFilesUpload from 'src/views/forms/form-elements/custom-inputs/CustomFilesUpload'
import {
  PACKAGES_PDF,
  SCHEMA_VERSION,
  STATUS_CONFIRMED,
  STATUS_DRAFT,
  STATUS_INVOICED
} from 'src/common-functions/utils/Constants'
import CustomDatePicker from 'src/views/forms/form-elements/pickers/CustomDatePicker'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'
import { UploadMultipleFileS3Api } from 'src/views/forms/form-elements/custom-inputs/UploadMultipleFileS3Api'
import { fetchData, writeData } from 'src/common-functions/GraphqlOperations'
import { createAlert } from 'src/store/apps/alerts'
import { subtractDecimalsWithoutRounding } from 'src/common-functions/utils/DecimalUtils'
import useUserAccounts from 'src/hooks/getData/useUserAccounts'
import useCustomers from 'src/hooks/getData/useCustomers'
import AddCustomerPopup from 'src/common-components/AddCustomerPopup'
import { getSalesOrderToBePackedQuery } from 'src/@core/components/graphql/sales-order-queries'
import {
  createSalesOrderPackageAndProcessAsDeliveredMutation,
  createSalesOrderPackageAndProcessAsFulfilledMutation,
  createSalesOrderPackageMutation
} from 'src/@core/components/graphql/sales-order-package-queries'
import PackageItemsTable from './PackageItemsTable'
import { setAddPackage } from 'src/store/apps/packages'
import useWarehouses from 'src/hooks/getData/useWarehouses'
import useProducts from 'src/hooks/getData/useProducts'
import useSalesOrders from 'src/hooks/getData/useSalesOrders'

function NewSalesPackageDrawer({ setOpenDrawer, openDrawer }) {
  const dispatch = useDispatch()
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId) || null

  const { loading: warehouseLoading } = useWarehouses(tenantId)
  const { customers, fetchCustomers, customerLoading } = useCustomers(tenantId)
  const { products, fetchProducts, productsLoading } = useProducts(tenantId)
  const { userAccounts } = useUserAccounts()
  const { fetchSalesOrders, salesOrders, salesOrdersLoading, reloadSalesOrderInStore } = useSalesOrders(tenantId)
  const actionSO = useSelector(state => state?.sales?.selectedSalesOrder)
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState('')
  const [selectedPdFile, setSelectedPdFile] = useState([])
  // const [loader, setLoader] = useState(false)
  const [selectedSalesOrder, setSelectedSalesOrder] = useState(actionSO)
  const [submitType, setSubmitType] = useState('')
  const [isAddNewModalOpen, setIsAddNewModalOpen] = useState(false)
  const [filteredItems, setFilteredItem] = useState([])
  const loading = warehouseLoading || salesOrdersLoading || customerLoading || productsLoading

  useEffect(() => {
    if (!tenantId) return
    const loadCustomers = async () => {
      fetchCustomers()
      fetchProducts()
      fetchSalesOrders()
    }

    loadCustomers()
  }, [tenantId, fetchCustomers, fetchProducts])

  const getSalesOrderData = async value => {
    const orderId = value?.orderId
    try {
      const response = await fetchData(getSalesOrderToBePackedQuery(tenantId, orderId))
      const { getSalesOrderToBePacked = {} } = response || {}

      const data = getSalesOrderToBePacked

      const salesOrderItems = data?.orderItems?.filter(val => val?.itemGroup === 'product')
      setFilteredItem(salesOrderItems)

      const orderItems = salesOrderItems?.map(item => {
        let qtyToPack = subtractDecimalsWithoutRounding(item.qty || 0, item.totalPackedQty || 0)
        return {
          ...item,
          qtyToPack: qtyToPack,
          packedQty: item.totalPackedQty,
          packedQtyUom: item?.uom,
          warehouseId: item?.warehouseId
        }
      })

      setValue('packageItems', orderItems)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    selectedSalesOrder && getSalesOrderData(selectedSalesOrder)
  }, [selectedSalesOrder])

  const handleAddNewCustomer = () => {
    setIsAddNewModalOpen(true)
  }

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setOpen(false)
  }

  const actionSOuser = userAccounts?.find(val => val?.username === actionSO?.assignedTo)
  const defaultPackage = {
    schemaVersion: SCHEMA_VERSION,
    salesOrderId: actionSO === undefined || '' || null ? {} : actionSO,
    salesOrderNo: actionSO === undefined || '' || null ? {} : actionSO?.orderNo,
    salesOrderNoPrefix: actionSO === undefined || '' || null ? {} : actionSO?.orderNoPrefix,
    customerId: null,
    packageDate: actionSO?.orderDate || new Date(),
    deliveryDate: actionSO === undefined || '' || null ? new Date() : actionSO?.deliveryDate,
    expectedPackingDate: actionSO?.expectedPackingDate || new Date(),
    expectedDeliveryDate: actionSO?.expectedDeliveryDate || new Date(),
    deliveryAddress: actionSO === undefined || '' || null ? {} : actionSO?.deliveryAddress,
    assignedTo: actionSO === undefined || '' || null ? {} : actionSOuser,
    tradingId: actionSO === undefined || '' || null ? {} : actionSO?.tradingId || null,
    packageItems: [],
    notes: actionSO === undefined || '' || null ? '' : actionSO?.notes || '',
    status: '',
    files: []
  }

  const {
    reset,
    control,
    handleSubmit,
    setValue,
    getValues,
    trigger,
    formState: { errors }
  } = useForm({
    defaultValues: defaultPackage,
    mode: 'onChange'
  })

  useEffect(() => {
    const orderItems = actionSO?.orderItems?.map(
      ({ qty, uom, qtyToPack, subtotal, serviceDate, discount, sellingPrice, totalPackedQty, ...item }, i) => {
        const calcQtyToPack = subtractDecimalsWithoutRounding(qty || 0, item?.totalPackedQty || 0)
        setValue(`packageItems[${i}].qtyToPack`, parseFloat(qtyToPack)?.toFixed(2))

        return {
          ...item,
          qty: qty,
          packedQty: totalPackedQty,
          qtyToPack: parseFloat(calcQtyToPack),
          packedQtyUom: uom
        }
      }
    )
    setValue('customerId', customers?.find(item => item?.customerId === actionSO?.customerId) || null)
    setValue('assignedTo', userAccounts?.find(val => val?.username === actionSO?.assignedTo) || null)
    setValue('packageItems', orderItems)
  }, [actionSO])

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

  const handleNewPackagesSave = async newPackages => {
    setOpen(false)
    //  setLoader(true)
    //  dispatch(setLoading(true))
    handleCancel()

    delete newPackages.variants
    const salesOrderPackage = {
      ...newPackages,
      assignedTo: newPackages?.assignedTo?.username,
      status: status,
      customerId: newPackages?.customerId?.customerId,
      salesOrderId: newPackages?.salesOrderId?.orderId,
      packageDate: parseDate(newPackages?.packageDate),
      expectedDeliveryDate: parseDate(newPackages?.expectedDeliveryDate),
      expectedPackingDate: parseDate(newPackages?.expectedPackingDate),
      packageItems: newPackages?.packageItems?.map(item => ({
        lineItemId: item?.lineItemId,
        itemId: item?.itemId,
        itemCodePrefix: item?.itemCodePrefix,
        itemCode: item?.itemCode,
        itemName: item?.itemName,
        itemDescription: item?.itemDescription,
        itemDimension: item?.itemDimension,
        itemGroup: item?.itemGroup,
        packingUnit: item?.packingUnit,
        packedQty: item?.qtyToPack,
        packedQtyUom: item?.packedQtyUom,
        warehouseId: item?.warehouseId
      }))
    }

    if (submitType === 'fulfilled') {
      try {
        const response = await writeData(createSalesOrderPackageAndProcessAsFulfilledMutation(), {
          tenantId,
          salesOrderPackage
        })

        if (response.createSalesOrderPackageAndProcessAsFulfilled) {
          if (selectedPdFile?.length) {
            await UploadMultipleFileS3Api(selectedPdFile, dispatch)
          }
          dispatch(setAddPackage(response.createSalesOrderPackageAndProcessAsFulfilled))
          dispatch(createAlert({ message: 'Package fulfilled successfully!', type: 'success' }))
        } else {
          dispatch(createAlert({ message: response?.errors?.[0]?.message, type: 'error' }))
        }
        return response
      } catch (error) {
        console.error(error)
      }
    } else if (submitType === 'delivered') {
      try {
        const response = await writeData(createSalesOrderPackageAndProcessAsDeliveredMutation(), {
          tenantId,
          salesOrderPackage
        })

        if (response.createSalesOrderPackageAndProcessAsDelivered) {
          if (selectedPdFile?.length) {
            await UploadMultipleFileS3Api(selectedPdFile, dispatch)
          }
          dispatch(setAddPackage(response.createSalesOrderPackageAndProcessAsDelivered))
          reloadSalesOrderInStore(response.createSalesOrderPackageAndProcessAsDelivered.salesOrderId)

          dispatch(createAlert({ message: 'Package Deliverd successfully!', type: 'success' }))
        } else {
          dispatch(createAlert({ message: response?.errors?.[0]?.message, type: 'error' }))
        }
        return response
      } catch (error) {
        console.error(error)
      }
    } else {
      try {
        const response = await writeData(createSalesOrderPackageMutation(), {
          tenantId,
          salesOrderPackage
        })

        if (response.createSalesOrderPackage) {
          if (selectedPdFile?.length) {
            await UploadMultipleFileS3Api(selectedPdFile, dispatch)
          }
          dispatch(setAddPackage(response.createSalesOrderPackage))
          dispatch(createAlert({ message: 'Package created successfully!', type: 'success' }))
        } else {
          dispatch(createAlert({ message: response?.errors?.[0]?.message, type: 'error' }))
        }
        return response
      } catch (error) {
        console.error(error)
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
        <Typography sx={{ fontSize: { xs: '16px', md: '20px' }, fontWeight: 500 }}>New Sales Package</Typography>

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
        {loading ? (
          <LinearProgress />
        ) : (
          <form onSubmit={handleSubmit(handleNewPackagesSave)}>
            <Grid container spacing={{ xs: 5 }}>
              <Grid item xs={12}>
                <Grid container spacing={{ xs: 2, md: 3 }}>
                  <Grid item xs={6} sm={4} lg={3}>
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
                  <Grid item xs={6} sm={4} lg={3}>
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
                            setSelectedSalesOrder(newValue)

                            // setFilteredItem(filterData)
                            const customer = customers.find(customer => customer.customerId === newValue?.customerId)
                            setValue('customerId', customer)
                            const assignedTo = userAccounts?.find(val => val?.username === newValue?.assignedTo)
                            setValue('assignedTo', assignedTo)
                            // const orderItems = newValue?.orderItems.map((item, i) => {
                            //   const qtyToPack = subtractDecimalsWithoutRounding(item?.qty || 0, item?.packedQty || 0)
                            //   setValue(`packageItems[${i}].qtyToPack`, parseFloat(qtyToPack)?.toFixed(2))

                            //   return {
                            //     ...item,
                            //     qty: item?.qty,
                            //     packedQty: 0,
                            //     qtyToPack: parseFloat(qtyToPack),
                            //     packedQtyUom: item?.uom
                            //   }
                            // })
                            setValue('salesOrderNo', newValue?.orderNo)
                            setValue('salesOrderNoPrefix', newValue?.orderNoPrefix)
                            // setValue('packageItems', orderItems)
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
                            trigger(['customerId'])
                          }}
                          options={
                            salesOrders?.filter(
                              item => item?.status === STATUS_CONFIRMED || item?.status === STATUS_INVOICED
                            ) || []
                          }
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
                  <Grid item xs={12} sm={4} lg={3}>
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
                          onChange={(event, newValue) => {
                            if (newValue?.customerId === 'add-new') {
                              handleAddNewCustomer()
                              return
                            }
                            field.onChange(newValue)
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
                              {...(errors.customerId && { helperText: 'Customer Name is required' })}
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
                  <Grid item xs={6} sm={4} lg={3}>
                    <Controller
                      name='expectedPackingDate'
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <CustomDatePicker
                          label={'Exp. Packing Date'}
                          fullWidth={true}
                          date={field?.value && new Date(field.value)}
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
                  <Grid item xs={6} sm={4} lg={3}>
                    <Controller
                      name='expectedDeliveryDate'
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <CustomDatePicker
                          //disabled={true}
                          label={'Exp. Delivery Date'}
                          fullWidth={true}
                          date={field?.value && new Date(field.value)}
                          onChange={field.onChange}
                          error={Boolean(errors?.expectedDeliveryDate)}
                        />
                      )}
                    />
                    {errors?.expectedDeliveryDate && (
                      <FormHelperText error>Expected Delivery Date is required</FormHelperText>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={4} lg={3}>
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
                  control={control}
                  errors={errors}
                  setValue={setValue}
                  getValues={getValues}
                  products={products}
                  trigger={trigger}
                  productOptions={filteredItems}
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
              <Button
                variant='contained'
                type='submit'
                onClick={() => {
                  check(STATUS_DRAFT)
                  setSubmitType(null)
                }}
              >
                Save
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

              <Button type='reset' variant='outlined' onClick={handleCancel}>
                Cancel
              </Button>
            </Box>
          </form>
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

      {/* {loader ? (
        <Backdrop sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }} open={loader}>
          <CircularProgress color='inherit' />
        </Backdrop>
      ) : null} */}
    </Drawer>
  )
}

export default NewSalesPackageDrawer
