// ** Next Import
import { Close } from '@mui/icons-material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { Box, Button, Grid, IconButton, LinearProgress, MenuItem, Typography } from '@mui/material'
import Link from 'next/link'
import Router from 'next/router'
import React, { useEffect, useState } from 'react'
import { formatPhoneNumberIntl } from 'react-phone-number-input'
import { useDispatch, useSelector } from 'react-redux'
import Icon from 'src/@core/components/icon'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import CommonStyledMenu from 'src/common-components/CommonStyledMenu'
import {
  CREATE_CUSTOMER,
  CREATE_SALES_ORDER,
  CREATE_SALES_PAYMENT,
  EDIT_CUSTOMER,
  LIST_CUSTOMER
} from 'src/common-functions/utils/Constants'
import { checkAuthorizedRoute, hasPermission } from 'src/common-functions/utils/UtilityFunctions'
import { setSelectedCustomer } from 'src/store/apps/customers'
import NewSalesPaymentDrawer from '../Payment/NewSalesPaymentDrawer'
import CreateSalesOrderDrawer from '../SalesOrder/CreateSalesOrderDrawer'
import CustomerViewSection from './CustomerViewSection'
import DeleteCustomerNote from './DeleteCustomerNote'

export default function ViewCustomer({ loading, customerObject }) {
  const route = Router
  const dispatch = useDispatch()
  const { customers = [] } = customerObject
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const userProfile = useSelector(state => state.userProfile)
  const customer = useSelector(state => state.customers?.selectedCustomer) || {}
  const [selectedNotes, setSelectedNotes] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [filteredCustomers, setFilteredCustomers] = useState([])
  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl)
  const [openCreateSalesOrderDialog, setOpenCreateSalesOrderDialog] = useState(false)
  const [openCreateSalesPaymentDialog, setOpenCreateSalesPaymentDialog] = useState(false)
  const [setReloadPayment] = useState(false) // State to manage drawer open/close
  console.log('customer')

  useEffect(() => {
    if (Object.keys(customer).length === 0) {
      route.push('/sales/customer/')
    }
  }, [customer, tenantId])

  useEffect(() => {
    if (checkAuthorizedRoute(LIST_CUSTOMER, route, userProfile)) {
      setIsAuthorized(true)
    } else {
      setIsAuthorized(false)
    }
  }, [userProfile])

  if (!isAuthorized) {
    return null
  }
  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleCreateNewSalesOrder = () => {
    setAnchorEl(null)
    setOpenCreateSalesOrderDialog(true)
  }

  const handleCreateNewSalesPayment = () => {
    setAnchorEl(null)
    setOpenCreateSalesPaymentDialog(true)
  }

  const handleSearchChange = (event, newValue) => {
    const searchValue = newValue ? newValue.toLowerCase().trim() : ''

    if (searchValue) {
      const searchTerms = searchValue.split(/\s+/).filter(term => term.trim() !== '')

      const matchedCustomers = customers.filter(customer => {
        const customerName = customer.customerName.toLowerCase()
        const displayName = customer.displayName.toLowerCase()
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
    }
  }

  return (
    <React.Fragment>
      <PageHeader
        title={
          <Typography
            sx={{
              fontSize: { xs: '16px', md: '18px' },
              fontWeight: '500'
            }}
          >
            View Customer - {customer?.customerNo}
          </Typography>
        }
        button={
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            {hasPermission(userProfile, CREATE_CUSTOMER) && (
              <Button
                variant='contained'
                color='primary'
                sx={{ display: { xs: 'none', sm: 'flex' } }}
                startIcon={<AddOutlinedIcon />}
                component={Link}
                scroll={true}
                href={`/sales/customer/add-customer`}
              >
                Add New
              </Button>
            )}
            {hasPermission(userProfile, EDIT_CUSTOMER) && (
              <IconButton
                component={Link}
                scroll={true}
                href={`/sales/customer/edit/${customer.customerId}`}
                onClick={() => dispatch(setSelectedCustomer(customer))}
              >
                <Icon icon='tabler:edit' />
              </IconButton>
            )}
            <IconButton color='default' component={Link} scroll={true} href='/sales/customer/'>
              <Close sx={{ color: theme => theme.palette.primary.main }} />
            </IconButton>
            <div>
              <IconButton
                color='default'
                aria-label='more'
                id='long-button'
                aria-controls={open ? 'long-menu' : undefined}
                aria-expanded={open ? 'true' : undefined}
                aria-haspopup='true'
                onClick={handleClick}
              >
                <Icon icon='iconamoon:menu-kebab-vertical-circle' width={23} height={23} />
              </IconButton>
              <CommonStyledMenu anchorEl={anchorEl} open={open} onClose={handleClose}>
                {hasPermission(userProfile, CREATE_SALES_ORDER) && (
                  <MenuItem onClick={() => handleCreateNewSalesOrder()}>
                    <Icon icon='solar:cart-outline' />
                    Create Sales
                  </MenuItem>
                )}

                {hasPermission(userProfile, CREATE_SALES_PAYMENT) && (
                  <MenuItem onClick={() => handleCreateNewSalesPayment()}>
                    <Icon icon='solar:wallet-outline' />
                    Create Payment
                  </MenuItem>
                )}
              </CommonStyledMenu>
            </div>
          </Box>
        }
      />
      <PageWrapper>
        {loading ? (
          <LinearProgress />
        ) : (
          <div>
            <Grid container spacing={{ xs: 5, xl: 10 }}>
              <Grid item xs={12}>
                <Grid item xs={12} sm={6} md={6} lg={4} xl={4}>
                  <CustomAutocomplete
                    options={filteredCustomers.length > 0 ? filteredCustomers : customers}
                    getOptionLabel={option => {
                      const name = option?.displayName ? option.displayName : option.customerName
                      const mobile = option?.mobile ? formatPhoneNumberIntl(`+${option?.mobile}`) : ''
                      return mobile ? `${name} (${mobile})` : name
                    }}
                    isOptionEqualToValue={(option, value) => option.customerId === value.customerId}
                    value={customers?.find(option => option.customerId === customer?.customerId) || null}
                    onChange={(event, newValue) => {
                      if (newValue) {
                        dispatch(setSelectedCustomer(newValue))
                        setFilteredCustomers([])
                      }
                    }}
                    onInputChange={(event, newValue, reason) => {
                      if (reason === 'input') {
                        handleSearchChange(event, newValue)
                      }
                    }}
                    disableClearable={false}
                    filterOptions={options => options}
                    renderOption={(props, option) => (
                      <li {...props} key={option.customerId}>
                        {(() => {
                          const name = option?.displayName ? option.displayName : option.customerName
                          const mobile = option?.mobile ? formatPhoneNumberIntl(`+${option?.mobile}`) : ''
                          return mobile ? `${name} (${mobile})` : name
                        })()}
                      </li>
                    )}
                    renderInput={params => (
                      <CustomTextField
                        {...params}
                        fullWidth
                        label='Customers'
                        InputProps={{
                          ...params.InputProps
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>

              <Grid item xs={12} md={8} lg={8} xl={8.5}>
                <CustomerViewSection customerId={customer?.customerId} defaultTab='overview' />
              </Grid>
            </Grid>
          </div>
        )}
      </PageWrapper>
      {openDialog && (
        <DeleteCustomerNote
          selectedNotes={selectedNotes}
          openDialog={openDialog}
          setOpenDialog={setOpenDialog}
          customerNotesData={customerNotesData}
          setCustomerNotesData={setCustomerNotesData}
        />
      )}
      {openCreateSalesPaymentDialog && (
        <NewSalesPaymentDrawer
          openDrawer={openCreateSalesPaymentDialog}
          setOpenDrawer={setOpenCreateSalesPaymentDialog}
          setReloadPayment={setReloadPayment}
          customer={customer}
        />
      )}
      {openCreateSalesOrderDialog && (
        <CreateSalesOrderDrawer
          openDrawer={openCreateSalesOrderDialog}
          setOpenDrawer={setOpenCreateSalesOrderDialog}
          customer={customer}
        />
      )}
    </React.Fragment>
  )
}
