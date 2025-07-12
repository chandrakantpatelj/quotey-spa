import { AddOutlined } from '@mui/icons-material'
import {
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useFieldArray } from 'react-hook-form'
import { useSelector } from 'react-redux'
import Icon from 'src/@core/components/icon'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'
import CommonItemPopup from 'src/common-components/CommonItemPopup'
import { RendorDimensions, RendorItemData, ViewItemsTableWrapper } from 'src/common-components/CommonPdfDesign'
import {
  addDecimals,
  divideDecimals,
  multiplyDecimals,
  percentageOfWithoutRounding
} from 'src/common-functions/utils/DecimalUtils'
import {
  calculateQuantity,
  floatPattern,
  floatPatternMsg,
  getAdornmentConfig,
  getExchangeRate,
  getOnFocusConfig,
  handleDecimalPlaces,
  NumberFormat
} from 'src/common-functions/utils/UtilityFunctions'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import useTaxAuthorities from 'src/hooks/getData/useTaxAuthorities'
import UpdateExpenseVendor from './UpdateExpenseVendor'
import UpdatePOTaxData from './UpdatePOTaxData'

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
  purchasePrice: 0,
  localPurchasePrice: 0,
  subtotal: 0.0,
  subTotalInLocal: 0.0
}

export default function ItemsTable({
  control,
  trigger,
  order,
  watch,
  products,
  vendors,
  setValue,
  getValues,
  localCurrency,
  vendorCurrency,
  currencyExchangeRate,
  settingPurchaseData,
  isOrderDetailLocked,
  mainVendor
}) {
  const theme = useTheme()
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId) || null

  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  const localAdornmentConfig = getAdornmentConfig(localCurrency)
  const vendorAdornmentConfig = getAdornmentConfig(vendorCurrency)
  const { taxAuthorities } = useTaxAuthorities(tenantId)

  const { currencies } = useCurrencies()

  const { subtotalInLocalCurrency = true, totalAmountInLocalCurrency = true } = settingPurchaseData || {}

  const { append, update, remove } = useFieldArray({
    control,
    name: 'orderItems',
    rules: {
      required: false
    }
  })
  const { update: updateTax } = useFieldArray({
    control,
    name: 'taxes',
    rules: {
      required: false
    }
  })
  const { update: updateExpense } = useFieldArray({
    control,
    name: 'expenses',
    rules: {
      required: false
    }
  })

  const updateFieldByKey = (update, section, key, updatedField, value) => {
    const currentValues = getValues(section)

    let index = -1

    if (section === 'expenses') {
      index = currentValues.findIndex(item => item.expenseId === key)
    } else if (section === 'taxes') {
      index = currentValues.findIndex(item => item.taxId === key)
    }

    if (index !== -1) {
      update(index, {
        ...currentValues[index],
        [updatedField]: value
      })
    }
  }
  const setValueFieldByKey = (section, key, updatedField, value) => {
    const currentValues = getValues(section)
    // const index = currentValues.findIndex(item => item.key === key)
    let index = -1

    if (section === 'expenses') {
      index = currentValues.findIndex(item => item.expenseId === key)
    } else if (section === 'taxes') {
      index = currentValues.findIndex(item => item.taxId === key)
    }
    if (index !== -1) {
      setValue(`${section}[${index}].${updatedField}`, value)
    }
  }

  let orderItems = watch('orderItems')
  let allExpenses = watch('expenses')
  let allTaxes = watch('taxes')

  let filteredItems = products?.filter(item => !orderItems.some(selected => selected?.itemId === item?.itemId)) || []

  const recalculateTotals = () => {
    let totalQty = 0
    let subTotal = 0
    orderItems?.map((item, index) => {
      const calcQty = calculateQuantity(item)
      setValue(`orderItems[${index}].qty`, calcQty)
      totalQty = addDecimals(totalQty, calcQty)
      const itemTotal = multiplyDecimals(calcQty, item?.purchasePrice || 0)
      setValue(`orderItems[${index}].subtotal`, itemTotal)
      subTotal = addDecimals(subTotal, itemTotal)
    })

    setValue('totalQty', totalQty)
    setValue(`subtotalCurrency`, subtotalInLocalCurrency ? localCurrency?.currencyId : vendorCurrency?.currencyId)

    const paidtovendorexpenseValues = allExpenses
      ?.filter(a => a.paidToMainVendor)
      .reduce((sum, item) => {
        const value = parseFloat(item?.expenseValue) || 0
        return sum + value
      }, 0)
    const finalsubtotal = addDecimals(subTotal, paidtovendorexpenseValues)

    setValue('subtotal', finalsubtotal)
    const convSubTotalToLocalPrice = multiplyDecimals(finalsubtotal, currencyExchangeRate)

    setValue('subTotalInLocal', convSubTotalToLocalPrice)
  }
  useMemo(() => {
    recalculateTotals()
  }, [orderItems, localCurrency, getValues('currency'), getValues('currencyExchangeRate'), allExpenses])

  const subTotal = getValues('subtotal')

  const subTotalinLocal = getValues('subTotalInLocal')

  const calculateTotalExpenseValue = targetCurrency => {
    return allExpenses
      ?.filter(val => val.paidToMainVendor === false && val?.accountableForOrderTaxes)
      .reduce((sum, item) => {
        const value = parseFloat(item?.expenseValue) || 0
        const expenseCurrency = currencies?.find(val => val?.currencyId === item?.expenseValueCurrency)
        const exchangeRate = getExchangeRate(targetCurrency?.exchangeRate, expenseCurrency?.exchangeRate || 1) || 1

        const convertedValue =
          targetCurrency?.currencyId !== item?.expenseValueCurrency ? divideDecimals(value, exchangeRate) : value

        return addDecimals(sum, convertedValue)
      }, 0)
  }

  const totalExpenseValueforTaxInLocal = calculateTotalExpenseValue(localCurrency)

  const totalExpenseValueforTaxInVendor = calculateTotalExpenseValue(vendorCurrency)

  const totalRemainingExpenseValueinLocal = allExpenses
    ?.filter(a => a.paidToMainVendor === false)
    .reduce((sum, item) => {
      const expenseCurrency = currencies?.find(val => val?.currencyId === item?.expenseValueCurrency)

      const expenseExchhangeRate = getExchangeRate(localCurrency?.exchangeRate, expenseCurrency?.exchangeRate) || 1

      const value = item?.expenseValue || 0

      const expenseVal =
        localCurrency?.currencyId !== item?.expenseValueCurrency ? divideDecimals(value, expenseExchhangeRate) : value

      const taxVal = item?.taxValue || 0

      const taxValue =
        localCurrency?.currencyId !== item?.expenseValueCurrency ? divideDecimals(taxVal, expenseExchhangeRate) : taxVal

      const addBothValues = addDecimals(expenseVal, taxValue)
      const addtoSum = addDecimals(sum, addBothValues)

      return addtoSum
    }, 0)

  const totalTaxValue = allTaxes?.reduce((sum, item) => {
    const subtotal = item?.inLocalCurrency ? subTotalinLocal : subTotal
    const taxationExpanses = item?.inLocalCurrency ? totalExpenseValueforTaxInLocal : totalExpenseValueforTaxInVendor

    const addExpenseToSubTotal = addDecimals(subtotal, taxationExpanses) || 0

    const taxValue = item?.isManuallyEntered
      ? item?.taxValue
      : percentageOfWithoutRounding(item?.taxRate || 0, addExpenseToSubTotal)

    if (!item?.isManuallyEntered) {
      setValueFieldByKey('taxes', item?.taxId, 'taxValue', parseFloat(taxValue || 0).toFixed(2))
    }

    let convCp = totalAmountInLocalCurrency
      ? item?.inLocalCurrency
        ? taxValue
        : multiplyDecimals(taxValue, currencyExchangeRate)
      : item?.inLocalCurrency
      ? divideDecimals(taxValue, currencyExchangeRate)
      : taxValue
    return sum + parseFloat(convCp)
  }, 0)

  const calculateTotal = () => {
    let total = 0
    const getSubTotalforTotalAmount = totalAmountInLocalCurrency ? subTotalinLocal : subTotal

    const totalRemainingExpenseValue = divideDecimals(totalRemainingExpenseValueinLocal, currencyExchangeRate)

    const getSubTotalwithExpensesforTotalAmount = totalAmountInLocalCurrency
      ? totalRemainingExpenseValueinLocal
      : totalRemainingExpenseValue

    const parsedTotalTaxValue = addDecimals(totalTaxValue, getSubTotalwithExpensesforTotalAmount)

    total = addDecimals(getSubTotalforTotalAmount, parsedTotalTaxValue) || 0
    setValue('totalAmount', total)
    setValue('totalAmountCurrency', totalAmountInLocalCurrency ? localCurrency?.currencyId : vendorCurrency?.currencyId)
  }

  useEffect(() => {
    calculateTotal()
  }, [
    localCurrency,
    vendorCurrency,
    currencyExchangeRate,
    subTotal,
    allTaxes,
    allExpenses,
    totalExpenseValueforTaxInLocal,
    totalTaxValue
  ])

  const [openDialog, setOpenDialog] = useState({})

  const handleClick = index => {
    setOpenDialog(prevOpen => ({
      ...prevOpen,
      [index]: !prevOpen[index]
    }))
  }

  const [openTaxDialog, setOpenTaxDialog] = useState({
    open: false,
    selectedTax: null
  })

  const [openExpenseDialog, setOpenExpenseDialog] = useState({
    open: false,
    selectedExpense: null
  })

  let filterExpenseVendors =
    vendors?.filter(item =>
      settingPurchaseData?.expenses
        ?.find(val => val?.expenseId === openExpenseDialog?.selectedExpense?.expenseId)
        ?.currencies?.includes(item?.currencyId)
    ) || vendors

  return (
    <>
      {isOrderDetailLocked ? (
        <Grid item xs={12} xl={10}>
          <ViewItemsTableWrapper>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '3%' }}>#</TableCell>
                <TableCell sx={{ width: '47%' }}>Item</TableCell>
                {isDesktop && <TableCell sx={{ width: '6%' }}>Dimensions</TableCell>}
                <TableCell sx={{ width: '10%' }}>Total Qty</TableCell>
                {isDesktop ? <TableCell sx={{ width: '18%' }}>Rate</TableCell> : null}
                <TableCell sx={{ width: '18%' }}>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {order?.orderItems?.length > 0 ? (
                order?.orderItems?.map((orderItem, index) => {
                  return (
                    <TableRow key={orderItem?.itemId}>
                      <TableCell>{index + 1}</TableCell>
                      <RendorItemData index={index} orderItem={orderItem} currency={vendorCurrency} showData={true} />
                      {isDesktop ? (
                        <TableCell>
                          <RendorDimensions orderItem={orderItem} />{' '}
                        </TableCell>
                      ) : null}

                      <TableCell>
                        {orderItem?.qty} {orderItem?.uom}
                      </TableCell>
                      {isDesktop ? (
                        <TableCell>
                          <NumberFormat value={orderItem?.purchasePrice} currency={vendorCurrency} />
                        </TableCell>
                      ) : null}
                      <TableCell>
                        <NumberFormat value={orderItem?.subtotal} currency={vendorCurrency} />
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: '30px 10px'
                      }}
                    >
                      <Typography variant='h5' align='center' display='block'>
                        No Items
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </ViewItemsTableWrapper>
        </Grid>
      ) : (
        <Grid item xs={12} xl={11} id='orderItems'>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
            <Typography sx={{ fontSize: '15px', fontWeight: 500, lineHeight: '40px' }}>Items </Typography>
          </Box>
          {orderItems?.length > 0
            ? orderItems?.map((orderItem, index) => {
                return (
                  <Box sx={{ py: 1, mb: 2 }} key={orderItem?.itemId}>
                    <Grid container spacing={{ xs: 2 }}>
                      <Grid item xs={10} sm={11}>
                        <Grid container spacing={{ xs: 2 }}>
                          <Grid item xs={12} md={4} order={{ xs: 1, md: 1 }}>
                            <Controller
                              name={`orderItems[${index}].itemName`}
                              control={control}
                              rules={{ required: 'Item Name is required' }}
                              render={({ field, fieldState: { error } }) => (
                                <CustomAutocomplete
                                  {...field}
                                  options={filteredItems}
                                  value={orderItem}
                                  getOptionLabel={option => option?.itemName}
                                  isOptionEqualToValue={(option, value) => option?.itemId === value?.itemId}
                                  renderOption={(props, option) => {
                                    return (
                                      <li {...props} key={option?.itemId}>
                                        {option?.itemCode}-{option?.itemName || ''}
                                      </li>
                                    )
                                  }}
                                  onChange={(event, newValue) => {
                                    let curretItemCurrency = currencies.find(
                                      cur => cur?.currencyId === newValue?.purchasePriceCurrency
                                    )

                                    const getRate = getExchangeRate(
                                      curretItemCurrency?.exchangeRate,
                                      vendorCurrency?.exchangeRate
                                    )
                                    const convCp = multiplyDecimals(newValue?.purchasePrice || 0, getRate)

                                    const convLocalCp = multiplyDecimals(convCp, currencyExchangeRate)

                                    setValue(`orderItems[${index}].purchasePrice`, convCp)
                                    setValue(`orderItems[${index}].localPurchasePrice`, convLocalCp)

                                    let packingUnits = newValue?.packingUnits || []

                                    setValue(`orderItems[${index}].packingUnit`, {
                                      ...packingUnits[0],
                                      qty: newValue?.enablePackingUnit ? 1 : 0
                                    })

                                    setValue(`orderItems[${index}].itemDimension.qty`, 1)
                                    setValue(`orderItems[${index}].qty`, 1)

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
                                      purchasePrice: convCp,
                                      localPurchasePrice: convLocalCp,
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
                                      subtotal: 0.0,
                                      subTotalInLocal: 0.0
                                    })

                                    recalculateTotals()
                                    if (newValue === null) {
                                      setValue(`orderItems[${index}]`, fieldRows)
                                    }

                                    trigger([`orderItems[${index}].itemName`, `orderItems[${index}].purchasePrice`])
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
                          <Grid item xs={12} md={5} order={{ xs: 2, md: 3 }}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                              <Box component='div' sx={{ width: '70%' }}>
                                {orderItem?.enablePackingUnit ? (
                                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    <Controller
                                      name={`orderItems[${index}].packingUnit.unit`}
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

                                            setValue(`orderItems[${index}].packingUnit.unit`, unit)
                                            setValue(
                                              `orderItems[${index}].packingUnit.qtyPerUnit`,
                                              newValue?.qtyPerUnit || ''
                                            )
                                            update(
                                              `orderItems[${index}].packingUnit.qtyPerUnit`,
                                              newValue?.qtyPerUnit || ''
                                            )
                                            setValue(
                                              `orderItems[${index}].packingUnit.description`,
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
                                      name={`orderItems[${index}].packingUnit.qty`}
                                      control={control}
                                      rules={{
                                        required: 'Qty is required',
                                        pattern: {
                                          value: floatPattern,
                                          message: floatPatternMsg
                                        }
                                      }}
                                      //
                                      render={({ field, fieldState: { error } }) => (
                                        <CustomTextField
                                          sx={{ width: '35%' }}
                                          label='Qty'
                                          inputProps={{ min: 0 }}
                                          value={orderItem?.packingUnit?.qty}
                                          onChange={e => {
                                            const value = e.target.value
                                            const formattedValue = handleDecimalPlaces(value)
                                            field.onChange(formattedValue)
                                            update(`orderItems[${index}].packingUnit.qty`, formattedValue)
                                          }}
                                          InputProps={{
                                            ...getOnFocusConfig(field, 1)
                                          }}
                                          error={Boolean(error)}
                                          helperText={error?.message}
                                        />
                                      )}
                                    />
                                    <Controller
                                      name={`orderItems[${index}].packingUnit.qtyPerUnit`}
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
                                        name={`orderItems[${index}].itemDimension.length`}
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
                                              update(`orderItems[${index}].itemDimension.length`, formattedValue)
                                            }}
                                            error={Boolean(error)}
                                            helperText={error?.message}
                                          />
                                        )}
                                      />
                                    )}
                                    {orderItem?.dimensions?.width !== null && (
                                      <Controller
                                        name={`orderItems[${index}].itemDimension.width`}
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
                                              update(`orderItems[${index}].itemDimension.width`, formattedValue)
                                            }}
                                            error={Boolean(error)}
                                            helperText={error?.message}
                                          />
                                        )}
                                      />
                                    )}
                                    {orderItem?.dimensions?.height !== null && (
                                      <Controller
                                        name={`orderItems[${index}].itemDimension.height`}
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
                                              update(`orderItems[${index}].itemDimension.height`, formattedValue)
                                            }}
                                            error={Boolean(error)}
                                            helperText={error?.message}
                                          />
                                        )}
                                      />
                                    )}
                                    <Controller
                                      name={`orderItems[${index}].itemDimension.qty`}
                                      control={control}
                                      rules={{
                                        required: 'Qty is required',
                                        pattern: {
                                          value: floatPattern,
                                          message: floatPatternMsg
                                        }
                                      }}
                                      render={({ field, fieldState: { error } }) => (
                                        <CustomTextField
                                          fullWidth
                                          label='Qty'
                                          inputProps={{ min: 0 }}
                                          value={field.value}
                                          onChange={e => {
                                            const value = e.target.value
                                            const formattedValue = handleDecimalPlaces(value)
                                            field.onChange(formattedValue)
                                            update(`orderItems[${index}].itemDimension.qty`, formattedValue)
                                          }}
                                          InputProps={{
                                            ...getOnFocusConfig(field, 1)
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
                                            name={`orderItems[${index}].itemDimension.length`}
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
                                                  update(`orderItems[${index}].itemDimension.length`, formattedValue)
                                                }}
                                                error={Boolean(error)}
                                                helperText={error?.message}
                                              />
                                            )}
                                          />
                                          <Controller
                                            name={`orderItems[${index}].itemDimension.width`}
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
                                                  update(`orderItems[${index}].itemDimension.width`, formattedValue)
                                                }}
                                                error={Boolean(error)}
                                                helperText={error?.message}
                                              />
                                            )}
                                          />
                                          {orderItem?.uom === 'm3' && (
                                            <Controller
                                              name={`orderItems[${index}].itemDimension.height`}
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
                                                      `orderItems[${index}].itemDimension.height`,
                                                      formattedValue
                                                    )
                                                    update(`orderItems[${index}].itemDimension.height`, formattedValue)
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
                                        name={`orderItems[${index}].itemDimension.qty`}
                                        control={control}
                                        rules={{
                                          required: 'Qty is required',
                                          pattern: {
                                            value: floatPattern,
                                            message: floatPatternMsg
                                          }
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                          <CustomTextField
                                            fullWidth
                                            label='Qty'
                                            inputProps={{ min: 0 }}
                                            value={field.value}
                                            onChange={e => {
                                              const value = e.target.value
                                              const formattedValue = handleDecimalPlaces(value)
                                              field.onChange(formattedValue)
                                              update(`orderItems[${index}].itemDimension.qty`, formattedValue)
                                            }}
                                            InputProps={{
                                              ...getOnFocusConfig(field, 1)
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
                                  name={`orderItems[${index}].qty`}
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
                          </Grid>
                          <Grid item xs={6} md={1} order={{ xs: 3, md: 4 }}>
                            <Controller
                              name={`orderItems[${index}].uom`}
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
                          </Grid>
                          <Grid item xs={6} md={2} order={{ xs: 4, md: 5 }}>
                            <Controller
                              name={`orderItems[${index}].purchasePrice`}
                              control={control}
                              rules={{
                                required: 'Please enter Rate',
                                pattern: {
                                  value: floatPattern,
                                  message: floatPatternMsg
                                },
                                validate: value => (parseFloat(value) > 0 ? true : 'Rate must be greater than 0')
                              }}
                              render={({ field, fieldState: { error } }) => (
                                <CustomTextField
                                  value={orderItem?.purchasePrice}
                                  onChange={e => {
                                    const value = e.target.value
                                    const formattedValue = handleDecimalPlaces(value)
                                    field.onChange(formattedValue)
                                    setValue(`orderItems[${index}].purchasePrice`, formattedValue)
                                    update(`orderItems[${index}].purchasePrice`, formattedValue)

                                    const convLocalCp = multiplyDecimals(formattedValue, currencyExchangeRate)
                                    setValue(`orderItems[${index}].localPurchasePrice`, convLocalCp)
                                    update(`orderItems[${index}].localPurchasePrice`, convLocalCp)
                                  }}
                                  label='Rate'
                                  fullWidth
                                  InputProps={{
                                    ...vendorAdornmentConfig,
                                    ...getOnFocusConfig(field, 0)
                                  }}
                                  error={Boolean(error)}
                                  helperText={error?.message}
                                />
                              )}
                            />
                          </Grid>
                          <Grid item xs={6} md={2} order={{ xs: 5, md: 6 }}>
                            <Controller
                              name={`orderItems[${index}].localPurchasePrice`}
                              control={control}
                              render={() => (
                                <CustomTextField
                                  value={parseFloat(orderItem?.localPurchasePrice)?.toFixed(2)}
                                  // value={field?.value}
                                  label='Local Rate'
                                  fullWidth
                                  InputProps={{
                                    disabled: true,
                                    ...localAdornmentConfig
                                  }}
                                />
                              )}
                            />
                          </Grid>
                          <Grid item xs={6} md={2} order={{ xs: 6, md: 7 }}>
                            <Controller
                              name={`orderItems[${index}].subtotal`}
                              control={control}
                              render={() => (
                                <CustomTextField
                                  value={parseFloat(orderItem?.subtotal)?.toFixed(2)}
                                  label='Sub Total'
                                  fullWidth
                                  InputProps={{
                                    disabled: true,
                                    ...vendorAdornmentConfig
                                  }}
                                />
                              )}
                            />
                          </Grid>
                          <Grid item xs={12} md={8} order={{ xs: 7, md: 2 }}>
                            <Controller
                              name={`orderItems[${index}].itemDescription`}
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
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={2} sm={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          {orderItem?.itemId !== '' && orderItem?.itemId !== null ? (
                            <IconButton variant='outlined' sx={{ fontSize: '21px' }} onClick={() => handleClick(index)}>
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

                          {orderItems?.length >= 1 && orderItems?.length - 1 == index ? (
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
                      </Grid>
                    </Grid>
                  </Box>
                )
              })
            : null}
          <Button
            color='primary'
            variant='contained'
            startIcon={<AddOutlined />}
            sx={{ mt: 3, mb: 4, ml: '6px' }}
            onClick={() => {
              append(fieldRows)
            }}
          >
            Add New
          </Button>

          <Divider variant='fullWidth' orientation='horizontal' sx={{ display: 'block', mb: 8 }} />
        </Grid>
      )}
      <Grid item xs={12} xl={10}>
        <Grid
          container
          direction={{ xs: 'column-reverse', md: 'row' }}
          sx={{ alignItems: { xs: 'flex-end', md: 'flex-start' } }}
          spacing={{ xs: 6, md: 8, xl: 8 }}
        >
          <Grid item xs={12} sm={12} md={8} lg={7} xl={7.5} sx={{ width: '100%' }}>
            {isOrderDetailLocked ? (
              <Box sx={{ p: 4 }}>
                {order?.vendorNotes ? (
                  <Box sx={{ mb: 4 }}>
                    <Typography
                      sx={{
                        fontSize: '14px',
                        fontWeight: 500,
                        lineHeight: '22px'
                      }}
                    >
                      Vendor Notes
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: '#818181', lineHeight: '22px' }}>
                      <div>
                        <pre
                          style={{
                            fontFamily: 'inherit',
                            whiteSpace: 'pre-wrap'
                          }}
                        >
                          {order?.vendorNotes}
                        </pre>
                      </div>
                    </Typography>
                  </Box>
                ) : null}

                {order?.notes ? (
                  <Box sx={{ mb: 4 }}>
                    <Typography
                      sx={{
                        fontSize: '14px',
                        fontWeight: 500,
                        lineHeight: '22px'
                      }}
                    >
                      Notes
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: '#818181', lineHeight: '22px' }}>
                      <div>
                        <pre
                          style={{
                            fontFamily: 'inherit',
                            whiteSpace: 'pre-wrap'
                          }}
                        >
                          {order?.notes}
                        </pre>
                      </div>
                    </Typography>
                  </Box>
                ) : null}

                {order?.termsAndConditions ? (
                  <>
                    <Typography
                      sx={{
                        fontSize: '14px',
                        fontWeight: 500
                      }}
                    >
                      Terms and Conditions
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: '#818181', lineHeight: '22px' }}>
                      <div>
                        <pre
                          style={{
                            fontFamily: 'inherit',
                            whiteSpace: 'pre-wrap'
                          }}
                        >
                          {order?.termsAndConditions}
                        </pre>
                      </div>
                    </Typography>
                  </>
                ) : null}
              </Box>
            ) : (
              <Box component='div' sx={{ width: '100%' }}>
                <Controller
                  name='vendorNotes'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <CustomTextField
                      fullWidth
                      label='Vendor Notes'
                      multiline
                      minRows={2}
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />{' '}
                <Typography sx={{ fontSize: '13px', fontwidth: 500, lineHeight: '40px', mb: 5 }}>
                  Will be displayed on the Order
                </Typography>
                <Controller
                  name='notes'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <CustomTextField fullWidth label='Notes' multiline minRows={2} value={value} onChange={onChange} />
                  )}
                />
                <Typography sx={{ fontSize: '13px', fontwidth: 500, lineHeight: '40px', mb: 5 }}>
                  Will not be displayed on the Order
                </Typography>
                <Controller
                  name='termsAndConditions'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} multiline fullWidth minRows={4} label='Terms & Conditions' />
                  )}
                />{' '}
              </Box>
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={5} xl={4.5}>
            <Box sx={{ width: '100%', ml: 'auto' }}>
              <Box sx={{ width: '90%' }}>
                <Grid container spacing={{ xs: 2 }} sx={{ mb: 2 }}>
                  <Grid item xs={6}></Grid>
                  <Grid item xs={6}>
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
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Box>
              <Box sx={{ width: '90%' }}>
                {allExpenses
                  ?.filter(a => a.paidToMainVendor)
                  .map(item => {
                    const expenseCurrency = currencies?.find(val => val?.currencyId === item?.expenseValueCurrency)
                    return order?.lockedComponents?.includes(item?.expenseId) ? (
                      <Box sx={{ mb: 2 }} key={`expense-${item.expenseId}`}>
                        <Typography
                          sx={{
                            display: 'flex',
                            gap: '5px',
                            justifyContent: 'space-between',
                            fontSize: '12px',
                            fontWeight: 500,
                            lineHeight: '24px'
                          }}
                        >
                          <span style={{ color: '#818181' }}>
                            {item?.expenseName}
                            <span style={{ fontSize: '11px', color: '#8c96a1' }}>
                              ({mainVendor?.displayName || 'none'})
                            </span>
                            :
                          </span>{' '}
                          <span style={{ flexShrink: 0 }}>
                            <NumberFormat value={item?.expenseValue} currency={expenseCurrency} />{' '}
                          </span>
                        </Typography>
                      </Box>
                    ) : (
                      <Box key={`paidToMainVendor-${item.expenseId}`} sx={{ mb: 3 }}>
                        <Controller
                          name={`expenses.${item.expenseId}.expenseValue`}
                          control={control}
                          defaultValue={item.expenseValue}
                          rules={{
                            pattern: {
                              value: floatPattern,
                              message: floatPatternMsg
                            }
                          }}
                          render={({ field, fieldState: { error } }) => (
                            <CustomTextField
                              value={field.value}
                              onChange={e => {
                                const rawValue = e.target.value
                                const formattedValue = rawValue === '' ? 0 : handleDecimalPlaces(rawValue)

                                field.onChange(formattedValue)
                                updateFieldByKey(
                                  updateExpense,
                                  'expenses',
                                  item.expenseId,
                                  'expenseValue',
                                  formattedValue
                                )
                              }}
                              InputProps={{
                                ...getOnFocusConfig(field, 0),
                                ...getAdornmentConfig(expenseCurrency)
                              }}
                              label={`${item?.expenseName}(${mainVendor?.displayName || 'none'})`}
                              fullWidth
                              error={Boolean(error)}
                              helperText={error?.message}
                            />
                          )}
                        />
                      </Box>
                    )
                  })}
              </Box>
              <Box sx={{ width: '90%' }}>
                <Grid container spacing={{ xs: 2 }} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <Controller
                      name='subtotal'
                      control={control}
                      render={({ field }) => (
                        <CustomTextField
                          value={parseFloat(field?.value).toFixed(2)}
                          InputProps={{
                            disabled: true,
                            ...vendorAdornmentConfig
                          }}
                          label='SubTotal'
                          fullWidth
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Controller
                      name='subTotalInLocal'
                      control={control}
                      render={({ field }) => (
                        <CustomTextField
                          value={parseFloat(field?.value).toFixed(2)}
                          InputProps={{
                            disabled: true,
                            ...localAdornmentConfig
                          }}
                          label='Local SubTotal'
                          fullWidth
                        />
                      )}
                    />
                  </Grid>
                </Grid>{' '}
              </Box>
              {allExpenses
                ?.filter(a => a.paidToMainVendor === false && a.accountableForOrderTaxes === true)
                .map(item => {
                  const vendor = vendors?.find(val => val?.vendorId === item?.vendorId)
                  const expenseCurrency = currencies?.find(val => val?.currencyId === item?.expenseValueCurrency)
                  return order?.lockedComponents?.includes(item?.expenseId) ? (
                    <Box sx={{ width: '90%', mb: 2 }} key={`tax-${item.expenseId}`}>
                      <Typography
                        sx={{
                          display: 'flex',
                          gap: '5px',
                          justifyContent: 'space-between',
                          fontSize: '12px',
                          fontWeight: 500,
                          lineHeight: '24px'
                        }}
                      >
                        <span style={{ color: '#818181' }}>
                          {item?.expenseName}
                          <span style={{ fontSize: '11px', color: '#8c96a1' }}>({vendor?.displayName || 'none'})</span>:
                        </span>{' '}
                        <span style={{ flexShrink: 0 }}>
                          <NumberFormat value={item?.expenseValue} currency={expenseCurrency} />
                        </span>
                      </Typography>
                    </Box>
                  ) : (
                    <Box
                      key={`accountable-${item.expenseId}`}
                      sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 3 }}
                    >
                      <Box sx={{ width: '90%' }}>
                        <Controller
                          name={`expenses.${item.expenseId}.expenseValue`}
                          control={control}
                          defaultValue={item.expenseValue}
                          rules={{
                            pattern: {
                              value: floatPattern,
                              message: floatPatternMsg
                            }
                          }}
                          render={({ field, fieldState: { error } }) => (
                            <CustomTextField
                              value={field.value}
                              onChange={e => {
                                const rawValue = e.target.value
                                const formattedValue = rawValue === '' ? 0 : handleDecimalPlaces(rawValue)
                                field.onChange(formattedValue)
                                updateFieldByKey(
                                  updateExpense,
                                  'expenses',
                                  item.expenseId,
                                  'expenseValue',
                                  formattedValue
                                )
                              }}
                              InputProps={{
                                ...getOnFocusConfig(field, 0),
                                ...getAdornmentConfig(expenseCurrency)
                              }}
                              label={`${item?.expenseName}(${vendor?.displayName || 'none'})`}
                              fullWidth
                              disabled={!item?.vendorId}
                              error={Boolean(error)}
                              helperText={error?.message}
                            />
                          )}
                        />
                      </Box>

                      <IconButton onClick={() => setOpenExpenseDialog({ open: true, selectedExpense: item })}>
                        <Icon icon='mdi:information-outline' />
                      </IconButton>
                    </Box>
                  )
                })}
              {allTaxes?.map((item, i) => {
                const vendor = vendors?.find(val => val?.vendorId === item?.vendorId)
                const taxAuthority = taxAuthorities?.find(val => val?.taxAuthorityId === item?.taxAuthorityId)

                return order?.lockedComponents?.includes(item?.taxId) ? (
                  <Box sx={{ width: '90%', mb: 2 }} key={`tax-${item.taxId}`}>
                    <Typography
                      sx={{
                        display: 'flex',
                        gap: '5px',
                        justifyContent: 'space-between',
                        fontSize: '12px',
                        fontWeight: 500,
                        lineHeight: '24px'
                      }}
                    >
                      <span style={{ color: '#818181' }}>
                        {item?.taxName}
                        <span style={{ fontSize: '11px', color: '#8c96a1' }}>
                          (
                          {item?.vendorId
                            ? vendor?.displayName || 'none'
                            : item?.taxAuthorityId
                            ? taxAuthority?.taxAuthorityName
                            : 'none'}
                          )
                        </span>
                        :
                      </span>{' '}
                      <span style={{ flexShrink: 0 }}>
                        <NumberFormat
                          value={item?.taxValue}
                          currency={item?.inLocalCurrency ? localCurrency : vendorCurrency}
                        />
                      </span>
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 3 }} key={`tax-${item.taxId}`}>
                    <Box sx={{ width: '90%' }}>
                      <Controller
                        name={`taxes[${i}].taxValue`}
                        control={control}
                        defaultValue={item.taxValue}
                        rules={{
                          pattern: {
                            value: floatPattern,
                            message: floatPatternMsg
                          }
                        }}
                        render={({ field, fieldState: { error } }) => (
                          <CustomTextField
                            {...field}
                            onChange={e => {
                              const formattedValue = handleDecimalPlaces(e.target.value)
                              field.onChange(formattedValue)
                              setValueFieldByKey('taxes', item.taxId, 'taxValue', formattedValue)
                              updateFieldByKey(updateTax, 'taxes', item.taxId, 'taxValue', formattedValue)
                            }}
                            InputProps={{
                              ...getOnFocusConfig(field, 0),
                              ...(item?.inLocalCurrency ? localAdornmentConfig : vendorAdornmentConfig)
                            }}
                            label={`${item?.taxName}(${
                              item?.vendorId
                                ? vendor?.displayName || 'none'
                                : item?.taxAuthorityId
                                ? taxAuthority?.taxAuthorityName
                                : 'none'
                            })`}
                            fullWidth
                            error={Boolean(error)}
                            helperText={error?.message}
                          />
                        )}
                      />
                    </Box>
                    <IconButton onClick={() => setOpenTaxDialog({ open: true, selectedTax: item })}>
                      <Icon icon='mdi:information-outline' />
                    </IconButton>
                  </Box>
                )
              })}
              {allExpenses
                ?.filter(
                  a =>
                    a.paidToMainVendor === false &&
                    a.accountableForOrderTaxes === false &&
                    a.eligibleForTaxCredit === false
                )
                .map(item => {
                  const expenseCurrency = currencies?.find(val => val?.currencyId === item?.expenseValueCurrency)
                  const vendor = vendors?.find(val => val?.vendorId === item?.vendorId)
                  return order?.lockedComponents?.includes(item?.expenseId) ? (
                    <Box sx={{ width: '90%', mb: 2 }} key={`expenses-${item.expenseId}`}>
                      <Typography
                        sx={{
                          display: 'flex',
                          gap: '5px',
                          justifyContent: 'space-between',
                          fontSize: '12px',
                          fontWeight: 500,
                          lineHeight: '24px',
                          mb: 3
                        }}
                      >
                        <span style={{ color: '#818181' }}>
                          {item?.expenseName}
                          <span style={{ fontSize: '11px', color: '#8c96a1' }}>({vendor?.displayName || 'none'})</span>:
                        </span>
                        <span style={{ flexShrink: 0 }}>
                          <NumberFormat value={item?.expenseValue} currency={expenseCurrency} />{' '}
                        </span>
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 3 }} key={`other-${item.expenseId}`}>
                      <Box sx={{ width: '90%' }}>
                        <Controller
                          name={`expenses.${item.expenseId}.expenseValue`}
                          control={control}
                          defaultValue={item.expenseValue}
                          render={({ field }) => (
                            <CustomTextField
                              value={field.value}
                              onChange={e => {
                                const rawValue = e.target.value
                                const formattedValue = rawValue === '' ? 0 : handleDecimalPlaces(rawValue)
                                field.onChange(formattedValue)
                                updateFieldByKey(
                                  updateExpense,
                                  'expenses',
                                  item.expenseId,
                                  'expenseValue',
                                  formattedValue
                                )
                              }}
                              inputProps={{ min: 0 }}
                              InputProps={{
                                ...getOnFocusConfig(field, 0),
                                ...getAdornmentConfig(expenseCurrency)
                              }}
                              // label={
                              //   item?.eligibleForTaxCredit ? `${item?.expenseName}(Excl. Tax)` : item?.expenseName
                              // }
                              disabled={!item?.vendorId}
                              label={`${item?.expenseName}(${vendor?.displayName || 'none'})`}
                              fullWidth
                            />
                          )}
                        />
                      </Box>{' '}
                      <IconButton onClick={() => setOpenExpenseDialog({ open: true, selectedExpense: item })}>
                        <Icon icon='mdi:information-outline' />
                      </IconButton>
                    </Box>
                  )
                })}
              {allExpenses
                ?.filter(a => a.accountableForOrderTaxes === false && a.eligibleForTaxCredit === true)
                .map(item => {
                  const vendor = vendors?.find(val => val?.vendorId === item?.vendorId)
                  const expenseCurrency = currencies?.find(val => val?.currencyId === item?.expenseValueCurrency)
                  return order?.lockedComponents?.includes(item?.expenseId) ? (
                    <Box sx={{ width: '90%', mb: 2 }} key={`eligible-${item.expenseId}`}>
                      <Typography
                        sx={{
                          display: 'flex',
                          gap: '5px',
                          justifyContent: 'space-between',
                          fontSize: '12px',
                          fontWeight: 500,
                          lineHeight: '24px',
                          mb: 2
                        }}
                      >
                        <span style={{ color: '#818181' }}>
                          {`${item?.expenseName}(Excl. Tax)`}
                          <span style={{ fontSize: '11px', color: '#8c96a1' }}>({vendor?.displayName || 'none'})</span>:
                        </span>{' '}
                        <span style={{ flexShrink: 0 }}>
                          <NumberFormat value={item?.expenseValue} currency={expenseCurrency} />{' '}
                        </span>
                      </Typography>
                      {/* {item?.eligibleForTaxCredit && ( */}
                      <Typography
                        sx={{
                          display: 'flex',
                          gap: '5px',
                          justifyContent: 'space-between',
                          fontSize: '12px',
                          fontWeight: 500,
                          lineHeight: '24px',
                          mb: 2
                        }}
                      >
                        <span style={{ color: '#818181' }}>
                          {`${item?.expenseName}(Tax)`}
                          <span style={{ fontSize: '11px', color: '#8c96a1' }}>({vendor?.displayName || 'none'})</span>:
                        </span>
                        <span style={{ flexShrink: 0 }}>
                          <NumberFormat value={item?.taxValue} currency={expenseCurrency} />
                        </span>
                      </Typography>
                    </Box>
                  ) : (
                    <Box key={`eligible-${item.expenseId}`} sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 3 }}>
                        <Box sx={{ width: '90%' }}>
                          <Controller
                            name={`expenses.${item.expenseId}.expenseValue`}
                            control={control}
                            defaultValue={item.expenseValue}
                            rules={{
                              pattern: {
                                value: floatPattern,
                                message: floatPatternMsg
                              }
                            }}
                            render={({ field, fieldState: { error } }) => (
                              <CustomTextField
                                label={`${item?.expenseName}(Excl. Tax)(${vendor?.displayName || 'none'})`}
                                value={field.value}
                                onChange={e => {
                                  const rawValue = e.target.value
                                  const formattedValue = rawValue === '' ? 0 : handleDecimalPlaces(rawValue)
                                  field.onChange(formattedValue)
                                  updateFieldByKey(
                                    updateExpense,
                                    'expenses',
                                    item.expenseId,
                                    'expenseValue',
                                    formattedValue
                                  )
                                }}
                                inputProps={{ min: 0 }}
                                InputProps={{
                                  ...getOnFocusConfig(field, 0),
                                  ...getAdornmentConfig(expenseCurrency)
                                }}
                                disabled={!item?.vendorId}
                                fullWidth
                                error={Boolean(error)}
                                helperText={error?.message}
                              />
                            )}
                          />
                        </Box>

                        <IconButton onClick={() => setOpenExpenseDialog({ open: true, selectedExpense: item })}>
                          <Icon icon='mdi:information-outline' />
                        </IconButton>
                      </Box>
                      <Box sx={{ width: '90%' }}>
                        {/* {item?.eligibleForTaxCredit && ( */}
                        <Controller
                          name={`expenses.${item.expenseId}.taxValue`}
                          control={control}
                          rules={{
                            pattern: {
                              value: floatPattern,
                              message: floatPatternMsg
                            }
                          }}
                          defaultValue={item.taxValue}
                          render={({ field, fieldState: { error } }) => (
                            <CustomTextField
                              fullWidth
                              label={`${item?.expenseName}(Tax)(${vendor?.displayName || 'none'})`}
                              value={field.value}
                              onChange={e => {
                                const rawValue = e.target.value
                                const formattedValue = rawValue === '' ? 0 : handleDecimalPlaces(rawValue)
                                field.onChange(formattedValue)
                                updateFieldByKey(updateExpense, 'expenses', item.expenseId, 'taxValue', formattedValue)
                              }}
                              inputProps={{ min: 0 }}
                              InputProps={{
                                ...getOnFocusConfig(field, 0),
                                ...getAdornmentConfig(expenseCurrency)
                              }}
                              disabled={!item?.vendorId}
                              error={Boolean(error)}
                              helperText={error?.message}
                            />
                          )}
                        />
                        {/* )} */}
                      </Box>
                    </Box>
                  )
                })}
              <Box sx={{ width: '90%' }}>
                <Controller
                  name='totalAmount'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      value={parseFloat(field?.value).toFixed(2)}
                      InputProps={{
                        disabled: true,
                        ...(totalAmountInLocalCurrency ? localAdornmentConfig : vendorAdornmentConfig)
                      }}
                      label='Total Price'
                      fullWidth
                    />
                  )}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Grid>
      {openExpenseDialog?.open && (
        <UpdateExpenseVendor
          open={openExpenseDialog?.open}
          setOpen={setOpenExpenseDialog}
          vendors={filterExpenseVendors}
          updateExpense={updateExpense}
          updateFieldByKey={updateFieldByKey}
          selectedExpense={openExpenseDialog.selectedExpense}
        />
      )}
      {openTaxDialog?.open && (
        <UpdatePOTaxData
          open={openTaxDialog?.open}
          setOpen={setOpenTaxDialog}
          updateTax={updateTax}
          updateFieldByKey={updateFieldByKey}
          selectedTax={openTaxDialog.selectedTax}
        />
      )}
    </>
  )
}
