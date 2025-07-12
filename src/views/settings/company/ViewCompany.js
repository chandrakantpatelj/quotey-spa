import Link from 'next/link'
import Router from 'next/router'

import React, { useState } from 'react'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import {
  Box,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Card,
  TableContainer,
  Typography,
  Grid,
  LinearProgress
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import { Close } from '@mui/icons-material'
import { setActionSelectedTenant } from 'src/store/apps/company'
import { useDispatch, useSelector } from 'react-redux'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { formatPhoneNumberIntl } from 'react-phone-number-input'
import { useTheme, alpha } from '@mui/material/styles'
import { ViewDataList } from 'src/common-components/CommonPdfDesign'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import SingleLogoBox from 'src/common-components/SingleLogoBox'
import { hasPermission } from 'src/common-functions/utils/UtilityFunctions'
import { CREATE_TENANT, EDIT_TENANT } from 'src/common-functions/utils/Constants'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'

export default function ViewCompany({ tenantsObject, loading }) {
  const theme = useTheme()
  const route = Router
  const dispatch = useDispatch()
  const [isListVisible, setIsListVisible] = useState(true)
  const { tradings = [], tenants = [] } = tenantsObject
  const tenant = useSelector(state => state.tenants?.actionSelectedTenant) || {}
  const { currencies } = useCurrencies()
  const userProfile = useSelector(state => state.userProfile)

  const toggleListVisibility = () => {
    setIsListVisible(!isListVisible)
  }

  const currency = currencies.find(item => item?.currencyId === tenant?.currencyId) || {}
  const trading = tradings.find(item => item?.tradingId === tenant?.tradingId) || {}

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
            View Company - {tenant?.tenantNo}
          </Typography>
        }
        button={
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            {hasPermission(userProfile, CREATE_TENANT) && (
              <Button
                variant='contained'
                color='primary'
                sx={{ display: { xs: 'none', sm: 'flex' } }}
                startIcon={<AddOutlinedIcon />}
                component={Link}
                scroll={true}
                href={`/account-settings/company/add-company`}
              >
                Add New
              </Button>
            )}
            {hasPermission(userProfile, EDIT_TENANT) && (
              <IconButton
                variant='outlined'
                sx={{ fontSize: '21px' }}
                component={Link}
                scroll={true}
                href={`/account-settings/company/edit/${tenant?.tenantId}`}
                onClick={() => dispatch(setActionSelectedTenant(tenant))}
              >
                {' '}
                <Icon icon='tabler:edit' />
              </IconButton>
            )}
            <IconButton
              variant='outlined'
              color='default'
              sx={{ fontSize: '21px' }}
              component={Link}
              scroll={true}
              href='/account-settings/company/'
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
                    options={tenants || []}
                    getOptionLabel={option => option?.displayName || ''}
                    value={tenants.find(option => option.tenantId === tenant.tenantId) || null}
                    onChange={(e, newValue) => {
                      dispatch(setActionSelectedTenant(newValue))
                    }}
                    disableClearable
                    renderInput={params => <CustomTextField {...params} fullWidth label='Companies' />}
                  />
                </Grid>
              </Grid>
              <Grid item xs={12} md={8} lg={8} xl={8}>
                {/* <TabContext value={tab}>
                <TabList
                  textColor='inherit'
                  allowScrollButtonsMobile={true}
                  scrollButtons={'auto'}
                  onChange={(e, newValue) => {
                    setTab(newValue)
                  }}
                  aria-label='lab API tabs example'
                > */}
                {/* <Tab label='Overview' value='overview' /> */}
                {/* {tenant?.tradingId !== '' && tenant?.tradingId !== null ? (
                    <Tab label='Trading Profile' value='trading-profile' />
                  ) : null} */}
                {/* </TabList> */}
                {/* <TabPanel
                  value='overview'
                  sx={{
                    p: { xs: '10px  !important', md: '15px !important' }
                  }}
                > */}
                <Card sx={{ p: 6 }}>
                  <Grid container spacing={6}>
                    <Grid item xs={12}>
                      <Grid
                        container
                        spacing={6}
                        sx={{
                          display: 'flex',
                          flexDirection: { xs: 'column-reverse', sm: 'row' },
                          justifyContent: 'space-between'
                        }}
                      >
                        <Grid item xs={12} sm={6} md={6} lg={5.5} xl={5}>
                          <Table
                            sx={{
                              width: '100%',
                              border: 0,
                              '& .MuiTableCell-root': {
                                border: 0,
                                padding: '0px !important',
                                verticalAlign: 'top',
                                width: '50%'
                              },
                              '& .MuiTableCell-root .data-name': {
                                fontSize: '13px',
                                color: '#818181',
                                lineHeight: '23px'
                              },
                              '& .MuiTableCell-root .data-value': {
                                fontSize: '13px',
                                fontWeight: 500,
                                color: '#000',
                                lineHeight: '23px'
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
                                    #{tenant?.tenantNo}
                                  </Typography>
                                </TableCell>
                              </TableRow>

                              <TableRow>
                                <TableCell>
                                  <Typography className='data-name'>Company Name: {tenant?.displayName}</Typography>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>
                                  <Typography className='data-name'>Business Name: {tenant?.businessName} </Typography>
                                </TableCell>
                              </TableRow>
                              {tenant?.tradingId ? (
                                <TableRow>
                                  <TableCell>
                                    <Typography className='data-name'>
                                      Trading Name: {trading?.tradingName || ' - '}{' '}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              ) : null}
                            </TableBody>
                          </Table>
                        </Grid>
                        <Grid item xs={12} sm={6} md={6} lg={5.5} xl={5}>
                          <SingleLogoBox data={tenant} />
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      {' '}
                      <Typography
                        sx={{
                          fontSize: '14px',
                          fontWeight: 500,
                          lineHeight: '22px',
                          mb: 2
                        }}
                      >
                        Primary Contact
                      </Typography>
                      <Table
                        sx={{
                          width: '100%',
                          border: 0,
                          '& .MuiTableCell-root': {
                            width: '50%',
                            border: 0,
                            verticalAlign: 'top !important',
                            padding: '0px !important'
                          },
                          '& .MuiTableCell-root .data-name': {
                            fontSize: '13px',
                            color: '#818181',
                            lineHeight: '23px'
                          },
                          '& .MuiTableCell-root .data-value': {
                            fontSize: '13px',
                            fontWeight: 500,
                            color: '#000',
                            lineHeight: '23px'
                          }
                        }}
                      >
                        <TableBody>
                          <TableRow>
                            <TableCell>
                              <Typography className='data-name'>
                                {tenant?.primaryContact?.firstName} {tenant?.primaryContact?.lastName}
                              </Typography>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <Typography className='data-name' sx={{ display: 'flex', gap: 1 }}>
                                mail:{' '}
                                <a
                                  href='mailto:emailAddress'
                                  style={{ color: 'inherit', textDecoration: 'none', wordBreak: 'break-all' }}
                                >
                                  {' '}
                                  {tenant?.emailAddress}
                                </a>{' '}
                              </Typography>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <Typography className='data-name'>
                                mobile: {formatPhoneNumberIntl(`+${tenant?.mobile}`)}{' '}
                              </Typography>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <Typography className='data-name'>
                                work phone: {formatPhoneNumberIntl(`+${tenant?.workPhone}`)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </Grid>
                    <Grid item xs={12}>
                      <Grid container spacing={6} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Grid item xs={12} sm={6} md={6} lg={5.5} xl={5}>
                          {' '}
                          <Typography
                            sx={{
                              fontSize: '14px',
                              fontWeight: 500,
                              lineHeight: '22px',
                              mb: 2
                            }}
                          >
                            Billing Address
                          </Typography>
                          <Table
                            sx={{
                              width: '100%',
                              border: 0,
                              '& .MuiTableCell-root': {
                                width: '50%',
                                border: 0,
                                verticalAlign: 'top !important',
                                padding: '0px !important'
                              },
                              '& .MuiTableCell-root .data-name': {
                                fontSize: '13px',
                                color: '#818181',
                                lineHeight: '23px'
                              },
                              '& .MuiTableCell-root .data-value': {
                                fontSize: '13px',
                                fontWeight: 500,
                                color: '#000',
                                lineHeight: '23px'
                              }
                            }}
                          >
                            <TableBody>
                              <TableRow>
                                <TableCell colSpan={2}>
                                  <Typography className='data-name'>
                                    {tenant?.billingAddress?.addressLine1}
                                    {tenant?.billingAddress?.addressLine2 &&
                                      `${', ' + tenant?.billingAddress?.addressLine2}`}
                                  </Typography>
                                  <Typography className='data-name'>
                                    {tenant?.billingAddress?.cityOrTown}, {tenant?.billingAddress?.state}
                                  </Typography>
                                  <Typography className='data-name'>
                                    {tenant?.billingAddress?.postcode},{tenant?.billingAddress?.country}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </Grid>
                        <Grid item xs={12} sm={6} md={6} lg={5.5} xl={5}>
                          <Typography
                            sx={{
                              fontSize: '14px',
                              fontWeight: 500,
                              lineHeight: '22px',
                              mb: 2
                            }}
                          >
                            Delivery Address
                          </Typography>
                          <Table
                            sx={{
                              width: '100%',
                              border: 0,
                              '& .MuiTableCell-root': {
                                width: '50%',
                                border: 0,
                                verticalAlign: 'top !important',
                                padding: '0px !important'
                              },
                              '& .MuiTableCell-root .data-name': {
                                fontSize: '13px',
                                color: '#818181',
                                lineHeight: '23px'
                              },
                              '& .MuiTableCell-root .data-value': {
                                fontSize: '13px',
                                fontWeight: 500,
                                color: '#000',
                                lineHeight: '23px'
                              }
                            }}
                          >
                            <TableBody>
                              <TableRow>
                                <TableCell colSpan={2}>
                                  <Typography className='data-name'>
                                    {tenant?.address?.addressLine1}
                                    {tenant?.address?.addressLine2 && `${', ' + tenant?.address?.addressLine2}`}
                                  </Typography>
                                  <Typography className='data-name'>
                                    {tenant?.address?.cityOrTown}, {tenant?.address?.state}
                                  </Typography>
                                  <Typography className='data-name'>
                                    {tenant?.address?.postcode},{tenant?.address?.country}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12} md={12}>
                      {' '}
                      <Typography
                        sx={{
                          fontSize: '14px',
                          fontWeight: 500,
                          lineHeight: '22px',
                          mb: 2
                        }}
                      >
                        Other Details
                      </Typography>
                      <Table
                        sx={{
                          width: '100%',
                          border: 0,
                          '& .MuiTableCell-root': {
                            border: 0,
                            padding: '0px !important',
                            verticalAlign: 'top',
                            width: '50%'
                          },
                          '& .MuiTableCell-root .data-name': {
                            fontSize: '13px',
                            color: '#818181',
                            lineHeight: '23px'
                          },
                          '& .MuiTableCell-root .data-value': {
                            fontSize: '13px',
                            fontWeight: 500,
                            color: '#000',
                            lineHeight: '23px'
                          }
                        }}
                      >
                        <TableBody>
                          <TableRow>
                            <TableCell>
                              <Typography className='data-name'>
                                Currency: {currency?.symbol} {currency?.currencyId}
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
                            Additional Fields
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
                                  <TableCell style={{ width: '45%' }}>Name</TableCell>
                                  <TableCell style={{ width: '45%' }}>Value</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {tenant?.attributes?.length > 0 ? (
                                  tenant?.attributes?.map((attribute, index) => {
                                    return (
                                      <TableRow key={index}>
                                        <TableCell align='left'>{index + 1}</TableCell>
                                        <TableCell align='left'>{attribute?.key}</TableCell>
                                        <TableCell align='left'>{attribute?.value}</TableCell>
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
                        <Grid item xs={12} sm={12} md={12} lg={6}>
                          <Typography sx={{ fontSize: '14px', fontWeight: 500, lineHeight: '22px', mb: 2 }}>
                            Taxation Fields
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
                                  <TableCell style={{ width: '45%' }}>Name</TableCell>
                                  <TableCell style={{ width: '45%' }}>Value</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {tenant?.taxations?.length > 0 ? (
                                  tenant?.taxations?.map((tax, index) => {
                                    return (
                                      <TableRow key={index}>
                                        <TableCell align='left'>{index + 1}</TableCell>
                                        <TableCell align='left'>{tax?.key}</TableCell>
                                        <TableCell align='left'>{tax?.value}</TableCell>
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
                  </Grid>
                </Card>
                {/* </TabPanel> */}
                {/* {tenant?.tradingId !== '' && tenant?.tradingId !== null ? (
                  <TabPanel
                    value='trading-profile'
                    sx={{
                      p: { xs: '10px  !important', md: '15px !important' }
                    }}
                  >
                    <Card sx={{ p: 6 }}>
                      <Grid container spacing={6}>
                        <Grid item xs={12}>
                          <Table
                            sx={{
                              width: '100%',
                              border: 0,
                              '& .MuiTableCell-root': {
                                border: 0,
                                padding: '0px !important',
                                verticalAlign: 'top',
                                width: '50%'
                              },
                              '& .MuiTableCell-root .data-name': {
                                fontSize: '13px',
                                color: '#818181',
                                lineHeight: '23px'
                              },
                              '& .MuiTableCell-root .data-value': {
                                fontSize: '13px',
                                fontWeight: 500,
                                color: '#000',
                                lineHeight: '23px'
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
                                    #{trading?.tradingNo}
                                  </Typography>
                                </TableCell>
                              </TableRow>

                              <TableRow>
                                <TableCell>
                                  <Typography className='data-name'>Trading Name: {trading?.tradingName}</Typography>
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </Grid>
                        <Grid item xs={12}>
                          <Grid container spacing={6} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Grid item xs={12} sm={6} md={6} lg={5.5} xl={5}>
                              <Typography
                                sx={{
                                  fontSize: '14px',
                                  fontWeight: 500,
                                  lineHeight: '22px',
                                  mb: 2
                                }}
                              >
                                Primary Contact
                              </Typography>
                              <Table
                                sx={{
                                  width: '100%',
                                  border: 0,

                                  '& .MuiTableCell-root': {
                                    width: '50%',
                                    border: 0,
                                    verticalAlign: 'top !important',
                                    padding: '0px !important'
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
                                    <TableCell>
                                      <Typography className='data-name' sx={{ display: 'flex', gap: 1 }}>
                                        mail:{' '}
                                        <a
                                          href='mailto:emailAddress'
                                          style={{ color: 'inherit', textDecoration: 'none', wordBreak: 'break-all' }}
                                        >
                                          {' '}
                                          {trading?.emailAddress || '-'}
                                        </a>{' '}
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell>
                                      <Typography className='data-name'>
                                        mobile: {formatPhoneNumberIntl(`+${trading?.mobile}`) || '-'}{' '}
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell>
                                      <Typography className='data-name'>
                                        work phone: {formatPhoneNumberIntl(`+${trading?.workPhone}`) || '-'}
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item xs={12}>
                          <Grid container spacing={6} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Grid item xs={12} sm={6} md={6} lg={5.5} xl={5}>
                              {' '}
                              <Typography
                                sx={{
                                  fontSize: '14px',
                                  fontWeight: 500,
                                  lineHeight: '22px',
                                  mb: 2
                                }}
                              >
                                Address
                              </Typography>
                              <Table
                                sx={{
                                  width: '100%',
                                  border: 0,
                                  '& .MuiTableCell-root': {
                                    width: '50%',
                                    border: 0,
                                    verticalAlign: 'top !important',
                                    padding: '0px !important'
                                  },
                                  '& .MuiTableCell-root .data-name': {
                                    fontSize: '13px',
                                    color: '#818181',
                                    lineHeight: '23px'
                                  },
                                  '& .MuiTableCell-root .data-value': {
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    color: '#000',
                                    lineHeight: '23px'
                                  }
                                }}
                              >
                                <TableBody>
                                  <TableRow>
                                    <TableCell colSpan={2}>
                                      <Typography className='data-name'>
                                        {trading?.address?.addressLine1},{trading?.address?.addressLine2},{' '}
                                        {trading?.address?.postcode}, {trading?.address?.cityOrTown},{' '}
                                        {trading?.address?.state}, {trading?.address?.country}
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </Grid>
                          </Grid>
                        </Grid>

                        <Grid item xs={12}>
                          <Grid container spacing={6} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Grid item xs={12} sm={12} md={12} lg={6}>
                              <Typography sx={{ fontSize: '14px', fontWeight: 500, lineHeight: '22px', mb: 2 }}>
                                Additional Fields
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
                                      <TableCell style={{ width: '45%' }}>Name</TableCell>
                                      <TableCell style={{ width: '45%' }}>Value</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {trading?.attributes?.length > 0 ? (
                                      trading?.attributes?.map((attribute, index) => {
                                        return (
                                          <TableRow key={index}>
                                            <TableCell align='left'>{index + 1}</TableCell>
                                            <TableCell align='left'>{attribute?.key}</TableCell>
                                            <TableCell align='left'>{attribute?.value}</TableCell>
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
                      </Grid>
                    </Card>
                  </TabPanel>
                ) : null} */}
                {/* </TabContext> */}
              </Grid>
            </Grid>
          </div>
        )}
      </PageWrapper>
    </React.Fragment>
  )
}
