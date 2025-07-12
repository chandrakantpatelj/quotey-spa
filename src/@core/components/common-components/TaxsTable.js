import { Box, Typography, IconButton, Checkbox, Grid } from '@mui/material'
import CustomTextField from '../mui/text-field'
import Icon from 'src/@core/components/icon'
import { Controller, useFieldArray } from 'react-hook-form'
import CustomAutocomplete from '../mui/autocomplete'
import { generateRandomId } from 'src/common-functions/utils/UUID'

const TAX_FIELDS = {
  key: generateRandomId(5),
  taxName: '',
  taxRate: 0.0,
  taxAuthorityId: '',
  paidToTaxAuthority: false,
  eligibleForTaxCredit: false,
  inLocalCurrency: true,
  enabled: true
}

function TaxsTable({ control, errors, purchaseSettingData }) {
  const { taxAuthorities = [] } = purchaseSettingData

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'taxes',
    rules: {
      required: false
    }
  })

  return (
    <>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: '10px' }}>
        <Typography sx={{ fontSize: '15px', fontWeight: 500, lineHeight: '40px' }}>Taxes: </Typography>
        {fields.length < 1 ? (
          <IconButton
            variant='outlined'
            color='success'
            sx={{ fontSize: '20px' }}
            onClick={() => {
              append(TAX_FIELDS)
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
                    <Grid item xs={12} md={4} lg={2}>
                      <Controller
                        name={`taxes[${index}].taxName`}
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <CustomTextField
                            {...field}
                            fullWidth
                            label='Tax Name'
                            error={Boolean(errors?.taxes && errors?.taxes[index]?.taxName)}
                            helperText={errors?.taxes && errors?.taxes[index]?.taxName ? 'Name is required' : ''}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={3} md={4} lg={1}>
                      <Controller
                        name={`taxes[${index}].taxRate`}
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <CustomTextField
                            {...field}
                            fullWidth
                            label='Tax Rate'
                            error={Boolean(errors?.taxes && errors?.taxes[index]?.value)}
                            helperText={errors?.taxes && errors?.taxes[index]?.value ? 'Value is required' : ''}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={9} md={4} lg={2}>
                      <Controller
                        name={`taxes[${index}].taxAuthorityId`}
                        control={control}
                        rules={{ required: false }}
                        render={({ field }) => (
                          <CustomAutocomplete
                            id='taxAuthorityId'
                            {...field}
                            options={taxAuthorities || []}
                            getOptionLabel={option => option?.taxAuthorityName || ''}
                            value={taxAuthorities?.find(option => option.taxAuthorityId === field.value) || null}
                            onChange={(e, newValue) => {
                              field.onChange(newValue.taxAuthorityId)
                            }}
                            disableClearable
                            renderInput={params => <CustomTextField {...params} fullWidth label='Tax Authority' />}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={6} md={3} lg={2}>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Controller
                          name={`taxes[${index}].paidToTaxAuthority`}
                          control={control}
                          render={({ field }) => (
                            <Checkbox sx={{ p: '4px' }} defaultChecked={field?.value} {...field} />
                          )}
                        />
                        <Typography sx={{ fontSize: '12px' }}>Paid To TaxAuthority</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={3} lg={2.5}>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Controller
                          name={`taxes[${index}].eligibleForTaxCredit`}
                          control={control}
                          render={({ field }) => (
                            <Checkbox sx={{ p: '4px' }} defaultChecked={field?.value} {...field} />
                          )}
                        />
                        <Typography sx={{ fontSize: '12px' }}>Eligible For Tax Credit</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={3} lg={1.5}>
                      {' '}
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Controller
                          name={`taxes[${index}].inLocalCurrency`}
                          control={control}
                          render={({ field }) => (
                            <Checkbox sx={{ p: '4px' }} defaultChecked={field?.value} {...field} />
                          )}
                        />
                        <Typography sx={{ fontSize: '12px' }}>in Local Currency</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={3} lg={1}>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Controller
                          name={`taxes[${index}].enabled`}
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
                          // disabled={fields.length == 1 ? true : false}
                        >
                          <Icon icon='mingcute:delete-2-line' />
                        </IconButton>
                        <IconButton
                          size='small'
                          variant='outlined'
                          color='success'
                          sx={{ fontSize: '20px' }}
                          onClick={() => {
                            append({ ...TAX_FIELDS, key: generateRandomId(5) })
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

export default TaxsTable
