// ** Next Import
import Link from 'next/link'
import { useEffect, useState } from 'react'

import Icon from 'src/@core/components/icon'
import { resetWarehouse, setActionWareHouse } from 'src/store/apps/warehouses'
import { useDispatch, useSelector } from 'react-redux'
import { Box, Grid, IconButton, MenuItem, Tooltip, Typography } from '@mui/material'
import CustomNoRowsOverlay from 'src/common-components/CustomNoRowsOverlay'
import useIsDesktop from 'src/hooks/IsDesktop'
import CommonStyledMenu from 'src/common-components/CommonStyledMenu'
import {
  dataTextStyles,
  dataTitleStyles,
  displayContactData,
  hasPermission
} from 'src/common-functions/utils/UtilityFunctions'
import { EDIT_WAREHOUSE, VIEW_WAREHOUSE } from 'src/common-functions/utils/Constants'
import RefreshIcon from '@mui/icons-material/Refresh'
import MobileDataGrid from 'src/common-components/MobileDataGrid'
import Router from 'next/router'

export const MOBILE_COLUMNS = {
  primaryContact: false,
  country: false
}
export const ALL_COLUMNS = {}

const WarehouseListTable = ({ tenantId, warehousesObject, setWarehousesObject }) => {
  const dispatch = useDispatch()
  const isDesktop = useIsDesktop()
  const userProfile = useSelector(state => state.userProfile)
  const router = Router

  const { warehouses = [] } = warehousesObject

  const [anchorElMap, setAnchorElMap] = useState({})

  const handleClick = (event, row) => {
    dispatch(setActionWareHouse(row))
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.warehouseId] = event.currentTarget
    setAnchorElMap(updatedAnchorElMap)
  }

  const handleClose = row => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.warehouseId] = null
    setAnchorElMap(updatedAnchorElMap)
  }

  const [columnVisible, setColumnVisible] = useState(ALL_COLUMNS)
  useEffect(() => {
    const newColumns = isDesktop ? ALL_COLUMNS : MOBILE_COLUMNS
    setColumnVisible(newColumns)
  }, [isDesktop])

  const tradingColumns = [
    {
      field: 'tradingInfo',
      headerName: '',
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => {
        const viewPermission = hasPermission(userProfile, VIEW_WAREHOUSE)
        const editPermission = hasPermission(userProfile, EDIT_WAREHOUSE)

        return (
          <Box sx={{ width: '100%', p: 2 }}>
            <Grid container spacing={3} sx={{ alignItems: 'center' }}>
              <Grid item xs={11}>
                <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                  <Grid item xs={4} sm={3} md={3}>
                    <Typography sx={dataTextStyles}>{row?.warehouseNo || ''}</Typography>
                    <Typography sx={dataTitleStyles}>No</Typography>
                  </Grid>
                  <Grid item xs={8} sm={3} md={3}>
                    <Typography sx={dataTextStyles}>{row?.name || '-'}</Typography>
                    <Typography sx={dataTitleStyles}>Name</Typography>
                  </Grid>
                  <Grid item xs={8} sm={3} md={3}>
                    <Typography sx={dataTextStyles}>{displayContactData(row || '-')}</Typography>
                    <Typography sx={dataTitleStyles}>Contact</Typography>
                  </Grid>
                  <Grid item xs={4} sm={3} md={3}>
                    <Typography sx={dataTextStyles}>{row?.address?.country || '-'}</Typography>
                    <Typography sx={dataTitleStyles}>Country</Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={1} sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  {/* Render View and Edit buttons outside menu for Desktop */}
                  {isDesktop && viewPermission && (
                    <IconButton
                      component={Link}
                      href={`/account-settings/warehouses/view/${row.warehouseId}`}
                      onClick={() => dispatch(setActionWareHouse(row))}
                    >
                      <Icon icon='tabler:eye' />
                    </IconButton>
                  )}

                  {isDesktop && editPermission && (
                    <IconButton
                      component={Link}
                      href={`/account-settings/warehouses/edit/${row.warehouseId}`}
                      onClick={() => dispatch(setActionWareHouse(row))}
                    >
                      <Icon icon='tabler:edit' />
                    </IconButton>
                  )}

                  {/* Vertical Menu Button */}
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

                  {/* CommonStyledMenu - Show all options inside the menu for mobile */}
                  <CommonStyledMenu
                    anchorEl={anchorElMap[row.warehouseId]}
                    open={Boolean(anchorElMap[row.warehouseId])}
                    onClose={() => handleClose(row)}
                  >
                    {/* For Mobile View - Show View & Edit inside Menu */}
                    {!isDesktop && viewPermission && (
                      <MenuItem
                        component={Link}
                        href={`/account-settings/warehouses/view/${row.warehouseId}`}
                        onClick={() => dispatch(setActionWareHouse(row))}
                      >
                        <Icon icon='tabler:eye' /> View
                      </MenuItem>
                    )}

                    {!isDesktop && editPermission && (
                      <MenuItem
                        component={Link}
                        href={`/account-settings/warehouses/edit/${row.warehouseId}`}
                        onClick={() => dispatch(setActionWareHouse(row))}
                      >
                        <Icon icon='tabler:edit' /> Edit
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
              dispatch(resetWarehouse())
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <MobileDataGrid
        rows={warehouses || []}
        columns={tradingColumns}
        getRowId={row => row?.warehouseId}
        initialState={{
          sorting: {
            sortModel: [{ field: 'warehouseNo', sort: 'desc' }]
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
          if (event.target.closest('.MuiButton-root')) {
            event.defaultMuiPrevented = true
            return
          }
          dispatch(setActionWareHouse(params.row))
          router.push(`/account-settings/warehouses/view/${params?.row?.warehouseId}`)
        }}
        slots={{
          columnHeaders: () => null,
          noRowsOverlay: CustomNoRowsOverlay
        }}
        slotProps={{
          noRowsOverlay: {
            mainText: 'Empty Warehouses',
            subText: "No warehouse available here. Click 'Add New' button above to get started."
          }
        }}
      />
    </>
  )
}

export default WarehouseListTable
