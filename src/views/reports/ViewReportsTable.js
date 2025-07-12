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
  Card,
  Grid
} from '@mui/material'
import { useReactToPrint } from 'react-to-print'
import { PictureAsPdf as PictureAsPdfIcon, Print } from '@mui/icons-material'
import useCurrencies from 'src/hooks/getData/useCurrencies'

const ViewReportsTable = ({ filteredAccounts, startDate, endDate }) => {
  const selectedtenant = useSelector(state => state.tenants?.selectedTenant)
  const currency = useSelector(state => state?.currencies?.selectedCurrency)
  const componentRef = useRef(null)
  const { currencies } = useCurrencies()

  const handlePrint = useReactToPrint({
    content: () => componentRef.current
  })

  const CommonTable = ({ rows }) => {
    return (
      <div>
        {/* Render a separate table for each currency */}
        {rows?.map((group, groupIndex) => {
          const matchedCurrency = currencies.find(curr => curr.currencyId === group.currency)

          // Calculate Net Profit for Currency
          const incomeForCurrency = group.accountTypes
            .flatMap(typeGroup => typeGroup.accounts.filter(acc => acc.accountType === 'Income'))
            .reduce((sum, acc) => sum + acc.totalAmount, 0)

          const expenseForCurrency = group.accountTypes
            .flatMap(typeGroup => typeGroup.accounts.filter(acc => acc.accountType === 'Expense'))
            .reduce((sum, acc) => sum + acc.totalAmount, 0)

          const netProfitForCurrency = incomeForCurrency - expenseForCurrency

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
                        Subtotal
                      </TableCell>
                    </TableRow>

                    {/* Accounts within each Account Type */}
                    {typeGroup.accounts.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.accountName}</TableCell>
                        <TableCell>
                          {matchedCurrency?.symbol} {item.totalAmount}
                        </TableCell>
                      </TableRow>
                    ))}

                    {/* Subtotal for Account Type */}
                    <TableRow>
                      <TableCell sx={{ fontWeight: 500 }}>Total {typeGroup.accountType}:</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {matchedCurrency?.symbol} {typeGroup.accounts.reduce((sum, acc) => sum + acc.totalAmount, 0)}
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}

                {/* Net Profit for Currency */}
                <TableRow>
                  <TableCell sx={{ fontWeight: 500 }}>Net Profit ({group.currency}):</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>
                    {matchedCurrency?.symbol} {netProfitForCurrency}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )
        })}
      </div>
    )
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
      <Card sx={{ p: 0, maxWidth: '900px', width: '100%' }}>
        <Box component={'div'} ref={componentRef} sx={{ p: 8 }}>
          <Box sx={{ mb: 10 }}>
            <Typography variant='h4' align='center' gutterBottom>
              {selectedtenant?.displayName}
            </Typography>
            <Typography variant='h6' align='center' sx={{ color: '#959595' }}>
              {'Profit and Loss: '} {startDate}-{endDate}
            </Typography>
          </Box>
          <Box sx={{ mb: 6 }}>
            <Grid container spacing={{ xs: 3, nd: 4 }}>
              <Grid item xs={12} sm={12}>
                <CommonTable rows={filteredAccounts} />
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Card>
      <IconButton color='primary' onClick={handlePrint}>
        <Print />
      </IconButton>
    </Box>
  )
}

export default ViewReportsTable
