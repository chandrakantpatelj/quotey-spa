import { Box, Grid, IconButton, Typography } from '@mui/material'
import { Controller, useFieldArray } from 'react-hook-form'
import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'

const DEFAULT_TAX_STATEMENT_ACCOUNT = {
  accountId: '',
  accountType: '',
  description: '',
  statementLabel: '',
  statementDescription: ''
}

function TaxSettingsAccountsTable({ control, namePrefix, fieldArrayName, accounts, errors }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldArrayName
  })

  return (
    <>
      <Typography sx={{ fontSize: '15px', fontWeight: 500, mb: '10px' }}>Tax Statement Accounts: </Typography>

      {fields.length === 0 && (
        <IconButton
          variant='outlined'
          color='success'
          sx={{ fontSize: '20px' }}
          onClick={() => append({ ...DEFAULT_TAX_STATEMENT_ACCOUNT })}
        >
          <Icon icon='material-symbols:add-box-outline' />
        </IconButton>
      )}

      {fields.map((account, index) => (
        <Grid container spacing={2} key={account.accountId} columns={14} sx={{ mb: 3 }}>
          {/* Account ID */}
          <Grid item xs={2}>
            <Controller
              name={`${namePrefix}[${index}].accountId`}
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomAutocomplete
                  id={`accountId-${index}`}
                  {...field}
                  options={accounts}
                  getOptionLabel={option => option?.accountName || ''}
                  value={accounts.find(option => option.accountId === field.value) || null}
                  onChange={(e, newValue) => field.onChange(newValue?.accountId || null)}
                  disableClearable
                  renderInput={params => (
                    <CustomTextField
                      {...params}
                      fullWidth
                      label='Account'
                      error={Boolean(errors?.[namePrefix]?.[index]?.accountId)}
                      helperText={errors?.[namePrefix]?.[index]?.accountId ? 'Account ID is required' : ''}
                    />
                  )}
                />
              )}
            />
          </Grid>

          {/* Account Type */}
          <Grid item xs={2}>
            <Controller
              name={`${namePrefix}[${index}].accountType`}
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Account Type'
                  error={Boolean(errors?.[namePrefix]?.[index]?.accountType)}
                  helperText={errors?.[namePrefix]?.[index]?.accountType ? 'Account Type is required' : ''}
                />
              )}
            />
          </Grid>

          {/* Description */}
          <Grid item xs={3}>
            <Controller
              name={`${namePrefix}[${index}].description`}
              control={control}
              render={({ field }) => <CustomTextField {...field} fullWidth label='Description' />}
            />
          </Grid>

          {/* Statement Label */}
          <Grid item xs={2}>
            <Controller
              name={`${namePrefix}[${index}].statementLabel`}
              control={control}
              render={({ field }) => <CustomTextField {...field} fullWidth label='Statement Label' />}
            />
          </Grid>

          {/* Statement Description */}
          <Grid item xs={4}>
            <Controller
              name={`${namePrefix}[${index}].statementDescription`}
              control={control}
              render={({ field }) => <CustomTextField {...field} fullWidth label='Statement Description' />}
            />
          </Grid>

          {/* Remove or Add Account */}
          <Grid item xs={1}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
              <IconButton variant='outlined' color='error' sx={{ fontSize: '20px' }} onClick={() => remove(index)}>
                <Icon icon='mingcute:delete-2-line' />
              </IconButton>

              {fields.length - 1 === index && (
                <IconButton
                  variant='outlined'
                  color='success'
                  sx={{ fontSize: '20px' }}
                  onClick={() => append({ ...DEFAULT_TAX_STATEMENT_ACCOUNT })}
                >
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

export default TaxSettingsAccountsTable
