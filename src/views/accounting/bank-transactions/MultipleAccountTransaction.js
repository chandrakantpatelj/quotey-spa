import { Box, IconButton, TableCell, TableRow, Typography } from '@mui/material'
import { Controller, useFieldArray, useWatch } from 'react-hook-form'
import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import { getAdornmentConfig, safeNumber } from 'src/common-functions/utils/UtilityFunctions'
import { useFinancialAccounts } from 'src/hooks/getData/useFinancialAccounts'
import { useSelector } from 'react-redux'
import React, { useEffect, useState } from 'react'

const DEFAULT_TAX_STATEMENT_ACCOUNT = {
  accountId: null,
  accountType: '',
  amount: 0
}

function MultipleAccountTransaction({ control, errors, getValues, clearErrors, setError, setValue, creditAmount,setEntriesTotalAmount }) {
  const tenant = useSelector(state => state.tenants?.selectedTenant)
  const { tenantId } = tenant || ''
  const { financialAccounts } = useFinancialAccounts(tenantId)
  const filteredEntityAccounts = financialAccounts.filter(
    account => account.accountType === 'Equity' || account.accountType === 'Liability'
  )
  const [errorMSG, setErrorMSG] = useState(false)
  const currency = useSelector(state => state?.currencies?.selectedCurrency) || {}
  const localAdornmentConfig = getAdornmentConfig(currency)

  const validateTotalAmount = entries => {
    let totalAmount = 0

    entries?.forEach(account => {
      totalAmount += safeNumber(account?.amount) // Ensure amount is a number
    })
    setEntriesTotalAmount(totalAmount)
    if (totalAmount !== 0 && totalAmount !== creditAmount) {
      console.log('totalAmount', totalAmount)
      console.log('creditAmount', creditAmount)
      setError('entries', { type: 'manual', message: 'The total amount does not match with credit amount' }) // Set error in the form state
      setErrorMSG(true)
      return false // Indicate validation failure
    } else {
      clearErrors('entries') // Clear error if validation passes
      setErrorMSG(false)
      return true // Indicate validation success
    }
  }

  const { fields, append, update, remove } = useFieldArray({
    control,
    name: 'entries',
    rules: {
      required: true,
      validate: validateTotalAmount
    }
  })
  const entriesData = useWatch({ control, name: 'entries' })
  console.log('entriesData', entriesData)
  useEffect(() => {
    validateTotalAmount(entriesData || [])
  }, [entriesData])

  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 4 }}>
        <Typography sx={{ fontSize: '15px', fontWeight: 500 }}>Entries</Typography>

        {fields?.length === 0 && (
          <IconButton variant='outlined' color='success' onClick={() => append(DEFAULT_TAX_STATEMENT_ACCOUNT)}>
            <Icon icon='material-symbols:add-box-outline' />
          </IconButton>
        )}
      </Box>

      {fields?.map((account, index) => (
        <React.Fragment key={account.accountId || `row-${index}`}>
          <TableRow key={account.accountId || `row-${index}`}>
            <TableCell sx={{ width: '50%' }}>
              <Controller
                name={`entries[${index}].accountId`}
                control={control}
                rules={{ required: 'Account is required' }}
                render={({ field, fieldState: { error } }) => (
                  <CustomAutocomplete
                    {...field}
                    options={filteredEntityAccounts}
                    getOptionLabel={option => `${option?.accountName} (${option.accountType})` || ''}
                    value={filteredEntityAccounts.find(option => option.accountId === field.value) || null}
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
            </TableCell>

            <TableCell sx={{ width: '50%' }}>
              <Controller
                name={`entries[${index}].amount`}
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    label='Amount'
                    fullWidth
                    InputProps={{
                      ...localAdornmentConfig
                    }}
                    error={Boolean(errors.entries?.[index]?.amount || errorMSG)}
                    helperText={
                      errors.entries?.[index]?.amount
                        ? 'Amount is required'
                        : errorMSG
                        ? errors.entries?.message || 'The total amount does not match with credit amount'
                        : ''
                    }
                  />
                )}
              />
            </TableCell>
          </TableRow>

          <TableCell sx={{ width: '5%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
              <IconButton variant='outlined' color='error' sx={{ fontSize: '20px' }} onClick={() => remove(index)}>
                <Icon icon='mingcute:delete-2-line' />
              </IconButton>
              {index === fields.length - 1 && (
                <IconButton
                  variant='outlined'
                  color='success'
                  sx={{ fontSize: '20px' }}
                  disabled={filteredEntityAccounts.length <= 0}
                  onClick={() => append(DEFAULT_TAX_STATEMENT_ACCOUNT)}
                >
                  <Icon icon='material-symbols:add-box-outline' />
                </IconButton>
              )}
            </Box>
          </TableCell>
        </React.Fragment>
      ))}
    </>
  )
}

export default MultipleAccountTransaction
