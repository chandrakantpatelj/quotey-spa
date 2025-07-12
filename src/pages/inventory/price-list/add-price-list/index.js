import Link from 'next/link'
import Router from 'next/router'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useForm, Controller } from 'react-hook-form'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import {
  Typography,
  Button,
  IconButton,
  Grid,
  Box,
  FormHelperText,
  Tab,
  Snackbar,
  Alert,
  Backdrop,
  CircularProgress,
  LinearProgress
} from '@mui/material'
import { TabContext, TabList, TabPanel } from '@mui/lab'
import CustomDatePicker from 'src/views/forms/form-elements/pickers/CustomDatePicker'
import CustomTextField from 'src/@core/components/mui/text-field'
import { fetchData, writeData } from 'src/common-functions/GraphqlOperations'
import { createAlert } from 'src/store/apps/alerts'
import { Close } from '@mui/icons-material'
import CustomersTable from 'src/views/inventory/priceLists/CustomersTable'
import ItemsTableList from 'src/views/inventory/priceLists/ItemsListTable'
import { createPriceListMutation, newPriceListQuery } from 'src/@core/components/graphql/priceList-queries'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import { checkAuthorizedRoute } from 'src/common-functions/utils/UtilityFunctions'
import { CREATE_PRICE_LIST } from 'src/common-functions/utils/Constants'
import useCustomers from 'src/hooks/getData/useCustomers'
import useProducts from 'src/hooks/getData/useProducts'

function AddPriceList() {
  const router = Router
  const dispatch = useDispatch()
  const [loader, setLoader] = React.useState(false)
  const tenant = useSelector(state => state.tenants?.selectedTenant) || {}
  const { tenantId = '' } = tenant || {}
  const { customers } = useCustomers(tenantId)
  const [status, setStatus] = useState('')
  const userProfile = useSelector(state => state.userProfile)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const { products, productsLoading, fetchProducts } = useProducts(tenantId)

  useEffect(() => {
    const loadProducts = async () => {
      await fetchProducts()
    }

    loadProducts()
  }, [tenantId, fetchProducts])

  const defaultData = {
    schemaVersion: '1.0',
    priceListName: '',
    validFrom: new Date(),
    validUpto: new Date(),
    status: '',
    customers: [
      {
        customerId: ''
      }
    ],
    itemList: [
      {
        itemId: '',
        uom: '',
        sellingPrice: 0,
        sellingPriceTaxInclusive: '',
        sellingPriceCurrency: ''
      }
    ]
  }
  const {
    reset,
    control,
    getValues,
    setValue,
    trigger,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: defaultData,
    mode: 'onChange'
  })
  const [tab, setTab] = React.useState('overview')

  const [open, setOpen] = useState(false)

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }

    setOpen(false)
  }
  const handleCancel = () => {
    reset()
    router.push('/inventory/price-list/')
  }
  const check = status => {
    setStatus(status)
    setOpen(true)
    const fieldName = Object.keys(errors)[0]
    const errName = document.getElementById(fieldName)
    errName?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
  }

  const handleNewPriceListSave = async newpricelist => {
    setOpen(false)
    setLoader(true)
    const priceList = {
      ...newpricelist,
      validFrom: newpricelist?.validFrom
        ?.toLocaleString('en-us', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
        .replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$1-$2'),

      validUpto: newpricelist?.validUpto
        ?.toLocaleString('en-us', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
        .replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$1-$2'),
      customers: newpricelist?.customers?.map(item => {
        return {
          customerId: item?.customerId?.customerId
        }
      }),

      itemList: newpricelist?.itemList?.map(item => {
        return {
          itemId: item?.itemId,
          uom: item?.uom,
          sellingPrice: item?.sellingPrice,
          sellingPriceTaxInclusive: item?.sellingPriceTaxInclusive,
          sellingPriceCurrency: item?.sellingPriceCurrency
        }
      })
    }
    try {
      const response = await writeData(createPriceListMutation(), { tenantId, priceList })
      if (response.createPriceList) {
        dispatch(createAlert({ message: 'PriceList created successfully !', type: 'success' }))
        router.push('/inventory/price-list/')
      } else {
        dispatch(createAlert({ message: 'PriceList creation failed  !', type: 'error' }))
      }
    } catch (error) {
      // Handle any errors and optionally dispatch an error action
      console.log('error', error)
      setLoader(false)
      reset(priceList)
    }
  }

  useEffect(() => {
    if (checkAuthorizedRoute(CREATE_PRICE_LIST, router, userProfile)) {
      setIsAuthorized(true)
    } else {
      setIsAuthorized(false)
    }
  }, [tenantId, userProfile])

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
            Add Price List
          </Typography>
        }
        button={
          <IconButton
            variant='outlined'
            color='default'
            sx={{ fontSize: '21px' }}
            component={Link}
            scroll={true}
            href={`/inventory/price-list/`}
          >
            <Close sx={{ color: theme => theme.palette.primary.main }} />
          </IconButton>
        }
      />
      <PageWrapper>
        {productsLoading ? (
          <LinearProgress />
        ) : (
          <form onSubmit={handleSubmit(handleNewPriceListSave)}>
            <TabContext value={tab}>
              <TabList
                textColor='inherit'
                onChange={(e, newValue) => {
                  setTab(newValue)
                }}
                aria-label='lab API tabs example'
                sx={{
                  '& .MuiTab-root': {
                    padding: '4px 14px!important'
                  }
                }}
              >
                <Tab label='Overview' value='overview' />
                <Tab label='Items List' value='item-list' />
              </TabList>

              <TabPanel
                value='overview'
                sx={{
                  p: { xs: '10px !important', md: '30px 15px !important' }
                }}
              >
                <Grid container spacing={{ xs: 4, md: 8 }}>
                  <Grid item xs={12} md={10}>
                    <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                      <Grid item xs={12} sm={6} lg={3}>
                        <Controller
                          name='priceListName'
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <CustomTextField
                              {...field}
                              id='priceListName'
                              fullWidth
                              label='PriceList Name'
                              error={Boolean(errors.priceListName)}
                              {...(errors.priceListName && { helperText: 'priceList Name is required' })}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                      <Grid item xs={6} sm={6} md={3}>
                        <Controller
                          name='validFrom'
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <CustomDatePicker
                              //disabled={true}
                              label={'valid From '}
                              fullWidth={true}
                              date={field.value}
                              onChange={field.onChange}
                              error={Boolean(errors?.orderDate)}
                            />
                          )}
                        />
                        {errors?.validFrom && <FormHelperText error>valid From Date is required</FormHelperText>}
                      </Grid>
                      <Grid item xs={6} sm={6} md={3}>
                        <Controller
                          name='validUpto'
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <CustomDatePicker
                              label={'Valid Upto'}
                              fullWidth={true}
                              disabled={false}
                              date={field.value}
                              onChange={field.onChange}
                              error={Boolean(errors?.validUpto)}
                            />
                          )}
                        />
                        {errors?.validUpto && <FormHelperText error>valid Upto Date is required</FormHelperText>}
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} md={12}>
                    <Grid container>
                      <Grid item xs={12} md={4}>
                        <CustomersTable control={control} errors={errors} customers={customers} />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </TabPanel>
              <TabPanel
                value='item-list'
                sx={{
                  p: { xs: '10px !important', md: '30px 15px  !important' }
                }}
              >
                <Grid container spacing={{ xs: 4, md: 8 }}>
                  <Grid item xs={12} lg={10}>
                    <ItemsTableList
                      products={products}
                      control={control}
                      errors={errors}
                      trigger={trigger}
                      setValue={setValue}
                      getValues={getValues}
                    />{' '}
                  </Grid>
                </Grid>
              </TabPanel>
            </TabContext>

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: { xs: 'center', sm: 'start' },
                gap: { xs: '10px', md: '20px' },
                marginTop: { xs: '20px', sm: '30px' }
              }}
            >
              <Button variant='contained' type='submit' onClick={() => check('active')}>
                Save
              </Button>

              <Button variant='outlined' onClick={() => handleCancel()}>
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
        <Alert onClose={handleClose} severity='error' variant='filled'>
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

export default AddPriceList
