import { alpha, Avatar, Badge, Box, Chip, InputAdornment, Tab, Typography } from '@mui/material'
import { Amplify } from 'aws-amplify'
import moment from 'moment'
import { NumericFormat } from 'react-number-format'
import { AuthConfig } from 'src/@core/components/auth/amlify-config'
import RenderHTML from 'src/@core/components/common-components/RenderHTML '
import Icon from 'src/@core/components/icon'
import CustomAvatar from 'src/@core/components/mui/avatar'
Amplify.configure(AuthConfig)

import UseStatusColor from 'src/hooks/UseStatusColor'
import { resetCustomer } from 'src/store/apps/customers'
import { resetExpenses } from 'src/store/apps/expenses'
import { resetFinancialAccounts } from 'src/store/apps/financial-Accounts'
import { resetGeneralSetting } from 'src/store/apps/general-setting'
import { resetOtherSettings } from 'src/store/apps/other-setting'
import { resetPackage } from 'src/store/apps/packages'
import { resetSalesPayment } from 'src/store/apps/payments'
import { resetPriceList } from 'src/store/apps/priceLists'
import { resetProducts } from 'src/store/apps/products'
import { resetPurchaseSetting } from 'src/store/apps/purchase-module-settings'
import { resetPurchaseOrder } from 'src/store/apps/purchaseorder'
import { resetPurchasePayment } from 'src/store/apps/purchases-payment'
import { resetQuotation } from 'src/store/apps/quotations'
import { resetSalesOrder } from 'src/store/apps/sales'
import { resetSalesModule } from 'src/store/apps/sales-module-settings'
import { resetStock } from 'src/store/apps/stock-adjustments'
import { resetTaxAuthorities } from 'src/store/apps/tax-authority'
import { resettaxPayments } from 'src/store/apps/tax-payments'
import { resetTaxSettings } from 'src/store/apps/tax-settings'
import { resettaxStatement } from 'src/store/apps/tax-statements'
import { resetTrading } from 'src/store/apps/tradings'
import { resetVendor } from 'src/store/apps/vendors'
import { resetWarehouse } from 'src/store/apps/warehouses'
import { DATE_FORMAT } from './Constants'
import {
  addDecimals,
  divideDecimals,
  divideDecimalsWithoutRounding,
  multiplyDecimals,
  multiplyDecimalsWithoutRounding,
  percentageOf,
  percentageOfWithoutRounding,
  percentageWithoutRounding,
  subtractDecimalsWithoutRounding,
  subtractPercentage
} from './DecimalUtils'
// import { ObjectId } from 'bson'
import { ObjectId } from 'bson'
import { resetAccountTransaction } from 'src/store/apps/account-transactions'
import { resetPurchasePackage } from 'src/store/apps/purchase-packages'
import { resetPurchaseShipment } from 'src/store/apps/purchase-shipments'
import { resetInvoice } from 'src/store/apps/sales-invoices'

export function generateId() {
  return new ObjectId().toString()
}
// import AWS from 'aws-sdk'
// import { setAWSConfig } from 'src/@core/components/auth/amlify-config'
// const s3 = new AWS.S3()
// import S3Singleton from '../../@core/components/auth/s3'
export const dataTitleStyles = {
  fontSize: { xs: '11px', md: '12px' },
  color: '#AAACB0',
  lineHeight: { xs: '18px', sm: '20px' },
  wordBreak: 'break-all'
}

export const dataTextStyles = {
  fontSize: { xs: '12px', md: '13px' },
  lineHeight: { xs: '18px', sm: '20px' },
  color: '#1B1B1B',
  wordBreak: 'break-all'
}
export function generateUUID() {
  // Generate a random hexadecimal number with 32 digits (16 bytes)
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })

  return uuid
}

// export function generateUniqueId() {
//   return new ObjectId().toString()
// }

export function GetObjectFromName(name, array) {
  if (array && array?.length > 0) {
    const filterArray = array?.filter(item => item?.name === name)
    if (filterArray && filterArray?.length > 0) {
      return filterArray[0]
    }
  } else {
    // Handle the case when no matching object is found, e.g., return null or an appropriate value.
    return null // Or any other appropriate value
  }
}

export const fetchImage = async (setImageURL, key, setImgLoader) => {
  try {
    setImgLoader(true)
    // const url = await Amplify.Storage.get(key)
    const url = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_S3_BUCKET_REGION}.amazonaws.com/public/${key}`
    setImageURL(url)
  } catch (error) {
    console.error('Error fetching image:', error)
  } finally {
    setImgLoader(false)
  }
}

export const fetchPdfFile = async (setSelectedPdFile, item) => {
  try {
    const pdf = await Amplify.Storage.get(item.key)
    setSelectedPdFile(prev => [...prev, { file: pdf, fileName: item.fileName, key: item.key }]) // Assuming setSelectedPdfFile accepts an array of objects with file and fileName
  } catch (error) {
    console.error('Error fetching image:', error)
  }
}

export const fetchMultiImages = async (setSelectedPdFile, item) => {
  try {
    const images = await Amplify.Storage.get(item.key)
    setSelectedPdFile(prev => [...prev, { file: images, name: item.name, key: item.key }]) // Assuming setSelectedPdfFile accepts an array of objects with file and fileName
  } catch (error) {
    console.error('Error fetching image:', error)
  }
}
export const fetchLogo = async key => {
  try {
    const pdf = await Amplify.Storage.get(key)
    return pdf // Assuming setSelectedPdfFile accepts an array of objects with file and fileName
  } catch (error) {
    console.error('Error fetching image:', error)
    return ''
  }
}
export function findObjectByCurrencyId(array, currencyId) {
  return array?.find(obj => obj.currencyId === currencyId)
}

export function findObjectByVendorId(array, id) {
  return array?.find(obj => obj.vendorId === id)
}
export function findObjectByOrderId(array, id) {
  return array?.find(obj => obj.orderId === id)
}
export function findObjectByCustomerId(array, id) {
  return array?.find(obj => obj.customerId === id)
}
export function findObjectByWarehouseId(array, id) {
  return array?.find(obj => obj.warehouseId === id)
}
export function DateFunction(getDate) {
  return moment(getDate).format('DD MMM YYYY')
}

export const renderTabs = (value, theme, tabData, selectedData) => {
  return tabData.map((item, index) => {
    const RenderAvatar = item?.type === value ? CustomAvatar : Avatar
    const isSelected = item?.type === value
    const showBadge = item?.type === 'attachments' && selectedData?.files?.length

    const tabContent = (
      <Box
        sx={{
          width: 110,
          height: 93,
          borderWidth: 1,
          display: 'flex',
          alignItems: 'center',
          borderRadius: '10px',
          flexDirection: 'column',
          justifyContent: 'center',
          borderStyle: isSelected ? 'solid' : 'dashed',
          borderColor: isSelected ? theme.palette.primary.main : theme.palette.divider
        }}
      >
        <RenderAvatar
          variant='rounded'
          {...(isSelected && { skin: 'light' })}
          sx={{
            mb: 2,
            width: 34,
            height: 34,
            '& > svg': { width: '20px' },
            ...(item?.type !== value && { backgroundColor: 'action.selected' })
          }}
        >
          <Icon icon={item.avatarIcon} />
        </RenderAvatar>
        <Typography
          sx={{
            fontSize: '13px',
            fontWeight: 500,
            color: 'text.secondary',
            textTransform: 'capitalize'
          }}
        >
          {item?.type}
        </Typography>
      </Box>
    )

    return (
      <Tab
        key={index}
        value={item?.type}
        label={
          showBadge ? (
            <Badge badgeContent={selectedData?.files?.length} color='primary'>
              {tabContent}
            </Badge>
          ) : (
            tabContent
          )
        }
      />
    )
  })
}

export const capitalizeFirstLetterOnly = value => {
  if (!value) return value
  const formattedValue = value.toLowerCase().replace(/\b\w/g, char => char.toUpperCase()) // Capitalizes the first letter of each word
  return formattedValue
}

export function convertCurrency(source, base, target, value) {
  return multiplyDecimalsWithoutRounding(divideDecimalsWithoutRounding(value, source), target)
}

export const getExchangeRate = (source, target) => {
  const amount = 1
  return (amount / source) * target
}

export function toTitleCase(str) {
  if (!str) return null
  return str
    .split(/[_-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export const getStatusChip = (color, status) => {
  return (
    <Chip
      sx={{
        fontSize: '12px',
        height: '21px',
        color: color,
        lineHeight: 'normal',
        backgroundColor: theme => alpha(color, theme.palette.action.chipOpacity) + ' !important',
        textTransform: 'capitalize'
      }}
      size='small'
      label={toTitleCase(status || '')}
      color='default'
    />
  )
}

export function getDescription(value) {
  return <RenderHTML html={value} />
}
export const safeNumber = value => {
  const num = Number(value)
  return isNaN(num) ? 0 : num
}

export const safeAmount = value => {
  const num = Number(value)
  return isNaN(num) ? 0.0 : num.toFixed(2)
}

export const discountValAsPercentage = (sellingPriceNum, discountVal) => {
  // return safeNumber(sellingPriceNum * (discountVal / 100))
  return percentageOfWithoutRounding(discountVal, sellingPriceNum)
}

export const discountValAsValue = (sellingPriceNum, discountVal, subTotal) => {
  // let discountValueInPer = (discountVal * 100) / subTotal
  // return safeNumber((discountValueInPer / 100) * sellingPriceNum)
  let discountValueInPer = percentageWithoutRounding(discountVal, subTotal)
  return percentageOfWithoutRounding(discountValueInPer, sellingPriceNum)
}
// export const calculateQuantity = ({ length, width, height, qty }) => {
//   return safeNumber(length) * safeNumber(width) * safeNumber(height) * safeNumber(qty)
// }

export const calculateQuantity = item => {
  const { itemDimension, enablePackingUnit, packingUnit } = item
  const { length, width, height, qty } = itemDimension || {}

  if (enablePackingUnit) {
    return multiplyDecimals(item?.packingUnit?.qty || 0, packingUnit?.qtyPerUnit || 0)
  } else {
    const totalQty = parseFloat(length || 0) * parseFloat(width || 0) * parseFloat(height || 0) * parseFloat(qty || 0)
    return totalQty ? totalQty.toFixed(2) : 0
  }
}

export const calculateDiscount = (orderSubtotal, subtotal, sellingPrice, qty, discountValueArg, discountType) => {
  let discountValue = safeNumber(discountValueArg)
  let discountPerUnit = 0

  if (discountType === 'PERCENTAGE') {
    discountPerUnit = percentageOf(discountValue, sellingPrice)
  } else if (discountType === 'VALUE') {
    discountPerUnit = divideDecimals(
      multiplyDecimalsWithoutRounding(divideDecimalsWithoutRounding(subtotal, orderSubtotal), discountValue),
      qty
    )
  }

  return { discountPerUnit, totalDiscount: multiplyDecimals(discountPerUnit, qty) }
}

export const calculateTaxValue = (
  sellingPrice,
  discountValue,
  discountType,
  enabledTaxes,
  subTotal,
  setSeparateTaxes,
  tempStoreTax
) => {
  const discountVal = safeNumber(discountValue)
  const sellingPriceNum = safeNumber(sellingPrice)

  let discount = 0
  if (discountVal != 0) {
    if (discountType === 'PERCENTAGE') {
      discount = discountValAsPercentage(sellingPriceNum, discountVal)
    } else if (discountType === 'VALUE') {
      discount = discountValAsValue(sellingPriceNum, discountVal, subTotal).toFixed(2)
    }
  }
  let itemTotalTaxValue = 0
  if (Array.isArray(enabledTaxes)) {
    enabledTaxes.forEach(({ taxRate, taxId }) => {
      // console.log('enabledTaxescalc', enabledTaxes)

      const taxValue = percentageOf(taxRate, subtractDecimalsWithoutRounding(sellingPriceNum || 0, discount || 0))
      itemTotalTaxValue = addDecimals(itemTotalTaxValue, taxValue)
      const existingTaxIndex = tempStoreTax.findIndex(tax => tax.taxId === taxId)
      // console.log('tempStoreTaxcalc', tempStoreTax)

      // console.log('existingTaxIndexcalc', existingTaxIndex)

      if (existingTaxIndex >= 0) {
        tempStoreTax[existingTaxIndex].taxValue = addDecimals(tempStoreTax[existingTaxIndex].taxValue, taxValue)
      } else {
        tempStoreTax.push({ taxId, taxValue })
      }

      setSeparateTaxes(prev => {
        const taxExists = prev.some(tax => tax.taxId === taxId)
        // console.log('prev', prev)
        // console.log('taxId', taxId)
        // console.log('taxExists', taxExists)

        if (taxExists) {
          return prev.map(tax =>
            tax.taxId === taxId ? { ...tax, taxValue: tempStoreTax.find(t => t.taxId === taxId).taxValue } : tax
          )
        } else {
          return [...prev, { taxId, taxValue }]
        }
      })
    })
  }
  return { discount, taxValue: itemTotalTaxValue }
}
export const handleKeyDown = event => {
  if (event.key === 'Enter') {
    event.preventDefault()
  }
}

export const checkUnit = items => {
  return items?.filter(item => item?.uom === 'm2' || item?.uom === 'm3')?.length > 0
}
export const handleClearValue = (key, index, LineItemFields, setValue, update) => {
  setValue(`${key}[${index}]`, LineItemFields)
  update(index, LineItemFields)
}

export const parseUtcDate = date => {
  return date ? moment.utc(date).startOf('day').toDate() : null
}

export const formatDateString = date => {
  return date
    ?.toLocaleString('en-us', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    .replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$1-$2')
}
export const convertDate = dateStr => {
  const date = moment(dateStr, DATE_FORMAT) // Strict parsing with the correct format
  if (!date.isValid()) {
    return null // Return null for invalid dates
  }
  // Format the date to include only the date with 0 time (midnight)
  return date.startOf('day').format('YYYY-MM-DD')
}

export const parseDate = dateStr => {
  if (!dateStr) return null // Handle null or undefined input

  const date = moment(new Date(dateStr), DATE_FORMAT) // strict parsing
  return isNaN(date) ? null : date.toISOString().split('T')[0]
}

export const parseFloatOrDefault = (value, defaultValue = 0) => {
  return typeof value === 'number' ? value : typeof value === 'tring' ? parseFloat(value) : defaultValue
}

export const checkDateExpired = inputData => {
  // Given date
  const givenDate = new Date(inputData)

  // Today's date
  const today = new Date()

  // Remove time part of both dates to compare only the dates
  const todayWithoutTime = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const givenDateWithoutTime = new Date(givenDate.getFullYear(), givenDate.getMonth(), givenDate.getDate())

  // Check if the given date is before today
  return givenDateWithoutTime < todayWithoutTime
}

export const getGSTAndTaxOptions = tenant => {
  const GST = tenant?.taxations?.find(item => item.key === 'GST')?.value || 0
  const taxOptions = GST !== 0 ? [GST, 0] : [0]
  return { GST, taxOptions }
}

export const calculateSellingPrice = (originalPrice, gst) => {
  const originalPriceNum = safeNumber(originalPrice)
  const gstNum = safeNumber(gst)
  return subtractPercentage(originalPriceNum, gstNum)
}

export const dynamicSort = (array, key, direction = 'desc') => {
  const sortedArray = [...array] // Create a copy of the array to avoid modifying the original array
  return sortedArray.sort((a, b) => {
    if (direction === 'asc') {
      return a[key].localeCompare(b[key])
    } else {
      return b[key].localeCompare(a[key])
    }
  })
}

export const sortByDateFirstThenOrderNo = array => {
  return [...array].sort((a, b) => {
    const sortByDate = new Date(b.orderDate) - new Date(a.orderDate) // ascending orderDate
    if (sortByDate !== 0) {
      return sortByDate // primary: orderDate
    }
    // secondary: orderNo (assuming numeric comparison)
    return b.orderNo - a.orderNo
  })
}

export const todaysDate = () => {
  const today = new Date()
  const todayWithoutTime = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const dd = String(todayWithoutTime.getDate()).padStart(2, '0')
  const mm = String(todayWithoutTime.getMonth() + 1).padStart(2, '0') // Months are zero-based
  const yyyy = todayWithoutTime.getFullYear()

  const formattedDate = `${mm}/${dd}/${yyyy}`
  return formattedDate
}

export const NumberFormat = ({ value, currency }) => {
  return (
    <NumericFormat
      value={parseFloat(value).toFixed(2)}
      thousandSeparator=','
      displayType={'text'}
      prefix={currency?.displayAlignment === 'left' ? `${currency?.symbol}${' '}` : ''}
      suffix={currency?.displayAlignment === 'right' ? `${' '}${currency?.symbol}` : ''}
    />
  )
}

export function mapToFields(item, declareFields) {
  let mappedItem = {}
  for (let key in declareFields) {
    if (declareFields[key] instanceof Date) {
      // Directly assign the Date if it exists
      mappedItem[key] = item[key] instanceof Date ? formatDateString(item[key]) : formatDateString(declareFields[key])
    } else if (typeof item[key] === 'object' && item[key] !== null) {
      // Handle nested objects
      mappedItem[key] = mapToFields(item[key] || {}, declareFields[key])
    } else {
      // Handle primitive types
      mappedItem[key] = item[key] !== undefined ? item[key] : declareFields[key]
    }
  }
  return mappedItem
}

export const lastMonthDate = monthDuration => {
  const today = new Date()
  const lastMonth = new Date(today)

  if (monthDuration) {
    lastMonth.setMonth(today.getMonth() - monthDuration)
  } else {
    lastMonth.setMonth(today.getMonth() - 1)
  }

  return lastMonth
}

export const getDateByMonthDuration = monthDuration => {
  const today = new Date()
  const lastMonth = new Date(today)
  if (monthDuration) {
    lastMonth.setMonth(today.getMonth() - monthDuration)
  } else {
    lastMonth.setMonth(today.getMonth() - 1)
  }
  console.log('lastMonth', lastMonth)
  return lastMonth
}

export const getOnFocusConfig = (field, defaultValue = 0) => {
  return {
    onFocus: e => {
      const value = parseFloat(e.target.value)
      if (!isNaN(value) && value === parseFloat(defaultValue)) {
        e.target.value = ''
        field.onChange('')
      }
    },
    onBlur: e => {
      if (e.target.value === '') {
        e.target.value = defaultValue
        field.onChange(defaultValue)
      }
    }
  }
}

export const getAdornmentConfig = currency => {
  return {
    startAdornment:
      currency?.displayAlignment === 'left' ? (
        <InputAdornment
          position='start'
          sx={{
            '& p': {
              fontSize: '13px  !important'
            }
          }}
        >
          {currency?.symbol}
        </InputAdornment>
      ) : null,
    endAdornment:
      currency?.displayAlignment === 'right' ? (
        <InputAdornment
          position='end'
          sx={{
            '& p': {
              fontSize: '13px  !important'
            }
          }}
        >
          {currency?.symbol}
        </InputAdornment>
      ) : null
  }
}

export const floatPattern = /^[0-9]+(\.[0-9]{1,4})?$/
export const floatPatternMsg = 'Please enter a valid float number with up to 4 decimal places'

export const handleDecimalPlaces = value => {
  let newValue = value.replace(/[^0-9.]/g, '')
  const decimalIndex = newValue.indexOf('.')

  if (decimalIndex !== -1 && newValue.substring(decimalIndex + 1).length > 4) {
    newValue = newValue.substring(0, decimalIndex + 5)
  }

  return newValue === '' ? null : newValue
}

export const trimStrings = obj => {
  const newObj = {}
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      newObj[key] = obj[key].trim()
    } else {
      newObj[key] = obj[key]
    }
  }
  return newObj
}

export const rowStatusChip = status => {
  if (!status) return null
  const color = UseStatusColor(status)

  return getStatusChip(color, status)
}

export function filterPaymentMethods(paymentMethods) {
  return paymentMethods.filter(method => method.paymentMethodType === 'BANK')
}

export const removeNullFields = obj => {
  for (let key in obj) {
    if (obj[key] === null) {
      delete obj[key] // Remove the key if the value is null
    }
  }
}

export function getLeadDays(terms, paymentTerms) {
  const leadDays = paymentTerms?.find(item => item?.paymentTerms === terms)
  if (leadDays?.leadDays === '999') {
    return -1
  } else {
    return parseInt(leadDays?.leadDays)
  }
}

// Function to check if 'LIST_BANK_TRANSACTION' exists
// export const hasPermissions = (userProfile, permission) => {
//   return userProfile.some(permissionGroup => permissionGroup.permissions.includes(permission))
// }

export const hasPermission = (userProfile, requiredPermission) => {
  const { isAdmin, isRootUser, tanantSpecificPermissions } = userProfile
  return (
    isRootUser ||
    isAdmin ||
    tanantSpecificPermissions?.some(permission => permission.action === requiredPermission) ||
    false
  )
}

export const filterVisibleItems = items => {
  return items
    .map(item => {
      if (item?.children) {
        // Recursively filter children
        const visibleChildren = filterVisibleItems(item.children).filter(child => child.visible !== false)

        // Only return the item if it has visible children or no visibility restrictions
        if (visibleChildren.length > 0) {
          return {
            ...item,
            children: visibleChildren // Return only visible children
          }
        }

        return null // If no visible children, return null
      }

      return item.visible !== false ? item : null // Return the item only if it is visible
    })
    .filter(item => item !== null) // Filter out nulls
}

export const checkAuthorizedRoute = (requiredPermission, router, userProfile) => {
  if (hasPermission(userProfile, requiredPermission)) {
    return true
  } else {
    router.push('/unauthorized')
    return false
  }
}

export const displayContactData = row => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <div>
        {row?.primaryContact?.firstName} {row?.primaryContact?.lastName}
      </div>
      <Typography sx={{ fontSize: '12px', color: '#818181' }}>{row?.emailAddress}</Typography>{' '}
    </Box>
  )
}
export function clearDateRangeReduxStore(dispatch) {
  dispatch(resetPurchaseOrder())
  dispatch(resetPurchasePackage())
  dispatch(resetPurchaseShipment())
  dispatch(resetPurchasePayment())
  dispatch(resetQuotation())
  dispatch(resetSalesOrder())
  dispatch(resetInvoice())
  dispatch(resetPackage())
  dispatch(resetSalesPayment())
  dispatch(resetTrading())
  dispatch(resetExpenses())
}
export function clearReduxStore(dispatch) {
  dispatch(resetWarehouse())
  dispatch(resetProducts())
  dispatch(resetStock())
  dispatch(resetCustomer())
  dispatch(resetVendor())
  dispatch(resetSalesModule())
  dispatch(resetFinancialAccounts())
  dispatch(resetAccountTransaction())
  dispatch(resetPurchaseSetting())
  dispatch(resetTaxSettings())
  dispatch(resetTaxAuthorities())
  dispatch(resettaxStatement())
  dispatch(resettaxPayments())
  dispatch(resetOtherSettings())
  dispatch(resetGeneralSetting())
  dispatch(resetPriceList())
  clearDateRangeReduxStore(dispatch)
}

export function groupAccountsByCurrencyAndType(accounts) {
  const grouped = accounts.reduce((acc, account) => {
    const { currency, accountType } = account

    if (!acc[currency]) {
      acc[currency] = {}
    }

    if (!acc[currency][accountType]) {
      acc[currency][accountType] = []
    }

    acc[currency][accountType].push(account)

    return acc
  }, {})

  const sortedGrouped = Object.keys(grouped)
    .sort((a, b) => a.localeCompare(b))
    .map(currency => ({
      currency,
      accountTypes: Object.keys(grouped[currency]).map(accountType => ({
        accountType,
        accounts: grouped[currency][accountType]
      }))
    }))

  return sortedGrouped
}
