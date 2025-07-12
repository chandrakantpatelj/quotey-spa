import React from 'react'
import { Box, Typography, Grid, IconButton } from '@mui/material'
import CustomTextField from '../mui/text-field'
import Icon from 'src/@core/components/icon'
import { Controller, useFieldArray } from 'react-hook-form'

function TaxationTable({ control, errors }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'taxations',
    rules: {
      required: false
    }
  })

  return (
    <>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: '10px' }}>
        <Typography sx={{ fontSize: '15px', fontWeight: 500, lineHeight: '40px' }}>Taxation Fields </Typography>
        {fields.length < 1 ? (
          <IconButton
            variant='outlined'
            color='success'
            sx={{ fontSize: '20px' }}
            onClick={() => {
              append({ key: '', value: '' })
            }}
          >
            <Icon icon='material-symbols:add-box-outline' />
          </IconButton>
        ) : null}
      </Box>
      {fields?.length > 0
        ? fields?.map((item, index) => {
            return (
              <>
                <Grid container spacing={2} key={item?.key} sx={{ mb: 2 }}>
                  <Grid item xs={5}>
                    <Controller
                      name={`taxations[${index}].key`}
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { value, onChange } }) => (
                        <CustomTextField
                          fullWidth
                          label='Name'
                          value={value}
                          onChange={e => onChange(e.target.value.toUpperCase())}
                          error={Boolean(errors?.taxations && errors?.taxations[index]?.key)}
                          helperText={errors?.taxations && errors?.taxations[index]?.key ? 'Name is required' : ''}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={5}>
                    <Controller
                      name={`taxations[${index}].value`}
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { value, onChange } }) => (
                        <CustomTextField
                          fullWidth
                          label='Value'
                          value={value}
                          onChange={onChange}
                          error={Boolean(errors?.taxations && errors?.taxations[index]?.value)}
                          helperText={errors?.taxations && errors?.taxations[index]?.value ? 'Value is required' : ''}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={2} sm={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                      {fields?.length >= 1 && fields?.length - 1 == index ? (
                        <>
                          <IconButton
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
                            variant='outlined'
                            color='success'
                            sx={{ fontSize: '20px' }}
                            onClick={() => {
                              append({ key: '', value: '' })
                            }}
                          >
                            <Icon icon='material-symbols:add-box-outline' />
                          </IconButton>
                        </>
                      ) : (
                        <IconButton
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
              </>
            )
          })
        : null}
    </>
  )
}

export default TaxationTable
