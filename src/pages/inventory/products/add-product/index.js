// add use client for ck editor
'use client' // only in App Router
import Link from 'next/link'
import Router from 'next/router'
import React, { useEffect, useState } from 'react'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import {
  Box,
  Button,
  Typography,
  Grid,
  MenuItem,
  IconButton,
  Divider,
  LinearProgress,
  InputAdornment,
  Snackbar,
  Alert,
  Backdrop,
  CircularProgress
} from '@mui/material'
import Checkbox from '@mui/material/Checkbox'
import Switch from '@mui/material/Switch'
import CustomTextField from 'src/@core/components/mui/text-field'
import { tags } from 'src/@fake-db/autocomplete'
import { createFilterOptions } from '@mui/material/Autocomplete'
import { Close } from '@mui/icons-material'
import { useSelector, useDispatch } from 'react-redux'
import {
  checkAuthorizedRoute,
  convertCurrency,
  floatPattern,
  floatPatternMsg,
  removeNullFields,
  safeNumber
} from 'src/common-functions/utils/UtilityFunctions'
import { useForm, Controller } from 'react-hook-form'
import { fetchData, writeData } from 'src/common-functions/GraphqlOperations'
import { createItemMutation, newProductQuery } from 'src/@core/components/graphql/item-queries'
import { createAlert } from 'src/store/apps/alerts'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import SaveOtherSetting from 'src/views/forms/form-elements/custom-inputs/SaveOtherSetting'
import ProductMultipleUploader from 'src/views/inventory/product/ProductMultipleUploader'
import { UploadMultipleFileS3Api } from 'src/views/forms/form-elements/custom-inputs/UploadMultipleFileS3Api'
import EnableDiamensionTable from 'src/@core/components/common-components/EnableDiamensionTable'
import PackingUnitsTable from 'src/@core/components/common-components/PackingUnitsTable'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import { CREATE_ITEM } from 'src/common-functions/utils/Constants'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import { setAddProduct } from 'src/store/apps/products'
import useOtherSettings from 'src/hooks/getData/useOtherSettings'

function Product() {
  const router = Router
  const userProfile = useSelector(state => state.userProfile)

  const [isAuthorized, setIsAuthorized] = useState(false)
  const dispatch = useDispatch()
  const filter = createFilterOptions()
  const tenant = useSelector(state => state.tenants?.selectedTenant)
  const { tenantId } = tenant || {}
  const defaultCurrency = useSelector(state => state?.currencies?.selectedCurrency)
  const { currencies } = useCurrencies()
  const [sellingCurrency, setSellingCurrency] = useState()
  const [costCurrency, setCostCurrency] = useState()
  const [purchaseCurrency, setPurchaseCurrency] = useState()
  const [otherSettings, setOtherSettings] = useState({})
  const [selectedImages, setSelectedImages] = useState([])
  const [loader, setLoader] = React.useState(false)
  const { fetchOtherSettings, loadingOtherSetting } = useOtherSettings(tenantId)

  async function getProducts() {
    const otherSettings = await fetchOtherSettings()

    setOtherSettings(otherSettings)
  }

  useEffect(() => {
    getProducts()
  }, [tenantId])

  const [itemData, setItemData] = useState({
    schemaVersion: '1.0',
    itemName: '',
    itemGroup: 'product',
    itemDescription: '',
    //packedUnit: 1,
    uom: '',
    sellingPrice: null,
    enablePackingUnit: false,
    enableDimension: false,
    sellingPriceCurrency: '',
    sellingPriceTaxInclusive: true,
    status: '',
    costPrice: null,
    costPriceCurrency: '',
    costPriceMethod: '',
    purchasePrice: null,
    purchasePriceCurrency: '',
    manufacturer: '',
    brand: '',
    vendor: '',
    productClass: '',
    productCategory: '',
    lowStockThreshold: 0,
    tags: [],
    packingUnits: [
      {
        unit: '',
        description: '',
        qtyPerUnit: 1
      }
    ],
    dimensions: {
      length: {
        defaultValue: 1,
        minimumValue: 1
      },
      width: {
        defaultValue: 1,
        minimumValue: 1
      },
      height: {
        defaultValue: 1,
        minimumValue: 1
      }
    },
    images: []
  })

  const {
    reset,
    control,
    handleSubmit,
    setValue,
    trigger,
    getValues,
    watch,
    formState: { errors }
  } = useForm({
    mode: 'onChange'
  })
  const isTaxInclusive = watch('sellingPriceTaxInclusive')
  useEffect(() => {
    reset({ ...itemData, sellingPriceCurrency: defaultCurrency, costPriceCurrency: defaultCurrency })
  }, [tenant, itemData, defaultCurrency])

  useEffect(() => {
    setValue('sellingPriceCurrency', currencies?.find(item => item?.currencyId === defaultCurrency?.currencyId) || '')
    setValue('purchasePriceCurrency', currencies?.find(item => item?.currencyId === defaultCurrency?.currencyId) || '')
    setValue('costPriceCurrency', currencies?.find(item => item?.currencyId === defaultCurrency?.currencyId) || '')
    setSellingCurrency(currencies?.find(item => item?.currencyId === defaultCurrency?.currencyId) || '')
    setPurchaseCurrency(currencies?.find(item => item?.currencyId === defaultCurrency?.currencyId) || '')
    setCostCurrency(currencies?.find(item => item?.currencyId === defaultCurrency?.currencyId) || '')
  }, [tenant, defaultCurrency, currencies])

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
  const handleNewItemSave = async newItem => {
    setOpen(false)
    setLoader(true)
    if (newItem?.enableDimension === false || newItem?.enableDimension === null) {
      newItem.dimensions = null
    } else {
      removeNullFields(newItem.dimensions)
    }
    const tenantId = tenant?.tenantId

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

    delete item.height
    delete item.length
    delete item.width
    SaveOtherSetting(otherSettings, tenantId, newItem, dispatch)
    delete item.variants
    try {
      const response = await writeData(createItemMutation(), { tenantId, item })
      if (response.createItem) {
        if (selectedImages || selectedImages?.length !== 0 || selectedImages[0]) {
          await UploadMultipleFileS3Api(selectedImages, dispatch)
        }
        dispatch(setAddProduct(response.createItem))
        dispatch(createAlert({ message: 'Product created successfully !', type: 'success' }))
        router.push(`/inventory/products/`)
      } else {
        setLoader(false)
        dispatch(createAlert({ message: 'Product creation failed !', type: 'error' }))
      }
      return response
    } catch (error) {
      setLoader(false)
    }
  }

  const handleCancel = () => {
    router.push('/inventory/products/')
  }

  useEffect(() => {
    if (checkAuthorizedRoute(CREATE_ITEM, router, userProfile)) {
      setIsAuthorized(true)
    } else {
      setIsAuthorized(false)
    }
  }, [userProfile])

  if (!isAuthorized) {
    return null
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
            Add Product
          </Typography>
        }
        button={
          <IconButton
            variant='outlined'
            color='default'
            sx={{ fontSize: '21px' }}
            component={Link}
            scroll={true}
            href={`/inventory/products/`}
          >
            <Close sx={{ color: theme => theme.palette.primary.main }} />
          </IconButton>
        }
      />
      <PageWrapper>
        {loadingOtherSetting ? (
          <LinearProgress />
        ) : (
          <>
            <form onSubmit={handleSubmit(handleNewItemSave)}>
              <Grid container columnSpacing={{ xs: 8, md: 10, xl: 14 }} rowSpacing={{ xs: 8, md: 10, lg: 5 }}>
                <Grid item xs={12} md={8.5} xl={8}>
                  <Grid container spacing={{ xs: 12, md: 12, lg: 5 }}>
                    <Grid item xs={12} sm={12} lg={4} xl={3.5}>
                      <Box component='div'>
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
                                options={otherSettings?.uom || []}
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
                                        if (value && !otherSettings?.uom.includes(value)) {
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
                                  value={value}
                                  onChange={onChange}
                                  fullWidth
                                  minRows={6}
                                  multiline
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
                      <Grid container spacing={3} sx={{ marginBottom: '25px' }}>
                        <Grid item xs={12} sm={12} xl={7.5} id='packingUnits'>
                          <PackingUnitsTable selectedItem={itemData} control={control} errors={errors} />
                        </Grid>

                        <Grid item xs={12} sm={12} xl={4.5}>
                          <EnableDiamensionTable selectedItem={itemData} setValue={setValue} control={control} />
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
                          mb: '15px'
                        }}
                      >
                        Selling Information
                      </Typography>{' '}
                      <Grid container spacing={{ xs: 3 }}>
                        <Grid item xs={4} sm={4.5} md={6} xl={4.5}>
                          <Controller
                            name='sellingPrice'
                            control={control}
                            rules={{
                              required: false,
                              pattern: {
                                value: /^[0-9]+(\.[0-9]{1,4})?$/,
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
                                  ? { helperText: 'Enter a valid price with up to 4 decimal places' }
                                  : {})}
                              />
                            )}
                          />
                        </Grid>

                        <Grid item xs={3.5} sm={3} md={6} xl={3}>
                          <Controller
                            name='sellingPriceCurrency'
                            control={control}
                            rules={{ required: false }}
                            render={({ field }) => (
                              <CustomAutocomplete
                                {...field}
                                options={currencies}
                                defaultValue={defaultCurrency}
                                disableClearable
                                fullWidth
                                openOnFocus={true}
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
                                  let sp = getValues('sellingPrice')
                                  console.log('sellingCurrency', sellingCurrency)
                                  if (
                                    sellingCurrency?.currencyId !== newValue.currencyId &&
                                    getValues('sellingPrice')
                                  ) {
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
                                  field.onChange(newValue)
                                  setSellingCurrency(newValue)
                                }}
                                renderInput={params => (
                                  <CustomTextField {...params} fullWidth label='Selling Currency' />
                                )}
                              />
                            )}
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
                            rules={{ required: false }}
                            render={({ field }) => (
                              <CustomAutocomplete
                                {...field}
                                options={currencies}
                                defaultValue={defaultCurrency}
                                disableClearable
                                fullWidth
                                openOnFocus={true}
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
                                  let cp = getValues('costPrice')
                                  if (costCurrency?.currencyId !== newValue.currencyId && getValues('costPrice')) {
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
                                  field.onChange(newValue)
                                  setCostCurrency(newValue)
                                }}
                                renderInput={params => <CustomTextField {...params} fullWidth label='Cost Currency' />}
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
                          <Controller
                            name='sellingPriceTaxInclusive'
                            control={control}
                            render={({ field }) => (
                              <Checkbox sx={{ p: '4px' }} defaultChecked={field.value} {...field} />
                            )}
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
                          mb: '15px'
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
                            rules={{ required: false }}
                            render={({ field }) => (
                              <CustomAutocomplete
                                {...field}
                                options={currencies}
                                defaultValue={defaultCurrency}
                                disableClearable
                                fullWidth
                                openOnFocus={true}
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
                                  let cp = getValues('purchasePrice')
                                  if (
                                    purchaseCurrency?.currencyId !== newValue.currencyId &&
                                    getValues('purchasePrice')
                                  ) {
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
                                  field.onChange(newValue)
                                  setPurchaseCurrency(newValue)
                                }}
                                renderInput={params => (
                                  <CustomTextField {...params} fullWidth label='Purchase Currency' />
                                )}
                              />
                            )}
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
                        marginBottom: '15px'
                      }}
                    >
                      Organize
                    </Typography>
                    <Grid container direction={{ xs: 'column', sm: 'row', lg: 'column' }} spacing={3} columns={10}>
                      <Grid item xs={10} sm={5} md={12}>
                        <Controller
                          name='manufacturer'
                          control={control}
                          rules={{ required: false }}
                          render={({ field }) => (
                            <CustomAutocomplete
                              freeSolo
                              handleHomeEndKeys
                              options={otherSettings?.manufacturer || []}
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

                                const isExisting = options.some(option => inputValue === option?.otherSettings?.uom)
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
                              options={otherSettings?.brand || []}
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

                                const isExisting = options.some(option => inputValue === option?.otherSettings?.brand)
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
                                      if (value && !otherSettings?.brand.includes(value)) {
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
                              options={otherSettings?.productCategory || []}
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
                                      if (value && !otherSettings?.productCategory.includes(value)) {
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
                              options={otherSettings?.productClass || []}
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
                                      if (value && !otherSettings?.productClass.includes(value)) {
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
                  marginTop: { xs: '20px', sm: '30px' }
                }}
              >
                <Button variant='contained' type='submit' onClick={check}>
                  Save
                </Button>
                <Button variant='outlined' onClick={() => handleCancel()}>
                  Cancel
                </Button>
              </Box>
            </form>
          </>
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
    </ErrorBoundary>
  )
}

export default Product
