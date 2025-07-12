import Link from 'next/link'
import Router from 'next/router'
import { useState } from 'react'

import CustomNoRowsOverlay from 'src/common-components/CustomNoRowsOverlay'
import { useDispatch, useSelector } from 'react-redux'
import useIsDesktop from 'src/hooks/IsDesktop'
import { Box, Grid, IconButton, MenuItem, Tooltip, Typography } from '@mui/material'
import Icon from 'src/@core/components/icon'
import CommonStyledMenu from 'src/common-components/CommonStyledMenu'
import { EDIT_PURCHASE_SETTING, VIEW_PURCHASE_SETTING } from 'src/common-functions/utils/Constants'
import { dataTextStyles, dataTitleStyles, hasPermission } from 'src/common-functions/utils/UtilityFunctions'
import { resetPurchaseSetting, setSelectedpurchaseModuleSetting } from 'src/store/apps/purchase-module-settings'
import RefreshIcon from '@mui/icons-material/Refresh'
import MobileDataGrid from 'src/common-components/MobileDataGrid'

const PurchaseModuleListTable = ({ purchaseSettings }) => {
  const dispatch = useDispatch()
  const isDesktop = useIsDesktop()
  const userProfile = useSelector(state => state.userProfile)
  const router = Router

  const { allPurchaseSettings = [] } = purchaseSettings || {}

  const [anchorElMap, setAnchorElMap] = useState({})

  const handleClick = (event, row) => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.purchaseType] = event.currentTarget
    setAnchorElMap(updatedAnchorElMap)
  }

  const handleClose = row => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.purchaseType] = null
    setAnchorElMap(updatedAnchorElMap)
  }

  const tradingColumns = [
    {
      field: 'purchaseInfo',
      headerName: '',
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => {
        const viewPermission = hasPermission(userProfile, VIEW_PURCHASE_SETTING)
        const editPermission = hasPermission(userProfile, EDIT_PURCHASE_SETTING)

        return (
          <Box sx={{ width: '100%', p: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={11}>
                <Grid container spacing={3}>
                  <Grid item xs={6} sm={3}>
                    <Typography sx={dataTextStyles}>{row?.purchaseType || '-'}</Typography>
                    <Typography sx={dataTitleStyles}>Purchase Type</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography sx={dataTextStyles}>{row?.default ? 'Yes' : '-'}</Typography>
                    <Typography sx={dataTitleStyles}>Default</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography sx={dataTextStyles}>{row?.version}</Typography>
                    <Typography sx={dataTitleStyles}>Version</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography sx={dataTextStyles}>{row?.latestVersion ? 'Yes' : 'No'}</Typography>
                    <Typography sx={dataTitleStyles}>Latest Version</Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={1} sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  {isDesktop && viewPermission && (
                    <IconButton
                      component={Link}
                      href={`/account-settings/purchase-module/view/${row.purchaseType}`}
                      onClick={() => dispatch(setSelectedpurchaseModuleSetting(row))}
                    >
                      <Icon icon='tabler:eye' width={24} height={24} />
                    </IconButton>
                  )}

                  {/* {isDesktop && editPermission && (
                    <IconButton
                      component={Link}
                      href={`/account-settings/purchase-module/edit/${row.purchaseType}`}
                      onClick={() => dispatch(setSelectedpurchaseModuleSetting(row))}
                    >
                      <Icon icon='tabler:edit' width={24} height={24} />
                    </IconButton>
                  )} */}

                  {!isDesktop && (
                    <IconButton
                      onClick={event => {
                        event.stopPropagation()
                        handleClick(event, row)
                      }}
                    >
                      <Icon
                        icon='iconamoon:menu-kebab-vertical-circle-light'
                        width={isDesktop ? 25 : 27}
                        height={isDesktop ? 25 : 27}
                      />
                    </IconButton>
                  )}
                  <CommonStyledMenu
                    anchorEl={anchorElMap[row.purchaseType]}
                    open={Boolean(anchorElMap[row.purchaseType])}
                    onClose={() => handleClose(row)}
                  >
                    {!isDesktop && viewPermission && (
                      <MenuItem
                        component={Link}
                        href={`/account-settings/purchase-module/view/${row.purchaseType}`}
                        onClick={() => dispatch(setSelectedpurchaseModuleSetting(row))}
                      >
                        <Icon icon='tabler:eye' /> View
                      </MenuItem>
                    )}

                    {/* {!isDesktop && editPermission && (
                      <MenuItem
                        component={Link}
                        href={`/account-settings/purchase-module/edit/${row.purchaseType}`}
                        onClick={() => dispatch(setSelectedpurchaseModuleSetting(row))}
                      >
                        <Icon icon='tabler:edit' /> Edit
                      </MenuItem>
                    )} */}
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
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 3,
          mb: 3
        }}
      >
        <Tooltip title='Reload' placement='top'>
          <IconButton
            color='default'
            sx={{ fontSize: '21px' }}
            onClick={() => {
              dispatch(resetPurchaseSetting())
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <MobileDataGrid
        rows={allPurchaseSettings || []}
        columns={tradingColumns}
        getRowId={row => row?.purchaseType || ''}
        styles={{
          '& .MuiDataGrid-row:hover': {
            cursor: 'pointer'
          }
        }}
        onRowClick={(params, event) => {
          if (event.target.closest('.MuiButton-root')) {
            event.defaultMuiPrevented = true
            return
          }
          dispatch(setSelectedpurchaseModuleSetting(params.row))
          router.push(`/account-settings/purchase-module/view/${params?.row?.purchaseType}`)
        }}
        slots={{
          columnHeaders: () => null,
          noRowsOverlay: CustomNoRowsOverlay
        }}
        slotProps={{
          noRowsOverlay: {
            mainText: 'Empty Purchase Module',
            subText: "No purchase settings available here. Click 'Add New' button above to get started."
          }
        }}
      />
      {/* {openDialog && (
        <DeleteUser
          openDialog={openDialog}
          setOpenDialog={setOpenDialog}
          setUserObject={setUserObject}
          purchaseType={purchaseType}
        />
      )} */}
    </>
  )
}

export default PurchaseModuleListTable
