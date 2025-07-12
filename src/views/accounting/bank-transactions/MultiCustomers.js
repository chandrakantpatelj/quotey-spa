import { Box, Divider, IconButton, InputAdornment, TableCell, TableRow, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Controller, useFieldArray, useWatch } from 'react-hook-form'
import { useSelector } from 'react-redux'
import Icon from 'src/@core/components/icon'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'
import { getAdornmentConfig, safeNumber } from 'src/common-functions/utils/UtilityFunctions'

const CustomerFields = {
  customerId: null,
  amount: 0
}

function MultiCustomers({ control, errors, getValues, setError, clearErrors, creditAmount, setCustomerTotalAmount }) {
  const customers = useSelector(state => state?.customers?.data || [])
  const [errorMSG, setErrorMSG] = useState(false)
  const currency = useSelector(state => state?.currencies?.selectedCurrency) || {}
  const localAdornmentConfig = getAdornmentConfig(currency)
  const validateTotalAmount = customers => {
    let totalAmount = 0

    customers?.forEach(customer => {
      totalAmount += safeNumber(customer?.amount) // Ensure amount is a number
    })
    setCustomerTotalAmount(totalAmount)
    if (totalAmount !== 0 && totalAmount !== creditAmount) {
      console.log('totalAmount', totalAmount)
      console.log('creditAmount', creditAmount)
      setError('customers', { type: 'manual', message: 'The total amount does not match with credit amount' }) // Set error in the form state
      setErrorMSG(true)
      return false // Indicate validation failure
    } else {
      clearErrors('customers') // Clear error if validation passes
      setErrorMSG(false)
      return true // Indicate validation success
    }
  }

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'customers',
    rules: {
      required: true,
      validate: validateTotalAmount
    }
  })

  const customersData = useWatch({ control, name: 'customers' })

  useEffect(() => {
    validateTotalAmount(customersData || [])
  }, [customersData])

  return (
    <>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Typography sx={{ fontSize: '15px', fontWeight: 500, lineHeight: '40px' }}>Sales Invoice Payment</Typography>

        {fields.length < 1 && (
          <IconButton
            variant='outlined'
            color='success'
            sx={{ fontSize: '20px' }}
            disabled={customers?.length <= 0}
            onClick={() => {
              append(CustomerFields)
            }}
          >
            <Icon icon='material-symbols:add-box-outline' />
          </IconButton>
        )}
      </Box>

      {fields.length > 0 && (
        <>
          {fields.map((customer, index) => (
            <React.Fragment key={customer.customerId || `row-${index}`}>
              <TableRow key={customer.customerId || `row-${index}`}>
                <TableCell sx={{ width: '50%' }}>
                  <Controller
                    name={`customers[${index}].customerId`}
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <CustomAutocomplete
                        id={`customerId[${index}].customerId`}
                        {...field}
                        options={customers}
                        getOptionLabel={option => option?.customerName || ''}
                        value={customers.find(option => option.customerId === field.value) || null}
                        onChange={(e, newValue) => {
                          field.onChange(newValue?.customerId || null)
                        }}
                        renderInput={params => (
                          <CustomTextField
                            fullWidth
                            {...params}
                            label='Customer'
                            error={Boolean(errors.customers?.[index]?.customerId)}
                            helperText={errors.customers?.[index]?.customerId ? 'Customer is required' : ''}
                          />
                        )}
                      />
                    )}
                  />
                </TableCell>
                <TableCell sx={{ width: '50%' }}>
                  <Controller
                    name={`customers[${index}].amount`}
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
                        error={Boolean(errors.customers?.[index]?.amount || errorMSG)}
                        helperText={
                          errors.customers?.[index]?.amount
                            ? 'Amount is required'
                            : errorMSG
                            ? errors.customers?.message || 'The total amount does not match with credit amount'
                            : ''
                        }
                      />
                    )}
                  />
                </TableCell>

                <TableCell sx={{ width: '5%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                    <IconButton
                      variant='outlined'
                      color='error'
                      sx={{ fontSize: '20px' }}
                      onClick={() => remove(index)}
                    >
                      <Icon icon='mingcute:delete-2-line' />
                    </IconButton>
                    {index === fields.length - 1 && (
                      <IconButton
                        variant='outlined'
                        color='success'
                        sx={{ fontSize: '20px' }}
                        disabled={customers.length <= 0}
                        onClick={() => append(CustomerFields)}
                      >
                        <Icon icon='material-symbols:add-box-outline' />
                      </IconButton>
                    )}
                  </Box>
                </TableCell>
              </TableRow>

              {customer?.orderNo && (
                <TableRow>
                  <TableCell sx={{ width: '20%' }}>
                    <Controller
                      name={`customers[${index}].orderNo`}
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => <CustomTextField {...field} disabled label='Order No' fullWidth />}
                    />
                  </TableCell>
                  <TableCell sx={{ width: '60%' }}>
                    <Controller
                      name={`customers[${index}].orderDate`}
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => <CustomTextField {...field} disabled label='Order Date' fullWidth />}
                    />
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
          <TableRow>
            <TableCell colSpan={4}>
              <Divider variant='fullWidth' orientation='horizontal' sx={{ display: 'block', m: '26px 0px 23px' }} />
            </TableCell>
          </TableRow>
        </>
      )}
    </>
  )
}

export default MultiCustomers
