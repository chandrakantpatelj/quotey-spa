import React, { useState, useEffect } from 'react'
import {
    Box,
    TableContainer,
    Table,
    TableBody,
    TableRow,
    TableCell,
    TableFooter,
    Divider,
    Typography,
    Autocomplete,
    IconButton
} from '@mui/material'
import CustomTextField from 'src/@core/components/mui/text-field'
import { Controller, useFieldArray } from 'react-hook-form'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import Icon from 'src/@core/components/icon'
import CustomTextFieldHtml from 'src/@core/components/common-components/CustomTextFeildHtml'

function CustomersTable({ control, errors, customers }) {
    const { fields, append, update, remove } = useFieldArray({
        control,
        name: 'customers',
        rules: {
            required: false
        }
    })

    return (
        <>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: '10px' }}>
                <Typography sx={{ fontSize: '16px', fontWeight: 500, lineHeight: '40px' }}>Customers </Typography>
                {fields.length < 1 ? (
                    <IconButton
                        variant='outlined'
                        color='success'
                        sx={{ fontSize: '20px' }}
                        onClick={() => {
                            append({
                                customerId: ''
                            })
                        }}
                    >
                        <Icon icon='material-symbols:add-box-outline' />
                    </IconButton>
                ) : null}
            </Box>

            {fields.length > 0 ? (
                <TableContainer>
                    <Table
                        sx={{
                            width: '100%',
                            marginBottom: '30px',
                            '& .MuiTableCell-root': {
                                padding: '5px 6px !important',
                                borderBottom: '0px',
                                verticalAlign: 'top'
                            }
                        }}
                    >
                        <TableBody>
                            {fields?.map((item, index) => {
                                return (
                                    <>
                                        <TableRow key={item?.id} sx={{ verticalAlign: 'top' }}>
                                            <TableCell sx={{ width: '90%' }}>
                                                <Controller
                                                    name={`customers[${index}].customerId`}
                                                    control={control}
                                                    rules={{ required: true }}
                                                    render={({ field }) => (
                                                        <CustomAutocomplete
                                                            {...field}
                                                            value={field.value}
                                                            onChange={(event, newValue) => {
                                                                field.onChange(newValue)
                                                            }}
                                                            options={customers}
                                                            getOptionLabel={option => option?.customerName || ''}
                                                            renderInput={params => (
                                                                <CustomTextField
                                                                    {...params}
                                                                    label='Customer'
                                                                    error={Boolean(errors.customerId)}
                                                                    {...(errors.customerId && { helperText: 'Customer Name is required' })}
                                                                />
                                                            )}
                                                        />
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ width: '10%' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'end' }}>
                                                    <IconButton
                                                        size='small'
                                                        variant='outlined'
                                                        color='error'
                                                        onClick={() => {
                                                            remove(index)
                                                        }}
                                                    >
                                                        <Icon icon='mingcute:delete-2-line' style={{ fontSize: '20px' }} />
                                                    </IconButton>
                                                    <IconButton
                                                        size='small'
                                                        variant='outlined'
                                                        color='success'
                                                        onClick={() => {
                                                            append({
                                                                customerId: ''
                                                            })
                                                        }}
                                                    >
                                                        <Icon icon='material-symbols:add-box-outline' style={{ fontSize: '20px' }} />
                                                    </IconButton>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    </>
                                )
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : null}
        </>
    )
}

export default CustomersTable
