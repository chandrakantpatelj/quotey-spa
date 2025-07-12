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
  Card,
  Box,
  LinearProgress,
  IconButton,
  TableHead
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import { useDispatch, useSelector } from 'react-redux'
import { AddOutlined, Close } from '@mui/icons-material'
import Link from 'next/link'
import { setSelectedTaxSetting } from 'src/store/apps/tax-settings'
import { EDIT_TAX_SETTING } from 'src/common-functions/utils/Constants'
import { hasPermission } from 'src/common-functions/utils/UtilityFunctions'
import useTaxAuthorities from 'src/hooks/getData/useTaxAuthorities'
import { useFinancialAccounts } from 'src/hooks/getData/useFinancialAccounts'
import Router from 'next/router'
import { useEffect } from 'react'

export default function ViewTaxModuleSettings() {
  const route = Router

  const dispatch = useDispatch()
  const selectedTaxSetting = useSelector(state => state.taxSettings?.selectedTaxSetting || {})
  const tenantId = useSelector(state => state?.tenants?.selectedTenant?.tenantId || null)
  const { financialAccounts, financialAccountloading } = useFinancialAccounts(tenantId)
  const loading = financialAccountloading
  const { taxAuthorities } = useTaxAuthorities(tenantId)

  const userProfile = useSelector(state => state.userProfile)
  useEffect(() => {
    if (Object.keys(selectedTaxSetting).length === 0) {
      route.push('/account-settings/tax-settings/')
    }
  }, [selectedTaxSetting, tenantId])
  const {
    taxAuthorityId = '',
    taxAccountingMethod = '',
    taxStatementAccounts = [],
    accountPayableAccountId = '',
    differedTaxAccountId = '',
    salesRevenueAccountId = '',
    costOfGoodsSoldAccountId = ''
  } = selectedTaxSetting || {}

  const getAccountName = accountId => {
    const accountData = financialAccounts.find(account => account.accountId === accountId) || {}
    return accountData?.accountName || '-'
  }

  const getTaxAuthorityName = taxAuthorityId => {
    const authority = taxAuthorities?.find(auth => auth.taxAuthorityId === taxAuthorityId) || {}
    return authority?.taxAuthorityName || '-'
  }

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
            View Tax Module Settings
          </Typography>
        }
        button={
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            {hasPermission(userProfile, EDIT_TAX_SETTING) && (
              <Button
                variant='contained'
                color='primary'
                startIcon={<AddOutlined />}
                sx={{ display: { xs: 'none', sm: 'flex' } }}
                component={Link}
                scroll={true}
                href={`/account-settings/tax-settings/add`}
              >
                New
              </Button>
            )}
            {hasPermission(userProfile, EDIT_TAX_SETTING) && (
              <IconButton
                variant='outlined'
                sx={{ fontSize: '21px' }}
                component={Link}
                scroll={true}
                href={`/account-settings/tax-settings/edit/${selectedTaxSetting?.taxAuthorityId}`}
                onClick={() => dispatch(setSelectedTaxSetting(selectedTaxSetting))}
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
              href={`/account-settings/tax-settings`}
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
              <Grid item xs={12} md={12} lg={12} xl={12}>
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
                                Tax Authority: {getTaxAuthorityName(taxAuthorityId)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <Typography className='data-name'>
                                Tax Accounting Method: {taxAccountingMethod}
                              </Typography>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <Typography className='data-name'>
                                Payable Account: {getAccountName(accountPayableAccountId)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <Typography className='data-name'>
                                Differed Tax Account: {getAccountName(differedTaxAccountId)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <Typography className='data-name'>
                                Sales Revenue Account: {getAccountName(salesRevenueAccountId)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <Typography className='data-name'>
                                Cost of Goods Sold Account: {getAccountName(costOfGoodsSoldAccountId)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </Grid>
                    {/* Tax Statement Accounts */}
                    <Grid item xs={12}>
                      <Typography sx={{ fontSize: '14px', fontWeight: 500, lineHeight: '22px', mb: 2 }}>
                        Tax Statement Accounts:
                      </Typography>
                      <TableContainer>
                        <Table
                          size='small'
                          sx={{
                            '& .MuiTableCell-root': {
                              borderBottom: '1px dashed #D8D8D8'
                            }
                          }}
                        >
                          <TableHead sx={{ bgcolor: 'rgba(248, 250, 254, 1)' }}>
                            <TableRow>
                              <TableCell>Account</TableCell>
                              <TableCell>Account Type</TableCell>
                              <TableCell>Description</TableCell>
                              <TableCell>Statement Label</TableCell>
                              <TableCell>Statement Description</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {taxStatementAccounts?.length > 0 ? (
                              taxStatementAccounts.map((account, index) => {
                                const acName =
                                  financialAccounts.find(option => option.accountId === account.accountId)
                                    ?.accountName || null
                                return (
                                  <TableRow key={index}>
                                    <TableCell>{acName}</TableCell>
                                    <TableCell>{account.accountType}</TableCell>
                                    <TableCell>{account.description}</TableCell>
                                    <TableCell>{account.statementLabel}</TableCell>
                                    <TableCell>{account.statementDescription}</TableCell>
                                  </TableRow>
                                )
                              })
                            ) : (
                              <TableRow>
                                <TableCell colSpan={5}>
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
                                  </Box>
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
