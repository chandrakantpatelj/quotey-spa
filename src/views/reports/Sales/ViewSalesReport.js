import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import CustomNoRowsOverlay from 'src/common-components/CustomNoRowsOverlay'

function ViewSalesReport() {
  const data = {
    metadata: {
      reportName: 'Invoice Report',
      reportDate: '2025-01-01',
      totalRecords: 2,
      totalAmountExclTax: 301.25,
      totalAmountInclTax: 331.25,
      totalClearedAmount: 331.25,
      totalTax: 30,
      columns: [
        { headerName: 'Date', type: 'string', field: 'date' },
        { headerName: 'Invoice No', type: 'string', field: 'invoiceNo' },
        { headerName: 'Total Amount (Excl. Tax)', type: 'number', field: 'totalAmountExclTax' },
        { headerName: 'Total Amount (Incl. Tax)', type: 'number', field: 'totalAmount' },
        { headerName: 'Total Cleared Amount', type: 'number', field: 'totalClearedAmount' },
        { headerName: 'Total Tax', type: 'number', field: 'totalTax' }
      ]
    },
    data: [
      {
        date: '01-01-2025',
        invoiceNo: 'INV001',
        totalAmountExclTax: 100.5,
        totalAmount: 110.5,
        totalClearedAmount: 110.5,
        totalTax: 10
      },
      {
        date: '02-01-2025',
        invoiceNo: 'INV002',
        totalAmountExclTax: 200.75,
        totalAmount: 220.75,
        totalClearedAmount: 220.75,
        totalTax: 20
      }
    ]
  }

  const modifyColumns = data?.metadata?.columns?.map(val => ({
    ...val,
    flex: 0.2,
    minWidth: 100
  }))

  const { columns, reportName, reportDate, ...restMetadata } = data?.metadata

  const tableData = Object.entries(restMetadata)

  const CustomFooter = () => {
    return (
      <Box sx={{ p: 1, textAlign: 'center' }}>
        <Table
          sx={{
            maxWidth: '300px',
            width: '100%',
            ml: 'auto',
            '& .MuiTableCell-root': {
              padding: '8px 10px !important',
              borderBottom: '1px dashed #EBEBEB',
              fontSize: '12px'
            },
            '& .MuiTableCell-root:last-child': {
              textAlign: 'right'
            },

            '& .MuiTableRow-head .MuiTableCell-root': { background: '#EBEBEB', fontWeight: 400 },

            '& .data-value p': {
              textWrap: 'nowrap'
            }
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Key</strong>
              </TableCell>
              <TableCell>
                <strong>Value</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map(([key, value]) => (
              <TableRow key={key}>
                <TableCell>{key}</TableCell>
                <TableCell>{value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    )
  }

  return (
    <div>
      <Box sx={{ width: '100%' }}>
        <Box sx={{ mb: 10 }}>
          <Typography variant='h4' align='center' gutterBottom>
            {data?.metadata?.reportName}
          </Typography>
          <Typography variant='h6' align='center' gutterBottom sx={{ color: '#959595' }}>
            {data?.metadata?.reportDate}
          </Typography>
        </Box>

        <DataGrid
          autoHeight
          rowHeight={52}
          //   height={'100%'}
          //   getRowHeight={() => 'auto'}
          columns={modifyColumns}
          rows={data?.data || []}
          disableColumnMenu={true}
          disableRowSelectionOnClick
          getRowId={row => row?.invoiceNo}
          slots={{
            footer: CustomFooter,
            noRowsOverlay: CustomNoRowsOverlay
          }}
          slotProps={{
            noRowsOverlay: {
              mainText: 'No sales report data available'
            }
          }}
        />
      </Box>
    </div>
  )
}

export default ViewSalesReport
