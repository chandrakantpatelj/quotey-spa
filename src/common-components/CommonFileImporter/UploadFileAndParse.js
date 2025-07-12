import React, { useState } from 'react'
import { Alert, Box, Typography } from '@mui/material'
import Icon from 'src/@core/components/icon'
import { useDropzone } from 'react-dropzone'
import Papa from 'papaparse'
import DropzoneWrapper from 'src/@core/styles/libs/react-dropzone'

function UploadFileAndParse({ mappedColumns, setValues, handleNext }) {
  const [emptyData, setEmptyData] = useState(false)
  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    accept: {
      'text/csv': ['.csv']
    },
    onDrop: acceptedFiles => {
      const uploadedFile = acceptedFiles[0]
      Papa.parse(uploadedFile, {
        header: false,
        skipEmptyLines: true,
        complete: results => {
          if (results.data.length > 0) {
            const firstRow = results.data[0]

            firstRow.forEach((cell, index) => {
              mappedColumns.forEach((column, i) => {
                if (column.columnName?.toLowerCase() === cell?.toLowerCase()) {
                  column.index = index
                } else column.index = -1
              })
            })
            setValues(results.data)
            handleNext()
          } else setEmptyData(true)
        }
      })
    }
  })

  return (
    <>
      <DropzoneWrapper>
        <Box {...getRootProps({ className: 'dropzone' })} sx={{ height: 250 }}>
          <input {...getInputProps()} />

          <Box sx={{ display: 'flex', textAlign: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <Box
              sx={{
                mb: 8.75,
                width: 48,
                height: 48,
                display: 'flex',
                borderRadius: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme => `rgba(${theme.palette.customColors.main}, 0.08)`
              }}
            >
              <Icon icon='tabler:upload' fontSize='1.75rem' />
            </Box>
            <Typography variant='h5' sx={{ mb: 2.5 }}>
              Drop files here or click to upload.
            </Typography>
            <Typography sx={{ color: 'text.secondary' }} variant='body2'>
              Only one CSV file can be uploaded.
            </Typography>
          </Box>
        </Box>{' '}
      </DropzoneWrapper>
      {emptyData && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', my: 6 }}>
          <Alert severity='error' sx={{ maxWidth: '350px', width: '100%' }}>
            No data available in uploaded file.
          </Alert>
        </Box>
      )}
    </>
  )
}

export default UploadFileAndParse
