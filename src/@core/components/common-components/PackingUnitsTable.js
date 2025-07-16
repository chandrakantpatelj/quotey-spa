import {
  Box,
  Typography,
  IconButton,
  TableCell,
  Button,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  Checkbox
} from '@mui/material'
import React, { useState } from 'react'
import CustomTextField from '../mui/text-field'
import { AddOutlined } from '@mui/icons-material'
import Icon from 'src/@core/components/icon'
import { Controller, useFieldArray } from 'react-hook-form'

const LineItemFields = {
  unit: '',
  description: '',
  qtyPerUnit: 1
}

function PackingUnitsTable({ control, errors, selectedItem }) {
  const [isPackingUnitEnabled, setIsPackingUnitEnabled] = useState(selectedItem?.enablePackingUnit)
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'packingUnits',
    rules: {
      required: false
    }
  })
  const handleDimensionToggle = e => {
    setIsPackingUnitEnabled(e.target.checked)
  }

  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
        <Controller
          name='enablePackingUnit'
          control={control}
          render={({ field }) => (
            <Checkbox
              sx={{ p: '4px' }}
              defaultChecked={field.value}
              {...field}
              onChange={e => {
                field.onChange(e)
                handleDimensionToggle(e) // Toggle dimension visibility
              }}
            />
          )}
        />
        <Typography sx={{ fontSize: '13px' }}>Enable Packing Unit </Typography>
      </Box>

      {isPackingUnitEnabled && (
        <>
          <TableContainer>
            <Table
              sx={{
                minWidth: 450,
                width: '100%',
                '& .MuiTableCell-root': {
                  padding: '5px 6px !important',
                  borderBottom: '0px',
                  verticalAlign: 'top'
                }
              }}
            >
              <TableBody>
                {fields?.length > 0
                  ? fields?.map((item, index) => {
                      return (
                        <TableRow key={item?.id}>
                          <TableCell sx={{ width: '25%' }}>
                            <Controller
                              name={`packingUnits[${index}].unit`}
                              control={control}
                              rules={{ required: true }}
                              render={({ field }) => (
                                <CustomTextField
                                  {...field}
                                  fullWidth
                                  label='Unit'
                                  error={Boolean(errors?.packingUnits && errors?.packingUnits[index]?.unit)}
                                  helperText={
                                    errors?.packingUnits && errors?.packingUnits[index]?.unit ? 'Unit is required' : ''
                                  }
                                />
                              )}
                            />
                          </TableCell>
                          <TableCell sx={{ width: '25%' }}>
                            <Controller
                              name={`packingUnits[${index}].qtyPerUnit`}
                              control={control}
                              rules={{ required: false }}
                              render={({ field }) => <CustomTextField {...field} fullWidth label='Qty Per Unit' />}
                            />
                          </TableCell>
                          <TableCell sx={{ width: '40%' }}>
                            <Controller
                              name={`packingUnits[${index}].description`}
                              control={control}
                              rules={{ required: false }}
                              render={({ field }) => <CustomTextField {...field} fullWidth label='Description' />}
                            />
                          </TableCell>

                          <TableCell sx={{ width: '5%' }}>
                            <>
                              <IconButton
                                variant='outlined'
                                color='error'
                                size='small'
                                onClick={e => {
                                  remove(index)
                                }}
                              >
                                <Icon icon='mingcute:delete-2-line' />
                              </IconButton>
                            </>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  : null}
              </TableBody>
            </Table>
          </TableContainer>

          <Button
            color='primary'
            variant='contained'
            startIcon={<AddOutlined />}
            sx={{ mt: 2, mb: 4, ml: '5px' }}
            onClick={() => {
              append(LineItemFields)
            }}
          >
            Add New
          </Button>
        </>
      )}
    </>
  )
}

export default PackingUnitsTable
