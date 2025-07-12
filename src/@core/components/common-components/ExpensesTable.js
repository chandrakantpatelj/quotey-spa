import { Box, Typography, IconButton, Checkbox, Grid } from '@mui/material'
import CustomTextField from '../mui/text-field'
import Icon from 'src/@core/components/icon'
import { Controller, useFieldArray } from 'react-hook-form'
import CustomAutocomplete from '../mui/autocomplete'
import { generateRandomId } from 'src/common-functions/utils/UUID'

const EXPENSES_FIELDS = {
  key: generateRandomId(5),
  expenseName: '',
  vendorId: '',
  accountableForTax: false,
  accountableForOrderTaxes: false,
  inLocalCurrency: false,
  eligibleForTaxCredit: false,
  enabled: true
}
function ExpensesTable({ control, errors, purchaseSettingData }) {
  const { vendors = [] } = purchaseSettingData
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'expenses',
    rules: {
      required: false
    }
  })

  return (
    <>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: '10px' }}>
        <Typography sx={{ fontSize: '15px', fontWeight: 500, lineHeight: '40px' }}>Expenses: </Typography>
        {fields.length < 1 ? (
          <IconButton
            variant='outlined'
            color='success'
            sx={{ fontSize: '20px' }}
            onClick={() => {
              append(EXPENSES_FIELDS)
            }}
          >
            <Icon icon='material-symbols:add-box-outline' />
          </IconButton>
        ) : null}
      </Box>

      {fields?.length > 0
        ? fields?.map((item, index) => {
            return (
              <Grid container spacing={2} sx={{ mb: 3 }} key={item?.id}>
                <Grid item xs={10.5} md={11}>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={6} md={4} lg={2}>
                      <Controller
                        name={`expenses[${index}].expenseName`}
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <CustomTextField
                            {...field}
                            fullWidth
                            label='Expense Name'
                            error={Boolean(errors?.expenses && errors?.expenses[index]?.expenseName)}
                            helperText={
                              errors?.expenses && errors?.expenses[index]?.expenseName ? 'Name is required' : ''
                            }
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={6} sm={6} md={4} lg={2.2}>
                      <Controller
                        name={`expenses[${index}].vendorId`}
                        control={control}
                        rules={{ required: false }}
                        render={({ field }) => (
                          <CustomAutocomplete
                            {...field}
                            options={vendors}
                            getOptionLabel={option => option?.displayName || ''}
                            value={vendors?.find(option => option.vendorId === field.value) || null}
                            onChange={(e, newValue) => {
                              field.onChange(newValue.vendorId)
                            }}
                            renderInput={params => <CustomTextField {...params} label='Vendor' />}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={6} sm={6} md={4} lg={1.7}>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Controller
                          name={`expenses[${index}].accountableForTax`}
                          control={control}
                          render={({ field }) => (
                            <Checkbox sx={{ p: '4px' }} defaultChecked={field?.value} {...field} />
                          )}
                        />
                        <Typography sx={{ fontSize: '12px' }}>Accountable For Tax</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={6} md={4} lg={1.7}>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Controller
                          name={`expenses[${index}].accountableForOrderTaxes`}
                          control={control}
                          render={({ field }) => (
                            <Checkbox sx={{ p: '4px' }} defaultChecked={field?.value} {...field} />
                          )}
                        />
                        <Typography sx={{ fontSize: '12px' }}>Accountable For Order Taxes</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={6} md={4} lg={1.7}>
                      {' '}
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Controller
                          name={`expenses[${index}].eligibleForTaxCredit`}
                          control={control}
                          render={({ field }) => (
                            <Checkbox sx={{ p: '4px' }} defaultChecked={field?.value} {...field} />
                          )}
                        />
                        <Typography sx={{ fontSize: '12px' }}>Eligible For Tax Credit</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={6} md={4} lg={1.7}>
                      {' '}
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Controller
                          name={`expenses[${index}].inLocalCurrency`}
                          control={control}
                          render={({ field }) => (
                            <Checkbox sx={{ p: '4px' }} defaultChecked={field?.value} {...field} />
                          )}
                        />
                        <Typography sx={{ fontSize: '12px' }}>in Local Currency</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={6} md={4} lg={1}>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Controller
                          name={`expenses[${index}].enabled`}
                          control={control}
                          render={({ field }) => (
                            <Checkbox sx={{ p: '4px' }} defaultChecked={field?.value} {...field} />
                          )}
                        />
                        <Typography sx={{ fontSize: '12px' }}>Enabled</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={1.5} md={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {fields?.length >= 1 && fields?.length - 1 == index ? (
                      <>
                        <IconButton
                          size='small'
                          variant='outlined'
                          color='error'
                          sx={{ fontSize: '20px' }}
                          onClick={() => {
                            remove(index)
                          }}
                        >
                          <Icon icon='mingcute:delete-2-line' />
                        </IconButton>
                        <IconButton
                          size='small'
                          variant='outlined'
                          color='success'
                          sx={{ fontSize: '20px' }}
                          onClick={() => {
                            append({ ...EXPENSES_FIELDS, key: generateRandomId(5) })
                          }}
                        >
                          <Icon icon='material-symbols:add-box-outline' />
                        </IconButton>
                      </>
                    ) : (
                      <IconButton
                        size='small'
                        variant='outlined'
                        color='error'
                        sx={{ fontSize: '20px' }}
                        onClick={() => {
                          remove(index)
                        }}
                      >
                        <Icon icon='mingcute:delete-2-line' />
                      </IconButton>
                    )}
                  </Box>
                </Grid>
              </Grid>
            )
          })
        : null}
    </>
  )
}

export default ExpensesTable
