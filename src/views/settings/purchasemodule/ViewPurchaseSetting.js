import Link from 'next/link'
import Router from 'next/router'
import { useEffect } from 'react'
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
  Card,
  Box,
  LinearProgress,
  IconButton,
  Divider
} from '@mui/material'
import { useSelector } from 'react-redux'
import { AddOutlined, Close } from '@mui/icons-material'
import { CREATE_PURCHASE_SETTING } from 'src/common-functions/utils/Constants'
import { hasPermission, toTitleCase } from 'src/common-functions/utils/UtilityFunctions'

export default function ViewPurchaseSetting({ loading, purchaseSettingData }) {
  const route = Router
  const userProfile = useSelector(state => state.userProfile)
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId)

  const selectedPurchaseSettings =
    useSelector(state => state?.purchaseModuleSetting?.selectedpurchaseModuleSetting) || {}

  const { vendors = [], taxAuthorities = [] } = purchaseSettingData || {}

  const { taxes = [], expenses = [], shipmentTaxes = [], shipmentExpenses = [] } = selectedPurchaseSettings || {}

  useEffect(() => {
    if (Object.keys(selectedPurchaseSettings).length === 0) {
      route.push('/account-settings/purchase-module/')
    }
  }, [selectedPurchaseSettings, tenantId])

  return (
    <>
      <PageHeader
        title={
          <Typography
            sx={{
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            View Purchase Setting - {selectedPurchaseSettings?.purchaseType}
          </Typography>
        }
        button={
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            {hasPermission(userProfile, CREATE_PURCHASE_SETTING) && (
              <Button
                variant='contained'
                color='primary'
                startIcon={<AddOutlined />}
                sx={{ display: { xs: 'none', sm: 'flex' } }}
                component={Link}
                scroll={true}
                href={`/account-settings/purchase-module/add`}
              >
                New
              </Button>
            )}
            {/* {hasPermission(userProfile, EDIT_PURCHASE_SETTING) && (
              <IconButton
                variant='outlined'
                component={Link}
                scroll={true}
                href={`/account-settings/purchase-module/edit/${selectedPurchaseSettings?.purchaseType}`}
                onClick={() => dispatch(setSelectedpurchaseModuleSetting(selectedPurchaseSettings))}
              >
                <Icon icon='tabler:edit' />
              </IconButton>
            )} */}
            <IconButton
              variant='outlined'
              color='default'
              component={Link}
              scroll={true}
              href={`/account-settings/purchase-module/`}
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
          <>
            <Grid container>
              <Grid item xs={12}>
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
                            <TableCell>
                              <Typography className='data-name'>
                                Purchase Type :{'   '}
                                <span style={{ fontSize: '14px !important', fontWeight: 500, color: '#4567c6 ' }}>
                                  {selectedPurchaseSettings?.purchaseType}
                                </span>
                              </Typography>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <Typography className='data-name'>
                                Version : {selectedPurchaseSettings?.version}
                              </Typography>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <Typography className='data-name'>
                                Latest Version : {selectedPurchaseSettings?.latestVersion ? 'Yes' : 'No'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <Typography className='data-name'>
                                Is Default : {selectedPurchaseSettings?.default ? 'Yes' : 'No'}
                              </Typography>
                            </TableCell>
                          </TableRow>

                          <TableRow>
                            <TableCell>
                              <Typography className='data-name'>
                                Subtotal In Local Currency :{' '}
                                {selectedPurchaseSettings?.subtotalInLocalCurrency ? 'Yes' : 'No'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <Typography className='data-name'>
                                Total Amount In Local Currency :{' '}
                                {selectedPurchaseSettings?.totalAmountInLocalCurrency ? 'Yes' : 'No'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <Typography className='data-name'>
                                Currencies
                                <ul style={{ paddingLeft: '30px', margin: '0px' }}>
                                  {selectedPurchaseSettings?.currencies?.map(item => (
                                    <li key={item}>{item}</li>
                                  ))}
                                </ul>
                              </Typography>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography sx={{ fontSize: '14px', fontWeight: 500, lineHeight: '22px', mb: 2 }}>
                        Taxes:
                      </Typography>
                      <TableContainer>
                        <Table
                          sx={{
                            // border: '1px solid #D7D7D7',
                            '& .MuiTableHead-root': {
                              textTransform: 'capitalize'
                            },
                            '& .MuiTableCell-root': {
                              borderBottom: '1px dashed #D8D8D8'
                            },

                            '& .MuiTableCell-root:first-of-type': {
                              pl: '8px !important'
                            },
                            '& .MuiTableCell-root:last-of-type': {
                              pr: '8px !important'
                            }
                          }}
                        >
                          <TableHead sx={{ bgcolor: 'rgba(248, 250, 254, 1)' }}>
                            <TableRow>
                              <TableCell style={{ width: '10%' }}>Tax Type</TableCell>
                              <TableCell style={{ width: '10%' }}>Tax Name</TableCell>
                              <TableCell style={{ width: '5%' }}>Tax Rate</TableCell>
                              <TableCell style={{ width: '6%' }}>Tax Authority</TableCell>
                              <TableCell style={{ width: '6%' }}>Is Manually Entered</TableCell>
                              <TableCell style={{ width: '6%' }}>Paid To TaxAuthority</TableCell>
                              <TableCell style={{ width: '8%' }}>Paid To Main Vendor</TableCell>
                              <TableCell style={{ width: '8%' }}>Vendor</TableCell>
                              <TableCell style={{ width: '10%' }}>Eligible For Tax Credit</TableCell>
                              <TableCell style={{ width: '6%' }}>In Local Currency</TableCell>
                              <TableCell style={{ width: '2%' }}>Enabled</TableCell>
                              <TableCell style={{ width: '2%' }}>Currencies</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {taxes?.length > 0 ? (
                              taxes?.map((tax, index) => {
                                const vendor = vendors?.find(item => item?.vendorId === tax.vendorId)

                                return (
                                  <TableRow key={index}>
                                    <TableCell>{tax?.taxType}</TableCell>
                                    <TableCell>{tax?.taxName}</TableCell>
                                    <TableCell>{tax?.taxRate}</TableCell>
                                    <TableCell>
                                      {
                                        taxAuthorities?.find(item => item?.taxAuthorityId === tax?.taxAuthorityId)
                                          ?.taxAuthorityName
                                      }
                                    </TableCell>
                                    <TableCell>{tax?.isManuallyEntered ? 'Yes' : 'No'}</TableCell>
                                    <TableCell>{tax?.paidToTaxAuthority ? 'Yes' : 'No'}</TableCell>
                                    <TableCell>{tax?.paidToMainVendor ? 'Yes' : 'No'}</TableCell>
                                    <TableCell>{vendor?.displayName}</TableCell>
                                    <TableCell>{tax?.eligibleForTaxCredit ? 'Yes' : 'No'}</TableCell>
                                    <TableCell>{tax?.inLocalCurrency ? 'Yes' : 'No'}</TableCell>
                                    <TableCell>{tax?.enabled ? 'Yes' : 'No'}</TableCell>
                                    <TableCell>
                                      <ul>
                                        {tax?.currencies?.map((item, i) => (
                                          <li key={i}>{item}</li>
                                        ))}
                                      </ul>
                                    </TableCell>
                                  </TableRow>
                                )
                              })
                            ) : (
                              <TableRow>
                                <TableCell colSpan={11}>
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
                    <Grid item xs={12}>
                      <Typography sx={{ fontSize: '14px', fontWeight: 500, lineHeight: '22px', mb: 2 }}>
                        Expenses:
                      </Typography>
                      <TableContainer>
                        <Table>
                          <TableHead sx={{ bgcolor: 'rgba(248, 250, 254, 1)' }}>
                            <TableRow>
                              <TableCell style={{ width: '15%' }}>Expense Type</TableCell>
                              <TableCell style={{ width: '15%' }}>Expense Name</TableCell>
                              <TableCell style={{ width: '15%' }}>Vendor</TableCell>
                              <TableCell style={{ width: '10%' }}>Paid To Main Vendor</TableCell>
                              <TableCell style={{ width: '10%' }}>Accountable For Order Taxes</TableCell>
                              <TableCell style={{ width: '10%' }}>Additional Taxes</TableCell>
                              <TableCell style={{ width: '10%' }}>Eligible For Tax Credit</TableCell>
                              <TableCell style={{ width: '10%' }}>In Local Currency</TableCell>
                              <TableCell style={{ width: '10%' }}>Distribution Method</TableCell>
                              <TableCell style={{ width: '5%' }}>Enabled</TableCell>
                              <TableCell style={{ width: '2%' }}>Currencies</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {expenses?.length > 0 ? (
                              expenses?.map((expense, index) => {
                                const vendor = vendors?.find(item => item?.vendorId === expense.vendorId)
                                return (
                                  <TableRow key={index}>
                                    <TableCell>{expense.expenseType}</TableCell>
                                    <TableCell>{expense.expenseName}</TableCell>
                                    <TableCell>{vendor?.displayName}</TableCell>
                                    <TableCell>{expense?.paidToMainVendor ? 'Yes' : 'No'}</TableCell>
                                    <TableCell>{expense?.accountableForOrderTaxes ? 'Yes' : 'No'}</TableCell>
                                    <TableCell>{expense?.additionalTaxes ? 'Yes' : 'No'}</TableCell>
                                    <TableCell>{expense?.eligibleForTaxCredit ? 'Yes' : 'No'}</TableCell>
                                    <TableCell>{expense?.inLocalCurrency ? 'Yes' : 'No'}</TableCell>
                                    <TableCell sx={{ textTransform: 'capitalize' }}>
                                      {toTitleCase(expense?.distributionMethod)}
                                    </TableCell>
                                    <TableCell>{expense?.enabled ? 'Yes' : 'No'}</TableCell>
                                    <TableCell>
                                      <ul>
                                        {expense?.currencies?.map((item, i) => (
                                          <li key={i}>{item}</li>
                                        ))}
                                      </ul>
                                    </TableCell>
                                  </TableRow>
                                )
                              })
                            ) : (
                              <TableRow>
                                <TableCell colSpan={10}>
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
                    <Grid item xs={12}>
                      <Typography sx={{ fontSize: '14px', fontWeight: 500, lineHeight: '22px', mb: 2 }}>
                        Stages:
                      </Typography>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Entity</TableCell>
                              <TableCell>Stage Name</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Next Stage</TableCell>
                              <TableCell>First Stage</TableCell>
                              <TableCell>Delivery Stage</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedPurchaseSettings?.purchaseModuleStages?.map((stage, index) => (
                              <TableRow key={index}>
                                <TableCell>{stage.entity}</TableCell>
                                <TableCell>{stage.stageName}</TableCell>
                                <TableCell sx={{ textTransform: 'capitalize' }}>{toTitleCase(stage.status)}</TableCell>
                                <TableCell>{stage.nextStage}</TableCell>
                                <TableCell>{stage.firstStage ? 'Yes' : null}</TableCell>
                                <TableCell>{stage.deliveryStage}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography sx={{ fontSize: '14px', fontWeight: 500, lineHeight: '22px', mb: 2 }}>
                        Stage Events :
                      </Typography>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Entity</TableCell>
                              <TableCell>Stage Name</TableCell>
                              <TableCell>Payable Components</TableCell>
                              <TableCell>actions</TableCell>
                              <TableCell>Undo Actions</TableCell>
                              <TableCell>Locked Components</TableCell>
                              <TableCell>Accounting Events</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedPurchaseSettings?.purchaseModuleStageEvents?.map((stage, index) => (
                              <TableRow key={index}>
                                <TableCell>{stage.entity}</TableCell>
                                <TableCell>{stage.stageName}</TableCell>
                                <TableCell>
                                  {stage?.payableComponents?.map((component, i) => (
                                    <div key={i}>
                                      {'->'} {toTitleCase(component.componentName)} (
                                      {toTitleCase(component.componentType)})
                                    </div>
                                  ))}
                                </TableCell>
                                <TableCell>
                                  {stage?.actions?.map((val, i) => (
                                    <div key={i}>
                                      {'->'} {toTitleCase(val.entity)} ({toTitleCase(val.actionName)})
                                    </div>
                                  ))}
                                </TableCell>

                                <TableCell>
                                  {stage?.undoActions?.map((val, i) => (
                                    <div key={i}>
                                      {'->'} {toTitleCase(val.entity)} ({toTitleCase(val.actionName)})
                                    </div>
                                  ))}
                                </TableCell>

                                <TableCell>
                                  {stage?.lockedComponents?.map((component, i) => (
                                    <div key={i}>
                                      {'->'} {toTitleCase(component)}
                                    </div>
                                  ))}
                                </TableCell>
                                <TableCell>{stage.accountingEvents}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>{' '}
                      </TableContainer>
                    </Grid>
                    <Grid item xs={12}>
                      <Divider />
                    </Grid>
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
                            <TableCell>
                              <Typography className='data-name'>
                                Shipping Currency : {selectedPurchaseSettings?.shipmentCurrency}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography sx={{ fontSize: '14px', fontWeight: 500, lineHeight: '22px', mb: 2 }}>
                        Shipping Taxes:
                      </Typography>
                      <TableContainer>
                        <Table
                          sx={{
                            // border: '1px solid #D7D7D7',
                            '& .MuiTableHead-root': {
                              textTransform: 'capitalize'
                            },
                            '& .MuiTableCell-root': {
                              borderBottom: '1px dashed #D8D8D8'
                            },

                            '& .MuiTableCell-root:first-of-type': {
                              pl: '8px !important'
                            },
                            '& .MuiTableCell-root:last-of-type': {
                              pr: '8px !important'
                            }
                          }}
                        >
                          <TableHead sx={{ bgcolor: 'rgba(248, 250, 254, 1)' }}>
                            <TableRow>
                              <TableCell style={{ width: '10%' }}>Tax Type</TableCell>
                              <TableCell style={{ width: '10%' }}>Tax Name</TableCell>
                              <TableCell style={{ width: '6%' }}>Paid To TaxAuthority</TableCell>
                              <TableCell style={{ width: '6%' }}>Tax Authority</TableCell>
                              <TableCell style={{ width: '6%' }}>Paid To Vendor</TableCell>
                              <TableCell style={{ width: '8%' }}>Vendor</TableCell>
                              <TableCell style={{ width: '10%' }}>Eligible For Tax Credit</TableCell>
                              <TableCell style={{ width: '10%' }}>Distribution Method</TableCell>
                              <TableCell style={{ width: '6%' }}>In Local Currency</TableCell>
                              <TableCell style={{ width: '2%' }}>Enabled</TableCell>
                              <TableCell style={{ width: '2%' }}>Currencies</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {shipmentTaxes?.length > 0 ? (
                              shipmentTaxes?.map((tax, index) => {
                                const vendor = vendors?.find(item => item?.vendorId === tax.vendorId)

                                return (
                                  <TableRow key={index}>
                                    <TableCell>{tax?.taxType}</TableCell>
                                    <TableCell>{tax?.taxName}</TableCell>
                                    <TableCell>{tax?.paidToTaxAuthority ? 'Yes' : 'No'}</TableCell>
                                    <TableCell>
                                      {
                                        taxAuthorities?.find(item => item?.taxAuthorityId === tax?.taxAuthorityId)
                                          ?.taxAuthorityName
                                      }
                                    </TableCell>
                                    <TableCell>{tax?.paidToVendor ? 'Yes' : 'No'}</TableCell>
                                    <TableCell>{vendor?.displayName}</TableCell>
                                    <TableCell>{tax?.eligibleForTaxCredit ? 'Yes' : 'No'}</TableCell>
                                    <TableCell> {toTitleCase(tax?.distributionMethod)}</TableCell>
                                    <TableCell>{tax?.inLocalCurrency ? 'Yes' : 'No'}</TableCell>
                                    <TableCell>{tax?.enabled ? 'Yes' : 'No'}</TableCell>
                                    <TableCell>
                                      <ul>
                                        {tax?.currencies?.map((item, i) => (
                                          <li key={i}>{item}</li>
                                        ))}
                                      </ul>
                                    </TableCell>
                                  </TableRow>
                                )
                              })
                            ) : (
                              <TableRow>
                                <TableCell colSpan={11}>
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
                    <Grid item xs={12}>
                      <Typography sx={{ fontSize: '14px', fontWeight: 500, lineHeight: '22px', mb: 2 }}>
                        Shipping Expenses:
                      </Typography>
                      <TableContainer>
                        <Table>
                          <TableHead sx={{ bgcolor: 'rgba(248, 250, 254, 1)' }}>
                            <TableRow>
                              <TableCell style={{ width: '15%' }}>Expense Type</TableCell>
                              <TableCell style={{ width: '15%' }}>Expense Name</TableCell>
                              <TableCell style={{ width: '15%' }}>Vendor</TableCell>
                              <TableCell style={{ width: '10%' }}>Paid To Main Vendor</TableCell>
                              <TableCell style={{ width: '10%' }}>Additional Taxes</TableCell>
                              <TableCell style={{ width: '10%' }}>Eligible For Tax Credit</TableCell>
                              <TableCell style={{ width: '10%' }}>In Local Currency</TableCell>
                              <TableCell style={{ width: '10%' }}>Distribution Method</TableCell>
                              <TableCell style={{ width: '5%' }}>Enabled</TableCell>
                              <TableCell style={{ width: '2%' }}>Currencies</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {shipmentExpenses?.length > 0 ? (
                              shipmentExpenses?.map((expense, index) => {
                                const vendor = vendors?.find(item => item?.vendorId === expense.vendorId)
                                return (
                                  <TableRow key={index}>
                                    <TableCell>{expense.expenseType}</TableCell>
                                    <TableCell>{expense.expenseName}</TableCell>
                                    <TableCell>{vendor?.displayName}</TableCell>
                                    <TableCell>{expense?.paidToMainVendor ? 'Yes' : 'No'}</TableCell>
                                    <TableCell>{expense?.additionalTaxes ? 'Yes' : 'No'}</TableCell>
                                    <TableCell>{expense?.eligibleForTaxCredit ? 'Yes' : 'No'}</TableCell>
                                    <TableCell>{expense?.inLocalCurrency ? 'Yes' : 'No'}</TableCell>
                                    <TableCell sx={{ textTransform: 'capitalize' }}>
                                      {toTitleCase(expense?.distributionMethod)}
                                    </TableCell>
                                    <TableCell>{expense?.enabled ? 'Yes' : 'No'}</TableCell>
                                    <TableCell>
                                      <ul>
                                        {expense?.currencies?.map((item, i) => (
                                          <li key={i}>{item}</li>
                                        ))}
                                      </ul>
                                    </TableCell>
                                  </TableRow>
                                )
                              })
                            ) : (
                              <TableRow>
                                <TableCell colSpan={10}>
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
          </>
        )}
      </PageWrapper>
    </>
  )
}
