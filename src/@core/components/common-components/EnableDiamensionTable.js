import React, { useState } from 'react'
import { Box, Typography, Checkbox, Grid } from '@mui/material'
import CustomTextField from '../mui/text-field'
import { Controller } from 'react-hook-form'

function EnableDiamensionTable({ control, setValue, selectedItem }) {
  const [isDimensionEnabled, setIsDimensionEnabled] = useState(selectedItem?.enableDimension)
  const [isLengthEnabled, setIsLengthEnabled] = useState(selectedItem?.dimensions?.length)
  const [isWidthEnabled, setIsWidthEnabled] = useState(selectedItem?.dimensions?.width)
  const [isHeightEnabled, setIsHeightEnabled] = useState(selectedItem?.dimensions?.height)

  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
        <Controller
          name='enableDimension'
          control={control}
          render={({ field }) => (
            <Checkbox
              sx={{ p: '4px' }}
              defaultChecked={field.value}
              {...field}
              onChange={e => {
                field.onChange(e)
                setIsDimensionEnabled(e.target.checked)
              }}
            />
          )}
        />
        <Typography sx={{ fontSize: '13px' }}>Enable Dimension </Typography>
      </Box>
      {isDimensionEnabled && (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4} md={3.5}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Controller
                  name='length'
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      {...field}
                      sx={{ p: '4px' }}
                      defaultChecked={isLengthEnabled ? true : false}
                      onChange={e => {
                        field.onChange(e)
                        setIsLengthEnabled(e.target.checked) // Toggle text field visibility
                        if (e.target.checked) {
                          setValue('dimensions.length.defaultValue', 1)
                          setValue('dimensions.length.minimumValue', 1)
                        } else {
                          setValue('dimensions.length', undefined)
                        }
                      }}
                    />
                  )}
                />
                <Typography sx={{ fontSize: '13px' }}>Length </Typography>
              </Box>
            </Grid>
            {isLengthEnabled && (
              <>
                <Grid item xs={6} sm={4} md={4.2}>
                  <Controller
                    name='dimensions.length.defaultValue'
                    control={control}
                    rules={{
                      required: false
                    }}
                    render={({ field }) => <CustomTextField {...field} fullWidth label='Default Value' />}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={4.2}>
                  <Controller
                    name='dimensions.length.minimumValue'
                    control={control}
                    rules={{ required: false }}
                    render={({ field }) => <CustomTextField {...field} fullWidth label='Minimum Value' />}
                  />
                </Grid>
              </>
            )}
          </Grid>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4} md={3.5}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Controller
                  name='width'
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      sx={{ p: '4px' }}
                      {...field}
                      defaultChecked={isWidthEnabled ? true : false}
                      onChange={e => {
                        field.onChange(e)
                        setIsWidthEnabled(e.target.checked)
                        if (e.target.checked) {
                          setValue('dimensions.width.defaultValue', 1)
                          setValue('dimensions.width.minimumValue', 1)
                        } else {
                          setValue('dimensions.width', undefined)
                        }
                      }}
                    />
                  )}
                />
                <Typography sx={{ fontSize: '13px' }}>Width </Typography>
              </Box>
            </Grid>
            {isWidthEnabled && (
              <>
                <Grid item xs={6} sm={4} md={4.2}>
                  <Controller
                    name='dimensions.width.defaultValue'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => <CustomTextField {...field} fullWidth label='Default Value' />}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={4.2}>
                  <Controller
                    name='dimensions.width.minimumValue'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => <CustomTextField {...field} fullWidth label='Minimum Value' />}
                  />
                </Grid>
              </>
            )}
          </Grid>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4} md={3.5}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Controller
                  name='height'
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      sx={{ p: '4px' }}
                      {...field}
                      defaultChecked={isHeightEnabled ? true : false}
                      onChange={e => {
                        field.onChange(e)
                        setIsHeightEnabled(e.target.checked)

                        if (e.target.checked) {
                          setValue('dimensions.height.defaultValue', 1)
                          setValue('dimensions.height.minimumValue', 1)
                        } else {
                          setValue('dimensions.height', undefined)
                        }
                      }}
                    />
                  )}
                />
                <Typography sx={{ fontSize: '13px' }}>Height </Typography>
              </Box>
            </Grid>
            {isHeightEnabled && (
              <>
                <Grid item xs={6} sm={4} md={4.2}>
                  <Controller
                    name='dimensions.height.defaultValue'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => <CustomTextField {...field} fullWidth label='Default Value' />}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={4.2}>
                  <Controller
                    name='dimensions.height.minimumValue'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => <CustomTextField {...field} fullWidth label='Minimum Value' />}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </>
      )}
    </>
  )
}
export default EnableDiamensionTable
