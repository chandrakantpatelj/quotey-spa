// ** Util Import
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

const Autocomplete = skin => {
  const boxShadow = theme => {
    if (skin === 'bordered') {
      return theme.shadows[0]
    } else if (theme.palette.mode === 'light') {
      return theme.shadows[4]
    } else return '0px 3px 14px 0px rgba(15, 20, 34, 0.38)'
  }

  return {
    MuiAutocomplete: {
      defaultProps: {
        forcePopupIcon: true,
        popupIcon: <KeyboardArrowDownIcon />
      },
      styleOverrides: {
        popper: ({ theme }) => ({
          '.MuiPaper-root': {
            boxShadow: boxShadow(theme),
            ...(skin === 'bordered' && { border: `1px solid ${theme.palette.divider}` }),
            '& .MuiAutocomplete-option .MuiListItemButton-root:hover': {
              backgroundColor: 'transparent'
            },
            '&.custom-autocomplete-paper': {
              ...theme.typography.caption,
              fontSize: '12px !important', // Adjust font size here to '12px'

              '& .MuiAutocomplete-option': {
                '&.MuiTypography-root, & svg': {
                  fontSize: '12px !important' // Adjust font size here to '12px'
                },

                '&.Mui-focused': {
                  color: 'inherit',
                  backgroundColor: hexToRGBA(theme.palette.primary.main, 0.1),
                  '& .MuiTypography-root, & svg': {
                    color: 'inherit'
                  }
                },
                '&[aria-selected="true"]': {
                  color: 'inherit',
                  backgroundColor: hexToRGBA(theme.palette.primary.main, 0.2)
                },
                '& .MuiCheckbox-root.Mui-checked path:first-of-type': {
                  fill: theme.palette.common.white
                },
                '& .MuiCheckbox-root.Mui-checked path:last-of-type': {
                  fill: theme.palette.primary.main,
                  stroke: theme.palette.primary.main
                }
              }
            }
          }
        }),

        inputRoot: {
          '& .MuiAutocomplete-tagSizeSmall': {
            height: 22
          },
          '& .MuiChip-label': {
            lineHeight: '24px !important', // Adjust line height here
            fontSize: '0.750rem' // Adjust font size here for tags
          },
          '& .MuiAutocomplete-tag': {
            backgroundColor: 'rgba(0,0,0,0.08) !important',
            height: 30
          }
        }
      }
    }
  }
}

export default Autocomplete
