// ** Next Import
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Box, Grid, IconButton, MenuItem, Tooltip, Typography } from '@mui/material'
import Icon from 'src/@core/components/icon'
import { DataGrid } from '@mui/x-data-grid'
import { refreshCompany, setActionSelectedTenant } from 'src/store/apps/company'
import { useDispatch, useSelector } from 'react-redux'
import CustomNoRowsOverlay from 'src/common-components/CustomNoRowsOverlay'
import useIsDesktop from 'src/hooks/IsDesktop'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import CommonStyledMenu from 'src/common-components/CommonStyledMenu'
import RefreshIcon from '@mui/icons-material/Refresh'
import MobileDataGrid from 'src/common-components/MobileDataGrid'
import { dataTextStyles, dataTitleStyles } from 'src/common-functions/utils/UtilityFunctions'
import Router from 'next/router'
export const MOBILE_COLUMNS = {
  primaryContact: false,
  businessName: false
}
export const ALL_COLUMNS = {}

const CompanyListTable = ({ tenantsObject }) => {
  const router = Router
  const dispatch = useDispatch()
  const isDesktop = useIsDesktop()
  const userProfile = useSelector(state => state.userProfile)

  const { tenants = [] } = tenantsObject

  const [anchorElMap, setAnchorElMap] = useState({})

  const handleClick = (event, row) => {
    dispatch(setActionSelectedTenant(row))
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.tenantId] = event.currentTarget
    setAnchorElMap(updatedAnchorElMap)
  }

  const handleClose = row => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.tenantId] = null
    setAnchorElMap(updatedAnchorElMap)
  }

  const [columnVisible, setColumnVisible] = useState(ALL_COLUMNS)
  useEffect(() => {
    const newColumns = isDesktop ? ALL_COLUMNS : MOBILE_COLUMNS
    setColumnVisible(newColumns)
  }, [isDesktop])

  // const handleDateRange = async (startDate, endDate) => {
  //   try {
  //     const response = await fetchData(
  //       GetTenantsByDateRangeQuery(formatDateString(startDate), formatDateString(endDate))
  //     )
  //     if (response?.getTenantsByDateRange) {
  //       setTenantsObject(prevState => ({
  //         ...prevState,
  //         tenants: response?.getTenantsByDateRange
  //       }))
  //     }
  //   } catch (error) {
  //     console.error('Failed to fetch data:', error)
  //   } finally {
  //     console.log('fetched data successfully')
  //   }
  // }

  const companyColumns = [
    {
      field: 'companyInfo',
      headerName: '',
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => {
        return (
          <Box sx={{ width: '100%', p: 2 }}>
            <Grid container spacing={3} sx={{ alignItems: 'center', flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
              <Grid item xs={11}>
                <Grid container spacing={3} sx={{ alignItems: 'center', flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
                  <Grid item xs={12} sm={2} md={2} lg={2} xl={2}>
                    <Typography sx={dataTextStyles}>{row?.tenantNo || ''}</Typography>
                    <Typography sx={dataTitleStyles}>No</Typography>
                  </Grid>
                  <Grid item xs={6} sm={2} md={2} lg={4} xl={4}>
                    <Typography sx={dataTextStyles}>{row?.displayName || '-'}</Typography>
                    <Typography sx={dataTitleStyles}>Company Name</Typography>
                  </Grid>
                  <Grid item xs={6} sm={2} md={2} lg={4} xl={4}>
                    <Typography sx={dataTextStyles}>{row?.businessName || '-'}</Typography>
                    <Typography sx={dataTitleStyles}>Business Name</Typography>
                  </Grid>
                  <Grid item xs={6} sm={2} md={2} lg={5} xl={5}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography sx={dataTextStyles}>
                        {row?.primaryContact?.firstName} {row?.primaryContact?.lastName}
                      </Typography>
                      <Typography sx={{ fontSize: '12px', color: '#818181' }}>{row?.emailAddress || '-'}</Typography>
                    </Box>
                    <Typography sx={dataTitleStyles}>Primary Contact</Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={1} sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isDesktop && (
                    <IconButton
                      href={`/account-settings/company/view/${row?.tenantId}`}
                      onClick={() => dispatch(setActionSelectedTenant(row))}
                    >
                      <Icon icon='tabler:eye' />
                    </IconButton>
                  )}
                  {isDesktop && (
                    <IconButton
                      href={`/account-settings/company/edit/${row?.tenantId}`}
                      onClick={() => dispatch(setActionSelectedTenant(row))}
                    >
                      <Icon icon='tabler:edit' />
                    </IconButton>
                  )}
                  {!isDesktop && (
                    <IconButton
                      onClick={event => {
                        event.stopPropagation() // Prevents row selection
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
                    anchorEl={anchorElMap[row.tenantId]}
                    open={Boolean(anchorElMap[row.tenantId])}
                    onClose={() => handleClose(row)}
                  >
                    <MenuItem
                      component={Link}
                      href={`/account-settings/company/view/${row?.tenantId}`}
                      onClick={() => dispatch(setActionSelectedTenant(row))}
                    >
                      <Icon icon='tabler:eye' /> View
                    </MenuItem>
                    <MenuItem
                      component={Link}
                      href={`/account-settings/company/edit/${row?.tenantId}`}
                      onClick={() => dispatch(setActionSelectedTenant(row))}
                    >
                      <Icon icon='tabler:edit' /> Edit
                    </MenuItem>
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
              dispatch(refreshCompany())
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <MobileDataGrid
        rows={tenants || []}
        columns={companyColumns}
        getRowId={row => row?.tenantId}
        initialState={{
          sorting: {
            sortModel: [{ field: 'tenantNo', sort: 'desc' }]
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
          dispatch(setActionSelectedTenant(params.row))
          router.push(`/account-settings/company/view/${params?.row?.tenantId}`)
        }}
        slots={{
          columnHeaders: () => null,
          noRowsOverlay: CustomNoRowsOverlay
        }}
        slotProps={{
          noRowsOverlay: {
            mainText: 'Empty Companies',
            subText: "No company available here. Click 'Add New' button above to get started."
          }
        }}
      />
    </>
  )
}

export default CompanyListTable
