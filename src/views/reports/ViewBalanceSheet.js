import React, { useRef } from 'react'
import { useSelector } from 'react-redux'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Box,
  IconButton,
  Grid,
  Card,
  Divider
} from '@mui/material'
import { useReactToPrint } from 'react-to-print'
import { Print } from '@mui/icons-material'
import useCurrencies from 'src/hooks/getData/useCurrencies'

const ViewBalanceSheet = ({ filteredAccounts, startDate, endDate }) => {
  const selectedtenant = useSelector(state => state.tenants?.selectedTenant)
  const currency = useSelector(state => state?.currencies?.selectedCurrency)
  const componentRef = useRef(null)
  const { currencies } = useCurrencies()

  const handlePrint = useReactToPrint({
    content: () => componentRef.current
  })

  const CommonTable = ({ rows }) => {
    console.log('rows,', rows)

    return (
      <div>
        {rows?.map((group, groupIndex) => {
          const matchedCurrency = currencies.find(curr => curr.currencyId === group.currency)

          const subtotalForCurrency = group.accountTypes.reduce(
            (result, typeGroup) => {
              const typeTotal = typeGroup.accounts.reduce((sum, account) => sum + account.totalAmount, 0)

              if (typeGroup.accountType === 'Liability') {
                result.totalLiabilities += typeTotal
              } else if (typeGroup.accountType === 'Equity') {
                result.totalEquity += typeTotal
              } else if (typeGroup.accountType === 'Income') {
                result.totalIncome += typeTotal
              } else if (typeGroup.accountType === 'Expense') {
                result.totalExpense += typeTotal
              }

              return result
            },
            { totalLiabilities: 0, totalEquity: 0, totalIncome: 0, totalExpense: 0 }
          )

          const currencySubtotal =
            subtotalForCurrency.totalLiabilities +
            subtotalForCurrency.totalEquity +
            (subtotalForCurrency.totalIncome - subtotalForCurrency.totalExpense)

          return (
            <Table
              key={groupIndex}
              size='small'
              border='1'
              sx={{
                borderColor: 'inherit',
                maxWidth: 700,
                width: '100%',
                m: '16px auto',
                '& .MuiTableHead-root': {
                  background: '#F4F6F8'
                },
                '& .MuiTableCell-head': {
                  py: '10px',
                  textTransform: 'capitalize',
                  fontWeight: 500,
                  color: '#667380'
                },
                '& .MuiTableCell-root': {
                  py: '8px',
                  borderBottom: '1px dashed #EBEBEB'
                },
                '& .MuiTableCell-root:last-of-type': {
                  textAlign: 'right'
                },
                '& .MuiTableBody-root .MuiTableRow-root:last-of-type .MuiTableCell-root': {
                  borderBottom: '1px solid #eeeeee'
                }
              }}
            >
              <TableBody>
                {/* Currency Header Row */}
                <TableRow>
                  <TableCell
                    colSpan={2}
                    sx={{
                      fontWeight: 'bold',
                      background: '#f9f9f9',
                      color: '#555',
                      textAlign: 'center'
                    }}
                  >
                    <Typography align='center'>{group.currency}</Typography>
                  </TableCell>
                </TableRow>

                {/* Account Type Groups */}
                {group.accountTypes.map((typeGroup, typeIndex) => (
                  <React.Fragment key={typeIndex}>
                    {/* Account Type Row */}
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: 500,
                          background: '#f0f0f0',
                          color: '#555'
                        }}
                      >
                        {typeGroup.accountType}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 500,
                          background: '#f0f0f0',
                          color: '#555'
                        }}
                      >
                        Total
                      </TableCell>
                    </TableRow>

                    {/* Accounts within each Account Type */}
                    {typeGroup.accounts.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.accountName}</TableCell>
                        <TableCell>
                          {matchedCurrency?.symbol} {(item.totalAmount ?? 0).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))}

                {/* Subtotal for Currency */}
                <TableRow>
                  <TableCell sx={{ fontWeight: 500 }}>
                    Total(Total Liabilities+Total Equity+(Total Income-Total Expense)):
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>
                    {matchedCurrency?.symbol} {(currencySubtotal ?? 0).toFixed(2)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 500 }}>Total Assets:</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>
                    {matchedCurrency?.symbol} {(currencySubtotal ?? 0).toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )
        })}

        {/* Grand Total Table */}
        <Table
          size='small'
          border='1'
          sx={{
            borderColor: 'inherit',
            maxWidth: 700,
            width: '100%',
            m: '16px auto',
            '& .MuiTableHead-root': {
              background: '#F4F6F8'
            },
            '& .MuiTableCell-head': {
              py: '10px',
              textTransform: 'capitalize',
              fontWeight: 500,
              color: '#667380'
            },
            '& .MuiTableCell-root': {
              py: '8px',
              borderBottom: '1px dashed #EBEBEB'
            },
            '& .MuiTableCell-root:last-of-type': {
              textAlign: 'right'
            }
          }}
        ></Table>
      </div>
    )
  }

  function calculateAccountTotal(data) {
    const totalLiabilities = data.reduce(
      (total, group) =>
        total +
        group.accountTypes
          .filter(typeGroup => typeGroup.accountType === 'Liability')
          .reduce((sum, typeGroup) => sum + typeGroup.accounts.reduce((acc, item) => acc + item.totalAmount, 0), 0),
      0
    )

    const totalEquity = data.reduce(
      (total, group) =>
        total +
        group.accountTypes
          .filter(typeGroup => typeGroup.accountType === 'Equity')
          .reduce((sum, typeGroup) => sum + typeGroup.accounts.reduce((acc, item) => acc + item.totalAmount, 0), 0),
      0
    )

    const totalIncome = data.reduce(
      (total, group) =>
        total +
        group.accountTypes
          .filter(typeGroup => typeGroup.accountType === 'Income')
          .reduce((sum, typeGroup) => sum + typeGroup.accounts.reduce((acc, item) => acc + item.totalAmount, 0), 0),
      0
    )

    const totalExpense = data.reduce(
      (total, group) =>
        total +
        group.accountTypes
          .filter(typeGroup => typeGroup.accountType === 'Expense')
          .reduce((sum, typeGroup) => sum + typeGroup.accounts.reduce((acc, item) => acc + item.totalAmount, 0), 0),
      0
    )

    const result = totalLiabilities + totalEquity + (totalIncome - totalExpense)

    return result.toFixed(2)
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
      <Card sx={{ p: 0, maxWidth: '900px', width: '100%' }}>
        <Box component={'div'} ref={componentRef} sx={{ p: 8 }}>
          <Box sx={{ mb: 10 }}>
            <Typography variant='h4' align='center' gutterBottom>
              {selectedtenant?.displayName}
            </Typography>
            <Typography variant='h6' align='center' gutterBottom sx={{ color: '#959595' }}>
              {'Balance Sheet: '} ( {startDate} - {endDate} )
            </Typography>
          </Box>
          <Box sx={{ mb: 6 }}>
            <Grid container spacing={{ xs: 3, md: 4 }}>
              <Grid item xs={12} sm={12}>
                <CommonTable title='Assets' rows={filteredAccounts} />
              </Grid>
            </Grid>
          </Box>
          <Divider />
          {/* <Table
            sx={{
              '& .MuiTableCell-root': {
                width: '50%',
                borderBottom: '0px !important'
              },
              '& .MuiTableCell-root:last-of-type': {
                textAlign: 'right'
              }
            }}
          >
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontSize: '14px', fontWeight: 600 }}>
                  Total:{' '}
                  <span style={{ fontSize: '13px', color: '#959595' }}>(Liability + Equity + (Income - Expense))</span>{' '}
                </TableCell>
                <TableCell sx={{ fontSize: '16px', fontWeight: 600 }}>
                  {currency?.symbol} {calculateAccountTotal(filteredAccounts)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table> */}
        </Box>
      </Card>{' '}
      <IconButton color='primary' onClick={handlePrint}>
        <Print />
      </IconButton>
    </Box>
  )
}

export default ViewBalanceSheet
