import { forwardRef, useState } from 'react'
import { Box, Button } from '@mui/material'
import CustomTextField from 'src/@core/components/mui/text-field'
import format from 'date-fns/format'
import DatePicker from 'react-datepicker'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import { lastMonthDate } from 'src/common-functions/utils/UtilityFunctions'

const DateRangePicker = ({ handleDateRange }) => {
  const [startDate, setStartDate] = useState(lastMonthDate())
  const [endDate, setEndDate] = useState(new Date())

  const handleOnChangeRange = dates => {
    const [start, end] = dates
    setStartDate(start)
    setEndDate(end)
  }

  const CustomInput = forwardRef((props, ref) => {
    const startDate = format(props.start, 'MM/dd/yyyy')
    const endDate = props.end !== null ? ` - ${format(props.end, 'MM/dd/yyyy')}` : null
    const value = `${startDate}${endDate !== null ? endDate : ''}`

    return <CustomTextField inputRef={ref} label={props.label || ''} {...props} value={value} />
  })

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <DatePickerWrapper>
        <DatePicker
          //   showYearDropdown
          //   showMonthDropdown
          selectsRange
          //   todayButton='Apply'
          monthsShown={2}
          selected={startDate}
          endDate={endDate}
          startDate={startDate}
          shouldCloseOnSelect={false}
          id='date-range-picker-months'
          onChange={handleOnChangeRange}
          popperPlacement={'bottom'}
          tabIndex={0}
          disabledKeyboardNavigation
          customInput={<CustomInput label='Select Date Range' end={endDate} start={startDate} />}
        />
      </DatePickerWrapper>
      <Button type='button' variant='contained' onClick={() => handleDateRange(startDate, endDate)}>
        Apply
      </Button>
    </Box>
  )
}

export default DateRangePicker
