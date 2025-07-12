import React, { useState } from 'react'

import DatePicker from 'react-datepicker'
import addDays from 'date-fns/addDays'
// ** Custom Component Imports
import CustomInput from './PickersCustomInput'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'

function CustomDatePicker(props) {
  const { fullWidth, label, date, onChange, error, disabled } = props

  return (
    <>
      <DatePickerWrapper>
        <DatePicker
          selected={date}
          // minDate={new Date()}
          maxDate={addDays(new Date(), 90)}
          disabled={disabled}
          popperPlacement={'bottom'}
          onChange={onChange}
          dateFormat='dd/MM/yyyy'
          customInput={<CustomInput label={label} fullWidth={fullWidth} error={error} />}
        />
      </DatePickerWrapper>
    </>
  )
}

export default CustomDatePicker
