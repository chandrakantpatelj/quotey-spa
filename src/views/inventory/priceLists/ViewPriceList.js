// ** Next Import
import Link from 'next/link'
import Router from 'next/router'
import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  Grid,
  Card,
  Chip,
  TableContainer,
  LinearProgress
} from '@mui/material'
import moment from 'moment'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import { Close } from '@mui/icons-material'
import Icon from 'src/@core/components/icon'
import PageHeader from 'src/@core/components/page-header'
import { NumericFormat } from 'react-number-format'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import { useDispatch, useSelector } from 'react-redux'
import { useTheme, alpha } from '@mui/material/styles'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { ViewDataList } from 'src/common-components/CommonPdfDesign'
import { hasPermission, toTitleCase } from 'src/common-functions/utils/UtilityFunctions'
import { setActionPriceList } from 'src/store/apps/priceLists'
import { CREATE_PRICE_LIST, EDIT_PRICE_LIST } from 'src/common-functions/utils/Constants'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'

export default function ViewPriceList({ priceListData, loading }) {
  const theme = useTheme()
  const route = Router
  const dispatch = useDispatch()
  const [isListVisible, setIsListVisible] = useState(true)
  const { products = [], customers = [], priceLists = [], currencies = [] } = priceListData

  const selectedPriceList = useSelector(state => state?.priceLists?.selectedPriceList)
  const [tab, setTab] = React.useState('overview')
  const userProfile = useSelector(state => state.userProfile)
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId)

  const getCuurencyObj = id => {
    return currencies?.find(cuurencyObj => cuurencyObj.currencyId === id)
  }
  const toggleListVisibility = () => {
    setIsListVisible(!isListVisible)
  }

  useEffect(() => {
    if (Object.keys(selectedPriceList).length === 0) {
      route.push('/inventory/price-list/')
    }
  }, [selectedPriceList, tenantId])

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
              View Price List - {selectedPriceList?.priceListNo}
            </Typography>
          }
          button={
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {hasPermission(userProfile, CREATE_PRICE_LIST) && (
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
              )}
              {hasPermission(userProfile, EDIT_PRICE_LIST) && (
                <IconButton
                  variant='outlined'
                  sx={{ fontSize: '21px' }}
                  component={Link}
                  scroll={true}
                  href={`/inventory/price-list/edit/${selectedPriceList?.priceListId}`}
                  onClick={() => dispatch(setActionPriceList(selectedPriceList))}
                >
                  <Icon icon='tabler:edit' />
                </IconButton>
              )}
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
            <div>
              <Grid container spacing={{ xs: 5, xl: 10 }}>
                <Grid item xs={12}>
                  <Grid item xs={12} sm={6} md={6} lg={4} xl={4}>
                    <CustomAutocomplete
                      options={priceLists || []}
                      getOptionLabel={option => option?.priceListName || ''}
                      value={priceLists.find(option => option.priceListId === selectedPriceList.priceListId) || null}
                      onChange={(e, newValue) => {
                        dispatch(setActionPriceList(newValue))
                      }}
                      disableClearable
                      renderInput={params => <CustomTextField {...params} fullWidth label='Price Lists' />}
                    />
                  </Grid>
                </Grid>
                <Grid item xs={12} md={8} lg={8} xl={8}>
                  <TabContext value={tab}>
                    <TabList
                      textColor='inherit'
                      allowScrollButtonsMobile={true}
                      scrollButtons={'auto'}
                      onChange={(e, newValue) => setTab(newValue)}
                      aria-label='lab API tabs example'
                      sx={{
                        position: 'sticky',
                        top: '0px',
                        background: '#FFF',
                        zIndex: 9,
                        '& .MuiTabPanel-root': {
                          padding: 2
                        }
                      }}
                    >
                      <Tab label='Overview' value='overview' />
                      <Tab label='Items' value='items-list' />
                    </TabList>
                    <TabPanel
                      value='overview'
                      sx={{
                        p: { xs: '10px 0px !important', md: '15px !important' }
                      }}
                    >
                      {' '}
                      <Card sx={{ p: 6 }}>
                        <Grid item xs={12}>
                          <Table
                            sx={{
                              width: '100%',
                              border: 0,
                              marginBottom: '30px',
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
                                <TableCell colSpan={2}>
                                  <Typography
                                    sx={{
                                      fontSize: '14px',
                                      fontWeight: 500,
                                      lineHeight: '26px',
                                      color: '#4567c6 !important',
                                      textAlign: 'left'
                                    }}
                                  >
                                    #{selectedPriceList?.priceListNo}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ width: '50%' }}>
                                  <Typography
                                    className='data-name'
                                    component={'span'}
                                    sx={{
                                      fontSize: '12px',
                                      fontWeight: 400,
                                      lineHeight: '22px',
                                      textAlign: { xs: 'right', md: 'left' }
                                    }}
                                  >
                                    Status{' '}
                                  </Typography>
                                  {selectedPriceList?.status ? (
                                    <Chip
                                      label={toTitleCase(selectedPriceList?.status)}
                                      variant='filled'
                                      size='small'
                                      sx={{ fontSize: '12px', height: '20px', textTransform: 'capitalize' }}
                                    />
                                  ) : null}
                                </TableCell>
                              </TableRow>

                              <TableRow>
                                <TableCell>
                                  <Typography className='data-name'>
                                    PriceList Name: {selectedPriceList?.priceListName}{' '}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>
                                  <Typography className='data-name'>
                                    Valid From: {moment(selectedPriceList?.validFrom).format('DD MMM YYYY')}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>
                                  <Typography className='data-name'>
                                    Valid Upto: {moment(selectedPriceList?.validUpto).format('DD MMM YYYY')}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </Grid>
                        <Grid item xs={12}>
                          <Grid container spacing={6} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Grid item xs={12} sm={12} md={12} lg={6}>
                              <Typography sx={{ fontSize: '14px', fontWeight: 500, lineHeight: '22px', mb: 2 }}>
                                Customers
                              </Typography>
                              <TableContainer>
                                <Table
                                  size='small'
                                  sx={{
                                    // border: '1px solid #D7D7D7',
                                    '& .MuiTableHead-root': {
                                      textTransform: 'capitalize'
                                    },
                                    '& .MuiTableCell-root': {
                                      borderBottom: '1px dashed #D8D8D8'
                                    }
                                  }}
                                >
                                  <TableHead sx={{ bgcolor: 'rgba(248, 250, 254, 1)' }}>
                                    <TableRow>
                                      <TableCell style={{ width: '10%' }}>#</TableCell>
                                      <TableCell style={{ width: '45%' }}>Customers</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {selectedPriceList?.customers?.length > 0 ? (
                                      selectedPriceList?.customers?.map((item, index) => {
                                        const customer =
                                          customers.find(val => {
                                            if (val?.customerId === item?.customerId) {
                                              return item
                                            }
                                          }) || {}

                                        return (
                                          <TableRow key={index}>
                                            <TableCell align='left'>{index + 1}</TableCell>
                                            <TableCell align='left'>{customer?.customerName}</TableCell>
                                          </TableRow>
                                        )
                                      })
                                    ) : (
                                      <TableRow>
                                        {' '}
                                        <TableCell colSpan={3}>
                                          {' '}
                                          <Box
                                            sx={{
                                              width: '100%',
                                              height: '100%',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              p: '15px 10px'
                                            }}
                                          >
                                            <Typography variant='p' align='center' display='block'>
                                              No data
                                            </Typography>
                                          </Box>
                                        </TableCell>
                                      </TableRow>
                                    )}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Card>
                    </TabPanel>
                    <TabPanel
                      value='items-list'
                      sx={{
                        p: { xs: '10px 0px !important', md: '15px !important' }
                      }}
                    >
                      <TableContainer>
                        <Table
                          stickyHeader={true}
                          sx={{
                            minWidth: 700,
                            width: '100%',

                            '& .MuiTableHead-root': {
                              background: '#F4F6F8'
                            },
                            '& .MuiTableCell-root': {
                              padding: '19px 10px',
                              borderBottom: '1px dashed #EBEBEB',
                              textAlign: 'right'
                            },

                            '& .MuiTableCell-head': {
                              textTransform: 'capitalize',
                              fontWeight: 500,
                              color: '#667380'
                            },
                            '& .MuiTableCell-footer': {
                              padding: '8px 10px !important'
                            },
                            '& .MuiTableCell-root:nth-of-type(1),& .MuiTableCell-root:nth-of-type(2),& .MuiTableCell-root:nth-of-type(3)':
                              {
                                textAlign: 'left'
                              }
                          }}
                        >
                          <TableHead>
                            <TableRow>
                              <TableCell>#</TableCell>
                              <TableCell>Item</TableCell>
                              <TableCell>uom</TableCell>
                              <TableCell>sellingPrice </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedPriceList?.itemList?.length > 0 ? (
                              selectedPriceList?.itemList?.map((item, index) => {
                                const product =
                                  products.find(val => {
                                    if (val?.itemId === item?.itemId) {
                                      return item
                                    }
                                  }) || {}
                                let itemCurrency = getCuurencyObj(item?.sellingPriceCurrency)
                                return (
                                  <TableRow key={index}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{product?.itemName}</TableCell>
                                    <TableCell align='left'>{item?.uom}</TableCell>
                                    <TableCell>
                                      <NumericFormat
                                        value={item?.sellingPrice.toFixed(2)}
                                        thousandSeparator=','
                                        displayType={'text'}
                                        prefix={
                                          itemCurrency?.displayAlignment === 'left'
                                            ? `${itemCurrency?.symbol}${' '}`
                                            : ''
                                        }
                                        suffix={
                                          itemCurrency?.displayAlignment === 'right'
                                            ? `${' '}${itemCurrency?.symbol}`
                                            : ''
                                        }
                                      />
                                    </TableCell>
                                  </TableRow>
                                )
                              })
                            ) : (
                              <TableRow>
                                {' '}
                                <TableCell colSpan={3}>
                                  {' '}
                                  <Box
                                    sx={{
                                      width: '100%',
                                      height: '100%',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      p: '15px 10px'
                                    }}
                                  >
                                    <Typography variant='p' align='center' display='block'>
                                      No data
                                    </Typography>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </TabPanel>
                  </TabContext>
                </Grid>
              </Grid>
            </div>
          )}
        </PageWrapper>
      </React.Fragment>
    </div>
  )
}
