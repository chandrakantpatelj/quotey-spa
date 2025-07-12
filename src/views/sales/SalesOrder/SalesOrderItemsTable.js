import { AddOutlined } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { NumericFormat } from 'react-number-format'
import { useDispatch, useSelector } from 'react-redux'
import {
  GetItemLedgerBalanceByItemIdQuery,
  GetItemLedgerBalanceByItemIdsQuery
} from 'src/@core/components/graphql/item-queries'
import {
  addItemToSalesOrderMutation,
  deleteItemFromSalesOrderMutation,
  getSuggestedProducts
} from 'src/@core/components/graphql/sales-order-queries'
import Icon from 'src/@core/components/icon'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'
import CommonItemPopup from 'src/common-components/CommonItemPopup'
import { RendorDimensions, RendorSalesItemData, ViewItemsTableWrapper } from 'src/common-components/CommonPdfDesign'
import CustomCloseButton from 'src/common-components/CustomCloseButton'
import { fetchData, writeData } from 'src/common-functions/GraphqlOperations'
import { STATUS_CONFIRMED, STATUS_INVOICED } from 'src/common-functions/utils/Constants'
import {
  addDecimals,
  addDecimalsWithoutRounding,
  multiplyDecimals,
  percentageOf,
  subtractDecimals,
  subtractDecimalsWithoutRounding,
  subtractPercentage
} from 'src/common-functions/utils/DecimalUtils'
import {
  calculateDiscount,
  calculateQuantity,
  calculateSellingPrice,
  convertCurrency,
  floatPattern,
  floatPatternMsg,
  generateId,
  getAdornmentConfig,
  getOnFocusConfig,
  handleDecimalPlaces,
  NumberFormat,
  safeNumber
} from 'src/common-functions/utils/UtilityFunctions'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import usePaymentMethods from 'src/hooks/getData/usePaymentMethods'
import useProducts from 'src/hooks/getData/useProducts'
import useIsDesktop from 'src/hooks/IsDesktop'
import { createAlert } from 'src/store/apps/alerts'
import { setActionSalesOrder, setUpdateSalesOrder } from 'src/store/apps/sales'
import CustomDatePicker from 'src/views/forms/form-elements/pickers/CustomDatePicker'
import UpdateItemTaxPopUp from './UpdateItemTaxPopUp'

const LineItemFields = {
  lineItemId: '',
  itemId: null,
  itemName: '',
  itemCodePrefix: '',
  itemCode: '',
  itemDescription: '',
  enableDimension: false,
  enablePackingUnit: false,
  dimensions: {
    length: null,
    height: null,
    width: null
  },
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
  originalPrice: 0,
  taxFree: false,
  taxInclusive: true,
  sellingPrice: 0,
  discountPerUnit: 0,
  taxes: [],
  subtotal: 0,
  totalDiscount: 0,
  totalTax: 0,
  totalNetAmount: 0,
  warehouseId: null,
  serviceDate: null,
  sellingPriceCurrency: '',
  sellingPriceTaxInclusive: false
}

export default function SalesOrderItemsTable({
  selectedSO,
  control,
  errors,
  setValue,
  getValues,
  trigger,
  watch,
  currency,
  typeOptions,
  allWarehouses,
  itemList,
  separateOtherCharges,
  setSeparateOtherCharges,
  enabledTaxes,
  setSeparateOrderTaxes,
  arrayName,
  setLoading
}) {
  const dispatch = useDispatch()
  const isDesktop = useIsDesktop()
  const tenant = useSelector(state => state.tenants?.selectedTenant) || {}
  const { tenantId = '' } = tenant
  const { paymentMethods } = usePaymentMethods(tenantId)
  const { currencies } = useCurrencies()
  const [totalQty, setTotalQty] = useState(0)
  const [subTotal, setSubTotal] = useState(0)
  const [amountDue, setAmountDue] = useState(0)
  const [message, setMessage] = useState('')
  const [separateTaxes, setSeparateTaxes] = useState(enabledTaxes)
  const { products, fetchProducts } = useProducts(tenantId)

  const filterPaymentMethods = useMemo(
    () => paymentMethods.filter(method => method.paymentMethod != 'Loan'),
    [paymentMethods]
  )

  useEffect(() => {
    const fetchProductAPI = async () => {
      await fetchProducts()
    }
    fetchProductAPI()
  }, [fetchProducts])

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

  const discountValue = watch('discountValue')
  const discountType = watch('discountType')
  const amount = watch('amountdue')
  const deposit = watch('depositAmount')
  const totalPrice = watch('totalAmount')
  let orderItems = getValues(arrayName)

  const calculateDiscountAndTaxValue = orderItems => {
    let totalTax = 0
    let totalDiscount = 0
    let totalNetAmount = 0
    let totalOtherChargesTax = 0
    // let otherChargesTax = 0
    let totalOtherCharges = 0

    // Collect all state updates to apply them in batch later
    const stateUpdates = {}
    // Calculate discounts and taxes for each order item
    let orderSubtotal = orderItems
      ?.map(item => {
        const { sellingPrice } = item
        const calcQty = calculateQuantity(item)
        const itemTotal = multiplyDecimals(sellingPrice, calcQty)
        return itemTotal
      })
      .reduce((acc, itemTotal) => addDecimals(acc, itemTotal), 0)

    orderItems?.forEach((item, index) => {
      const { sellingPrice } = item

      if (sellingPrice === 0) return

      const calcQty = calculateQuantity(item)
      const { discountPerUnit, totalDiscount } = calculateDiscount(
        orderSubtotal,
        multiplyDecimals(sellingPrice, calcQty),
        sellingPrice,
        calcQty,
        discountValue,
        discountType
      )
      item.discountPerUnit = discountPerUnit
      item.totalDiscount = totalDiscount
      stateUpdates[`${arrayName}[${index}].discountPerUnit`] = discountPerUnit
      stateUpdates[`${arrayName}[${index}].totalDiscount`] = totalDiscount

      item.taxes.forEach(tax => {
        tax.taxValuePerUnit = percentageOf(tax.taxRate, subtractDecimals(sellingPrice, discountPerUnit))
        tax.taxValue = multiplyDecimals(tax.taxValuePerUnit, calcQty)
      })

      let totalTax = item.taxes.reduce((acc, tax) => addDecimals(acc, tax.taxValue), 0)
      item.totalTax = totalTax
      stateUpdates[`${arrayName}[${index}].totalTax`] = totalTax

      let totalNetAmount = addDecimals(
        subtractDecimals(multiplyDecimals(sellingPrice, calcQty), totalDiscount),
        totalTax
      )
      item.totalNetAmount = totalNetAmount
      stateUpdates[`${arrayName}[${index}].totalNetAmount`] = totalNetAmount

      stateUpdates[`${arrayName}[${index}].taxes`] = item.taxes
    })

    let orderTaxes = enabledTaxes?.map(tax => {
      let totalTaxValue = 0
      orderItems
        ?.flatMap(item => item.taxes)
        .forEach(itemTax => {
          if (tax.taxId === itemTax?.taxId) {
            totalTaxValue = addDecimals(totalTaxValue, itemTax.taxValue)
          }
        })
      return { ...tax, taxValue: totalTaxValue }
    })

    setSeparateTaxes(orderTaxes)
    setSeparateOrderTaxes(orderTaxes)

    // Process taxes and their values
    totalTax = orderItems?.map(item => item.totalTax).reduce((acc, totalTax) => addDecimals(acc, totalTax), 0)
    totalDiscount = orderItems
      ?.map(item => item.totalDiscount)
      .reduce((acc, totalDiscount) => addDecimals(acc, totalDiscount), 0)
    totalNetAmount = orderItems
      ?.map(item => item.totalNetAmount)
      .reduce((acc, totalNetAmount) => addDecimals(acc, totalNetAmount), 0)

    // Process other charges and their taxes
    const updatedOtherCharges = separateOtherCharges?.map((charges, index) => {
      const { taxes, includingTax } = charges
      let totalChargeValue = otherChargesValue?.[index]?.totalChargeValue || 0
      let totalTaxValue = 0
      const updatedTaxes = taxes?.map(tax => {
        const { taxRate } = tax
        const taxValue = safeNumber(subtractDecimals(totalChargeValue, subtractPercentage(totalChargeValue, taxRate)))
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
    const finalTotal = addDecimals(totalNetAmount, addDecimals(totalOtherCharges, totalOtherChargesTax))

    stateUpdates['totalAmount'] = finalTotal

    // Apply all collected state updates in one go
    Object.entries(stateUpdates).forEach(([key, value]) => setValue(key, value))
  }

  useEffect(() => {
    setValue('taxes', separateTaxes)
  }, [separateTaxes])

  useMemo(() => calculateDiscountAndTaxValue(orderItems), [discountType, discountValue, otherChargesValue])

  const recalculateTotals = orderItems => {
    let totalQty = 0
    let subTotal = 0

    orderItems?.forEach((item, index) => {
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
      totalQty = addDecimals(totalQty, calcQty)
      const itemTotal = calcQty * safeNumber(sellingPrice)
      subTotal += itemTotal
      setValue(`${arrayName}[${index}].subtotal`, itemTotal)
    })
    setValue('totalQty', totalQty)
    setTotalQty(totalQty)
    setSubTotal(subTotal.toFixed(2))
    setValue(`subtotal`, safeNumber(subTotal))

    calculateDiscountAndTaxValue(orderItems)
  }

  useEffect(() => {
    recalculateTotals(orderItems)
  }, [orderItems, currency, getValues('currency')])

  const calculateTotal = () => {
    const depositValue = parseFloat(deposit) || 0

    const amountDue = subtractDecimalsWithoutRounding(totalPrice || 0, depositValue || 0)
    setAmountDue(amountDue > 0 ? amountDue : 0)
  }

  useEffect(() => {
    calculateTotal()
  }, [subTotal, discountValue, discountType, deposit, otherChargesValue, amount, currency, orderItems])

  useEffect(() => {
    trigger(['depositAmount'])
  }, [totalPrice])

  const [openMsgDialog, setOpenMsgDialog] = useState(false)

  const handleClose = () => {
    setOpenMsgDialog(false)
  }

  const handleConfirm = async newmessage => {
    setOpenMsgDialog(false)
    const tenantId = tenant?.tenantId
    const message1 = {
      message: newmessage,
      productId: newmessage.productId,
      itemCode: newmessage.itemCode,
      qty: newmessage.qty
    }
    const message = newmessage

    try {
      const response = await writeData(getSuggestedProducts(), { tenantId, message })
      if (response.createSuggestedProducts) {
        dispatch(createAlert({ message: 'Suggested Products created  successfully !', type: 'success' }))
      } else {
        //setLoader(false)
        dispatch(createAlert({ message: 'Suggested Products creation  failed !', type: 'error' }))
      }
      return response
    } catch (error) {
      // Handle any errors and optionally dispatch an error action
      console.log('error: ', error)
    }
  }

  const initialOptions = useMemo(
    () =>
      orderItems?.map(() =>
        allWarehouses?.map(wh => ({
          ...wh,
          availableQty: 0
        }))
      ),
    [orderItems, allWarehouses]
  )

  const [whOptions, setWhOptions] = useState([])
  const getAvailableQty = async () => {
    const itemIds =
      orderItems?.reduce((ids, item) => {
        if (item.itemId) {
          ids.push(item.itemId)
        }
        return ids
      }, []) || []
    setWhOptions(initialOptions)

    try {
      const response = await fetchData(GetItemLedgerBalanceByItemIdsQuery(tenantId, itemIds))
      const state = response?.getItemLedgerBalanceByItemIds

      setWhOptions(prevOptions => {
        const updatedOptions = [...prevOptions]

        orderItems?.forEach((item, index) => {
          const matchingState = state?.filter(val => item?.itemId === val?.itemId)

          updatedOptions[index] = updatedOptions[index]?.map(obj => {
            const matchingVal = matchingState?.find(val => obj.warehouseId === val.warehouseId)
            return matchingVal ? { ...obj, availableQty: matchingVal.availableQty } : obj
          })

          const findWarehouse = updatedOptions[index]?.find(val => val.warehouseId === item.warehouseId)

          setValue(
            `${arrayName}[${index}].warehouseId`,
            findWarehouse?.warehouseId || updatedOptions?.[index]?.[0]?.warehouseId || null
          )
        })
        return updatedOptions
      })
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      // setItemsLoader(false);
    }
  }

  useEffect(() => {
    if (orderItems?.length > 0 && allWarehouses.length > 0) {
      getAvailableQty()
    }
  }, [orderItems, allWarehouses])

  const [showSalesItemInput, setShowSalesItemInput] = useState(false)

  const {
    control: salesItemControl,
    setValue: setItemValue,
    watch: watchItems,
    getValues: getItemValues,
    // trigger,
    handleSubmit: handleSalesItemSubmit
  } = useForm({
    defaultValues: { ...LineItemFields, lineItemId: generateId() },
    mode: 'onChange'
  })

  const singleItemData = getItemValues()

  let itemId = watchItems('itemId')

  const calculateSingleItemTotal = () => {
    let totalQty = 0
    let subTotal = 0

    // orderItems?.forEach((item, index) => {
    // const { sellingPrice } = singleItemData

    const calcQty = calculateQuantity(singleItemData)

    setItemValue('qty', parseFloat(calcQty))

    const { taxFree, taxInclusive, originalPrice } = singleItemData
    const totalTaxRate = enabledTaxes?.reduce((acc, tax) => acc + tax.taxRate, 0) || 0

    const sellingPrice =
      taxInclusive && !taxFree
        ? calculateSellingPrice(originalPrice, totalTaxRate)
        : safeNumber(originalPrice).toFixed(2)
    // item.sellingPrice = sellingPrice
    setItemValue(`sellingPrice`, sellingPrice)

    const itemTaxes = !taxFree
      ? enabledTaxes?.map(tax => ({
          taxValuePerUnit: percentageOf(sellingPrice, tax.taxRate),
          taxValue: percentageOf(sellingPrice, tax.taxRate),
          ...tax
        }))
      : []
    // item.taxes = itemTaxes
    setItemValue(`taxes`, itemTaxes)

    // const { discountPerUnit, totalDiscount } = calculateDiscount(
    //   orderSubtotal,
    //   multiplyDecimals(sellingPrice, calcQty),
    //   sellingPrice,
    //   calcQty,
    //   discountValue,
    //   discountType
    // )
    // item.discountPerUnit = discountPerUnit
    // item.totalDiscount = totalDiscount
    // setItemValue[`discountPerUnit`] = discountPerUnit
    // setItemValue[`totalDiscount`] = totalDiscount

    // taxes.forEach(tax => {
    //   tax.taxValuePerUnit = percentageOf(tax.taxRate, subtractDecimals(sellingPrice, discountPerUnit))
    //   tax.taxValue = multiplyDecimals(tax.taxValuePerUnit, calcQty)
    // })

    // let totalTax = taxes.reduce((acc, tax) => addDecimals(acc, tax.taxValue), 0)
    // // totalTax = totalTax
    // setItemValue[`totalTax`] = totalTax

    // let totalNetAmount = addDecimals(
    //   subtractDecimals(multiplyDecimals(sellingPrice, calcQty), totalDiscount),
    //   totalTax
    // )
    // // item.totalNetAmount = totalNetAmount
    // stateUpdates[`totalNetAmount`] = totalNetAmount

    // stateUpdates[`taxes`] = item.taxes

    totalQty = addDecimalsWithoutRounding(totalQty, calcQty)
    const itemTotal = calcQty * parseFloat(sellingPrice)
    subTotal += itemTotal
    setItemValue('subtotal', subTotal)
  }

  useEffect(() => {
    calculateSingleItemTotal()
  }, [itemId])

  const [singleWhOptions, setSingleWhOptions] = useState([])

  const getSingleAvailableQty = async () => {
    setSingleWhOptions(
      allWarehouses?.map(wh => ({
        ...wh,
        availableQty: 0
      }))
    )
    try {
      const response = await fetchData(GetItemLedgerBalanceByItemIdQuery(tenantId, itemId))
      const state = response?.getItemLedgerBalanceByItemId

      setSingleWhOptions(prevOptions => {
        const options = (prevOptions = prevOptions?.map(obj => {
          const matchingVal = state?.find(val => obj.warehouseId === val.warehouseId)
          return matchingVal ? { ...obj, availableQty: matchingVal.availableQty } : obj
        }))

        setItemValue('warehouseId', options[0]?.warehouseId || null)
        return options
      })
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  useEffect(() => {
    if (itemId !== null && allWarehouses.length > 0) {
      getSingleAvailableQty()
    }
  }, [itemId, allWarehouses])

  const [openItemTaxDialog, setOpenItemTaxDialog] = useState({
    open: false,
    index: null,
    selectedItem: null
  })

  const [openItemDialog, setOpenItemDialog] = useState(false)

  const handleSalesItemInput = async itemData => {
    const orderId = selectedSO?.orderId
    const {
      dimensions,
      enableDimension,
      enablePackingUnit,
      packingUnits,
      sellingPriceCurrency,
      sellingPriceTaxInclusive,
      ...data
    } = itemData
    const item = data
    try {
      setLoading(true)
      const response = await writeData(addItemToSalesOrderMutation(), { tenantId, orderId, item })

      if (response.addItemToSalesOrder) {
        dispatch(setUpdateSalesOrder(response.addItemToSalesOrder))
        dispatch(setActionSalesOrder(response.addItemToSalesOrder))
        dispatch(createAlert({ message: 'Added an item to order successfully !', type: 'success' }))
        // setOpen(false)
        setLoading(false)
      } else {
        dispatch(createAlert({ message: 'Failed to add an item to order !', type: 'error' }))
        // setOpen(false)
        setLoading(false)
      }
      return response
    } catch (error) {
      console.log('error: ', error)
    }
  }
  const handleDeleteSalesItemInput = async orderItem => {
    const orderId = selectedSO?.orderId
    const lineItemId = orderItem?.lineItemId

    try {
      setLoading(true)
      const response = await writeData(deleteItemFromSalesOrderMutation(), { tenantId, orderId, lineItemId })

      if (response.deleteItemFromSalesOrder) {
        dispatch(setUpdateSalesOrder(response.deleteItemFromSalesOrder))
        dispatch(setActionSalesOrder(response.deleteItemFromSalesOrder))
        dispatch(createAlert({ message: 'Item deleted from sales order  successfully !', type: 'success' }))
        // setOpen(false)
        setLoading(false)
      } else {
        dispatch(createAlert({ message: 'Failed to delete item from sales order !', type: 'error' }))
        // setOpen(false)
        setLoading(false)
      }
      return response
    } catch (error) {
      console.log('error: ', error)
    }
  }

  return (
    <>
      {selectedSO?.status === STATUS_CONFIRMED || selectedSO?.status === STATUS_INVOICED ? (
        <>
          <ViewItemsTableWrapper>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '3%' }}>#</TableCell>
                <TableCell sx={{ width: '40%' }}>Item</TableCell>
                {isDesktop ? <TableCell sx={{ width: '6%' }}>Dimensions</TableCell> : null}
                <TableCell sx={{ width: '8%' }}>Qty</TableCell>
                {isDesktop ? <TableCell sx={{ width: '10%' }}>Warehouse</TableCell> : null}
                {isDesktop ? <TableCell sx={{ width: '11%' }}>Rate</TableCell> : null}
                <TableCell sx={{ width: '18%' }}>Total</TableCell>
                <TableCell sx={{ width: '2%' }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedSO?.orderItems?.length > 0 ? (
                selectedSO?.orderItems?.map((orderItem, index) => {
                  const warehouse = allWarehouses?.find(item => item?.warehouseId === orderItem?.warehouseId) || {}
                  return (
                    <TableRow key={orderItem?.lineItemId}>
                      <TableCell>{index + 1}</TableCell>

                      <RendorSalesItemData index={index} orderItem={orderItem} currency={currency} showData={true} />

                      {isDesktop ? (
                        <TableCell>
                          <RendorDimensions orderItem={orderItem} />{' '}
                        </TableCell>
                      ) : null}

                      <TableCell>
                        {orderItem?.qty} {orderItem?.uom}
                      </TableCell>

                      {isDesktop ? <TableCell>{warehouse?.name}</TableCell> : null}

                      {isDesktop ? (
                        <TableCell>
                          <NumberFormat value={orderItem?.sellingPrice.toFixed(2)} currency={currency} />
                        </TableCell>
                      ) : null}
                      <TableCell>
                        <NumberFormat value={orderItem?.subtotal?.toFixed(2)} currency={currency} />
                      </TableCell>
                      <TableCell>
                        {' '}
                        <IconButton
                          size='small'
                          variant='outlined'
                          color='error'
                          onClick={() => {
                            handleDeleteSalesItemInput(orderItem)
                          }}
                        >
                          <Icon icon='mingcute:delete-2-line' style={{ fontSize: '20px' }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8}>
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

          {selectedSO?.status !== STATUS_INVOICED && (
            <>
              {showSalesItemInput ? (
                <form onSubmit={handleSalesItemSubmit(handleSalesItemInput)}>
                  <Box sx={{ py: 2 }}>
                    <Grid container spacing={{ xs: 2 }}>
                      <Grid item xs={10} lg={11}>
                        <Grid container spacing={{ xs: 2 }}>
                          <Grid item xs={12} md={4} order={{ xs: 1, md: 1 }}>
                            <Controller
                              name='lineItemId'
                              control={salesItemControl}
                              rules={{ required: 'Item Name is required' }}
                              render={({ field, fieldState: { error } }) => (
                                <CustomAutocomplete
                                  {...field}
                                  value={singleItemData}
                                  options={products}
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
                                      const taxFree = singleItemData?.taxFree ?? false
                                      const taxInclusive = singleItemData?.taxInclusive ?? true

                                      // const totalTax = enabledTaxes?.reduce((acc, tax) => acc + tax.taxRate, 0) || 0

                                      const originalPrice =
                                        convertCurrency(
                                          curretItemCurrency?.exchangeRate,
                                          1,
                                          currency?.exchangeRate,
                                          priceSelling || 0
                                        ).toFixed(2) || 0

                                      // const sellingPrice =
                                      //   taxInclusive && !taxFree
                                      //     ? calculateSellingPrice(originalPrice, totalTax)
                                      //     : safeNumber(originalPrice).toFixed(2)

                                      const packingUnits = newValue?.packingUnits || []

                                      if (newValue?.enablePackingUnit) {
                                        setItemValue('packingUnits', packingUnits)
                                        // setItemValue('packingUnit', { ...packingUnits[0], qty: 1 })
                                        setItemValue(`packingUnit.unit`, packingUnits[0]?.unit)
                                        setItemValue(`packingUnit.qtyPerUnit`, packingUnits[0]?.qtyPerUnit)
                                        setItemValue(`packingUnit.description`, packingUnits[0]?.description)
                                        setItemValue(`packingUnit.qty`, 1)
                                        setItemValue('itemDimension.length', 0)
                                        setItemValue('itemDimension.width', 0)
                                        setItemValue('itemDimension.height', 0)
                                        setItemValue('itemDimension.qty', 0)
                                      } else if (newValue?.enableDimension) {
                                        setItemValue(`packingUnit.unit`, '')
                                        setItemValue(`packingUnit.qtyPerUnit`, 0)
                                        setItemValue(`packingUnit.description`, '')
                                        setItemValue(`packingUnit.qty`, 0)
                                        // if (newValue?.dimensions?.length !== null) {
                                        setItemValue(
                                          'itemDimension.length',
                                          newValue?.dimensions?.length?.defaultValue || 1
                                        )
                                        // }
                                        // if (newValue?.dimensions?.width !== null) {
                                        setItemValue(
                                          'itemDimension.width',
                                          newValue?.dimensions?.width?.defaultValue || 1
                                        )
                                        // }
                                        // if (newValue?.dimensions?.height !== null) {
                                        setItemValue(
                                          'itemDimension.height',
                                          newValue?.dimensions?.height?.defaultValue || 1
                                        )
                                        // }
                                        setItemValue('itemDimension.qty', 1)
                                      } else {
                                        setItemValue('itemDimension.length', 1)
                                        setItemValue('itemDimension.width', 1)
                                        setItemValue('itemDimension.height', 1)
                                        setItemValue('itemDimension.qty', 1)
                                      }

                                      setItemValue('itemId', newValue?.itemId)
                                      setItemValue('itemCodePrefix', newValue?.itemCodePrefix)
                                      setItemValue('itemCode', newValue?.itemCode)
                                      setItemValue('itemName', newValue?.itemName)
                                      setItemValue('itemGroup', newValue?.itemGroup)
                                      setItemValue('itemDescription', newValue?.itemDescription)
                                      setItemValue('enableDimension', newValue?.enableDimension)
                                      setItemValue('enablePackingUnit', newValue?.enablePackingUnit)
                                      setItemValue('dimensions', newValue?.dimensions)
                                      setItemValue('qty', 0)
                                      setItemValue('uom', newValue?.uom)
                                      setItemValue('taxFree', taxFree)
                                      setItemValue('taxInclusive', taxInclusive)
                                      setItemValue('originalPrice', originalPrice)
                                      // setItemValue('sellingPrice', sellingPrice)

                                      trigger(['itemName', 'originalPrice', 'qty'])
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
                                {singleItemData?.enablePackingUnit ? (
                                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    <Controller
                                      name={`packingUnit.unit`}
                                      control={salesItemControl}
                                      render={({ field }) => (
                                        <CustomAutocomplete
                                          sx={{ width: '45%' }}
                                          value={
                                            singleItemData?.packingUnits?.find(option => option.unit === field.value) ||
                                            singleItemData?.packingUnits[0] || { unit: '' }
                                          }
                                          onChange={(e, newValue) => {
                                            const unit = newValue?.unit || ''
                                            field.onChange(unit)

                                            setItemValue(`packingUnit.unit`, unit)
                                            setItemValue(`packingUnit.qtyPerUnit`, newValue?.qtyPerUnit || '')
                                            setItemValue(`packingUnit.description`, newValue?.description || '')
                                            calculateSingleItemTotal()
                                          }}
                                          disableClearable
                                          options={singleItemData?.packingUnits}
                                          getOptionLabel={option => option.unit || ''}
                                          isOptionEqualToValue={(option, value) => option.unit === value}
                                          renderInput={params => (
                                            <CustomTextField {...params} fullWidth label='Packing Unit' />
                                          )}
                                        />
                                      )}
                                    />

                                    <Controller
                                      name={`packingUnit.qty`}
                                      control={salesItemControl}
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
                                          value={singleItemData?.packingUnit?.qty}
                                          onChange={e => {
                                            const value = e.target.value
                                            const formattedValue = handleDecimalPlaces(value)
                                            field.onChange(formattedValue)
                                            calculateSingleItemTotal()
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
                                      name={`packingUnit.qtyPerUnit`}
                                      control={salesItemControl}
                                      render={({ field }) => (
                                        <CustomTextField
                                          value={singleItemData?.packingUnit?.qtyPerUnit}
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
                                ) : singleItemData?.enableDimension === true ? (
                                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    {singleItemData?.dimensions?.length !== null && (
                                      <Controller
                                        name={`itemDimension.length`}
                                        control={salesItemControl}
                                        rules={{
                                          pattern: {
                                            value: floatPattern,
                                            message: floatPatternMsg
                                          }
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                          <CustomTextField
                                            fullWidth
                                            label='L'
                                            value={singleItemData.itemDimension.length}
                                            onChange={e => {
                                              const value = e.target.value
                                              const formattedValue = handleDecimalPlaces(value)
                                              field.onChange(formattedValue)
                                              calculateSingleItemTotal()
                                            }}
                                            InputProps={{
                                              ...getOnFocusConfig(field, 1)
                                            }}
                                            error={Boolean(error)}
                                            helperText={error?.message}
                                          />
                                        )}
                                      />
                                    )}
                                    {singleItemData?.dimensions?.width !== null && (
                                      <Controller
                                        name='itemDimension.width'
                                        control={salesItemControl}
                                        rules={{
                                          pattern: {
                                            value: floatPattern,
                                            message: floatPatternMsg
                                          }
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                          <CustomTextField
                                            fullWidth
                                            label='W'
                                            value={singleItemData.itemDimension.width}
                                            onChange={e => {
                                              const value = e.target.value
                                              const formattedValue = handleDecimalPlaces(value)
                                              field.onChange(formattedValue)
                                              calculateSingleItemTotal()
                                            }}
                                            InputProps={{
                                              ...getOnFocusConfig(field, 1)
                                            }}
                                            error={Boolean(error)}
                                            helperText={error?.message}
                                          />
                                        )}
                                      />
                                    )}
                                    {singleItemData?.dimensions?.height !== null && (
                                      <Controller
                                        name={`itemDimension.height`}
                                        control={salesItemControl}
                                        rules={{
                                          pattern: {
                                            value: floatPattern,
                                            message: floatPatternMsg
                                          }
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                          <CustomTextField
                                            fullWidth
                                            label='H'
                                            value={singleItemData.itemDimension.height}
                                            onChange={e => {
                                              const value = e.target.value
                                              const formattedValue = handleDecimalPlaces(value)
                                              field.onChange(formattedValue)
                                              calculateSingleItemTotal()
                                            }}
                                            InputProps={{
                                              ...getOnFocusConfig(field, 1)
                                            }}
                                            error={Boolean(error)}
                                            helperText={error?.message}
                                          />
                                        )}
                                      />
                                    )}
                                    <Controller
                                      name={`itemDimension.qty`}
                                      control={salesItemControl}
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
                                            calculateSingleItemTotal()
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
                                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    {(singleItemData?.uom === 'm2' || singleItemData?.uom === 'm3') && (
                                      <>
                                        <Controller
                                          name={`itemDimension.length`}
                                          control={salesItemControl}
                                          rules={{
                                            pattern: {
                                              value: floatPattern,
                                              message: floatPatternMsg
                                            }
                                          }}
                                          render={({ field, fieldState: { error } }) => (
                                            <CustomTextField
                                              fullWidth
                                              label='L'
                                              value={field.value}
                                              onChange={e => {
                                                const value = e.target.value
                                                const formattedValue = handleDecimalPlaces(value)
                                                field.onChange(formattedValue)
                                                calculateSingleItemTotal()
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
                                          name={`itemDimension.width`}
                                          control={salesItemControl}
                                          rules={{
                                            pattern: {
                                              value: floatPattern,
                                              message: floatPatternMsg
                                            }
                                          }}
                                          render={({ field, fieldState: { error } }) => (
                                            <CustomTextField
                                              fullWidth
                                              label='W'
                                              value={field.value}
                                              onChange={e => {
                                                const value = e.target.value
                                                const formattedValue = handleDecimalPlaces(value)
                                                field.onChange(formattedValue)
                                                calculateSingleItemTotal()
                                              }}
                                              InputProps={{
                                                ...getOnFocusConfig(field, 1)
                                              }}
                                              error={Boolean(error)}
                                              helperText={error?.message}
                                            />
                                          )}
                                        />
                                        {singleItemData?.uom === 'm3' && (
                                          <Controller
                                            name={`itemDimension.height`}
                                            control={salesItemControl}
                                            rules={{
                                              pattern: {
                                                value: floatPattern,
                                                message: floatPatternMsg
                                              }
                                            }}
                                            render={({ field, fieldState: { error } }) => (
                                              <CustomTextField
                                                fullWidth
                                                label='H'
                                                value={field.value}
                                                onChange={e => {
                                                  const value = e.target.value
                                                  const formattedValue = handleDecimalPlaces(value)
                                                  field.onChange(formattedValue)
                                                  calculateSingleItemTotal()
                                                }}
                                                InputProps={{
                                                  ...getOnFocusConfig(field, 1)
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
                                      name={`itemDimension.qty`}
                                      control={salesItemControl}
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
                                          value={field.value}
                                          onChange={e => {
                                            const value = e.target.value
                                            const formattedValue = handleDecimalPlaces(value)
                                            field.onChange(formattedValue)
                                            calculateSingleItemTotal()
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
                                )}
                              </Box>

                              <Box sx={{ width: '30% !important' }}>
                                <Controller
                                  name='qty'
                                  control={salesItemControl}
                                  render={({ field }) => (
                                    <CustomTextField
                                      value={`${parseFloat(field?.value)?.toFixed(2)} ${singleItemData?.uom}`}
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
                              name={`originalPrice`}
                              control={salesItemControl}
                              rules={{
                                required: 'Please enter Rate',
                                pattern: {
                                  value: floatPattern,
                                  message: floatPatternMsg
                                }
                              }}
                              render={({ field, fieldState: { error } }) => (
                                <CustomTextField
                                  value={field.value}
                                  onChange={e => {
                                    const value = e.target.value
                                    const newValue = handleDecimalPlaces(value)
                                    const taxFree = singleItemData?.taxFree ?? false
                                    const taxInclusive = singleItemData?.sellingPriceTaxInclusive ?? true

                                    const totalTax = enabledTaxes?.reduce((acc, tax) => acc + tax.taxRate, 0) || 0
                                    const sellingPrice =
                                      taxInclusive && !taxFree
                                        ? calculateSellingPrice(newValue, totalTax)
                                        : safeNumber(newValue).toFixed(2)

                                    field.onChange(newValue)
                                    setItemValue(`originalPrice`, newValue)
                                    setItemValue(`sellingPrice`, sellingPrice)
                                  }}
                                  label={`Rate ${singleItemData?.taxInclusive ? '(Tax Inclusive)' : '(Tax Exclusive)'}`}
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

                          <Grid item xs={12} md={7.5} order={{ xs: 6, md: 4 }}>
                            <Controller
                              name={`itemDescription`}
                              control={salesItemControl}
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
                          <Grid item xs={6} md={1.5} order={{ xs: 4, md: 5 }}>
                            <Controller
                              name={`serviceDate`}
                              control={salesItemControl}
                              render={({ field }) => (
                                <CustomDatePicker
                                  label={'Service Date'}
                                  fullWidth={true}
                                  date={field.value ? new Date(field.value) : null}
                                  onChange={date => {
                                    if (date) {
                                      const formattedDate = date.toISOString().split('T')[0]
                                      field.onChange(formattedDate)
                                    }
                                  }}
                                  error={Boolean(errors?.serviceDate)}
                                />
                              )}
                            />
                          </Grid>

                          <Grid item xs={12} md={3} order={{ xs: 5, md: 6 }}>
                            <Controller
                              name='warehouseId'
                              control={salesItemControl}
                              rules={{
                                required: 'Please select warehouse'
                              }}
                              render={({ field, fieldState: { error } }) => (
                                <CustomAutocomplete
                                  {...field}
                                  options={singleWhOptions || []}
                                  getOptionLabel={option => {
                                    if (typeof option === 'string') {
                                      return option
                                    } else return `${option?.name}(${option?.availableQty || 0})`
                                  }}
                                  value={singleWhOptions?.find(option => option.warehouseId === field.value) || {}}
                                  renderOption={(props, option) => (
                                    <Box component='li' {...props} key={option?.warehouseId}>
                                      {`${option?.name}(${option?.availableQty || 0})`}
                                    </Box>
                                  )}
                                  disableClearable
                                  onChange={(e, newValue) => {
                                    field.onChange(newValue ? newValue.warehouseId : null)
                                  }}
                                  isOptionEqualToValue={(option, value) => option.warehouseId === value}
                                  renderInput={params => (
                                    <CustomTextField
                                      {...params}
                                      label='Warehouse'
                                      fullWidth
                                      error={Boolean(error)}
                                      helperText={error?.message}
                                    />
                                  )}
                                />
                              )}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={2} lg={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                          {singleItemData?.lineItemId !== '' && singleItemData?.lineItemId !== null ? (
                            <IconButton variant='outlined' onClick={() => setOpenItemDialog(true)}>
                              <Icon icon='tabler:eye' />
                            </IconButton>
                          ) : null}
                          {singleItemData?.itemId !== '' && singleItemData?.itemId !== null ? (
                            <CommonItemPopup
                              openDialog={openItemDialog}
                              setOpenDialog={setOpenItemDialog}
                              itemId={singleItemData?.itemId}
                            />
                          ) : null}
                          <IconButton
                            variant='outlined'
                            color='error'
                            sx={{ fontSize: '20px' }}
                            onClick={() => setShowSalesItemInput(false)}
                          >
                            <Icon icon='mingcute:delete-2-line' />
                          </IconButton>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, mt: 3, mb: 4, ml: '6px' }}>
                    <Button
                      type='submit'
                      color='primary'
                      variant='contained'
                      // startIcon={<AddOutlined />}
                    >
                      Save
                    </Button>
                    <Button
                      color='primary'
                      variant='outlined'
                      onClick={() => {
                        setShowSalesItemInput(false)
                      }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </form>
              ) : (
                <Button
                  color='primary'
                  variant='contained'
                  startIcon={<AddOutlined />}
                  sx={{ mt: 3, mb: 4, ml: '6px' }}
                  onClick={() => setShowSalesItemInput(true)}
                >
                  Add New
                </Button>
              )}
            </>
          )}
          <Grid item xs={12}>
            <Grid
              container
              spacing={6}
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column-reverse', md: 'row' },
                justifyContent: 'space-between'
              }}
            >
              <Grid item xs={12} md={8}>
                <Box component='div' sx={{ width: '100%', p: 4 }}>
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
                      <CustomTextField
                        fullWidth
                        label='Notes'
                        multiline
                        minRows={2}
                        value={value}
                        onChange={onChange}
                      />
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
              <Grid item xs={12} md={4}>
                <Table
                  sx={{
                    '& .MuiTableCell-root': {
                      padding: '8px 10px !important',
                      borderBottom: '1px dashed #EBEBEB',
                      textAlign: 'right',
                      fontSize: '12px'
                    },
                    '& .data-value p': {
                      textWrap: 'nowrap'
                    }
                  }}
                >
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        {' '}
                        <Typography
                          sx={{
                            fontFamily: 'Kanit',
                            fontSize: '14px',
                            fontWeight: 400,
                            color: '#667380',
                            textAlign: 'right'
                          }}
                        >
                          Total Qty:
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: 'inherit', fontWeight: 400 }}>{selectedSO?.totalQty}</Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        {' '}
                        <Typography
                          sx={{
                            fontFamily: 'Kanit',

                            fontSize: '14px',
                            fontWeight: 400,
                            color: '#667380',
                            textAlign: 'right'
                          }}
                        >
                          Sub Total:
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: 'inherit', fontWeight: 400 }}>
                          <NumberFormat value={selectedSO?.subtotal} currency={currency} />
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        {' '}
                        <Typography
                          sx={{
                            fontFamily: 'Kanit',

                            fontSize: '14px',
                            fontWeight: 400,
                            color: '#667380',
                            textAlign: 'right'
                          }}
                        >
                          Discount:
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {selectedSO?.discountValue <= 0 ? (
                          <Typography sx={{ fontSize: 'inherit', fontWeight: 400 }}>0.00</Typography>
                        ) : (
                          <Typography color='error' sx={{ fontSize: 'inherit', fontWeight: 400 }}>
                            -{' '}
                            <NumericFormat
                              value={parseFloat(selectedSO?.discountValue || 0).toFixed(2)}
                              thousandSeparator=','
                              displayType={'text'}
                              prefix={
                                selectedSO?.discountType !== 'PERCENTAGE' && currency?.displayAlignment === 'left'
                                  ? `${currency?.symbol}`
                                  : ''
                              }
                              suffix={
                                selectedSO?.discountType === 'PERCENTAGE'
                                  ? '%'
                                  : currency?.displayAlignment === 'right'
                                  ? `${currency?.symbol}`
                                  : ''
                              }
                            />
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>

                    {selectedSO?.taxes
                      ?.filter(tax => tax.taxValue !== 0)
                      ?.map(item => (
                        <TableRow key={item.taxName}>
                          <TableCell>
                            {' '}
                            <Typography
                              sx={{
                                fontFamily: 'Kanit',

                                fontSize: '14px',

                                fontWeight: 400,
                                color: '#667380',
                                textAlign: 'right'
                              }}
                            >
                              {item.taxName}({item.taxRate}%):
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontSize: 'inherit', fontWeight: 400 }}>
                              <NumberFormat value={item.taxValue} currency={currency} />
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}

                    {selectedSO?.otherCharges
                      ?.filter(val => val.chargedAmount !== 0 || val.totalChargeValue !== 0)
                      ?.map(item => {
                        return (
                          <TableRow key={item.chargeName}>
                            <TableCell>
                              <Typography
                                sx={{
                                  fontFamily: 'Kanit',
                                  fontSize: '14px',
                                  fontWeight: 400,
                                  color: '#667380',
                                  textAlign: 'right',
                                  minWidth: 'max-content'
                                }}
                              >
                                {item.chargeName}
                                {/* {'(Exc. Tax)'}: */}
                                {item.includingTax && item.taxes.length === 0 ? '(Inc. Tax)' : '(Exc. Tax)'}:
                              </Typography>
                              {item.taxes
                                ?.filter(tax => tax.taxValue !== 0)
                                .map(tax => (
                                  <Typography
                                    key={tax.taxName}
                                    sx={{
                                      fontFamily: 'Kanit',
                                      fontSize: '12px',
                                      fontWeight: 400,
                                      color: '#667380',
                                      textAlign: 'right'
                                    }}
                                  >
                                    {tax.taxName}({tax.taxRate}%):
                                  </Typography>
                                ))}
                            </TableCell>
                            <TableCell>
                              <Typography sx={{ fontSize: 'inherit', fontWeight: 400 }}>
                                <NumberFormat
                                  value={item.includingTax ? item.chargedAmount : item.totalChargeValue}
                                  currency={currency}
                                />
                              </Typography>
                              {item.taxes
                                ?.filter(tax => tax.taxValue !== 0)
                                .map(tax => (
                                  <Typography
                                    key={tax.taxName}
                                    sx={{
                                      fontFamily: 'Kanit',
                                      fontSize: 'inherit',
                                      fontWeight: 400,
                                      color: '#667380',
                                      textAlign: 'right'
                                    }}
                                  >
                                    <NumberFormat value={tax.taxValue} currency={currency} />
                                  </Typography>
                                ))}
                            </TableCell>
                          </TableRow>
                        )
                      })}

                    <TableRow>
                      <TableCell>
                        {' '}
                        <Typography
                          sx={{
                            fontFamily: 'Kanit',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: '#667380',
                            textAlign: 'right'
                          }}
                        >
                          Total (Inc. Tax):
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: 'inherit', fontWeight: 600 }}>
                          <NumberFormat value={selectedSO?.totalAmount} currency={currency} />
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Grid>
            </Grid>
          </Grid>
        </>
      ) : (
        <>
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', mb: 3 }}>
            <Typography sx={{ fontSize: '15px', fontWeight: 500, mr: 4 }}>Items </Typography>
            {LineItemFields?.length < 1 ? (
              <IconButton
                variant='outlined'
                color='success'
                sx={{ fontSize: '20px' }}
                disabled={products?.length <= 0}
                onClick={() => {
                  append({ ...LineItemFields, lineItemId: generateId() })
                }}
              >
                <Icon icon='material-symbols:add-box-outline' />
              </IconButton>
            ) : null}
            <IconButton onClick={() => setOpenMsgDialog(true)} variant='outlined' color='primary'>
              <Icon icon='ic:outline-message' />
            </IconButton>
          </Box>
          {orderItems?.length > 0 ? (
            <>
              {orderItems?.map((orderItem, index) => {
                return (
                  <Box sx={{ py: 1, mb: 2 }} key={orderItem?.lineItemId}>
                    <Grid container spacing={{ xs: 2 }}>
                      <Grid item xs={10} lg={11}>
                        <Grid container spacing={{ xs: 2 }}>
                          <Grid item xs={12} md={4} order={{ xs: 1, md: 1 }}>
                            <Controller
                              name={`${arrayName}[${index}].itemName`}
                              control={control}
                              rules={{ required: 'Item Name is required' }}
                              render={({ field, fieldState: { error } }) => (
                                <CustomAutocomplete
                                  {...field}
                                  value={orderItem}
                                  options={products}
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
                                        lineItemId: orderItem?.lineItemId,
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
                                        serviceDate: null
                                      }

                                      setValue(`${arrayName}[${index}]`, { ...updatedItem })
                                      update(`${arrayName}[${index}]`, { ...updatedItem })

                                      newValue?.enablePackingUnit &&
                                        setValue(`${arrayName}[${index}].packingUnit`, {
                                          ...packingUnits[0],
                                          qty: 1
                                        })
                                    } else {
                                      setValue(`${arrayName}[${index}]`, LineItemFields)
                                      update(`${arrayName}[${index}]`, LineItemFields)
                                    }

                                    trigger([
                                      `${arrayName}[${index}].itemName`,
                                      `${arrayName}[${index}].qty`,
                                      `${arrayName}[${index}].originalPrice`
                                    ])
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
                                {orderItem?.enablePackingUnit ? (
                                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    <Controller
                                      name={`${arrayName}[${index}].packingUnit.unit`}
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
                                            update(`${arrayName}[${index}].packingUnit.qty`, formattedValue)
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
                                      name={`${arrayName}[${index}].packingUnit.qtyPerUnit`}
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
                                        name={`${arrayName}[${index}].itemDimension.length`}
                                        control={control}
                                        rules={{
                                          pattern: {
                                            value: floatPattern,
                                            message: floatPatternMsg
                                          }
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                          <CustomTextField
                                            fullWidth
                                            label='L'
                                            value={orderItem?.itemDimension?.length}
                                            onChange={e => {
                                              const value = e.target.value
                                              const formattedValue = handleDecimalPlaces(value)
                                              field.onChange(formattedValue)
                                              update(`${arrayName}[${index}].itemDimension.length`, formattedValue)
                                            }}
                                            InputProps={{
                                              ...getOnFocusConfig(field, 1)
                                            }}
                                            error={Boolean(error)}
                                            helperText={error?.message}
                                          />
                                        )}
                                      />
                                    )}
                                    {orderItem?.dimensions?.width !== null && (
                                      <Controller
                                        name={`${arrayName}[${index}].itemDimension.width`}
                                        control={control}
                                        rules={{
                                          pattern: {
                                            value: floatPattern,
                                            message: floatPatternMsg
                                          }
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                          <CustomTextField
                                            fullWidth
                                            label='W'
                                            value={orderItem?.itemDimension?.width}
                                            onChange={e => {
                                              const value = e.target.value
                                              const formattedValue = handleDecimalPlaces(value)
                                              field.onChange(formattedValue)
                                              update(`${arrayName}[${index}].itemDimension.width`, formattedValue)
                                            }}
                                            InputProps={{
                                              ...getOnFocusConfig(field, 1)
                                            }}
                                            error={Boolean(error)}
                                            helperText={error?.message}
                                          />
                                        )}
                                      />
                                    )}
                                    {orderItem?.dimensions?.height !== null && (
                                      <Controller
                                        name={`${arrayName}[${index}].itemDimension.height`}
                                        control={control}
                                        rules={{
                                          pattern: {
                                            value: floatPattern,
                                            message: floatPatternMsg
                                          }
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                          <CustomTextField
                                            fullWidth
                                            label='H'
                                            value={orderItem?.itemDimension?.height}
                                            onChange={e => {
                                              const value = e.target.value
                                              const formattedValue = handleDecimalPlaces(value)
                                              field.onChange(formattedValue)
                                              update(`${arrayName}[${index}].itemDimension.height`, formattedValue)
                                            }}
                                            InputProps={{
                                              ...getOnFocusConfig(field, 1)
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
                                            update(`${arrayName}[${index}].itemDimension.qty`, formattedValue)
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
                                            name={`${arrayName}[${index}].itemDimension.length`}
                                            control={control}
                                            rules={{
                                              pattern: {
                                                value: floatPattern,
                                                message: floatPatternMsg
                                              }
                                            }}
                                            render={({ field, fieldState: { error } }) => (
                                              <CustomTextField
                                                fullWidth
                                                label='L'
                                                value={field.value}
                                                onChange={e => {
                                                  const value = e.target.value
                                                  const formattedValue = handleDecimalPlaces(value)
                                                  field.onChange(formattedValue)
                                                  update(`${arrayName}[${index}].itemDimension.length`, formattedValue)
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
                                            name={`${arrayName}[${index}].itemDimension.width`}
                                            control={control}
                                            rules={{
                                              pattern: {
                                                value: floatPattern,
                                                message: floatPatternMsg
                                              }
                                            }}
                                            render={({ field, fieldState: { error } }) => (
                                              <CustomTextField
                                                fullWidth
                                                label='W'
                                                value={field.value}
                                                onChange={e => {
                                                  const value = e.target.value
                                                  const formattedValue = handleDecimalPlaces(value)
                                                  field.onChange(formattedValue)
                                                  update(`${arrayName}[${index}].itemDimension.width`, formattedValue)
                                                }}
                                                InputProps={{
                                                  ...getOnFocusConfig(field, 1)
                                                }}
                                                error={Boolean(error)}
                                                helperText={error?.message}
                                              />
                                            )}
                                          />
                                          {orderItem?.uom === 'm3' && (
                                            <Controller
                                              name={`${arrayName}[${index}].itemDimension.height`}
                                              control={control}
                                              rules={{
                                                pattern: {
                                                  value: floatPattern,
                                                  message: floatPatternMsg
                                                }
                                              }}
                                              render={({ field, fieldState: { error } }) => (
                                                <CustomTextField
                                                  fullWidth
                                                  label='H'
                                                  value={field.value}
                                                  onChange={e => {
                                                    const value = e.target.value
                                                    const formattedValue = handleDecimalPlaces(value)
                                                    field.onChange(formattedValue)
                                                    // setValue(
                                                    //   `${arrayName}[${index}].itemDimension.height`,
                                                    //   formattedValue
                                                    // )
                                                    update(
                                                      `${arrayName}[${index}].itemDimension.height`,
                                                      formattedValue
                                                    )
                                                  }}
                                                  InputProps={{
                                                    ...getOnFocusConfig(field, 1)
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
                                        render={({ field, fieldState: { error } }) => (
                                          <CustomTextField
                                            fullWidth
                                            label='Qty'
                                            value={field.value}
                                            onChange={e => {
                                              const value = e.target.value
                                              const formattedValue = handleDecimalPlaces(value)
                                              field.onChange(formattedValue)
                                              update(`${arrayName}[${index}].itemDimension.qty`, formattedValue)
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
                                  name={`${arrayName}[${index}].qty`}
                                  control={control}
                                  render={() => (
                                    <CustomTextField
                                      value={`${parseFloat(orderItem?.qty)?.toFixed(2)} ${orderItem?.uom}`}
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
                                validate: value => (parseFloat(value) > 0 ? true : 'Rate must be greater than 0')
                              }}
                              render={({ field, fieldState: { error } }) => (
                                <CustomTextField
                                  value={field.value}
                                  onChange={e => {
                                    const value = e.target.value
                                    const newValue = handleDecimalPlaces(value)
                                    field.onChange(newValue)

                                    const taxFree = orderItem?.taxFree ?? false
                                    const taxInclusive = orderItem?.taxInclusive ?? true

                                    const totalTax = enabledTaxes?.reduce((acc, tax) => acc + tax.taxRate, 0) || 0
                                    const sellingPrice =
                                      taxInclusive && !taxFree
                                        ? calculateSellingPrice(newValue, totalTax)
                                        : safeNumber(newValue).toFixed(2)

                                    update(`${arrayName}[${index}].originalPrice`, newValue)
                                    update(`${arrayName}[${index}].sellingPrice`, sellingPrice)
                                  }}
                                  label={`Rate ${orderItem?.taxInclusive ? '(Tax Inclusive)' : '(Tax Exclusive)'}`}
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

                          <Grid item xs={12} md={7.5} order={{ xs: 6, md: 4 }}>
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
                                />
                              )}
                            />
                          </Grid>
                          <Grid item xs={6} md={1.5} order={{ xs: 4, md: 5 }}>
                            <Controller
                              name={`${arrayName}[${index}].serviceDate`}
                              control={control}
                              render={({ field }) => (
                                <CustomDatePicker
                                  label={'Service Date'}
                                  fullWidth={true}
                                  date={field.value ? new Date(field.value) : null}
                                  onChange={date => {
                                    // const formattedDate = date.toISOString().split('T')[0]
                                    field.onChange(date)
                                  }}
                                  error={Boolean(errors?.serviceDate)}
                                />
                              )}
                            />
                          </Grid>
                          <Grid item xs={12} md={3} order={{ xs: 5, md: 6 }}>
                            <Controller
                              name={`${arrayName}[${index}].warehouseId`}
                              control={control}
                              rules={{ required: 'Please select warehouse' }}
                              render={({ field, fieldState: { error } }) => (
                                <CustomAutocomplete
                                  {...field}
                                  options={whOptions[index] || []}
                                  getOptionLabel={option => {
                                    if (typeof option === 'string') {
                                      return option
                                    } else return `${option?.name}(${option?.availableQty || 0})`
                                  }}
                                  value={whOptions[index]?.find(option => option.warehouseId === field.value) || null}
                                  // getOptionSelected={(option, value) => option.warehouseId === value.warehouseId}
                                  renderOption={(props, option) => (
                                    <Box component='li' {...props} key={option?.warehouseId}>
                                      {`${option?.name}(${option?.availableQty || 0})`}
                                    </Box>
                                  )}
                                  disableClearable
                                  onChange={(e, newValue) => {
                                    field.onChange(newValue ? newValue.warehouseId : null)
                                  }}
                                  renderInput={params => (
                                    <CustomTextField
                                      {...params}
                                      label='Warehouse'
                                      fullWidth
                                      error={Boolean(error)}
                                      helperText={error?.message}
                                    />
                                  )}
                                />
                              )}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={2} lg={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                          <IconButton
                            variant='outlined'
                            onClick={() => setOpenItemTaxDialog({ open: true, index: index, selectedItem: orderItem })}
                          >
                            <Icon icon='mdi:information-outline' />
                          </IconButton>
                          {/* {orderItem?.lineItemId !== '' && orderItem?.lineItemId !== null ? (
                                <IconButton variant='outlined' onClick={() => handleClick(index)}>
                                  <Icon icon='tabler:eye' />
                                </IconButton>
                              ) : null}

                              {openDialog[index] ? (
                                <CommonItemPopup
                                  openDialog={openDialog[index]}
                                  setOpenDialog={setOpenDialog}
                                  itemId={orderItem?.itemId}
                                />
                              ) : null} */}
                          {/* {orderItems?.length >= 1 && orderItems?.length - 1 == index && ( */}
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
                      <CustomTextField
                        fullWidth
                        label='Notes'
                        multiline
                        minRows={2}
                        value={value}
                        onChange={onChange}
                      />
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
                          onChange={e => {
                            const value = e.target.value
                            const formattedValue = handleDecimalPlaces(value)
                            field.onChange(formattedValue)
                          }}
                          InputProps={{
                            ...getOnFocusConfig(field, 0)
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
                            // rules={{
                            //   pattern: {
                            //     value: floatPattern,
                            //     message: floatPatternMsg
                            //   }
                            // }}
                            render={({ field, fieldState: { error } }) => (
                              <CustomTextField
                                {...field}
                                value={field?.value?.totalChargeValue}
                                onChange={e => {
                                  const value = e.target.value
                                  const formattedValue = handleDecimalPlaces(value)
                                  field.onChange({ ...field.value, totalChargeValue: formattedValue })
                                }}
                                InputProps={{
                                  ...getOnFocusConfig(field, 0),
                                  ...localAdornmentConfig
                                }}
                                fullWidth
                                label={label}
                                // error={Boolean(error)}
                                // helperText={error?.message}
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
                  <Grid container spacing={{ xs: 2 }} sx={{ mb: 3 }}>
                    <Grid item xs={deposit > 0 ? 6 : 12}>
                      <Controller
                        name='depositAmount'
                        control={control}
                        rules={{
                          required: false,
                          pattern: {
                            value: floatPattern,
                            message: floatPatternMsg
                          }
                        }}
                        render={({ field }) => (
                          <CustomTextField
                            {...field}
                            fullWidth
                            label='Deposit'
                            onChange={e => {
                              const value = e.target.value
                              const formattedValue = handleDecimalPlaces(value)
                              field.onChange(formattedValue)
                            }}
                            InputProps={{
                              ...getOnFocusConfig(field, 0),
                              ...customerAdornmentConfig
                            }}
                            error={Boolean(errors.depositAmount)}
                            helperText={errors?.depositAmount?.message || ''}
                          />
                        )}
                      />
                    </Grid>
                    {deposit > 0 ? (
                      <Grid item xs={6}>
                        <Controller
                          name='amountdue'
                          control={control}
                          render={({ field }) => (
                            <CustomTextField
                              {...field}
                              InputProps={{
                                disabled: true,
                                ...customerAdornmentConfig
                              }}
                              value={amountDue}
                              label='Amount Due'
                              fullWidth
                              sx={{ mb: 3 }}
                            />
                          )}
                        />
                      </Grid>
                    ) : null}
                  </Grid>
                  {deposit > 0 ? (
                    <>
                      {arrayName === 'orderItems' && (
                        <Box sx={{ mb: 2 }}>
                          <Controller
                            name='paymentDate'
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                              <CustomDatePicker
                                label={'Payment Date'}
                                fullWidth={true}
                                date={field.value ? new Date(field.value) : null}
                                onChange={field.onChange}
                              />
                            )}
                          />
                        </Box>
                      )}

                      <Controller
                        name='paymentMethod'
                        control={control}
                        rules={{ required: 'Payment Method is required' }}
                        render={({ field, fieldState: { error } }) => (
                          <CustomAutocomplete
                            {...field}
                            getOptionLabel={option => option?.paymentMethod || ''}
                            value={filterPaymentMethods.find(option => option.paymentMethodId === field?.value) || ''}
                            onChange={(e, newValue) => {
                              field.onChange(newValue.paymentMethodId)
                            }}
                            options={filterPaymentMethods || []}
                            renderInput={params => (
                              <CustomTextField
                                id='paymentMethod'
                                {...params}
                                label='Payment Method'
                                sx={{ mb: 2 }}
                                error={Boolean(error)}
                                helperText={error?.message}
                              />
                            )}
                          />
                        )}
                      />
                      <Controller
                        name='paymentReference'
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <CustomTextField {...field} fullWidth label='Payment Reference' />
                        )}
                      />
                    </>
                  ) : null}
                </Box>
              </Grid>
            </Grid>
          </Grid>

          <Dialog
            open={openMsgDialog}
            disableEscapeKeyDown
            maxWidth='md'
            scroll='body'
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
            onClose={(event, reason) => {
              if (reason !== 'backdropClick') {
                handleClose()
              }
            }}
            sx={{ '& .MuiDialog-paper': { overflow: 'visible', p: '20px 0px !important', verticalAlign: 'top' } }}
          >
            <DialogTitle id='alert-dialog-title'>
              <Alert severity='info' sx={{ color: 'rgba(0,0,0,0.8)' }}>
                Paste or enter the information message here.
              </Alert>{' '}
            </DialogTitle>
            <DialogContent sx={{ py: 8 }}>
              <CustomCloseButton onClick={handleClose}>
                <Icon icon='tabler:x' fontSize='1.25rem' />
              </CustomCloseButton>

              <CustomTextField
                multiline
                fullWidth
                minRows={12}
                onChange={e => setMessage(e.target.value)}
                // value={value}
                label='Message'
              />
            </DialogContent>
            <DialogActions className='dialog-actions-dense' sx={{ justifyContent: 'center' }}>
              <Button onClick={handleClose} variant='outlined'>
                Cancel
              </Button>
              <Button onClick={() => handleConfirm(message)} variant='contained'>
                Add All
              </Button>
            </DialogActions>
          </Dialog>

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
      )}
    </>
  )
}
