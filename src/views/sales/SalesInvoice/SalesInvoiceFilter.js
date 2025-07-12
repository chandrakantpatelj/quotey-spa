import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getSalesInvoicesByDateRangeQuery } from 'src/@core/components/graphql/sales-invoice-queries'
import { DynamicFilterBar, ShowAppliedFilterChip } from 'src/common-components/DynamicFilterBar'
import { fetchData } from 'src/common-functions/GraphqlOperations'
import { DateFunction, toTitleCase } from 'src/common-functions/utils/UtilityFunctions'
import useCustomers from 'src/hooks/getData/useCustomers'
import useDateRangeDefaults from 'src/hooks/getData/useDateRangeDefaults'
import { resetInvoice, resetSalesInvoiceFilters, setSalesInvoiceFilters } from 'src/store/apps/sales-invoices'

const SalesInvoiceFilter = ({
  salesInvoices,
  setFilterSOInvoices,
  isFilterActive,
  setFilterActive,
  setTemporaryFilterData,
  setSearchedSOInvoices
}) => {
  const dispatch = useDispatch()
  const [anchorEl, setAnchorEl] = useState(null)
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId)
  const { customers } = useCustomers(tenantId)
  const { oneMonthAgoDate, todayDate } = useDateRangeDefaults()

  const {
    filterStartDate: rawStartDate,
    filterEndDate: rawEndDate,
    filterStatus,
    filterPaymentStatus,
    filterCustomer
  } = useSelector(state => state.salesInvoices?.filters ?? {})

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
    filterPaymentStatus: Boolean(filterPaymentStatus)
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
    filterCustomer
  })
  const statusOptions = useMemo(
    () => [...new Set(salesInvoices?.map(item => item.status).filter(Boolean))],
    [salesInvoices]
  )

  const paymentStatusOptions = useMemo(
    () => [...new Set(salesInvoices?.map(item => item.paymentStatus).filter(Boolean))],
    [salesInvoices]
  )

  const customerFilterOptions = useMemo(
    () => [
      ...new Map(
        salesInvoices
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
    [salesInvoices, customers]
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
    dispatch(setSalesInvoiceFilters(serializableObject))
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
      filterCustomer
    })
    setAnchorEl(null)
  }

  useEffect(() => {
    handleDateRange()
  }, [salesInvoices])

  const handleDateRange = async (overrides = {}) => {
    try {
      let salesInvoiceFilter = salesInvoices
      const {
        filterCustomer: customerOverride = localFilterObject.filterCustomer,
        filterStatus: statusOverride = localFilterObject.filterStatus,
        filterPaymentStatus: paymentStatusOverride = localFilterObject.filterPaymentStatus,
        filterStartDate: startDateOverride = localFilterObject.filterStartDate,
        filterEndDate: endDateOverride = localFilterObject.filterEndDate
      } = overrides

      const isStartDateChanged = startDateOverride.toDateString() !== oneMonthAgoDate.toDateString()
      const isEndDateChanged = endDateOverride.toDateString() !== todayDate.toDateString()

      const isFilterPaymentStatus = Boolean(paymentStatusOverride)
      const isFilterCustomer = Boolean(customerOverride)
      const isFilterStatus = Boolean(statusOverride)
      const anyFilterActive =
        isStartDateChanged || isEndDateChanged || isFilterCustomer || isFilterStatus || isFilterPaymentStatus
      if (isStartDateChanged || isEndDateChanged) {
        const response = await fetchData(
          getSalesInvoicesByDateRangeQuery(tenantId, DateFunction(startDateOverride), DateFunction(endDateOverride))
        )
        salesInvoiceFilter = response?.getSalesInvoicesByDateRange
        console.log('fetched data successfully')
      }

      if (salesInvoiceFilter) {
        const filteredData = salesInvoiceFilter.filter(item => {
          const statusMatches = statusOverride ? item?.status === statusOverride : true
          const customerMatches = customerOverride?.customerId ? item?.customerId === customerOverride.customerId : true
          const paymentStatusMatches = paymentStatusOverride ? item?.paymentStatus === paymentStatusOverride : true

          return statusMatches && customerMatches && paymentStatusMatches
        })

        setFilterActive({
          filterActive: anyFilterActive,
          filterStartDate: isStartDateChanged,
          filterEndDate: isEndDateChanged,
          filterCustomer: isFilterCustomer,
          filterStatus: isFilterStatus,
          filterPaymentStatus: isFilterPaymentStatus
        })
        setTemporaryFilterData(anyFilterActive ? filteredData : [])
        setFilterSOInvoices(anyFilterActive ? filteredData : [])
        setSearchedSOInvoices(null)
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
    dispatch(resetSalesInvoiceFilters())

    setFilterActive({
      filterActive: false,
      filterStartDate: false,
      filterEndDate: false,
      filterStatus: false,
      filterPaymentStatus: false,
      filterCustomer: false
    })

    setLocalFilterObject({
      filterStartDate: oneMonthAgoDate,
      filterEndDate: todayDate,
      filterStatus: null,
      filterPaymentStatus: null,
      filterCustomer: null
    })

    setFilterSOInvoices([])
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
      key: 'filterPaymentStatus',
      label: 'Payment Status',
      options: paymentStatusOptions,
      value: localFilterObject.filterPaymentStatus,
      getOptionLabel: option => toTitleCase(option) || ''
    }
  ]

  return (
    <>
      <DynamicFilterBar
        onReloadStore={() => {
          dispatch(resetInvoice())
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

export default SalesInvoiceFilter
