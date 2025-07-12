import { Box } from '@mui/system'
import { DataGrid } from '@mui/x-data-grid'

function MobileDataGrid(props) {
  const { initialState, styles } = props

  return (
    <>
      {/* <Box sx={{ height: '100%' }}> */}
      <DataGrid
        {...props}
        hideHeaderFilterMenu
        pagination
        autoHeight
        initialState={{
          ...initialState,
          pagination: {
            paginationModel: {
              page: 0,
              pageSize: 100
            }
          }
          // pageSizeOptions: [25, 50, 75, 100]
        }}
        pageSizeOptions={[25, 50, 75, 100]}
        getRowHeight={() => 'auto'}
        disableColumnMenu={true}
        disableRowSelectionOnClick
        sx={{
          ...styles,
          borderRadius: '10px !important',

          '& .MuiDataGrid-row': {
            // background: '#FFF',
            borderRadius: '10px !important',
            // backgroundColor: '#F9F9F9',
            // border: '1px solid #E5E5E5'
            outline: '1px solid #E5E5E5',
            outlineOffset: '-3px'
          },
          '& .MuiDataGrid-cellCheckbox': {
            // alignItems: 'flex-start'
          },
          '& .MuiDataGrid-columnHeaders': {
            background: 'none'
          },
          '& .MuiDataGrid-cell:not(.MuiDataGrid-cellCheckbox):first-of-type': {
            pl: '10px'
          },
          '& .MuiDataGrid-cell:last-of-type': {
            pr: '10px'
          },
          '& .MuiDataGrid-row:last-of-type': {
            // borderBottom: '1px solid #E5E5E5'
          },
          '& .MuiDataGrid-columnHeaderCheckbox, & .MuiDataGrid-cellCheckbox ': {
            maxWidth: '45px !important',
            minWidth: '45px !important'
          }
        }}
      />
      {/* </Box> */}
    </>
  )
}

export default MobileDataGrid
