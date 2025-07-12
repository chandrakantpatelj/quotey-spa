import {
  Alert,
  Card,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material'
import { useSelector } from 'react-redux'
import CustomCloseButton from './CustomCloseButton'
import { useEffect, useMemo, useState } from 'react'
import Icon from 'src/@core/components/icon'
import { DateFunction, NumberFormat, rowStatusChip, toTitleCase } from 'src/common-functions/utils/UtilityFunctions'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import useAccountTransactions from 'src/hooks/getData/useAccountTransactions'
import { getAccountEntryQuery } from 'src/@core/components/graphql/account-transaction-queries'
import { CommonViewTable } from './CommonPdfDesign'
import { useFinancialAccounts } from 'src/hooks/getData/useFinancialAccounts'

function CommonAccountEntryPopUp({ transactionId, open, setClose }) {
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId) || ''
  const { accountTransactions } = useAccountTransactions(tenantId)
  const theme = useTheme()
  const { financialAccounts } = useFinancialAccounts(tenantId)

  const isLargeScreen = useMediaQuery(theme.breakpoints.up('xl'))

  const { currencies } = useCurrencies()
  const [accountEntry, setAccountEntry] = useState(null)
  const [loading, setLoading] = useState(true)
  console.log('accountEntry', accountEntry)
  const currency = useMemo(
    () => currencies?.find(item => item?.currencyId === accountEntry?.currency) || {},
    [currencies, accountEntry?.currency] // ✅ Fixed dependency array
  )
  console.log('currency', currency)

  const getAccountTransactionObject = async () => {
    setLoading(true)

    const payment = accountTransactions?.find(item => item?.transactionId === transactionId)
    if (payment) {
      setAccountEntry(payment)
      setLoading(false)
      return
    }

    try {
      const response = await fetchData(getAccountEntryQuery(tenantId, transactionId))
      if (response.getAccountEntry) {
        setAccountEntry(response.getAccountEntry || null)
      }
    } catch (e) {
      console.error('Error fetching payment:', e)
      setAccountEntry(null)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    getAccountTransactionObject()
  }, [accountTransactions, tenantId, transactionId])

  const handleClose = () => {
    setClose(false)
  }

  return (
    <Dialog
      open={open}
      disableEscapeKeyDown
      maxWidth='xl'
      fullWidth={true}
      scroll='paper'
      aria-labelledby='alert-dialog-title'
      aria-describedby='alert-dialog-description'
      onClose={(event, reason) => {
        handleClose()
      }}
      sx={{
        '& .MuiDialog-paper': {
          overflow: 'visible',
          p: '20px 0px !important',
          height: '100%',
          verticalAlign: 'top'
        }
      }}
    >
      <DialogTitle id='alert-dialog-title'>
        <Alert severity='info' sx={{ color: 'rgba(0,0,0,0.8)' }}>
          Invoice Payment Details
        </Alert>
      </DialogTitle>

      <DialogContent sx={{ py: 8 }}>
        <CustomCloseButton onClick={handleClose}>
          <Icon icon='tabler:x' fontSize='1.25rem' />
        </CustomCloseButton>

        {loading ? (
          <LinearProgress />
        ) : accountEntry ? (
          <Card sx={{ p: 6 }}>
            <Grid container spacing={8}>
              <Grid item xs={12} sm={12}>
                <Grid container spacing={{ xs: 3, md: 4 }} sx={{ display: 'flex', justifyContent: 'space-between' }}>
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
                              #{accountEntry?.transactionNo}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={2}>{rowStatusChip(accountEntry?.status)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Typography className='data-name'>
                              Transaction Date : {DateFunction(accountEntry?.transactionDate)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Typography className='data-name'>Reference : {accountEntry?.reference}</Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Typography className='data-name'>
                              {accountEntry?.description && `Description: ${accountEntry?.description}`}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Typography className='data-name'>
                              {accountEntry?.notes && `Notes: ${accountEntry?.notes}`}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Typography
                              sx={{
                                fontSize: '13px',
                                fontWeight: 500,
                                // color: '#667380',
                                lineHeight: '22px',
                                my: 2
                              }}
                            >
                              Amount:{' '}
                              <span style={{ fontSize: '14px' }}>
                                <NumberFormat value={accountEntry?.amount} currency={currency} />{' '}
                              </span>
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </CommonViewTable>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={12}>
                <Grid container spacing={{ xs: 3, md: 4 }}>
                  <Grid item xs={12} sm={12}>
                    <Typography sx={{ fontSize: '15px', fontWeight: 500, textAlign: 'left', mb: 3 }}>
                      Entries
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <TableContainer>
                      <Table
                        size='small'
                        sx={{
                          '& .MuiTableHead-root': {
                            textTransform: 'capitalize'
                          },
                          '& .MuiTableCell-root': {
                            borderBottom: '1px dashed #D8D8D8'
                          },
                          '& .MuiTableCell-root:first-of-type': {
                            pl: '6px !important'
                          },
                          '& .MuiTableCell-root:last-of-type': {
                            textAlign: 'right',
                            pr: '6px !important'
                          }
                        }}
                      >
                        <TableHead sx={{ bgcolor: 'rgba(248, 250, 254, 1)' }}>
                          <TableRow>
                            <TableCell style={{ width: '5%' }}>#</TableCell>
                            <TableCell style={{ width: '50%' }}>Account</TableCell>
                            <TableCell style={{ width: '20%' }}>Account Type</TableCell>
                            <TableCell style={{ width: '10%' }}>Type</TableCell>
                            <TableCell>Amount</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {accountEntry?.entries?.map((item, index) => {
                            const account = financialAccounts?.find(val => val?.accountId === item?.accountId)
                            return (
                              <TableRow key={index}>
                                <TableCell align='left'>{index + 1}</TableCell>
                                <TableCell align='left'>{account?.accountName}</TableCell>
                                <TableCell align='left'>{item?.accountType}</TableCell>
                                <TableCell align='right'>{toTitleCase(item?.effect)}</TableCell>
                                <TableCell align='right'>
                                  <NumberFormat value={item?.amount} currency={currency} />
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Card>
        ) : (
          <Card sx={{ p: 6 }}>
            <Typography
              sx={{
                textAlign: 'center',
                fontSize: '16px',
                fontWeight: '500',
                color: '#FF0000'
              }}
            >
              Transaction Not Found / Deleted
            </Typography>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default CommonAccountEntryPopUp
