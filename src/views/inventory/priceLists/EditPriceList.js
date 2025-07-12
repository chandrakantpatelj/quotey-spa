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
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import CustomDatePicker from 'src/views/forms/form-elements/pickers/CustomDatePicker'
import CustomTextField from 'src/@core/components/mui/text-field'
import { fetchData, writeData } from 'src/common-functions/GraphqlOperations'
import { createAlert } from 'src/store/apps/alerts'
import { Close } from '@mui/icons-material'
import CustomersTable from 'src/views/inventory/priceLists/CustomersTable'
import ItemsTableList from 'src/views/inventory/priceLists/ItemsListTable'
import { updatePriceListMutation } from 'src/@core/components/graphql/priceList-queries'

function EditPriceList({ priceListData, loading }) {
  const router = Router
  const tenant = useSelector(state => state.tenants?.selectedTenant) || {}
  const { tenantId = '' } = tenant || {}
  const dispatch = useDispatch()
  const selectedPriceList = useSelector(state => state?.priceLists?.selectedPriceList)
  const { products = [], customers = [] } = priceListData
  const [loader, setLoader] = React.useState(false)
  const {
    reset,
    control,
    getValues,
    setValue,
    trigger,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: selectedPriceList,
    mode: 'onChange'
  })

  useEffect(() => {
    if (Object.keys(selectedPriceList).length === 0) {
      router.push('/inventory/price-list/')
    }
  }, [selectedPriceList, tenantId])

  useEffect(() => {
    selectedPriceList?.customers?.forEach((item, index) => {
      customers.forEach((val, i) => {
        if (val?.customerId === item.customerId) {
          setValue(`customers[${index}].customerId`, val)
        }
      })
    })
    selectedPriceList?.itemList?.forEach((item, index) => {
      products.forEach((val, i) => {
        if (val?.itemId === item.itemId) {
          setValue(`itemList[${index}].itemId`, val?.itemId)
          setValue(`itemList[${index}].itemName`, val?.itemName)
        }
      })
    })
  }, [tenantId, selectedPriceList, customers, products])

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

  const handleEditPriceListSave = async editpricelist => {
    setOpen(false)
    setLoader(true)
    const payload = editpricelist
    delete payload.priceListId
    delete payload.tenantId
    delete payload.priceListNo
    delete payload.createdDateTime

    const priceList1 = {
      ...payload,
      customers: editpricelist?.customers?.map(item => {
        return {
          customerId: item?.customerId?.customerId
        }
      }),
      validFrom: editpricelist?.validFrom
        ?.toLocaleString('en-us', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
        .replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$1-$2'),

      validUpto: editpricelist?.validUpto
        ?.toLocaleString('en-us', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
        .replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$1-$2'),
      itemList: editpricelist?.itemList?.map(item => {
        return {
          itemId: item?.itemId,
          uom: item?.uom,
          sellingPrice: item?.sellingPrice,
          sellingPriceTaxInclusive: item?.sellingPriceTaxInclusive,
          sellingPriceCurrency: item?.sellingPriceCurrency
        }
      })
    }

    const priceList = priceList1
    const priceListId = selectedPriceList?.priceListId
    try {
      const response = await writeData(updatePriceListMutation(), { tenantId, priceListId, priceList })
      if (response.updatePriceList) {
        dispatch(createAlert({ message: 'PriceList Updated  successfully !', type: 'success' }))
        router.push('/inventory/price-list/')
      } else {
        setLoader(false)
        dispatch(createAlert({ message: 'PriceList Updation  failed !', type: 'error' }))
      }
    } catch (error) {
      // Handle any errors and optionally dispatch an error action
      setLoader(false)
      dispatch(createAlert({ message: 'PriceList Updation  failed !', type: 'error' }))
    }
  }

  return (
    <div>
      <React.Fragment>
        <PageHeader
          title={
            <Typography
              sx={{
                fontSize: { xs: '16px', md: '18px' },
                fontWeight: '500'
              }}
            >
              {`Edit PriceList - ${selectedPriceList?.priceListNo}`}
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
                href={`/inventory/price-list/add-price-list`}
              >
                Add New
              </Button>
              <IconButton
                variant='outlined'
                color='default'
                sx={{ fontSize: '21px' }}
                component={Link}
                scroll={true}
                href='/inventory/price-list/'
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
            <form onSubmit={handleSubmit(handleEditPriceListSave)}>
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
                                label={'valid From '}
                                fullWidth={true}
                                disabled={false}
                                date={field.value ? new Date(field.value) : new Date()}
                                onChange={field.onChange}
                                error={Boolean(errors?.validFrom)}
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
                                date={field.value ? new Date(field.value) : new Date()}
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
                <Button variant='contained' type='submit'>
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
    </div>
  )
}

export default EditPriceList
