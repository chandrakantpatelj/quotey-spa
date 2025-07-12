import Router from 'next/router'
import { useEffect, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  TableHead,
  Grid,
  Card,
  TableContainer,
  Divider
} from '@mui/material'
import { useSelector } from 'react-redux'
import {
  dataTextStyles,
  dataTitleStyles,
  DateFunction,
  NumberFormat,
  rowStatusChip
} from 'src/common-functions/utils/UtilityFunctions'
import { CommonViewTable } from 'src/common-components/CommonPdfDesign'
import useTaxStatements from 'src/hooks/getData/useTaxStatements'
import MobileDataGrid from 'src/common-components/MobileDataGrid'
import CustomNoRowsOverlay from 'src/common-components/CustomNoRowsOverlay'
import { Box } from '@mui/system'

function TaxStatementViewSection({ taxStatementId, taxStatementData }) {
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId)
  const { taxStatements, loading } = useTaxStatements(tenantId)
  const taxStatement = useMemo(
    () => taxStatements?.find(val => val.statementId === taxStatementId || '') || {},
    [taxStatements, taxStatementId]
  )

  //   const taxStatement = useSelector(state => state?.taxStatements?.taxStatement) || {}

  const { taxAuthorities = [], currencies = [], accounts = [] } = taxStatementData

  const liableAccounts = taxStatement?.taxStatementAccounts?.filter(val => val?.accountType === 'Liability')
  const assetAccounts = taxStatement?.taxStatementAccounts?.filter(
    val => val?.accountType === 'Asset' || val?.accountType === 'Expense'
  )

  const currency = currencies?.find(item => item?.currencyId === taxStatement?.currency) || {}
  const taxAuthColumns = [
    {
      field: 'accountInfo',
      headerName: '',
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => {
        return (
          <Box sx={{ width: '100%', p: 2 }}>
            <Grid container spacing={3} sx={{ alignItems: 'center', flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
              <Grid item xs={12} sm={1} md={1} lg={1} xl={1}>
                <Typography sx={dataTextStyles}>{row.index + 1}</Typography>
                <Typography sx={dataTitleStyles}>#</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
                <Typography sx={dataTextStyles}>{row?.accountName || '-'}</Typography>
                <Typography sx={{ fontSize: '12px', color: '#818181' }}>{row?.statementDescription || '-'}</Typography>
                <Typography sx={dataTitleStyles}>Account</Typography>
              </Grid>
              <Grid item xs={12} sm={2} md={2} lg={2} xl={2}>
                <Typography sx={dataTextStyles}>{row?.statementLabel || '-'}</Typography>
                <Typography sx={dataTitleStyles}>Label</Typography>
              </Grid>
              <Grid item xs={12} sm={3} md={3} lg={3} xl={3}>
                <Typography sx={dataTextStyles}>{row?.amount || '-'}</Typography>
                <Typography sx={dataTitleStyles}>Amount</Typography>
              </Grid>
            </Grid>
          </Box>
        )
      }
    }
  ]
  const liabilityColumns = [
    {
      field: 'accountInfo',
      headerName: '',
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => {
        return (
          <Box sx={{ width: '100%', p: 2 }}>
            <Grid container spacing={3} sx={{ alignItems: 'center', flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
              <Grid item xs={12} sm={1} md={1} lg={1} xl={1}>
                <Typography sx={dataTextStyles}>{row.index + 1}</Typography>
                <Typography sx={dataTitleStyles}>#</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
                <Typography sx={dataTextStyles}>{row?.accountName || '-'}</Typography>
                <Typography sx={{ fontSize: '12px', color: '#818181' }}>{row?.statementDescription || '-'}</Typography>
                <Typography sx={dataTitleStyles}>Account</Typography>
              </Grid>
              <Grid item xs={12} sm={2} md={2} lg={2} xl={2}>
                <Typography sx={dataTextStyles}>{row?.statementLabel || '-'}</Typography>
                <Typography sx={dataTitleStyles}>Label</Typography>
              </Grid>
              <Grid item xs={12} sm={3} md={3} lg={3} xl={3}>
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
            <Grid item xs={12} md={6}>
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
                        #{taxStatement?.statementNo}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2}>{rowStatusChip(taxStatement?.status)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Typography className='data-name'>
                        Tax Authority:{' '}
                        {
                          taxAuthorities?.find(val => val?.taxAuthorityId === taxStatement?.taxAuthorityId)
                            ?.taxAuthorityName
                        }
                      </Typography>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>
                      <Typography className='data-name'>Statement Method : {taxStatement?.statementMethod}</Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Typography className='data-name'>
                        {taxStatement?.description && `Description: ${taxStatement?.description}`}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </CommonViewTable>
            </Grid>
            <Grid item xs={12} md={4} xl={3}>
              <CommonViewTable>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Typography className='data-name'>
                        Period StartDate : {DateFunction(taxStatement?.periodStartDate)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Typography className='data-name'>
                        Period EndDate : {DateFunction(taxStatement?.periodEndDate)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Typography className='data-name'>
                        Statement Date : {DateFunction(taxStatement?.statementDate)}
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
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 500,
                  lineHeight: '33px',
                  background: '#80808028',
                  px: '12px'
                }}
              >
                Summary of Amounts
              </Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={5.85} lg={5.85} xl={5.85}>
              <Typography
                sx={{
                  fontSize: '13px',
                  fontWeight: 500,
                  mb: 4,
                  fontStyle: 'italic',
                  color: 'text.secondary'
                }}
              >
                Summary of amounts you owes to tax authority
              </Typography>
              <TableContainer>
                <MobileDataGrid
                  rows={
                    liableAccounts?.map((item, index) => ({
                      index,
                      accountName: accounts?.find(val => val?.accountId === item?.accountId)?.accountName,
                      statementDescription: item?.statementDescription,
                      statementLabel: item?.statementLabel,
                      amount: item?.amount
                    })) || []
                  }
                  columns={liabilityColumns}
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
              </TableContainer>
            </Grid>
            <Grid item xl={0.3} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Divider orientation='vertical' flexItem sx={{ opacity: '0.6' }} />
            </Grid>
            <Grid item xs={12} sm={12} md={5.85} lg={5.85} xl={5.85}>
              <Typography
                sx={{
                  fontSize: '13px',
                  fontWeight: 500,
                  mb: 4,
                  color: 'text.secondary',
                  fontStyle: 'italic',
                  lineHeight: '22px'
                }}
              >
                Summary of amounts tax authority owes to you
              </Typography>
              <TableContainer>
                <MobileDataGrid
                  rows={
                    assetAccounts?.map((item, index) => ({
                      index,
                      accountName: accounts?.find(val => val?.accountId === item?.accountId)?.accountName,
                      statementDescription: item?.statementDescription,
                      statementLabel: item?.statementLabel,
                      amount: item?.amount
                    })) || []
                  }
                  columns={taxAuthColumns}
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
              </TableContainer>
            </Grid>
            <Grid item xs={12} sm={12}>
              <Typography
                sx={{
                  fontSize: '13px',
                  fontWeight: 500,
                  // color: '#667380',
                  lineHeight: '22px',
                  textAlign: 'end',
                  my: 2
                }}
              >
                Net amount for this statement :{' '}
                <span style={{ fontSize: '14px' }}>
                  <NumberFormat value={taxStatement?.netStatementAmount} currency={currency} />{' '}
                </span>
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <CommonViewTable>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Typography className='data-name' sx={{ lineHeight: '23px' }}>
                    {taxStatement?.notes && `Notes: ${taxStatement?.notes}`}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </CommonViewTable>
        </Grid>
      </Grid>
    </Card>
  )
}

export default TaxStatementViewSection
