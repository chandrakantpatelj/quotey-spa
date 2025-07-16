// CustomTextField.js
import React from 'react'
import TextField from '@mui/material/TextField'
import RenderHTML from 'src/@core/components/common-components/RenderHTML '

const CustomTextFieldHtml = ({ value, onChange }) => {
  return (
    <div style={{ border: '1px solid #d8d8d8', borderRadius: '4px', padding: '4px 8.5px', minHeight: '35px' }}>
      <RenderHTML html={value} />
    </div>
  )
}

export default CustomTextFieldHtml
