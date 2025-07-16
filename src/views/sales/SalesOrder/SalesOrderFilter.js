import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { GetSalesOrdersByDateRangeQuery } from 'src/@core/components/graphql/sales-order-queries'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { DateFunction, sortByDateFirstThenOrderNo, toTitleCase } from 'src/common-functions/utils/UtilityFunctions'
import { resetSalesOrder, resetSalesOrderFilters, setSalesOrderFilters } from 'src/store/apps/sales'

import { DynamicFilterBar, ShowAppliedFilterChip } from 'src/common-components/DynamicFilterBar'
import useCustomers from 'src/hooks/getData/useCustomers'
import useDateRangeDefaults from 'src/hooks/getData/useDateRangeDefaults'

const SalesOrderFilter = ({
  salesOrders,
  setFilteredSO,
  isFilterActive,
  setFilterActive,
  setTemporaryFilterData,
  setSearchedSO
}) => {
  const dispatch = useDispatch()
  const [anchorEl, setAnchorEl] = useState(null)
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId)
  const { customers } = useCustomers(tenantId)
  const { oneMonthAgoDate, todayDate } = useDateRangeDefaults()
  console.log('oneMonthAgoDate', oneMonthAgoDate)

  const {
    filterStartDate: rawStartDate,
    filterEndDate: rawEndDate,
    filterStatus,
    filterPaymentStatus,
    filterDeliveryStatus,
    filterCustomer
  } = useSelector(state => state.sales?.filters ?? {})

  const filterStartDate = new Date(rawStartDate ?? oneMonthAgoDate)
  const filterEndDate = new Date(rawEndDate ?? todayDate)

  const isStartDateChanged = filterStartDate.toDateString() !== oneMonthAgoDate.toDateString()
  const isEndDateChanged = filterEndDate.toDateString() !== todayDate.toDateString()

  const filters = {
    filterStartDate: isStartDateChanged,
    filterEndDate: isEndDateChanged,
    filterCustomer: Boolean(filterCustomer),
    filterStatus: Boolean(filterStatus),
    filterPaymentStatus: Boolean(filterPaymentStatus),
    filterDeliveryStatus: Boolean(filterDeliveryStatus)
  }

  const anyFilterActive = Object.values(filters).some(Boolean)

  useEffect(() => {
    setFilterActive({
      filterActive: anyFilterActive,
      ...filters
    })
  }, [])

  const [localFilterObject, setLocalFilterObject] = useState({
    filterStartDate,
    filterEndDate,
    filterStatus,
    filterPaymentStatus,
    filterDeliveryStatus,
    filterCustomer
  })

  useEffect(() => {
    setLocalFilterObject(prev => ({
      ...prev,
      filterStartDate: new Date(rawStartDate ?? oneMonthAgoDate),
      filterEndDate: new Date(rawEndDate ?? todayDate)
    }))
  }, [oneMonthAgoDate, todayDate, rawStartDate, rawEndDate])

  const deliveryStatusOptions = useMemo(
    () => [...new Set(salesOrders?.map(item => item.deliveryStatus).filter(Boolean))],
    [salesOrders]
  )

  const paymentStatusOptions = useMemo(
    () => [...new Set(salesOrders?.map(item => item.paymentStatus).filter(Boolean))],
    [salesOrders]
  )

  const statusOptions = useMemo(
    () => [...new Set(salesOrders?.map(item => item.status).filter(Boolean))],
    [salesOrders]
  )

  const customerFilterOptions = useMemo(
    () => [
      ...new Map(
        salesOrders
          ?.map(item => {
            if (item?.customerId) {
              const customer = customers.find(customer => customer.customerId === item.customerId)
              return customer ? { customerId: customer.customerId, customerName: customer.customerName } : null
            }
            return null
          })
          .filter(Boolean)
          .map(c => [c.customerId, c]) // Use Map to ensure uniqueness by customerId
      ).values()
    ],
    [salesOrders, customers]
  )

  const handleFilterClick = event => {
    setAnchorEl(event.currentTarget)
  }
  const updateFilter = object => {
    const serializableObject = {
      ...object,
      filterStartDate: object.filterStartDate?.toISOString?.() || null,
      filterEndDate: object.filterEndDate?.toISOString?.() || null
    }
    dispatch(setSalesOrderFilters(serializableObject))
  }

  const handleFilterLogicFromAppliedFilterChip = (key, value) => {
    handleSetLocalFilterData(key, value)
    handleFilters({ [key]: value })
  }

  const handleResetDateFilterFromAppliedFilterChip = () => {
    setLocalFilterObject(prev => ({ ...prev, filterStartDate: oneMonthAgoDate, filterEndDate: todayDate }))
    handleFilters({ filterStartDate: oneMonthAgoDate, filterEndDate: todayDate })
  }

  const handleSetLocalFilterData = (key, value) => {
    setLocalFilterObject(prev => ({ ...prev, [key]: value }))
  }

  const handleFilterClose = () => {
    setLocalFilterObject({
      filterStartDate,
      filterEndDate,
      filterStatus,
      filterPaymentStatus,
      filterDeliveryStatus,
      filterCustomer
    })
    setAnchorEl(null)
  }

  useEffect(() => {
    handleDateRange()
  }, [salesOrders])

  const handleDateRange = async (overrides = {}) => {
    try {
      let salesOrdersFilter = salesOrders
      const {
        filterCustomer: customerOverride = localFilterObject.filterCustomer,
        filterStatus: statusOverride = localFilterObject.filterStatus,
        filterPaymentStatus: paymentStatusOverride = localFilterObject.filterPaymentStatus,
        filterDeliveryStatus: deliveryStatusOverride = localFilterObject.filterDeliveryStatus,
        filterStartDate: startDateOverride = localFilterObject.filterStartDate,
        filterEndDate: endDateOverride = localFilterObject.filterEndDate
      } = overrides

      const isStartDateChanged = startDateOverride.toDateString() !== oneMonthAgoDate.toDateString()
      const isEndDateChanged = endDateOverride.toDateString() !== todayDate.toDateString()

      const isFilterPaymentStatus = Boolean(paymentStatusOverride)
      const isFilterCustomer = Boolean(customerOverride)
      const isFilterStatus = Boolean(statusOverride)
      const isFilterDeliveryStatus = Boolean(deliveryStatusOverride)
      const anyFilterActive =
        isStartDateChanged ||
        isEndDateChanged ||
        isFilterCustomer ||
        isFilterStatus ||
        isFilterPaymentStatus ||
        isFilterDeliveryStatus
      if (isStartDateChanged || isEndDateChanged) {
        const response = await fetchData(
          GetSalesOrdersByDateRangeQuery(tenantId, DateFunction(startDateOverride), DateFunction(endDateOverride))
        )
        salesOrdersFilter = response?.getSalesOrdersByDateRange || []

        // salesOrdersFilter = await fetchSalesOrders(filterStartDate, filterEndDate)
      }

      if (salesOrdersFilter) {
        const filteredData = salesOrdersFilter.filter(item => {
          const statusMatches = statusOverride ? item?.status === statusOverride : true
          const paymentStatusMatches = paymentStatusOverride ? item?.paymentStatus === paymentStatusOverride : true
          const deliveryStatusMatches = deliveryStatusOverride ? item?.deliveryStatus === deliveryStatusOverride : true
          const customerMatches = customerOverride?.customerId ? item?.customerId === customerOverride.customerId : true

          return statusMatches && customerMatches && paymentStatusMatches && deliveryStatusMatches
        })

        setFilterActive({
          filterActive: anyFilterActive,
          filterStartDate: isStartDateChanged,
          filterEndDate: isEndDateChanged,
          filterCustomer: isFilterCustomer,
          filterStatus: isFilterStatus,
          filterPaymentStatus: isFilterPaymentStatus,
          filterDeliveryStatus: isFilterDeliveryStatus
        })

        setTemporaryFilterData(anyFilterActive ? sortByDateFirstThenOrderNo(filteredData) : [])
        setFilteredSO(anyFilterActive ? sortByDateFirstThenOrderNo(filteredData) : [])
        setSearchedSO(null)
      }
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
      filterStartDate: false,
      filterEndDate: false,
      filterStatus: false,
      filterPaymentStatus: false,
      filterDeliveryStatus: false,
      filterCustomer: false
    })

    setLocalFilterObject({
      filterStartDate: oneMonthAgoDate,
      filterEndDate: todayDate,
      filterStatus: null,
      filterPaymentStatus: null,
      filterDeliveryStatus: null,
      filterCustomer: null
    })
    setFilteredSO([])
  }

  const componentsWithOptionsLabel = [
    {
      key: 'filterStatus',
      label: 'Status',
      filterKey: 'filterStatus',
      options: statusOptions,
      value: localFilterObject.filterStatus,
      getOptionLabel: option => toTitleCase(option) || ''
    },
    {
      key: 'filterDeliveryStatus',
      label: 'Delivery Status',
      filterKey: 'filterDeliveryStatus',
      options: deliveryStatusOptions,
      value: localFilterObject.filterDeliveryStatus,
      getOptionLabel: option => toTitleCase(option) || ''
    },
    {
      key: 'filterPaymentStatus',
      label: 'Payment Status',
      filterKey: 'filterPaymentStatus',
      options: paymentStatusOptions,
      value: localFilterObject.filterPaymentStatus,
      getOptionLabel: option => toTitleCase(option) || ''
    },
    {
      key: 'filterCustomer',
      label: 'Customer',
      filterKey: 'filterCustomer',
      options: customerFilterOptions,
      value: localFilterObject.filterCustomer,
      getOptionLabel: option => option?.customerName || ''
    }
  ]

  return (
    <>
      <DynamicFilterBar
        onReloadStore={() => {
          dispatch(resetSalesOrder())
        }}
        handleFilterClick={handleFilterClick}
        anchorEl={anchorEl}
        onClose={handleFilterClose}
        handleReset={handleReset}
        handleApply={handleFilters}
        localFilterObject={localFilterObject}
        handleSetLocalFilterData={handleSetLocalFilterData}
        showDateFilter={true}
        entityFilterComponents={componentsWithOptionsLabel}
      />

      <ShowAppliedFilterChip
        isFilterActive={isFilterActive}
        handleFilterLogicFromAppliedFilterChip={handleFilterLogicFromAppliedFilterChip}
        localFilterObject={localFilterObject}
        handleResetDateFilterFromAppliedFilterChip={handleResetDateFilterFromAppliedFilterChip}
      />
    </>
  )
}

export default SalesOrderFilter
