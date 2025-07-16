import * as React from 'react'
import { useRouter } from 'next/router'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { Avatar, alpha, useTheme } from '@mui/material'
import { Auth } from 'aws-amplify'
import { useDispatch, useSelector } from 'react-redux'
import { resetCompany } from 'src/store/apps/company'
import { resetPreference } from 'src/store/apps/user-preference'
import { clearReduxStore } from 'src/common-functions/utils/UtilityFunctions'
import { resetUserProfile } from 'src/store/apps/user-profile'
import { setHeaderLoader } from 'src/store/apps/other-setting'
import { resetAccounts } from 'src/store/apps/accounts'

export default function UserDropdown({ userData }) {
  const theme = useTheme()
  const dispatch = useDispatch()
  const router = useRouter()
  const userProfile = useSelector(state => state.userProfile)

  const initials = userProfile?.data?.name
    ?.split(' ')
    ?.filter(Boolean)
    ?.slice(0, 2)
    ?.map(word => word[0])
    ?.join('')
    ?.toUpperCase()

  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl)

  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleDropdownClose = url => {
    if (url) {
      router.push(url)
    }
    setAnchorEl(null)
  }

  async function signOut() {
    dispatch(setHeaderLoader(true))
    clearReduxStore(dispatch)
    dispatch(resetCompany())
    dispatch(resetPreference())
    dispatch(resetUserProfile())
    dispatch(resetAccounts())

    try {
      console.log('logout: ')
      await Auth.signOut()
      // Clear local storage
      localStorage.clear()
      sessionStorage.clear()
      router.push('/')
      setAnchorEl(null)
    } catch (error) {
      console.log('error signing out: ', error)
    }
  }

  return (
    <div>
      <Button
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup='true'
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        endIcon={<ArrowDropDownIcon />}
        sx={{
          minWidth: 'unset',
          padding: '0px',
          '& .MuiMenu-paper': { width: 230, mt: 4.75 },
          '&:hover': {
            background: 'none'
          }
        }}
      >
        {/* <Box sx={{ width: '44px', height: '44px', borderRadius: '44px', overflow: 'hidden' }}>
          <img
            src='/warehouse-img/user-img.png'
            alt='user-img'
            style={{ width: '100%', height: '100%', objectFit: 'fill' }}
          />{' '}
        </Box> */}
        {/* <Avatar {...stringAvatar('Kent Dodds')} /> */}
        <Avatar
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 1),
            color: '#FFF'
          }}
        >
          {initials}
        </Avatar>
      </Button>
      <Menu
        id='basic-menu'
        anchorEl={anchorEl}
        open={open}
        onClose={() => handleDropdownClose()}
        MenuListProps={{
          'aria-labelledby': 'basic-button'
        }}
      >
        {/* <MenuItem onClick={handleClose}>Profile</MenuItem> */}
        <MenuItem onClick={() => handleDropdownClose('/account-settings/account')}>Settings</MenuItem>
        <MenuItem
          onClick={() => {
            signOut()
          }}
        >
          Logout
        </MenuItem>
      </Menu>
    </div>
  )
}
