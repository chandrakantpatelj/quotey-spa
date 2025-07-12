import RefreshIcon from '@mui/icons-material/Refresh'
import {
  Box,
  Button,
  Card,
  Grid,
  IconButton,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Icon from 'src/@core/components/icon'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import { EDIT_SALES_SETTING, LIST_SALES_SETTING } from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute, hasPermission } from 'src/common-functions/utils/UtilityFunctions'
import { useFinancialAccounts } from 'src/hooks/getData/useFinancialAccounts'
import { useSalesModule } from 'src/hooks/getData/useSalesModule'
import useTaxAuthorities from 'src/hooks/getData/useTaxAuthorities'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import { resetSalesModule } from 'src/store/apps/sales-module-settings'

function SalesModule() {
  const dispatch = useDispatch()
  const router = useRouter()
  const tenantId = useSelector(state => state?.tenants?.selectedTenant?.tenantId || null)
  const { salesModules, salesModuleLoading } = useSalesModule(tenantId)
  const { financialAccountloading } = useFinancialAccounts(tenantId)
  const loading = salesModuleLoading || financialAccountloading
  const { taxAuthorities } = useTaxAuthorities(tenantId)
  const userProfile = useSelector(state => state.userProfile)
  const [isAuthorized, setIsAuthorized] = useState(false)

  const { enableDiscount, taxes = {}, otherCharges = {} } = salesModules || {}

  const getTaxAuthorityName = taxAuthorityId => {
    return taxAuthorities?.find(authority => authority.taxAuthorityId === taxAuthorityId)?.taxAuthorityName || '-'
  }

  useEffect(() => {
    if (checkAuthorizedRoute(LIST_SALES_SETTING, router, userProfile)) {
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
            Sales Module
          </Typography>
        }
        button={
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            <Tooltip title='Reload' placement='top'>
              <IconButton
                color='default'
                onClick={() => {
                  dispatch(resetSalesModule())
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            {!loading && hasPermission(userProfile, EDIT_SALES_SETTING) && (
              <Button
                variant='contained'
                color='primary'
                startIcon={<Icon icon='tabler:edit' />}
                component={Link}
                scroll={true}
                // onClick={() => dispatch(setSalesModuleSetting(salesModules))}
                href={`/account-settings/sales-module/edit-salesmodule`}
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
        ) : salesModules && Object?.keys(salesModules)?.length > 0 ? (
          <Grid container>
            <Grid item xs={12} md={12} lg={8} xl={6}>
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
                          <TableCell sx={{ width: '40%' }}>
                            <Typography className='data-name'>
                              Enable Discount : {enableDiscount ? 'Yes' : 'No'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Typography className='data-name'>
                              Currencies
                              <ul style={{ paddingLeft: '30px', margin: '0px' }}>
                                {salesModules?.currencies?.map(item => (
                                  <li key={item}>{item}</li>
                                ))}
                              </ul>
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Grid>

                  <Grid item xs={12} md={12}>
                    <Typography sx={{ fontSize: '14px', fontWeight: 500, lineHeight: '22px', mb: 2 }}>
                      Taxes:
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
                            <TableCell style={{ width: '12%' }}>Tax Name</TableCell>
                            <TableCell style={{ width: '10%' }}>Tax Rate</TableCell>
                            <TableCell style={{ width: '13%' }}>Tax Authority</TableCell>
                            <TableCell style={{ width: '5%' }}>Enabled</TableCell>
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          {taxes?.length > 0 ? (
                            taxes?.map((tax, index) => {
                              return (
                                <TableRow key={index}>
                                  <TableCell align='left'>{tax?.taxName}</TableCell>
                                  <TableCell align='left'>{tax?.taxRate}</TableCell>
                                  <TableCell align='left'>{getTaxAuthorityName(tax.taxAuthorityId)}</TableCell>
                                  <TableCell align='left'>{tax?.enabled ? 'Yes' : 'No'}</TableCell>
                                </TableRow>
                              )
                            })
                          ) : (
                            <TableRow>
                              <TableCell colSpan={3}>
                                <Box
                                  sx={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    p: '30px 10px'
                                  }}
                                >
                                  <Typography variant='h5' align='center' display='block'>
                                    No Data Available
                                  </Typography>
                                </Box>{' '}
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                  <Grid item xs={12} md={12}>
                    <Typography sx={{ fontSize: '14px', fontWeight: 500, lineHeight: '22px', mb: 2 }}>
                      Other Charges:
                    </Typography>
                    <TableContainer>
                      <Table
                        size='small'
                        sx={{
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
                            <TableCell style={{ width: '3%' }}>No</TableCell>
                            <TableCell style={{ width: '25%' }}>Charge Name</TableCell>
                            <TableCell style={{ width: '10%' }}>Including Tax</TableCell>
                            <TableCell style={{ width: '5%' }}>Enabled</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {otherCharges?.length > 0 ? (
                            otherCharges?.map((charges, index) => {
                              return (
                                <>
                                  <TableRow key={index}>
                                    <TableCell align='left' rowSpan={2}>
                                      {index + 1}
                                    </TableCell>
                                    <TableCell align='left'>{charges?.chargeName}</TableCell>
                                    <TableCell align='left'>{charges?.includingTax ? 'Yes' : 'No'}</TableCell>
                                    <TableCell align='left'>{charges?.enabled ? 'Yes' : 'No'}</TableCell>
                                  </TableRow>
                                  <TableRow key={index}>
                                    <TableCell colSpan={8}>
                                      <Table
                                        size='small'
                                        sx={{
                                          // ml: { xs: 0, md: 5 },
                                          '& .MuiTableCell-head ': {
                                            textTransform: 'capitalize',
                                            background: '#d8d8d838 !important'
                                          },
                                          '& .MuiTableHead-root': {
                                            fontSize: '12px',
                                            py: '10px'
                                          },
                                          '& .MuiTableCell-root': {
                                            borderBottom: '1px dotted #D8D8D8',
                                            fontSize: '12px',
                                            py: '10px'
                                          }
                                        }}
                                      >
                                        <TableHead>
                                          <TableRow>
                                            <TableCell style={{ width: '12%' }}>Tax Name</TableCell>
                                            <TableCell style={{ width: '10%' }}>Tax Rate</TableCell>
                                            <TableCell style={{ width: '13%' }}>Tax Authority</TableCell>
                                            <TableCell style={{ width: '5%' }}>Enabled</TableCell>
                                          </TableRow>
                                        </TableHead>

                                        <TableBody>
                                          {charges?.taxes?.length > 0 ? (
                                            charges?.taxes?.map((tax, index) => {
                                              return (
                                                <TableRow key={index}>
                                                  <TableCell align='left'>{tax?.taxName}</TableCell>
                                                  <TableCell align='left'>{tax?.taxRate}</TableCell>
                                                  <TableCell align='left'>
                                                    {getTaxAuthorityName(tax.taxAuthorityId)}
                                                  </TableCell>
                                                  <TableCell align='left'>{tax?.enabled ? 'Yes' : 'No'}</TableCell>
                                                </TableRow>
                                              )
                                            })
                                          ) : (
                                            <TableRow>
                                              <TableCell colSpan={7}>
                                                <Box
                                                  sx={{
                                                    width: '100%',
                                                    height: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                    // p: '30px 10px'
                                                  }}
                                                >
                                                  <Typography variant='h6' align='center' display='block'>
                                                    No Taxes Available
                                                  </Typography>
                                                </Box>{' '}
                                              </TableCell>
                                            </TableRow>
                                          )}
                                        </TableBody>
                                      </Table>
                                    </TableCell>
                                  </TableRow>
                                </>
                              )
                            })
                          ) : (
                            <TableRow>
                              <TableCell colSpan={3}>
                                <Box
                                  sx={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    p: '30px 10px'
                                  }}
                                >
                                  <Typography variant='h5' align='center' display='block'>
                                    No Data Available
                                  </Typography>
                                </Box>{' '}
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          </Grid>
        ) : (
          <Box
            sx={{
              maxWidth: '850px',
              width: '100%',
              border: '2px solid',
              margin: '0px auto',
              padding: '50px 10px ' // top-bottom 10px, left-right 20px
            }}
          >
            <Typography variant='h5' align='center' display='block'>
              No data available. Click "Edit" button above to get started.
            </Typography>
          </Box>
        )}
      </PageWrapper>
    </ErrorBoundary>
  )
}

export default SalesModule
