// ** Next Import
import Link from 'next/link'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import {
  Typography,
  IconButton,
  Grid,
  Box,
  Button,
  Snackbar,
  Alert,
  FormHelperText,
  Backdrop,
  CircularProgress
} from '@mui/material'
import { Close } from '@mui/icons-material'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomFilesUpload from 'src/views/forms/form-elements/custom-inputs/CustomFilesUpload'
import { PURCHASE_PACKAGE_PDF, SCHEMA_VERSION, STATUS_DRAFT } from 'src/common-functions/utils/Constants'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import useVendors from 'src/hooks/getData/useVendors'
import AddVendorPopup from 'src/common-components/AddVendorPopup'
import CustomDatePicker from 'src/views/forms/form-elements/pickers/CustomDatePicker'
import PurchasePackageItemsTable from 'src/views/purchase/purchase-package/PurchasePackageItemsTable'
import { fetchData, writeData } from 'src/common-functions/GraphqlOperations'
import { getPurchaseOrdersByVendorToBePackagedQuery } from 'src/@core/components/graphql/purchase-order-queries'
import useWarehouses from 'src/hooks/getData/useWarehouses'
import { subtractDecimalsWithoutRounding } from 'src/common-functions/utils/DecimalUtils'
import {
  createPurchaseOrderPackageAndMoveToFirstStageMutation,
  createPurchaseOrderPackageMutation
} from 'src/@core/components/graphql/purchase-order-packages-queries'
import { createAlert } from 'src/store/apps/alerts'
import { parseDate } from 'src/common-functions/utils/UtilityFunctions'
import { UploadMultipleFileS3Api } from 'src/views/forms/form-elements/custom-inputs/UploadMultipleFileS3Api'
import { setAddPurchasePackage } from 'src/store/apps/purchase-packages'
import useCurrencies from 'src/hooks/getData/useCurrencies'

function PurchaseOrder() {
  const router = useRouter()
  const dispatch = useDispatch()
  const tenant = useSelector(state => state.tenants?.selectedTenant) || {}
  const { tenantId = '' } = tenant
  const localCurrency = useSelector(state => state?.currencies?.selectedCurrency) || {}

  const { vendors } = useVendors(tenantId)
  const { warehouses } = useWarehouses(tenantId)
  const { currencies } = useCurrencies()

  const [selectedPdFile, setSelectedPdFile] = useState([])
  const [loader, setLoader] = useState(false)

  const defaultData = {
    schemaVersion: SCHEMA_VERSION,
    tradingId: '',
    packageDate: new Date(),
    purchaseType: '',
    purchaseModuleSettingVersion: '',
    purchaseOrderId: '',
    purchaseOrderNo: '',
    purchaseOrderNoPrefix: '',
    vendorId: '',
    packageItems: [],
    totalPackageQty: '',
    totalPackageValue: '',
    currency: localCurrency,
    notes: '',
    status: STATUS_DRAFT,
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
    defaultValues: defaultData,
    mode: 'onChange'
  })

  const [purchaseOrders, setPurchaseOrders] = useState([])

  const getPurchaseOrders = async value => {
    const vendorId = value?.vendorId
    try {
      const response = await fetchData(getPurchaseOrdersByVendorToBePackagedQuery(tenantId, vendorId))
      const { getPurchaseOrdersByVendorToBePackaged = [] } = response || {}
      setPurchaseOrders(getPurchaseOrdersByVendorToBePackaged)
    } catch (error) {
      console.error(error)
    }
  }
  const currency = getValues('currency')

  const [filteredItems, setFilteredItem] = useState([])

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

  const [submitType, setSubmitType] = useState(null)

  const check = saveType => {
    setSubmitType(saveType)
    setOpen(true)
    const fieldName = Object.keys(errors)[0]
    const errName = document.getElementById(fieldName)
    errName?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
  }

  const handleNewPurchasePackageSubmit = async newPackage => {
    setOpen(false)
    setLoader(true)

    const purchaseOrderPackage = {
      ...newPackage,
      packageDate: parseDate(newPackage?.packageDate),
      purchaseOrderId: newPackage?.purchaseOrderId.orderId,
      purchaseOrderNo: newPackage?.purchaseOrderId.orderNo,
      vendorId: newPackage?.vendorId.vendorId,
      currency: newPackage?.currency.currencyId,
      packageItems: newPackage?.packageItems?.map(({ qty, uom, qtyToPack, totalPackedQty, ...item }) => ({
        ...item,
        packedQty: parseFloat(qtyToPack),
        subtotal: parseFloat(item?.subtotal)
      })),
      totalPackageQty: parseFloat(newPackage?.totalPackageQty),
      totalPackageValue: parseFloat(newPackage?.totalPackageValue)
    }

    if (submitType === 'confirmed') {
      try {
        const response = await writeData(createPurchaseOrderPackageAndMoveToFirstStageMutation(), {
          tenantId,
          purchaseOrderPackage
        })
        if (response.createPurchaseOrderPackageAndMoveToFirstStage) {
          if (selectedPdFile || selectedPdFile?.length !== 0 || selectedPdFile[0]) {
            await UploadMultipleFileS3Api(selectedPdFile, dispatch)
          }
          dispatch(setAddPurchasePackage(response.createPurchaseOrderPackageAndMoveToFirstStage))
          dispatch(createAlert({ message: 'Purchase Package created and confirmed successfully !', type: 'success' }))
          router.push('/purchases/packages/')
        } else {
          setLoader(false)
          dispatch(createAlert({ message: response.errors[0].message || 'Package creation  failed!', type: 'error' }))
        }
        return response
      } catch (error) {
        console.error('error: ', error)
        setLoader(false)
      }
    } else {
      try {
        const response = await writeData(createPurchaseOrderPackageMutation(), { tenantId, purchaseOrderPackage })
        if (response.createPurchaseOrderPackage) {
          if (selectedPdFile || selectedPdFile?.length !== 0 || selectedPdFile[0]) {
            await UploadMultipleFileS3Api(selectedPdFile, dispatch)
          }
          dispatch(setAddPurchasePackage(response.createPurchaseOrderPackage))
          dispatch(createAlert({ message: 'Purchase Package created  successfully !', type: 'success' }))
          router.push('/purchases/packages/')
        } else {
          setLoader(false)
          dispatch(createAlert({ message: response.errors[0].message || 'Package creation  failed!', type: 'error' }))
        }
        return response
      } catch (error) {
        console.error('error: ', error)
        setLoader(false)
      }
    }
  }

  const handleCancel = () => {
    router.push('/purchases/packages/')
    reset()
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
            New Purchase Package
          </Typography>
        }
        button={
          <IconButton component={Link} scroll={true} href={`/purchases/packages/`}>
            <Close sx={{ color: theme => theme.palette.primary.main }} />
          </IconButton>
        }
      />
      <PageWrapper>
        <form onSubmit={handleSubmit(handleNewPurchasePackageSubmit)}>
          <Grid container spacing={{ xs: 6 }}>
            <Grid item xs={12} xl={10}>
              <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                <Grid item xs={12} sm={4} md={3}>
                  <Controller
                    name='packageDate'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <CustomDatePicker
                        label={'Date'}
                        fullWidth={true}
                        date={field.value}
                        onChange={field.onChange}
                        error={Boolean(errors?.packageDate)}
                      />
                    )}
                  />
                  {errors?.packageDate && <FormHelperText error> Date is required</FormHelperText>}
                </Grid>
                <Grid item xs={12} sm={4} md={3}>
                  <Controller
                    name='vendorId'
                    control={control}
                    rules={{ required: 'Vendor is required' }}
                    render={({ field, fieldState: { error } }) => (
                      <CustomAutocomplete
                        id='vendorId'
                        {...field}
                        onChange={(event, newValue) => {
                          if (newValue?.vendorId === 'add-new') {
                            handleAddNewVendor()
                            return
                          }
                          field.onChange(newValue)
                          setValue('purchaseOrderId', {})
                          getPurchaseOrders(newValue)
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
                          if (option?.vendorId === 'add-new') {
                            return (
                              <li {...props} style={{ display: 'flex', justifyContent: 'center', fontWeight: 'bold' }}>
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
                <Grid item xs={12} sm={4} md={3}>
                  <Controller
                    name='purchaseOrderId'
                    control={control}
                    rules={{ required: 'Order is required' }}
                    render={({ field, fieldState: { error } }) => (
                      <CustomAutocomplete
                        {...field}
                        onChange={(event, newValue) => {
                          field.onChange(newValue)
                          setValue('purchaseOrderNo', newValue?.orderNo)
                          setValue('purchaseOrderNoPrefix', newValue?.orderNoPrefix)
                          setValue('tradingId', newValue?.tradingId)
                          setValue('purchaseType', newValue?.purchaseType)
                          setValue('purchaseModuleSettingVersion', newValue?.purchaseModuleSettingVersion)
                          const currency = currencies?.find(val => val?.currencyId === newValue?.currency)

                          setValue('currency', currency)
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
                          setValue('notes', newValue?.notes)
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
                            error={Boolean(error)}
                            helperText={error?.message}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} xl={10}>
              <PurchasePackageItemsTable
                control={control}
                errors={errors}
                setValue={setValue}
                getValues={getValues}
                productOptions={filteredItems}
                warehouses={warehouses}
                trigger={trigger}
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
                check(null)
              }}
            >
              Save
            </Button>

            <Button
              variant='contained'
              type='submit'
              onClick={() => {
                check('confirmed')
              }}
            >
              Save As Confirmed
            </Button>

            <Button type='reset' variant='outlined' onClick={handleCancel}>
              Cancel
            </Button>
          </Box>
        </form>
      </PageWrapper>
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
    </ErrorBoundary>
  )
}

export default PurchaseOrder
