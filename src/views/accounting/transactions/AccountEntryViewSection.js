import { useMemo } from 'react'
import { Table, TableBody, TableCell, TableRow, Typography, TableHead, Grid, Card, TableContainer } from '@mui/material'
import {
  dataTextStyles,
  dataTitleStyles,
  DateFunction,
  NumberFormat,
  rowStatusChip,
  toTitleCase
} from 'src/common-functions/utils/UtilityFunctions'
import { CommonViewTable } from 'src/common-components/CommonPdfDesign'
import MobileDataGrid from 'src/common-components/MobileDataGrid'
import CustomNoRowsOverlay from 'src/common-components/CustomNoRowsOverlay'
import { Box } from '@mui/system'

function AccountEntryViewSection({ transactionNo, accountsData }) {
  const { accountTransactions = [], currencies = [], accounts = [] } = accountsData

  const selectedAccountEntry = useMemo(
    () => accountTransactions?.find(val => val.transactionNo === transactionNo || '') || {},
    [accountTransactions, transactionNo]
  )

  const currency = currencies?.find(item => item?.currencyId === selectedAccountEntry?.currency) || {}

  const accountColumns = [
    {
      field: 'accountInfo',
      headerName: '',
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => {
        return (
          <Box sx={{ width: '100%', p: 2 }}>
            <Grid container spacing={3} sx={{ alignItems: 'center' }}>
              <Grid item xs={12} sm={2} md={1} lg={1} xl={1}>
                <Typography sx={dataTextStyles}>#{row.index + 1}</Typography>
              </Grid>
              <Grid item xs={12} sm={4} md={5} lg={5} xl={5}>
                <Typography sx={dataTextStyles}>{row?.accountName || '-'}</Typography>
                <Typography sx={dataTitleStyles}>Account</Typography>
              </Grid>
              <Grid item xs={12} sm={2} md={2} lg={2} xl={2}>
                <Typography sx={dataTextStyles}>{row?.accountType || '-'}</Typography>
                <Typography sx={dataTitleStyles}>Account Type</Typography>
              </Grid>
              <Grid item xs={12} sm={2} md={2} lg={2} xl={2}>
                <Typography sx={dataTextStyles}>{toTitleCase(row?.effect) || '-'}</Typography>
                <Typography sx={dataTitleStyles}>Type</Typography>
              </Grid>
              <Grid item xs={12} sm={2} md={2} lg={2} xl={2}>
                <Typography sx={dataTextStyles}>{row?.amount || '-'}</Typography>
                <Typography sx={dataTitleStyles}>Amount</Typography>
              </Grid>
            </Grid>
          </Box>
        )
      }
    }
  ]

  return (
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
                        #{selectedAccountEntry?.transactionNo}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2}>{rowStatusChip(selectedAccountEntry?.status)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Typography className='data-name'>
                        Transaction Date : {DateFunction(selectedAccountEntry?.transactionDate)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Typography className='data-name'>Reference : {selectedAccountEntry?.reference}</Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Typography className='data-name'>
                        {selectedAccountEntry?.description && `Description: ${selectedAccountEntry?.description}`}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Typography className='data-name'>
                        {selectedAccountEntry?.notes && `Notes: ${selectedAccountEntry?.notes}`}
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
                          <NumberFormat value={selectedAccountEntry?.amount} currency={currency} />{' '}
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
              <Typography sx={{ fontSize: '15px', fontWeight: 500, textAlign: 'left', mb: 3 }}>Entries</Typography>
            </Grid>
            <Grid item xs={12} sm={12}>
              <MobileDataGrid
                rows={
                  selectedAccountEntry?.entries?.map((item, index) => ({
                    index,
                    accountName: accounts?.find(val => val?.accountId === item?.accountId)?.accountName,
                    accountType: item?.accountType,
                    effect: item?.effect,
                    amount: item?.amount
                  })) || []
                }
                columns={accountColumns}
                getRowId={row => row.index}
                initialState={{
                  sorting: {
                    sortModel: [{ field: 'index', sort: 'asc' }]
                  }
                }}
                slots={{
                  columnHeaders: () => null,
                  noRowsOverlay: CustomNoRowsOverlay
                }}
                slotProps={{
                  noRowsOverlay: {
                    mainText: 'No Account Entries',
                    subText: 'No account entries available.'
                  }
                }}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Card>
  )
}

export default AccountEntryViewSection
