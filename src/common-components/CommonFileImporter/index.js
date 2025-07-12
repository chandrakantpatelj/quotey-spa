import React, { useState } from 'react'
import { Button } from '@mui/material'
import FileImporter from './FileImporter'
import Icon from 'src/@core/components/icon'

const CommonFileImporter = ({ open, setOpen, columns, handleImportedData }) => {
  const [template, setTemplate] = useState(columns)

  return (
    <div>
      <Button
        variant='contained'
        color='primary'
        startIcon={<Icon icon='mynaui:upload' />}
        component='span'
        onClick={() => setOpen(true)}
      >
        Import
      </Button>

      {open && (
        <FileImporter
          open={open}
          setOpen={setOpen}
          template={template}
          callback={handleImportedData}
          defaultSkipHeader={false}
        />
      )}
    </div>
  )
}

export default CommonFileImporter
