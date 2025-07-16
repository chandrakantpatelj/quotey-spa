import { Box, Button, TextField, Autocomplete, IconButton, Divider, Typography, Popover, Tooltip } from '@mui/material'
import { useState } from 'react'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'
import { lastMonthDate, toTitleCase } from 'src/common-functions/utils/UtilityFunctions'
import FilterDateRange from 'src/common-components/FilterDateRange'
import Icon from 'src/@core/components/icon'
import { useSelector } from 'react-redux'
import RefreshIcon from '@mui/icons-material/Refresh'

const FilterComponent = ({ getData }) => {
  const [methods, setPurchaseStatuses] = useState(['CASH', 'ACCRUED'])
  const [selectedMethod, setSelectedMethod] = useState('CASH')
  const [anchorEl, setAnchorEl] = useState(null)
  const moduleFilterDateDuration = useSelector(
    state => state.otherSettings?.data?.moduleFilterDateDuration || undefined
  )
  const [startDate, setStartDate] = useState(lastMonthDate(moduleFilterDateDuration))
  const [endDate, setEndDate] = useState(new Date())

  const open = Boolean(anchorEl)

  const handleFilterClick = event => {
    setAnchorEl(event.currentTarget)
  }
  const handleFilterClose = () => {
    setAnchorEl(null)
  }

  return (
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
          sx={{ fontSize: '21px' }}
          onClick={() => {
            let today = new Date()
            let oneMonthAgo = lastMonthDate(moduleFilterDateDuration)
            setStartDate(oneMonthAgo)
            setEndDate(today)
            setSelectedMethod('CASH')
            getData('CASH', oneMonthAgo, today)
          }}
        >
          <RefreshIcon />
        </IconButton>
      </Tooltip>

      <Button
        variant='outlined'
        startIcon={<Icon icon='mage:filter' />}
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
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        sx={{ mt: 2 }}
      >
        <Box sx={{ py: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, py: 4, background: '#f1f1f1' }}>
            <Typography sx={{ fontSize: '14px', lineHeight: '23px' }}> Filters</Typography>
          </Box>
          <Divider sx={{ mb: 3, opacity: 0.4 }} color='primary' />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, mb: 2 }}>
            <Typography sx={{ fontSize: '13px', lineHeight: '23px' }}> Date Range</Typography>
            <Button
              type='button'
              onClick={() => {
                setStartDate(lastMonthDate(moduleFilterDateDuration))
                setEndDate(new Date())
              }}
            >
              Reset
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 4, alignItems: 'center', px: 4 }}>
            <FilterDateRange label='From' date={startDate} setDate={setStartDate} />
            <FilterDateRange label='To' date={endDate} setDate={setEndDate} />
          </Box>
          <Divider sx={{ my: 3, opacity: 0.4 }} color='primary' />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, mb: 2 }}>
            <Typography sx={{ fontSize: '13px', lineHeight: '23px' }}>Method</Typography>
            <Button type='button' onClick={() => setSelectedMethod(null)}>
              Reset
            </Button>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, mb: 2 }}>
            <CustomAutocomplete
              fullWidth
              options={methods}
              value={selectedMethod ? toTitleCase(selectedMethod) : selectedMethod}
              onChange={(event, newValue) => setSelectedMethod(newValue)}
              getOptionLabel={option => toTitleCase(option)}
              renderOption={(props, option) => (
                <li {...props} style={{ textTransform: 'capitalize' }}>
                  {toTitleCase(option)}
                </li>
              )}
              renderInput={params => <CustomTextField {...params} />}
            />
          </Box>
          <Divider sx={{ mt: 3, opacity: 0.4 }} color='primary' />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, py: 4 }}>
            <Button
              variant='outlined'
              type='button'
              onClick={() => {
                setAnchorEl(null)
                let today = new Date()
                let oneMonthAgo = lastMonthDate(moduleFilterDateDuration)
                setStartDate(oneMonthAgo)
                setEndDate(today)
                getData(selectedMethod, oneMonthAgo, today)
                setSelectedMethod(null)
              }}
            >
              Reset All
            </Button>
            <Button
              variant='contained'
              onClick={() => {
                setAnchorEl(null)
                getData(selectedMethod, startDate, endDate)
              }}
            >
              Apply
            </Button>
          </Box>
        </Box>
      </Popover>
    </Box>
  )
}

export default FilterComponent
