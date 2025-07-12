// ** Next Import
import Link from 'next/link'
import Router from 'next/router'

import { useState } from 'react'
// ** MUI Imports
import Icon from 'src/@core/components/icon'
import { Box, Grid, IconButton, MenuItem, Typography } from '@mui/material'
import CustomNoRowsOverlay from 'src/common-components/CustomNoRowsOverlay'
import CommonStyledMenu from 'src/common-components/CommonStyledMenu'
import DeleteUser from './DeleteUser'
import { useDispatch, useSelector } from 'react-redux'
import { setSelectedUserObject } from 'src/store/apps/user'
import { formatPhoneNumberIntl } from 'react-phone-number-input'
import useIsDesktop from 'src/hooks/IsDesktop'
import { dataTextStyles, dataTitleStyles, hasPermission } from 'src/common-functions/utils/UtilityFunctions'
import { DELETE_USER, EDIT_USER } from 'src/common-functions/utils/Constants'
import MobileDataGrid from 'src/common-components/MobileDataGrid'

const UserListTable = ({ userObject }) => {
  const router = Router
  const dispatch = useDispatch()
  const isDesktop = useIsDesktop()
  const { userAccounts = [] } = userObject || {}
  const [openDialog, setOpenDialog] = useState(false)
  const [anchorElMap, setAnchorElMap] = useState({})

  const userProfile = useSelector(state => state.userProfile)

  const handleClick = (event, row) => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.username] = event.currentTarget
    setAnchorElMap(updatedAnchorElMap)
  }

  const handleClose = row => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.username] = null
    setAnchorElMap(updatedAnchorElMap)
  }
  const [username, setUserId] = useState('')
  const handleDelete = row => {
    setUserId(row?.username)
    handleClose(row)
    setOpenDialog(true)
  }

  const userAccountColumns = [
    {
      field: 'userAccountInfo',
      headerName: '',
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => {
        return (
          <Box sx={{ width: '100%', p: 2 }}>
            <Grid container spacing={3} sx={{ alignItems: 'center' }}>
              <Grid item xs={11}>
                <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                  <Grid item xs={6} md={3}>
                    <Typography sx={dataTextStyles}>{row?.username || '-'}</Typography>
                    <Typography sx={dataTitleStyles}>User Name</Typography>
                  </Grid>

                  <Grid item xs={6} md={3}>
                    <Typography sx={dataTextStyles}>{row?.name || '-'}</Typography>
                    <Typography sx={dataTitleStyles}>Name</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography sx={dataTextStyles}>{row?.email || '-'}</Typography>
                    <Typography sx={dataTitleStyles}>Email</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography sx={dataTextStyles}>{formatPhoneNumberIntl(`+${row?.phoneNumber}`) || '-'}</Typography>
                    <Typography sx={dataTitleStyles}>Mobile</Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={1} sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isDesktop && (
                    <IconButton
                      href={`/account-settings/user/view/${row?.username}`}
                      onClick={() => dispatch(setSelectedUserObject(row))}
                    >
                      <Icon icon='tabler:eye' />
                    </IconButton>
                  )}
                  {isDesktop && (
                    <IconButton
                      href={`/account-settings/user/edit/${row?.username}`}
                      onClick={() => dispatch(setSelectedUserObject(row))}
                    >
                      <Icon icon='tabler:edit' />
                    </IconButton>
                  )}
                  <IconButton onClick={event => handleClick(event, row)}>
                    <Icon
                      icon='iconamoon:menu-kebab-vertical-circle-light'
                      width={isDesktop ? 25 : 27}
                      height={isDesktop ? 25 : 27}
                    />
                  </IconButton>
                  <CommonStyledMenu
                    anchorEl={anchorElMap[row.username]}
                    open={Boolean(anchorElMap[row.username])}
                    onClose={() => handleClose(row)}
                  >
                    {!isDesktop && (
                      <MenuItem
                        component={Link}
                        href={`/account-settings/user/view/${row?.username}`}
                        onClick={() => dispatch(setSelectedUserObject(row))}
                      >
                        <Icon icon='tabler:eye' /> View
                      </MenuItem>
                    )}
                    {!isDesktop && hasPermission(userProfile, EDIT_USER) && (
                      <MenuItem
                        component={Link}
                        href={`/account-settings/user/edit/${row?.username}`}
                        onClick={() => dispatch(setSelectedUserObject(row))}
                      >
                        <Icon icon='tabler:edit' /> Edit
                      </MenuItem>
                    )}
                    {hasPermission(userProfile, DELETE_USER) && (
                      <MenuItem onClick={() => handleDelete(row)} sx={{ color: theme => theme.palette.error.main }}>
                        <Icon icon='mingcute:delete-2-line' /> Delete
                      </MenuItem>
                    )}
                  </CommonStyledMenu>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )
      }
    }
  ]

  return (
    <>
      <MobileDataGrid
        rows={userAccounts || []}
        columns={userAccountColumns}
        getRowId={row => row?.username}
        initialState={{
          sorting: {
            sortModel: [{ field: 'username', sort: 'desc' }]
          }
        }}
        styles={{
          '& .MuiDataGrid-row:hover': {
            cursor: 'pointer'
          }
        }}
        onCellClick={(params, event) => {
          event.defaultMuiPrevented = false
        }}
        onRowClick={(params, event) => {
          if (event.target.closest('.MuiIconButton-root')) {
            event.defaultMuiPrevented = true
            return
          }
          dispatch(setSelectedUserObject(params.row))
          router.push(`/account-settings/user/view/${params?.row?.username}`)
        }}
        slots={{
          columnHeaders: () => null,
          noRowsOverlay: CustomNoRowsOverlay
        }}
        slotProps={{
          noRowsOverlay: {
            mainText: 'Empty User Accounts',
            subText: "No user available here. Click 'Add New' button above to get started."
          }
        }}
      />
      {openDialog && <DeleteUser openDialog={openDialog} setOpenDialog={setOpenDialog} username={username} />}
    </>
  )
}

export default UserListTable
