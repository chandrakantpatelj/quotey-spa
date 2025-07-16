// ** Next Import
import Link from 'next/link'
import Router from 'next/router'
import React, { useEffect, useState } from 'react'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import {
  Box,
  Button,
  IconButton,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  Grid,
  Card,
  LinearProgress,
  styled
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useDispatch, useSelector } from 'react-redux'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { Close } from '@mui/icons-material'
import { DateFunction, hasPermission, NumberFormat, rowStatusChip } from 'src/common-functions/utils/UtilityFunctions'
import { setSelectedTaxPayment } from 'src/store/apps/tax-payments'
import PerfectScrollbarComponent from 'react-perfect-scrollbar'
import { CREATE_TAX_PAYMENT } from 'src/common-functions/utils/Constants'
import { CommonViewTable } from 'src/common-components/CommonPdfDesign'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'
import ClearedTaxStatementPaymentList from './ClearedTaxStatementPaymentList'

export default function ViewTaxPayment({ loading, taxPaymentsData }) {
  const theme = useTheme()
  const route = Router
  const dispatch = useDispatch()
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId)

  const userProfile = useSelector(state => state.userProfile)

  const { selectedTaxPayment } = useSelector(state => state?.taxPayments)

  const { taxAuthorities, currencies, paymentMethods, taxPayments } = taxPaymentsData
  const [isListVisible, setIsListVisible] = useState(true)

  const toggleListVisibility = () => {
    setIsListVisible(!isListVisible)
  }

  const currency = currencies?.find(currency => currency.currencyId === selectedTaxPayment.currency)
  const PerfectScrollbar = styled(PerfectScrollbarComponent)({
    maxHeight: '70vh'
  })

  const getTaxAuthorityName = taxAuthorityId => {
    const authority = taxAuthorities?.find(auth => auth.taxAuthorityId === taxAuthorityId) || {}
    return authority?.taxAuthorityName || '-'
  }
  useEffect(() => {
    if (Object.keys(selectedTaxPayment).length === 0) {
      route.push('/accounting/tax-payments/')
    }
  }, [selectedTaxPayment, tenantId])
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
            View Tax Payment -{selectedTaxPayment?.paymentNoPrefix}
            {selectedTaxPayment?.paymentNo}
          </Typography>
        }
        button={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {hasPermission(userProfile, CREATE_TAX_PAYMENT) && (
              <Button
                variant='contained'
                color='primary'
                sx={{ display: { xs: 'none', sm: 'flex' } }}
                startIcon={<AddOutlinedIcon />}
                component={Link}
                scroll={true}
                href={`/accounting/tax-payments/add`}
              >
                Add New
              </Button>
            )}

            <IconButton
              variant='outlined'
              color='default'
              sx={{ fontSize: '21px' }}
              component={Link}
              scroll={true}
              href='/accounting/tax-payments/'
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
                    options={taxPayments || []}
                    getOptionLabel={option => option?.paymentNo || ''}
                    value={taxPayments.find(option => option.paymentId === selectedTaxPayment.paymentId) || null}
                    onChange={(e, newValue) => {
                      dispatch(setSelectedTaxPayment(newValue))
                    }}
                    disableClearable
                    renderInput={params => <CustomTextField {...params} fullWidth label='Tax Payments' />}
                  />
                </Grid>
              </Grid>
              <Grid item xs={12} md={12} lg={9} xl={9}>
                <Card sx={{ p: 6 }}>
                  <Grid container spacing={8}>
                    <Grid item xs={12} sm={12}>
                      <Grid
                        container
                        spacing={{ xs: 3, md: 4 }}
                        sx={{ display: 'flex', justifyContent: 'space-between' }}
                      >
                        <Grid item xs={12} md={12}>
                          <CommonViewTable>
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
                                    #{selectedTaxPayment?.paymentNo}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell colSpan={2}>{rowStatusChip(selectedTaxPayment?.status)}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>
                                  <Typography className='data-name'>
                                    Payment Date : {DateFunction(selectedTaxPayment?.paymentDate)}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>
                                  <Typography className='data-name'>
                                    Tax Authority: {getTaxAuthorityName(selectedTaxPayment?.taxAuthorityId)}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>
                                  <Typography className='data-name'>
                                    Payment Method :{' '}
                                    {
                                      paymentMethods.find(
                                        method => method.paymentMethodId === selectedTaxPayment?.paymentMethod
                                      )?.paymentMethod
                                    }
                                  </Typography>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>
                                  <Typography className='data-name'>
                                    {selectedTaxPayment?.description &&
                                      `Description: ${selectedTaxPayment?.description}`}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>
                                  <Typography className='data-name'>
                                    {selectedTaxPayment?.paymentType &&
                                      `Payment Type: ${selectedTaxPayment?.paymentType}`}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>
                                  <Typography className='data-name'>
                                    Amount: <NumberFormat value={selectedTaxPayment?.amount} currency={currency} />
                                  </Typography>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>
                                  <Typography className='data-name'>
                                    {selectedTaxPayment?.referenceNo &&
                                      `Reference No: ${selectedTaxPayment?.referenceNo}`}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>
                                  <Typography className='data-name' sx={{ lineHeight: '23px' }}>
                                    {selectedTaxPayment?.notes && `Notes: ${selectedTaxPayment?.notes}`}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </CommonViewTable>
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ p: 6, width: '100%' }}>
                            <ClearedTaxStatementPaymentList
                              tenantId={tenantId}
                              taxPaymentId={selectedTaxPayment?.paymentId}
                            />
                          </Box>
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
