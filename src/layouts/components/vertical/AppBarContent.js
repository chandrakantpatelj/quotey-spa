import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Icon from 'src/@core/components/icon'
import UserDropdown from './UserDropdown'
import { Backdrop, Button, MenuItem, TextField } from '@mui/material'
import CustomTextField from 'src/@core/components/mui/text-field'
import { useDispatch, useSelector } from 'react-redux'
import CircularProgress from '@mui/material/CircularProgress'
import { setSelectedProduct } from 'src/store/apps/products'
import { setTenantPreference } from 'src/store/apps/user-preference'
import Link from 'next/link'
import { setAllCurrency, setSelectedCurrency } from 'src/store/apps/currency'
import { useRouter } from 'next/router'
import { createAlert } from 'src/store/apps/alerts'
import { fetchData, writeData } from 'src/common-functions/GraphqlOperations'
import {
  createUserPreferenceMutation,
  updateUserPreferenceMutation
} from 'src/@core/components/graphql/user-preference-queries'
import { getTenantsAndPreferenceQuery } from 'src/@core/components/graphql/company-queries'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import { setAllTenants, setSelectedTenant } from 'src/store/apps/company'
import { setCountries } from 'src/store/apps/country'
import { setAcounts } from 'src/store/apps/accounts'
import { setHeaderLoader } from 'src/store/apps/other-setting'
import { clearReduxStore } from 'src/common-functions/utils/UtilityFunctions'
import { setPermissionByTenantId, setUserProfile } from 'src/store/apps/user-profile'

const AppBarContent = ({ hidden, settings, toggleNavVisibility }) => {
  const router = useRouter()
  const dispatch = useDispatch()
  const tenants = useSelector(state => state?.tenants?.data) || []
  const selectedTenant = useSelector(state => state.tenants?.selectedTenant) || {}

  const headerLoader = useSelector(state => state?.otherSettings.headerLoader)

  const [tenantsList, setTenantsList] = useState([])
  const [defaultTenant, setDefaultTenant] = useState(null)

  useEffect(() => {
    setTenantsList(tenants)
  }, [tenants])

  useEffect(() => {
    setDefaultTenant(selectedTenant)
  }, [selectedTenant])

  const handleTenantChange = async (event, value) => {
    const userPreference = { tenantId: value?.tenantId }
    dispatch(setSelectedTenant(value))
    setDefaultTenant(value)
    clearReduxStore(dispatch)

    dispatch(setPermissionByTenantId(value.tenantId))

    try {
      const response = await writeData(updateUserPreferenceMutation(), { userPreference })
      if (response?.data?.updateUserPreference === null && response?.errors?.[0]?.message === 'Not found') {
        await writeData(createUserPreferenceMutation(), { userPreference })
        dispatch(createAlert({ message: 'User Preference Added successfully!', type: 'success' }))
      } else {
        dispatch(createAlert({ message: 'Preference Updated successfully!', type: 'success' }))
      }
    } catch (error) {
      console.error('Error updating user preference:', error)
    }
  }

  const [userData, setUserData] = useState({})

  async function callAPI() {
    try {
      dispatch(setHeaderLoader(true))
      clearReduxStore(dispatch)
      const tenantsList = await fetchData(getTenantsAndPreferenceQuery())

      const {
        getAccount = [],
        getAllTenants,
        getAllCurrency = [],
        getUserPreference = {},
        getAllCountries = [],
        getUserProfile = {}
      } = tenantsList?.data || tenantsList || {}

      dispatch(setUserProfile({ userProfile: getUserProfile, tenantId: getUserPreference?.tenantId || null }))
      setUserData(getAccount)
      setTenantsList(getAllTenants)
      dispatch(setAllTenants(getAllTenants))
      dispatch(setAcounts(getAccount))
      dispatch(setCountries(getAllCountries))
      dispatch(setAllCurrency(getAllCurrency))
      dispatch(setTenantPreference(getUserPreference))
      const filteredTenant = getAllTenants?.find(tenant => tenant.tenantId === getUserPreference?.tenantId) || {}

      if (filteredTenant) {
        dispatch(setSelectedTenant(filteredTenant))
        setDefaultTenant(filteredTenant)
      }
      const defaultCurrency = getAllCurrency?.find(item => item?.currencyId === filteredTenant?.currencyId) || {}
      dispatch(setSelectedCurrency(defaultCurrency))
    } catch (error) {
      console.error('Error:', error)
    } finally {
      dispatch(setHeaderLoader(false))
    }
  }
  useEffect(() => {
    callAPI()
  }, [])

  return (
    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box className='actions-left' sx={{ mr: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        {hidden && !settings.navHidden ? (
          <IconButton color='inherit' sx={{ ml: -2.75, mr: 1 }} onClick={toggleNavVisibility}>
            <Icon fontSize='1.5rem' icon='tabler:menu-2' />
          </IconButton>
        ) : null}
        <Link href='/'>
          <Box
            component={'img'}
            src='/warehouse-img/Logo.png'
            sx={{
              maxWidth: '233px',
              width: '100%',
              display: { xs: 'none', md: 'block' }
            }}
          />
        </Link>
      </Box>

      <Box component='div' sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <CustomAutocomplete
          options={[...tenantsList, { tenantId: 'add-new', displayName: 'Add New' }]} // Adding a special option
          value={defaultTenant}
          disableClearable
          getOptionLabel={option => option?.displayName || ''}
          onChange={(e, newValue) => {
            if (newValue?.tenantId === 'add-new') {
              router.push('/account-settings/company/add-company/') // Redirect to home
              return
            } else {
              handleTenantChange(e, newValue)
            }
          }}
          renderOption={(props, option) => {
            if (option?.tenantId === 'add-new') {
              return (
                <li {...props} style={{ display: 'flex', justifyContent: 'center', fontWeight: 'bold' }}>
                  <Button variant='contained' color='primary' sx={{ width: '100%' }}>
                    + Add New
                  </Button>
                </li>
              )
            }

            return (
              <li {...props} key={option.tenantId}>
                {option.displayName}
              </li>
            )
          }}
          renderInput={params => <CustomTextField sx={{ width: 200 }} label='Company' {...params} fullWidth />}
        />
        <UserDropdown userData={userData} />
      </Box>

      {headerLoader ? (
        <Backdrop
          sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1, backdropFilter: 'blur(12px)' }}
          open={headerLoader}
        >
          <CircularProgress color='inherit' />
        </Backdrop>
      ) : null}
    </Box>
  )
}

export default AppBarContent
