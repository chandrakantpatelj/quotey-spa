// ** Next Import
import Link from 'next/link'
import Router from 'next/router'

import Box from '@mui/material/Box'
import { Divider, Grid, IconButton, MenuItem, Tooltip, Typography, alpha } from '@mui/material'
import { useState } from 'react'
import Deletecustomer from './DeleteCustomer'
import { resetCustomer, setSelectedCustomer } from 'src/store/apps/customers'
import { useDispatch, useSelector } from 'react-redux'
import Icon from 'src/@core/components/icon'
import CustomNoRowsOverlay from 'src/common-components/CustomNoRowsOverlay'
import CommonStyledMenu from 'src/common-components/CommonStyledMenu'
import { dataTextStyles, dataTitleStyles, hasPermission } from 'src/common-functions/utils/UtilityFunctions'
import { DELETE_CUSTOMER, EDIT_CUSTOMER, VIEW_CUSTOMER } from 'src/common-functions/utils/Constants'
import CommonCustomerNotesPopup from 'src/common-components/CommonCustomerNotesPopup'
import MobileDataGrid from 'src/common-components/MobileDataGrid'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import { useIsLaptop } from 'src/hooks/IsDesktop'
import { Refresh } from '@mui/icons-material'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'
import { formatPhoneNumberIntl } from 'react-phone-number-input'

const CustomerListTable = ({ tenantId, customerData }) => {
  const router = Router
  const dispatch = useDispatch()
  const [filteredCustomers, setFilteredCustomers] = useState([])
  const [searchedProduct, setSearchedCustomer] = useState(null)

  const isLaptop = useIsLaptop()

  const userProfile = useSelector(state => state.userProfile)

  const [openCustomerNotesDialog, setOpenCustomerNOtesDialog] = useState(false)

  const [openDialog, setOpenDialog] = useState(false)
  const { customers = [] } = customerData || {}
  const { currencies = [] } = useCurrencies()

  const [selecedCustomer, setSelecedCustomer] = useState('')
  const [anchorElMap, setAnchorElMap] = useState({})

  const handleClick = (event, row) => {
    dispatch(setSelectedCustomer(row))
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.customerId] = event.currentTarget
    setAnchorElMap(updatedAnchorElMap)
  }

  const handleClose = row => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.customerId] = null
    setAnchorElMap(updatedAnchorElMap)
  }

  const handleDelete = row => {
    setSelecedCustomer(row)
    handleClose(row)
    setOpenDialog(true)
  }

  const handleCustomerNotesDialoge = row => {
    setSelecedCustomer(row)
    handleClose(row)
    setOpenCustomerNOtesDialog(true)
  }

  const mobileColumns = [
    {
      field: 'customerNo',
      headerName: '',
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => {
        const viewPermission = hasPermission(userProfile, VIEW_CUSTOMER)
        const editPermission = hasPermission(userProfile, EDIT_CUSTOMER)
        const deletePermission = hasPermission(userProfile, DELETE_CUSTOMER)

        const currency = currencies?.find(val => val?.currencyId === row?.currencyId)

        return (
          <Box sx={{ width: '100%', p: 2 }}>
            <Grid container spacing={3} sx={{ alignItems: { xs: 'flex-start', lg: 'center' } }}>
              <Grid item xs={10.5}>
                <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                  <Grid item xs={12} sm={6} md={4} lg={4} xl={5.5}>
                    <Typography sx={{ ...dataTextStyles, fontSize: '14px', fontWeight: 500, lineHeight: '28px' }}>
                      {row.customerName}
                    </Typography>
                    <Box
                      sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: '5px', md: '15px' }, alignItems: 'center' }}
                    >
                      <Typography sx={{ ...dataTitleStyles, color: '#818181' }}>
                        <span style={{ verticalAlign: 'middle', marginRight: '5px', color: '#696969' }}>#</span>{' '}
                        {row.customerNoPrefix}
                        {row.customerNo}
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

                  <Grid item xs={0} sm={6} md={2.5} lg={2} xl={2} sx={{ display: { xs: 'none', sm: 'block' } }}>
                    <Typography sx={dataTextStyles}>
                      {row?.primaryContact?.title} {row?.primaryContact?.firstName} {row?.primaryContact?.lastName}
                    </Typography>
                    <Typography sx={dataTextStyles}>{row?.emailAddress || '-'}</Typography>
                    <Typography sx={{ ...dataTitleStyles }}>Contact</Typography>
                  </Grid>

                  <Grid item xs={0} sm={6} md={1.5} lg={2} xl={1.5} sx={{ display: { xs: 'none', sm: 'block' } }}>
                    <Typography sx={dataTextStyles}>
                      {currency?.symbol} {currency?.currencyId || '-'}
                    </Typography>
                    <Typography sx={dataTitleStyles}>Currency</Typography>
                  </Grid>

                  <Grid item xs={0} sm={6} md={2} lg={2} xl={1.5} sx={{ display: { xs: 'none', sm: 'block' } }}>
                    <Typography sx={dataTextStyles}>{row.paymentTerms || '-'}</Typography>
                    <Typography sx={dataTitleStyles}>Payment Terms</Typography>
                  </Grid>

                  <Grid item xs={0} sm={6} md={2} lg={2} xl={1.5} sx={{ display: { xs: 'none', sm: 'block' } }}>
                    <Typography sx={dataTextStyles}>{row.shippingPreference || '-'}</Typography>
                    <Typography sx={dataTitleStyles}>Shipping Preference</Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={1.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  {isLaptop && (
                    <>
                      {viewPermission && (
                        <IconButton
                          variant='outlined'
                          component={Link}
                          scroll={true}
                          href={`/sales/customer/view/${row?.customerId}`}
                          onClick={event => {
                            event.stopPropagation()
                            dispatch(setSelectedCustomer(row))
                          }}
                        >
                          <Icon icon='tabler:eye' />
                        </IconButton>
                      )}
                      {editPermission && (
                        <IconButton
                          variant='outlined'
                          component={Link}
                          scroll={true}
                          href={`/sales/customer/edit/${row?.customerId}`}
                          onClick={event => {
                            event.stopPropagation()
                            dispatch(setSelectedCustomer(row))
                          }}
                        >
                          <Icon icon='tabler:edit' />
                        </IconButton>
                      )}
                    </>
                  )}
                  <IconButton
                    aria-label='more'
                    id='long-button'
                    aria-haspopup='true'
                    onClick={event => {
                      event.stopPropagation()
                      handleClick(event, row)
                    }}
                  >
                    <Icon icon='iconamoon:menu-kebab-vertical-circle-light' width={27} height={27} />
                  </IconButton>
                  <CommonStyledMenu
                    anchorEl={anchorElMap[row.customerId]}
                    open={Boolean(anchorElMap[row.customerId])}
                    onClose={() => handleClose(row)}
                  >
                    {viewPermission && !isLaptop && (
                      <MenuItem component={Link} scroll={true} href={`/sales/customer/view/${row.customerId}`}>
                        <Icon icon='tabler:eye' />
                        View
                      </MenuItem>
                    )}
                    {editPermission && !isLaptop && (
                      <MenuItem component={Link} scroll={true} href={`/sales/customer/edit/${row.customerId}`}>
                        <Icon icon='tabler:edit' />
                        Edit
                      </MenuItem>
                    )}
                    {editPermission && (
                      <MenuItem
                        onClick={event => {
                          event.stopPropagation()
                          handleCustomerNotesDialoge(row)
                        }}
                      >
                        <Icon icon='codicon:note' />
                        Notes
                      </MenuItem>
                    )}
                    {deletePermission && (
                      <>
                        <Divider sx={{ my: 1 }} />
                        <MenuItem
                          sx={{
                            color: theme => theme?.palette?.error?.main,
                            '&:hover': {
                              color: theme => theme?.palette?.error?.main + ' !important',
                              backgroundColor: theme =>
                                alpha(theme.palette.error.main, theme.palette.action.selectedOpacity) + ' !important'
                            }
                          }}
                          onClick={event => {
                            event.stopPropagation()
                            handleDelete(row)
                          }}
                        >
                          <Icon icon='mingcute:delete-2-line' />
                          Delete
                        </MenuItem>
                      </>
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

  const handleSearchChange = (event, newValue) => {
    const searchValue = newValue ? newValue.toLowerCase().trim() : ''

    if (searchValue) {
      const searchTerms = searchValue.split(/\s+/).filter(term => term.trim() !== '')

      const matchedCustomers = customers.filter(customer => {
        const customerName = customer.customerName.toLowerCase()
        const displayName = customer.displayName.toLowerCase()
        const companyName = customer.companyName ? customer.companyName.toLowerCase() : ''
        const mobile = customer.mobile.toLowerCase()
        const email = customer.emailAddress.toLowerCase()

        const primaryContact = customer.primaryContact || {}
        const title = primaryContact.title ? primaryContact.title.toLowerCase() : ''
        const firstName = primaryContact.firstName ? primaryContact.firstName.toLowerCase() : ''
        const lastName = primaryContact.lastName ? primaryContact.lastName.toLowerCase() : ''

        const deliveryAddress = customer.deliveryAddress || {}
        const billingAddress = customer.billingAddress || {}

        const addressFields = [
          deliveryAddress.addressLine1,
          deliveryAddress.addressLine2,
          deliveryAddress.cityOrTown,
          deliveryAddress.state,
          deliveryAddress.postcode,
          deliveryAddress.country,
          billingAddress.addressLine1,
          billingAddress.addressLine2,
          billingAddress.cityOrTown,
          billingAddress.state,
          billingAddress.postcode,
          billingAddress.country
        ]
          .filter(Boolean) // Remove null/undefined values
          .map(field => field.toLowerCase())

        let nameMatch = false
        let mobileMatch = false
        let addressMatch = false

        searchTerms.forEach(term => {
          if (isNaN(term)) {
            if (
              customerName.includes(term) ||
              displayName.includes(term) ||
              companyName.includes(term) ||
              email.includes(term) ||
              title.includes(term) ||
              firstName.includes(term) ||
              lastName.includes(term) ||
              addressFields.some(field => field.includes(term))
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

        return nameMatch || mobileMatch || addressMatch
      })

      setFilteredCustomers(matchedCustomers.length > 0 ? matchedCustomers : [])
    } else {
      setFilteredCustomers([])
      setSearchedCustomer('')
    }
  }

  return (
    <>
      <Grid container spacing={2} sx={{ justifyContent: 'space-between', mb: 3 }}>
        <Grid item xs={7} sm={4} md={4} lg={4} xl={4}>
          <CustomAutocomplete
            options={filteredCustomers.length > 0 ? filteredCustomers : customers}
            getOptionLabel={option => {
              console.log('option', option)
              if (!option) return ''

              const customerName = option?.customerName || ''
              const displayName = option?.displayName || ''
              const displayCompName = option?.companyName ? `-${option.companyName}` : ''

              const displayNameText = displayName && displayName !== customerName ? ` (${displayName})` : ''

              const mobile = option?.mobile ? formatPhoneNumberIntl(`+${option.mobile}`) : ''

              return mobile
                ? `${customerName}${displayNameText} (${mobile})${displayCompName}`
                : `${customerName}${displayNameText}${displayCompName}`
            }}
            isOptionEqualToValue={(option, value) => option.customerId === value.customerId}
            value={customers?.find(option => option.customerId === searchedProduct?.customerId) || null}
            onChange={(event, newValue) => {
              setFilteredCustomers(newValue ? [newValue] : [])
              setSearchedCustomer(newValue)
            }}
            onInputChange={(event, newValue) => handleSearchChange(event, newValue)}
            disableClearable={false}
            filterOptions={options => options}
            renderInput={params => (
              <CustomTextField
                {...params}
                fullWidth
                label='customers'
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
              justifyContent: 'flex-end',
              gap: 3
            }}
          >
            <Tooltip title='Reload' placement='top'>
              <IconButton
                color='default'
                onClick={() => {
                  dispatch(resetCustomer())
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Grid>
      </Grid>
      <MobileDataGrid
        rows={filteredCustomers.length > 0 ? filteredCustomers : customers}
        columns={mobileColumns}
        getRowId={row => row.customerId}
        initialState={{
          sorting: {
            sortModel: [{ field: 'customerNo', sort: 'desc' }]
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
          dispatch(setSelectedCustomer(params.row))
          router.push(`/sales/customer/view/${params?.row?.customerId}`)
        }}
        slots={{
          columnHeaders: () => null,
          noRowsOverlay: CustomNoRowsOverlay
        }}
        slotProps={{
          noRowsOverlay: {
            mainText: 'Empty Customers',
            subText: 'No customer available here. Click "Add New" button above to get started.'
          }
        }}
      />
      {/* )} */}
      {openDialog && (
        <Deletecustomer
          tenantId={tenantId}
          customerId={selecedCustomer?.customerId}
          openDialog={openDialog}
          setOpenDialog={setOpenDialog}
        />
      )}
      {openCustomerNotesDialog && (
        <CommonCustomerNotesPopup
          customerId={selecedCustomer?.customerId}
          openCustomerNotesDialog={openCustomerNotesDialog}
          setOpenCustomerNOtesDialog={setOpenCustomerNOtesDialog}
        />
      )}
      {/* {openDeleteDialog && (
        <DeleteSelectedCustomers
          tenantId={tenantId}
          selectedRows={selectedRows}
          openDialog={openDeleteDialog}
          setOpenDialog={setOpenDeleteDialog}
        />
      )} */}
    </>
  )
}

export default CustomerListTable
