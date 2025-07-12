import React, { useEffect, useState } from 'react'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/material.css'
import { startsWith } from 'lodash'
import { countriesData } from 'src/@fake-db/phone-number/data'
import { useSelector } from 'react-redux'

function CustomPhoneInput(props) {
  const { name, label, value, onChange } = props

  // const account = useSelector(state => state.accounts.data)
  // const accPhNumber = account?.phoneNumber

  const selectedTenant = useSelector(state => state.tenants?.selectedTenant) || {}

  const accPhNumber = name === 'mobile' ? selectedTenant?.mobile : selectedTenant?.workPhone

  const [defaultCountry, setDefaultCountry] = useState('')

  useEffect(() => {
    const foundCountry = countriesData.find(country => {
      if (startsWith(accPhNumber, country.dialCode) || startsWith(country.dialCode, accPhNumber)) return country
    })
    setDefaultCountry(foundCountry)
  }, [selectedTenant])

  return (
    <>
      <PhoneInput
        country={defaultCountry?.iso2}
        enableSearch={true}
        specialLabel={label}
        inputStyle={{ width: '100%', padding: '7px 7px 7px 52px', fontSize: '13px' }}
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

export default CustomPhoneInput

// https://www.npmjs.com/package/react-phone-input-2
