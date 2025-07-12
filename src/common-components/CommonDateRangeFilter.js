import { Box, Button, Divider, Typography, Popover } from '@mui/material'

import { useState } from 'react'

import { lastMonthDate } from 'src/common-functions/utils/UtilityFunctions'
import FilterDateRange from 'src/common-components/FilterDateRange'
import Icon from 'src/@core/components/icon'
import { useSelector } from 'react-redux'

const CommonDateRangeFilter = ({ getData, ...props }) => {
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
        justifyContent: 'flex-end',
        px: 0,
        borderRadius: '4px'
        // mb: 3
      }}
    >
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
        anchorOrigin={props?.anchorOrigin}
        transformOrigin={props?.transformOrigin}
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

          <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, py: 4 }}>
            <Button
              variant='outlined'
              type='button'
              onClick={() => {
                let today = new Date()
                let endMonth = lastMonthDate(moduleFilterDateDuration)
                setStartDate(endMonth)
                setEndDate(today)
                getData(endMonth, today)
                handleFilterClose()
              }}
            >
              Reset All
            </Button>
            <Button
              variant='contained'
              onClick={() => {
                getData(startDate, endDate)
                handleFilterClose()
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

export default CommonDateRangeFilter
