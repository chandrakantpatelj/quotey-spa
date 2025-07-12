// ** Next Import
import Link from 'next/link'
import Router from 'next/router'
import { useEffect } from 'react'
import { Box, Button, IconButton, Typography, Grid, LinearProgress } from '@mui/material'
import { Close } from '@mui/icons-material'
import Icon from 'src/@core/components/icon'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import PageHeader from 'src/@core/components/page-header'
import { setSelectedVendor } from 'src/store/apps/vendors'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import { useDispatch, useSelector } from 'react-redux'
import { hasPermission } from 'src/common-functions/utils/UtilityFunctions'
import { CREATE_VENDOR, EDIT_VENDOR, OVERVIEW } from 'src/common-functions/utils/Constants'
import VendorViewSection from './VendorViewSection'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'

export default function ViewVendor({ loading, vendorObject }) {
  const route = Router
  const dispatch = useDispatch()
  const userProfile = useSelector(state => state.userProfile)
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId)

  const { vendors } = vendorObject
  const vendor = useSelector(state => state.vendors?.selectedVendor) || {}

  useEffect(() => {
    if (Object.keys(vendor).length === 0) {
      route.push('/purchases/vendors/')
    }
  }, [vendor, tenantId])
  return (
    <div>
      <PageHeader
        title={
          <Typography
            sx={{
              fontSize: { xs: '16px', md: '18px' },
              fontWeight: '500'
            }}
          >
            View Vendor - {vendor?.vendorNo}
          </Typography>
        }
        button={
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            {hasPermission(userProfile, CREATE_VENDOR) && (
              <Button
                variant='contained'
                color='primary'
                sx={{ display: { xs: 'none', sm: 'flex' } }}
                startIcon={<AddOutlinedIcon />}
                component={Link}
                scroll={true}
                href={`/purchases/vendors/add-vendor`}
              >
                Add New
              </Button>
            )}
            {hasPermission(userProfile, EDIT_VENDOR) && (
              <IconButton
                component={Link}
                scroll={true}
                href={`/purchases/vendors/edit/${vendor?.vendorId}`}
                onClick={() => dispatch(setSelectedVendor(vendor))}
              >
                <Icon icon='tabler:edit' />
              </IconButton>
            )}
            <IconButton color='default' component={Link} scroll={true} href='/purchases/vendors/'>
              <Close sx={{ color: theme => theme.palette.primary.main }} />
            </IconButton>
          </Box>
        }
      />

      <PageWrapper>
        {loading ? (
          <LinearProgress sx={{ height: '5px' }} />
        ) : (
          <div>
            <Grid container spacing={{ xs: 5, xl: 10 }}>
              <Grid item xs={12}>
                <Grid item xs={12} sm={6} md={6} lg={4} xl={4}>
                  <CustomAutocomplete
                    options={vendors || []}
                    getOptionLabel={option => option?.displayName || ''}
                    value={vendors.find(option => option.vendorId === vendor.vendorId) || null}
                    onChange={(e, newValue) => {
                      dispatch(setSelectedVendor(newValue))
                    }}
                    disableClearable
                    renderOption={(props, option) => {
                      return (
                        <li {...props} key={option?.vendorId}>
                          {option?.vendorNoPrefix || ''}
                          {option?.vendorNo || ''}-{option?.displayName || ''}
                        </li>
                      )
                    }}
                    renderInput={params => <CustomTextField {...params} fullWidth label='Vendors' />}
                  />
                </Grid>
              </Grid>

              <Grid item xs={12} md={12} lg={9} xl={8}>
                <VendorViewSection vendorId={vendor?.vendorId} defaultTab={OVERVIEW} vendors={vendors} />
              </Grid>
            </Grid>
          </div>
        )}
      </PageWrapper>
    </div>
  )
}
