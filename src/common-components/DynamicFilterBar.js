import { Close } from '@mui/icons-material'
import RefreshIcon from '@mui/icons-material/Refresh'
import { Button, Divider, Grid, IconButton, Popover, Tooltip, Typography } from '@mui/material'
import { Box } from '@mui/system'
import Icon from 'src/@core/components/icon'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomChip from 'src/@core/components/mui/chip'
import CustomTextField from 'src/@core/components/mui/text-field'
import FilterDateRange from 'src/common-components/FilterDateRange'
import { DateFunction, toTitleCase } from 'src/common-functions/utils/UtilityFunctions'
import useDateRangeDefaults from 'src/hooks/getData/useDateRangeDefaults'

const FromDateToDateRangeFilter = ({ handleSetLocalFilterData, localFilterObject }) => {
  const { oneMonthAgoDate, todayDate } = useDateRangeDefaults()

  return (
    <>
      <Divider sx={{ mb: 3, opacity: 0.5 }} color='primary' />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, mb: 2 }}>
        <Typography sx={{ fontSize: '13px', lineHeight: '23px' }}> Date Range</Typography>
        <Button
          type='button'
          onClick={() => {
            handleSetLocalFilterData('filterStartDate', oneMonthAgoDate)
            handleSetLocalFilterData('filterEndDate', todayDate)
          }}
        >
          Reset
        </Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 4, alignItems: 'center', px: 4 }}>
        <FilterDateRange
          label='From'
          date={localFilterObject.filterStartDate}
          setDate={date => handleSetLocalFilterData('filterStartDate', date)}
        />
        <FilterDateRange
          label='To'
          date={localFilterObject.filterEndDate}
          setDate={date => handleSetLocalFilterData('filterEndDate', date)}
        />
      </Box>

      <Divider sx={{ my: 3, opacity: 0.5 }} color='primary' />
    </>
  )
}

const EntityFilter = ({ label, options, value, onChange, onReset, getOptionLabel }) => (
  <>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, mb: 2 }}>
      <Typography sx={{ fontSize: '13px', lineHeight: '23px' }}>{label}</Typography>
    </Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, mb: 2 }}>
      <CustomAutocomplete
        fullWidth
        options={options}
        value={value}
        onChange={onChange}
        getOptionLabel={getOptionLabel}
        renderInput={params => <CustomTextField {...params} />}
      />
    </Box>
    <Divider sx={{ my: 3, opacity: 0.5 }} color='primary' />
  </>
)

export const DynamicFilterBar = ({
  onReloadStore,
  handleFilterClick,
  anchorEl,
  onClose,
  handleReset,
  handleApply,
  localFilterObject,
  showDateFilter,
  handleSetLocalFilterData,
  entityFilterComponents
}) => {
  const open = Boolean(anchorEl)

  return (
    <Grid item xs={6} sm={6} md={6} lg={6} xl={6}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 3
        }}
      >
        <Tooltip title='Reload' placement='top'>
          <IconButton color='default' sx={{ fontSize: '21px' }} onClick={onReloadStore}>
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
          open={open}
          anchorEl={anchorEl}
          onClose={onClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ mt: 2, '& .MuiPaper-root': { minWidth: 320 } }}
        >
          <Box sx={{ py: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, py: 4, background: '#f1f1f1' }}>
              <Typography sx={{ fontSize: '14px', lineHeight: '23px' }}>Filters</Typography>
            </Box>
            {showDateFilter && (
              <FromDateToDateRangeFilter
                handleSetLocalFilterData={handleSetLocalFilterData}
                localFilterObject={localFilterObject}
              />
            )}

            {entityFilterComponents.map(({ key, label, options, value, getOptionLabel }) => (
              <EntityFilter
                key={key}
                label={label}
                options={options}
                value={value}
                onChange={(event, newValue) => handleSetLocalFilterData(key, newValue)}
                getOptionLabel={getOptionLabel}
              />
            ))}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, py: 4 }}>
              <Button variant='outlined' onClick={handleReset}>
                Reset All
              </Button>
              <Button variant='contained' onClick={() => handleApply(localFilterObject)}>
                Apply
              </Button>
            </Box>
          </Box>
        </Popover>
      </Box>
    </Grid>
  )
}

export const ShowAppliedFilterChip = ({
  isFilterActive,
  handleFilterLogicFromAppliedFilterChip,
  localFilterObject,
  handleResetDateFilterFromAppliedFilterChip
}) => {
  const {
    filterCustomer,
    filterStatus,
    filterPaymentStatus,
    filterPaymentMethod,
    filterDeliveryStatus,
    filterStartDate,
    filterEndDate,
    filterCategory,
    filterType
  } = localFilterObject
  return (
    <>
      {(isFilterActive.filterCustomer ||
        isFilterActive.filterStatus ||
        isFilterActive.filterPaymentStatus ||
        isFilterActive.filterPaymentMethod ||
        isFilterActive.filterDeliveryStatus ||
        isFilterActive.filterCategory ||
        isFilterActive.filterType ||
        isFilterActive.filterStartDate ||
        isFilterActive.filterEndDate) && (
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
              Filtered By :
              {filterCustomer && isFilterActive.filterCustomer && (
                <CustomChip
                  label={`Customer: ${filterCustomer.customerName}`}
                  onDelete={() => {
                    handleFilterLogicFromAppliedFilterChip('filterCustomer', null)
                  }}
                  deleteIcon={<Close sx={{ color: theme => theme.palette.primary.main }} />}
                  skin='light'
                  color='primary'
                />
              )}
              {filterStatus && isFilterActive.filterStatus && (
                <CustomChip
                  label={`Status: ${toTitleCase(filterStatus)}`}
                  onDelete={() => {
                    handleFilterLogicFromAppliedFilterChip('filterStatus', null)
                  }}
                  deleteIcon={<Close sx={{ color: theme => theme.palette.primary.main }} />}
                  skin='light'
                  color='primary'
                />
              )}
              {filterPaymentStatus && isFilterActive.filterPaymentStatus && (
                <CustomChip
                  label={`Payment Status:  ${toTitleCase(filterPaymentStatus)}`}
                  onDelete={() => {
                    handleFilterLogicFromAppliedFilterChip('filterPaymentStatus', null)
                  }}
                  deleteIcon={<Close sx={{ color: theme => theme.palette.primary.main }} />}
                  skin='light'
                  color='primary'
                />
              )}
              {filterPaymentMethod && isFilterActive.filterPaymentMethod && (
                <CustomChip
                  label={`Payment Method:  ${toTitleCase(filterPaymentMethod?.paymentMethod || '')}`}
                  onDelete={() => {
                    handleFilterLogicFromAppliedFilterChip('filterPaymentMethod', null)
                  }}
                  deleteIcon={<Close sx={{ color: theme => theme.palette.primary.main }} />}
                  skin='light'
                  color='primary'
                />
              )}
              {filterDeliveryStatus && isFilterActive.filterDeliveryStatus && (
                <CustomChip
                  label={`Delivery: ${filterDeliveryStatus}`}
                  onDelete={() => {
                    handleFilterLogicFromAppliedFilterChip('filterDeliveryStatus', null)
                  }}
                  deleteIcon={<Close sx={{ color: theme => theme.palette.primary.main }} />}
                  skin='light'
                  color='primary'
                />
              )}
              {filterCategory && isFilterActive.filterCategory && (
                <CustomChip
                  label={`Categoery: ${filterCategory}`}
                  onDelete={() => {
                    handleFilterLogicFromAppliedFilterChip('filterCategory', null)
                  }}
                  deleteIcon={<Close sx={{ color: theme => theme.palette.primary.main }} />}
                  skin='light'
                  color='primary'
                />
              )}
              {filterType && isFilterActive.filterType && (
                <CustomChip
                  label={`Type: ${filterType}`}
                  onDelete={() => {
                    handleFilterLogicFromAppliedFilterChip('filterType', null)
                  }}
                  deleteIcon={<Close sx={{ color: theme => theme.palette.primary.main }} />}
                  skin='light'
                  color='primary'
                />
              )}
              {(isFilterActive.filterStartDate || isFilterActive.filterEndDate) && (
                <CustomChip
                  label={`Date Range: ${DateFunction(filterStartDate.toDateString())}-${DateFunction(
                    filterEndDate.toDateString()
                  )}`}
                  onDelete={() => {
                    handleResetDateFilterFromAppliedFilterChip()
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
    </>
  )
}
