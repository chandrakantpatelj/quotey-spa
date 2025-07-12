import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getSalesInvoicePaymentsByDateRangeQuery } from 'src/@core/components/graphql/sales-payment-queries'
import { DynamicFilterBar, ShowAppliedFilterChip } from 'src/common-components/DynamicFilterBar'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { DateFunction, toTitleCase } from 'src/common-functions/utils/UtilityFunctions'
import useCustomers from 'src/hooks/getData/useCustomers'
import useDateRangeDefaults from 'src/hooks/getData/useDateRangeDefaults'
import usePaymentMethods from 'src/hooks/getData/usePaymentMethods'
import { resetSalesPayment, resetSalesPaymentFilters, setSalesPaymentFilters } from 'src/store/apps/payments'
const SalesPaymentFilter = ({
  salesPayments,
  setFiltereSOPayments,
  isFilterActive,
  setFilterActive,
  setTemporaryFilterData,
  setSearchedSOPayments
}) => {
  const dispatch = useDispatch()
  const [anchorEl, setAnchorEl] = useState(null)
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId)
  const { customers } = useCustomers(tenantId)
  const { paymentMethods } = usePaymentMethods(tenantId)
  const { oneMonthAgoDate, todayDate } = useDateRangeDefaults()
  const {
    filterStartDate: rawStartDate,
    filterEndDate: rawEndDate,
    filterStatus,
    filterPaymentMethod,
    filterCustomer
  } = useSelector(state => state.salesPayments?.filters ?? {})

  const filterStartDate = new Date(rawStartDate ?? oneMonthAgoDate)
  const filterEndDate = new Date(rawEndDate ?? todayDate)

  const isStartDateChanged = filterStartDate.toDateString() !== oneMonthAgoDate.toDateString()
  const isEndDateChanged = filterEndDate.toDateString() !== todayDate.toDateString()

  // Individual filter checks
  const filters = {
    filterStartDate: isStartDateChanged,
    filterEndDate: isEndDateChanged,
    filterCustomer: Boolean(filterCustomer),
    filterStatus: Boolean(filterStatus),
    filterPaymentMethod: Boolean(filterPaymentMethod)
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
    filterPaymentMethod,
    filterCustomer
  })
  const statusOptions = useMemo(
    () => [...new Set(salesPayments?.map(item => item.status).filter(Boolean))],
    [salesPayments]
  )

  const paymentMethodsOptions = useMemo(
    () => [
      ...new Map(
        salesPayments
          ?.map(item => {
            if (item?.paymentMethod) {
              const pm = paymentMethods.find(pm => pm.paymentMethodId === item.paymentMethod)
              return pm ? { paymentMethod: pm.paymentMethod, paymentMethodId: pm.paymentMethodId } : null
            }
            return null
          })
          .filter(Boolean)
          .map(pm => [pm.paymentMethodId, pm]) // Ensure uniqueness by paymentMethodId
      ).values()
    ],
    [salesPayments, paymentMethods]
  )

  const customerFilterOptions = useMemo(
    () => [
      ...new Map(
        salesPayments
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
    [salesPayments, customers]
  )

  const open = Boolean(anchorEl)
  const handleFilterClick = event => {
    setAnchorEl(event.currentTarget)
  }
  const updateFilter = object => {
    const serializableObject = {
      ...object,
      filterStartDate: object.filterStartDate?.toISOString?.() || null,
      filterEndDate: object.filterEndDate?.toISOString?.() || null
    }
    dispatch(setSalesPaymentFilters(serializableObject))
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
      filterPaymentMethod,
      filterCustomer
    })
    setAnchorEl(null)
  }

  useEffect(() => {
    handleDateRange()
  }, [salesPayments])

  const handleDateRange = async (overrides = {}) => {
    updateFilter(overrides)

    try {
      let filterSalesPayments = salesPayments
      const {
        filterCustomer: customerOverride = localFilterObject.filterCustomer,
        filterStatus: statusOverride = localFilterObject.filterStatus,
        filterPaymentMethod: paymentMethodOverride = localFilterObject.filterPaymentMethod,
        filterStartDate: startDateOverride = localFilterObject.filterStartDate,
        filterEndDate: endDateOverride = localFilterObject.filterEndDate
      } = overrides

      const isStartDateChanged = startDateOverride.toDateString() !== oneMonthAgoDate.toDateString()
      const isEndDateChanged = endDateOverride.toDateString() !== todayDate.toDateString()

      const isFilterPaymentMethod = Boolean(paymentMethodOverride)
      const isFilterCustomer = Boolean(customerOverride)
      const isFilterStatus = Boolean(statusOverride)
      const anyFilterActive =
        isStartDateChanged || isEndDateChanged || isFilterCustomer || isFilterStatus || isFilterPaymentMethod
      if (isStartDateChanged || isEndDateChanged) {
        const response = await fetchData(
          getSalesInvoicePaymentsByDateRangeQuery(
            tenantId,
            DateFunction(startDateOverride),
            DateFunction(endDateOverride)
          )
        )

        filterSalesPayments = response?.getSalesInvoicePaymentsByDateRange || []
        console.log('fetched data successfully')
        // salesOrdersFilter = await fetchSalesOrders(filterStartDate, filterEndDate)
      }

      if (filterSalesPayments) {
        const filteredData = filterSalesPayments.filter(item => {
          const statusMatches = statusOverride ? item?.status === statusOverride : true
          const customerMatches = customerOverride?.customerId ? item?.customerId === customerOverride.customerId : true
          const paymentMethodMatches = paymentMethodOverride?.paymentMethodId
            ? item?.paymentMethod === paymentMethodOverride.paymentMethodId
            : true
          return statusMatches && customerMatches && paymentMethodMatches
        })

        setFilterActive({
          filterActive: anyFilterActive,
          filterStartDate: isStartDateChanged,
          filterEndDate: isEndDateChanged,
          filterCustomer: isFilterCustomer,
          filterStatus: isFilterStatus,
          filterPaymentMethod: isFilterPaymentMethod
        })
        setTemporaryFilterData(anyFilterActive ? filteredData : [])
        setFiltereSOPayments(anyFilterActive ? filteredData : [])
        setSearchedSOPayments(null)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setAnchorEl(null)
    }
  }
  const handleFilters = overrides => {
    handleDateRange(overrides)
  }

  const handleReset = async () => {
    setAnchorEl(null)
    dispatch(resetSalesPaymentFilters())

    setFilterActive({
      filterActive: false,
      filterStartDate: false,
      filterEndDate: false,
      filterStatus: false,
      filterPaymentMethod: false,
      filterCustomer: false
    })

    setLocalFilterObject({
      filterStartDate: oneMonthAgoDate,
      filterEndDate: todayDate,
      filterStatus: null,
      filterPaymentMethod: null,
      filterCustomer: null
    })

    setFiltereSOPayments([])
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
      key: 'filterCustomer',
      label: 'Customer',
      options: customerFilterOptions,
      value: localFilterObject.filterCustomer,
      getOptionLabel: option => option?.customerName || ''
    },
    {
      key: 'filterPaymentMethod',
      label: 'Payment Method',
      options: paymentMethodsOptions,
      value: localFilterObject.filterPaymentMethod,
      getOptionLabel: option => option?.paymentMethod || ''
    }
  ]

  return (
    <>
      <DynamicFilterBar
        onReloadStore={() => {
          dispatch(resetSalesPayment())
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

export default SalesPaymentFilter
