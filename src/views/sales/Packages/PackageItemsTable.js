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
  Typography
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import {
  GetItemLedgerBalanceByItemIdQuery,
  GetItemLedgerBalanceByItemIdsQuery
} from 'src/@core/components/graphql/item-queries'
import {
  addItemToSalesOrderPackageMutation,
  deleteItemFromSalesOrderPackageMutation
} from 'src/@core/components/graphql/sales-order-package-queries'
import Icon from 'src/@core/components/icon'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'
import { RendorSalesItemData, ViewItemsTableWrapper } from 'src/common-components/CommonPdfDesign'
import { fetchData, writeData } from 'src/common-functions/GraphqlOperations'
import { STATUS_DRAFT } from 'src/common-functions/utils/Constants'
import {
  addDecimalsWithoutRounding,
  greaterThan,
  subtractDecimalsWithoutRounding
} from 'src/common-functions/utils/DecimalUtils'
import { generateId, handleDecimalPlaces } from 'src/common-functions/utils/UtilityFunctions'
import useWarehouses from 'src/hooks/getData/useWarehouses'
import useIsDesktop from 'src/hooks/IsDesktop'
import { createAlert } from 'src/store/apps/alerts'
import { setLoading, setUpdatePackage } from 'src/store/apps/packages'

const LineItemFields = {
  lineItemId: generateId(),
  itemId: null,
  itemName: '',
  itemCodePrefix: '',
  itemCode: '',
  itemGroup: '',
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
  packedQtyUom: '',
  qty: 0,
  packedQty: 0,
  qtyToPack: 0,
  warehouseId: ''
}

function PackageItemsTable({
  isEdit,
  control,
  setValue,
  getValues,
  trigger,
  products,
  productOptions,
  selectedPackage
}) {
  const isDesktop = useIsDesktop()
  const dispatch = useDispatch()
  const tenant = useSelector(state => state.tenants?.selectedTenant) || {}
  const { tenantId = '' } = tenant
  const { warehouses } = useWarehouses(tenantId)

  const [showPackageItemInput, setShowPackageItemInput] = useState(false)

  const {
    control: packageItemControl,
    setValue: setItemValue,
    watch: watchItems,
    getValues: getItemValues,
    trigger: singleItemTrigger,
    handleSubmit: handlePackageItemSubmit,
    reset
  } = useForm({
    defaultValues: LineItemFields,
    mode: 'onChange'
  })

  const singleItemData = getItemValues()

  const { update, remove, append } = useFieldArray({
    control,
    name: 'packageItems',
    rules: {
      required: false
    }
  })
  let packageItems = getValues('packageItems')
  console.log('packageItems', packageItems)
  const [totalOrderedQty, setTotalOrderedQty] = useState(0)
  const [totalPackedQty, setTotalPackedQty] = useState(0)
  const [totalQtyPack, setTotalQtyPack] = useState(0)

  const recalculateTotals = () => {
    let qty = 0
    let packedQty = 0
    let qtyToPack = 0
    packageItems?.forEach(item => {
      qty = addDecimalsWithoutRounding(qty, item?.qty)
      packedQty = addDecimalsWithoutRounding(packedQty, item?.packedQty)
      qtyToPack = addDecimalsWithoutRounding(qtyToPack, item?.qtyToPack)
    })

    setTotalOrderedQty(qty)
    setTotalPackedQty(packedQty)
    setTotalQtyPack(qtyToPack)
  }

  useEffect(() => {
    recalculateTotals()
  }, [packageItems])

  const initialOptions = useMemo(
    () =>
      packageItems?.map(() =>
        warehouses?.map(wh => ({
          ...wh,
          availableQty: 0
        }))
      ),
    [packageItems, warehouses]
  )
  const [whOptions, setWhOptions] = useState([])

  const getAvailableQty = async () => {
    const itemIds =
      packageItems?.reduce((ids, item) => {
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

        packageItems?.forEach((item, index) => {
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
    } finally {
      // setItemsLoader(false);
    }
  }

  useEffect(() => {
    if (packageItems?.length > 0 && warehouses.length > 0) {
      getAvailableQty()
    }
  }, [packageItems, warehouses, initialOptions])

  let itemId = watchItems('itemId')

  const [singleWhOptions, setSingleWhOptions] = useState([])

  const getSingleAvailableQty = async () => {
    setSingleWhOptions(
      warehouses?.map(wh => ({
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
    // if (itemId !== null && warehouses.length > 0) {
    getSingleAvailableQty()
    // }
  }, [itemId, warehouses])

  const handlePackageItemInput = async itemData => {
    dispatch(setLoading(true))
    const packageId = selectedPackage?.packageId
    const { qty, qtyToPack, ...data } = itemData
    console.log('itemData', itemData)
    const packageItem = { ...data, packedQty: qtyToPack }

    try {
      const response = await writeData(addItemToSalesOrderPackageMutation(), { tenantId, packageId, packageItem })

      if (response.addItemToSalesOrderPackage) {
        dispatch(setUpdatePackage(response.addItemToSalesOrderPackage))
        dispatch(createAlert({ message: 'Added item to package  successfully !', type: 'success' }))
      } else {
        dispatch(
          createAlert({
            message: response.errors[0].message || 'Failed to add item in package !',
            type: 'error'
          })
        )
      }
      return response
    } catch (error) {
      console.log('error: ', error)
    } finally {
      setTimeout(() => {
        dispatch(setLoading(false))
      }, 1000)
    }
  }

  const handleDeletePackageItemInput = async orderItem => {
    dispatch(setLoading(true))
    const packageId = selectedPackage?.packageId
    const lineItemId = orderItem?.lineItemId
    const itemId = orderItem?.itemId
    const warehouseId = orderItem?.warehouseId

    try {
      const response = await writeData(deleteItemFromSalesOrderPackageMutation(), {
        tenantId,
        packageId,
        lineItemId,
        itemId,
        warehouseId
      })

      if (response.deleteItemFromSalesOrderPackage) {
        dispatch(setUpdatePackage(response.deleteItemFromSalesOrderPackage))
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
      console.log('error: ', error)
    } finally {
      dispatch(setLoading(false))
    }
  }

  return (
    <>
      {isEdit && selectedPackage?.status !== STATUS_DRAFT ? (
        <>
          <ViewItemsTableWrapper>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '3%' }}>#</TableCell>
                <TableCell sx={{ width: '34%' }}>Item</TableCell>
                {isDesktop ? <TableCell sx={{ width: '16%' }}>Dimensions</TableCell> : null}
                <TableCell sx={{ width: '12%' }}>Ordered Qty</TableCell>
                {isDesktop ? <TableCell sx={{ width: '12%' }}>Warehouse</TableCell> : null}
                <TableCell sx={{ width: '12%' }}>Packed Qty</TableCell>
                <TableCell sx={{ width: '12%' }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {packageItems?.length > 0 ? (
                packageItems?.map((orderItem, index) => {
                  const item = products?.find(item => item?.itemId === orderItem?.itemId)

                  const warehouse = warehouses.find(item => item?.warehouseId === orderItem?.warehouseId) || {}
                  return (
                    <TableRow key={orderItem?.lineItemId}>
                      <TableCell>
                        <Typography variant='h6' sx={{ fontSize: '11px', fontWeight: 500, lineHeight: '20px' }}>
                          {index + 1}
                        </Typography>
                      </TableCell>
                      <RendorSalesItemData index={index} orderItem={orderItem} showData={false} />
                      {isDesktop ? (
                        <TableCell>
                          {item?.enablePackingUnit ? (
                            <>
                              <div>
                                {orderItem?.packingUnit?.qtyPerUnit}{' '}
                                <span style={{ fontSize: '11px' }}>
                                  {' '}
                                  ({orderItem?.packedQtyUom}/{orderItem?.packingUnit?.unit})
                                </span>
                              </div>
                              <span style={{ display: 'block', textAlign: 'center' }}>
                                Qty: {orderItem?.packingUnit?.qty}
                              </span>
                            </>
                          ) : item?.enableDimension ? (
                            <>
                              {item?.dimensions?.length !== null && orderItem?.itemDimension?.length}{' '}
                              {item?.dimensions?.width !== null && (
                                <>
                                  <span style={{ color: '#818181' }}>×</span>
                                  {orderItem?.itemDimension?.width}
                                </>
                              )}
                              {item?.dimensions?.height !== null && (
                                <>
                                  <span style={{ color: '#818181' }}>×</span>
                                  {orderItem?.itemDimension?.height}
                                </>
                              )}
                              <span style={{ display: 'block', textAlign: 'center' }}>
                                Qty: {orderItem?.itemDimension?.qty}
                              </span>
                            </>
                          ) : (
                            <>
                              {orderItem?.packedQtyUom === 'm2' && (
                                <>
                                  {orderItem?.itemDimension?.length} <span style={{ color: '#818181' }}>×</span>{' '}
                                  {orderItem?.itemDimension?.width}{' '}
                                  <span style={{ display: 'block', textAlign: 'center' }}>
                                    Qty: {orderItem?.itemDimension?.qty}
                                  </span>
                                </>
                              )}
                              {orderItem?.packedQtyUom === 'm3' && (
                                <>
                                  {orderItem?.itemDimension?.length} <span style={{ color: '#818181' }}>×</span>{' '}
                                  {orderItem?.itemDimension?.width} <span style={{ color: '#818181' }}>×</span>{' '}
                                  {orderItem?.itemDimension?.height}
                                  <span style={{ display: 'block', textAlign: 'center' }}>
                                    Qty: {orderItem?.itemDimension?.qty}
                                  </span>
                                </>
                              )}
                              {orderItem?.packedQtyUom !== 'm2' && orderItem?.packedQtyUom !== 'm3' && (
                                <> Qty: {orderItem?.itemDimension?.qty} </>
                              )}
                            </>
                          )}
                        </TableCell>
                      ) : null}
                      <TableCell>
                        {orderItem?.qty} {orderItem?.packedQtyUom}
                      </TableCell>{' '}
                      {isDesktop ? <TableCell>{warehouse?.name}</TableCell> : null}
                      {/* {isDesktop ? <TableCell>{orderItem?.unit}</TableCell> : null} */}
                      <TableCell>{orderItem?.packedQty}</TableCell>
                      <TableCell>
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
            <form onSubmit={handlePackageItemSubmit(handlePackageItemInput)}>
              <Box sx={{ py: 1, mt: 2, mb: 3 }}>
                <Grid container spacing={{ xs: 2 }}>
                  <Grid item xs={11} lg={11.5}>
                    <Grid container spacing={{ xs: 2 }}>
                      <Grid item xs={12} md={6} order={{ xs: 1, md: 1 }}>
                        <Controller
                          name='lineItemId'
                          control={packageItemControl}
                          rules={{ required: 'Item Name is required' }}
                          render={({ field, fieldState: { error } }) => (
                            <CustomAutocomplete
                              {...field}
                              value={singleItemData}
                              options={productOptions || []}
                              getOptionLabel={option => option?.itemName || ''}
                              isOptionEqualToValue={(option, value) => option.lineItemId === value.lineItemId}
                              renderOption={(props, option) => {
                                return (
                                  <li {...props} key={option?.itemId}>
                                    {option?.itemCode}-{option?.itemName || ''}
                                  </li>
                                )
                              }}
                              onChange={(event, newValue) => {
                                console.log('newValue', newValue)
                                setItemValue('itemId', newValue?.itemId)
                                setItemValue('itemCodePrefix', newValue?.itemCodePrefix)
                                setItemValue('itemCode', newValue?.itemCode)
                                setItemValue('itemName', newValue?.itemName)
                                setItemValue('itemDescription', newValue?.itemDescription)
                                setItemValue('itemDimension', newValue?.itemDimension)
                                setItemValue('packingUnit', newValue?.packingUnit)
                                setItemValue('qty', newValue?.qty)
                                setItemValue('itemGroup', newValue?.itemGroup)
                                setItemValue('packedQtyUom', newValue?.uom)
                                setItemValue('packedQty', newValue?.totalPackedQty)

                                const qtyToPack = subtractDecimalsWithoutRounding(
                                  newValue?.qty || 0,
                                  newValue?.totalPackedQty || 0
                                )
                                setItemValue('qtyToPack', parseFloat(qtyToPack))

                                singleItemTrigger(['warehouseId'])
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
                      <Grid item xs={4} md={2} order={{ xs: 2, md: 2 }}>
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

                      <Grid item xs={4} md={2} order={{ xs: 3, md: 3 }}>
                        <Controller
                          name='packedQty'
                          control={packageItemControl}
                          render={({ field }) => (
                            <CustomTextField {...field} value={field?.value} fullWidth label='Packed Qty' disabled />
                          )}
                        />
                      </Grid>
                      <Grid item xs={4} md={2} order={{ xs: 4, md: 4 }}>
                        <Controller
                          name='qtyToPack'
                          control={packageItemControl}
                          rules={{
                            required: 'Qty To Pack is required',
                            validate: value => {
                              if (Number(value) <= 0) {
                                return 'Qty should be greater than zero'
                              }
                              if (
                                greaterThan(
                                  value,
                                  subtractDecimalsWithoutRounding(
                                    singleItemData.qty || 0,
                                    singleItemData.packedQty || 0
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
                              {...field}
                              value={field?.value}
                              onChange={e => {
                                const value = e.target.value
                                const formattedValue = handleDecimalPlaces(value)
                                field.onChange(formattedValue)
                                setItemValue(`qtyToPack`, formattedValue)
                              }}
                              label='Quantity to pack'
                              fullWidth
                              error={Boolean(error)}
                              helperText={error?.message}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={8} order={{ xs: 6, md: 5 }}>
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
                      <Grid item xs={12} md={4} order={{ xs: 5, md: 6 }}>
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
                  </Grid>
                  <Grid item xs={1} lg={0.5}>
                    <IconButton
                      variant='outlined'
                      color='error'
                      sx={{ fontSize: '20px' }}
                      onClick={() => setShowPackageItemInput(false)}
                    >
                      <Icon icon='mingcute:delete-2-line' />
                    </IconButton>
                  </Grid>
                </Grid>
              </Box>
              <Button
                type='submit'
                color='primary'
                variant='contained'
                // startIcon={<AddOutlined />}
                sx={{ mt: 3, mb: 4, ml: '6px' }}
              >
                Save
              </Button>
              <Button
                color='primary'
                variant='outlined'
                sx={{ mt: 3, mb: 4, ml: '6px' }}
                onClick={() => {
                  reset()
                  setShowPackageItemInput(false)
                }}
              >
                Cancel
              </Button>
            </form>
          ) : (
            <Button
              color='primary'
              variant='contained'
              startIcon={<AddOutlined />}
              sx={{ mt: 3, mb: 4, ml: '6px' }}
              onClick={() => setShowPackageItemInput(true)}
            >
              Add New
            </Button>
          )}
        </>
      ) : (
        <>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 3 }}>
            <Typography sx={{ fontSize: '15px', fontWeight: 500, lineHeight: '40px' }}>Items </Typography>
          </Box>
          {packageItems?.length > 0
            ? packageItems?.map((item, index) => {
                return (
                  <Box sx={{ py: 1, mb: 2 }} key={item?.lineItemId}>
                    <Grid container spacing={{ xs: 2 }}>
                      <Grid item xs={10} lg={11}>
                        <Grid container spacing={{ xs: 2 }}>
                          <Grid item xs={12} md={6} order={{ xs: 1, md: 1 }}>
                            <Controller
                              name={`packageItems[${index}].lineItemId`}
                              control={control}
                              rules={{ required: 'Item Name is required' }}
                              render={({ field, fieldState: { error } }) => (
                                <CustomAutocomplete
                                  {...field}
                                  value={item}
                                  options={productOptions || []}
                                  getOptionLabel={option => option?.itemName || ''}
                                  isOptionEqualToValue={(option, value) => option.lineItemId === value.lineItemId}
                                  renderOption={(props, option) => {
                                    return (
                                      <li {...props} key={option?.itemId}>
                                        {option?.itemCode}-{option?.itemName || ''}
                                      </li>
                                    )
                                  }}
                                  onChange={(event, newValue) => {
                                    console.log('newValue', newValue)

                                    setValue(`packageItems[${index}].itemId`, newValue?.itemId)
                                    setValue(`packageItems[${index}].itemCode`, newValue?.itemId)
                                    setValue(`packageItems[${index}].itemCodePrefix`, newValue?.itemCodePrefix)
                                    setValue(`packageItems[${index}].itemName`, newValue?.itemName)
                                    setValue(`packageItems[${index}].itemDescription`, newValue?.itemDescription)
                                    setValue(`packageItems[${index}].itemDimension`, newValue?.itemDimension)
                                    setValue(`packageItems[${index}].packingUnit`, newValue?.packingUnit)
                                    setValue(`packageItems[${index}].qty`, newValue?.qty)
                                    setValue(`packageItems[${index}].itemGroup`, newValue?.itemGroup)
                                    setValue(`packageItems[${index}].packedQty`, newValue?.totalPackedQty)
                                    setValue(`packageItems[${index}].packedQtyUom`, newValue?.uom)

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
                          <Grid item xs={4} md={2} order={{ xs: 2, md: 2 }}>
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
                          <Grid item xs={4} md={2} order={{ xs: 3, md: 3 }}>
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
                          <Grid item xs={4} md={2} order={{ xs: 4, md: 4 }}>
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
                                    return 'Qty should be less than or equal to Ordered Qty'
                                  }
                                  return true
                                }
                              }}
                              render={({ field, fieldState: { error } }) => (
                                <CustomTextField
                                  {...field}
                                  value={item?.qtyToPack}
                                  onChange={e => {
                                    const value = e.target.value
                                    const formattedValue = handleDecimalPlaces(value)
                                    field.onChange(formattedValue)
                                    // update(`packageItems[${index}].qtyToPack`, formattedValue)
                                  }}
                                  label='Quantity To Pack'
                                  fullWidth
                                  error={Boolean(error)}
                                  helperText={error?.message}
                                />
                              )}
                            />
                          </Grid>
                          <Grid item xs={12} md={8} order={{ xs: 6, md: 5 }}>
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
                                />
                              )}
                            />{' '}
                          </Grid>
                          <Grid item xs={12} md={4} order={{ xs: 5, md: 6 }}>
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

                      <Grid item xs={2} lg={1}>
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
              append({ ...LineItemFields, lineItemId: generateId() })
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
              <CustomTextField
                disabled
                label='Total Ordered Qty'
                placeholder='200'
                fullWidth
                inputProps={{
                  min: 0
                }}
                value={totalOrderedQty}
                sx={{ mb: 3 }}
              />

              <CustomTextField
                inputProps={{
                  min: 0
                }}
                disabled
                label='Total Packed Qty'
                placeholder='15%'
                fullWidth
                value={totalPackedQty}
                sx={{ mb: 3 }}
              />

              <CustomTextField
                inputProps={{
                  min: 0
                }}
                disabled
                label='Quantity To Pack'
                placeholder='15%'
                fullWidth
                value={totalQtyPack}
              />
            </Grid>
          </Grid>
        </>
      )}

      {/* // )} */}
    </>
  )
}

export default PackageItemsTable
