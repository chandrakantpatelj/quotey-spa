// ** Next Import
import { useMemo, useState } from 'react'
import { Box, Table, TableBody, TableCell, TableRow, Typography, Grid, Card } from '@mui/material'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import { formatPhoneNumberIntl } from 'react-phone-number-input'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import TransactionTab from './TransactionTab'
import NotesTab from './NotesTab'

export default function VendorViewSection({ vendorId, defaultTab, vendors }) {
  const { currencies } = useCurrencies()
  const vendor = useMemo(() => vendors?.find(item => item?.vendorId === vendorId), [vendorId])
  const preferredShippingVendor = useMemo(
    () => vendors?.find(item => item?.vendorId === vendor.preferredShippingVendorId),
    [vendorId]
  )

  const [tab, setTab] = useState(defaultTab)

  const currency = useMemo(
    () => currencies?.find(item => item?.currencyId === vendor?.currencyId) || {},
    [currencies, vendor]
  )

  return (
    <>
      <TabContext value={tab}>
        <TabList
          textColor='inherit'
          allowScrollButtonsMobile={true}
          scrollButtons={'auto'}
          onChange={(e, newValue) => setTab(newValue)}
          sx={{
            top: '0px',
            background: '#FFF',
            '& .MuiTabPanel-root': {
              p: { xs: '10px 0px !important', md: '15px !important' }
            }
          }}
        >
          <Tab label='Overview' value='overview' />
          <Tab label='Transactions' value='transactions' />
          <Tab label='Notes' value='notes' />
        </TabList>
        <TabPanel value='overview'>
          {' '}
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
                        #{vendor?.vendorNo}
                      </Typography>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>
                      <Typography className='data-name'>Company: {vendor?.companyName || ''} </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Typography className='data-name'>Vendor Name: {vendor?.displayName || ''}</Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Grid>

            <Grid item xs={12}>
              <Grid container spacing={6} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Grid item xs={12} sm={6} md={6} lg={5.5} xl={5}>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: 500,
                      lineHeight: '22px',
                      mb: 2
                    }}
                  >
                    Primary Contact
                  </Typography>
                  <Table
                    sx={{
                      width: '100%',
                      border: 0,
                      marginBottom: '30px',

                      '& .MuiTableCell-root': {
                        width: '50%',
                        border: 0,
                        verticalAlign: 'top !important',
                        padding: '0px !important'
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
                            {vendor?.primaryContact?.firstName} {vendor?.primaryContact?.lastName}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Typography className='data-name' sx={{ display: 'flex', gap: 1 }}>
                            <a
                              href='mailto:emailAddress'
                              style={{ color: 'inherit', textDecoration: 'none', wordBreak: 'break-all' }}
                            >
                              {' '}
                              {vendor?.emailAddress}
                            </a>{' '}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Typography className='data-name'>{formatPhoneNumberIntl(`+${vendor?.mobile}`)} </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Typography className='data-name'>
                            {formatPhoneNumberIntl(`+${vendor?.workPhone}`)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Grid>
                <Grid item xs={12} sm={6} md={6} lg={5.5} xl={5}>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: 500,
                      lineHeight: '22px',
                      mb: 2
                    }}
                  >
                    Billing Address
                  </Typography>
                  <Table
                    sx={{
                      width: '100%',
                      border: 0,
                      marginBottom: '30px',

                      '& .MuiTableCell-root': {
                        width: '50%',
                        border: 0,
                        verticalAlign: 'top !important',
                        padding: '0px !important'
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
                          {vendor?.billingAddress?.addressLine1 ? (
                            <>
                              <Typography className='data-name'>
                                {vendor?.billingAddress?.addressLine1}, {vendor?.billingAddress?.addressLine2}
                              </Typography>
                              <Typography className='data-name'>
                                {vendor?.billingAddress?.cityOrTown}, {vendor?.billingAddress?.postcode}
                              </Typography>
                              <Typography className='data-name'>
                                {vendor?.billingAddress?.state}, {vendor?.billingAddress?.country}
                              </Typography>
                            </>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} md={6}>
              {' '}
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 500,
                  lineHeight: '22px',
                  mb: 2
                }}
              >
                Other Details
              </Typography>
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
                        Preferred Shipping Vendor : {preferredShippingVendor?.displayName}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Typography className='data-name'>
                        Currency : {currency?.symbol} {currency?.currencyId}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Typography className='data-name'>Payment Term : {vendor?.paymentTermsId}</Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Typography className='data-name'>Shipping Preference : {vendor?.shippingPreference}</Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Grid>
          </Card>
        </TabPanel>

        <TabPanel value='transactions'>
          <TransactionTab vendor={vendor} />
        </TabPanel>

        <TabPanel value='notes'>
          <NotesTab vendor={vendor} />
        </TabPanel>
      </TabContext>
    </>
  )
}
