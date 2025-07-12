import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

export default {
  MuiSelect: {
    defaultProps: {
      IconComponent: KeyboardArrowDownIcon
    },
    styleOverrides: {
      select: {
        minWidth: '6rem !important',
        '&.MuiTablePagination-select': {
          minWidth: '1.5rem !important'
        }
      }
    }
  }
}
