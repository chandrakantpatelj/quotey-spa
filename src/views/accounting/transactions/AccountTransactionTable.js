import { Box, Grid, IconButton, Typography } from '@mui/material'
import { Controller, useFieldArray } from 'react-hook-form'
import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import { handleDecimalPlaces, toTitleCase } from 'src/common-functions/utils/UtilityFunctions'

const DEFAULT_TAX_STATEMENT_ACCOUNT = {
  accountId: null,
  accountType: '',
  effect: '',
  amount: 0
}

function AccountTransactionTable({ control, accounts, entries, setValue, typeOptions }) {
  const { append, update, remove } = useFieldArray({
    control,
    name: 'entries'
  })

  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 4 }}>
        <Typography sx={{ fontSize: '15px', fontWeight: 500 }}>Entries</Typography>

        {entries?.length === 0 && (
          <IconButton variant='outlined' color='success' onClick={() => append(DEFAULT_TAX_STATEMENT_ACCOUNT)}>
            <Icon icon='material-symbols:add-box-outline' />
          </IconButton>
        )}
      </Box>

      {entries?.map((account, index) => (
        <Grid container sx={{ mb: 3 }} key={index}>
          <Grid item xs={10} md={11}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Controller
                  name={`entries[${index}].accountId`}
                  control={control}
                  rules={{ required: 'Account is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <CustomAutocomplete
                      {...field}
                      options={accounts}
                      getOptionLabel={option => `${option?.accountName} (${option.accountType})` || ''}
                      value={accounts.find(option => option.accountId === field.value) || null}
                      onChange={(e, newValue) => {
                        console.log('newValue', newValue?.accountId)

                        field.onChange(newValue?.accountId)
                        // setValue(`entries[${index}].accountId`, newValue?.accountId)
                        // update(index, { ...account, accountId: newValue?.accountId })

                        setValue(`entries[${index}].accountType`, newValue?.accountType)
                      }}
                      renderOption={(props, option) => (
                        <Box component='li' {...props} key={option?.accountId}>
                          {option.accountName} ({option.accountType})
                        </Box>
                      )}
                      disableClearable
                      renderInput={params => (
                        <CustomTextField
                          {...params}
                          fullWidth
                          label='Account '
                          error={Boolean(error)}
                          helperText={error?.message}
                        />
                      )}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6} sm={6} md={3}>
                <Controller
                  name={`entries[${index}].effect`}
                  control={control}
                  rules={{ required: 'Account Type is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <CustomAutocomplete
                      {...field}
                      options={typeOptions}
                      value={field.value || ''}
                      onChange={(e, newValue) => {
                        field.onChange(newValue)
                      }}
                      getOptionLabel={option => toTitleCase(option) || ''}
                      renderOption={(props, option) => (
                        <li {...props} style={{ textTransform: 'capitalize' }}>
                          {toTitleCase(option)}
                        </li>
                      )}
                      disableClearable
                      renderInput={params => (
                        <CustomTextField
                          {...params}
                          fullWidth
                          label='Type'
                          error={Boolean(error)}
                          helperText={error?.message}
                        />
                      )}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6} sm={6} md={3}>
                <Controller
                  name={`entries[${index}].amount`}
                  control={control}
                  rules={{
                    required: 'Amount is required'
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <CustomTextField
                      // {...field}
                      value={field?.value}
                      onChange={e => {
                        const value = e.target.value
                        const formattedValue = handleDecimalPlaces(value)
                        field.onChange(formattedValue)
                        setValue(`entries[${index}].amount`, formattedValue)
                        update(`entries[${index}].amount`, formattedValue)
                      }}
                      fullWidth
                      label='Amount'
                      error={Boolean(error)}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={2} md={1}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', alignItems: 'center' }}>
              <IconButton variant='outlined' color='error' onClick={() => remove(index)}>
                <Icon icon='mingcute:delete-2-line' />
              </IconButton>

              {entries?.length - 1 === index && (
                <IconButton variant='outlined' color='success' onClick={() => append(DEFAULT_TAX_STATEMENT_ACCOUNT)}>
                  <Icon icon='material-symbols:add-box-outline' />
                </IconButton>
              )}
            </Box>
          </Grid>
        </Grid>
      ))}
    </>
  )
}

export default AccountTransactionTable
