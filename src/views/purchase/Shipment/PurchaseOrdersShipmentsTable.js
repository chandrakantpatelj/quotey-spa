import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  IconButton,
  Typography,
  Grid,
  Divider,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  createFilterOptions
} from '@mui/material'
import CustomTextField from 'src/@core/components/mui/text-field'
import Icon from 'src/@core/components/icon'
import { Controller, useFieldArray } from 'react-hook-form'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import { AddOutlined } from '@mui/icons-material'
import {
  floatPattern,
  floatPatternMsg,
  getAdornmentConfig,
  getExchangeRate,
  getOnFocusConfig,
  handleDecimalPlaces,
  NumberFormat
} from 'src/common-functions/utils/UtilityFunctions'
import { addDecimals, divideDecimals } from 'src/common-functions/utils/DecimalUtils'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import usePurchasePackages from 'src/hooks/getData/usePurchasePackages'
import { useSelector } from 'react-redux'
import UpdateShipmentExpense from './UpdateShipmentExpense'
import { STATUS_CONFIRMED } from 'src/common-functions/utils/Constants'
import useShipments from 'src/hooks/getData/useShipments'
import CommonPOPopup from 'src/common-components/CommonPOPopup'
import CommonPoPackagePopUp from 'src/common-components/CommonPoPackagePopUp'
import StyledButton from 'src/common-components/StyledMuiButton'
import useTaxAuthorities from 'src/hooks/getData/useTaxAuthorities'

const fieldRows = {
  packageId: '',
  packageNo: '',
  packageNoPrefix: '',
  purchaseOrderId: '',
  purchaseOrderNo: '',
  purchaseOrderNoPrefix: '',
  vendorId: '',
  totalValue: 0.0,
  currency: ''
}

export default function PurchaseOrdersShipmentsTable({
  vendors,
  watch,
  control,
  currency,
  setValue,
  getValues,
  shipment,
  isShipmentDetailLocked,
  settingPurchaseData
}) {
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId) || ''
  let mainVendor = watch('vendorId')

  const { currencies } = useCurrencies()
  const { fetchShipments } = useShipments(tenantId)
  const { fetchPurchasePackages } = usePurchasePackages(tenantId)
  const { taxAuthorities } = useTaxAuthorities(tenantId)

  const [shipments, setShipments] = useState([])
  const [purchasePackages, setPurchasePackages] = useState([])

  useEffect(() => {
    const callGetShipmentHook = async () => {
      const shipments = await fetchShipments()
      setShipments(shipments)
    }
    callGetShipmentHook()
  }, [tenantId])

  useEffect(() => {
    const getPurchasePackages = async () => {
      const purchasePackages = await fetchPurchasePackages()
      setPurchasePackages(purchasePackages)
    }
    getPurchasePackages()
  }, [fetchPurchasePackages])

  const filterOptions = createFilterOptions({
    stringify: option => {
      const vendor = vendors?.find(v => v.vendorId === option.vendorId)
      return `${option.packageNoPrefix}${option.packageNo} ${vendor?.displayName || ''}`
    }
  })
  const { append, update, remove } = useFieldArray({
    control,
    name: 'packages',
    rules: {
      required: false
    }
  })

  const setValueFieldByKey = (section, key, updatedField, value) => {
    const currentValues = getValues(section)

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

  let packages = watch('packages')
  let allExpenses = watch('expenses')
  let allTaxes = watch('taxes')

  const shipmentPackageIds = shipments?.flatMap(item => item?.packages || [])?.map(pkg => pkg?.packageId)

  const filteredPackages =
    purchasePackages?.filter(
      pkg =>
        pkg?.status === STATUS_CONFIRMED &&
        !shipmentPackageIds?.includes(pkg?.packageId) &&
        !packages?.some(selected => selected?.packageId === pkg?.packageId)
    ) || []

  const recalculateTotals = () => {
    let shipmentTotalValue = 0
    packages?.map((item, index) => {
      const packageCurrency = currencies?.find(val => val?.currencyId === item?.currency)

      const exchangeRate = getExchangeRate(parseFloat(currency?.exchangeRate) || 1, packageCurrency?.exchangeRate)

      const itemTotal = item?.totalValue || 0
      setValue(`packages[${index}].totalValue`, item?.totalValue)

      const convValue = divideDecimals(itemTotal || 0, exchangeRate || 1)

      shipmentTotalValue = addDecimals(shipmentTotalValue, convValue)
    })
  }
  useMemo(() => {
    recalculateTotals()
  }, [packages, getValues('currency'), getValues('currencyExchangeRate')])

  const [openExpenseDialog, setOpenExpenseDialog] = useState({
    open: false,
    selectedExpense: null
  })
  const [purchaseOrderDialogState, setPurchaseOrderDialogState] = useState({
    open: false,
    selectedOrderId: null
  })

  const [purchasePackageDialogState, setPurchasePackageDialogState] = useState({
    open: false,
    selectedPackageId: null
  })

  let filterExpenseVendors =
    vendors?.filter(item =>
      settingPurchaseData?.expenses
        ?.find(val => val?.expenseId === openExpenseDialog?.selectedExpense?.expenseId)
        ?.currencies?.includes(item?.currencyId)
    ) || vendors

  return (
    <>
      {isShipmentDetailLocked ? (
        <Grid item xs={12} lg={10.5}>
          <Typography sx={{ fontSize: '14px', fontWeight: 500, lineHeight: '22px', mb: 2 }}>Packages</Typography>
          <TableContainer>
            <Table
              size='small'
              sx={{
                '& .MuiTableHead-root': {
                  textTransform: 'capitalize'
                },
                '& .MuiTableCell-root': {
                  borderBottom: '1px dashed #D8D8D8'
                },
                '& .MuiTableCell-root:last-of-type': {
                  textAlign: 'right'
                }
              }}
            >
              <TableHead sx={{ bgcolor: 'rgba(248, 250, 254, 1)' }}>
                <TableRow>
                  <TableCell>Package</TableCell>
                  <TableCell>Purchase Order</TableCell>
                  <TableCell>Total Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {shipment?.packages?.map((item, index) => {
                  const currency = currencies?.find(val => val?.currencyId === item?.currency)
                  const vendor = vendors?.find(val => val?.vendorId === item?.vendorId) || {}

                  return (
                    <TableRow key={index}>
                      <TableCell align='left'>
                        <StyledButton
                          color='primary'
                          onClick={() =>
                            setPurchasePackageDialogState({
                              open: true,
                              selectedPackageId: item?.packageId
                            })
                          }
                        >
                          {item?.packageNoPrefix}
                          {item?.packageNo}
                        </StyledButton>
                      </TableCell>
                      <TableCell align='left'>
                        <StyledButton
                          color='primary'
                          onClick={() =>
                            setPurchaseOrderDialogState({
                              open: true,
                              selectedOrderId: item?.purchaseOrderId
                            })
                          }
                        >
                          {item?.purchaseOrderNoPrefix}
                          {item?.purchaseOrderNo}
                        </StyledButton>
                        ({vendor?.displayName})
                      </TableCell>
                      <TableCell align='right'>
                        <NumberFormat value={item?.totalValue} currency={currency} />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      ) : (
        <Grid item xs={12} md={12} lg={10.5} id='packages'>
          <Typography sx={{ fontSize: '15px', fontWeight: 500, lineHeight: '40px' }}>Packages </Typography>

          {packages?.length > 0
            ? packages?.map((item, index) => {
                const vendor = vendors?.find(val => val?.vendorId === item?.vendorId) || {}
                const packageCurrency = currencies?.find(val => val?.currencyId === item?.currency)

                return (
                  <Box sx={{ py: 1, width: '100%', mb: 2 }} key={item?.packageId}>
                    <Grid container spacing={{ xs: 2 }}>
                      <Grid item xs={10} sm={11}>
                        <Grid container spacing={{ xs: 2 }}>
                          <Grid item xs={12} md={4}>
                            <Controller
                              name={`packages[${index}].packageId`}
                              control={control}
                              rules={{ required: 'Package is required' }}
                              render={({ field, fieldState: { error } }) => (
                                <CustomAutocomplete
                                  {...field}
                                  value={item}
                                  onChange={(event, newValue) => {
                                    field?.onChange(newValue?.packageId)
                                    setValue(`packages[${index}].packageNo`, newValue?.packageNo)
                                    setValue(`packages[${index}].packageNoPrefix`, newValue?.packageNoPrefix)
                                    setValue(`packages[${index}].purchaseOrderId`, newValue?.purchaseOrderId)
                                    setValue(`packages[${index}].purchaseOrderNo`, newValue?.purchaseOrderNo)
                                    setValue(
                                      `packages[${index}].purchaseOrderNoPrefix`,
                                      newValue?.purchaseOrderNoPrefix
                                    )
                                    setValue(`packages[${index}].vendorId`, newValue?.vendorId)
                                    setValue(`packages[${index}].totalValue`, newValue?.totalPackageValue)
                                    update(`packages[${index}].totalValue`, newValue?.totalPackageValue)
                                    setValue(`packages[${index}].currency`, newValue?.currency)
                                  }}
                                  options={filteredPackages}
                                  filterOptions={filterOptions}
                                  getOptionLabel={option =>
                                    `${option?.packageNoPrefix || ''}${option?.packageNo || ''}`
                                  }
                                  renderOption={(props, option) => {
                                    const vendor = vendors?.find(val => val?.vendorId === option?.vendorId)
                                    return (
                                      <Box component='li' {...props} key={option?.packageId}>
                                        {option?.packageNoPrefix}
                                        {option?.packageNo} ({option?.purchaseOrderNoPrefix}
                                        {option?.purchaseOrderNo} - {vendor?.displayName || ''})
                                      </Box>
                                    )
                                  }}
                                  renderInput={params => (
                                    <CustomTextField
                                      {...params}
                                      label='Package'
                                      error={Boolean(error)}
                                      helperText={error?.message}
                                    />
                                  )}
                                />
                              )}
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Controller
                              name={`packages[${index}].purchaseOrderNo`}
                              control={control}
                              render={({ field }) => (
                                <CustomTextField
                                  value={`${item?.purchaseOrderNoPrefix}${item?.purchaseOrderNo} (${
                                    vendor?.displayName || ''
                                  })`}
                                  fullWidth
                                  InputProps={{
                                    disabled: true
                                  }}
                                  label='Purchase Order'
                                />
                              )}
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Controller
                              name={`packages[${index}].totalValue`}
                              control={control}
                              render={({ field }) => (
                                <CustomTextField
                                  value={field?.value}
                                  fullWidth
                                  InputProps={{
                                    disabled: true,
                                    ...getAdornmentConfig(packageCurrency)
                                  }}
                                  label='Total Value'
                                />
                              )}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={2} sm={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <IconButton
                            variant='outlined'
                            color='error'
                            onClick={() => {
                              remove(index)
                            }}
                          >
                            <Icon icon='mingcute:delete-2-line' />
                          </IconButton>
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
            disabled={filteredPackages?.length < 1}
          >
            Add New
          </Button>
          <Divider variant='fullWidth' orientation='horizontal' sx={{ display: 'block', mb: 8 }} />
        </Grid>
      )}

      <Grid item xs={12} md={12} lg={10.5}>
        <Grid
          container
          direction={{ xs: 'column-reverse', md: 'row' }}
          sx={{ alignItems: { xs: 'flex-end', md: 'flex-start' } }}
          spacing={{ xs: 6, md: 8, xl: 8 }}
        >
          <Grid item xs={12} sm={12} md={6} lg={6} xl={6} sx={{ width: '100%' }}>
            <Box component='div' sx={{ width: '100%' }}>
              {isShipmentDetailLocked ? (
                <>
                  {shipment?.notes && (
                    <>
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
                            {shipment?.notes}
                          </pre>
                        </div>
                      </Typography>
                    </>
                  )}
                </>
              ) : (
                <>
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
                </>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
            {allExpenses
              ?.filter(a => a.paidToMainVendor)
              ?.map(item => {
                const vendor = vendors?.find(val => val?.vendorId === item?.vendorId)
                const expenseCurrency = currencies?.find(val => val?.currencyId === item?.expenseValueCurrency)
                return shipment?.lockedComponents?.includes(item?.expenseId) ? (
                  <Typography
                    key={`expenses-${item.expenseId}`}
                    sx={{
                      display: 'flex',
                      gap: '5px',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      fontWeight: 500,
                      lineHeight: '24px',
                      width: '90%',
                      mb: 3
                    }}
                  >
                    <span style={{ color: '#818181' }}>
                      {item?.expenseName}
                      <span style={{ fontSize: '11px', color: '#8c96a1' }}>
                        ({mainVendor?.displayName || 'none'})
                      </span>{' '}
                      :
                    </span>
                    <span style={{ flexShrink: 0 }}>
                      <NumberFormat value={item?.expenseValue} currency={expenseCurrency} />
                    </span>
                  </Typography>
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
                              const formattedValue = handleDecimalPlaces(e.target.value)
                              field.onChange(formattedValue)
                              setValueFieldByKey('expenses', item.expenseId, 'expenseValue', formattedValue)
                            }}
                            inputProps={{ min: 0 }}
                            InputProps={{
                              ...getOnFocusConfig(field, 0),
                              ...getAdornmentConfig(expenseCurrency)
                            }}
                            label={`${item?.expenseName}(${mainVendor?.displayName || 'none'})`}
                            fullWidth
                          />
                        )}
                      />
                    </Box>
                  </Box>
                )
              })}

            {allTaxes?.map((item, i) => {
              const vendor = vendors?.find(val => val?.vendorId === item?.vendorId)
              const taxAuthority = taxAuthorities?.find(val => val?.taxAuthorityId === item?.taxAuthorityId)

              const taxCurrency = currencies?.find(val => val?.currencyId === item?.taxValueCurrency)

              return shipment?.lockedComponents?.includes(item?.taxId) ? (
                <Typography
                  key={`tax-${item.taxId}`}
                  sx={{
                    display: 'flex',
                    gap: '5px',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    fontWeight: 500,
                    lineHeight: '24px',
                    width: '90%',
                    mb: 3
                  }}
                >
                  <span style={{ color: '#818181' }}>
                    {item?.taxName}
                    <span style={{ fontSize: '11px', color: '#8c96a1' }}>
                      ({' '}
                      {item?.vendorId
                        ? vendor?.displayName || 'none'
                        : item?.taxAuthorityId
                        ? taxAuthority?.taxAuthorityName
                        : 'none'}
                      )
                    </span>
                    :
                  </span>
                  <span style={{ flexShrink: 0 }}>
                    <NumberFormat value={item?.taxValue} currency={taxCurrency} />{' '}
                  </span>
                </Typography>
              ) : (
                <Box sx={{ width: '90%', mb: 3 }} key={`tax-${item.taxId}`}>
                  <Controller
                    // name={`taxes[${i}].taxValue`}
                    name={`taxes.${item.taxId}.taxValue`}
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
                        value={field.value}
                        onChange={e => {
                          const formattedValue = handleDecimalPlaces(e.target.value)
                          field.onChange(formattedValue)
                          setValueFieldByKey('taxes', item.taxId, 'taxValue', formattedValue)
                        }}
                        InputProps={{
                          ...getOnFocusConfig(field, 0),
                          ...getAdornmentConfig(taxCurrency)
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
              )
            })}

            {allExpenses
              ?.filter(a => a.paidToMainVendor === false && a.accountableForOrderTaxes === true)
              ?.map(item => {
                const vendor = vendors?.find(val => val?.vendorId === item?.vendorId)
                const expenseCurrency = currencies?.find(val => val?.currencyId === item?.expenseValueCurrency)
                return shipment?.lockedComponents?.includes(item?.expenseId) ? (
                  <Typography
                    key={`expenses-${item.expenseId}`}
                    sx={{
                      display: 'flex',
                      gap: '5px',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      fontWeight: 500,
                      lineHeight: '24px',
                      width: '90%',
                      mb: 3
                    }}
                  >
                    <span style={{ color: '#818181' }}>
                      {item?.expenseName}{' '}
                      <span style={{ fontSize: '11px', color: '#8c96a1' }}>({vendor?.displayName || 'none'})</span>:
                    </span>
                    <span style={{ flexShrink: 0 }}>
                      <NumberFormat value={item?.expenseValue} currency={expenseCurrency} />
                    </span>
                  </Typography>
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
                              const formattedValue = handleDecimalPlaces(e.target.value)
                              field.onChange(formattedValue)
                              setValueFieldByKey('expenses', item.expenseId, 'expenseValue', formattedValue)
                            }}
                            inputProps={{ min: 0 }}
                            InputProps={{
                              ...getOnFocusConfig(field, 0),
                              ...getAdornmentConfig(expenseCurrency)
                            }}
                            label={`${item?.expenseName}(${vendor?.displayName || 'none'})`}
                            fullWidth
                            disabled={!item?.vendorId}
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

            {allExpenses
              ?.filter(a => a.eligibleForTaxCredit === true)
              .map(item => {
                const vendor = vendors?.find(val => val?.vendorId === item?.vendorId)
                const expenseCurrency = currencies?.find(val => val?.currencyId === item?.expenseValueCurrency)
                return shipment?.lockedComponents?.includes(item?.expenseId) ? (
                  <>
                    <Typography
                      key={`eligible-${item.expenseId}`}
                      sx={{
                        display: 'flex',
                        gap: '5px',
                        justifyContent: 'space-between',
                        fontSize: '12px',
                        fontWeight: 500,
                        lineHeight: '24px',
                        width: '90%',
                        mb: 3
                      }}
                    >
                      <span style={{ color: '#818181' }}>
                        {`${item?.expenseName}(Excl. Tax)`}{' '}
                        <span style={{ fontSize: '11px', color: '#8c96a1' }}>({vendor?.displayName || 'none'})</span>:
                      </span>{' '}
                      <span style={{ flexShrink: 0 }}>
                        <NumberFormat value={item?.expenseValue} currency={expenseCurrency} />
                      </span>
                    </Typography>
                    {/* {item?.eligibleForTaxCredit && ( */}
                    <Typography
                      key={`eligible-${item.expenseId}`}
                      sx={{
                        display: 'flex',
                        gap: '5px',
                        justifyContent: 'space-between',
                        fontSize: '12px',
                        fontWeight: 500,
                        width: '90%',
                        lineHeight: '24px',
                        mb: 3
                      }}
                    >
                      <span style={{ color: '#818181' }}>
                        {`${item?.expenseName}(Tax)`}{' '}
                        <span style={{ fontSize: '11px', color: '#8c96a1' }}>({vendor?.displayName || 'none'})</span>:
                      </span>{' '}
                      <span style={{ flexShrink: 0 }}>
                        <NumberFormat value={item?.taxValue} currency={expenseCurrency} />{' '}
                      </span>
                    </Typography>
                    {/* )} */}
                  </>
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
                              value={field.value}
                              onChange={e => {
                                const formattedValue = handleDecimalPlaces(e.target.value)
                                field.onChange(formattedValue)
                                setValueFieldByKey('expenses', item.expenseId, 'expenseValue', formattedValue)
                              }}
                              inputProps={{ min: 0 }}
                              InputProps={{
                                ...getOnFocusConfig(field, 0),
                                ...getAdornmentConfig(expenseCurrency)
                              }}
                              label={`${item?.expenseName}(Excl. Tax)(${vendor?.displayName || 'none'})`}
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
                    <Box sx={{ width: '90%' }}>
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
                              const formattedValue = handleDecimalPlaces(e.target.value)
                              field.onChange(formattedValue)
                              setValueFieldByKey('expenses', item.expenseId, 'taxValue', formattedValue)
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
                    </Box>
                  </Box>
                )
              })}
          </Grid>
        </Grid>
      </Grid>

      {purchaseOrderDialogState.open && (
        <CommonPOPopup
          orderId={purchaseOrderDialogState.selectedOrderId}
          open={purchaseOrderDialogState.open}
          onClose={() => setPurchaseOrderDialogState({ open: false, selectedOrderId: null })}
        />
      )}
      {purchasePackageDialogState?.open && (
        <CommonPoPackagePopUp
          packageId={purchasePackageDialogState?.selectedPackageId}
          open={purchasePackageDialogState?.open}
          setOpen={() => setPurchasePackageDialogState({ open: false, selectedPackageId: null })}
        />
      )}

      {openExpenseDialog?.open && (
        <UpdateShipmentExpense
          open={openExpenseDialog?.open}
          setOpen={setOpenExpenseDialog}
          vendors={filterExpenseVendors}
          setValueFieldByKey={setValueFieldByKey}
          selectedExpense={openExpenseDialog.selectedExpense}
        />
      )}
    </>
  )
}
