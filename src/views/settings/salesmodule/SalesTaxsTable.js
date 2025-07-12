import { Box, Grid, IconButton, Checkbox, Typography, Button } from '@mui/material'
import { Controller, useFieldArray } from 'react-hook-form'
import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import { TAXES } from 'src/common-functions/utils/Constants'
import { AddOutlined } from '@mui/icons-material'
import { useSelector } from 'react-redux'
import useTaxAuthorities from 'src/hooks/getData/useTaxAuthorities'

const DEFAULT_TAX_FIELDS = {
  taxId: '',
  taxType: '',
  taxName: '',
  taxRate: '',
  taxAuthorityId: null,
  enabled: true
}

function SalesTaxsTable({ control, namePrefix, fieldArrayName, errors, taxFieldsTemplate = DEFAULT_TAX_FIELDS }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldArrayName
  })
  const tenantId = useSelector(state => state?.tenants?.selectedTenant?.tenantId || null)
  const { taxAuthorities } = useTaxAuthorities(tenantId)

  return (
    <>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: '10px' }}>
        {fieldArrayName === TAXES ? (
          <>
            <Typography sx={{ fontSize: '15px', fontWeight: 500, lineHeight: '40px' }}>Taxes: </Typography>
            {fields.length < 1 && (
              <IconButton
                variant='outlined'
                color='success'
                sx={{ fontSize: '20px' }}
                onClick={() => {
                  append(DEFAULT_TAX_FIELDS)
                }}
              >
                <Icon icon='material-symbols:add-box-outline' />
              </IconButton>
            )}
          </>
        ) : (
          fields?.length === 0 && (
            <Button
              color='primary'
              variant='contained'
              size='small'
              startIcon={<AddOutlined />}
              sx={{ mt: 2, mb: 4, ml: '5px' }}
              onClick={() => {
                append(DEFAULT_TAX_FIELDS)
              }}
            >
              Add Tax
            </Button>
          )
        )}
      </Box>

      {fields.map((tax, taxIndex) => (
        <Grid container spacing={2} key={taxIndex} sx={{ mb: 3 }}>
          <Grid item xs={10.5} md={11}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3.5}>
                <Controller
                  name={`${namePrefix}[${taxIndex}].taxName`}
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Tax Name'
                      error={Boolean(errors?.[namePrefix]?.[taxIndex]?.taxName)}
                      helperText={errors?.[namePrefix]?.[taxIndex]?.taxName ? 'Name is required' : ''}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={3} sm={2.5}>
                <Controller
                  name={`${namePrefix}[${taxIndex}].taxRate`}
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Tax Rate'
                      error={Boolean(errors?.[namePrefix]?.[taxIndex]?.taxRate)}
                      helperText={errors?.[namePrefix]?.[taxIndex]?.taxRate ? 'Rate is required' : ''}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={5} sm={3.5}>
                <Controller
                  name={`${namePrefix}[${taxIndex}].taxAuthorityId`}
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <CustomAutocomplete
                      id='taxAuthorityId'
                      {...field}
                      options={taxAuthorities}
                      getOptionLabel={option => option?.taxAuthorityName || ''}
                      value={taxAuthorities.find(option => option.taxAuthorityId === field.value) || null}
                      onChange={(e, newValue) => field.onChange(newValue.taxAuthorityId)}
                      disableClearable
                      renderInput={params => (
                        <CustomTextField
                          {...params}
                          fullWidth
                          label='Tax Authority'
                          error={Boolean(errors?.[namePrefix]?.[taxIndex]?.taxAuthorityId)}
                          helperText={
                            errors?.[namePrefix]?.[taxIndex]?.taxAuthorityId ? 'TaxAuthority is required' : ''
                          }
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={4} sm={2.5}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Controller
                    name={`${namePrefix}[${taxIndex}].enabled`}
                    control={control}
                    render={({ field }) => <Checkbox sx={{ p: '4px' }} defaultChecked={field?.value} {...field} />}
                  />
                  <Typography sx={{ fontSize: '13px' }}>Enabled</Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={1.5} md={1}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <IconButton size='small' variant='outlined' color='error' onClick={() => remove(taxIndex)}>
                <Icon icon='mingcute:delete-2-line' />
              </IconButton>
              {fields.length - 1 === taxIndex && (
                <IconButton
                  size='small'
                  variant='outlined'
                  color='success'
                  onClick={() => append({ ...taxFieldsTemplate })}
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

export default SalesTaxsTable
