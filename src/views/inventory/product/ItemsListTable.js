// ** Next Import
import Link from 'next/link'
import Router from 'next/router'
import { useEffect, useState } from 'react'
import { alpha } from '@mui/material/styles'
import {
  IconButton,
  Box,
  MenuItem,
  Divider,
  Button,
  Grid,
  Typography,
  Popover,
  Tooltip,
  LinearProgress,
  Chip,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import { resetProductFilters, resetProducts, setProductFilters, setSelectedProduct } from 'src/store/apps/products'
import { useDispatch, useSelector } from 'react-redux'
import {
  dataTextStyles,
  dataTitleStyles,
  getOnFocusConfig,
  hasPermission,
  NumberFormat,
  toTitleCase
} from 'src/common-functions/utils/UtilityFunctions'
import CustomNoRowsOverlay from 'src/common-components/CustomNoRowsOverlay'
import CommonStyledMenu from 'src/common-components/CommonStyledMenu'
import { GetItemLedgerBalanceByItemIdsQuery } from 'src/@core/components/graphql/item-queries'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { DELETE_ITEM, EDIT_ITEM, VIEW_ITEM } from 'src/common-functions/utils/Constants'
import DeleteItem from '../actions/DeleteItem'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import MobileDataGrid from 'src/common-components/MobileDataGrid'
import { useIsLaptop } from 'src/hooks/IsDesktop'
import { Circle, Close } from '@mui/icons-material'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import RefreshIcon from '@mui/icons-material/Refresh'
import { tags } from 'src/@fake-db/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomChip from 'src/@core/components/mui/chip'
import ShowItemImages from './ShowItemImages'

const ItemsListTable = ({ productsData, tenantId, loading }) => {
  const router = Router
  const dispatch = useDispatch()
  const userProfile = useSelector(state => state.userProfile)
  const isLaptop = useIsLaptop()
  const { currencies } = useCurrencies()

  const {
    selectedTag,
    selectedManufacturer,
    selectedClass,
    selectedCategory,
    selectedBrand,
    inStockItem,
    outOfStockItem,
    stockFrom,
    stockTo
  } = useSelector(state => state.products?.filters ?? {})

  const filters = {
    selectedTag: Boolean(selectedTag),
    selectedManufacturer: Boolean(selectedManufacturer),
    selectedClass: Boolean(selectedClass),
    selectedCategory: Boolean(selectedCategory),
    selectedBrand: Boolean(selectedBrand),
    inStockItem: Boolean(inStockItem),
    outOfStockItem: Boolean(outOfStockItem),
    stockFrom: stockFrom !== '' && stockFrom != null && stockFrom != 0,
    stockTo: stockTo !== '' && stockTo != null && stockTo != 0
  }

  const anyFilterActive = Object.values(filters).some(Boolean)

  // State for active filters
  const [isFilterActive, setFilterActive] = useState({
    filterActive: anyFilterActive,
    ...filters
  })

  const { products = [], settings = {} } = productsData || {}
  const [openDialog, setOpenDialog] = useState(false)
  const selectedProduct = useSelector(state => state.products?.selectedProduct) || {}
  const [anchorElMap, setAnchorElMap] = useState({})
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchedProduct, setSearchedProduct] = useState(null)
  const [anchorEl, setAnchorEl] = useState(null)
  const [temporaryFilterData, setTemporaryFilterData] = useState([])

  const [availableQty, setAvailableQty] = useState([])

  const open = Boolean(anchorEl)

  const handleClick = (event, row) => {
    dispatch(setSelectedProduct(row))
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.itemId] = event.currentTarget
    setAnchorElMap(updatedAnchorElMap)
  }

  const handleClose = row => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.itemId] = null
    setAnchorElMap(updatedAnchorElMap)
  }

  const handleDelete = row => {
    handleClose(row)
    setOpenDialog(true)
  }

  const getAvailableQty = async () => {
    const itemIds = products?.map(item => item.itemId)?.filter(itemId => itemId) || []
    try {
      const response = await fetchData(GetItemLedgerBalanceByItemIdsQuery(tenantId, itemIds))
      const state = response?.getItemLedgerBalanceByItemIds

      const filterData = state.reduce((acc, index) => {
        if (!acc[index.itemId]) {
          acc[index.itemId] = { items: [], totalAvailableQty: 0 }
        }
        acc[index.itemId].items.push(index)
        acc[index.itemId].totalAvailableQty += index.availableQty
        return acc
      }, {})

      setAvailableQty(filterData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  useEffect(() => {
    if (products?.length > 0) {
      getAvailableQty()
    }
  }, [products, tenantId])

  // const handleRowClick = params => {
  //   router.push(`/inventory/products/view/${params?.row?.itemId}`)
  // }

  const mobileColumns = [
    {
      field: 'itemCode',
      headerName: '',
      flex: 0.9,
      sortable: false,
      renderCell: ({ row }) => {
        const itemId = row.itemId
        const qty = availableQty[itemId]?.totalAvailableQty || 0
        const sellingCurrency = currencies?.find(val => val?.currencyId === row?.sellingPriceCurrency)
        const purchaseCurrency = currencies?.find(val => val?.currencyId === row?.purchasePriceCurrency)

        return (
          <Box sx={{ width: '100%', p: 2 }}>
            <Grid container spacing={3} sx={{ alignItems: 'center' }}>
              <Grid item xs={11}>
                <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                  <Grid item xs={5} sm={4} md={4} lg={3} xl={6}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <ShowItemImages product={row} />
                      <div>
                        <Typography sx={{ ...dataTextStyles, fontSize: '14px', fontWeight: 500, lineHeight: '26px' }}>
                          {row.itemName || ''}
                        </Typography>
                        <Typography sx={{ ...dataTitleStyles, color: '#818181' }}>
                          <span style={{ verticalAlign: 'middle', marginRight: '5px', color: '#696969' }}>#</span>
                          {row.itemCodePrefix || ''}
                          {row.itemCode || ''}
                        </Typography>
                        {qty > 0 ? (
                          <Chip
                            icon={<Circle sx={{ width: '10px' }} />}
                            sx={{ border: '0px', height: '20px', mt: 1 }}
                            color={qty > row.lowStockThreshold ? 'success' : 'warning'}
                            label={qty > row.lowStockThreshold ? 'In Stock' : 'Low Stock'}
                            variant='outlined'
                          />
                        ) : (
                          <Chip
                            icon={<Circle sx={{ width: '10px' }} />}
                            sx={{ border: '0px', height: '20px' }}
                            color='error'
                            label='Out of Stock'
                            variant='outlined'
                          />
                        )}{' '}
                      </div>
                    </Box>
                  </Grid>

                  <Grid item xs={0} sm={0} md={2} lg={2} xl={1.5} sx={{ display: { xs: 'none', md: 'block' } }}>
                    <Typography sx={dataTextStyles}>
                      <span style={{ textTransform: 'capitalize' }}>{row?.itemGroup || '-'}</span>
                    </Typography>
                    <Typography sx={dataTitleStyles}>Item Group</Typography>
                  </Grid>

                  <Grid item xs={4} sm={3} md={2} lg={2} xl={1.5}>
                    <Typography sx={dataTextStyles}>
                      {row?.sellingPrice ? <NumberFormat value={row?.sellingPrice} currency={sellingCurrency} /> : '-'}
                    </Typography>
                    <Typography sx={dataTitleStyles}>
                      Selling Price <br />
                      <span style={{ fontSize: '11px' }}>
                        {row?.sellingPriceTaxInclusive ? '(Tax Inclusive)' : '(Tax Exclusive)'}
                      </span>
                    </Typography>
                  </Grid>

                  <Grid item xs={0} sm={3} md={2} lg={2} xl={1.5} sx={{ display: { xs: 'none', sm: 'block' } }}>
                    <Typography sx={dataTextStyles}>
                      {row?.purchasePrice ? (
                        <NumberFormat value={row?.purchasePrice} currency={purchaseCurrency} />
                      ) : (
                        '-'
                      )}
                    </Typography>
                    <Typography sx={dataTitleStyles}>Purchase Price</Typography>
                  </Grid>

                  <Grid item xs={3} sm={2} md={2} lg={2} xl={1.5}>
                    <Typography sx={dataTextStyles}>{qty || '-'}</Typography>
                    <Typography sx={dataTitleStyles}>Available Qty</Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={1}>
                {isLaptop ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    {hasPermission(userProfile, VIEW_ITEM) && (
                      <IconButton
                        component={Link}
                        scroll={true}
                        href={`/inventory/products/view/${row.itemId}`}
                        onClick={event => {
                          event.stopPropagation()
                          dispatch(setSelectedProduct(row))
                        }}
                      >
                        <Icon icon='tabler:eye' />
                      </IconButton>
                    )}
                    {hasPermission(userProfile, EDIT_ITEM) && (
                      <IconButton
                        component={Link}
                        scroll={true}
                        href={`/inventory/products/edit/${row.itemId}`}
                        onClick={event => {
                          event.stopPropagation()
                          dispatch(setSelectedProduct(row))
                        }}
                      >
                        <Icon icon='tabler:edit' />
                      </IconButton>
                    )}
                    {hasPermission(userProfile, DELETE_ITEM) && (
                      <IconButton
                        aria-label='more'
                        id='long-button'
                        aria-haspopup='true'
                        onClick={event => {
                          event.stopPropagation()
                          handleClick(event, row)
                        }}
                      >
                        <Icon icon='iconamoon:menu-kebab-vertical-circle-light' width={25} height={25} />
                      </IconButton>
                    )}
                    <CommonStyledMenu
                      anchorEl={anchorElMap[row.itemId]}
                      open={Boolean(anchorElMap[row.itemId])}
                      onClose={() => handleClose(row)}
                    >
                      <MenuItem
                        onClick={() => handleDelete(row)}
                        sx={{
                          color: theme => theme?.palette?.error?.main,
                          '&:hover': {
                            color: theme => theme?.palette?.error?.main + ' !important',
                            backgroundColor: theme =>
                              alpha(theme.palette.error.main, theme.palette.action.selectedOpacity) + ' !important'
                          }
                        }}
                      >
                        <Icon icon='mingcute:delete-2-line' color='inherit' />
                        Delete
                      </MenuItem>
                    </CommonStyledMenu>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    {(hasPermission(userProfile, VIEW_ITEM) ||
                      hasPermission(userProfile, EDIT_ITEM) ||
                      hasPermission(userProfile, DELETE_ITEM)) && (
                      <>
                        <IconButton
                          aria-label='more'
                          id='long-button'
                          aria-haspopup='true'
                          onClick={event => {
                            event.stopPropagation()
                            handleClick(event, row)
                          }}
                        >
                          <Icon icon='iconamoon:menu-kebab-vertical-circle-light' width={27} height={27} />
                        </IconButton>
                        <CommonStyledMenu
                          anchorEl={anchorElMap[row.itemId]}
                          open={Boolean(anchorElMap[row.itemId])}
                          onClose={() => handleClose(row)}
                        >
                          {hasPermission(userProfile, VIEW_ITEM) && (
                            <MenuItem component={Link} scroll={true} href={`/inventory/products/view/${row.itemId}`}>
                              <Icon icon='tabler:eye' />
                              View
                            </MenuItem>
                          )}
                          {hasPermission(userProfile, EDIT_ITEM) && (
                            <MenuItem component={Link} scroll={true} href={`/inventory/products/edit/${row.itemId}`}>
                              <Icon icon='tabler:edit' />
                              Edit
                            </MenuItem>
                          )}
                          {hasPermission(userProfile, DELETE_ITEM) && (
                            <MenuItem
                              sx={{
                                color: theme => theme?.palette?.error?.main,
                                '&:hover': {
                                  color: theme => theme?.palette?.error?.main + ' !important',
                                  backgroundColor: theme =>
                                    alpha(theme.palette.error.main, theme.palette.action.selectedOpacity) +
                                    ' !important'
                                }
                              }}
                              onClick={() => handleDelete(row)}
                            >
                              <Icon icon='mingcute:delete-2-line' />
                              Delete
                            </MenuItem>
                          )}
                        </CommonStyledMenu>
                      </>
                    )}
                  </Box>
                )}
              </Grid>
            </Grid>
          </Box>
        )
      }
    }
  ]

  const handleFilterClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleFilterClose = () => {
    const filter = {
      selectedTag: isFilterActive.selectedTag ? selectedTag : null,
      selectedManufacturer: isFilterActive.selectedManufacturer ? selectedManufacturer : null,
      selectedClass: isFilterActive.selectedClass ? selectedClass : null,
      selectedCategory: isFilterActive.selectedCategory ? selectedCategory : null,
      selectedBrand: isFilterActive.selectedBrand ? selectedBrand : null,
      inStockItem: isFilterActive.inStockItem ? inStockItem : false,
      outOfStockItem: isFilterActive.outOfStockItem ? outOfStockItem : false,
      stockFrom: isFilterActive.stockFrom ? stockFrom : 0,
      stockTo: isFilterActive.stockTo ? stockTo : 0
    }
    dispatch(setProductFilters(filter))
    setAnchorEl(null)
  }

  const handleReset = async () => {
    setAnchorEl(null)
    dispatch(resetProductFilters())
    setFilteredProducts([])
    setTemporaryFilterData([])
    setFilterActive({
      filterActive: false,
      selectedTag: false,
      selectedManufacturer: false,
      selectedClass: false,
      selectedCategory: false,
      selectedBrand: false,
      outOfStockItem: false,
      inStockItem: false,
      stockFrom: false,
      stockTo: false
    })
  }

  useEffect(() => {
    handleDateRange()
  }, [products, availableQty])

  const handleDateRange = async (overrides = {}) => {
    const {
      selectedTag: selectedTagOverride = selectedTag,
      selectedClass: selectedClassOverride = selectedClass,
      selectedCategory: selectedCategoryOverride = selectedCategory,
      selectedBrand: selectedBrandOverride = selectedBrand,
      selectedManufacturer: selectedManufacturerOverride = selectedManufacturer,
      inStockItem: inStockItemOverride = inStockItem,
      outOfStockItem: outOfStockItemOverride = outOfStockItem,
      stockFrom: stockFromOverride = stockFrom,
      stockTo: stockToOverride = stockTo
    } = overrides

    setAnchorEl(null)

    const isSelectedCategory = Boolean(selectedCategoryOverride)
    const isSelectedBrand = Boolean(selectedBrandOverride)
    const isSelectedClass = Boolean(selectedClassOverride)
    const isSelectedManufacturer = Boolean(selectedManufacturerOverride)
    const isSelectedTag = Boolean(selectedTagOverride)
    const isInStockItem = Boolean(inStockItemOverride)
    const isOutOfStockItem = Boolean(outOfStockItemOverride)
    const isStockFrom = stockFromOverride !== '' && stockFromOverride != null && stockFromOverride != 0
    const isStockTo = stockToOverride !== '' && stockToOverride != null && stockToOverride != 0

    const anyFilterActive =
      isSelectedCategory ||
      isSelectedBrand ||
      isSelectedClass ||
      isSelectedManufacturer ||
      isSelectedTag ||
      isInStockItem ||
      isOutOfStockItem ||
      isStockFrom ||
      isStockTo

    try {
      if (products) {
        // Step 1: Filter by tag, brand, etc.
        let filteredData = products.filter(item => {
          return (
            (!selectedTagOverride || item?.tags?.includes(selectedTagOverride)) &&
            (!selectedBrandOverride || item.brand === selectedBrandOverride) &&
            (!selectedManufacturerOverride || item.manufacturer === selectedManufacturerOverride) &&
            (!selectedClassOverride || item.productClass === selectedClassOverride) &&
            (!selectedCategoryOverride || item.productCategory === selectedCategoryOverride)
          )
        })
        // Step 2: Apply stock filters
        if (isInStockItem || isOutOfStockItem) {
          filteredData = filteredData.filter(product => {
            const stock = availableQty[product.itemId]?.totalAvailableQty ?? 0
            if (!stock) return false
            if (isInStockItem) return stock > 0
            if (isOutOfStockItem) return stock <= 0
            return true
          })
        }

        if (isStockFrom || isStockTo) {
          const isStockFrom = stockFromOverride != null && stockFromOverride !== ''
          const isStockTo = stockToOverride != null && stockToOverride !== ''

          const stockFromNum = isStockFrom ? Number(stockFromOverride) : null
          const stockToNum = isStockTo ? Number(stockToOverride) : null

          filteredData = filteredData.filter(product => {
            const stock = Number(availableQty[product.itemId]?.totalAvailableQty)
            if (isNaN(stock)) return false
            const fromCondition = stockFromNum !== null ? stock >= stockFromNum : true
            const toCondition = stockToNum !== null ? stock <= stockToNum : true

            return fromCondition && toCondition
          })
        }

        setFilterActive({
          filterActive: anyFilterActive,
          selectedTag: isSelectedTag,
          selectedManufacturer: isSelectedManufacturer,
          selectedClass: isSelectedClass,
          selectedBrand: isSelectedBrand,
          selectedCategory: isSelectedCategory,
          inStockItem: isInStockItem,
          outOfStockItem: isOutOfStockItem,
          stockFrom: isStockFrom,
          stockTo: isStockTo
        })
        setTemporaryFilterData(anyFilterActive ? filteredData : [])
        setFilteredProducts(anyFilterActive ? filteredData : [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      console.log('Fetched data successfully')
    }
  }

  const updateFilter = (key, value) => {
    dispatch(setProductFilters({ [key]: value }))
  }

  const handleFilters = (overrides = {}) => {
    handleDateRange(overrides)
  }

  const handleSearchChange = (event, newValue) => {
    const searchValue = newValue ? newValue.toLowerCase() : ''

    if (searchValue) {
      const matchedProducts = products.filter(product => {
        const combinedLabel = `${product.itemCode}-${product.itemName}`.toLowerCase()
        return (
          combinedLabel.includes(searchValue) ||
          product.itemName.toLowerCase().includes(searchValue) ||
          (product.itemDescription && product.itemDescription.toLowerCase().includes(searchValue)) ||
          product.itemCode.includes(searchValue)
        )
      })

      setFilteredProducts(matchedProducts.length > 0 ? matchedProducts : temporaryFilterData)
    } else {
      setFilteredProducts(temporaryFilterData)
      setSearchedProduct('')
    }
  }
  const handleCheckboxChange = key => {
    if (key === 'inStockItem') {
      updateFilter('inStockItem', true)
      updateFilter('outOfStockItem', false)
    } else if (key === 'outOfStockItem') {
      updateFilter('outOfStockItem', true)
      updateFilter('inStockItem', false)
    }
  }
  const isStockRangeInvalid =
    stockFrom !== '' && stockTo !== '' && !isNaN(stockFrom) && !isNaN(stockTo) && Number(stockFrom) > Number(stockTo)

  return (
    <>
      <Grid container spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Grid item xs={7} sm={4} md={4} lg={4} xl={4}>
          <CustomAutocomplete
            options={filteredProducts.length > 0 || isFilterActive.filterActive ? filteredProducts : products}
            getOptionLabel={option => {
              if (!option) return ''
              const product = products.find(cust => cust.itemId === option.itemId)
              const displayName = product?.itemName || ''
              return `${option.itemCode}-${displayName}`.trim()
            }}
            isOptionEqualToValue={(option, value) => option.itemId === value.itemId} // Ensure proper selection matching
            value={searchedProduct || null} // Keep selected product
            onChange={(event, newValue) => setSearchedProduct(newValue)}
            onInputChange={(event, newValue) => handleSearchChange(event, newValue)}
            disableClearable={false}
            filterOptions={options => options} // Prevent default filtering
            renderInput={params => <CustomTextField {...params} fullWidth label='Products' />}
          />
        </Grid>
        <Grid item xs={5} sm={6} md={6} lg={6} xl={6}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 3
            }}
          >
            <Tooltip title='Reload' placement='top'>
              <IconButton
                color='default'
                onClick={() => {
                  dispatch(resetProducts())
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant='outlined'
              startIcon={<Icon icon='ion:filter' />}
              aria-describedby='filter-popover'
              onClick={handleFilterClick}
            >
              Filter
            </Button>
            <Popover
              id='filter-popover'
              open={open}
              anchorEl={anchorEl}
              onClose={handleFilterClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              sx={{ mt: 2 }}
            >
              <Box sx={{ py: 0, maxWidth: 400 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, py: 4, background: '#f1f1f1' }}>
                  <Typography sx={{ fontSize: '14px', lineHeight: '23px' }}> Filters</Typography>
                </Box>
                <Divider sx={{ mb: 3, opacity: 0.5 }} color='primary' />
                <Grid container spacing={3} sx={{ px: 3, mb: 2 }}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Checkbox
                        sx={{ p: '4px' }}
                        checked={inStockItem}
                        onChange={() => handleCheckboxChange('inStockItem')}
                      />
                      <Typography sx={{ fontSize: '13px', lineHeight: '23px' }}>In Stock</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Checkbox
                        sx={{ p: '4px' }}
                        checked={outOfStockItem}
                        onChange={() => handleCheckboxChange('outOfStockItem')}
                      />
                      <Typography sx={{ fontSize: '13px', lineHeight: '23px' }}>Out of Stock</Typography>
                    </Box>
                  </Grid>
                </Grid>
                <Grid container spacing={3} sx={{ px: 3, mb: 2 }}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 4, mb: 2 }}>
                      {/* <Typography sx={{ fontSize: '13px', lineHeight: '23px' }}>Stock From</Typography> */}
                      <Button type='button' onClick={() => updateFilter(stockFrom, 0)}>
                        Reset
                      </Button>
                    </Box>
                    <CustomTextField
                      fullWidth
                      label='Stock From'
                      value={stockFrom}
                      onChange={event => updateFilter('stockFrom', event.target.value)}
                      type='number'
                      error={isStockRangeInvalid}
                      helperText={isStockRangeInvalid ? 'From must be less than To' : ''}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 4, mb: 2 }}>
                      {/* <Typography sxx={{ fontSize: '13px', lineHeight: '23px' }}>Stock To</Typography> */}
                      <Button type='button' onClick={() => updateFilter(stockTo, 0)}>
                        Reset
                      </Button>
                    </Box>
                    <CustomTextField
                      fullWidth
                      label='Stock To'
                      value={stockTo}
                      onChange={event => updateFilter('stockTo', event.target.value)}
                      type='number'
                      error={isStockRangeInvalid}
                      helperText={isStockRangeInvalid ? 'To must be grater than From' : ''}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={3} sx={{ px: 3, mb: 2 }}>
                  {[
                    { label: 'Tags', value: selectedTag, key: 'selectedTag', options: tags },
                    {
                      label: 'Manufacturer',
                      value: selectedManufacturer,
                      key: 'selectedManufacturer',
                      options: settings?.manufacturer || []
                    },
                    {
                      label: 'Brand',
                      value: selectedBrand,
                      key: 'selectedBrand',
                      options: settings?.brand || []
                    },
                    {
                      label: 'Category',
                      value: selectedCategory,
                      key: 'selectedCategory',
                      options: settings?.productCategory || []
                    },
                    {
                      label: 'Class',
                      value: selectedClass,
                      key: 'selectedClass',
                      options: settings?.productClass || []
                    }
                  ].map(({ label, value, key, options }, index) => (
                    <Grid item xs={6} key={index}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, mb: 2 }}>
                        <Typography sx={{ fontSize: '13px', lineHeight: '23px' }}>{label}</Typography>

                        <Button type='button' onClick={() => updateFilter(key, null)}>
                          Reset
                        </Button>
                      </Box>
                      <CustomAutocomplete
                        fullWidth
                        options={options}
                        value={toTitleCase(value)}
                        onChange={(event, newValue) => updateFilter(key, newValue)}
                        getOptionLabel={option => toTitleCase(option)}
                        renderInput={params => <CustomTextField {...params} />}
                      />
                    </Grid>
                  ))}
                </Grid>
                <Divider sx={{ mt: 2, opacity: 0.5 }} color='primary' />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 3, py: 2 }}>
                  <Button variant='outlined' type='button' onClick={handleReset}>
                    Reset All
                  </Button>
                  <Button variant='contained' onClick={handleFilters}>
                    Apply
                  </Button>
                </Box>
              </Box>
            </Popover>
          </Box>
        </Grid>
        {(isFilterActive.filterCustomer ||
          isFilterActive.selectedCategory ||
          isFilterActive.selectedClass ||
          isFilterActive.selectedBrand ||
          isFilterActive.selectedTag ||
          isFilterActive.inStockItem ||
          isFilterActive.outOfStockItem ||
          isFilterActive.stockFrom ||
          isFilterActive.stockTo) && (
          <Grid item xs={12}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end'
              }}
            >
              <Typography
                sx={{
                  fontSize: '14px',
                  lineHeight: '23px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                Filtered By:
                {(inStockItem || outOfStockItem) && (isFilterActive.inStockItem || isFilterActive.outOfStockItem) && (
                  <CustomChip
                    label={inStockItem ? `In Stock` : 'Out Of Stock'}
                    onDelete={() => {
                      updateFilter('inStockItem', false)
                      updateFilter('outOfStockItem', false)
                      handleFilters({ inStockItem: false, outOfStockItem: false })
                    }}
                    deleteIcon={<Close sx={{ color: theme => theme.palette.primary.main }} />}
                    skin='light'
                    color='primary'
                  />
                )}
                {(isFilterActive.stockFrom || isFilterActive.stockTo) && (
                  <CustomChip
                    label={`Availablt Qty: ${stockFrom} - ${stockTo}`}
                    onDelete={() => {
                      updateFilter('stockFrom', 0)
                      updateFilter('stockTo', 0)
                      handleFilters({ stockFrom: 0, stockTo: 0 })
                    }}
                    deleteIcon={<Close sx={{ color: theme => theme.palette.primary.main }} />}
                    skin='light'
                    color='primary'
                  />
                )}
                {selectedTag && isFilterActive.selectedTag && (
                  <CustomChip
                    label={`Tag: ${selectedTag}`}
                    onDelete={() => {
                      updateFilter('selectedTag', null)
                      handleFilters({ selectedTag: null })
                    }}
                    deleteIcon={<Close sx={{ color: theme => theme.palette.primary.main }} />}
                    skin='light'
                    color='primary'
                  />
                )}
                {selectedManufacturer && isFilterActive.selectedManufacturer && (
                  <CustomChip
                    label={`Manufacturer: ${selectedManufacturer}`}
                    onDelete={() => {
                      updateFilter('selectedManufacturer', null)
                      handleFilters({ selectedManufacturer: null })
                    }}
                    deleteIcon={<Close sx={{ color: theme => theme.palette.primary.main }} />}
                    skin='light'
                    color='primary'
                  />
                )}
                {selectedClass && isFilterActive.selectedClass && (
                  <CustomChip
                    label={`Class: ${selectedClass}`}
                    onDelete={() => {
                      updateFilter('selectedClass', null)
                      handleFilters({ selectedClass: null })
                    }}
                    deleteIcon={<Close sx={{ color: theme => theme.palette.primary.main }} />}
                    skin='light'
                    color='primary'
                  />
                )}
                {selectedCategory && isFilterActive.selectedCategory && (
                  <CustomChip
                    label={`Class: ${selectedCategory}`}
                    onDelete={() => {
                      updateFilter('selectedCategory', null)
                      handleFilters({ selectedCategory: null })
                    }}
                    deleteIcon={<Close sx={{ color: theme => theme.palette.primary.main }} />}
                    skin='light'
                    color='primary'
                  />
                )}
                {selectedBrand && isFilterActive.selectedBrand && (
                  <CustomChip
                    label={`Brand: ${selectedBrand}`}
                    onDelete={() => {
                      updateFilter('selectedBrand', null)
                      handleFilters({ selectedBrand: null })
                    }}
                    deleteIcon={<Close sx={{ color: theme => theme.palette.primary.main }} />}
                    skin='light'
                    color='primary'
                  />
                )}
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* {selectedRows?.length > 0 && hasPermission(userProfile, DELETE_ITEM) && (
        <Box sx={{ display: 'flex', justifyContent: 'end' }}>
          <Button
            color='error'
            variant='outlined'
            startIcon={<Icon icon='mingcute:delete-2-line' color='inherit' />}
            onClick={() => setOpenDeleteDialog(true)}
          >
            Delete All
          </Button>
        </Box>
      )} */}
      {loading ? (
        <LinearProgress />
      ) : (
        <MobileDataGrid
          rows={filteredProducts.length > 0 || isFilterActive.filterActive ? filteredProducts : products}
          columns={mobileColumns}
          getRowId={row => row.itemId}
          initialState={{
            sorting: {
              sortModel: [{ field: 'itemCode', sort: 'desc' }]
            }
          }}
          styles={{
            '& .MuiDataGrid-row:hover': {
              cursor: 'pointer'
            }
          }}
          onCellClick={(params, event) => {
            event.defaultMuiPrevented = false
          }}
          onRowClick={(params, event) => {
            if (event.target.closest('.MuiButton-root')) {
              event.defaultMuiPrevented = true
              return
            }
            dispatch(setSelectedProduct(params?.row))
            router.push(`/inventory/products/view/${params?.row?.itemId}`)
          }}
          slots={{
            columnHeaders: () => null,
            noRowsOverlay: CustomNoRowsOverlay
          }}
          slotProps={{
            noRowsOverlay: {
              mainText: 'Empty Products',
              subText: 'No product available here. Click "Add New" button above to get started.'
            }
          }}
        />
      )}
      {openDialog && (
        <DeleteItem
          tenantId={selectedProduct?.tenantId}
          itemId={selectedProduct?.itemId}
          image={selectedProduct?.image}
          openDialog={openDialog}
          setOpenDialog={setOpenDialog}
        />
      )}
    </>
  )
}

export default ItemsListTable
