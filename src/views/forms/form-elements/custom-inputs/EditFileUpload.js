import React, { useState, useEffect } from 'react'
import IconButton from '@mui/material/IconButton'
import { Button, Box, Typography, Input, FormLabel, Tooltip, Zoom, Snackbar, Alert } from '@mui/material'
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined'
import { Amplify } from 'aws-amplify'
import { generateRandomId } from 'src/common-functions/utils/UUID'
import { AuthConfig } from 'src/@core/components/auth/amlify-config'
Amplify.configure(AuthConfig)
import { createAlert } from 'src/store/apps/alerts'
import { useDispatch } from 'react-redux'
import Icon from 'src/@core/components/icon'

function EditFileUpload({ setValue, selecedInvoice }) {
  const dispatch = useDispatch()
  const [selectedFile, setSelectedFile] = React.useState(selecedInvoice && selecedInvoice?.file)
  const [open, setOpen] = useState(false)
  const [files, setFiles] = useState([])
  const [fileUrl, setfileUrl] = useState('')


  useEffect(() => {
    console.log('Files in USeffect::', files)
    if (files?.length > 0) {
      console.log('useEff length checked::', files?.length)
      uploadPdf()
    }
  }, [files])

  const uploadPdf = () => {
    console.log('uploadPdf called', files);


    // Check if files[0] is defined before proceeding
    if (!files || files.length === 0 || !files[0]) {
      console.error('No file selected for upload');
      // Dispatch an error alert or handle the situation accordingly
      return;
    }

    // Generate a random id (assuming this is a function in your code)
    const uuid = generateRandomId(10);
    console.log('uuid', uuid);

    try {
      const parts = files[0]?.type?.split('/');
      // Check if parts is defined before accessing its properties
      if (!parts || parts.length < 2) {
        console.error('Invalid file type or missing extension');
        // Dispatch an error alert or handle the situation accordingly
        return;
      }
      console.log('parts', parts);
      const extension = parts[1]; // Use index 1 to get the file extension
      console.log('extension', extension);

      // Assuming Amplify is properly configured and set up for Storage
      Amplify.Storage.put(`purchaseInvoicepdf/${uuid}.${extension}`, files[0], {
        contentType: files[0].type,
        ACL: 'public-read',
      })

        .then(result => {
          console.log('result then', result);

          // Assuming setInvoiceData is a state-setting function
          // setInvoiceData({ ...invoiceData, file: `purchaseInvoicepdf/${uuid}.${extension}` });
          setValue('file', `purchaseInvoicepdf/${uuid}.${extension}`)
          setfileUrl(files[0]?.name)
          // Assuming dispatch is a function for dispatching actions
          dispatch(createAlert({ message: 'Pdf Uploaded successfully!', type: 'success' }));
        })
        .catch(error => {
          console.error('Error uploading PDF:', error);

          // Update to dispatch an error alert
          dispatch(createAlert({ message: 'Pdf Uploading failed!', type: 'error' }));
        });

    } catch (error) {
      console.error('Error in uploadPdf:', error);

      // Update to dispatch an error alert
      dispatch(createAlert({ message: 'Pdf Uploading failed!', type: 'error' }));
    }
  }


  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }

    setOpen(false)
  }

  const handleCapture = e => {
    console.log('handleCaptureCall', e)
    const files = e.target.files
    console.log('file-capture123', typeof files)
    console.log(files.length, 'length1236')
    // const file = e.target.files[0]
    const uploadFile = files?.name
    // setValue('file', uploadFile)
    // setSelectedFile(uploadFile)
    if (files.length > 0) {
      // Create a copy of the files array using the spread operator
      const filesCopy = [...files]
      if (filesCopy && filesCopy[0].type === 'application/pdf') {
        // Assuming setFiles is a state-setting function
        setFiles(filesCopy)

        console.log('selected-file111', files)
        uploadPdf()
      } else {
        // Handle invalid file type
        setOpen(true)
        // Optionally, you can clear the selected file
        e.target.files = null
      }
    }
  }

  return (
    <>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'flex-start' }}>
        <Input
          inputProps={{ type: 'file', accept: '.pdf' }}
          onChange={handleCapture}
          sx={{ display: 'none' }}
          id='edit-file-button'
        // multiple
        // type='file'
        />
        <FormLabel
          htmlFor='edit-file-button'
        // style={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-start' }}
        >
          <Button
            variant='outlined'
            startIcon={<FileUploadOutlinedIcon sx={{ width: '24px !important', height: '24px !important' }} />}
            component='span'
            sx={{ p: '10px', minWidth: 174, fontSize: '14px', lineHeight: '24px' }}
          >
            Upload File
          </Button>
        </FormLabel>
        <Typography sx={{ fontSize: '14px', fontWeight: 400, ml: 2 }}>
          {' '}
          {selectedFile ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-start' }}>
              {/* {selectedFile} */}
              {/* <a href={files.length > 0 ? files[0]?.name : selectedFile} target="_blank"
                rel="noreferrer">
                {files.length > 0 ? files[0]?.name : selectedFile}
              </a> */}
              {files.length > 0 ? files[0]?.name : selectedFile}
              {/* <Tooltip title='View PDF' placement='top' arrow>
                                <IconButton
                                    color='secondary'
                                    size='small'
                                    variant='contained'
                                    sx={{
                                        ml: 2,
                                        border: '1px solid rgba(0,0,0,1)',
                                        p: 2,
                                        color: '#000'
                                    }}
                                >
                                    <Icon icon='teenyicons:pdf-outline' />
                                </IconButton>
                            </Tooltip> */}
            </Box>
          ) : (
            'No file chosen'
          )}
        </Typography>
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={open}
          autoHideDuration={3000}
          onClose={handleClose}
        >
          <Alert onClose={handleClose} severity='error' variant='filled' sx={{ width: '100%' }}>
            Please select a PDF file.
          </Alert>
        </Snackbar>
      </Box>
    </>
  )
}

export default EditFileUpload
