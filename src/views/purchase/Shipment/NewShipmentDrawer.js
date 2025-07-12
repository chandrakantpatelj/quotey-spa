'use client'
import { useEffect, useState } from 'react'
import { Alert, Backdrop, Box, CircularProgress, Drawer, Grid, IconButton, Snackbar, Typography } from '@mui/material'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import Icon from 'src/@core/components/icon'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import { PURCHASE_SHIPMENT_PDF, SCHEMA_VERSION, STATUS_DRAFT } from 'src/common-functions/utils/Constants'
import { UploadMultipleFileS3Api } from 'src/views/forms/form-elements/custom-inputs/UploadMultipleFileS3Api'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { createAlert } from 'src/store/apps/alerts'
import useVendors from 'src/hooks/getData/useVendors'
import useWarehouses from 'src/hooks/getData/useWarehouses'
import { getExchangeRate } from 'src/common-functions/utils/UtilityFunctions'
import {
  createPurchaseOrderShipmentAndMoveToFirstStageMutation,
  createPurchaseOrderShipmentMutation
} from 'src/@core/components/graphql/purchase-order-shipment-queries'
import useTradings from 'src/hooks/getData/useTradings'
import useCountries from 'src/hooks/getData/useCountries'
import usePurchaseOrders from 'src/hooks/getData/usePurchaseOrders'
import usePurchasePackages from 'src/hooks/getData/usePurchasePackages'
import usePurchaseSettings from 'src/hooks/getData/usePurchaseSettings'
import { setAddPurchaseShipmet } from 'src/store/apps/purchase-shipments'
import CommonNewShipmentForm from './CommonNewShipmentForm'

function NewShipmentDrawer({ setOpenDrawer, openDrawer, reloadShipments, setReloadShipments }) {
  const dispatch = useDispatch()
  const tenant = useSelector(state => state.tenants?.selectedTenant) || {}
  const { tenantId = '' } = tenant
  const { tradings, fetchTradings } = useTradings(tenantId)

  const trading = tenant?.tradingId || null

  const { currencies } = useCurrencies()
  const { countries } = useCountries()
  const { vendors } = useVendors(tenantId)
  const { warehouses } = useWarehouses(tenantId)
  const { reloadPurchaseOrderInStore } = usePurchaseOrders(tenantId)
  const { reloadPurchasePackageInStore } = usePurchasePackages(tenantId)
  const { purchaseModuleSetting: purchaseSettingData } = usePurchaseSettings(tenantId)

  const localCurrency = useSelector(state => state?.currencies?.selectedCurrency) || {}
  const [loader, setLoader] = useState(false)
  const [selectedPdFile, setSelectedPdFile] = useState([])

  useEffect(() => {
    if (!tenantId) return
    fetchTradings()
  }, [tenantId, fetchTradings])

  const orderData = {
    schemaVersion: SCHEMA_VERSION,
    tradingId: trading,
    shipmentType: purchaseSettingData?.find(item => item?.default)?.purchaseType,
    shipmentDate: new Date(),
    currency: '',
    currencyExchangeRate: '',
    warehouseId: '',
    deliveryAddress: {
      addressLine1: '',
      addressLine2: '',
      cityOrTown: '',
      state: '',
      postcode: '',
      country: ''
    },
    notes: '',
    packages: [
      {
        packageId: '',
        packageNo: '',
        packageNoPrefix: '',
        purchaseOrderId: '',
        purchaseOrderNo: '',
        purchaseOrderNoPrefix: '',
        vendorId: '',
        totalValue: 0.0,
        currency: ''
      }
    ],
    taxes: [
      {
        taxId: '',
        taxType: '',
        taxName: '',
        paidToTaxAuthority: '',
        taxAuthorityId: '',
        paidToVendor: '',
        vendorId: '',
        distributionMethod: '',
        eligibleForTaxCredit: false,
        taxValue: 0.0,
        taxValueCurrency: '',
        inLocalCurrency: false
      }
    ],
    expenses: [
      {
        expenseId: '',
        expenseType: '',
        expenseName: '',
        vendorId: '',
        paidToMainVendor: '',
        additionalTaxes: '',
        eligibleForTaxCredit: '',
        distributionMethod: '',
        expenseValue: 0.0,
        taxValue: 0.0,
        expenseValueCurrency: ''
      }
    ],
    files: [],
    status: STATUS_DRAFT
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
  let shipmentType = watch('shipmentType')

  const defaultshipmentType = purchaseSettingData?.find(item => item?.default)?.purchaseType

  const settingPurchaseData = purchaseSettingData?.find(item => item?.purchaseType === shipmentType)

  useEffect(() => {
    setValue('shipmentType', defaultshipmentType)
    let shipmentCurrency =
      currencies?.find(val => val?.currencyId === settingPurchaseData?.shipmentCurrency) || localCurrency

    setValue('currency', shipmentCurrency)
    setValue('currencyExchangeRate', getExchangeRate(shipmentCurrency?.exchangeRate || 1, localCurrency?.exchangeRate))
  }, [purchaseSettingData])

  let currency = watch('currency')

  const { shipmentTaxes = [], shipmentExpenses = [] } = settingPurchaseData || {}

  const filterTaxes = shipmentTaxes
    ?.filter(tax => tax?.enabled)
    ?.map(item => ({
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
      inLocalCurrency: item?.inLocalCurrency ?? false,
      taxValueCurrency: item?.inLocalCurrency ? localCurrency?.currencyId : currency?.currencyId
    }))
  const filterExpenses = shipmentExpenses
    ?.filter(expense => expense?.enabled)
    ?.map(item => {
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

  useEffect(() => {
    setValue('taxes', filterTaxes)
    setValue('expenses', filterExpenses)
  }, [settingPurchaseData])

  useEffect(() => {
    if (warehouses?.length === 1) {
      setValue('warehouseId', warehouses[0])
      setValue('deliveryAddress.cityOrTown', warehouses[0]?.address?.cityOrTown)
      setValue('deliveryAddress.postcode', warehouses[0]?.address?.postcode)
      setValue('deliveryAddress.addressLine1', warehouses[0]?.address?.addressLine1)
      setValue('deliveryAddress.addressLine2', warehouses[0]?.address?.addressLine2)
      setValue('deliveryAddress.country', warehouses[0]?.address?.country)
      setValue('deliveryAddress.state', warehouses[0]?.address?.state)
    }
  }, [warehouses])

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

  const toggleDrawer = open => event => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return
    }
    setOpenDrawer(open)
  }

  const handleNewDataSave = async newData => {
    setOpen(false)
    setLoader(true)
    const { subtotal, ...data } = newData
    const purchaseOrderShipment = {
      ...data,
      vendorId: data?.vendorId?.vendorId,
      currency: data?.currency?.currencyId,
      warehouseId: data?.warehouseId?.warehouseId || '',
      packages: data?.packages?.map(({ qty, subtotal, ...rest }) => ({
        ...rest
      })),
      taxes: data?.taxes?.map(({ inLocalCurrency, ...rest }) => rest)
    }

    if (submitType === 'confirmed') {
      try {
        const response = await writeData(createPurchaseOrderShipmentAndMoveToFirstStageMutation(), {
          tenantId,
          purchaseOrderShipment
        })
        const result = response.createPurchaseOrderShipmentAndMoveToFirstStage
        if (result) {
          if (selectedPdFile || selectedPdFile?.length !== 0 || selectedPdFile[0]) {
            await UploadMultipleFileS3Api(selectedPdFile, dispatch)
          }
          for (const item of result.packages) {
            await reloadPurchaseOrderInStore(item.purchaseOrderId)
            await reloadPurchasePackageInStore(item.packageId)
          }
          dispatch(setAddPurchaseShipmet(result))
          dispatch(createAlert({ message: 'Purchase Shipment created and confirmed  successfully !', type: 'success' }))
          setReloadShipments(!reloadShipments)
        } else {
          setLoader(false)
          dispatch(
            createAlert({ message: response.errors[0].message || 'Faild to create purchase shipment!', type: 'error' })
          )
        }
        return response
      } catch (error) {
        // Handle any errors and optionally dispatch an error action
        console.error('error: ', error)
        setLoader(false)
      } finally {
        handleCancel()
      }
    } else {
      try {
        const response = await writeData(createPurchaseOrderShipmentMutation(), { tenantId, purchaseOrderShipment })
        const result = response.createPurchaseOrderShipment
        if (result) {
          if (selectedPdFile || selectedPdFile?.length !== 0 || selectedPdFile[0]) {
            await UploadMultipleFileS3Api(selectedPdFile, dispatch)
          }
          for (const item of result.packages) {
            await reloadPurchaseOrderInStore(item.purchaseOrderId)
            await reloadPurchasePackageInStore(item.packageId)
          }
          dispatch(setAddPurchaseShipmet(result))
          dispatch(createAlert({ message: 'Purchase Shipment created  successfully !', type: 'success' }))
          setReloadShipments(!reloadShipments)
        } else {
          setLoader(false)
          dispatch(
            createAlert({ message: response.errors[0].message || 'Faild to create purchase shipment!', type: 'error' })
          )
        }
        return response
      } catch (error) {
        // Handle any errors and optionally dispatch an error action
        console.error('error: ', error)
        setLoader(false)
      } finally {
        handleCancel()
      }
    }
  }

  const handleCancel = () => {
    setOpenDrawer(false)
    reset()
  }

  return (
    <Drawer
      anchor='right'
      open={openDrawer}
      onClose={toggleDrawer(false)}
      sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 1100 } } }}
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
        <Typography sx={{ fontSize: { xs: '16px', md: '20px' }, fontWeight: 500 }}>New Shipment</Typography>

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
        <form onSubmit={handleSubmit(handleNewDataSave)}>
          <Grid container>
            <Grid item xs={12} md={12} lg={12}>
              <CommonNewShipmentForm
                vendors={vendors}
                watch={watch}
                control={control}
                currency={currency}
                currencies={currencies}
                countries={countries}
                warehouses={warehouses}
                tradings={tradings}
                errors={errors}
                trigger={trigger}
                tenant={tenant}
                localCurrency={localCurrency}
                setValue={setValue}
                getValues={getValues}
                selectedPdFile={selectedPdFile}
                setSelectedPdFile={setSelectedPdFile}
                folderName={PURCHASE_SHIPMENT_PDF}
                handleCancel={handleCancel}
                check={check}
                settingPurchaseData={settingPurchaseData}
              />
            </Grid>
          </Grid>
        </form>
      </Box>

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

export default NewShipmentDrawer
