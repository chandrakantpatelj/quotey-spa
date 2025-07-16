// ** Next Import
import Link from 'next/link'
import Router from 'next/router'
import React, { useEffect } from 'react'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import { Box, Button, IconButton, Table, TableBody, TableCell, TableRow, Typography, Grid, Card } from '@mui/material'
import Icon from 'src/@core/components/icon'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import { useDispatch, useSelector } from 'react-redux'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { Close } from '@mui/icons-material'
import { useMemo } from 'react'

import { hasPermission, NumberFormat } from 'src/common-functions/utils/UtilityFunctions'

import { setSelectedExpense } from 'src/store/apps/expenses'
import { CREATE_EXPENSE, EDIT_EXPENSE } from 'src/common-functions/utils/Constants'
import usePaymentMethods from 'src/hooks/getData/usePaymentMethods'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import useExpenses from 'src/hooks/getData/useExpenses'
import useGeneralExpenseType from 'src/hooks/getData/useGeneralExpenseType'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'
import AttachmentTabExpense from './AttachmentTabExpense'

export default function ViewExpense() {
  const route = Router
  const dispatch = useDispatch()
  const tenant = useSelector(state => state.tenants?.selectedTenant)
  const { tenantId = '' } = tenant
  const { currencies } = useCurrencies()
  const { paymentMethods } = usePaymentMethods(tenantId)

  const [tab, setTab] = React.useState('overview')
  const { expenses } = useExpenses(tenantId)
  const selectedExpense = useSelector(state => state?.expenses?.selectedExpense)
  const { generalExpenseTypes } = useGeneralExpenseType(tenantId)
  const userProfile = useSelector(state => state.userProfile)

  const currency = useMemo(
    () =>
      currencies?.find(item => {
        return item?.currencyId === selectedExpense?.currency
      }) || {},
    [selectedExpense, currencies]
  )
  const expenseTypeObj = useMemo(
    () =>
      generalExpenseTypes?.find(item => {
        return item?.expenseTypeId === selectedExpense?.expenseType
      }) || {},
    [selectedExpense, generalExpenseTypes]
  )
  const paymentMethodObj = useMemo(
    () =>
      paymentMethods?.find(item => {
        return item?.paymentMethodId === selectedExpense?.paymentMethod
      }) || {},
    [selectedExpense, paymentMethods]
  )

  useEffect(() => {
    if (Object.keys(selectedExpense).length === 0) {
      route.push('/accounting/expenses/')
    }
  }, [selectedExpense, tenantId])

  const handleTabChange = (event, newValue) => {
    setTab(newValue)
  }

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
            View Expense - {selectedExpense?.expenseNo}
          </Typography>
        }
        button={
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            {hasPermission(userProfile, CREATE_EXPENSE) && (
              <Button
                variant='contained'
                color='primary'
                sx={{ display: { xs: 'none', sm: 'flex' } }}
                startIcon={<AddOutlinedIcon />}
                component={Link}
                scroll={true}
                href={`/accounting/expenses/add`}
              >
                Add New
              </Button>
            )}
            {hasPermission(userProfile, EDIT_EXPENSE) && (
              <IconButton
                variant='outlined'
                sx={{ fontSize: '21px' }}
                component={Link}
                scroll={true}
                href={`/accounting/expenses/edit/${selectedExpense.expenseId}`}
                onClick={() => dispatch(setSelectedExpense(selectedExpense))}
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
              href='/accounting/expenses/'
            >
              <Close sx={{ color: theme => theme.palette.primary.main }} />
            </IconButton>
          </Box>
        }
      />
      <PageWrapper>
        <Grid container spacing={{ xs: 5, xl: 10 }}>
          <Grid item xs={12}>
            <Grid item xs={12} sm={6} md={6} lg={4} xl={4}>
              <CustomAutocomplete
                options={expenses || []}
                getOptionLabel={option => `${option.expenseNoPrefix || ''}${option.expenseNo || ''}`}
                value={expenses.find(option => option.expenseId === selectedExpense.expenseId) || null}
                onChange={(e, newValue) => {
                  dispatch(setSelectedExpense(newValue))
                }}
                disableClearable
                renderInput={params => <CustomTextField {...params} fullWidth label='Expenses' />}
              />
            </Grid>
          </Grid>
          <Grid item xs={12} md={8} lg={8} xl={8.5}>
            <TabContext value={tab}>
              <TabList
                textColor='inherit'
                allowScrollButtonsMobile={true}
                onChange={handleTabChange}
                scrollButtons={'auto'}
                aria-label='lab API tabs example'
              >
                <Tab label='Overview' value='overview' />
                <Tab label='Attachments' value='attachments' />
              </TabList>

              <TabPanel
                value='overview'
                sx={{
                  p: { xs: '10px 0px !important', md: '15px !important' }
                }}
              >
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
                              #{selectedExpense?.expenseNoPrefix}
                              {selectedExpense?.expenseNo}
                            </Typography>
                          </TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell>
                            <Typography className='data-name'>
                              Expense Type: {expenseTypeObj?.expenseType || ''}
                            </Typography>
                          </TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell>
                            <Typography className='data-name'>Description: {selectedExpense?.description}</Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Typography className='data-name'>Notes: {selectedExpense?.notes}</Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Typography className='data-name'>
                              Payment Method: {paymentMethodObj?.paymentMethod || ''}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Typography className='data-name'>
                              Amount: <NumberFormat value={selectedExpense?.amount} currency={currency} />
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Grid>
                </Card>
              </TabPanel>
              <TabPanel
                value='attachments'
                sx={{
                  p: { xs: '10px !important', md: '15px !important' }
                }}
              >
                <AttachmentTabExpense expense={selectedExpense} folderName={'generalExpense'} />
              </TabPanel>
            </TabContext>
          </Grid>
        </Grid>
      </PageWrapper>
    </React.Fragment>
  )
}
