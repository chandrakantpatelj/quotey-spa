const Table = () => {
  return {
    MuiTableContainer: {
      styleOverrides: {
        root: ({ theme }) => ({
          boxShadow: theme.shadows[0],
          borderTopColor: theme.palette.divider
        })
      }
    },
    MuiTableHead: {
      styleOverrides: {
        root: ({ theme }) => ({
          textTransform: 'uppercase',
          '& .MuiTableCell-head': {
            fontWeight: 500,
            letterSpacing: '1px',
            color: '#37414b',
            fontSize: theme.typography.body2.fontSize,
            background: '#F4F6F8',
            textTransform: 'capitalize'
          }
        })
      }
    },
    MuiTableBody: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiTableCell-body': {
            letterSpacing: '0.25px',
            color: theme.palette.text.secondary,
            '&:not(.MuiTableCell-sizeSmall):not(.MuiTableCell-paddingCheckbox):not(.MuiTableCell-paddingNone)': {
              paddingTop: theme.spacing(3.5),
              paddingBottom: theme.spacing(3.5)
            }
          }
        })
      }
    },
    MuiTableRow: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiTableCell-head:not(.MuiTableCell-paddingCheckbox):first-of-type, & .MuiTableCell-root:not(.MuiTableCell-paddingCheckbox):first-of-type ':
            {
              paddingLeft: theme.spacing(6)
            },
          '& .MuiTableCell-head:last-of-type, & .MuiTableCell-root:last-of-type': {
            paddingRight: theme.spacing(6)
          }
        })
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: ({ theme }) => ({
          // borderBottom: `1px solid ${theme.palette.divider}`,
          borderBottom: '1px dashed #EBEBEB',
          textAlign: 'left',
          padding: '16px 10px',
          '&:first-of-type': {
            pl: '10px !important'
          },
          '&:last-of-type': {
            pr: '10px !important'
            // textAlign: 'right'
          }
        }),
        paddingCheckbox: ({ theme }) => ({
          paddingLeft: theme.spacing(3.25)
        }),
        stickyHeader: ({ theme }) => ({
          backgroundColor: theme.palette.customColors.tableHeaderBg
        })
      }
    }
  }
}

export default Table
