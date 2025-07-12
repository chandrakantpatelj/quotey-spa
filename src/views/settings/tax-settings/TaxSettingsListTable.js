import Link from 'next/link'
import Router from 'next/router'

// ** MUI Imports
import Box from '@mui/material/Box'
import { Grid, IconButton, MenuItem, Tooltip, Typography } from '@mui/material'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Icon from 'src/@core/components/icon'
import CustomNoRowsOverlay from 'src/common-components/CustomNoRowsOverlay'
import CommonStyledMenu from 'src/common-components/CommonStyledMenu'
import useIsDesktop from 'src/hooks/IsDesktop'
import { dataTextStyles, dataTitleStyles, hasPermission } from 'src/common-functions/utils/UtilityFunctions'
import { resetTaxSettings, setSelectedTaxSetting } from 'src/store/apps/tax-settings'
import { EDIT_TAX_SETTING } from 'src/common-functions/utils/Constants'
import RefreshIcon from '@mui/icons-material/Refresh'
import MobileDataGrid from 'src/common-components/MobileDataGrid'

const TaxSettingsListTable = ({ taxModuleData }) => {
  const dispatch = useDispatch()
  const router = Router

  const isDesktop = useIsDesktop()
  const { taxSettings = [], taxAuthorities = [], financialAccounts = [] } = taxModuleData || {}

  const userProfile = useSelector(state => state.userProfile)

  const [anchorElMap, setAnchorElMap] = useState({})

  const handleClick = (event, row) => {
    dispatch(setSelectedTaxSetting(row))
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.taxAuthorityId] = event.currentTarget
    setAnchorElMap(updatedAnchorElMap)
  }

  const handleClose = row => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.taxAuthorityId] = null
    setAnchorElMap(updatedAnchorElMap)
  }

  const tradingColumns = [
    {
      field: 'taxInfo',
      headerName: '',
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => {
        const editPermission = hasPermission(userProfile, EDIT_TAX_SETTING)

        return (
          <Box sx={{ width: '100%', p: 2 }}>
            <Grid container spacing={3} sx={{ alignItems: 'center' }}>
              <Grid item xs={11}>
                <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                  <Grid item xs={12} sm={4} md={2}>
                    <Typography sx={dataTextStyles}>
                      {taxAuthorities?.find(item => item?.taxAuthorityId === row?.taxAuthorityId)?.taxAuthorityName ||
                        '-'}
                    </Typography>
                    <Typography sx={dataTitleStyles}>Tax Authority</Typography>
                  </Grid>
                  <Grid item xs={6} sm={4} md={2}>
                    <Typography sx={dataTextStyles}>{row?.taxAccountingMethod || '-'}</Typography>
                    <Typography sx={dataTitleStyles}>Accounting Method</Typography>
                  </Grid>
                  <Grid item xs={6} sm={4} md={2}>
                    <Typography sx={dataTextStyles}>
                      {financialAccounts?.find(item => item?.accountId === row?.accountPayableAccountId)?.accountName ||
                        '-'}
                    </Typography>
                    <Typography sx={dataTitleStyles}>Account Payable</Typography>
                  </Grid>
                  <Grid item xs={6} sm={4} md={2}>
                    <Typography sx={dataTextStyles}>
                      {financialAccounts?.find(item => item?.accountId === row?.differedTaxAccountId)?.accountName ||
                        '-'}
                    </Typography>
                    <Typography sx={dataTitleStyles}>Differed Tax</Typography>
                  </Grid>
                  <Grid item xs={6} sm={4} md={2}>
                    <Typography sx={dataTextStyles}>
                      {financialAccounts?.find(item => item?.accountId === row?.salesRevenueAccountId)?.accountName ||
                        '-'}
                    </Typography>
                    <Typography sx={dataTitleStyles}>Sales Revenue</Typography>
                  </Grid>
                  <Grid item xs={6} sm={4} md={2}>
                    <Typography sx={dataTextStyles}>
                      {financialAccounts?.find(item => item?.accountId === row?.costOfGoodsSoldAccountId)
                        ?.accountName || '-'}
                    </Typography>
                    <Typography sx={dataTitleStyles}>Cost Of Goods Sold</Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={1} sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isDesktop ? (
                    <>
                      <IconButton
                        onClick={event => {
                          event.stopPropagation()
                          dispatch(setSelectedTaxSetting(row))
                          router.push(`/account-settings/tax-settings/view/`)
                        }}
                      >
                        <Icon icon='tabler:eye' />
                      </IconButton>

                      {editPermission && (
                        <IconButton
                          onClick={event => {
                            event.stopPropagation()
                            dispatch(setSelectedTaxSetting(row))
                            router.push(`/account-settings/tax-settings/add/`)
                          }}
                        >
                          <Icon icon='tabler:edit' />
                        </IconButton>
                      )}
                    </>
                  ) : (
                    <>
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
                      <CommonStyledMenu
                        anchorEl={anchorElMap[row.taxAuthorityId]}
                        open={Boolean(anchorElMap[row.taxAuthorityId])}
                        onClose={() => handleClose(row)}
                      >
                        <MenuItem
                          component={Link}
                          href={`/account-settings/tax-settings/view/`}
                          onClick={() => {
                            dispatch(setSelectedTaxSetting(row))
                            router.push(`/account-settings/tax-settings/view/`)
                          }}
                        >
                          <Icon icon='tabler:eye' /> View
                        </MenuItem>

                        {editPermission && (
                          <MenuItem
                            component={Link}
                            href={`/account-settings/tax-settings/add/`}
                            onClick={() => dispatch(setSelectedTaxSetting(row))}
                          >
                            <Icon icon='tabler:edit' /> Edit
                          </MenuItem>
                        )}
                      </CommonStyledMenu>
                    </>
                  )}
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
              dispatch(resetTaxSettings())
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <MobileDataGrid
        rows={taxSettings || []}
        columns={tradingColumns}
        getRowId={row => row?.taxAuthorityId || ''}
        onRowClick={(params, event) => {
          if (event.target.closest('.MuiButton-root')) {
            event.defaultMuiPrevented = true
            return
          }
          dispatch(setSelectedTaxSetting(params.row))
          router.push(`/account-settings/tax-settings/view/`)
        }}
        slots={{
          columnHeaders: () => null,
          noRowsOverlay: CustomNoRowsOverlay
        }}
        slotProps={{
          noRowsOverlay: {
            mainText: 'Empty Tax Settings',
            subText: "No tax module settings available here. Click 'Add New' button above to get started."
          }
        }}
      />
    </>
  )
}

export default TaxSettingsListTable
