import { Box, Card, Grid, Table, TableBody, TableCell, TableRow, Typography } from '@mui/material'
import LogoBox from './LogoBox'
import { CommonViewTable, CompanyData, ShowAddress, ViewItemsTableWrapper } from './CommonPdfDesign'

export const CommonPageLayoutForPopup = ({
  data,
  section2,
  section3,
  itemsSection,
  notesSection,
  totalsSection,
  lastSection
}) => {
  return (
    <Card sx={{ p: 6, width: '100%' }}>
      <Grid container spacing={5}>
        <Grid item xs={12}>
          <Grid
            container
            spacing={5}
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' }
            }}
          >
            <Grid item xs={12} sm={7} md={6.5} xl={7.1}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  flexWrap: { xs: 'wrap', md: 'nowrap' },
                  gap: 2
                }}
              >
                <LogoBox data={data} />
                <div>
                  <CompanyData data={data} />
                </div>
              </Box>
            </Grid>

            <Grid item xs={12} sm={5} md={4} lg={4} xl={4}>
              <Table
                sx={{
                  border: 0,
                  '& .MuiTableCell-root': {
                    border: 0,
                    // verticalAlign: 'top !important',
                    padding: '0px !important'
                  },
                  '& .MuiTableCell-root .data-name': {
                    fontSize: '12px',
                    color: '#818181',
                    lineHeight: '23px'
                  },
                  '& .MuiTableCell-root .data-value': {
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#000',
                    lineHeight: '23px'
                  }
                }}
              >
                <TableBody>{section2}</TableBody>
              </Table>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid
            container
            spacing={5}
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' }
            }}
          >
            <Grid item xs={12} sm={6} md={5} xl={3.5}>
              {section3}
            </Grid>
            <Grid item xs={0} sm={0} md={1.5} xl={3.6} sx={{ display: { xs: 'none', md: 'block' } }}></Grid>
            <Grid item xs={12} sm={6} md={5} lg={4} xl={3.7}>
              <Typography
                sx={{
                  fontSize: '13px',
                  fontWeight: 600,
                  lineHeight: '24px'
                }}
              >
                Delivery Address
              </Typography>
              <CommonViewTable>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={2}>
                      <ShowAddress data={data?.deliveryAddress} />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </CommonViewTable>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <ViewItemsTableWrapper>{itemsSection}</ViewItemsTableWrapper>
        </Grid>
        <Grid item xs={12}>
          <Grid
            container
            spacing={6}
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column-reverse', md: 'row' },
              justifyContent: 'space-between'
            }}
          >
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 4 }}>{notesSection}</Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Table
                sx={{
                  '& .MuiTableCell-root': {
                    padding: '8px 10px !important',
                    borderBottom: '1px dashed #EBEBEB',
                    textAlign: 'right',
                    fontSize: '12px'
                  },
                  '& .data-value p': {
                    textWrap: 'nowrap'
                  }
                }}
              >
                {totalsSection}
              </Table>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <CommonViewTable>
            <TableBody>{lastSection}</TableBody>
          </CommonViewTable>
        </Grid>
        <Grid item xs={12}>
          {data?.termsAndConditions ? (
            <>
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 600
                }}
              >
                Terms and Conditions
              </Typography>
              <Typography sx={{ fontSize: '12px', color: '#818181', lineHeight: '22px' }}>
                <div>
                  <pre
                    style={{
                      fontFamily: 'inherit',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {data?.termsAndConditions}
                  </pre>
                </div>
              </Typography>
            </>
          ) : null}
        </Grid>
      </Grid>
    </Card>
  )
}
