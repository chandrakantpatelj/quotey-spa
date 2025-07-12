// ** Next Import
import Link from 'next/link'
import Router from 'next/router'
import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  IconButton,
  Table,
  TableBody,
  Grid,
  TableCell,
  TableRow,
  Typography,
  Card,
  TableContainer,
  TableHead,
  LinearProgress
} from '@mui/material'
import { Close } from '@mui/icons-material'
import Icon from 'src/@core/components/icon'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { setActionWareHouse } from 'src/store/apps/warehouses'
import { useDispatch, useSelector } from 'react-redux'
import { ViewDataList } from 'src/common-components/CommonPdfDesign'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { formatPhoneNumberIntl } from 'react-phone-number-input'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import PageHeader from 'src/@core/components/page-header'
import { useTheme, alpha } from '@mui/material/styles'
import { CREATE_WAREHOUSE, EDIT_WAREHOUSE } from 'src/common-functions/utils/Constants'
import { hasPermission } from 'src/common-functions/utils/UtilityFunctions'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'

export default function ViewWarehouse({ warehousesObject, loading }) {
  const theme = useTheme()
  const route = Router
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId)
  const dispatch = useDispatch()
  const [isListVisible, setIsListVisible] = useState(true)
  const { warehouses } = warehousesObject || {}
  const warehouse = useSelector(state => state.warehouses?.selectedWarehouse) || {}
  const userProfile = useSelector(state => state.userProfile)

  const toggleListVisibility = () => {
    setIsListVisible(!isListVisible)
  }
  useEffect(() => {
    if (Object.keys(warehouse).length === 0) {
      route.push('/account-settings/warehouses/')
    }
  }, [warehouse, tenantId])
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
              View WareHouse - {warehouse?.warehouseNo}
            </Typography>
          }
          button={
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              {hasPermission(userProfile, CREATE_WAREHOUSE) && (
                <Button
                  variant='contained'
                  color='primary'
                  sx={{ display: { xs: 'none', sm: 'flex' } }}
                  startIcon={<AddOutlinedIcon />}
                  component={Link}
                  scroll={true}
                  href={`/account-settings/warehouses/add-warehouse`}
                >
                  Add New
                </Button>
              )}
              {hasPermission(userProfile, EDIT_WAREHOUSE) && (
                <IconButton
                  variant='outlined'
                  sx={{ fontSize: '21px' }}
                  component={Link}
                  scroll={true}
                  href={`/account-settings/warehouses/edit/${warehouse?.warehouseId}`}
                  onClick={() => dispatch(setActionWareHouse(warehouse))}
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
                href='/account-settings/warehouses/'
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
                      options={warehouses || []}
                      getOptionLabel={option => option?.name || ''}
                      value={warehouses.find(option => option.warehouseId === warehouse.warehouseId) || null}
                      onChange={(e, newValue) => {
                        dispatch(setActionWareHouse(newValue))
                      }}
                      disableClearable
                      renderInput={params => <CustomTextField {...params} fullWidth label='Warehouses' />}
                    />
                  </Grid>
                </Grid>

                <Grid item xs={12} md={8} lg={8} xl={8}>
                  <Card sx={{ p: 6 }}>
                    <Grid container spacing={8}>
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
                                  #{warehouse?.warehouseNo}
                                </Typography>
                              </TableCell>
                            </TableRow>

                            <TableRow>
                              <TableCell>
                                <Typography className='data-name'>Name: {warehouse?.name}</Typography>
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
                                    <Typography className='data-name'>
                                      {warehouse?.primaryContact?.firstName} {warehouse?.primaryContact?.lastName}
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
                                        {warehouse?.emailAddress}
                                      </a>{' '}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>
                                    <Typography className='data-name'>
                                      mobile: {formatPhoneNumberIntl(`+${warehouse?.mobile}`)}{' '}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>
                                    <Typography className='data-name'>
                                      work phone: {formatPhoneNumberIntl(`+${warehouse?.workPhone}`)}
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
                              Address
                            </Typography>
                            <Table
                              sx={{
                                width: '100%',
                                border: 0,
                                marginBottom: '30px',
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
                                  <TableCell colSpan={2}>
                                    <Typography className='data-name'>
                                      {warehouse?.address?.addressLine1}
                                      {warehouse?.address?.addressLine2 && `${', ' + warehouse?.address?.addressLine2}`}
                                    </Typography>
                                    <Typography className='data-name'>
                                      {warehouse?.address?.cityOrTown}, {warehouse?.address?.postcode}
                                    </Typography>
                                    <Typography className='data-name'>
                                      {warehouse?.address?.state}, {warehouse?.address?.country}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </Grid>
                        </Grid>
                      </Grid>

                      <Grid item xs={12} sm={6}>
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
                              {warehouse?.attributes?.map((attribute, index) => {
                                return (
                                  <TableRow key={index}>
                                    <TableCell align='left'>{index + 1}</TableCell>
                                    <TableCell align='left'>{attribute?.key}</TableCell>
                                    <TableCell align='left'>{attribute?.value}</TableCell>
                                  </TableRow>
                                )
                              })}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
              </Grid>
            </div>
          )}
        </PageWrapper>
      </React.Fragment>
    </div>
  )
}
