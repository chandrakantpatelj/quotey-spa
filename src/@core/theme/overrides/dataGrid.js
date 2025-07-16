const DataGrid = () => {
  return {
    MuiDataGrid: {
      defaultProps: {
        initialState: {
          columnHeaderHeight: 63,
          rowHeight: 56,
          pagination: {
            paginationModel: {
              page: 0,
              pageSize: 100
            }
          },
          pageSizeOptions: [25, 50, 75, 100]
        }
      },
      styleOverrides: {
        root: ({ theme }) => ({
          border: 0,
          color: theme.palette.text.primary,

          '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': {
            outline: 'none'
          }
        }),
        toolbarContainer: ({ theme }) => ({
          paddingRight: `${theme.spacing(6)} !important`,
          paddingLeft: `${theme.spacing(3.25)} !important`
        }),
        columnHeaders: ({ theme }) => ({
          backgroundColor: theme.palette.customColors.tableHeaderBg,
          borderRadius: 7
        }),
        columnHeader: ({ theme }) => ({
          '&:not(.MuiDataGrid-columnHeaderCheckbox)': {
            // paddingLeft: theme.spacing(4),
            // paddingRight: theme.spacing(4),
            padding: '10px 5px',
            '&:first-of-type': {
              // paddingLeft: theme.spacing(6)
              paddingLeft: '20px'
            }
          },
          '&:last-of-type': {
            paddingRight: theme.spacing(6)
          }
        }),
        columnHeaderCheckbox: {
          maxWidth: '58px !important',
          minWidth: '58px !important'
        },
        columnHeaderTitleContainer: {
          padding: 0
        },
        columnHeaderTitle: () => ({
          fontWeight: 500,
          fontSize: '13px',
          color: 'rgba(0,0,0,0.85)'
          // textTransform: 'uppercase',
          // fontSize: theme.typography.body2.fontSize
        }),
        columnSeparator: () => ({
          // color: theme.palette.divider
        }),
        row: {
          borderBottom: '0px',
          '&:last-of-type': {
            borderBottom: '0px',
            '& .MuiDataGrid-cell': {
              // borderBottom: 0
            }
          }
        },
        cell: ({ theme }) => ({
          // borderColor: theme.palette.divider,
          borderColor: theme.themeColor,
          alignItems: 'center',
          '&:not(.MuiDataGrid-cellCheckbox)': {
            fontSize: '13px',
            color: '#000',
            padding: '10px 5px',
            '&:first-of-type': {
              // paddingLeft: theme.spacing(6)
              paddingLeft: '20px'
            }
          },
          '&:last-of-type': {
            // paddingRight: theme.spacing(6)
            paddingRight: '20px'
          },
          '&:focus, &:focus-within': {
            outline: 'none'
          }
        }),
        cellCheckbox: {
          maxWidth: '58px !important',
          minWidth: '58px !important'
        },
        editInputCell: ({ theme }) => ({
          padding: 0,
          color: theme.palette.text.primary,
          '& .MuiInputBase-input': {
            padding: 0
          }
        }),
        footerContainer: ({ theme }) => ({
          borderTop: `1px solid ${theme.palette.divider}`,
          '& .MuiTablePagination-toolbar': {
            paddingLeft: `${theme.spacing(4)} !important`,
            paddingRight: `${theme.spacing(4)} !important`
          },
          '& .MuiTablePagination-displayedRows, & .MuiTablePagination-selectLabel': {
            color: theme.palette.text.primary
          }
        }),
        selectedRowCount: ({ theme }) => ({
          margin: 0,
          paddingLeft: theme.spacing(4),
          paddingRight: theme.spacing(4)
        })
      }
    }
  }
}

export default DataGrid
