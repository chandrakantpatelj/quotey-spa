import React, { useState } from 'react'
import { Box, Button, Dialog, DialogContent } from '@mui/material'
import CustomCloseButton from 'src/common-components/CustomCloseButton'
import Icon from 'src/@core/components/icon'
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material'
import DisplayParsedData from './DisplayParsedData'
import UploadFileAndParse from './UploadFileAndParse'
import MapColumns from './MapColumns'
import VerifyData from './VerifyData'

function FileImporter({ open, setOpen, template, callback, defaultSkipHeader }) {
  const handleClose = () => {
    setOpen(false)
  }

  const [values, setValues] = useState([])
  const [skipHeader, setSkipHeader] = useState(defaultSkipHeader)
  const [mappedColumns, setMappedColumns] = useState(template.map(item => ({ columnName: item.columnName, index: -1 })))

  const [activeStep, setActiveStep] = useState(0)
  const maxSteps = 4

  const handleNext = () => {
    setActiveStep(activeStep + 1)
  }

  const handleBack = () => {
    setActiveStep(activeStep - 1)
  }

  const handleSubmit = async () => {
    handleClose()

    const mappedData = values.slice(skipHeader ? 1 : 0).map(row => {
      const rowObject = {}

      mappedColumns.forEach(col => {
        if (col.index !== -1) {
          rowObject[col.columnName] = row[col.index] ?? null
        } else {
          rowObject[col.columnName] = null
        }
      })

      return rowObject
    })

    callback(mappedData)
  }

  return (
    <Dialog
      open={open}
      disableEscapeKeyDown
      scroll='paper'
      onClose={(event, reason) => {
        if (reason !== 'backdropClick') {
          handleClose()
        }
      }}
      sx={{
        '& .MuiDialog-paper': {
          overflow: 'visible',
          p: '20px 0px !important',
          maxWidth: '1150px',
          height: '100%',
          width: '100%'
        }
      }}
    >
      <DialogContent sx={{ py: 8 }}>
        <CustomCloseButton onClick={handleClose}>
          <Icon icon='tabler:x' fontSize='1.25rem' />
        </CustomCloseButton>
        {activeStep === 0 && (
          <UploadFileAndParse mappedColumns={mappedColumns} setValues={setValues} handleNext={handleNext} />
        )}
        {activeStep === 1 && (
          <DisplayParsedData values={values} skipHeader={skipHeader} setSkipHeader={setSkipHeader} />
        )}
        {activeStep === 2 && (
          <MapColumns
            template={template}
            firstRow={values[0]}
            mappedColumns={mappedColumns}
            setMappedColumns={setMappedColumns}
          />
        )}
        {activeStep === 3 && <VerifyData values={values} mappedColumns={mappedColumns} skipHeader={skipHeader} />}

        {activeStep !== 0 && (
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'end',
              alignItems: 'center',
              py: 1,
              px: 2,
              mt: 4,
              position: 'sticky',
              bottom: '-20px',
              background: '#fff'
            }}
          >
            <Button onClick={handleBack} disabled={activeStep === 0}>
              <KeyboardArrowLeft />
              Back
            </Button>
            {activeStep === maxSteps - 1 ? (
              <>
                <Button variant='contained' onClick={handleSubmit}>
                  Submit
                </Button>
              </>
            ) : (
              <Button onClick={handleNext} disabled={activeStep === maxSteps - 1}>
                Next
                <KeyboardArrowRight />
              </Button>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default FileImporter
