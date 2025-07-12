import React, { useState, useEffect } from 'react'
import {
  Box,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  IconButton,
  InputAdornment,
  TableContainer
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import { useSelector } from 'react-redux'
import CustomTextField from 'src/@core/components/mui/text-field'
import { Controller, useFieldArray } from 'react-hook-form'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import useCurrencies from 'src/hooks/getData/useCurrencies'

function ItemsListTable({ control, errors, setValue, products }) {
  const { currencies } = useCurrencies()
  const { fields, update, append, remove, replace } = useFieldArray({
    control,
    name: 'itemList',
    rules: {
      required: true
    }
  })
  const getCuurencyObj = id => {
    return currencies?.find(cuurencyObj => cuurencyObj.currencyId === id)
  }
  return (
    <>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Typography sx={{ fontSize: '15px', fontWeight: 500, lineHeight: '40px' }}>Items </Typography>
        {fields.length < 1 ? (
          <IconButton
            variant='outlined'
            color='success'
            sx={{ fontSize: '20px' }}
            onClick={() => {
              append({
                itemId: '',
                uom: '',
                sellingPrice: 0,
                sellingPriceTaxInclusive: '',
                sellingPriceCurrency: ''
              })
            }}
          >
            <Icon icon='material-symbols:add-box-outline' />
          </IconButton>
        ) : null}
      </Box>
      {fields?.length > 0 ? (
        <TableContainer>
          <Table
            sx={{
              minWidth: 670,
              width: '100%',
              '& .MuiTableCell-root': {
                padding: '5px 6px !important',
                borderBottom: '0px',
                verticalAlign: 'top'
              }
            }}
          >
            <TableBody>
              {fields?.map((item, index) => {
                let itemCurrency = getCuurencyObj(item?.sellingPriceCurrency)

                return (
                  <TableRow key={item?.id} sx={{ verticalAlign: 'top' }}>
                    <TableCell sx={{ width: '20%' }}>
                      <Controller
                        name={`itemList[${index}].itemId`}
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <CustomAutocomplete
                            {...field}
                            value={item}
                            onChange={(event, newValue) => {
                              field.onChange(newValue)
                              update(index, newValue)

                              setValue(`itemList[${index}].itemId`, newValue?.itemId)
                              setValue(`itemList[${index}].itemName`, newValue?.itemName)
                              setValue(`itemList[${index}].sellingPriceCurrency`, newValue?.sellingPriceCurrency)
                            }}
                            options={products}
                            getOptionLabel={option => option?.itemName}
                            isOptionEqualToValue={(option, value) => option?.itemId === value?.itemId}
                            renderOption={(props, option) => {
                              return (
                                <li {...props} key={option?.itemId}>
                                  {option?.itemCode}-{option?.itemName || ''}
                                </li>
                              )
                            }}
                            renderInput={params => (
                              <CustomTextField
                                {...params}
                                label='Item Name'
                                error={Boolean(errors?.itemList && errors?.itemList[index]?.itemId)}
                                helperText={
                                  errors?.itemList && errors?.itemList[index]?.itemId ? 'Item Name is required' : ''
                                }
                              />
                            )}
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell sx={{ width: '15%' }}>
                      <Controller
                        name={`itemList[${index}].uom`}
                        control={control}
                        rules={{ required: false }}
                        render={({ field }) => (
                          <CustomTextField
                            {...field}
                            value={field.value}
                            onChange={newValue => {
                              field.onChange(newValue)
                            }}
                            fullWidth
                            label='Uom'
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell sx={{ width: '15%' }}>
                      <Controller
                        name={`itemList[${index}].sellingPrice`}
                        control={control}
                        rules={{ required: false }}
                        render={({ field }) => (
                          <CustomTextField
                            {...field}
                            value={field.value}
                            onChange={newValue => {
                              field.onChange(newValue)
                            }}
                            InputProps={{
                              startAdornment:
                                itemCurrency?.displayAlignment === 'left' ? (
                                  <InputAdornment position='start'>{itemCurrency?.symbol}</InputAdornment>
                                ) : null,
                              endAdornment:
                                itemCurrency?.displayAlignment === 'right' ? (
                                  <InputAdornment position='end'>{itemCurrency?.symbol}</InputAdornment>
                                ) : null
                            }}
                            fullWidth
                            label='Selling Price'
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell sx={{ width: '5%' }}>
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
                            >
                              <Icon icon='mingcute:delete-2-line' />
                            </IconButton>
                            <IconButton
                              variant='outlined'
                              color='success'
                              sx={{ fontSize: '20px' }}
                              onClick={() => {
                                append({
                                  itemId: '',
                                  uom: '',
                                  sellingPrice: 0,
                                  sellingPriceTaxInclusive: '',
                                  sellingPriceCurrency: ''
                                })
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
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : null}
    </>
  )
}

export default ItemsListTable
