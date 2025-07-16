// ** MUI Imports
import { DataGrid } from '@mui/x-data-grid'

// ** Data Import

const TableBasic = props => {
  return <DataGrid {...props} disableColumnMenu={true} disableRowSelectionOnClick />
}

export default TableBasic
