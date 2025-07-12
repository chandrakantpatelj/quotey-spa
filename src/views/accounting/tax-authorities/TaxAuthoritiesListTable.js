// ** Next Import
import Link from 'next/link'
import Router from 'next/router'

// ** MUI Imports
import { Box, Grid, IconButton, MenuItem, Tooltip, Typography, alpha } from '@mui/material'
import { useState } from 'react'
import Icon from 'src/@core/components/icon'
import { useDispatch, useSelector } from 'react-redux'
import CustomNoRowsOverlay from 'src/common-components/CustomNoRowsOverlay'
import CommonStyledMenu from 'src/common-components/CommonStyledMenu'
import useIsDesktop from 'src/hooks/IsDesktop'
import { dataTextStyles, dataTitleStyles, hasPermission } from 'src/common-functions/utils/UtilityFunctions'
import { resetTaxAuthorities, setSelectedTaxAuthority } from 'src/store/apps/tax-authority'
import DeleteTaxAuthority from './DeleteTaxAuthority'
import {
  DELETE_TAX_AUTHORITIES,
  EDIT_TAX_AUTHORITIES,
  VIEW_TAX_AUTHORITIES
} from 'src/common-functions/utils/Constants'
import RefreshIcon from '@mui/icons-material/Refresh'
import MobileDataGrid from 'src/common-components/MobileDataGrid'

const TaxAuthoritiesListTable = ({ taxesData }) => {
  const dispatch = useDispatch()
  const isDesktop = useIsDesktop()
  const [openDialog, setOpenDialog] = useState(false)
  const { taxAuthorities = [] } = taxesData || {}
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId)
  const selectedTaxAuthority = useSelector(state => state?.taxAuthority?.selectedTaxAuthority)
  const userProfile = useSelector(state => state.userProfile)
  const router = Router
  const [anchorElMap, setAnchorElMap] = useState({})

  const handleClick = (event, row) => {
    dispatch(setSelectedTaxAuthority(row))
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.taxAuthorityId] = event.currentTarget
    setAnchorElMap(updatedAnchorElMap)
  }

  const handleClose = row => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.taxAuthorityId] = null
    setAnchorElMap(updatedAnchorElMap)
  }

  const handleDelete = row => {
    setSelectedTaxAuthority(row)
    handleClose(row)
    setOpenDialog(true)
  }

  const mobileColumns = [
    {
      field: 'taxAuthorityInfo',
      headerName: '',
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => {
        return (
          <Box sx={{ width: '100%', p: 2 }}>
            <Grid container spacing={3} sx={{ alignItems: { xs: 'flex-start', md: 'center' } }}>
              <Grid item xs={10.5}>
                <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                  <Grid item xs={12} sm={6} md={6} lg={6}>
                    <Typography sx={{ ...dataTextStyles, fontSize: '14px', fontWeight: 500, lineHeight: '28px' }}>
                      {row?.taxAuthorityCodePrefix}
                      {row?.taxAuthorityCode || ''}
                    </Typography>
                    <Typography sx={{ ...dataTitleStyles, color: '#818181' }}>No</Typography>
                  </Grid>
                  <Grid item xs={4} sm={1.5} md={1.5} lg={1.5}>
                    <Typography sx={dataTextStyles}>{row?.taxAuthorityName || '-'}</Typography>
                    <Typography sx={dataTitleStyles}>Name</Typography>
                  </Grid>
                  <Grid item xs={4} sm={1.5} md={1.5} lg={1.5}>
                    <Typography sx={dataTextStyles}>{row?.taxAuthorityType || '-'}</Typography>
                    <Typography sx={dataTitleStyles}>Type</Typography>
                  </Grid>
                  <Grid item xs={4} sm={3} md={3} lg={3}>
                    <Typography sx={dataTextStyles}>{row?.taxAuthorityContact?.contactName || '-'}</Typography>
                    <Typography sx={{ fontSize: '12px', color: '#818181' }}>
                      {row?.taxAuthorityContact?.contactEmail || '-'}
                    </Typography>
                    <Typography sx={dataTitleStyles}>Contact</Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={1.5}>
                {isDesktop ? (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    {hasPermission(userProfile, VIEW_TAX_AUTHORITIES) && (
                      <IconButton
                        component={Link}
                        href={`/accounting/tax-authorities/view/${row?.taxAuthorityId}`}
                        onClick={() => dispatch(setSelectedTaxAuthority(row))}
                      >
                        <Icon icon='tabler:eye' />
                      </IconButton>
                    )}
                    {hasPermission(userProfile, EDIT_TAX_AUTHORITIES) && (
                      <IconButton
                        component={Link}
                        href={`/accounting/tax-authorities/edit/${row?.taxAuthorityId}`}
                        onClick={() => dispatch(setSelectedTaxAuthority(row))}
                      >
                        <Icon icon='tabler:edit' />
                      </IconButton>
                    )}
                    <IconButton onClick={event => handleClick(event, row)}>
                      <Icon icon='iconamoon:menu-kebab-vertical-circle-light' width={25} height={25} />
                    </IconButton>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <IconButton onClick={event => handleClick(event, row)}>
                      <Icon icon='iconamoon:menu-kebab-vertical-circle-light' width={27} height={27} />
                    </IconButton>
                  </Box>
                )}
                <CommonStyledMenu
                  anchorEl={anchorElMap[row.taxAuthorityId]}
                  open={Boolean(anchorElMap[row.taxAuthorityId])}
                  onClose={() => handleClose(row)}
                >
                  {!isDesktop && hasPermission(userProfile, VIEW_TAX_AUTHORITIES) && (
                    <MenuItem
                      component={Link}
                      href={`/accounting/tax-authorities/view/${row?.taxAuthorityId}`}
                      onClick={() => dispatch(setSelectedTaxAuthority(row))}
                    >
                      <Icon icon='tabler:eye' /> View
                    </MenuItem>
                  )}
                  {!isDesktop && hasPermission(userProfile, EDIT_TAX_AUTHORITIES) && (
                    <MenuItem
                      component={Link}
                      href={`/accounting/tax-authorities/edit/${row?.taxAuthorityId}`}
                      onClick={() => dispatch(setSelectedTaxAuthority(row))}
                    >
                      <Icon icon='tabler:edit' /> Edit
                    </MenuItem>
                  )}
                  {hasPermission(userProfile, DELETE_TAX_AUTHORITIES) && (
                    <MenuItem
                      onClick={() => handleDelete(row)}
                      sx={{
                        color: theme => theme?.palette?.error?.main,
                        '&:hover': {
                          color: theme => theme?.palette?.error?.main + ' !important',
                          backgroundColor: theme =>
                            alpha(theme.palette.error.main, theme.palette.action.selectedOpacity) + ' !important'
                        }
                      }}
                    >
                      <Icon icon='mingcute:delete-2-line' /> Delete
                    </MenuItem>
                  )}
                </CommonStyledMenu>
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
              dispatch(resetTaxAuthorities())
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <MobileDataGrid
        rows={taxAuthorities || []}
        columns={mobileColumns}
        getRowId={row => row?.taxAuthorityId}
        initialState={{
          sorting: {
            sortModel: [{ field: 'taxAuthorityCode', sort: 'desc' }]
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
          dispatch(setSelectedTaxAuthority(params.row))
          router.push(`/accounting/tax-authorities/view/${params?.row?.taxAuthorityId}`)
        }}
        slots={{
          columnHeaders: () => null,
          noRowsOverlay: CustomNoRowsOverlay
        }}
        slotProps={{
          noRowsOverlay: {
            mainText: 'Empty Tax Authorities',
            subText: 'No Authority available here. Click "Add New" button above to get started.'
          }
        }}
      />
      {openDialog && (
        <DeleteTaxAuthority
          tenantId={tenantId}
          taxAuthorityId={selectedTaxAuthority?.taxAuthorityId}
          openDialog={openDialog}
          setOpenDialog={setOpenDialog}
        />
      )}
    </>
  )
}

export default TaxAuthoritiesListTable
