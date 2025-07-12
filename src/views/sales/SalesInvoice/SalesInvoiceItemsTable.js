import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Divider,
  IconButton,
  Typography,
  TableContainer,
  Grid,
  Button
} from '@mui/material'
import CustomDatePicker from 'src/views/forms/form-elements/pickers/CustomDatePicker'
import CustomTextField from 'src/@core/components/mui/text-field'
import Icon from 'src/@core/components/icon'
import { useSelector } from 'react-redux'
import { Controller, useFieldArray, useWatch } from 'react-hook-form'
import {
  floatPattern,
  floatPatternMsg,
  calculateQuantity,
  handleDecimalPlaces,
  calculateSellingPrice,
  calculateTaxValue,
  convertCurrency,
  safeNumber,
  getAdornmentConfig,
  generateId,
  getOnFocusConfig
} from 'src/common-functions/utils/UtilityFunctions'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CommonItemPopup from 'src/common-components/CommonItemPopup'
import { AddOutlined } from '@mui/icons-material'
import {
  addDecimals,
  addDecimalsWithoutRounding,
  percentageOf,
  subtractDecimals
} from 'src/common-functions/utils/DecimalUtils'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import UpdateItemTaxPopUp from '../SalesOrder/UpdateItemTaxPopUp'

const LineItemFields = {
  lineItemId: generateId(),
  itemId: null,
  itemName: '',
  itemCodePrefix: '',
  itemCode: '',
  itemDescription: '',
  enableDimension: false,
  enablePackingUnit: false,
  dimensions: {},
  packingUnits: [],
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
  qty: 0,
  uom: '',
  sellingPrice: 0,
  subtotal: 0,
  discount: 0,
  serviceDate: new Date(),
  sellingPriceCurrency: '',
  sellingPriceTaxInclusive: false
}

export default function SalesInvoiceItemsTable({
  control,
  errors,
  items,
  setValue,
  getValues,
  trigger,
  watch,
  currency,
  typeOptions,
  itemList,
  separateOtherCharges,
  setSeparateOtherCharges,
  enabledTaxes,
  arrayName,
  invoiceObject
}) {
  const { currencies } = useCurrencies()
  const [totalQty, setTotalQty] = useState(0)
  const [subTotal, setSubTotal] = useState(0)

  const [separateTaxes, setSeparateTaxes] = useState(enabledTaxes)

  useEffect(() => {
    setSeparateTaxes(enabledTaxes)
  }, [enabledTaxes])

  const localCurrency = useSelector(state => state?.currencies?.selectedCurrency) || {}

  const localAdornmentConfig = getAdornmentConfig(localCurrency)

  const customerAdornmentConfig = getAdornmentConfig(currency)
  const { append, update, remove } = useFieldArray({
    control,
    name: arrayName,
    rules: {
      required: false
    }
  })
  const otherChargesValue = useWatch({
    control,
    name: 'otherCharges'
  })
  const [openItemTaxDialog, setOpenItemTaxDialog] = useState({
    open: false,
    index: null,
    selectedItem: null
  })
  const discountValue = watch('discountValue')
  const discountType = watch('discountType')
  let invoiceItems = getValues('invoiceItems')

  const calculateDiscountAndTaxValue = (invoiceItems, subTotal) => {
    let totalTax = 0
    let totalDiscount = 0
    let totalOtherChargesTax = 0
    // let otherChargesTax = 0
    let totalOtherCharges = 0

    // Collect all state updates to apply them in batch later
    const stateUpdates = {}
    // Calculate discounts and taxes for each order item
    let tempStoreTax = []
    invoiceItems?.forEach((item, index) => {
      const { sellingPrice } = item

      if (sellingPrice === 0) return

      const calcQty = calculateQuantity(item)
      const { discount, taxValue } = calculateTaxValue(
        sellingPrice * calcQty,
        discountValue,
        discountType,
        enabledTaxes,
        subTotal,
        setSeparateTaxes,
        tempStoreTax
      )

      stateUpdates[`${arrayName}[${index}].discount`] = discount
      totalDiscount = addDecimals(totalDiscount, discount)
      totalTax = addDecimals(totalTax, taxValue)
    })

    // Process other charges and their taxes
    const updatedOtherCharges = separateOtherCharges?.map((charges, index) => {
      const { taxes, includingTax } = charges
      let totalChargeValue = otherChargesValue?.[index]?.totalChargeValue || 0
      let totalTaxValue = 0
      const updatedTaxes = taxes?.map(tax => {
        const { taxRate } = tax
        const taxValue = safeNumber(percentageOf(totalChargeValue, taxRate))
        totalTaxValue = addDecimals(totalTaxValue, taxValue)

        totalOtherChargesTax = addDecimals(totalOtherChargesTax, taxValue)

        return { ...tax, taxValue }
      })
      let chargedAmount = 0
      if (includingTax) {
        chargedAmount = subtractDecimals(totalChargeValue, totalTaxValue)
      } else {
        chargedAmount = totalChargeValue
      }
      totalOtherCharges = addDecimals(totalOtherCharges, chargedAmount)

      return {
        ...charges,
        chargedAmount,
        totalChargeValue,
        taxes: updatedTaxes
      }
    })
    // Batch state updates for performance optimization
    setSeparateOtherCharges(updatedOtherCharges)

    stateUpdates['totalOtherChargesTax'] = totalOtherChargesTax
    stateUpdates['totalTax'] = totalTax
    stateUpdates['totalOtherCharges'] = totalOtherCharges
    stateUpdates['totalDiscount'] = totalDiscount

    // Calculate final total
    const finalTotal = addDecimals(
      subtractDecimals(subTotal, totalDiscount),
      addDecimals(totalOtherCharges, addDecimals(totalOtherChargesTax, totalTax))
    )

    stateUpdates['totalAmount'] = finalTotal

    // Apply all collected state updates in one go
    Object.entries(stateUpdates).forEach(([key, value]) => setValue(key, value))
  }
  useEffect(() => {
    setValue('taxes', separateTaxes)
  }, [separateTaxes])

  useMemo(
    () => calculateDiscountAndTaxValue(invoiceItems, subTotal),
    [discountType, invoiceObject, discountValue, otherChargesValue]
  )

  const recalculateTotals = invoiceItems => {
    let totalQty = 0
    let subTotal = 0

    invoiceItems?.forEach((item, index) => {
      const { taxFree, taxInclusive, originalPrice } = item
      const totalTaxRate = enabledTaxes?.reduce((acc, tax) => acc + tax.taxRate, 0) || 0

      const sellingPrice =
        taxInclusive && !taxFree
          ? calculateSellingPrice(originalPrice, totalTaxRate)
          : safeNumber(originalPrice).toFixed(2)
      item.sellingPrice = sellingPrice
      setValue(`${arrayName}[${index}].sellingPrice`, sellingPrice)

      const itemTaxes = !taxFree
        ? enabledTaxes?.map(tax => ({
            taxValuePerUnit: percentageOf(sellingPrice, tax.taxRate),
            taxValue: percentageOf(sellingPrice, tax.taxRate),
            ...tax
          }))
        : []
      item.taxes = itemTaxes
      setValue(`${arrayName}[${index}].taxes`, itemTaxes)

      const calcQty = calculateQuantity(item)

      setValue(`${arrayName}[${index}].qty`, parseFloat(calcQty))

      totalQty = addDecimalsWithoutRounding(totalQty, calcQty)

      const itemTotal = calcQty * safeNumber(sellingPrice)

      subTotal += itemTotal
      setValue(`${arrayName}[${index}].subtotal`, itemTotal)
    })
    setValue('totalQty', totalQty)
    setTotalQty(totalQty)
    setSubTotal(subTotal.toFixed(2))
    setValue(`subtotal`, safeNumber(subTotal))

    calculateDiscountAndTaxValue(invoiceItems, subTotal)
  }

  useEffect(() => {
    recalculateTotals(invoiceItems)
  }, [invoiceItems, currency, getValues('currency')])

  const [openDialog, setOpenDialog] = useState({})

  const handleClick = index => {
    setOpenDialog(prevOpen => ({
      ...prevOpen,
      [index]: !prevOpen[index]
    }))
  }

  return (
    <>
      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', mb: 3 }}>
        <Typography sx={{ fontSize: '15px', fontWeight: 500, mr: 4 }}>Items </Typography>
        {invoiceItems?.length < 1 ? (
          <IconButton
            variant='outlined'
            color='success'
            disabled={items?.length <= 0}
            onClick={() => {
              append({ ...LineItemFields, lineItemId: generateId() })
            }}
          >
            <Icon icon='material-symbols:add-box-outline' />
          </IconButton>
        ) : null}
      </Box>
      {invoiceItems?.length > 0 ? (
        <>
          {invoiceItems?.map((invoiceItem, index) => {
            return (
              <Box sx={{ py: 1, mb: 2 }} key={invoiceItem?.lineItemId}>
                <Grid container spacing={{ xs: 2 }}>
                  <Grid item xs={10} md={11}>
                    <Grid container spacing={{ xs: 2 }}>
                      <Grid item xs={12} md={4} order={{ xs: 1, md: 1 }}>
                        <Controller
                          name={`${arrayName}[${index}].itemName`}
                          control={control}
                          rules={{ required: 'Item Name is required' }}
                          render={({ field, fieldState: { error } }) => (
                            <CustomAutocomplete
                              {...field}
                              value={invoiceItem}
                              options={items}
                              getOptionLabel={option => option?.itemName || ''}
                              isOptionEqualToValue={(option, value) => option?.itemId === value?.itemId}
                              renderOption={(props, option) => {
                                return (
                                  <li {...props} key={option?.itemId}>
                                    {option?.itemCode}-{option?.itemName || ''}
                                  </li>
                                )
                              }}
                              onChange={(event, newValue) => {
                                if (newValue) {
                                  const filterItem = itemList?.find(item => item.itemId === newValue?.itemId)
                                  const priceSelling = filterItem?.sellingPrice || newValue?.sellingPrice
                                  const curretItemCurrency = currencies.find(
                                    cur => cur?.currencyId === newValue?.sellingPriceCurrency
                                  )

                                  const originalPrice =
                                    convertCurrency(
                                      curretItemCurrency?.exchangeRate,
                                      1,
                                      currency?.exchangeRate,
                                      priceSelling || 0
                                    ).toFixed(2) || 0
                                  const taxFree = false
                                  const taxInclusive = newValue?.sellingPriceTaxInclusive ?? true

                                  const packingUnits = newValue?.packingUnits || []
                                  const itemDimension = {
                                    length: newValue?.dimensions?.length?.defaultValue || 1,
                                    width: newValue?.dimensions?.width?.defaultValue || 1,
                                    height: newValue?.dimensions?.height?.defaultValue || 1,
                                    qty: 1
                                  }

                                  const updatedItem = {
                                    lineItemId: invoiceItem?.lineItemId,
                                    ...newValue,
                                    itemDimension,
                                    packingUnit: {
                                      unit: packingUnits[0]?.unit || '',
                                      qtyPerUnit: packingUnits[0]?.qtyPerUnit || 0,
                                      description: packingUnits[0]?.description || '',
                                      qty: newValue?.enablePackingUnit ? 1 : 0
                                    },
                                    itemDescription: newValue?.itemDescription,
                                    originalPrice: safeNumber(originalPrice),
                                    taxFree,
                                    taxInclusive,
                                    sellingPriceCurrency: newValue?.sellingPriceCurrency,
                                    serviceDate: new Date()
                                  }

                                  setValue(`${arrayName}[${index}]`, { ...updatedItem })
                                  update(`${arrayName}[${index}]`, { ...updatedItem })

                                  newValue?.enablePackingUnit &&
                                    setValue(`${arrayName}[${index}].packingUnit`, {
                                      ...packingUnits[0],
                                      qty: 1
                                    })

                                  trigger([
                                    `${arrayName}[${index}].itemName`,
                                    `${arrayName}[${index}].sellingPrice`,
                                    `${arrayName}[${index}].uom`
                                  ])
                                } else {
                                  setValue(`${arrayName}[${index}]`, LineItemFields)
                                  update(`${arrayName}[${index}]`, LineItemFields)
                                }
                              }}
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
                      </Grid>
                      <Grid item xs={12} md={6} order={{ xs: 2, md: 2 }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Box component='div' sx={{ width: '70%' }}>
                            {invoiceItem?.enablePackingUnit ? (
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <Controller
                                  name={`${arrayName}[${index}].packingUnit.unit`}
                                  control={control}
                                  render={({ field }) => (
                                    <CustomAutocomplete
                                      sx={{ width: '45%' }}
                                      value={
                                        invoiceItem?.packingUnits?.find(option => option.unit === field.value) ||
                                        invoiceItem?.packingUnits[0] || { unit: '' }
                                      }
                                      onChange={(e, newValue) => {
                                        const unit = newValue?.unit || ''
                                        field.onChange(unit)

                                        setValue(`${arrayName}[${index}].packingUnit.unit`, unit)
                                        setValue(
                                          `${arrayName}[${index}].packingUnit.qtyPerUnit`,
                                          newValue?.qtyPerUnit || ''
                                        )
                                        update(
                                          `${arrayName}[${index}].packingUnit.qtyPerUnit`,
                                          newValue?.qtyPerUnit || ''
                                        )
                                        setValue(
                                          `${arrayName}[${index}].packingUnit.description`,
                                          newValue?.description || ''
                                        )
                                      }}
                                      disableClearable
                                      options={invoiceItem?.packingUnits}
                                      getOptionLabel={option => option.unit || ''}
                                      isOptionEqualToValue={(option, value) => option.unit === value}
                                      renderInput={params => (
                                        <CustomTextField {...params} fullWidth label='Packing Unit' />
                                      )}
                                    />
                                  )}
                                />

                                <Controller
                                  name={`${arrayName}[${index}].packingUnit.qty`}
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
                                      value={invoiceItem?.packingUnit?.qty}
                                      onChange={e => {
                                        const value = e.target.value
                                        const formattedValue = handleDecimalPlaces(value)
                                        onChange(formattedValue)
                                        update(`${arrayName}[${index}].packingUnit.qty`, formattedValue)
                                      }}
                                      error={Boolean(error)}
                                      helperText={error?.message}
                                    />
                                  )}
                                />
                                <Controller
                                  name={`${arrayName}[${index}].packingUnit.qtyPerUnit`}
                                  control={control}
                                  render={() => (
                                    <CustomTextField
                                      value={invoiceItem?.packingUnit?.qtyPerUnit}
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
                            ) : invoiceItem?.enableDimension === true ? (
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                {invoiceItem?.dimensions?.length !== null && (
                                  <Controller
                                    name={`${arrayName}[${index}].itemDimension.length`}
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
                                        value={invoiceItem?.itemDimension?.length}
                                        onChange={e => {
                                          const value = e.target.value
                                          const formattedValue = handleDecimalPlaces(value)
                                          onChange(formattedValue)
                                          update(`${arrayName}[${index}].itemDimension.length`, formattedValue)
                                        }}
                                        error={Boolean(error)}
                                        helperText={error?.message}
                                      />
                                    )}
                                  />
                                )}
                                {invoiceItem?.dimensions?.width !== null && (
                                  <Controller
                                    name={`${arrayName}[${index}].itemDimension.width`}
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
                                        value={invoiceItem?.itemDimension?.width}
                                        onChange={e => {
                                          const value = e.target.value
                                          const formattedValue = handleDecimalPlaces(value)
                                          onChange(formattedValue)
                                          update(`${arrayName}[${index}].itemDimension.width`, formattedValue)
                                        }}
                                        error={Boolean(error)}
                                        helperText={error?.message}
                                      />
                                    )}
                                  />
                                )}
                                {invoiceItem?.dimensions?.height !== null && (
                                  <Controller
                                    name={`${arrayName}[${index}].itemDimension.height`}
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
                                        value={invoiceItem?.itemDimension?.height}
                                        onChange={e => {
                                          const value = e.target.value
                                          const formattedValue = handleDecimalPlaces(value)
                                          onChange(formattedValue)
                                          update(`${arrayName}[${index}].itemDimension.height`, formattedValue)
                                        }}
                                        error={Boolean(error)}
                                        helperText={error?.message}
                                      />
                                    )}
                                  />
                                )}
                                <Controller
                                  name={`${arrayName}[${index}].itemDimension.qty`}
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
                                        update(`${arrayName}[${index}].itemDimension.qty`, formattedValue)
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
                                  {(invoiceItem?.uom === 'm2' || invoiceItem?.uom === 'm3') && (
                                    <>
                                      <Controller
                                        name={`${arrayName}[${index}].itemDimension.length`}
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
                                              update(`${arrayName}[${index}].itemDimension.length`, formattedValue)
                                            }}
                                            error={Boolean(error)}
                                            helperText={error?.message}
                                          />
                                        )}
                                      />
                                      <Controller
                                        name={`${arrayName}[${index}].itemDimension.width`}
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
                                              update(`${arrayName}[${index}].itemDimension.width`, formattedValue)
                                            }}
                                            error={Boolean(error)}
                                            helperText={error?.message}
                                          />
                                        )}
                                      />
                                      {invoiceItem?.uom === 'm3' && (
                                        <Controller
                                          name={`${arrayName}[${index}].itemDimension.height`}
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
                                                setValue(`${arrayName}[${index}].itemDimension.height`, formattedValue)
                                                update(`${arrayName}[${index}].itemDimension.height`, formattedValue)
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
                                    name={`${arrayName}[${index}].itemDimension.qty`}
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
                                          update(`${arrayName}[${index}].itemDimension.qty`, formattedValue)
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
                              name={`${arrayName}[${index}].qty`}
                              control={control}
                              render={() => (
                                <CustomTextField
                                  value={`${parseFloat(invoiceItem?.qty)?.toFixed(2)} ${invoiceItem?.uom}`}
                                  label='Total Qty'
                                  fullWidth
                                  InputProps={{
                                    disabled: true
                                  }}
                                />
                              )}
                            />
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={2} order={{ xs: 3, md: 3 }}>
                        <Controller
                          name={`${arrayName}[${index}].originalPrice`}
                          control={control}
                          rules={{
                            required: 'Please enter Rate',
                            pattern: {
                              value: floatPattern,
                              message: floatPatternMsg
                            },
                            validate: value => (parseFloat(value) > 0 ? true : 'Value must be greater than 0')
                          }}
                          render={({ field, fieldState: { error } }) => (
                            <CustomTextField
                              value={field.value}
                              onChange={e => {
                                const value = e.target.value
                                const newValue = handleDecimalPlaces(value)
                                field.onChange(newValue)

                                const taxFree = invoiceItem?.taxFree ?? false
                                const taxInclusive = invoiceItem?.taxInclusive ?? true

                                const totalTax = enabledTaxes?.reduce((acc, tax) => acc + tax.taxRate, 0) || 0
                                const sellingPrice =
                                  taxInclusive && !taxFree
                                    ? calculateSellingPrice(newValue, totalTax)
                                    : safeNumber(newValue).toFixed(2)

                                update(`${arrayName}[${index}].originalPrice`, newValue)
                                update(`${arrayName}[${index}].sellingPrice`, sellingPrice)
                              }}
                              label={`Rate ${invoiceItem?.taxInclusive ? '(Tax Inclusive)' : '(Tax Exclusive)'}`}
                              fullWidth
                              InputProps={{
                                ...getOnFocusConfig(field, 0),
                                ...customerAdornmentConfig
                              }}
                              error={Boolean(error)}
                              helperText={error?.message}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={9} order={{ xs: 6, md: 4 }}>
                        <Controller
                          name={`${arrayName}[${index}].itemDescription`}
                          control={control}
                          render={({ field: { value, onChange } }) => (
                            <CustomTextField
                              fullWidth
                              value={value}
                              onChange={onChange}
                              multiline
                              label='Item Description'
                              sx={{ mb: '10px' }}
                            />
                          )}
                        />{' '}
                      </Grid>
                      <Grid item xs={6} md={3} order={{ xs: 4, md: 5 }}>
                        <Controller
                          name={`${arrayName}[${index}].serviceDate`}
                          control={control}
                          render={({ field }) => (
                            <CustomDatePicker
                              label={'Service Date'}
                              fullWidth={true}
                              date={field.value ? new Date(field.value) : new Date()}
                              onChange={field.onChange}
                              error={Boolean(errors?.serviceDate)}
                            />
                          )}
                        />{' '}
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={2} md={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                      {invoiceItem?.lineItemId !== '' && invoiceItem?.lineItemId !== null && (
                        <IconButton
                          variant='outlined'
                          onClick={() => setOpenItemTaxDialog({ open: true, index: index, selectedItem: invoiceItem })}
                        >
                          <Icon icon='mdi:information-outline' />
                        </IconButton>
                      )}
                      {/* {invoiceItem?.lineItemId !== '' && invoiceItem?.lineItemId !== null && (
                        <IconButton variant='outlined' onClick={() => handleClick(index)}>
                          <Icon icon='tabler:eye' />
                        </IconButton>
                      )} */}
                      {openDialog[index] ? (
                        <CommonItemPopup
                          openDialog={openDialog[index]}
                          setOpenDialog={setOpenDialog}
                          itemId={invoiceItem?.itemId}
                        />
                      ) : null}
                      {/* {invoiceItems?.length >= 1 && invoiceItems?.length - 1 == index && ( */}
                      <IconButton
                        variant='outlined'
                        color='error'
                        onClick={() => {
                          remove(index)
                        }}
                      >
                        <Icon icon='mingcute:delete-2-line' />
                      </IconButton>
                      {/* )} */}
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )
          })}
        </>
      ) : null}
      <Button
        color='primary'
        variant='contained'
        startIcon={<AddOutlined />}
        sx={{ mt: 3, mb: 4, ml: '6px' }}
        onClick={() => {
          append({ ...LineItemFields, lineItemId: generateId() })
        }}
      >
        Add New
      </Button>
      <Divider variant='fullWidth' orientation='horizontal' sx={{ display: 'block', mb: 8 }} />
      <Grid item xs={12}>
        <Grid
          container
          direction={{ xs: 'column-reverse', md: 'row' }}
          sx={{ alignItems: { xs: 'flex-end', md: 'flex-start' } }}
          spacing={{ xs: 6, md: 8, xl: 8 }}
        >
          <Grid item xs={12} sm={12} md={8.5} lg={7.5} xl={8} sx={{ width: '100%' }}>
            <Box component='div' sx={{ width: '100%' }}>
              <Controller
                name='customerNotes'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    label='Customer Notes'
                    multiline
                    minRows={2}
                    value={value}
                    onChange={onChange}
                  />
                )}
              />{' '}
              <Typography sx={{ fontSize: '13px', fontWeight: 500, lineHeight: '40px', mb: 3 }}>
                Will be displayed on the invoice
              </Typography>
              <Controller
                name='notes'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField fullWidth label='Notes' multiline minRows={2} value={value} onChange={onChange} />
                )}
              />
              <Typography sx={{ fontSize: '13px', fontWeight: 500, lineHeight: '40px', mb: 3 }}>
                Will not be displayed on the invoice
              </Typography>
              <Controller
                name='termsAndConditions'
                control={control}
                render={({ field }) => (
                  <CustomTextField {...field} multiline fullWidth minRows={4} label='Terms & Conditions' />
                )}
              />{' '}
            </Box>
          </Grid>
          <Grid item xs={6} sm={6} md={3.5} lg={3.5} xl={4}>
            <Box sx={{ width: { xs: '70%', md: '100%' }, ml: 'auto' }}>
              <Grid container spacing={{ xs: 2 }} sx={{ mb: 3 }}>
                <Grid item xs={4.5}>
                  <CustomTextField
                    InputProps={{
                      disabled: true
                    }}
                    label='Total Qty'
                    value={totalQty}
                  />{' '}
                </Grid>
                <Grid item xs={7.5}>
                  <CustomTextField
                    InputProps={{
                      disabled: true,
                      ...customerAdornmentConfig
                    }}
                    label='Sub Total'
                    fullWidth
                    value={subTotal}
                  />
                </Grid>
              </Grid>
              <Box
                sx={{
                  display: 'flex',
                  width: '100%',
                  mb: 3
                }}
              >
                <Controller
                  name='discountValue'
                  control={control}
                  rules={{
                    required: false,
                    pattern: {
                      value: floatPattern,
                      message: floatPatternMsg
                    }
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      // required
                      label='Discount'
                      variant='outlined'
                      sx={{
                        width: '100%',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderRight: '0px',
                          borderRadius: '4px 0px 0px 4px !important'
                        }
                      }}
                      InputProps={{
                        inputProps: {
                          step: 'any',
                          inputMode: 'numeric',
                          pattern: '^[0-9]+(\\.[0-9]{1,2})?$'
                        },
                        onInput: e => {
                          e.target.value = e.target.value.replace(/[^0-9.]/g, '')
                          const decimalIndex = e.target.value.indexOf('.')
                          if (decimalIndex !== -1 && e.target.value.substring(decimalIndex + 1).length > 2) {
                            e.target.value = e.target.value.substring(0, decimalIndex + 3)
                          }
                        }
                      }}
                      error={Boolean(error)}
                      helperText={error?.message}
                    />
                  )}
                />{' '}
                <Controller
                  name='discountType'
                  control={control}
                  render={({ field }) => (
                    <CustomAutocomplete
                      {...field}
                      value={typeOptions?.find(option => option.value === field.value) || null}
                      onChange={(e, newValue) => {
                        field.onChange(newValue?.value)
                      }}
                      options={typeOptions || []}
                      disableClearable
                      sx={{
                        width: 70,
                        '& .MuiOutlinedInput-root': {
                          borderLeft: '0px',
                          borderRadius: '0px 4px 4px 0px !important'
                        },
                        '& .MuiAutocomplete-inputRoot.MuiInputBase-sizeSmall': {
                          paddingTop: '5.5px !important',
                          paddingBottom: '5.5px !important'
                        }
                      }}
                      getOptionLabel={option => option?.key}
                      getOptionSelected={(option, value) => {
                        return option.value === value
                      }}
                      renderInput={params => <CustomTextField {...params} fullWidth />}
                    />
                  )}
                />
              </Box>
              {enabledTaxes?.map(tax => {
                return (
                  <CustomTextField
                    InputProps={{
                      disabled: true,
                      ...customerAdornmentConfig
                    }}
                    label={`${tax.taxName}(${tax.taxRate}%)`}
                    fullWidth
                    key={tax.taxId}
                    value={separateTaxes?.find(value => value.taxName === tax.taxName)?.taxValue || 0}
                    sx={{ mb: 3 }}
                  />
                )
              })}

              <Grid container spacing={{ xs: 2 }} sx={{ mb: 3 }}>
                {separateOtherCharges?.map((charges, i) => {
                  const { taxes, chargeName, includingTax } = charges || {}
                  const totalTaxValue = taxes?.reduce((total, tax) => total + (tax.taxValue || 0), 0)
                  const taxLabel = taxes?.map(tax => tax.taxName).join(', ') || 'Tax'

                  const label = `${chargeName} (${includingTax ? `Including ${taxLabel}` : 'Exclusive Tax'})`

                  return (
                    <Grid item xs={12} key={charges?.chargeId}>
                      <Controller
                        name={`otherCharges[${i}]`}
                        control={control}
                        render={({ field }) => (
                          <CustomTextField
                            {...field}
                            value={field?.value?.totalChargeValue ?? 0}
                            onChange={e => {
                              field.onChange({ ...field.value, totalChargeValue: e.target.value })
                            }}
                            InputProps={{
                              ...localAdornmentConfig
                            }}
                            fullWidth
                            label={label}
                            type='number'
                          />
                        )}
                      />

                      {!includingTax && taxes.length > 0 && (
                        <CustomTextField
                          value={totalTaxValue}
                          fullWidth
                          disabled
                          label={`${chargeName} (${taxLabel})`}
                          type='number'
                        />
                      )}
                    </Grid>
                  )
                })}
              </Grid>

              <Controller
                name='totalAmount'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    value={field?.value}
                    InputProps={{
                      disabled: true,
                      ...customerAdornmentConfig
                    }}
                    label='Total Inclusive of Tax:'
                    fullWidth
                    sx={{ mb: 3 }}
                  />
                )}
              />
            </Box>
          </Grid>
        </Grid>
      </Grid>
      {openItemTaxDialog?.open && (
        <UpdateItemTaxPopUp
          open={openItemTaxDialog?.open}
          setOpen={setOpenItemTaxDialog}
          setValue={setValue}
          update={update}
          arrayName={arrayName}
          index={openItemTaxDialog?.index}
          selectedItem={openItemTaxDialog?.selectedItem}
        />
      )}
    </>
  )
}
