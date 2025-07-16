import CustomNoRowsOverlay from 'src/common-components/CustomNoRowsOverlay'
import TableBasic from '../table/data-grid/TableBasic'
import { DataGrid } from '@mui/x-data-grid'

const rows = [
  {
    channel: 'Direct Sales',
    draft: 15,
    packed: 30,
    confirmed: 18,
    shipped: 16,
    invoiced: 80
  },
  {
    channel: 'InDirect Sales',
    draft: 38,
    packed: 20,
    confirmed: 22,
    shipped: 20,
    invoiced: 102
  }
]

const SalesListTable = () => {
  const columns = [
    {
      flex: 0.25,
      minWidth: 120,
      field: 'channel',
      headerName: 'Channel',
      sortable: false
    },
    {
      flex: 0.15,
      minWidth: 80,
      align: 'center',
      headerAlign: 'center',
      field: 'draft',
      headerName: 'Draft',
      sortable: false
    },
    {
      flex: 0.15,
      minWidth: 90,
      align: 'center',
      headerAlign: 'center',
      field: 'confirmed',
      headerName: 'Confirmed',
      sortable: false
    },
    {
      flex: 0.15,
      minWidth: 80,
      align: 'center',
      headerAlign: 'center',
      field: 'packed',
      headerName: 'Packed',
      sortable: false
    },
    {
      flex: 0.15,
      minWidth: 80,
      align: 'center',
      headerAlign: 'center',
      field: 'shipped',
      headerName: 'Shipped',
      sortable: false
    },
    {
      flex: 0.15,
      minWidth: 90,
      align: 'center',
      headerAlign: 'center',
      field: 'invoiced',
      headerName: 'Invoiced',
      sortable: false
    }
  ]
  return (
    <>
      {/* <Box sx={{ height: { xs: 350, lg: '100%' } }}> */}
      <DataGrid
        autoHeight
        disableColumnMenu={true}
        disableRowSelectionOnClick
        columns={columns}
        rows={rows}
        hideFooter
        getRowId={row => row?.channel}
        slots={{
          noRowsOverlay: CustomNoRowsOverlay
        }}
        slotProps={{
          noRowsOverlay: {
            mainText: 'No data available'
          }
        }}
      />
      {/* </Box> */}
    </>
  )
}

export default SalesListTable
