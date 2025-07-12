import { useTheme, useMediaQuery } from '@mui/material'

const useIsDesktop = () => {
  const theme = useTheme()
  return useMediaQuery(theme.breakpoints.up('sm'))
}

export default useIsDesktop

export const useIsLaptop = () => {
  const theme = useTheme()
  return useMediaQuery(theme.breakpoints.up('lg'))
}

export const useIsMobile = () => {
  const theme = useTheme()
  return useMediaQuery(theme.breakpoints.down('sm'))
}
