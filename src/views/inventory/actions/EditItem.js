// ** Next Import
import Link from 'next/link'
import Router from 'next/router'
import React, { useState, useEffect } from 'react'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import {
  Box,
  IconButton,
  Typography,
  Grid,
  MenuItem,
  Button,
  Divider,
  Checkbox,
  Switch,
  InputAdornment,
  LinearProgress,
  Snackbar,
  Alert,
  Backdrop,
  CircularProgress
} from '@mui/material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import CustomTextField from 'src/@core/components/mui/text-field'
import { tags } from 'src/@fake-db/autocomplete'
import { Close } from '@mui/icons-material'
import { createFilterOptions } from '@mui/material/Autocomplete'
import {
  convertCurrency,
  fetchMultiImages,
  floatPattern,
  floatPatternMsg,
  removeNullFields,
  safeNumber
} from 'src/common-functions/utils/UtilityFunctions'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import { useForm, Controller } from 'react-hook-form'
import { Amplify } from 'aws-amplify'
import { AuthConfig } from 'src/@core/components/auth/amlify-config'
import { createAlert } from 'src/store/apps/alerts'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { updateItemMutation } from 'src/@core/components/graphql/item-queries'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import SaveOtherSetting from 'src/views/forms/form-elements/custom-inputs/SaveOtherSetting'
import DeleteUploadFile from 'src/views/forms/form-elements/custom-inputs/DeleteUploadFile'
import { UploadMultipleFileS3Api } from 'src/views/forms/form-elements/custom-inputs/UploadMultipleFileS3Api'
import ProductMultipleUploader from '../product/ProductMultipleUploader'
import { setUpdateProduct } from 'src/store/apps/products'
import PackingUnitsTable from 'src/@core/components/common-components/PackingUnitsTable'
import EnableDiamensionTable from 'src/@core/components/common-components/EnableDiamensionTable'
import useCurrencies from 'src/hooks/getData/useCurrencies'

Amplify.configure(AuthConfig)

export default function EditItem({ productsData, loading }) {
  const router = Router
  const dispatch = useDispatch()
  const selectedItem = useSelector(state => state.products?.selectedProduct) || []
  const { settings = [] } = productsData || {}
  const { currencies } = useCurrencies()
  const [loader, setLoader] = React.useState(false)
  const [sellingCurrency, setSellingCurrency] = useState()
  const [costCurrency, setCostCurrency] = useState()
  const [purchaseCurrency, setPurchaseCurrency] = useState()
  const filter = createFilterOptions()
  const [selectedImages, setSelectedImages] = useState([])
  const [deletedImages, setDeletedImages] = useState([])
  const tenantId = useSelector(state => state.tenants?.selectedTenant.tenantId)

  const {
    reset,
    control,
    watch,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
    trigger
  } = useForm({
    mode: 'onChange'
  })
  const isTaxInclusive = watch('sellingPriceTaxInclusive')

  useEffect(() => {
    if (Object.keys(selectedItem).length === 0) {
      router.push('/inventory/products/')
    }
  }, [selectedItem, tenantId])

  useEffect(() => {
    reset({
      ...selectedItem,
      sellingPriceCurrency: currencies?.find(item => item?.currencyId === selectedItem?.sellingPriceCurrency) || {},
      costPriceCurrency: currencies?.find(item => item?.currencyId === selectedItem?.costPriceCurrency) || {}
    })
    setSellingCurrency(currencies?.find(item => item?.currencyId === selectedItem?.sellingPriceCurrency) || null)
    setCostCurrency(currencies?.find(item => item?.currencyId === selectedItem?.costPriceCurrency) || {})
    setPurchaseCurrency(currencies?.find(item => item?.currencyId === selectedItem?.purchasePriceCurrency) || {})
    setValue(
      'purchasePriceCurrency',
      currencies?.find(item => item?.currencyId === selectedItem?.purchasePriceCurrency) || {}
    )
  }, [selectedItem, currencies])

  const [open, setOpen] = useState(false)

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }

    setOpen(false)
  }
  const check = () => {
    setOpen(true)
    const fieldName = Object.keys(errors)[0]
    const errName = document.getElementById(fieldName)
    errName?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
  }

  const handleEditItemSave = async newItem => {
    setLoader(false)
    setOpen(false)
    if (newItem?.enableDimension === false || newItem?.enableDimension === null) {
      newItem.dimensions = null
    } else {
      removeNullFields(newItem.dimensions)
    }
    delete newItem?.itemCodePrefix
    delete newItem?.createdDateTime

    const item = {
      ...newItem,
      //packedUnit: safeNumber(newItem?.packedUnit),
      sellingPrice: newItem?.sellingPrice ? safeNumber(newItem?.sellingPrice) : newItem?.sellingPrice,
      costPrice: newItem?.costPrice ? safeNumber(newItem?.costPrice) : newItem?.costPrice,
      purchasePrice: newItem?.purchasePrice ? safeNumber(newItem?.purchasePrice) : newItem?.purchasePrice,
      vendor: newItem?.vendor?.vendorId,
      sellingPriceCurrency: newItem?.sellingPriceCurrency?.currencyId,
      costPriceCurrency: newItem?.costPriceCurrency?.currencyId,
      purchasePriceCurrency: newItem?.purchasePriceCurrency?.currencyId,
      packingUnits: newItem?.packingUnits
    }

    delete item.itemId
    delete item.tenantId
    delete item.itemCode
    delete item.availableQty
    delete item.modifiedBy
    delete item.modifiedDateTime
    delete item.createdBy
    delete item.height
    delete item.length
    delete item.width

    const tenantId = selectedItem?.tenantId
    const itemId = selectedItem?.itemId

    await SaveOtherSetting(settings, tenantId, newItem, dispatch)
    try {
      const response = await writeData(updateItemMutation(), { tenantId, itemId, item })
      if (response.updateItem) {
        if (deletedImages.length > 0 && selectedImages) {
          deletedImages.forEach(async element => {
            const findDeleted = selectedImages.find(item => item.key === element.key)
            if (!findDeleted) {
              await DeleteUploadFile(element.key)
            }
          })
        }
        if (selectedImages || selectedImages?.length !== 0 || selectedImages[0]) {
          await UploadMultipleFileS3Api(selectedImages, dispatch)
        }
        dispatch(setUpdateProduct(response?.updateItem))

        // if (deletedImageUrl) {
        //   await deleteImage(deletedImageUrl)
        // }
        // await uploadImage(files, selectedItem?.images)
        dispatch(createAlert({ message: 'Product Updated successfully !', type: 'success' }))
        router.push(`/inventory/products/`)
      } else {
        setLoader(false)
        dispatch(createAlert({ message: 'Product Updation failed !', type: 'error' }))
      }
      return response
    } catch (error) {
      setLoader(false)
      console.log('error', error)
    }
  }

  useEffect(() => {
    selectedItem?.images?.length > 0 &&
      selectedItem?.images?.map(item => {
        setDeletedImages(prev => [...prev, item])
        fetchMultiImages(setSelectedImages, item)
      })
  }, [selectedItem])

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
            Edit Product - {selectedItem?.itemCode}
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
              href={`/inventory/products/add-product`}
            >
              Add New
            </Button>
            <IconButton
              variant='outlined'
              color='default'
              sx={{ fontSize: '21px' }}
              component={Link}
              scroll={true}
              href='/inventory/products/'
              onClick={() => reset()}
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
          <form onSubmit={handleSubmit(handleEditItemSave)}>
            <Grid container columnSpacing={{ xs: 8, md: 10, xl: 14 }} rowSpacing={{ xs: 8, md: 10, lg: 5 }}>
              <Grid item xs={12} md={8.5} xl={8}>
                <Grid container spacing={{ xs: 12, md: 12, lg: 5 }}>
                  <Grid item xs={12} sm={12} lg={4} xl={3.5}>
                    <Box component='div' sx={{ mb: { xs: 3, md: 8 } }}>
                      <ProductMultipleUploader
                        setValue={setValue}
                        selectedImages={selectedImages}
                        setSelectedImages={setSelectedImages}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={12} lg={8} xl={8.5}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6} md={6}>
                        <Controller
                          name='itemName'
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <CustomTextField
                              fullWidth
                              {...field}
                              id='itemName'
                              label='Name*'
                              error={Boolean(errors.itemName)}
                              {...(errors.itemName && { helperText: 'Item name is required' })}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={6} sm={3} md={3}>
                        <Controller
                          name='itemGroup'
                          control={control}
                          rules={{ required: false }}
                          render={({ field }) => (
                            <CustomTextField {...field} select fullWidth size='small' label='Item Group'>
                              <MenuItem value='product'>Product</MenuItem>
                              <MenuItem value='service'>Service</MenuItem>
                            </CustomTextField>
                          )}
                        />
                      </Grid>
                      <Grid item xs={6} sm={3} md={3}>
                        <Controller
                          name='uom'
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <CustomAutocomplete
                              selectOnFocus
                              clearOnBlur
                              freeSolo
                              handleHomeEndKeys
                              options={settings?.uom || []}
                              forcePopupIcon={true}
                              noOptionsText={'Add UOM'}
                              value={field.value}
                              onChange={(event, newValue) => {
                                if (typeof newValue === 'string') {
                                  field.onChange(newValue)
                                } else if (newValue && newValue.inputValue) {
                                  field.onChange(newValue.inputValue)
                                } else {
                                  field.onChange(newValue)
                                }
                              }}
                              filterOptions={(options, params) => {
                                const filtered = filter(options, params)
                                const { inputValue } = params
                                const isExisting = options.some(option => inputValue === option)
                                if (inputValue !== '' && !isExisting) {
                                  filtered.push(inputValue)
                                }
                                return filtered
                              }}
                              getOptionLabel={option => (typeof option === 'string' ? option : option)}
                              renderOption={(props, option) => <li {...props}>{option}</li>}
                              renderInput={params => (
                                <CustomTextField
                                  {...params}
                                  label='Uom'
                                  fullWidth
                                  error={Boolean(errors.uom)}
                                  {...(errors.uom && { helperText: 'Uom is required' })}
                                  onKeyDown={event => {
                                    if (event.key === 'Enter') {
                                      const { value } = event.target
                                      if (value && !settings?.uom.includes(value)) {
                                        field.onChange(value)
                                      }
                                    }
                                  }}
                                />
                              )}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ mt: 3 }}>
                          <Controller
                            name='itemDescription'
                            control={control}
                            render={({ field: { onChange, value } }) => (
                              <CustomTextField
                                fullWidth
                                minRows={6}
                                multiline
                                value={value}
                                onChange={onChange}
                                id='itemName'
                                label='Item Description'
                              />
                            )}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={12} xl={7.5} id='packingUnits'>
                        <PackingUnitsTable control={control} errors={errors} selectedItem={selectedItem} />
                      </Grid>
                      <Grid item xs={12} sm={12} xl={4.5}>
                        <EnableDiamensionTable setValue={setValue} control={control} selectedItem={selectedItem} />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={3.5} xl={4}>
                <Grid
                  container
                  spacing={6}
                  justifyContent={'flex-start'}
                  alignItems={'center'}
                  sx={{ marginBottom: '30px' }}
                >
                  <Grid item xs={12} md={12} lg={12}>
                    <Typography
                      sx={{
                        fontSize: '14px',
                        fontWeight: '500',
                        mb: '10px'
                      }}
                    >
                      Selling information
                    </Typography>{' '}
                    <Grid container spacing={{ xs: 3 }}>
                      <Grid item xs={4} sm={4.5} md={6} xl={4.5}>
                        <Controller
                          name='sellingPrice'
                          control={control}
                          rules={{
                            required: false,
                            pattern: {
                              value: floatPattern,
                              message: floatPatternMsg
                            }
                          }}
                          render={({ field }) => (
                            <CustomTextField
                              {...field}
                              value={field.value === null ? '' : field.value}
                              onChange={e => {
                                let value = e.target.value.replace(/[^0-9.]/g, '')
                                const decimalIndex = value.indexOf('.')
                                if (decimalIndex !== -1 && value.substring(decimalIndex + 1).length > 4) {
                                  value = value.substring(0, decimalIndex + 5)
                                }
                                field.onChange(value === '' ? null : value)
                              }}
                              fullWidth
                              id='sellingPrice'
                              label='Selling Price'
                              variant='outlined'
                              InputProps={{
                                inputProps: {
                                  step: 'any',
                                  inputMode: 'numeric',
                                  pattern: '^[0-9]+(\\.[0-9]{1,4})?$'
                                },
                                startAdornment:
                                  sellingCurrency?.displayAlignment === 'left' ? (
                                    <InputAdornment position='start'>{sellingCurrency?.symbol}</InputAdornment>
                                  ) : null,
                                endAdornment:
                                  sellingCurrency?.displayAlignment === 'right' ? (
                                    <InputAdornment position='end'>{sellingCurrency?.symbol}</InputAdornment>
                                  ) : null
                              }}
                              {...(errors?.sellingPrice?.type === 'pattern'
                                ? { helperText: 'Enter a valid integer or float price' }
                                : {})}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item xs={3.5} sm={3} md={6} xl={3}>
                        <Controller
                          name='sellingPriceCurrency'
                          control={control}
                          defaultValue={{}}
                          rules={{ required: false }}
                          render={({ field }) => {
                            const selectedCurrency =
                              currencies.find(currency => currency.currencyId === field.value?.currencyId) || null

                            return (
                              <CustomAutocomplete
                                {...field}
                                options={currencies}
                                fullWidth
                                openOnFocus={true}
                                value={selectedCurrency}
                                getOptionLabel={option =>
                                  typeof option === 'string' ? option : `${option?.currencyId}`
                                }
                                isOptionEqualToValue={(option, value) => option.currencyId === value?.currencyId}
                                renderOption={(props, option) => (
                                  <Box component='li' {...props}>
                                    {option.symbol} - {option.currencyId}
                                  </Box>
                                )}
                                onChange={(e, newValue) => {
                                  if (newValue !== null) {
                                    const sp = getValues('sellingPrice')
                                    if (sellingCurrency?.currencyId !== newValue?.currencyId && sp) {
                                      setValue(
                                        'sellingPrice',
                                        convertCurrency(
                                          sellingCurrency?.exchangeRate,
                                          1,
                                          newValue?.exchangeRate,
                                          sp
                                        ).toFixed(2)
                                      )
                                    }
                                  }
                                  const updatedValue = newValue || { currencyId: '', symbol: '', exchangeRate: '' }
                                  field.onChange(updatedValue)
                                  setValue('sellingPriceCurrency', updatedValue, {
                                    shouldValidate: true,
                                    shouldDirty: true
                                  })
                                  setSellingCurrency(newValue)
                                }}
                                renderInput={params => (
                                  <CustomTextField {...params} fullWidth label='Selling Currency' />
                                )}
                              />
                            )
                          }}
                        />
                      </Grid>
                      <Grid item xs={3.5} sm={3} md={6} xl={3} sx={{ display: { xs: 'none', xl: 'block' } }}></Grid>
                      <Grid item xs={4} sm={4.5} md={6} xl={4.5}>
                        <Controller
                          name='costPrice'
                          control={control}
                          rules={{
                            required: false,
                            pattern: {
                              value: floatPattern,
                              message: floatPatternMsg
                            }
                          }}
                          render={({ field }) => (
                            <CustomTextField
                              {...field}
                              value={field.value === null ? '' : field.value}
                              onChange={e => {
                                let value = e.target.value.replace(/[^0-9.]/g, '')
                                const decimalIndex = value.indexOf('.')
                                if (decimalIndex !== -1 && value.substring(decimalIndex + 1).length > 4) {
                                  value = value.substring(0, decimalIndex + 5)
                                }
                                field.onChange(value === '' ? null : value)
                              }}
                              fullWidth
                              label='Cost Price'
                              variant='outlined'
                              InputProps={{
                                inputProps: {
                                  step: 'any',
                                  inputMode: 'numeric',
                                  pattern: '^[0-9]+(\\.[0-9]{1,4})?$'
                                },
                                startAdornment:
                                  costCurrency?.displayAlignment === 'left' ? (
                                    <InputAdornment position='start'>{costCurrency?.symbol}</InputAdornment>
                                  ) : null,
                                endAdornment:
                                  costCurrency?.displayAlignment === 'right' ? (
                                    <InputAdornment position='end'>{costCurrency?.symbol}</InputAdornment>
                                  ) : null
                              }}
                              {...(errors?.costPrice?.type === 'pattern'
                                ? { helperText: 'Enter a valid integer or float price' }
                                : {})}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={4} sm={4.5} md={6} xl={3}>
                        <Controller
                          name='costPriceCurrency'
                          control={control}
                          defaultValue={{}}
                          rules={{ required: false }}
                          render={({ field }) => {
                            const selectedCurrency =
                              currencies.find(currency => currency.currencyId === field.value?.currencyId) || null

                            return (
                              <CustomAutocomplete
                                {...field}
                                options={currencies}
                                disableClearable={false}
                                fullWidth
                                openOnFocus={true}
                                value={selectedCurrency}
                                getOptionLabel={option =>
                                  typeof option === 'string' ? option : `${option?.currencyId}`
                                }
                                isOptionEqualToValue={(option, value) => option.currencyId === value?.currencyId}
                                renderOption={(props, option) => (
                                  <Box component='li' {...props}>
                                    {option.symbol} - {option.currencyId}
                                  </Box>
                                )}
                                onChange={(e, newValue) => {
                                  const cp = getValues('costPrice')
                                  if (newValue !== null) {
                                    if (costCurrency?.currencyId !== newValue?.currencyId && cp) {
                                      setValue(
                                        'costPrice',
                                        convertCurrency(
                                          costCurrency?.exchangeRate,
                                          1,
                                          newValue?.exchangeRate,
                                          cp
                                        ).toFixed(2)
                                      )
                                    }
                                  }
                                  const updatedValue = newValue || { currencyId: '', symbol: '', exchangeRate: '' }
                                  field.onChange(updatedValue)
                                  setValue('costPriceCurrency', updatedValue, {
                                    shouldValidate: true,
                                    shouldDirty: true
                                  })
                                  setCostCurrency(newValue)
                                }}
                                renderInput={params => <CustomTextField {...params} fullWidth label='Cost Currency' />}
                              />
                            )
                          }}
                        />
                      </Grid>
                    </Grid>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-between', mt: 4 }}>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Controller
                          name='sellingPriceTaxInclusive'
                          control={control}
                          render={({ field }) => <Checkbox sx={{ p: '4px' }} defaultChecked={field.value} {...field} />}
                        />
                        <Typography sx={{ fontSize: '13px' }}>
                          {isTaxInclusive ? 'Inclusive of Tax' : 'Exclusive of Tax'}
                        </Typography>
                      </Box>
                    </Box>
                    <Divider />
                  </Grid>
                  <Grid item xs={12} md={12} lg={12}>
                    <Typography
                      sx={{
                        fontSize: '14px',
                        fontWeight: '500',
                        mb: '20px'
                      }}
                    >
                      Purchase information
                    </Typography>{' '}
                    <Grid container spacing={{ xs: 3 }}>
                      <Grid item xs={6} sm={6}>
                        <Controller
                          name='purchasePrice'
                          control={control}
                          rules={{
                            required: false,
                            pattern: {
                              value: floatPattern,
                              message: floatPatternMsg
                            }
                          }}
                          render={({ field }) => (
                            <CustomTextField
                              {...field}
                              value={field.value === null ? '' : field.value}
                              onChange={e => {
                                let value = e.target.value.replace(/[^0-9.]/g, '')
                                const decimalIndex = value.indexOf('.')
                                if (decimalIndex !== -1 && value.substring(decimalIndex + 1).length > 4) {
                                  value = value.substring(0, decimalIndex + 5)
                                }
                                field.onChange(value === '' ? null : value)
                              }}
                              fullWidth
                              id='purchasePrice'
                              label='Purchase Price'
                              variant='outlined'
                              InputProps={{
                                inputProps: {
                                  step: 'any',
                                  inputMode: 'numeric',
                                  pattern: '^[0-9]+(\\.[0-9]{1,4})?$'
                                },
                                startAdornment:
                                  purchaseCurrency?.displayAlignment === 'left' ? (
                                    <InputAdornment position='start'>{purchaseCurrency?.symbol}</InputAdornment>
                                  ) : null,
                                endAdornment:
                                  purchaseCurrency?.displayAlignment === 'right' ? (
                                    <InputAdornment position='end'>{purchaseCurrency?.symbol}</InputAdornment>
                                  ) : null
                              }}
                              error={Boolean(errors.purchasePrice)}
                              helperText={
                                errors.purchasePrice?.type === 'required'
                                  ? 'Purchase Price is required'
                                  : errors.purchasePrice?.type === 'pattern'
                                  ? 'Enter a valid integer or float price'
                                  : ''
                              }
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={6} sm={6}>
                        <Controller
                          name='purchasePriceCurrency'
                          control={control}
                          defaultValue={{}}
                          rules={{ required: false }}
                          render={({ field }) => {
                            console.log('purchasePriceCurrency field.value? ', field.value)
                            console.log('purchasePriceCurrency currencies ', currencies)

                            const selectedCurrency =
                              currencies.find(currency => currency.currencyId === field.value.currencyId) || null
                            console.log('purchasePriceCurrency selectedCurrency ', selectedCurrency)
                            return (
                              <CustomAutocomplete
                                {...field}
                                options={currencies}
                                disableClearable={false}
                                fullWidth
                                openOnFocus={true}
                                value={selectedCurrency}
                                getOptionLabel={option =>
                                  typeof option === 'string' ? option : `${option?.currencyId}`
                                }
                                isOptionEqualToValue={(option, value) => option.currencyId === value?.currencyId}
                                renderOption={(props, option) => (
                                  <Box component='li' {...props}>
                                    {option.symbol} - {option.currencyId}
                                  </Box>
                                )}
                                onChange={(e, newValue) => {
                                  const cp = getValues('purchasePrice')
                                  if (newValue !== null) {
                                    if (purchaseCurrency?.currencyId !== newValue?.currencyId && cp) {
                                      setValue(
                                        'purchasePrice',
                                        convertCurrency(
                                          purchaseCurrency?.exchangeRate,
                                          1,
                                          newValue?.exchangeRate,
                                          cp
                                        ).toFixed(2)
                                      )
                                    }
                                  }
                                  const updatedValue = newValue || { currencyId: '', symbol: '', exchangeRate: '' }
                                  field.onChange(updatedValue)
                                  setValue('purchasePriceCurrency', updatedValue, {
                                    shouldValidate: true,
                                    shouldDirty: true
                                  })
                                  setPurchaseCurrency(newValue)
                                }}
                                renderInput={params => (
                                  <CustomTextField {...params} fullWidth label='Purchase Currency' />
                                )}
                              />
                            )
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} md={12} lg={12}>
                    <Typography
                      sx={{
                        fontSize: '14px',
                        fontWeight: '500',
                        mb: '15px'
                      }}
                    >
                      Stock
                    </Typography>
                    <Grid container spacing={{ xs: 3 }}>
                      <Grid item xs={8} sm={8}>
                        <Controller
                          name='lowStockThreshold'
                          control={control}
                          rules={{
                            required: false,
                            pattern: {
                              value: floatPattern,
                              message: floatPatternMsg
                            }
                          }}
                          render={({ field }) => (
                            <CustomTextField
                              {...field}
                              value={field.value === null ? '' : field.value}
                              onChange={e => {
                                let value = e.target.value.replace(/[^0-9.]/g, '')
                                const decimalIndex = value.indexOf('.')
                                if (decimalIndex !== -1 && value.substring(decimalIndex + 1).length > 4) {
                                  value = value.substring(0, decimalIndex + 5)
                                }
                                field.onChange(value === '' ? null : value)
                              }}
                              fullWidth
                              id='lowStockThreshold'
                              label='Low Stock Threshold'
                              variant='outlined'
                              InputProps={{
                                inputProps: {
                                  step: 'any',
                                  inputMode: 'numeric',
                                  pattern: '^[0-9]+(\\.[0-9]{1,4})?$'
                                }
                              }}
                              error={Boolean(errors.purchasePrice)}
                              helperText={
                                errors.purchasePrice?.type === 'required'
                                  ? 'Low Stock Threshold is required'
                                  : errors.purchasePrice?.type === 'pattern'
                                  ? 'Enter a valid integer or float price'
                                  : ''
                              }
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: '500',
                      marginBottom: '10px'
                    }}
                  >
                    Organize
                  </Typography>
                  <Grid container spacing={3} columns={10}>
                    <Grid item xs={10} sm={5} md={12}>
                      <Controller
                        name='manufacturer'
                        control={control}
                        rules={{ required: false }}
                        render={({ field }) => (
                          <CustomAutocomplete
                            freeSolo
                            handleHomeEndKeys
                            options={settings?.manufacturer || []}
                            forcePopupIcon={true}
                            noOptionsText={'Add manufacturer'}
                            value={field.value}
                            onChange={(event, newValue) => {
                              if (typeof newValue === 'string') {
                                field.onChange(newValue)
                              } else if (newValue && newValue.inputValue) {
                                field.onChange(newValue.inputValue)
                              } else {
                                field.onChange(newValue)
                              }
                            }}
                            onKeyDown={event => {
                              if (event.key === 'Enter') {
                                event.preventDefault()
                                const inputValue = event.target.value
                                field.onChange(inputValue)
                              }
                            }}
                            filterOptions={(options, params) => {
                              const filtered = filter(options, params)
                              const { inputValue } = params

                              const isExisting = options.some(option => inputValue === option?.settings?.uom)
                              if (inputValue !== '' && !isExisting) {
                                filtered.push(inputValue)
                              }
                              return filtered
                            }}
                            getOptionLabel={option => {
                              if (typeof option === 'string') {
                                return option
                              }

                              if (option?.inputValue) {
                                return option.inputValue
                              }

                              return option
                            }}
                            renderOption={(props, option) => <li {...props}>{option}</li>}
                            renderInput={params => (
                              <CustomTextField
                                {...params}
                                label='Manufacturer'
                                fullWidth
                                onKeyDown={event => {
                                  if (event.key === 'Enter') {
                                    event.preventDefault()
                                    const inputValue = event.target.value
                                    field.onChange(inputValue)
                                  }
                                }}
                              />
                            )}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={10} sm={5} md={12}>
                      <Controller
                        name='brand'
                        control={control}
                        rules={{ required: false }}
                        render={({ field }) => (
                          <CustomAutocomplete
                            freeSolo
                            handleHomeEndKeys
                            options={settings?.brand || []}
                            forcePopupIcon={true}
                            value={field.value}
                            noOptionsText={'Add brand'}
                            onChange={(event, newValue) => {
                              if (typeof newValue === 'string') {
                                field.onChange(newValue)
                              } else if (newValue && newValue.inputValue) {
                                field.onChange(newValue.inputValue)
                              } else {
                                field.onChange(newValue)
                              }
                            }}
                            onKeyDown={event => {
                              if (event.key === 'Enter') {
                                event.preventDefault()
                                const inputValue = event.target.value
                                field.onChange(inputValue)
                              }
                            }}
                            filterOptions={(options, params) => {
                              const filtered = filter(options, params)
                              const { inputValue } = params

                              const isExisting = options.some(option => inputValue === option?.settings?.brand)
                              if (inputValue !== '' && !isExisting) {
                                filtered.push(inputValue)
                              }
                              return filtered
                            }}
                            getOptionLabel={option => {
                              if (typeof option === 'string') {
                                return option
                              }

                              if (option.inputValue) {
                                return option.inputValue
                              }

                              return option
                            }}
                            renderOption={(props, option) => <li {...props}>{option}</li>}
                            renderInput={params => (
                              <CustomTextField
                                {...params}
                                label='Brand'
                                fullWidth
                                onKeyDown={event => {
                                  if (event.key === 'Enter') {
                                    const { value } = event.target
                                    if (value && !settings?.brand.includes(value)) {
                                      field.onChange(value)
                                    }
                                  }
                                }}
                              />
                            )}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={10} sm={5} md={12}>
                      <Controller
                        name='tags'
                        control={control}
                        rules={{ required: false }}
                        render={({ field }) => (
                          <CustomAutocomplete
                            multiple
                            selectOnFocus
                            clearOnBlur
                            freeSolo
                            handleHomeEndKeys
                            noOptionsText={'Add tag'}
                            options={tags}
                            forcePopupIcon={true}
                            value={field.value}
                            onChange={(event, newValue) => {
                              if (typeof newValue === 'string') {
                                field.onChange(newValue)
                              } else if (newValue && newValue.inputValue) {
                                field.onChange(newValue.inputValue)
                              } else {
                                field.onChange(newValue)
                              }
                            }}
                            filterOptions={(options, params) => {
                              const filtered = filter(options, params)

                              const { inputValue } = params

                              const isExisting = options.some(option => inputValue === option?.tags)
                              if (inputValue !== '' && !isExisting) {
                                filtered.push(inputValue)
                              }
                              return filtered
                            }}
                            getOptionLabel={option => {
                              if (typeof option === 'string') {
                                return option
                              }

                              if (option.inputValue) {
                                return option.inputValue
                              }

                              return option
                            }}
                            renderOption={(props, option) => <li {...props}>{option}</li>}
                            renderInput={params => <CustomTextField {...params} label='tags' fullWidth />}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={10} sm={5} md={12}>
                      <Controller
                        name='productCategory'
                        control={control}
                        rules={{ required: false }}
                        render={({ field }) => (
                          <CustomAutocomplete
                            freeSolo
                            handleHomeEndKeys
                            options={settings?.productCategory || []}
                            forcePopupIcon={true}
                            noOptionsText={'Add Product Category'}
                            value={field.value}
                            onChange={(event, newValue) => {
                              if (typeof newValue === 'string') {
                                field.onChange(newValue)
                              } else if (newValue && newValue.inputValue) {
                                field.onChange(newValue.inputValue)
                              } else {
                                field.onChange(newValue)
                              }
                            }}
                            filterOptions={(options, params) => {
                              const filtered = filter(options, params)
                              const { inputValue } = params

                              const isExisting = options?.some(option => inputValue === option)
                              if (inputValue !== '' && !isExisting) {
                                filtered.push(inputValue)
                              }
                              return filtered
                            }}
                            getOptionLabel={option => {
                              if (typeof option === 'string') {
                                return option
                              }

                              if (option?.inputValue) {
                                return option.inputValue
                              }

                              return option
                            }}
                            renderOption={(props, option) => <li {...props}>{option}</li>}
                            renderInput={params => (
                              <CustomTextField
                                {...params}
                                label='Product Category'
                                fullWidth
                                onKeyDown={event => {
                                  if (event.key === 'Enter') {
                                    const { value } = event.target
                                    if (value && !settings?.productCategory.includes(value)) {
                                      field.onChange(value)
                                    }
                                  }
                                }}
                              />
                            )}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={10} sm={5} md={12}>
                      <Controller
                        name='productClass'
                        control={control}
                        rules={{ required: false }}
                        render={({ field }) => (
                          <CustomAutocomplete
                            handleHomeEndKeys
                            options={settings?.productClass || []}
                            forcePopupIcon={true}
                            freeSolo
                            noOptionsText={'Add Product Class'}
                            value={field.value}
                            onChange={(event, newValue) => {
                              if (typeof newValue === 'string') {
                                field.onChange(newValue)
                              } else if (newValue && newValue.inputValue) {
                                field.onChange(newValue.inputValue)
                              } else {
                                field.onChange(newValue)
                              }
                            }}
                            filterOptions={(options, params) => {
                              const filtered = filter(options, params)
                              const { inputValue } = params

                              const isExisting = options?.some(option => inputValue === option)
                              if (inputValue !== '' && !isExisting) {
                                filtered.push(inputValue)
                              }
                              return filtered
                            }}
                            getOptionLabel={option => {
                              if (typeof option === 'string') {
                                return option
                              }

                              if (option?.inputValue) {
                                return option.inputValue
                              }

                              return option
                            }}
                            renderOption={(props, option) => <li {...props}>{option}</li>}
                            renderInput={params => (
                              <CustomTextField
                                {...params}
                                label='Product Class'
                                fullWidth
                                onKeyDown={event => {
                                  if (event.key === 'Enter') {
                                    const { value } = event.target
                                    if (value && !settings?.productClass.includes(value)) {
                                      field.onChange(value)
                                    }
                                  }
                                }}
                              />
                            )}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
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
              <Button variant='contained' type='submit' onClick={check}>
                Save
              </Button>
              <Button
                variant='outlined'
                component={Link}
                scroll={true}
                href='/inventory/products/'
                onClick={() => reset()}
              >
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
