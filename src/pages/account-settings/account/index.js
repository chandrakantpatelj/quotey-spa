import Link from 'next/link'
import { useRouter } from 'next/router'

import React, { useMemo, useState } from 'react'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import {
  Typography,
  Button,
  Grid,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  LinearProgress,
  Snackbar,
  Card,
  Alert,
  Tooltip,
  IconButton
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { formatPhoneNumberIntl } from 'react-phone-number-input'
import { getAccountQuery } from 'src/@core/components/graphql/account-queries'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { checkAuthorizedRoute, hasPermission } from 'src/common-functions/utils/UtilityFunctions'
import { LIST_ACCOUNT_SETTING, EDIT_ACCOUNT_SETTING } from 'src/common-functions/utils/Constants'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import RefreshIcon from '@mui/icons-material/Refresh'
import { Box } from '@mui/system'

function Account() {
  const route = useRouter()
  const [loader, setLoader] = useState(false)
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId)
  const [accountsObject, setAccountsObject] = useState({})
  const dispatch = useDispatch()
  const userProfile = useSelector(state => state.userProfile)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  async function getAccountFunction() {
    try {
      setLoading(true)
      const accounts = await fetchData(getAccountQuery(tenantId))
      const { getAccount } = accounts
      const distructObject = {
        account: getAccount
      }

      setAccountsObject(distructObject)
    } catch (error) {
      console.error('Error fetching financial accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  const { account = [] } = accountsObject || {}

  useEffect(() => {
    getAccountFunction()
  }, [loader])

  const [open, setOpen] = useState(false)

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }

    setOpen(false)
  }

  useEffect(() => {
    if (checkAuthorizedRoute(LIST_ACCOUNT_SETTING, route, userProfile)) {
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
            Account
          </Typography>
        }
        button={
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 3,
              mb: 3
            }}
          >
            <Tooltip title='Reload' placement='top'>
              <IconButton
                color='default'
                sx={{ fontSize: '21px' }}
                onClick={() => {
                  getAccountFunction()
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            {hasPermission(userProfile, EDIT_ACCOUNT_SETTING) && (
              <Button
                variant='contained'
                color='primary'
                startIcon={<Icon icon='tabler:edit' />}
                sx={{ display: 'flex' }}
                component={Link}
                scroll={true}
                href={`/account-settings/account/edit`}
              >
                Edit
              </Button>
            )}
          </Box>
        }
      />
      <PageWrapper>
        {loading ? (
          <LinearProgress sx={{ mb: 4 }} />
        ) : (
          <Grid container>
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
                              #{account?.accountNo}
                            </Typography>
                          </TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell>
                            <Typography className='data-name'>Company Name: {account?.displayName}</Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Typography className='data-name'>Business Name: {account?.businessName} </Typography>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
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
                              {account?.primaryContact?.firstName} {account?.primaryContact?.lastName}
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
                                {account?.contactEmail}
                              </a>{' '}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Typography className='data-name'>
                              work phone: {formatPhoneNumberIntl(`+${account?.workPhone}`)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Typography className='data-name'>
                              mobile: {formatPhoneNumberIntl(`+${account?.phoneNumber}`)}{' '}
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
                                    fontSize: '12px',
                                    color: '#818181',
                                    wordBreak: 'break-all',
                                    lineHeight: '23px'
                                  }}
                                >
                                  {account?.billingAddress?.addressLine1}
                                  {account?.billingAddress?.addressLine2 &&
                                    `${', ' + account?.billingAddress?.addressLine2}`}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: '12px',
                                    color: '#818181',
                                    wordBreak: 'break-all',
                                    lineHeight: '23px'
                                  }}
                                >
                                  {account?.billingAddress?.cityOrTown}, {account?.billingAddress?.state}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: '12px',
                                    color: '#818181',
                                    wordBreak: 'break-all',
                                    lineHeight: '23px'
                                  }}
                                >
                                  {account?.billingAddress?.postcode}, {account?.billingAddress?.country}
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
                                  {account?.address?.addressLine1}
                                  {account?.address?.addressLine2 && `${', ' + account?.address?.addressLine2}`}
                                </Typography>
                                <Typography className='data-name'>
                                  {account?.address?.cityOrTown}, {account?.address?.state}
                                </Typography>
                                <Typography className='data-name'>
                                  {account?.address?.postcode},{account?.address?.country}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} md={6}>
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
                          {account?.attributes?.map((attribute, index) => {
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
    </ErrorBoundary>
  )
}

export default Account
