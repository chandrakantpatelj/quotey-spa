// ** Util Imports
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'

const Chip = () => {
  return {
    MuiChip: {
      styleOverrides: {
        root: ({ theme, ownerState }) => ({
          fontWeight: 400,
          // borderRadius: 5,
          // lineHeight: 1,

          fontSize: '12px',
          ...(ownerState.size === 'medium' && {
            height: 25
          }),
          ...(ownerState.size === 'small' && {
            fontSize: '10px',
            height: 20
          }),
          '&.MuiChip-rounded': {
            borderRadius: 4
          }
        }),
        outlined: ({ theme }) => ({
          '&.MuiChip-colorDefault': {
            borderColor: `rgba(${theme.palette.customColors.main}, 0.2)`
            // backgroundColor: `rgba(${theme.palette.customColors.main}, 0.2) !important`
          }
        }),
        labelSmall: ({ theme }) => ({
          paddingLeft: theme.spacing(2.5),
          paddingRight: theme.spacing(2.5)
        }),
        deleteIcon: {
          width: 16,
          height: 16
        },
        avatar: ({ theme }) => ({
          color: theme.palette.text.primary
        }),
        deletableColorPrimary: ({ theme }) => ({
          backgroundColor: `${hexToRGBA(theme.palette.primary.main, 0.1)} !important`,
          '&.MuiChip-light .MuiChip-deleteIcon': {
            color: hexToRGBA(theme.palette.primary.main, 0.8),
            '&:hover': {
              color: theme.palette.primary.main
            }
          }
        }),
        deletableColorSecondary: ({ theme }) => ({
          '&.MuiChip-light .MuiChip-deleteIcon': {
            color: hexToRGBA(theme.palette.secondary.main, 0.6),
            '&:hover': {
              color: theme.palette.secondary.main
            }
          }
        }),
        deletableColorSuccess: ({ theme }) => ({
          '&.MuiChip-light .MuiChip-deleteIcon': {
            color: hexToRGBA(theme.palette.success.main, 0.7),
            '&:hover': {
              color: theme.palette.success.main
            }
          }
        }),
        deletableColorError: ({ theme }) => ({
          '&.MuiChip-light .MuiChip-deleteIcon': {
            color: hexToRGBA(theme.palette.error.main, 0.7),
            '&:hover': {
              color: theme.palette.error.main
            }
          }
        }),
        deletableColorWarning: ({ theme }) => ({
          '&.MuiChip-light .MuiChip-deleteIcon': {
            color: hexToRGBA(theme.palette.warning.main, 0.7),
            '&:hover': {
              color: theme.palette.warning.main
            }
          }
        }),
        deletableColorInfo: ({ theme }) => ({
          '&.MuiChip-light .MuiChip-deleteIcon': {
            color: hexToRGBA(theme.palette.info.main, 0.7),
            '&:hover': {
              color: theme.palette.info.main
            }
          }
        })
      }
    }
  }
}

export default Chip
