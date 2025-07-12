import { Box, Button, FormHelperText, Grid, Typography } from '@mui/material'
import PurchaseOrdersShipmentsTable from './PurchaseOrdersShipmentsTable'
import CustomTextField from 'src/@core/components/mui/text-field'
import { Controller } from 'react-hook-form'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import { findObjectByCurrencyId, getExchangeRate } from 'src/common-functions/utils/UtilityFunctions'
import CustomFilesUpload from 'src/views/forms/form-elements/custom-inputs/CustomFilesUpload'
import usePurchaseSettings from 'src/hooks/getData/usePurchaseSettings'
import { useState } from 'react'
import CustomDatePicker from 'src/views/forms/form-elements/pickers/CustomDatePicker'

function CommonNewShipmentForm({
  vendors,
  watch,
  control,
  currency,
  currencies,
  countries,
  tradings,
  warehouses,
  errors,
  trigger,
  tenant,
  localCurrency,
  setValue,
  getValues,
  selectedPdFile,
  setSelectedPdFile,
  folderName,
  handleCancel,
  check,
  settingPurchaseData
}) {
  const tenantId = tenant?.tenantId
  const { purchaseModuleSetting: purchaseSettingData } = usePurchaseSettings(tenantId)

  let allExpenses = getValues('expenses')
  function findObjectById(array, countryId) {
    return array.find(obj => obj.name === countryId)
  }

  const [deliveryAddressCountry, setDeliveryAddressCountry] = useState(
    findObjectById(countries, tenant?.address?.country)
  )

  return (
    <>
      <Grid container spacing={{ xs: 5 }}>
        <Grid item xs={12} md={12} lg={12}>
          <Grid container spacing={{ xs: 2, md: 3 }}>
            <Grid item xs={6} sm={4} md={3}>
              <Controller
                name='shipmentType'
                control={control}
                rules={{ required: false }}
                render={({ field }) => (
                  <CustomAutocomplete
                    {...field}
                    options={purchaseSettingData}
                    getOptionLabel={option => option?.purchaseType || ''}
                    value={purchaseSettingData?.find(option => option.purchaseType === field?.value) || null}
                    onChange={(e, newValue) => {
                      field.onChange(newValue.purchaseType)
                      const shipmentCurrency =
                        currencies?.find(val => val?.currencyId === newValue?.shipmentCurrency) || localCurrency

                      setValue('currency', shipmentCurrency)
                      setValue(
                        'currencyExchangeRate',
                        getExchangeRate(shipmentCurrency?.exchangeRate || 1, localCurrency?.exchangeRate)
                      )
                    }}
                    disableClearable
                    renderInput={params => <CustomTextField {...params} fullWidth label='Purchase Type' />}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <Controller
                name='shipmentDate'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomDatePicker
                    label={'Date'}
                    fullWidth={true}
                    date={field.value}
                    onChange={field.onChange}
                    error={Boolean(errors?.shipmentDate)}
                  />
                )}
              />
              {errors?.shipmentDate && <FormHelperText error>Shipment Date is required</FormHelperText>}
            </Grid>
            {tenant?.useTradingInfo === true && tradings?.length > 0 ? (
              <Grid item xs={6} sm={4} md={3}>
                <Controller
                  name='tradingId'
                  control={control}
                  rules={{ required: false }}
                  render={({ field }) => (
                    <CustomAutocomplete
                      {...field}
                      options={tradings || []}
                      getOptionLabel={option => option.tradingName || ''}
                      value={tradings?.find(option => option.tradingId === field.value) || null}
                      onChange={(event, newValue) => {
                        field.onChange(newValue ? newValue.tradingId : null)
                      }}
                      sx={{ flexGrow: 1 }}
                      renderInput={params => <CustomTextField {...params} fullWidth label='Trading Name' />}
                    />
                  )}
                />
              </Grid>
            ) : null}
          </Grid>
        </Grid>
        <Grid item xs={12} md={12} lg={12}>
          <Grid container spacing={{ xs: 2, md: 3 }}>
            <Grid item xs={6} sm={4} md={4}>
              <Controller
                name='vendorId'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomAutocomplete
                    id='vendorId'
                    {...field}
                    fullWidth
                    getOptionLabel={option => {
                      if (typeof option === 'string') {
                        return option
                      } else
                        return `${option?.vendorNoPrefix || ''}  ${option?.vendorNo || ''} - ${
                          option?.displayName || ''
                        }`
                    }}
                    onChange={(event, newValue) => {
                      if (newValue?.vendorId === 'add-new') {
                        handleAddNewVendor()
                        return
                      }
                      field.onChange(newValue)
                      const currency = findObjectByCurrencyId(currencies, newValue?.currencyId) || ''

                      setValue('currency', currency)
                      let curretVendorCurrency = currencies.find(cur => cur?.currencyId === newValue?.currencyId)
                      const getRate = getExchangeRate(
                        curretVendorCurrency?.exchangeRate || 1,
                        localCurrency?.exchangeRate
                      )
                      setValue(`currencyExchangeRate`, getRate)

                      allExpenses
                        ?.filter(a => a.paidToMainVendor)
                        ?.forEach(item => {
                          item.expenseValueCurrency = curretVendorCurrency?.currencyId
                        })

                      trigger(['vendorId', 'currency'])
                    }}
                    isOptionEqualToValue={(option, value) => option.vendorId === value?.vendorId}
                    renderOption={(props, option) => {
                      return (
                        <li {...props}>
                          {option?.vendorNoPrefix || ''}
                          {option?.vendorNo || ''}-{option?.displayName || ''}
                        </li>
                      )
                    }}
                    options={vendors}
                    renderInput={params => (
                      <CustomTextField
                        {...params}
                        label='Vendor'
                        error={Boolean(errors?.vendorId)}
                        {...(errors?.vendorId && { helperText: 'Vendor is required' })}
                      />
                    )}
                  />
                )}
              />
            </Grid>

            <Grid item xs={6} sm={4} md={2.5}>
              <Controller
                name='currency'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomAutocomplete
                    id='currency'
                    {...field}
                    options={currencies}
                    disableClearable
                    fullWidth
                    getOptionLabel={option => {
                      if (typeof option === 'string') {
                        return option
                      } else return `${option?.currencyId}`
                    }}
                    renderOption={(props, option) => (
                      <Box component='li' {...props}>
                        {option.symbol} - {option.currencyId}
                      </Box>
                    )}
                    onChange={(e, newValue) => {
                      field.onChange(newValue)
                      const getRate = getExchangeRate(newValue?.exchangeRate || 1, localCurrency?.exchangeRate)

                      setValue(`currencyExchangeRate`, getRate)
                    }}
                    renderInput={params => <CustomTextField {...params} fullWidth label='Currency' />}
                  />
                )}
              />
            </Grid>

            <Grid item xs={6} sm={4} md={2.5}>
              <Controller
                name='currencyExchangeRate'
                control={control}
                rules={{ required: false }}
                render={({ field }) => (
                  <CustomTextField
                    value={field.value}
                    onChange={e => {
                      const newValue = e.target.value
                      field.onChange(newValue)
                    }}
                    fullWidth
                    label='Exchange Rate'
                  />
                )}
              />{' '}
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} md={7} lg={8}>
          <Typography sx={{ fontSize: '15px', fontWeight: 500, lineHeight: '40px', mb: 2 }}>
            Delivery Address:
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={12} md={6} lg={6}>
              <Controller
                name='warehouseId'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomAutocomplete
                    {...field}
                    options={warehouses}
                    getOptionLabel={option => option?.name || ''}
                    disableClearable
                    onChange={(e, newValue) => {
                      field.onChange(newValue)
                      setValue('deliveryAddress.cityOrTown', newValue?.address?.cityOrTown)
                      setValue('deliveryAddress.postcode', newValue?.address?.postcode)
                      setValue('deliveryAddress.addressLine1', newValue?.address?.addressLine1)
                      setValue('deliveryAddress.addressLine2', newValue?.address?.addressLine2)
                      setValue('deliveryAddress.country', newValue?.address?.country)
                      setValue('deliveryAddress.state', newValue?.address?.state)
                      trigger([
                        'deliveryAddress.country',
                        'deliveryAddress.state',
                        'deliveryAddress.cityOrTown',
                        'deliveryAddress.postcode',
                        'deliveryAddress.addressLine1'
                      ])
                    }}
                    renderInput={params => (
                      <CustomTextField
                        {...params}
                        label='Select Warehouse'
                        fullWidth
                        error={Boolean(errors.warehouseId)}
                        {...(errors.warehouseId && { helperText: 'Warehouse is required' })}
                      />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6}>
              <Controller
                name='deliveryAddress.addressLine1'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Address Line 1'
                    error={Boolean(errors.deliveryAddress?.addressLine1)}
                    {...(errors.deliveryAddress?.addressLine1 && {
                      helperText: ' Address Line 1 is required'
                    })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6}>
              <Controller
                name='deliveryAddress.addressLine2'
                control={control}
                rules={{ required: false }}
                render={({ field }) => (
                  <CustomTextField fullWidth label='Address Line 2' {...field} onChange={field.onChange} />
                )}
              />
            </Grid>{' '}
            <Grid item xs={6} sm={12} md={6}>
              <Controller
                name='deliveryAddress.cityOrTown'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='City / Town'
                    error={Boolean(errors.deliveryAddress?.cityOrTown)}
                    {...(errors.deliveryAddress?.cityOrTown && { helperText: 'City is required' })}
                  />
                )}
              />
            </Grid>{' '}
            <Grid item xs={6} sm={12} md={6}>
              <Controller
                name='deliveryAddress.country'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomAutocomplete
                    {...field}
                    disableClearable
                    options={countries}
                    getOptionLabel={option => option.name || ''}
                    value={{ name: field.value }}
                    onChange={(event, newValue) => {
                      field.onChange(newValue?.name)
                      setValue('deliveryAddress.state', '')
                      setDeliveryAddressCountry(newValue)
                    }}
                    renderInput={params => (
                      <CustomTextField
                        {...params}
                        label='Select Country'
                        fullWidth
                        error={Boolean(errors.deliveryAddress?.country)}
                        {...(errors.deliveryAddress?.country && { helperText: ' Country is required' })}
                      />
                    )}
                  />
                )}
              />
            </Grid>{' '}
            <Grid item xs={6} sm={12} md={6}>
              <Controller
                name='deliveryAddress.state'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomAutocomplete
                    {...field}
                    disableClearable
                    options={!deliveryAddressCountry?.states?.length <= 0 ? deliveryAddressCountry?.states : []}
                    getOptionLabel={option => option.name || ''}
                    getOptionSelected={(option, value) => {
                      return option.name === value.name
                    }}
                    value={{ name: field.value }}
                    onChange={(event, newValue) => {
                      field.onChange(newValue?.name)
                    }}
                    renderInput={params => (
                      <CustomTextField
                        {...params}
                        label='Select State'
                        fullWidth
                        error={Boolean(errors.deliveryAddress?.state)}
                        {...(errors.deliveryAddress?.state && { helperText: 'State is required' })}
                      />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6} sm={12} md={6}>
              <Controller
                name='deliveryAddress.postcode'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Zip Code'
                    error={Boolean(errors.deliveryAddress?.postcode)}
                    {...(errors.deliveryAddress?.postcode && { helperText: 'ZIP Code is required' })}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Grid>
        <PurchaseOrdersShipmentsTable
          vendors={vendors}
          watch={watch}
          control={control}
          currency={currency}
          setValue={setValue}
          getValues={getValues}
          settingPurchaseData={settingPurchaseData}
        />
        <Grid item xs={12}>
          <CustomFilesUpload
            setValue={setValue}
            selectedPdFile={selectedPdFile}
            setSelectedPdFile={setSelectedPdFile}
            folderName={folderName}
          />
          {/* <CommonPDFViewer /> */}
        </Grid>
      </Grid>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: { xs: 'center', sm: 'start' },
          gap: '20px',
          marginTop: { xs: '20px', sm: '50px' }
        }}
      >
        <Button
          variant='contained'
          type='submit'
          onClick={() => {
            check(null)
          }}
        >
          Save
        </Button>

        <Button
          variant='contained'
          type='submit'
          onClick={() => {
            check('confirmed')
          }}
        >
          Save As Confirmed
        </Button>

        <Button type='reset' variant='outlined' onClick={handleCancel}>
          Cancel
        </Button>
      </Box>
    </>
  )
}

export default CommonNewShipmentForm
