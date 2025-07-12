import { Box } from '@mui/material'
import DatePicker from 'react-datepicker'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import CustomInput from '../views/forms/form-elements/pickers/PickersCustomInput'

const isValidDate = date => date instanceof Date && !isNaN(date)

const FilterDateRange = ({ label, date, setDate }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <DatePickerWrapper>
        <DatePicker
          {...(isValidDate(date) ? { selected: date } : {})}
          id='basic-input'
          popperPlacement={'bottom'}
          onChange={date => setDate(date)}
          dateFormat='dd/MM/yyyy'
          placeholderText='Click to select a date'
          customInput={<CustomInput label={label} sx={{ width: '140px' }} />}
        />{' '}
      </DatePickerWrapper>
    </Box>
  )
}

export default FilterDateRange
