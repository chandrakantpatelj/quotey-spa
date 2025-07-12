// ** MUI Imports
import { styled } from '@mui/material/styles'
import MuiAppBar from '@mui/material/AppBar'
import MuiToolbar from '@mui/material/Toolbar'

// ** Util Import
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'

const AppBar = styled(MuiAppBar)(({ theme }) => ({
  transition: 'none',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'transparent',
  color: theme.palette.text.primary,
  minHeight: theme.mixins.toolbar.minHeight,
  [theme.breakpoints.up('sm')]: {
    paddingLeft: theme.spacing(6),
    paddingRight: theme.spacing(6)
  },
  [theme.breakpoints.down('sm')]: {
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4)
  }
}))

const Toolbar = styled(MuiToolbar)(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  padding: `${theme.spacing(0, 6)} !important`
}))

const LayoutAppBar = props => {
  // ** Props
  const { settings, appBarProps, appBarContent: userAppBarContent } = props

  // ** Vars
  const { skin, appBar, appBarBlur, contentWidth } = settings

  const appBarBlurEffect = appBarBlur && {
    '&:after': {
      // top: 0,
      // left: 0,
      // zIndex: -1,
      // width: '100%',
      // content: '""',
      // position: 'absolute',
      // backdropFilter: 'blur(10px)',
      // height: theme => `calc(${theme.mixins.toolbar.minHeight}px + ${theme.spacing(4)})`,
      // mask: theme =>
      //   `linear-gradient(${theme.palette.background.default}, ${theme.palette.background.default} 18%, transparent 100%)`,
      // background: theme =>
      //   `linear-gradient(180deg,${hexToRGBA(theme.palette.background.default, 0.7)} 44%, ${hexToRGBA(
      //     theme.palette.background.default,
      //     0.43
      //   )} 73%, ${hexToRGBA(theme.palette.background.default, 0)})`
      // display: 'none'
    }
  }
  if (appBar === 'hidden') {
    return null
  }
  let userAppBarStyle = {}
  if (appBarProps && appBarProps.sx) {
    userAppBarStyle = appBarProps.sx
  }
  const userAppBarProps = Object.assign({}, appBarProps)
  delete userAppBarProps.sx

  return (
    <AppBar
      elevation={0}
      color='default'
      className='layout-navbar'
      sx={{
        ...appBarBlurEffect,
        ...userAppBarStyle,
        maxWidth: '100%',
        width: '100%',
        zIndex: 1200,
        borderRadius: 0,
        p: '0px !important'
      }}
      position={appBar === 'fixed' ? 'fixed' : 'static'}
      {...userAppBarProps}
    >
      <Toolbar
        className='navbar-content-container'
        sx={{
          // ...(appBarBlur && { backdropFilter: 'blur(6px)' }),
          minHeight: theme => `${theme.mixins.toolbar.minHeight}px !important`,
          // backgroundColor: theme => hexToRGBA(theme.palette.background.paper, appBarBlur ? 0.95 : 1),
          // ...(skin === 'bordered' ? { border: theme => `1px solid ${theme.palette.divider}` } : { boxShadow: 2 }),
          // ...(contentWidth === 'boxed' && {
          //   '@media (min-width:1440px)': { maxWidth: theme => `calc(1440px - ${theme.spacing(6 * 2)})` }
          // }),
          maxWidth: '100%',
          border: 0,
          borderRadius: 0,
          marginTop: '0px',
          backgroundColor: '#FFF',
          maxWidth: '100% !important',
          padding: '21px 25px !important',
          borderBottom: '1px solid #D8D8D8',
          boxShadow: 'none'
        }}
      >
        {(userAppBarContent && userAppBarContent(props)) || null}
      </Toolbar>
    </AppBar>
  )
}

export default LayoutAppBar
