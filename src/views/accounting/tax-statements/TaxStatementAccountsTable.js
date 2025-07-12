import { Box, Grid, IconButton, Typography } from '@mui/material'
import { Controller, useFieldArray } from 'react-hook-form'
import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import { handleDecimalPlaces } from 'src/common-functions/utils/UtilityFunctions'

const DEFAULT_TAX_STATEMENT_ACCOUNT = {
  accountId: '',
  accountType: '',
  statementLabel: '',
  statementDescription: '',
  amount: 0
}

function TaxStatementAccountsTable({ control, accounts, title, namePrefix, setValue }) {
  const { fields, append, update, remove } = useFieldArray({
    control,
    name: namePrefix
  })

  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 4 }}>
        <Typography sx={{ fontSize: '15px', fontWeight: 500 }}>{title}</Typography>

        {fields.length === 0 && (
          <IconButton
            variant='outlined'
            color='success'
            sx={{ fontSize: '20px' }}
            onClick={() => append(DEFAULT_TAX_STATEMENT_ACCOUNT)}
          >
            <Icon icon='material-symbols:add-box-outline' />
          </IconButton>
        )}
      </Box>

      {fields.map((account, index) => (
        <Grid container spacing={2} columns={14} sx={{ mb: 3 }} key={`${account?.accountId}-${index}`}>
          <Grid item xs={12} md={4}>
            <Controller
              name={`${namePrefix}[${index}].accountId`}
              control={control}
              rules={{ required: 'Account is required' }}
              render={({ field, fieldState: { error } }) => (
                <CustomAutocomplete
                  {...field}
                  options={accounts}
                  getOptionLabel={option => option?.accountName || ''}
                  value={accounts.find(option => option.accountId === field.value) || null}
                  onChange={(e, newValue) => {
                    field.onChange(newValue?.accountId || null)
                    // setValue(`${namePrefix}[${index}].accountId`, newValue?.accountId)
                    update(index, { ...account, accountId: newValue?.accountId })

                    setValue(`${namePrefix}[${index}].accountType`, newValue?.accountType)
                    setValue(`${namePrefix}[${index}].statementDescription`, newValue?.description)
                  }}
                  disableClearable
                  renderInput={params => (
                    <CustomTextField
                      {...params}
                      fullWidth
                      label='Account'
                      error={Boolean(error)}
                      helperText={error?.message}
                    />
                  )}
                />
              )}
            />
          </Grid>

          <Grid item xs={6} sm={6} md={4}>
            <Controller
              name={`${namePrefix}[${index}].statementLabel`}
              control={control}
              render={({ field }) => (
                <CustomTextField
                  value={field?.value}
                  onChange={e => {
                    field.onChange(e.target.value)
                    update(index, { ...account, statementLabel: e.target.value })

                    // setValue(`${namePrefix}[${index}].statementLabel`, e.target.value)
                  }}
                  fullWidth
                  label='Statement Label'
                />
              )}
            />
          </Grid>
          <Grid item xs={6} sm={6} md={4}>
            <Controller
              name={`${namePrefix}[${index}].amount`}
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  InputProps={{
                    inputProps: {
                      step: 'any',
                      inputMode: 'numeric'
                    }
                  }}
                  type='number'
                  onChange={e => {
                    const value = e.target.value
                    const formattedValue = handleDecimalPlaces(value)
                    field.onChange(formattedValue)
                    // setValue(`${namePrefix}[${index}].amount`, formattedValue)
                    // setValue(`${namePrefix}[${index}].amount`, formattedValue, {
                    //   shouldValidate: true,
                    //   shouldDirty: true
                    // })
                    update(index, { ...account, amount: formattedValue })

                    // update(index, { amount: formattedValue })
                  }}
                  fullWidth
                  label='Amount'
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name={`${namePrefix}[${index}].statementDescription`}
              control={control}
              render={({ field }) => <CustomTextField {...field} fullWidth label='Statement Description' />}
            />
          </Grid>

          <Grid item xs={1}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
              <IconButton variant='outlined' color='error' onClick={() => remove(index)}>
                <Icon icon='mingcute:delete-2-line' />
              </IconButton>

              {fields.length - 1 === index && (
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

export default TaxStatementAccountsTable
