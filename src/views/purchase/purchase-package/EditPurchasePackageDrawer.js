'use client'
import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Backdrop,
  Box,
  Button,
  Card,
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
import useCurrencies from 'src/hooks/getData/useCurrencies'
import {
  DateFunction,
  fetchPdfFile,
  NumberFormat,
  parseDate,
  rowStatusChip
} from 'src/common-functions/utils/UtilityFunctions'
import CustomFilesUpload from 'src/views/forms/form-elements/custom-inputs/CustomFilesUpload'
import { PURCHASE_PACKAGE_PDF, SCHEMA_VERSION, STATUS_DRAFT } from 'src/common-functions/utils/Constants'
import CustomDatePicker from 'src/views/forms/form-elements/pickers/CustomDatePicker'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'
import { UploadMultipleFileS3Api } from 'src/views/forms/form-elements/custom-inputs/UploadMultipleFileS3Api'
import { fetchData, writeData } from 'src/common-functions/GraphqlOperations'
import { createAlert } from 'src/store/apps/alerts'
import { getPurchaseOrdersByVendorToBePackagedQuery } from 'src/@core/components/graphql/purchase-order-queries'
import {
  updateItemInPurchaseOrderPackageMutation,
  updatePurchaseOrderPackageMutation
} from 'src/@core/components/graphql/purchase-order-packages-queries'
import { setUpdatePurchasePackage, setLoading } from 'src/store/apps/purchase-packages'
import useVendors from 'src/hooks/getData/useVendors'
import PurchasePackageItemsTable from './PurchasePackageItemsTable'
import useWarehouses from 'src/hooks/getData/useWarehouses'
import AddVendorPopup from 'src/common-components/AddVendorPopup'
import DeleteUploadFile from 'src/views/forms/form-elements/custom-inputs/DeleteUploadFile'
import { CommonAddress, CommonViewTable } from 'src/common-components/CommonPdfDesign'
import StyledButton from 'src/common-components/StyledMuiButton'
import CommonVendorPopup from 'src/common-components/CommonVendorPopup'
import { subtractDecimalsWithoutRounding } from 'src/common-functions/utils/DecimalUtils'

function EditPurchasePackageDrawer({ setOpenDrawer, openDrawer, reloadPackages, setReloadPackages }) {
  const dispatch = useDispatch()
  const tenant = useSelector(state => state.tenants?.selectedTenant)
  const { tenantId } = tenant || ''
  const [selectedPdFile, setSelectedPdFile] = useState([])
  const [open, setOpen] = useState(false)
  const [loader, setLoader] = useState(false)
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [filteredItems, setFilteredItem] = useState([])
  const [isAddNewModalOpen, setIsAddNewModalOpen] = useState(false)
  const [status, setStatus] = useState('')
  const { warehouses, loading: warehouseLoading } = useWarehouses(tenantId)
  const { currencies, loading: currencyLoading } = useCurrencies()
  const { vendors, loading: vendorsLoading } = useVendors(tenantId)
  const selectedPurchasePackage = useSelector(state => state.purchasePackage?.selectedPurchasePackage) || {}
  const isEdit = true
  const loading = vendorsLoading || currencyLoading || warehouseLoading
  const [deletedPdFiles, setDeletedPdFiles] = useState([])

  const {
    reset,
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    trigger,
    formState: { errors }
  } = useForm({
    defaultValues: {
      ...selectedPurchasePackage,
      vendorId: vendors?.find(item => item?.vendorId === selectedPurchasePackage?.vendorId),
      packageItems: [],
      currency: currencies?.find(item => item?.currencyId === selectedPurchasePackage?.currency)
    },
    mode: 'onChange'
  })

  const purchaseOrder = purchaseOrders.find(order => order.orderId === selectedPurchasePackage.purchaseOrderId)
  const mergedArray = selectedPurchasePackage?.packageItems?.map((item, i) => {
    const matchedOrderItem = purchaseOrder?.orderItems?.find(val => val?.itemId === item?.itemId)

    const qty = matchedOrderItem?.qty

    return {
      ...item,
      qty: qty
    }
  })

  const vendor = watch('vendorId')
  const currency = getValues('currency')
  const getTotal = key => mergedArray?.reduce((total, item) => total + (item[key] || 0), 0)
  const getTotalQty = () => getTotal('qty')

  useEffect(() => {
    selectedPurchasePackage?.files?.length > 0 &&
      selectedPurchasePackage?.files.map(item => {
        setDeletedPdFiles(prev => [...prev, item])
        fetchPdfFile(setSelectedPdFile, item)
      })
  }, [selectedPurchasePackage])

  const getPurchaseOrderOrderData = async () => {
    const vendorId = vendor?.vendorId

    try {
      const response = await fetchData(getPurchaseOrdersByVendorToBePackagedQuery(tenantId, vendorId))
      const { getPurchaseOrdersByVendorToBePackaged = [] } = response || {}

      setPurchaseOrders(getPurchaseOrdersByVendorToBePackaged)
      if (getPurchaseOrdersByVendorToBePackaged.length === 0) {
        setValue('purchaseOrderId', null)
        setValue('packageItems', [])
        setFilteredItem([])
        return
      }
      const order =
        getPurchaseOrdersByVendorToBePackaged.find(item => item.orderId === selectedPurchasePackage.purchaseOrderId) ||
        {}

      setValue('purchaseOrderId', order)
      const filterPackedItems = order?.orderItems?.filter(item => item?.qty !== item?.totalPackedQty)

      setFilteredItem(filterPackedItems)
      const packageItems = filterPackedItems
        ? selectedPurchasePackage?.packageItems?.map((item, i) => {
            const product = filterPackedItems?.find(val => val.itemId === item.itemId)
            if (product) {
              return {
                ...item,
                qty: product?.qty,
                purchasePrice: product?.purchasePrice,
                packedQty: product?.totalPackedQty,
                qtyToPack: item?.packedQty
              }
            }
          })
        : []

      setValue('packageItems', packageItems)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    vendor && getPurchaseOrderOrderData()
  }, [vendor])

  function handleClose(event, reason) {
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

  const toggleDrawer = open => event => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return
    }
    setOpenDrawer(open)
  }

  const handleOnSubmit = async newPackage => {
    setOpen(false)
    setLoader(true)
    handleCancel()
    const {
      packageId,
      tenantId,
      packageNo,
      packageNoPrefix,
      currentStage,
      undoCurrentStage,
      moveToNextStage,
      previousStatus,
      previousStage,
      nextStatus,
      nextStage,
      createdBy,
      createdDateTime,
      deletedBy,
      deletedDateTime,
      modifiedBy,
      modifiedDateTime,
      ...data
    } = newPackage

    const purchaseOrderPackage = {
      ...data,
      packageDate: parseDate(data?.packageDate),
      purchaseOrderId: data?.purchaseOrderId.orderId,
      purchaseOrderNo: data?.purchaseOrderId.orderNo,
      vendorId: data?.vendorId.vendorId,
      currency: data?.currency.currencyId,
      packageItems: data?.packageItems?.map(({ qty, uom, qtyToPack, totalPackedQty, ...item }) => ({
        ...item,
        packedQty: parseFloat(qtyToPack),
        subtotal: parseFloat(item?.subtotal)
      })),
      status: status
    }

    try {
      const response = await writeData(updatePurchaseOrderPackageMutation(), {
        tenantId,
        packageId,
        purchaseOrderPackage
      })
      if (response.updatePurchaseOrderPackage) {
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
        dispatch(setUpdatePurchasePackage(response.updatePurchaseOrderPackage))
        dispatch(createAlert({ message: 'Purchase Package updated  successfully !', type: 'success' }))

        setReloadPackages(!reloadPackages)
      } else {
        setLoader(false)
        dispatch(createAlert({ message: response.errors[0].message || 'Package creation  failed!', type: 'error' }))
      }
      return response
    } catch (error) {
      // Handle any errors and optionally dispatch an error action
      console.error('error: ', error)
      setLoader(false)
    }
  }

  const handleCancel = () => {
    setOpenDrawer(false)
    reset()
  }
  const [openVendorDialog, setOpenVendorDialog] = useState(false)

  const handleVendorDialoge = () => {
    setOpenVendorDialog(!openVendorDialog)
  }

  const handleEditPackageItemInput = async itemData => {
    dispatch(setLoading(true))

    handleCancel()
    const packageId = selectedPurchasePackage?.packageId
    const { qty, qtyToPack, ...data } = itemData
    const packageItem = { ...data, packedQty: qtyToPack }
    const itemId = data?.itemId
    const warehouseId = data?.warehouseId

    try {
      const response = await writeData(updateItemInPurchaseOrderPackageMutation(), {
        tenantId,
        packageId,
        itemId,
        warehouseId,
        packageItem
      })

      if (response.updateItemInPurchaseOrderPackage) {
        dispatch(setUpdatePurchasePackage(response.updateItemInPurchaseOrderPackage))
        dispatch(createAlert({ message: 'Purchase Item updated  successfully!', type: 'success' }))
        setReloadPackages(!reloadPackages)
      } else {
        dispatch(createAlert({ message: 'Failed to update item in package!', type: 'error' }))
        // setOpen(false)
      }
      return response
    } catch (error) {
      console.error('error: ', error)
    } finally {
      dispatch(setLoading(false))
    }
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
        <Typography sx={{ fontSize: { xs: '16px', md: '20px' }, fontWeight: 500 }}>Edit Purchase Package</Typography>

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
        ) : selectedPurchasePackage?.status === STATUS_DRAFT ? (
          <form onSubmit={handleSubmit(handleOnSubmit)}>
            <Grid container spacing={{ xs: 6 }}>
              <Grid item xs={12}>
                <Grid container spacing={{ xs: 2, md: 3 }}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Controller
                      name='packageDate'
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <CustomDatePicker
                          label={'Date'}
                          fullWidth={true}
                          date={field?.value && new Date(field.value)}
                          onChange={field.onChange}
                          error={Boolean(errors?.packageDate)}
                        />
                      )}
                    />
                    {errors?.packageDate && <FormHelperText error> Date is required</FormHelperText>}
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Controller
                      name='vendorId'
                      control={control}
                      rules={{ required: 'Vendor is required' }}
                      render={({ field, fieldState: { error } }) => (
                        <CustomAutocomplete
                          id='vendorId'
                          {...field}
                          onChange={(event, newValue) => {
                            field.onChange(newValue)
                            setValue('purchaseOrderId', null)
                            setValue('packageItems', [])
                          }}
                          getOptionLabel={option => {
                            if (typeof option === 'string') {
                              return option
                            } else
                              return `${option?.vendorNoPrefix || ''}  ${option?.vendorNo || ''} - ${
                                option?.displayName || ''
                              }`
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
                          options={[{ displayName: 'Add New', vendorId: 'add-new' }, ...vendors]}
                          renderInput={params => (
                            <CustomTextField
                              {...params}
                              label='Vendor'
                              error={Boolean(error)}
                              helperText={error?.message}
                            />
                          )}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6} sm={6} md={4}>
                    <Controller
                      name='purchaseOrderId'
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <CustomAutocomplete
                          {...field}
                          onChange={(event, newValue) => {
                            field.onChange(newValue)
                            setValue('purchaseOrderNo', newValue?.orderNo)
                            setValue('purchaseOrderNoPrefix', newValue?.orderNoPrefix)
                            setValue('tradingId', newValue?.tradingId)
                            setValue('purchaseType', newValue?.purchaseType)
                            setValue('purchaseModuleSettingVersion', newValue?.purchaseModuleSettingVersion)
                            setValue('notes', newValue?.notes)
                            const filterPackedItems = newValue?.orderItems?.filter(
                              item => item?.qty !== item?.totalPackedQty
                            )
                            setFilteredItem(filterPackedItems)
                            const orderItems = filterPackedItems?.map(item => {
                              let qtyToPack = subtractDecimalsWithoutRounding(item.qty || 0, item.totalPackedQty || 0)
                              return {
                                ...item,
                                qtyToPack: qtyToPack,
                                packedQty: item.totalPackedQty,
                                packedQtyUom: item?.uom,
                                warehouseId: warehouses[0]
                              }
                            })
                            setValue('packageItems', orderItems)
                          }}
                          options={purchaseOrders}
                          getOptionLabel={option => `${option?.orderNoPrefix || ''}${option?.orderNo || ''}`}
                          renderOption={(props, option) => {
                            const vendor = vendors?.find(val => val?.vendorId === option?.vendorId)
                            return (
                              <Box component='li' {...props} key={option?.orderId}>
                                {`${option?.orderNoPrefix}${option?.orderNo} (${vendor?.displayName || ''})`}{' '}
                              </Box>
                            )
                          }}
                          renderInput={params => (
                            <CustomTextField
                              {...params}
                              label='Purchase Order'
                              error={Boolean(errors.purchaseOrderId)}
                              {...(errors.purchaseOrderId && { helperText: 'Order is required' })}
                            />
                          )}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <PurchasePackageItemsTable
                  control={control}
                  errors={errors}
                  setValue={setValue}
                  getValues={getValues}
                  productOptions={filteredItems}
                  warehouses={warehouses}
                  trigger={trigger}
                  watch={watch}
                  currency={currency}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomFilesUpload
                  setValue={setValue}
                  selectedPdFile={selectedPdFile}
                  setSelectedPdFile={setSelectedPdFile}
                  folderName={PURCHASE_PACKAGE_PDF}
                />
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
                  check(STATUS_DRAFT)
                }}
              >
                Save
              </Button>

              <Button variant='outlined' type='reset' onClick={() => handleCancel()}>
                Cancel
              </Button>
            </Box>
          </form>
        ) : (
          <Grid container>
            <Grid item xs={12} md={12} lg={12} xl={12}>
              <Card sx={{ p: 6, width: '100%' }}>
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
                      <Grid item xs={12} sm={6} md={5} xl={3.5}>
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

                      <Grid item xs={12} sm={5} md={4} lg={4} xl={3.7}>
                        {/* <Box component={'div'} sx={{ display: { xs: 'block', sm: 'block' } }}>
                                <LogoBox data={purchaseOrder} />
                              </Box> */}
                        <CommonViewTable>
                          <TableBody>
                            {' '}
                            <TableRow>
                              <TableCell sx={{ width: '50%' }}>
                                <Typography className='data-name'>Package No</Typography>
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
                                  #{selectedPurchasePackage?.packageNo}
                                </Typography>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ width: '50%' }}>
                                <Typography className='data-name'>Order No </Typography>
                              </TableCell>
                              <TableCell>
                                #{selectedPurchasePackage?.purchaseOrderNoPrefix}
                                {selectedPurchasePackage?.purchaseOrderNo}
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
                                  Package Date
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography className='data-value' sx={{ fontWeight: 400, lineHeight: '22px' }}>
                                  {DateFunction(selectedPurchasePackage?.packageDate)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ width: '50%' }}>
                                <Typography className='data-name'>Status </Typography>
                              </TableCell>
                              <TableCell>{rowStatusChip(selectedPurchasePackage?.status)}</TableCell>
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
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' }
                      }}
                    >
                      {/* <Grid item xs={0} sm={0} md={1.5} xl={3.6} sx={{ display: { xs: 'none', md: 'block' } }}></Grid> */}
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <PurchasePackageItemsTable
                      isEdit={isEdit}
                      control={control}
                      errors={errors}
                      setValue={setValue}
                      getValues={getValues}
                      trigger={trigger}
                      watch={watch}
                      purchaseOrder={purchaseOrder}
                      productOptions={filteredItems}
                      warehouses={warehouses}
                      currency={currency}
                      selectedPackage={selectedPurchasePackage}
                      handleEditPackageItemInput={handleEditPackageItemInput}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Grid
                      container
                      spacing={6}
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column-reverse', md: 'row' },
                        justifyContent: 'space-between'
                      }}
                    >
                      <Grid item xs={12} md={6}>
                        <Box sx={{ p: 4 }}>
                          {selectedPurchasePackage?.notes ? (
                            <>
                              <Typography
                                sx={{
                                  fontSize: '14px',
                                  fontWeight: 600,
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
                                    {selectedPurchasePackage?.notes}
                                  </pre>
                                </div>
                              </Typography>{' '}
                            </>
                          ) : null}
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
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
                                <Typography sx={{ fontSize: 'inherit', fontWeight: 500 }}>
                                  {getTotalQty()?.toFixed(2)}
                                </Typography>
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
                                  Total Packed Qty:
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography sx={{ fontSize: 'inherit', fontWeight: 600 }}>
                                  {/* {getTotalPackedQty()?.toFixed(2)} */}

                                  {selectedPurchasePackage?.totalPackageQty}
                                </Typography>
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
                                  Total Packed Value:
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography sx={{ fontSize: 'inherit', fontWeight: 600 }}>
                                  <NumberFormat
                                    value={selectedPurchasePackage?.totalPackageValue}
                                    currency={currency}
                                  />
                                </Typography>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
      {isAddNewModalOpen && <AddVendorPopup open={isAddNewModalOpen} setOpen={setIsAddNewModalOpen} />}

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

export default EditPurchasePackageDrawer
