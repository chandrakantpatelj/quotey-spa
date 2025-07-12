import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { sortByDateFirstThenOrderNo, toTitleCase } from 'src/common-functions/utils/UtilityFunctions'
import { resetSalesOrderFilters } from 'src/store/apps/sales'

import { DynamicFilterBar, ShowAppliedFilterChip } from 'src/common-components/DynamicFilterBar'
import { resetFinancialAccounts, setFinancialAccountFilters } from 'src/store/apps/financial-Accounts'

const AccountingAccountFilter = ({
  listData,
  setFilteredData,
  isFilterActive,
  setFilterActive,
  setTemporaryFilterData,
  setSearchedData
}) => {
  const dispatch = useDispatch()
  const [anchorEl, setAnchorEl] = useState(null)
  const { filterCategory, filterType } = useSelector(state => state.listData?.filters ?? {})

  const filters = {
    filterCategory: Boolean(filterCategory),
    filterType: Boolean(filterType)
  }

  const anyFilterActive = Object.values(filters).some(Boolean)

  useEffect(() => {
    setFilterActive({
      filterActive: anyFilterActive,
      ...filters
    })
  }, [])

  const [localFilterObject, setLocalFilterObject] = useState({
    filterCategory,
    filterType
  })

  const accountCategoryOptions = useMemo(
    () => [...new Set(listData?.map(item => item.accountCategory).filter(Boolean))],
    [listData]
  )

  const accountTypeOptions = useMemo(
    () => [...new Set(listData?.map(item => item.accountType).filter(Boolean))],
    [listData]
  )

  const handleFilterClick = event => {
    setAnchorEl(event.currentTarget)
  }
  const updateFilter = object => {
    const serializableObject = {
      ...object
    }
    dispatch(setFinancialAccountFilters(serializableObject))
  }

  const handleFilterLogicFromAppliedFilterChip = (key, value) => {
    handleSetLocalFilterData(key, value)
    handleFilters({ [key]: value })
  }

  const handleSetLocalFilterData = (key, value) => {
    setLocalFilterObject(prev => ({ ...prev, [key]: value }))
  }

  const handleFilterClose = () => {
    setLocalFilterObject({
      filterType,
      filterCategory
    })
    setAnchorEl(null)
  }

  useEffect(() => {
    handleDateRange()
  }, [listData])

  const handleDateRange = async (overrides = {}) => {
    try {
      const {
        filterType: typeOverride = localFilterObject.filterType,
        filterCategory: categoryOverride = localFilterObject.filterCategory
      } = overrides

      const isFilterTypeOverride = Boolean(typeOverride)
      const isFilterCategory = Boolean(categoryOverride)
      const anyFilterActive = isFilterTypeOverride || isFilterCategory

      const filteredData = listData?.filter(item => {
        const typeMatches = typeOverride ? typeOverride === item.accountType : true
        const categoryMatches = categoryOverride ? categoryOverride === item.accountCategory : true

        return typeMatches && categoryMatches
      })

      setFilterActive({
        filterActive: anyFilterActive,
        filterType: isFilterTypeOverride,
        filterCategory: isFilterCategory
      })

      setTemporaryFilterData(anyFilterActive ? sortByDateFirstThenOrderNo(filteredData) : [])
      setFilteredData(anyFilterActive ? sortByDateFirstThenOrderNo(filteredData) : [])
      setSearchedData(null)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setAnchorEl(null)
    }
  }
  const handleFilters = overrides => {
    updateFilter(overrides)
    handleDateRange(overrides)
  }

  const handleReset = async () => {
    setAnchorEl(null)
    dispatch(resetSalesOrderFilters())
    setFilterActive({
      filterActive: false,
      filterType: false,
      filterCategory: false
    })

    setLocalFilterObject({
      filterType: null,
      filterCategory: null
    })
    setFilteredData([])
  }

  const componentsWithOptionsLabel = [
    {
      key: 'filterType',
      label: 'Account Type',
      filterKey: 'filterType',
      options: accountTypeOptions,
      value: localFilterObject.filterType,
      getOptionLabel: option => toTitleCase(option) || ''
    },
    {
      key: 'filterCategory',
      label: 'Account Category',
      filterKey: 'filterCategory',
      options: accountCategoryOptions,
      value: localFilterObject.filterCategory,
      getOptionLabel: option => toTitleCase(option) || ''
    }
  ]

  return (
    <>
      <DynamicFilterBar
        onReloadStore={() => {
          dispatch(resetFinancialAccounts())
        }}
        handleFilterClick={handleFilterClick}
        anchorEl={anchorEl}
        onClose={handleFilterClose}
        handleReset={handleReset}
        handleApply={handleFilters}
        localFilterObject={localFilterObject}
        handleSetLocalFilterData={handleSetLocalFilterData}
        showDateFilter={false}
        entityFilterComponents={componentsWithOptionsLabel}
      />

      <ShowAppliedFilterChip
        isFilterActive={isFilterActive}
        handleFilterLogicFromAppliedFilterChip={handleFilterLogicFromAppliedFilterChip}
        localFilterObject={localFilterObject}
      />
    </>
  )
}

export default AccountingAccountFilter
