// ** Next Import
import Link from 'next/link'
import Router from 'next/router'

// ** MUI Imports
import { alpha, Box, Divider, Grid, IconButton, MenuItem, Tooltip, Typography } from '@mui/material'
import { useState } from 'react'
import Icon from 'src/@core/components/icon'
import DeleteVendors from 'src/views/purchase/vendor/DeleteVendors'
import { useDispatch, useSelector } from 'react-redux'
import CustomNoRowsOverlay from 'src/common-components/CustomNoRowsOverlay'
import CommonStyledMenu from 'src/common-components/CommonStyledMenu'
import { resetVendor, setSelectedVendor } from 'src/store/apps/vendors'
import useIsDesktop, { useIsLaptop, useIsMobile } from 'src/hooks/IsDesktop'
import { dataTextStyles, dataTitleStyles, hasPermission } from 'src/common-functions/utils/UtilityFunctions'
import { DELETE_VENDOR, EDIT_VENDOR, VIEW_VENDOR } from 'src/common-functions/utils/Constants'
import CommonVendorNotesPopup from 'src/common-components/CommonVendorNotesPopup'
import RefreshIcon from '@mui/icons-material/Refresh'
import DeleteSelectedVendors from './DeleteSelectedVendors'
import MobileDataGrid from 'src/common-components/MobileDataGrid'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import { formatPhoneNumberIntl } from 'react-phone-number-input'
import CustomTextField from 'src/@core/components/mui/text-field'

const VendorListTable = ({ tenantId, vendorData }) => {
  const router = Router
  const dispatch = useDispatch()
  const isLaptop = useIsLaptop()
  const isMobileView = useIsMobile()

  const userProfile = useSelector(state => state.userProfile)

  const [openDialog, setOpenDialog] = useState(false)
  const { vendors = [], currencies = [] } = vendorData || {}
  const [selecedVendor, setSelecedVendor] = useState('')
  const [anchorElMap, setAnchorElMap] = useState({})
  const [openVendorNotesDialog, setOpenVendorNOtesDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [selectedRows, setSelectedRows] = useState([])
  const [filteredVendors, setFilteredVendors] = useState([])
  const [searchedVendor, setSearchedVendor] = useState(null)
  const handleClick = (event, row) => {
    dispatch(setSelectedVendor(row))
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.vendorId] = event.currentTarget
    setAnchorElMap(updatedAnchorElMap)
  }
  const handleVendorNotesDialoge = row => {
    setSelecedVendor(row)
    handleClose(row)
    setOpenVendorNOtesDialog(true)
  }

  const handleClose = row => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.vendorId] = null
    setAnchorElMap(updatedAnchorElMap)
  }

  const handleDelete = row => {
    setSelecedVendor(row)
    handleClose(row)
    setOpenDialog(true)
  }

  const columns = [
    {
      flex: 1,
      minWidth: 80,
      field: 'vendorNo',
      headerName: '',
      sortable: false,

      renderCell: params => {
        const { row } = params
        const currency = currencies?.find(val => val?.currencyId === row?.currencyId)

        return (
          <Box sx={{ width: '100%', p: 2 }}>
            <Grid container spacing={3} sx={{ alignItems: { xs: 'flex-start', lg: 'center' } }}>
              <Grid item xs={10.5}>
                <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                  <Grid item xs={12} sm={6} md={4} lg={4.5} xl={5.5}>
                    <Typography sx={{ ...dataTextStyles, fontSize: '14px', fontWeight: 500, lineHeight: '28px' }}>
                      {row.displayName}
                    </Typography>
                    <Box
                      sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: '5px', md: '15px' }, alignItems: 'center' }}
                    >
                      <Typography sx={{ ...dataTitleStyles, color: '#818181' }}>
                        <span style={{ verticalAlign: 'middle', marginRight: '5px', color: '#696969' }}>#</span>{' '}
                        {row.vendorNoPrefix}
                        {row.vendorNo}
                      </Typography>

                      <Typography sx={{ ...dataTitleStyles }}>
                        <Icon
                          icon='hugeicons:corporate'
                          width='15px'
                          style={{ verticalAlign: 'middle', color: '#696969', marginRight: '5px' }}
                        />
                        {row.companyName}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={0} sm={6} md={2.5} lg={2} xl={2} sx={{ display: { xs: 'none', md: 'block' } }}>
                    <>
                      {row?.primaryContact?.title && row?.primaryContact?.firstName && row?.primaryContact?.lastName ? (
                        <Typography sx={dataTextStyles}>
                          {row?.primaryContact?.title} {row?.primaryContact?.firstName} {row?.primaryContact?.lastName}
                        </Typography>
                      ) : (
                        '-'
                      )}
                      <Typography sx={dataTextStyles}>{row?.emailAddress || '-'}</Typography>
                      <Typography sx={{ ...dataTitleStyles }}>Contact</Typography>
                    </>
                  </Grid>
                  <Grid item xs={0} sm={6} md={1.5} lg={2} xl={1.5} sx={{ display: { xs: 'none', sm: 'block' } }}>
                    {row?.currencyId ? (
                      <Typography sx={dataTextStyles}>
                        {currency?.symbol} {currency?.currencyId}
                      </Typography>
                    ) : (
                      '-'
                    )}
                    <Typography sx={dataTitleStyles}>Currency</Typography>
                  </Grid>
                  <Grid item xs={0} sm={6} md={2} lg={2} xl={1.5} sx={{ display: { xs: 'none', sm: 'block' } }}>
                    <Typography sx={dataTextStyles}>{row.paymentTermsId || '-'}</Typography>{' '}
                    <Typography sx={dataTitleStyles}>Payment Terms</Typography>
                  </Grid>
                  <Grid item xs={0} sm={6} md={2} lg={1.5} xl={1.5} sx={{ display: { xs: 'none', sm: 'block' } }}>
                    <Typography sx={dataTextStyles}>{row.shippingPreference || '-'}</Typography>{' '}
                    <Typography sx={dataTitleStyles}>Shipping Preference</Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={1.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  {isLaptop && (
                    <>
                      {/* View Button (Visible in Non-Mobile View) */}
                      {hasPermission(userProfile, VIEW_VENDOR) && (
                        <IconButton
                          component={Link}
                          href={`/purchases/vendors/view/${row?.vendorId}`}
                          onClick={event => {
                            event.stopPropagation()
                            dispatch(setSelectedVendor(row))
                          }}
                        >
                          <Icon icon='tabler:eye' />
                        </IconButton>
                      )}

                      {/* Edit Button (Visible in Non-Mobile View) */}
                      {hasPermission(userProfile, EDIT_VENDOR) && (
                        <IconButton
                          component={Link}
                          href={`/purchases/vendors/edit/${row?.vendorId}`}
                          onClick={event => {
                            event.stopPropagation()
                            dispatch(setSelectedVendor(row))
                          }}
                        >
                          <Icon icon='tabler:edit' />
                        </IconButton>
                      )}
                    </>
                  )}

                  <IconButton
                    onClick={event => {
                      event.stopPropagation()
                      handleClick(event, row)
                    }}
                  >
                    <Icon
                      icon='iconamoon:menu-kebab-vertical-circle-light'
                      width={isMobileView ? 27 : 25}
                      height={isMobileView ? 27 : 25}
                    />
                  </IconButton>
                </Box>

                <CommonStyledMenu
                  anchorEl={anchorElMap[row.vendorId]}
                  open={Boolean(anchorElMap[row.vendorId])}
                  onClose={() => handleClose(row)}
                >
                  {/* Move View & Edit buttons inside menu for Mobile View */}
                  {hasPermission(userProfile, VIEW_VENDOR) && !isLaptop && (
                    <MenuItem component={Link} href={`/purchases/vendors/view/${row?.vendorId}`}>
                      <Icon icon='tabler:eye' /> View
                    </MenuItem>
                  )}
                  {hasPermission(userProfile, EDIT_VENDOR) && !isLaptop && (
                    <MenuItem component={Link} href={`/purchases/vendors/edit/${row?.vendorId}`}>
                      <Icon icon='tabler:edit' /> Edit
                    </MenuItem>
                  )}

                  {/* Notes Option */}
                  <MenuItem
                    onClick={event => {
                      event.stopPropagation()
                      handleVendorNotesDialoge(row)
                    }}
                  >
                    <Icon icon='codicon:note' /> Notes
                  </MenuItem>

                  {hasPermission(userProfile, DELETE_VENDOR) && (
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
  const handleSearchChange = (event, newValue) => {
    const searchValue = newValue ? newValue.toLowerCase().trim() : ''

    if (searchValue) {
      const searchTerms = searchValue.split(/\s+/).filter(term => term.trim() !== '')

      const matchedCustomers = vendors.filter(vendor => {
        const displayName = vendor.displayName.toLowerCase()
        const mobile = vendor.mobile.toLowerCase()
        const email = vendor.emailAddress.toLowerCase()

        const primaryContact = vendor.primaryContact || {}
        const title = primaryContact.title ? primaryContact.title.toLowerCase() : ''
        const firstName = primaryContact.firstName ? primaryContact.firstName.toLowerCase() : ''
        const lastName = primaryContact.lastName ? primaryContact.lastName.toLowerCase() : ''

        let nameMatch = false
        let mobileMatch = false

        searchTerms.forEach(term => {
          if (isNaN(term)) {
            if (
              displayName.includes(term) ||
              email.includes(term) ||
              title.includes(term) ||
              firstName.includes(term) ||
              lastName.includes(term)
            ) {
              nameMatch = true
            }
          } else {
            if (mobile.includes(term)) {
              mobileMatch = true
            }
          }
        })

        if (searchTerms.length > 1) {
          return nameMatch && mobileMatch
        }

        return nameMatch || mobileMatch
      })

      setFilteredVendors(matchedCustomers.length > 0 ? matchedCustomers : [])
    } else {
      setFilteredVendors([])
      setSearchedVendor('')
    }
  }
  return (
    <>
      <Grid container spacing={2} sx={{ justifyContent: 'space-between', mb: 3 }}>
        <Grid item xs={7} sm={4} md={4} lg={4} xl={4}>
          <CustomAutocomplete
            options={filteredVendors.length > 0 ? filteredVendors : vendors}
            getOptionLabel={option => {
              const name = option.displayName
              const mobile = option?.mobile ? formatPhoneNumberIntl(`+${option?.mobile}`) : ''

              return mobile ? `${name} (${mobile})` : name
            }}
            isOptionEqualToValue={(option, value) => option.vendorId === value.vendorId}
            value={vendors?.find(option => option.vendorId === searchedVendor?.vendorId) || null}
            onChange={(event, newValue) => {
              setFilteredVendors(newValue ? [newValue] : [])
              setSearchedVendor(newValue)
            }}
            onInputChange={(event, newValue) => handleSearchChange(event, newValue)}
            disableClearable={false}
            filterOptions={options => options}
            renderInput={params => (
              <CustomTextField
                {...params}
                fullWidth
                label='Vendors'
                InputProps={{
                  ...params.InputProps
                }}
              />
            )}
          />
        </Grid>
        <Grid item xs={5} sm={6} md={6} lg={6} xl={6}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end'
            }}
          >
            <Tooltip title='Reload' placement='top'>
              <IconButton color='default' onClick={() => dispatch(resetVendor())}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Grid>
      </Grid>

      <MobileDataGrid
        rows={filteredVendors.length > 0 ? filteredVendors : vendors}
        columns={columns}
        getRowId={row => row?.vendorId}
        initialState={{
          sorting: {
            sortModel: [{ field: 'vendorNo', sort: 'desc' }]
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
          dispatch(setSelectedVendor(params.row))
          router.push(`/purchases/vendors/view/${params?.row?.vendorId}`)
        }}
        slots={{
          columnHeaders: () => null,
          noRowsOverlay: CustomNoRowsOverlay
        }}
        slotProps={{
          noRowsOverlay: {
            mainText: 'Empty Vendors',
            subText: 'No vendor available here. Click "Add New" button above to get started.'
          }
        }}
      />
      {openDialog && (
        <DeleteVendors
          tenantId={tenantId}
          vendorId={selecedVendor?.vendorId}
          openDialog={openDialog}
          setOpenDialog={setOpenDialog}
        />
      )}
      {openVendorNotesDialog && (
        <CommonVendorNotesPopup
          vendorId={selecedVendor?.vendorId}
          openVendorNotesDialog={openVendorNotesDialog}
          setOpenVendorNOtesDialog={setOpenVendorNOtesDialog}
        />
      )}
      {openDeleteDialog && (
        <DeleteSelectedVendors
          tenantId={tenantId}
          selectedRows={selectedRows}
          openDialog={openDeleteDialog}
          setOpenDialog={setOpenDeleteDialog}
        />
      )}
    </>
  )
}

export default VendorListTable
