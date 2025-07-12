import Link from 'next/link'
import Router from 'next/router'
import React, { useEffect, useState } from 'react'
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
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { formatPhoneNumberIntl } from 'react-phone-number-input'
import { ShowAddress } from 'src/common-components/CommonPdfDesign'
import { useDispatch, useSelector } from 'react-redux'
import { setActionTrading } from 'src/store/apps/tradings'
import SingleLogoBox from 'src/common-components/SingleLogoBox'
import { hasPermission } from 'src/common-functions/utils/UtilityFunctions'
import { CREATE_TRADING, EDIT_TRADING } from 'src/common-functions/utils/Constants'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'

export default function ViewTrading({ tradingsObject, loading }) {
  const route = Router
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId)
  const dispatch = useDispatch()
  const trading = useSelector(state => state?.tradings?.selectedTrading)
  const { tradings = [] } = tradingsObject || {}
  const userProfile = useSelector(state => state.userProfile)

  const [isListVisible, setIsListVisible] = useState(true)

  const toggleListVisibility = () => {
    setIsListVisible(!isListVisible)
  }
  useEffect(() => {
    if (Object.keys(trading).length === 0) {
      route.push('/account-settings/tradings/')
    }
  }, [trading, tenantId])
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
            View Tradings Profile - {trading?.tradingNo}
          </Typography>
        }
        button={
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            {hasPermission(userProfile, CREATE_TRADING) && (
              <Button
                variant='contained'
                color='primary'
                sx={{ display: { xs: 'none', sm: 'flex' } }}
                startIcon={<AddOutlinedIcon />}
                component={Link}
                scroll={true}
                href={`/account-settings/tradings/add-trading`}
              >
                Add New
              </Button>
            )}
            {hasPermission(userProfile, EDIT_TRADING) && (
              <IconButton
                variant='outlined'
                sx={{ fontSize: '21px' }}
                component={Link}
                scroll={true}
                onClick={() => {
                  dispatch(setActionTrading(trading))
                }}
                href={`/account-settings/tradings/edit/${trading?.tradingId}`}
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
              href='/account-settings/tradings/'
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
                    options={tradings || []}
                    getOptionLabel={option => `${option.tradingNoPrefix || ''}${option.tradingNo || ''}`}
                    value={tradings.find(option => option.tradingId === trading.tradingId) || null}
                    onChange={(e, newValue) => {
                      dispatch(setActionTrading(newValue))
                    }}
                    disableClearable
                    renderInput={params => <CustomTextField {...params} fullWidth label='Tradings' />}
                  />
                </Grid>
              </Grid>
              <Grid item xs={12} md={8} lg={8} xl={8}>
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
                                    #{trading?.tradingNoPrefix}
                                    {trading?.tradingNo}
                                  </Typography>
                                </TableCell>
                              </TableRow>

                              <TableRow>
                                <TableCell>
                                  <Typography className='data-name'>Trading Name: {trading?.tradingName}</Typography>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>
                                  <Typography className='data-name'>Trading Name: {trading?.businessName}</Typography>
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </Grid>
                        <Grid item xs={12} sm={6} md={6} lg={5.5} xl={5}>
                          <SingleLogoBox data={trading} />
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
                                    {trading?.primaryContact?.firstName} {trading?.primaryContact?.lastName}
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
                                      {trading?.emailAddress}
                                    </a>{' '}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>
                                  <Typography className='data-name'>
                                    mobile: {formatPhoneNumberIntl(`+${trading?.mobile}`)}{' '}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>
                                  <Typography className='data-name'>
                                    work phone: {formatPhoneNumberIntl(`+${trading?.workPhone}`)}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </Grid>
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
                                  <ShowAddress data={trading?.address} />
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
              </Grid>
            </Grid>
          </div>
        )}
      </PageWrapper>
    </React.Fragment>
  )
}
