import React from 'react'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/material.css'

function EditPhoneInput(props) {
  const { name, label, value, onChange } = props

  return (
    <>
      <PhoneInput
        enableSearch={true}
        specialLabel={label}
        inputStyle={{ width: '100%', padding: '7px 7px 7px 52px', fontSize: '12px' }}
        value={value}
        onChange={onChange}
        inputProps={{
          name: name,
          fullwidth: 'true',
          autoFocus: false
        }}
      />
    </>
  )
}

export default EditPhoneInput

// https://www.npmjs.com/package/react-phone-input-2
