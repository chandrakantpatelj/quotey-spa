import { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  Divider,
  Typography,
  IconButton,
  Button,
  Grid,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
  TableContainer,
  Table
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import {
  addDecimals,
  greaterThan,
  multiplyDecimals,
  subtractDecimalsWithoutRounding
} from 'src/common-functions/utils/DecimalUtils'
import { getAdornmentConfig, handleDecimalPlaces, NumberFormat } from 'src/common-functions/utils/UtilityFunctions'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import {
  GetItemLedgerBalanceByItemIdQuery,
  GetItemLedgerBalanceByItemIdsQuery
} from 'src/@core/components/graphql/item-queries'
import { fetchData, writeData } from 'src/common-functions/GraphqlOperations'
import { AddOutlined } from '@mui/icons-material'
import { RendorPackageItemData, ViewItemsTableWrapper } from 'src/common-components/CommonPdfDesign'
import { STATUS_DRAFT } from 'src/common-functions/utils/Constants'
import useIsDesktop from 'src/hooks/IsDesktop'
import { createAlert } from 'src/store/apps/alerts'
import { setLoading, setUpdatePurchasePackage } from 'src/store/apps/purchase-packages'
import {
  addItemToPurchaseOrderPackageMutation,
  deleteItemFromPurchaseOrderPackageMutation
} from 'src/@core/components/graphql/purchase-order-packages-queries'

const LineItemFields = {
  itemId: null,
  itemName: '',
  itemCodePrefix: '',
  itemCode: '',
  itemDescription: '',
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
  packedQty: 0,
  packedQtyUom: '',
  purchasePrice: 0,
  subtotal: 0,
  warehouseId: ''
}

function PurchasePackageItemsTable({
  isEdit,
  control,
  setValue,
  getValues,
  purchaseOrder,
  warehouses,
  trigger,
  currency,
  productOptions,
  selectedPackage,
  handleEditPackageItemInput
}) {
  const isDesktop = useIsDesktop()
  const dispatch = useDispatch()

  const tenant = useSelector(state => state.tenants?.selectedTenant) || {}
  const { tenantId = '' } = tenant

  const currencyAdornmentConfig = getAdornmentConfig(currency)

  const { update, remove, append } = useFieldArray({
    control,
    name: 'packageItems',
    rules: {
      required: false
    }
  })
  const packageItems = getValues('packageItems')

  const [totalOrderedQty, setTotalOrderedQty] = useState(0)

  const recalculateTotals = () => {
    let qty = 0
    let packedQty = 0
    let qtyToPack = 0

    let totalPkgValue = 0
    packageItems?.forEach((item, index) => {
      qty = addDecimals(qty, item?.qty)
      packedQty = addDecimals(packedQty, item?.packedQty)
      qtyToPack = addDecimals(qtyToPack, item?.qtyToPack)

      const subtotal = multiplyDecimals(item?.qtyToPack, item?.purchasePrice)

      setValue(`packageItems[${index}].subtotal`, subtotal)

      totalPkgValue = addDecimals(totalPkgValue, subtotal)
    })

    setTotalOrderedQty(qty)

    setValue('totalPackageQty', qtyToPack)
    setValue('totalPackageValue', totalPkgValue)
  }

  useEffect(() => {
    recalculateTotals()
  }, [packageItems])

  const allWarehouses = warehouses

  const initialOptions = useMemo(
    () =>
      packageItems?.map(() =>
        allWarehouses?.map(wh => ({
          ...wh,
          availableQty: 0
        }))
      ),
    [packageItems, allWarehouses]
  )

  const [whOptions, setWhOptions] = useState([])
  const getAvailableQty = async () => {
    const itemIds =
      packageItems?.reduce((ids, item) => {
        if (item?.itemId) {
          ids.push(item?.itemId)
        }
        return ids
      }, []) || []
    setWhOptions(initialOptions)

    try {
      const response = await fetchData(GetItemLedgerBalanceByItemIdsQuery(tenantId, itemIds))
      const state = response?.getItemLedgerBalanceByItemIds

      setWhOptions(prevOptions => {
        const updatedOptions = [...prevOptions]

        packageItems?.map((item, index) => {
          const matchingState = state?.filter(val => item?.itemId === val?.itemId)

          updatedOptions[index] = updatedOptions[index]?.map(obj => {
            const matchingVal = matchingState?.find(val => obj.warehouseId === val.warehouseId)
            return matchingVal ? { ...obj, availableQty: matchingVal.availableQty } : obj
          })

          const findWarehouse = updatedOptions[index]?.find(val => val.warehouseId === item.warehouseId)

          setValue(
            `packageItems[${index}].warehouseId`,
            findWarehouse?.warehouseId || updatedOptions?.[index]?.[0]?.warehouseId || null
          )
          trigger([`packageItems[${index}].warehouseId`])
        })
        return updatedOptions
      })
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  useEffect(() => {
    if (packageItems?.length > 0 && allWarehouses.length > 0) {
      getAvailableQty()
    }
  }, [packageItems, allWarehouses])

  // code for package which is not draft

  const mergedArray = selectedPackage?.packageItems?.map((item, i) => {
    const matchedOrderItem = purchaseOrder?.orderItems?.find(val => val?.itemId === item?.itemId)

    const qty = matchedOrderItem?.qty

    return {
      ...item,
      qty: qty
    }
  })

  const {
    control: packageItemControl,
    setValue: setItemValue,
    watch: watchItems,
    getValues: getItemValues,
    trigger: singleItemTrigger,
    handleSubmit: packageItemOnSubmit
  } = useForm({
    defaultValues: LineItemFields,
    mode: 'onChange'
  })

  const singleItemData = getItemValues()
  let itemId = watchItems('itemId')
  const [showPackageItemInput, setShowPackageItemInput] = useState(false)

  const [showEdit, setShowEdit] = useState({ show: false, index: -1 })

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
        singleItemTrigger(['warehouseId'])

        return options
      })
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  useEffect(() => {
    if (itemId !== null && allWarehouses.length > 0 && showPackageItemInput) {
      getSingleAvailableQty()
    }
  }, [itemId, allWarehouses, showPackageItemInput])

  const handlePackageItemInput = async itemData => {
    dispatch(setLoading(true))

    const packageId = selectedPackage?.packageId
    const { qty, qtyToPack, ...data } = itemData
    const packageItem = { ...data, packedQty: qtyToPack }

    try {
      const response = await writeData(addItemToPurchaseOrderPackageMutation(), { tenantId, packageId, packageItem })

      if (response.addItemToPurchaseOrderPackage) {
        dispatch(setUpdatePurchasePackage(response.addItemToPurchaseOrderPackage))

        dispatch(createAlert({ message: 'Added item to package  successfully !', type: 'success' }))
        // setOpen(false)
      } else {
        dispatch(
          createAlert({
            message: response.errors[0].message || 'Failed to add item in package !',
            type: 'error'
          })
        )
        // setOpen(false)
      }
      return response
    } catch (error) {
      console.error('error: ', error)
    } finally {
      dispatch(setLoading(false))
    }
  }

  const handlePackageItemSubmit = itemData => {
    showPackageItemInput && handlePackageItemInput(itemData)
    showEdit?.show && handleEditPackageItemInput(itemData)
  }

  const handleDeletePackageItemInput = async orderItem => {
    dispatch(setLoading(true))

    const packageId = selectedPackage?.packageId

    const itemId = orderItem?.itemId
    const warehouseId = orderItem?.warehouseId

    try {
      const response = await writeData(deleteItemFromPurchaseOrderPackageMutation(), {
        tenantId,
        packageId,
        itemId,
        warehouseId
      })

      if (response.deleteItemFromPurchaseOrderPackage) {
        dispatch(setUpdatePurchasePackage(response.deleteItemFromPurchaseOrderPackage))
        dispatch(createAlert({ message: 'deleted item of package  successfully !', type: 'success' }))
        // setOpen(false)
      } else {
        dispatch(
          createAlert({
            message: response.errors[0].message || 'Failed to delete item of package !',
            type: 'error'
          })
        )
        // setOpen(false)
      }
      return response
    } catch (error) {
      console.error('error: ', error)
    } finally {
      dispatch(setLoading(false))
    }
  }

  return (
    <>
      {isEdit && selectedPackage?.status !== STATUS_DRAFT ? (
        <form onSubmit={packageItemOnSubmit(handlePackageItemSubmit)}>
          <ViewItemsTableWrapper>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '3%' }}>#</TableCell>
                <TableCell sx={{ width: '34%' }}>Item</TableCell>
                {isDesktop ? <TableCell sx={{ width: '12%' }}>Ordered Qty</TableCell> : null}
                {/* {isDesktop && mergedArray?.some(item => item?.warehouseId && item?.warehouseId !== '') && ( */}
                {isDesktop ? <TableCell sx={{ width: '12%' }}>Warehouse</TableCell> : null}
                {/* )} */}
                <TableCell sx={{ textAlign: 'center', width: '12%' }}>Packed Qty</TableCell>
                {isDesktop ? <TableCell sx={{ width: '12%' }}>Purchase Price</TableCell> : null}
                <TableCell sx={{ width: '12%' }}>Subtotal</TableCell>
                <TableCell sx={{ width: '12%' }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mergedArray?.length > 0 ? (
                mergedArray.map((orderItem, index) => {
                  const warehouse = warehouses.find(item => item?.warehouseId == orderItem?.warehouseId) || {}

                  return (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography variant='h6' sx={{ fontSize: '11px', fontWeight: 500, lineHeight: '20px' }}>
                          {index + 1}
                        </Typography>
                      </TableCell>
                      <RendorPackageItemData index={index} orderItem={orderItem} showData={true} />

                      {isDesktop ? (
                        <TableCell>
                          {orderItem?.qty?.toFixed(2)} {orderItem?.packedQtyUom}
                        </TableCell>
                      ) : null}
                      {isDesktop ? <TableCell>{warehouse?.name}</TableCell> : null}

                      <TableCell sx={{ textAlign: 'center !important' }}>
                        {showEdit?.show && showEdit?.index === index ? (
                          <Controller
                            name='qtyToPack'
                            control={packageItemControl}
                            rules={{
                              required: 'Qty To Pack is required'
                            }}
                            render={({ field, fieldState: { error } }) => (
                              <CustomTextField
                                {...field}
                                value={field?.value}
                                onChange={e => {
                                  const value = e.target.value
                                  const formattedValue = handleDecimalPlaces(value)
                                  field.onChange(formattedValue)
                                  setItemValue('itemId', orderItem?.itemId)
                                  setItemValue('itemCodePrefix', orderItem?.itemCodePrefix)
                                  setItemValue('itemCode', orderItem?.itemCode)
                                  setItemValue('itemName', orderItem?.itemName)
                                  setItemValue('itemDescription', orderItem?.itemDescription)
                                  setItemValue('itemDimension', orderItem?.itemDimension)
                                  setItemValue('packingUnit', orderItem?.packingUnit)
                                  setItemValue('qty', orderItem?.qty)
                                  setItemValue('packedQtyUom', orderItem?.packedQtyUom)
                                  setItemValue('qtyToPack', formattedValue)
                                  setItemValue('warehouseId', orderItem?.warehouseId)
                                  setItemValue('purchasePrice', orderItem?.purchasePrice)
                                  const subtotal = multiplyDecimals(formattedValue, orderItem?.purchasePrice)
                                  setItemValue('subtotal', parseFloat(subtotal).toFixed(2))
                                }}
                                label='Qty to Pack'
                                fullWidth
                                error={Boolean(error)}
                                helperText={error?.message}
                              />
                            )}
                          />
                        ) : (
                          orderItem?.packedQty?.toFixed(2)
                        )}
                      </TableCell>
                      {isDesktop ? (
                        <TableCell>
                          <NumberFormat value={orderItem?.purchasePrice} currency={currency} />
                        </TableCell>
                      ) : null}

                      {showEdit?.show && showEdit?.index === index ? (
                        <Controller
                          name='subtotal'
                          control={packageItemControl}
                          render={({ field }) => (
                            <TableCell>
                              <NumberFormat value={field?.value} currency={currency} />
                            </TableCell>
                          )}
                        />
                      ) : (
                        <TableCell>
                          <NumberFormat value={orderItem?.subtotal} currency={currency} />
                        </TableCell>
                      )}

                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton
                            size='small'
                            variant='outlined'
                            onClick={() => {
                              setShowEdit({ show: true, index: index })
                            }}
                            disabled={orderItem?.qty === orderItem?.packedQty}
                          >
                            <Icon icon='tabler:edit' style={{ fontSize: '20px' }} />
                          </IconButton>
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                            <IconButton
                              size='small'
                              variant='outlined'
                              color='error'
                              onClick={() => {
                                handleDeletePackageItemInput(orderItem)
                              }}
                            >
                              <Icon icon='mingcute:delete-2-line' style={{ fontSize: '20px' }} />
                            </IconButton>
                          </Box>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7}>
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
          {showPackageItemInput ? (
            <>
              <Box sx={{ py: 1, mt: 2, mb: 3 }}>
                <Grid container spacing={{ xs: 2 }}>
                  <Grid item xs={12} md={4} order={{ xs: 1, md: 1 }}>
                    <Controller
                      name='itemId'
                      control={packageItemControl}
                      rules={{ required: 'Item Name is required' }}
                      render={({ field, fieldState: { error } }) => (
                        <CustomAutocomplete
                          {...field}
                          value={singleItemData}
                          options={productOptions || []}
                          getOptionLabel={option => option?.itemName || ''}
                          isOptionEqualToValue={(option, value) => option.itemId === value.itemId}
                          renderOption={(props, option) => {
                            return (
                              <li {...props} key={option?.itemId}>
                                {option?.itemCode}-{option?.itemName || ''}
                              </li>
                            )
                          }}
                          onChange={(event, newValue) => {
                            setItemValue('itemId', newValue?.itemId)
                            setItemValue('itemCodePrefix', newValue?.itemCodePrefix)
                            setItemValue('itemCode', newValue?.itemCode)
                            setItemValue('itemName', newValue?.itemName)
                            setItemValue('itemDescription', newValue?.itemDescription)
                            setItemValue('itemDimension', newValue?.itemDimension)
                            setItemValue('packingUnit', newValue?.packingUnit)
                            setItemValue('qty', newValue?.qty)
                            setItemValue('packedQty', newValue?.totalPackedQty)
                            setItemValue('packedQtyUom', newValue?.uom)
                            setItemValue('purchasePrice', newValue?.purchasePrice)

                            const qtyToPack = parseFloat(
                              subtractDecimalsWithoutRounding(newValue?.qty || 0, newValue?.totalPackedQty || 0)
                            )
                            setItemValue('qtyToPack', qtyToPack)
                            const subtotal = multiplyDecimals(qtyToPack, newValue?.purchasePrice)

                            setItemValue('subtotal', parseFloat(subtotal).toFixed(2))

                            singleItemTrigger(['itemId', 'warehouseId'])
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
                  <Grid item xs={4} md={1.5} order={{ xs: 2, md: 2 }}>
                    <Controller
                      name='qty'
                      control={packageItemControl}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          value={
                            singleItemData?.qty != null
                              ? `${singleItemData.qty}
                                      (${singleItemData.packedQtyUom})`
                              : 0
                          }
                          fullWidth
                          label='Ordered Qty'
                          disabled
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={4} md={1.5} order={{ xs: 3, md: 3 }}>
                    <Controller
                      name='packedQty'
                      control={packageItemControl}
                      render={({ field }) => (
                        <CustomTextField {...field} value={field?.value} fullWidth label='Packed Qty' disabled />
                      )}
                    />
                  </Grid>
                  <Grid item xs={4} md={1.5} order={{ xs: 4, md: 4 }}>
                    <Controller
                      name='qtyToPack'
                      control={packageItemControl}
                      rules={{
                        required: 'Qty To Pack is required'
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <CustomTextField
                          {...field}
                          value={field?.value}
                          onChange={e => {
                            const value = e.target.value
                            const formattedValue = handleDecimalPlaces(value)
                            field.onChange(formattedValue)
                            setItemValue(`qtyToPack`, formattedValue)

                            const purchasePrice = getItemValues('purchasePrice')
                            const subtotal = multiplyDecimals(formattedValue, purchasePrice)
                            setItemValue('subtotal', parseFloat(subtotal).toFixed(2))
                          }}
                          label='Qty to pack'
                          fullWidth
                          error={Boolean(error)}
                          helperText={error?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6} md={1.5} order={{ xs: 5, md: 5 }}>
                    <Controller
                      name='purchasePrice'
                      control={packageItemControl}
                      render={({ field }) => (
                        <CustomTextField {...field} value={field?.value} fullWidth label='purchasePrice' disabled />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6} md={2} order={{ xs: 6, md: 6 }}>
                    <Controller
                      name='subtotal'
                      control={packageItemControl}
                      render={({ field }) => (
                        <CustomTextField {...field} value={field?.value} fullWidth label='Subtotal' disabled />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={8} order={{ xs: 8, md: 7 }}>
                    <Controller
                      name='itemDescription'
                      control={packageItemControl}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          multiline
                          fullWidth
                          minRows={1}
                          value={field?.value}
                          disabled
                          label='Description'
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={4} order={{ xs: 7, md: 8 }}>
                    <Controller
                      name='warehouseId'
                      control={packageItemControl}
                      rules={{
                        required: 'Please select warehouse',
                        validate: value => {
                          const filterItems = packageItems?.filter(val => val?.itemId === itemId) || []
                          if (
                            greaterThan(filterItems?.length, 1) &&
                            !filterItems?.some(obj => obj?.warehouseId !== value)
                          ) {
                            return 'This warehouse is already selected for this item'
                          }
                          return true
                        }
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
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button type='submit' color='primary' variant='contained' sx={{ mt: 3, mb: 4, ml: '6px' }}>
                  Save
                </Button>
                <Button
                  color='primary'
                  variant='outlined'
                  sx={{ mt: 3, mb: 4, ml: '6px' }}
                  onClick={() => setShowPackageItemInput(false)}
                >
                  Cancel
                </Button>
              </Box>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 2, mt: 3, mb: 4, ml: '6px' }}>
              {showEdit?.show ? (
                <>
                  <Button type='submit' color='primary' variant='contained'>
                    Save
                  </Button>
                  <Button
                    color='primary'
                    variant='outlined'
                    onClick={() => {
                      setShowEdit({ show: false, index: -1 })
                    }}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    color='primary'
                    variant='contained'
                    startIcon={<AddOutlined />}
                    onClick={() => setShowPackageItemInput(true)}
                    disabled={productOptions?.length < 1}
                  >
                    Add New
                  </Button>
                  {showPackageItemInput && (
                    <Button color='primary' variant='outlined' onClick={() => setShowPackageItemInput(false)}>
                      Cancel
                    </Button>
                  )}
                </>
              )}
            </Box>
          )}
        </form>
      ) : (
        <>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 3 }}>
            <Typography sx={{ fontSize: '15px', fontWeight: 500, lineHeight: '40px' }}>Items </Typography>
          </Box>
          {packageItems?.length > 0
            ? packageItems?.map((item, index) => {
                return (
                  <Box sx={{ py: 1, mb: 2 }} key={item?.index}>
                    <Grid container spacing={{ xs: 2 }}>
                      <Grid item xs={11} sm={11}>
                        <Grid container spacing={{ xs: 2 }}>
                          <Grid item xs={12} md={4.5} order={{ xs: 1, md: 1 }}>
                            <Controller
                              name={`packageItems[${index}].itemId`}
                              control={control}
                              rules={{ required: 'Item Name is required' }}
                              render={({ field, fieldState: { error } }) => (
                                <CustomAutocomplete
                                  {...field}
                                  value={item}
                                  options={productOptions || []}
                                  getOptionLabel={option => option?.itemName || ''}
                                  isOptionEqualToValue={(option, value) => option.itemId === value.itemId}
                                  renderOption={(props, option) => {
                                    return (
                                      <li {...props} key={option?.itemId}>
                                        {option?.itemCode}-{option?.itemName || ''}
                                      </li>
                                    )
                                  }}
                                  onChange={(event, newValue) => {
                                    setValue(`packageItems[${index}].itemId`, newValue?.itemId)
                                    setValue(`packageItems[${index}].itemCode`, newValue?.itemCode)
                                    setValue(`packageItems[${index}].itemCodePrefix`, newValue?.itemCodePrefix)
                                    setValue(`packageItems[${index}].itemName`, newValue?.itemName)
                                    setValue(`packageItems[${index}].itemDescription`, newValue?.itemDescription)
                                    setValue(`packageItems[${index}].itemDimension`, newValue?.itemDimension)
                                    setValue(`packageItems[${index}].packingUnit`, newValue?.packingUnit)
                                    setValue(`packageItems[${index}].qty`, newValue?.qty)
                                    setValue(`packageItems[${index}].packedQty`, newValue?.totalPackedQty)
                                    setValue(`packageItems[${index}].packedQtyUom`, newValue?.uom)
                                    setValue(`packageItems[${index}].purchasePrice`, newValue?.purchasePrice)
                                    setValue(`packageItems[${index}].subtotal`, newValue?.subtotal)

                                    const qtyToPack = subtractDecimalsWithoutRounding(
                                      item?.qty || 0,
                                      item?.totalPackedQty || 0
                                    )
                                    setValue(`packageItems[${index}].qtyToPack`, parseFloat(qtyToPack))
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
                          <Grid item xs={4} md={1.5} order={{ xs: 2, md: 2 }}>
                            <Controller
                              name={`packageItems[${index}].qty`}
                              control={control}
                              render={({ field }) => (
                                <CustomTextField
                                  value={`${item?.qty}(${item?.packedQtyUom})`}
                                  fullWidth
                                  label='Ordered Qty'
                                  disabled
                                />
                              )}
                            />
                          </Grid>
                          <Grid item xs={4} md={1.5} order={{ xs: 3, md: 3 }}>
                            <Controller
                              name={`packageItems[${index}].packedQty`}
                              control={control}
                              render={({ field }) => (
                                <CustomTextField
                                  {...field}
                                  value={item?.packedQty}
                                  fullWidth
                                  label='Packed Qty'
                                  disabled
                                />
                              )}
                            />
                          </Grid>
                          <Grid item xs={4} md={1.5} order={{ xs: 4, md: 4 }}>
                            <Controller
                              name={`packageItems[${index}].purchasePrice`}
                              control={control}
                              render={({ field }) => (
                                <CustomTextField
                                  {...field}
                                  value={item?.purchasePrice}
                                  fullWidth
                                  label='Purchase Price'
                                  disabled
                                />
                              )}
                            />
                          </Grid>
                          <Grid item xs={6} md={1.5} order={{ xs: 5, md: 5 }}>
                            <Controller
                              name={`packageItems[${index}].qtyToPack`}
                              control={control}
                              rules={{
                                required: 'Qty to pack is required',
                                validate: value => {
                                  if (Number(value) <= 0) {
                                    return 'Qty should be greater than zero'
                                  }
                                  if (
                                    greaterThan(
                                      value,
                                      subtractDecimalsWithoutRounding(
                                        packageItems[index].qty || 0,
                                        packageItems[index].packedQty || 0
                                      )
                                    )
                                  ) {
                                    return 'Entered quantity cannot exceed the remaining quantity to be packed.'
                                  }
                                  return true
                                }
                              }}
                              render={({ field, fieldState: { error } }) => (
                                <CustomTextField
                                  value={item?.qtyToPack}
                                  onChange={e => {
                                    const value = e.target.value
                                    const formattedValue = handleDecimalPlaces(value)
                                    field.onChange(formattedValue)
                                    update(`packageItems[${index}].qtyToPack`, formattedValue)
                                  }}
                                  label='Quantity To Pack'
                                  fullWidth
                                  error={Boolean(error)}
                                  helperText={error?.message}
                                />
                              )}
                            />
                          </Grid>
                          <Grid item xs={6} md={1.5} order={{ xs: 6, md: 6 }}>
                            <Controller
                              name={`packageItems[${index}].subtotal`}
                              control={control}
                              render={({ field }) => (
                                <CustomTextField
                                  {...field}
                                  value={item?.subtotal}
                                  fullWidth
                                  label='Subtotal'
                                  disabled
                                />
                              )}
                            />
                          </Grid>
                          <Grid item xs={12} md={9} order={{ xs: 8, md: 7 }}>
                            <Controller
                              name={`packageItems[${index}].itemDescription`}
                              control={control}
                              render={({ field }) => (
                                <CustomTextField
                                  {...field}
                                  multiline
                                  fullWidth
                                  minRows={1}
                                  value={item?.itemDescription}
                                  disabled
                                  label='Description'
                                  sx={{ mb: '10px' }}
                                />
                              )}
                            />{' '}
                          </Grid>
                          <Grid item xs={12} md={3} order={{ xs: 7, md: 8 }}>
                            <Controller
                              name={`packageItems[${index}].warehouseId`}
                              control={control}
                              rules={{
                                required: 'Please select warehouse',
                                validate: value => {
                                  const filterItems = packageItems?.filter(val => val?.itemId === item?.itemId) || []
                                  if (
                                    greaterThan(filterItems?.length, 1) &&
                                    !filterItems?.some(obj => obj?.warehouseId !== value)
                                  ) {
                                    return 'This warehouse is already selected for this item'
                                  }
                                  return true
                                }
                              }}
                              render={({ field, fieldState: { error } }) => (
                                <CustomAutocomplete
                                  {...field}
                                  options={whOptions[index] || []}
                                  getOptionLabel={option => {
                                    if (typeof option === 'string') {
                                      return option
                                    } else return `${option?.name}(${option?.availableQty || 0})`
                                  }}
                                  value={whOptions[index]?.find(option => option.warehouseId === field.value) || {}}
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
                      <Grid item xs={1} sm={1}>
                        {packageItems?.length !== 1 && (
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
                      </Grid>
                    </Grid>
                  </Box>
                )
              })
            : null}

          <Button
            disabled={productOptions?.length < 1}
            color='primary'
            variant='contained'
            startIcon={<AddOutlined />}
            sx={{ mt: 3, mb: 4, ml: '6px' }}
            onClick={() => {
              append({ ...LineItemFields })
            }}
          >
            Add New
          </Button>
          <Divider variant='fullWidth' orientation='horizontal' sx={{ display: 'block', mb: 8 }} />
          <Grid
            container
            direction={{ xs: 'column-reverse', md: 'row' }}
            sx={{ alignItems: { xs: 'flex-end', md: 'flex-start' } }}
            spacing={{ xs: 6, md: 8, xl: 8 }}
          >
            <Grid item xs={12} sm={12} md={8.5} lg={7.5} xl={8} sx={{ width: '100%' }}>
              <Box component='div' sx={{ width: '100%' }}>
                <Controller
                  name='notes'
                  control={control}
                  rules={{ required: false }}
                  render={({ field }) => <CustomTextField fullWidth label='Notes' {...field} value={field.value} />}
                />
              </Box>
            </Grid>
            <Grid item xs={6} sm={6} md={3.5} lg={3.5} xl={4}>
              <CustomTextField disabled label='Total Ordered Qty' fullWidth value={totalOrderedQty} sx={{ mb: 3 }} />

              <Controller
                name='totalPackageQty'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    value={field?.value}
                    InputProps={{
                      disabled: true
                    }}
                    label='Total Package Qty'
                    fullWidth
                    sx={{ mb: 3 }}
                  />
                )}
              />
              <Controller
                name='totalPackageValue'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    value={field?.value}
                    InputProps={{
                      disabled: true,
                      ...currencyAdornmentConfig
                    }}
                    label='Total Package Value'
                    fullWidth
                  />
                )}
              />
            </Grid>
          </Grid>
        </>
      )}
    </>
  )
}

export default PurchasePackageItemsTable
