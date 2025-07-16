import { useState, useMemo } from 'react'
import {
  Box,
  Table,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Typography,
  Grid,
  TableContainer,
  Divider,
  Button
} from '@mui/material'
import CustomTextField from 'src/@core/components/mui/text-field'
import Icon from 'src/@core/components/icon'
import { Controller, useFieldArray } from 'react-hook-form'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import { AddOutlined } from '@mui/icons-material'
import {
  calculateQuantity,
  floatPattern,
  floatPatternMsg,
  getAdornmentConfig,
  handleDecimalPlaces
} from 'src/common-functions/utils/UtilityFunctions'
import CommonItemPopup from 'src/common-components/CommonItemPopup'
import { addDecimals, addDecimalsWithoutRounding } from 'src/common-functions/utils/DecimalUtils'

const fieldRows = {
  itemId: '',
  itemCode: '',
  itemCodePrefix: '',
  itemName: '',
  enableDimension: false,
  enablePackingUnit: false,
  dimensions: {},
  itemDimension: {
    length: 0,
    width: 0,
    height: 0,
    qty: 0
  },
  packingUnit: {
    unit: '',
    description: '',
    qtyPerUnit: 0,
    qty: 0
  },
  packingUnits: [],
  qty: 0,
  uom: '',
  itemDescription: '',
  totalValue: 0
}

export default function StockAdjustmentItemsTable({ control, products, currency, setValue, getValues }) {
  const localAdornmentConfig = getAdornmentConfig(currency)

  const { append, update, remove } = useFieldArray({
    control,
    name: 'adjustmentItems',
    rules: {
      required: false
    }
  })

  let adjustmentItems = getValues('adjustmentItems') || []

  let filteredItems =
    products?.filter(item => !adjustmentItems?.some(selected => selected?.itemId === item?.itemId)) || []

  const recalculateTotals = () => {
    let totalQty = 0
    let subTotal = 0

    adjustmentItems?.map((item, index) => {
      const calcQty = calculateQuantity(item)
      setValue(`adjustmentItems[${index}].qty`, calcQty)
      totalQty = addDecimalsWithoutRounding(totalQty, calcQty)
      subTotal = addDecimals(subTotal, item?.totalValue)
    })

    setValue('totalQty', totalQty)
    setValue('subTotal', subTotal)
  }
  useMemo(() => {
    recalculateTotals()
  }, [adjustmentItems])

  const [openDialog, setOpenDialog] = useState({})

  const handleClick = index => {
    setOpenDialog(prevOpen => ({
      ...prevOpen,
      [index]: !prevOpen[index]
    }))
  }

  return (
    <>
      <Grid item xs={12} md={12} xl={10} id='adjustmentItems'>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
          <Typography sx={{ fontSize: '15px', fontWeight: 500, lineHeight: '40px' }}>Items </Typography>
          {adjustmentItems.length < 1 ? (
            <IconButton
              variant='outlined'
              color='success'
              sx={{ fontSize: '20px' }}
              disabled={filteredItems?.length <= 0}
              onClick={() => {
                append(fieldRows)
              }}
            >
              <Icon icon='material-symbols:add-box-outline' />
            </IconButton>
          ) : null}
        </Box>

        <>
          {adjustmentItems?.length > 0 ? (
            <TableContainer>
              <Table
                sx={{
                  minWidth: 650,
                  width: '100%',
                  '& .MuiTableRow-root': { verticalAlign: 'top' },
                  '& .MuiTableCell-root': {
                    padding: '5px 6px !important',
                    borderBottom: '0px',
                    verticalAlign: 'top'
                  }
                }}
              >
                <TableBody>
                  {adjustmentItems?.map((orderItem, index) => {
                    return (
                      <>
                        <TableRow key={orderItem?.itemId}>
                          <TableCell sx={{ width: '16%' }}>
                            <Controller
                              name={`adjustmentItems[${index}].itemName`}
                              control={control}
                              rules={{ required: 'Item name is required' }}
                              render={({ field, fieldState: { error } }) => (
                                <CustomAutocomplete
                                  {...field}
                                  value={orderItem}
                                  onChange={(event, newValue) => {
                                    field.onChange(newValue)
                                    let packingUnits = newValue?.packingUnits || []

                                    setValue(`adjustmentItems[${index}].packingUnit`, {
                                      ...packingUnits[0],
                                      qty: newValue?.enablePackingUnit ? 1 : 0
                                    })

                                    setValue(`adjustmentItems[${index}].itemDimension.qty`, 1)
                                    setValue(`adjustmentItems[${index}].qty`, 1)

                                    update(index, {
                                      itemId: newValue?.itemId,
                                      itemCode: newValue?.itemCode,
                                      itemCodePrefix: newValue?.itemCodePrefix,
                                      itemName: newValue?.itemName,
                                      enableDimension: newValue?.enableDimension,
                                      enablePackingUnit: newValue?.enablePackingUnit,
                                      dimensions: newValue?.dimensions,
                                      packingUnits: newValue?.packingUnits,
                                      uom: newValue?.uom,
                                      itemDescription: newValue?.itemDescription,
                                      packingUnit: {
                                        unit: packingUnits[0]?.unit || '',
                                        qtyPerUnit: packingUnits[0]?.qtyPerUnit || 0,
                                        description: packingUnits[0]?.description || '',
                                        qty: newValue?.enablePackingUnit ? 1 : 0
                                      },
                                      itemDimension: {
                                        length: newValue?.dimensions?.length?.defaultValue ?? 1,
                                        width: newValue?.dimensions?.width?.defaultValue ?? 1,
                                        height: newValue?.dimensions?.height?.defaultValue ?? 1,
                                        qty: 1
                                      },
                                      qty: 1,
                                      totalValue: 0,
                                      currency: currency?.currencyId
                                    })

                                    recalculateTotals()
                                    if (newValue === null) {
                                      setValue(`adjustmentItems[${index}]`, fieldRows)
                                    }
                                  }}
                                  options={filteredItems}
                                  getOptionLabel={option => option?.itemName || ''}
                                  renderInput={params => (
                                    <CustomTextField
                                      {...params}
                                      label='Item Name'
                                      error={Boolean(error)}
                                      helperText={error?.message}
                                    />
                                  )}
                                />
                              )}
                            />
                          </TableCell>
                          <TableCell sx={{ width: '30%' }}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                              <Box component='div' sx={{ width: '70%' }}>
                                {orderItem?.enablePackingUnit ? (
                                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    <Controller
                                      name={`adjustmentItems[${index}].packingUnit.unit`}
                                      control={control}
                                      render={({ field }) => (
                                        <CustomAutocomplete
                                          sx={{ width: '45%' }}
                                          value={
                                            orderItem?.packingUnits?.find(option => option.unit === field.value) ||
                                            orderItem?.packingUnits[0] || { unit: '' }
                                          }
                                          onChange={(e, newValue) => {
                                            const unit = newValue?.unit || ''
                                            field.onChange(unit)

                                            setValue(`adjustmentItems[${index}].packingUnit.unit`, unit)
                                            setValue(
                                              `adjustmentItems[${index}].packingUnit.qtyPerUnit`,
                                              newValue?.qtyPerUnit || ''
                                            )
                                            update(
                                              `adjustmentItems[${index}].packingUnit.qtyPerUnit`,
                                              newValue?.qtyPerUnit || ''
                                            )
                                            setValue(
                                              `adjustmentItems[${index}].packingUnit.description`,
                                              newValue?.description || ''
                                            )
                                          }}
                                          disableClearable
                                          options={orderItem?.packingUnits}
                                          getOptionLabel={option => option.unit || ''}
                                          isOptionEqualToValue={(option, value) => option.unit === value}
                                          renderInput={params => (
                                            <CustomTextField {...params} fullWidth label='Packing Unit' />
                                          )}
                                        />
                                      )}
                                    />

                                    <Controller
                                      name={`adjustmentItems[${index}].packingUnit.qty`}
                                      control={control}
                                      rules={{
                                        required: 'Qty is required',
                                        pattern: {
                                          value: floatPattern,
                                          message: floatPatternMsg
                                        }
                                      }}
                                      //
                                      render={({ field: { onChange }, fieldState: { error } }) => (
                                        <CustomTextField
                                          sx={{ width: '35%' }}
                                          label='Qty'
                                          inputProps={{ min: 0 }}
                                          value={orderItem?.packingUnit?.qty}
                                          onChange={e => {
                                            const value = e.target.value
                                            const formattedValue = handleDecimalPlaces(value)
                                            onChange(formattedValue)
                                            update(`adjustmentItems[${index}].packingUnit.qty`, formattedValue)
                                          }}
                                          error={Boolean(error)}
                                          helperText={error?.message}
                                        />
                                      )}
                                    />
                                    <Controller
                                      name={`adjustmentItems[${index}].packingUnit.qtyPerUnit`}
                                      control={control}
                                      render={() => (
                                        <CustomTextField
                                          value={orderItem?.packingUnit?.qtyPerUnit}
                                          fullWidth
                                          label='Qty Per Unit'
                                          InputProps={{
                                            disabled: true
                                          }}
                                          sx={{ width: '35%' }}
                                        />
                                      )}
                                    />
                                  </Box>
                                ) : orderItem?.enableDimension === true ? (
                                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    {orderItem?.dimensions?.length !== null && (
                                      <Controller
                                        name={`adjustmentItems[${index}].itemDimension.length`}
                                        control={control}
                                        rules={{
                                          pattern: {
                                            value: floatPattern,
                                            message: floatPatternMsg
                                          }
                                        }}
                                        render={({ field: { onChange }, fieldState: { error } }) => (
                                          <CustomTextField
                                            fullWidth
                                            label='L'
                                            value={orderItem?.itemDimension?.length}
                                            onChange={e => {
                                              const value = e.target.value
                                              const formattedValue = handleDecimalPlaces(value)
                                              onChange(formattedValue)
                                              update(`adjustmentItems[${index}].itemDimension.length`, formattedValue)
                                            }}
                                            error={Boolean(error)}
                                            helperText={error?.message}
                                          />
                                        )}
                                      />
                                    )}
                                    {orderItem?.dimensions?.width !== null && (
                                      <Controller
                                        name={`adjustmentItems[${index}].itemDimension.width`}
                                        control={control}
                                        rules={{
                                          pattern: {
                                            value: floatPattern,
                                            message: floatPatternMsg
                                          }
                                        }}
                                        render={({ field: { onChange }, fieldState: { error } }) => (
                                          <CustomTextField
                                            fullWidth
                                            label='W'
                                            value={orderItem?.itemDimension?.width}
                                            onChange={e => {
                                              const value = e.target.value
                                              const formattedValue = handleDecimalPlaces(value)
                                              onChange(formattedValue)
                                              update(`adjustmentItems[${index}].itemDimension.width`, formattedValue)
                                            }}
                                            error={Boolean(error)}
                                            helperText={error?.message}
                                          />
                                        )}
                                      />
                                    )}
                                    {orderItem?.dimensions?.height !== null && (
                                      <Controller
                                        name={`adjustmentItems[${index}].itemDimension.height`}
                                        control={control}
                                        rules={{
                                          pattern: {
                                            value: floatPattern,
                                            message: floatPatternMsg
                                          }
                                        }}
                                        render={({ field: { onChange }, fieldState: { error } }) => (
                                          <CustomTextField
                                            fullWidth
                                            label='H'
                                            value={orderItem?.itemDimension?.height}
                                            onChange={e => {
                                              const value = e.target.value
                                              const formattedValue = handleDecimalPlaces(value)
                                              onChange(formattedValue)
                                              update(`adjustmentItems[${index}].itemDimension.height`, formattedValue)
                                            }}
                                            error={Boolean(error)}
                                            helperText={error?.message}
                                          />
                                        )}
                                      />
                                    )}
                                    <Controller
                                      name={`adjustmentItems[${index}].itemDimension.qty`}
                                      control={control}
                                      rules={{
                                        required: 'Qty is required',
                                        pattern: {
                                          value: floatPattern,
                                          message: floatPatternMsg
                                        }
                                      }}
                                      render={({ field: { value, onChange }, fieldState: { error } }) => (
                                        <CustomTextField
                                          fullWidth
                                          label='Qty'
                                          inputProps={{ min: 0 }}
                                          value={value}
                                          onChange={e => {
                                            const value = e.target.value
                                            const formattedValue = handleDecimalPlaces(value)
                                            onChange(formattedValue)
                                            update(`adjustmentItems[${index}].itemDimension.qty`, formattedValue)
                                          }}
                                          error={Boolean(error)}
                                          helperText={error?.message}
                                        />
                                      )}
                                    />
                                  </Box>
                                ) : (
                                  <>
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                      {(orderItem?.uom === 'm2' || orderItem?.uom === 'm3') && (
                                        <>
                                          <Controller
                                            name={`adjustmentItems[${index}].itemDimension.length`}
                                            control={control}
                                            rules={{
                                              pattern: {
                                                value: floatPattern,
                                                message: floatPatternMsg
                                              }
                                            }}
                                            render={({ field: { value, onChange }, fieldState: { error } }) => (
                                              <CustomTextField
                                                fullWidth
                                                label='L'
                                                value={value}
                                                onChange={e => {
                                                  const value = e.target.value
                                                  const formattedValue = handleDecimalPlaces(value)
                                                  onChange(formattedValue)
                                                  update(
                                                    `adjustmentItems[${index}].itemDimension.length`,
                                                    formattedValue
                                                  )
                                                }}
                                                error={Boolean(error)}
                                                helperText={error?.message}
                                              />
                                            )}
                                          />
                                          <Controller
                                            name={`adjustmentItems[${index}].itemDimension.width`}
                                            control={control}
                                            rules={{
                                              pattern: {
                                                value: floatPattern,
                                                message: floatPatternMsg
                                              }
                                            }}
                                            render={({ field: { value, onChange }, fieldState: { error } }) => (
                                              <CustomTextField
                                                fullWidth
                                                label='W'
                                                value={value}
                                                onChange={e => {
                                                  const value = e.target.value
                                                  const formattedValue = handleDecimalPlaces(value)
                                                  onChange(formattedValue)
                                                  update(
                                                    `adjustmentItems[${index}].itemDimension.width`,
                                                    formattedValue
                                                  )
                                                }}
                                                error={Boolean(error)}
                                                helperText={error?.message}
                                              />
                                            )}
                                          />
                                          {orderItem?.uom === 'm3' && (
                                            <Controller
                                              name={`adjustmentItems[${index}].itemDimension.height`}
                                              control={control}
                                              rules={{
                                                pattern: {
                                                  value: floatPattern,
                                                  message: floatPatternMsg
                                                }
                                              }}
                                              render={({ field: { value, onChange }, fieldState: { error } }) => (
                                                <CustomTextField
                                                  fullWidth
                                                  label='H'
                                                  value={value}
                                                  onChange={e => {
                                                    const value = e.target.value
                                                    const formattedValue = handleDecimalPlaces(value)
                                                    onChange(formattedValue)
                                                    setValue(
                                                      `adjustmentItems[${index}].itemDimension.height`,
                                                      formattedValue
                                                    )
                                                    update(
                                                      `adjustmentItems[${index}].itemDimension.height`,
                                                      formattedValue
                                                    )
                                                  }}
                                                  error={Boolean(error)}
                                                  helperText={error?.message}
                                                />
                                              )}
                                            />
                                          )}
                                        </>
                                      )}
                                      <Controller
                                        name={`adjustmentItems[${index}].itemDimension.qty`}
                                        control={control}
                                        rules={{
                                          required: 'Qty is required',
                                          pattern: {
                                            value: floatPattern,
                                            message: floatPatternMsg
                                          }
                                        }}
                                        render={({ field: { value, onChange }, fieldState: { error } }) => (
                                          <CustomTextField
                                            fullWidth
                                            label='Qty'
                                            inputProps={{ min: 0 }}
                                            value={value}
                                            onChange={e => {
                                              const value = e.target.value
                                              const formattedValue = handleDecimalPlaces(value)
                                              onChange(formattedValue)
                                              update(`adjustmentItems[${index}].itemDimension.qty`, formattedValue)
                                            }}
                                            error={Boolean(error)}
                                            helperText={error?.message}
                                          />
                                        )}
                                      />{' '}
                                    </Box>
                                  </>
                                )}
                              </Box>

                              <Box sx={{ width: '30% !important' }}>
                                <Controller
                                  name={`adjustmentItems[${index}].qty`}
                                  control={control}
                                  render={() => (
                                    <CustomTextField
                                      value={parseFloat(orderItem?.qty)?.toFixed(2)}
                                      label='Total Qty'
                                      fullWidth
                                      InputProps={{
                                        disabled: true
                                      }}
                                    />
                                  )}
                                />{' '}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ width: '7%' }}>
                            <Controller
                              name={`adjustmentItems[${index}].uom`}
                              control={control}
                              render={() => (
                                <CustomTextField
                                  value={orderItem?.uom}
                                  label='Uom'
                                  fullWidth
                                  InputProps={{
                                    disabled: true
                                  }}
                                />
                              )}
                            />
                          </TableCell>
                          <TableCell sx={{ width: '12%' }}>
                            <Controller
                              name={`adjustmentItems[${index}].totalValue`}
                              control={control}
                              rules={{
                                pattern: {
                                  value: floatPattern,
                                  message: floatPatternMsg
                                }
                              }}
                              render={({ field: { onChange }, fieldState: { error } }) => (
                                <CustomTextField
                                  value={orderItem?.totalValue}
                                  onChange={e => {
                                    const value = e.target.value
                                    const formattedValue = handleDecimalPlaces(value)
                                    onChange(formattedValue)
                                    setValue(`adjustmentItems[${index}].totalValue`, formattedValue)
                                    update(`adjustmentItems[${index}].totalValue`, formattedValue)
                                  }}
                                  label='Total Value'
                                  fullWidth
                                  InputProps={{
                                    inputProps: {
                                      min: 0
                                    },
                                    ...localAdornmentConfig
                                  }}
                                  error={Boolean(error)}
                                  helperText={error?.message}
                                />
                              )}
                            />
                          </TableCell>

                          <TableCell rowSpan={2} sx={{ width: '0%', verticalAlign: 'middle !important' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                              {orderItem?.itemId !== '' && orderItem?.itemId !== null ? (
                                <IconButton
                                  variant='outlined'
                                  sx={{ fontSize: '21px' }}
                                  onClick={() => handleClick(index)}
                                >
                                  <Icon icon='tabler:eye' />
                                </IconButton>
                              ) : null}
                              {openDialog[index] ? (
                                <CommonItemPopup
                                  openDialog={openDialog[index]}
                                  setOpenDialog={setOpenDialog}
                                  itemId={orderItem?.itemId}
                                />
                              ) : null}

                              {adjustmentItems?.length >= 1 && adjustmentItems?.length - 1 == index ? (
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
                                </>
                              ) : (
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
                                </>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={4}>
                            <Controller
                              name={`adjustmentItems[${index}].itemDescription`}
                              control={control}
                              render={({ field: { value, onChange } }) => (
                                <CustomTextField
                                  fullWidth
                                  value={value}
                                  onChange={onChange}
                                  multiline
                                  label='Item Description'
                                />
                              )}
                            />{' '}
                          </TableCell>
                        </TableRow>
                      </>
                    )
                  })}
                </TableBody>
              </Table>{' '}
            </TableContainer>
          ) : null}
          <Button
            color='primary'
            variant='contained'
            startIcon={<AddOutlined />}
            disabled={filteredItems?.length <= 0}
            sx={{ mt: 3, mb: 4, ml: '6px' }}
            onClick={() => {
              append(fieldRows)
            }}
          >
            Add New
          </Button>
          <Divider variant='fullWidth' orientation='horizontal' sx={{ display: 'block', mb: 8 }} />
        </>

        <Grid item xs={12}>
          <Grid
            container
            direction={{ xs: 'column-reverse', md: 'row' }}
            sx={{ alignItems: { xs: 'flex-end', md: 'flex-start' } }}
            spacing={{ xs: 6, md: 8, xl: 8 }}
          >
            <Grid item xs={12} sm={12} md={8.5} lg={7.5} xl={8.5} sx={{ width: '100%' }}>
              <Box component='div' sx={{ width: '100%' }}>
                <Controller
                  name='notes'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <CustomTextField fullWidth label='Notes' multiline minRows={2} value={value} onChange={onChange} />
                  )}
                />
              </Box>
            </Grid>
            <Grid item xs={6} sm={6} md={3.5} lg={3.5} xl={3}>
              <Box sx={{ width: '100%', ml: 'auto' }}>
                <Controller
                  name='totalQty'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      value={parseFloat(field?.value).toFixed(2)}
                      InputProps={{
                        disabled: true
                      }}
                      label='Total Qty'
                      fullWidth
                      sx={{ mb: 3 }}
                    />
                  )}
                />

                <Controller
                  name='subTotal'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      value={parseFloat(field?.value).toFixed(2)}
                      InputProps={{
                        disabled: true
                      }}
                      label='Total Value'
                      fullWidth
                    />
                  )}
                />
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}
