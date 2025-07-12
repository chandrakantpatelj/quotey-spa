import { useEffect, useState } from 'react'
import { Grid, Box, Button, Card, CardContent, Typography, Tabs, Tab } from '@mui/material'
import CustomTextField from 'src/@core/components/mui/text-field'
import { createFilterOptions } from '@mui/material/Autocomplete'
import { useDispatch, useSelector } from 'react-redux'
import { setOtherSettings } from 'src/store/apps/other-setting'
import { writeData } from 'src/common-functions/GraphqlOperations'
import {
  createOtherSettingMutation,
  updateOtherSettingMutation
} from 'src/@core/components/graphql/other-setting-queries'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import useIsDesktop from 'src/hooks/IsDesktop'
import { clearDateRangeReduxStore, hasPermission } from 'src/common-functions/utils/UtilityFunctions'
import { createAlert } from 'src/store/apps/alerts'
import { EDIT_OTHER_SETTING } from 'src/common-functions/utils/Constants'
const monthOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

function OtherSetting({ otherSettingObject, setOtherSettingObject }) {
  const dispatch = useDispatch()
  const [activeTab, setActiveTab] = useState(0)
  const isDesktop = useIsDesktop()

  // State for different fields, organized by section
  const [manufacturerState, setManufacturerState] = useState([])
  const [brandState, setBrandState] = useState([])
  const [productCategoryState, setProductCategoryState] = useState([])
  // const [customerNotesState, setCustomerNotesState] = useState([])
  const [termsAndConditionsState, setTermsAndConditionsState] = useState([])
  const [productClassState, setProductClassState] = useState([])
  const [unitState, setUnitState] = useState([])
  const [monthDuration, setMonthDuration] = useState(1)
  const [statusesState, setStatusesState] = useState([])
  const [inwardReasonState, setInwardReasonState] = useState([])
  const [outwardReasonState, setOutwardReasonState] = useState([])
  const {
    manufacturer = [],
    brand = [],
    productCategory = [],
    productClass = [],
    uom = [],
    status = [],
    inwardReason = [],
    outwardReason = [],
    // customerNotes = [],
    termsAndConditions = [],
    moduleFilterDateDuration
  } = otherSettingObject?.settings || {}
  const userProfile = useSelector(state => state.userProfile)
  const filter = createFilterOptions()
  const tenant = useSelector(state => state.tenants?.selectedTenant) || {}
  const { tenantId } = tenant || {}

  const handleResetForm = () => {
    setManufacturerState(manufacturer)
    setBrandState(brand)
    setProductCategoryState(productCategory)
    setProductClassState(productClass)
    setUnitState(uom)
    setStatusesState(status)
    setInwardReasonState(inwardReason)
    setOutwardReasonState(outwardReason)
    // setCustomerNotesState(customerNotes)
    setTermsAndConditionsState(termsAndConditions)
    setMonthDuration(moduleFilterDateDuration || monthDuration)
  }

  useEffect(() => {
    handleResetForm()
  }, [tenantId, otherSettingObject?.settings])

  const handleEditSettingsSave = async () => {
    const otherSetting = {
      schemaVersion: '1.0',
      manufacturer: manufacturerState,
      brand: brandState,
      productCategory: productCategoryState,
      productClass: productClassState,
      uom: unitState,
      status: statusesState,
      inwardReason: inwardReasonState,
      outwardReason: outwardReasonState,
      termsAndConditions: termsAndConditionsState,
      moduleFilterDateDuration: monthDuration
    }

    const isUpdate = Object.keys(otherSettingObject.settings).length > 0
    const mutation = isUpdate ? updateOtherSettingMutation() : createOtherSettingMutation()

    try {
      const response = await writeData(mutation, { tenantId, otherSetting })
      const result = isUpdate ? response.updateOtherSetting : response.createOtherSetting
      console.log('result', result)

      if (result) {
        dispatch(createAlert({ message: 'Setting saved successfully!', type: 'success' }))
        dispatch(setOtherSettings(result))
        setOtherSettingObject({ settings: result })
        clearDateRangeReduxStore(dispatch)
      } else {
        dispatch(createAlert({ message: 'Setting not saved', type: 'error' }))
      }
    } catch (error) {
      console.error('Error saving settings:', error)
    }
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const renderAutocompleteField = (label, value, setValue, options) => (
    <CustomAutocomplete
      multiple
      forcePopupIcon
      value={value}
      onChange={(event, newValue) => setValue(newValue)}
      filterOptions={(options, params) => {
        const filtered = filter(options, params)
        const { inputValue } = params
        const isExisting = options.some(option => option === inputValue)
        if (inputValue !== '' && !isExisting) filtered.push(inputValue)
        return filtered
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      options={options}
      getOptionLabel={option => (typeof option === 'string' ? option : option?.inputValue || option)}
      renderInput={params => <CustomTextField {...params} label={label} fullWidth />}
    />
  )

  return (
    <Box>
      <Box sx={{ display: isDesktop ? 'flex' : 'block', mt: 3 }}>
        {isDesktop ? (
          <Tabs
            orientation='vertical'
            variant='scrollable'
            value={activeTab}
            onChange={handleTabChange}
            aria-label='Vertical settings tabs'
            sx={{ borderRight: 1, borderColor: 'divider', minWidth: 150 }}
          >
            <Tab label='Basic Info' sx={{ alignItems: 'flex-start', pl: 2 }} />
            <Tab label='Product Details' sx={{ alignItems: 'flex-start', pl: 2 }} />
            <Tab label='Additional Information' sx={{ alignItems: 'flex-start', pl: 2 }} />
            <Tab label='Module Setting' sx={{ alignItems: 'flex-start', pl: 2 }} />
          </Tabs>
        ) : (
          <Tabs value={activeTab} variant='scrollable' onChange={handleTabChange} aria-label='settings tabs'>
            <Tab label='Basic Info' />
            <Tab label='Product Details' />
            <Tab label='Additional Information' />
            <Tab label='Module Setting' />
          </Tabs>
        )}

        <Card sx={{ flexGrow: 1, ml: 2 }}>
          <CardContent>
            {activeTab === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  {renderAutocompleteField(
                    'Manufacturers',
                    manufacturerState,
                    setManufacturerState,
                    otherSettingObject?.settings?.manufacturer || []
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  {renderAutocompleteField(
                    'Brands',
                    brandState,
                    setBrandState,
                    otherSettingObject?.settings?.brand || []
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  {renderAutocompleteField(
                    'Product Category',
                    productCategoryState,
                    setProductCategoryState,
                    otherSettingObject?.settings?.productCategory || []
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  {renderAutocompleteField(
                    'Product Class',
                    productClassState,
                    setProductClassState,
                    otherSettingObject?.settings?.productClass || []
                  )}
                </Grid>
              </Grid>
            )}
            {activeTab === 1 && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  {renderAutocompleteField('UOM', unitState, setUnitState, otherSettingObject?.settings?.uom || [])}
                </Grid>
                <Grid item xs={12} sm={6}>
                  {renderAutocompleteField(
                    'Statuses',
                    statusesState,
                    setStatusesState,
                    otherSettingObject?.settings?.status || []
                  )}
                </Grid>
              </Grid>
            )}
            {activeTab === 2 && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  {renderAutocompleteField(
                    'Inward Reasons',
                    inwardReasonState,
                    setInwardReasonState,
                    otherSettingObject?.settings?.inwardReason || []
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  {renderAutocompleteField(
                    'Outward Reasons',
                    outwardReasonState,
                    setOutwardReasonState,
                    otherSettingObject?.settings?.outwardReason || []
                  )}
                </Grid>

                {/* <Grid item xs={12} sm={12}>
                  {renderAutocompleteField(
                    'Customer Notes',
                    customerNotesState,
                    setCustomerNotesState,
                    otherSettingObject?.settings?.customerNotes || []
                  )}
                </Grid> */}
                <Grid item xs={12} sm={12}>
                  {renderAutocompleteField(
                    'Terms & Conditions',
                    termsAndConditionsState,
                    setTermsAndConditionsState,
                    otherSettingObject?.settings?.termsAndConditions || []
                  )}
                </Grid>
              </Grid>
            )}
            {activeTab === 3 && (
              <Grid container spacing={3}>
                <Grid item xs={6} sm={3} md={3}>
                  <Typography variant='subtitle1' sx={{ fontSize: '14px', lineHeight: '24px', fontWeight: 500 }}>
                    Module Date Range
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3} md={3}>
                  <CustomAutocomplete
                    forcePopupIcon
                    value={monthDuration}
                    onChange={(event, newValue) => setMonthDuration(newValue)}
                    getOptionLabel={option => {
                      if (typeof option === 'string') {
                        return option
                      } else return `${option} Month`
                    }}
                    renderOption={(props, option) => (
                      <Box component='li' {...props}>
                        {option} {'Month'}
                      </Box>
                    )}
                    selectOnFocus
                    clearOnBlur
                    handleHomeEndKeys
                    options={monthOptions}
                    renderInput={params => <CustomTextField {...params} label='Month Duration' fullWidth />}
                  />
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
        <Button variant='outlined' onClick={() => handleResetForm()} sx={{ mr: 2 }}>
          Cancel
        </Button>
        <Button
          variant='contained'
          disabled={hasPermission(userProfile, EDIT_OTHER_SETTING) === false}
          onClick={handleEditSettingsSave}
        >
          Save
        </Button>
      </Box>
    </Box>
  )
}

export default OtherSetting
