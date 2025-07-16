import React, { Fragment, useEffect, useState } from 'react'
import { Box, Grid, IconButton, Typography, useTheme, Modal, Backdrop, Fade } from '@mui/material'
import Icon from 'src/@core/components/icon'
import { useDropzone } from 'react-dropzone'
import DropzoneWrapper from 'src/@core/styles/libs/react-dropzone'
import { generateRandomId } from 'src/common-functions/utils/UUID'

function ProductMultipleUploader({ setValue, selectedImages, setSelectedImages }) {
  const theme = useTheme()
  const [files, setFiles] = useState(false)
  const [open, setOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: acceptedFiles => {
      const updatedFiles = acceptedFiles.map(file => {
        const uuid = generateRandomId(10)
        const extension = file.type.split('/')[1]
        const key = `productsImages/${uuid}.${extension}`
        const name = file.name
        return { key, file, name }
      })
      setSelectedImages(prevFiles => [...prevFiles, ...updatedFiles])
      setFiles(true)
    }
  })

  const handleOpen = file => {
    setSelectedImage(file)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setSelectedImage(null)
  }

  const renderFilePreview = file => {
    if (typeof file === 'string' && file !== null) {
      return (
        <img
          width={38}
          height={38}
          alt={file.name}
          src={file}
          onClick={() => handleOpen(file)}
          style={{ cursor: 'pointer' }}
        />
      )
    } else if (typeof file === 'object' && file !== null) {
      return (
        <img
          width={38}
          height={38}
          alt={file.name}
          src={URL.createObjectURL(file)}
          onClick={() => handleOpen(URL.createObjectURL(file))}
          style={{ cursor: 'pointer' }}
        />
      )
    } else {
      return <Icon icon='tabler:file-description' />
    }
  }

  const handleRemoveFile = key => {
    setSelectedImages(prevFiles => prevFiles?.filter(f => f.key !== key))
    setFiles(true)
  }

  useEffect(() => {
    if (files) {
      uploadPdf()
      setFiles(false)
    }
  }, [files])

  const uploadPdf = () => {
    const filePathsArray = selectedImages?.map(item => {
      return { key: item.key, name: item.name }
    })
    setValue('images', filePathsArray)
  }

  const fileList = selectedImages.map(({ file, name, key }) => (
    <Grid item xs={12} sm={6} lg={12} key={key}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          borderRadius: '6px',
          padding: theme.spacing(1, 1, 1, 2),
          border: `1px solid ${
            theme.palette.mode === 'light' ? 'rgba(93, 89, 98, 0.14)' : 'rgba(247, 244, 254, 0.14)'
          }`,
          '& .file-details': {
            display: 'flex',
            alignItems: 'center'
          },
          '& .file-preview': {
            display: 'flex',
            marginRight: theme.spacing(3.75),
            '& svg': {
              color: '#414141',
              fontSize: '1.5rem'
            }
          },
          '& img': {
            width: 34,
            height: 34,
            padding: theme.spacing(0.5),
            borderRadius: '6px',
            border: `1px solid ${
              theme.palette.mode === 'light' ? 'rgba(93, 89, 98, 0.14)' : 'rgba(247, 244, 254, 0.14)'
            }`,
            cursor: 'pointer'
          },
          '& .file-name': {
            fontSize: '12px',
            fontWeight: 400,
            wordBreak: 'break-all'
          },
          '& + .MuiListItem-root': {
            marginTop: theme.spacing(3.5)
          }
        }}
      >
        <div className='file-details'>
          <div className='file-preview'>{renderFilePreview(file)}</div>
          <div>
            <Typography className='file-name'>{name}</Typography>
          </div>
        </div>
        <IconButton onClick={() => handleRemoveFile(key)}>
          <Icon icon='tabler:x' fontSize={20} />
        </IconButton>
      </Box>
    </Grid>
  ))

  return (
    <Fragment>
      <DropzoneWrapper>
        <Grid container spacing={5}>
          <Grid item xs={12}>
            <div {...getRootProps({ className: 'dropzone' })} style={{ minHeight: '184px' }}>
              <input {...getInputProps()} />{' '}
              <Box sx={{ display: 'flex', textAlign: 'center', alignItems: 'center', flexDirection: 'column' }}>
                <Box
                  sx={{
                    mb: 4.75,
                    width: 38,
                    height: 38,
                    display: 'flex',
                    borderRadius: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme => `rgba(${theme.palette.customColors.main}, 0.08)`
                  }}
                >
                  <Icon icon='tabler:upload' fontSize='1.5rem' />
                </Box>
                <Typography sx={{ fontSize: '14px', fontWeight: 400 }}>
                  Drop selected images here or click to upload.
                </Typography>
              </Box>
            </div>
          </Grid>
          {selectedImages.length ? (
            <Grid item xs={12}>
              <Fragment>
                <Grid container spacing={1.5} sx={{ flexDirection: 'column' }}>
                  {fileList}
                </Grid>
              </Fragment>
            </Grid>
          ) : null}
        </Grid>
      </DropzoneWrapper>

      <Modal open={open} onClose={handleClose} closeAfterTransition>
        <Fade in={open}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              bgcolor: 'background.paper',
              border: '2px solid #000',
              boxShadow: 24,
              p: 4,
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <img src={selectedImage} alt='Preview' style={{ maxWidth: '100%', maxHeight: '100%' }} />
          </Box>
        </Fade>
      </Modal>
    </Fragment>
  )
}

export default ProductMultipleUploader
