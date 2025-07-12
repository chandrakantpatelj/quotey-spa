import { Box, Typography, Grid, IconButton, Checkbox } from '@mui/material'

import Icon from 'src/@core/components/icon'
import { Controller, useFieldArray } from 'react-hook-form'

import CustomTextField from 'src/@core/components/mui/text-field'
import SalesTaxsTable from './SalesTaxsTable'

const OTHER_TAXES = {
  taxId: '',
  taxType: '',
  taxName: '',
  taxRate: '',
  taxAuthorityId: null,
  enabled: true
}
const OTHER_FIELDS = {
  chargeId: '',
  chargeName: '',
  chargeType: '',
  includingTax: true,
  taxes: [OTHER_TAXES],
  enabled: true
}

function SalesExpensesTable({ control, errors, salesModuleData }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'otherCharges',
    rules: {
      required: false
    }
  })
  return (
    <>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: '10px' }}>
        <Typography sx={{ fontSize: '15px', fontWeight: 500, lineHeight: '40px' }}>Other Charges: </Typography>
        {fields.length < 1 ? (
          <IconButton
            variant='outlined'
            color='success'
            onClick={() => {
              append(OTHER_FIELDS)
            }}
          >
            <Icon icon='material-symbols:add-box-outline' />
          </IconButton>
        ) : null}
      </Box>

      {fields?.length > 0
        ? fields?.map((item, index) => {
            return (
              <Grid container spacing={2} key={index} sx={{ mb: 6, borderBottom: '1px dashed #e4e4e4' }}>
                <Grid item xs={10} md={10.5}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name={`otherCharges[${index}].chargeName`}
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <CustomTextField
                            {...field}
                            fullWidth
                            label='Expense Name'
                            error={Boolean(errors?.otherCharges && errors?.otherCharges[index]?.chargeName)}
                            helperText={
                              errors?.otherCharges && errors?.otherCharges[index]?.chargeName ? 'Name is required' : ''
                            }
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Controller
                          name={`otherCharges[${index}].includingTax`}
                          control={control}
                          render={({ field }) => (
                            <Checkbox sx={{ p: '4px' }} defaultChecked={field?.value} {...field} />
                          )}
                        />
                        <Typography sx={{ fontSize: '13px' }}>Including Tax</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Controller
                          name={`otherCharges[${index}].enabled`}
                          control={control}
                          render={({ field }) => (
                            <Checkbox sx={{ p: '4px' }} defaultChecked={field?.value} {...field} />
                          )}
                        />
                        <Typography sx={{ fontSize: '13px' }}>Enabled</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={12}>
                      <Box sx={{ mx: 3 }}>
                        <SalesTaxsTable
                          control={control}
                          namePrefix={`otherCharges[${index}].taxes`}
                          fieldArrayName={`otherCharges[${index}].taxes`}
                          salesModuleData={salesModuleData}
                          errors={errors}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={2} md={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                    {fields?.length >= 1 && fields?.length - 1 == index ? (
                      <>
                        <IconButton
                          variant='outlined'
                          color='error'
                          onClick={() => {
                            remove(index)
                          }}
                          // disabled={fields.length == 1 ? true : false}
                        >
                          <Icon icon='mingcute:delete-2-line' />
                        </IconButton>
                        <IconButton
                          variant='outlined'
                          color='success'
                          onClick={() => {
                            append({ ...OTHER_FIELDS })
                          }}
                        >
                          <Icon icon='material-symbols:add-box-outline' />
                        </IconButton>
                      </>
                    ) : (
                      <IconButton
                        variant='outlined'
                        color='error'
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

export default SalesExpensesTable
