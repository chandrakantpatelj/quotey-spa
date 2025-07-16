import { Fragment, useEffect, useState } from 'react'
import { Backdrop, Box, Typography, IconButton, CircularProgress } from '@mui/material'
import FileUploadOutlined from '@mui/icons-material/FileUploadOutlined'
import Icon from 'src/@core/components/icon'
import { Close } from '@mui/icons-material'
import { useDropzone } from 'react-dropzone'
import DropzoneWrapper from 'src/@core/styles/libs/react-dropzone'
import { useDispatch } from 'react-redux'
import { generateRandomId } from 'src/common-functions/utils/UUID'
// import { Amplify } from 'aws-amplify'
// Amplify.configure(AuthConfig)
import EditIcon from '@mui/icons-material/Edit'
import CancelIcon from '@mui/icons-material/Cancel'

import DeleteIcon from '@mui/icons-material/Delete'

// const images = [
//   {
//     original: 'https://picsum.photos/id/1018/1000/600/',
//     thumbnail: 'https://picsum.photos/id/1018/250/150/'
//   }
// ]

const UploadLogo = ({
  selectedTenant,
  setValue,
  setIsEdit,
  imgUploaded,
  editImg,
  imageUrl,
  files,
  setFiles,
  isEditComponent,
  accountNo
}) => {
  const dispatch = useDispatch()
  const [imgLoader, setImgLoader] = useState(true)
  const [imgBroken, setImgBroken] = useState(false)
  const [open, setOpen] = useState(false)
  const [viewImage, setViewImage] = useState(isEditComponent ? (selectedTenant ? imageUrl : null) : null)
  const [image, setImage] = useState(null)

  const handleOpen = image => {
    setViewImage(image)
    setOpen(true)
  }

  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    onDrop: acceptedFiles => {
      // Ensure only one file is accepted
      if (acceptedFiles.length > 0) {
        setFiles(acceptedFiles.map(file => Object.assign(file)))
        // uploadImage()
      }
    }
  })
  useEffect(() => {
    if (files?.length > 0) {
      uploadImage()
    }
  }, [files])
  const handleEditFiles = () => {
    setIsEdit(true)
  }

  const uploadImage = () => {
    setTeblerEdit(false)
    const parts = files[0]?.type?.split('/')
    const extension = parts[1]
    const uuid = generateRandomId(10)
    const logoObj = {
      fileName: `${uuid}.${extension}`,
      key: `logo/${accountNo}/${uuid}.${extension}`,
      bucket: 'wms-resourses-dev'
    }
    setValue('logoImage', logoObj)
    // setItemData({ ...selectedTenant, image: `productimages/${uuid}.${extension}` })
    setIsEdit(false)
  }
  const handleRemoveAllFiles = () => {
    setFiles([])
    setIsEdit(false)
    setValue('logoImage', null)

    setOpen(false)
    setTeblerEdit(false)
    setImgBroken(false)
  }
  const cancelEditFiles = () => {
    setIsEdit(false)
  }
  const [teblerEdit, setTeblerEdit] = useState(false)

  const handleClose = () => {
    setOpen(false)
    setTeblerEdit(false)
  }
  const tablerImgEdit = event => {
    event.stopPropagation()
    setTeblerEdit(true)
  }
  const closeTablerImgEdit = event => {
    event.stopPropagation()
    setTeblerEdit(false)
  }
  useEffect(() => {
    files?.map(file => {
      setImage(
        <Box
          component='div'
          key={file.name}
          sx={{ display: 'contents', position: 'relative' }}
          className='file-container'
        >
          <img
            alt={file.name}
            className='single-file-image'
            src={URL.createObjectURL(file)}
            onLoad={() => {
              setImgLoader(false) // Set loading to false when the image is fully loaded
              setImgBroken(false)
            }}
            onClick={() => handleOpen(URL.createObjectURL(file))}
          />
        </Box>
      )

      setViewImage(URL.createObjectURL(file))
    })
  }, [files])

  return (
    <>
      <DropzoneWrapper>
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 2 }}>
          <Box {...getRootProps({ className: 'dropzone' })} sx={{ width: '160px', height: 'auto' }}>
            {files?.length && !editImg ? (
              <>
                {image}
                {imgUploaded && <CircularProgress />}
              </>
            ) : isEditComponent && !editImg && selectedTenant ? (
              <>
                <Box sx={{ display: 'contents', position: 'relative' }} className='file-container'>
                  <img
                    src={`${imageUrl}`}
                    alt='product'
                    className='single-file-image'
                    onLoad={() => {
                      setImgBroken(false)
                      setImgLoader(false) // Set loading to false when the image is fully loaded
                    }}
                    onError={() => {
                      setImgLoader(false) // Set
                      setIsEdit(true)
                      setImgBroken(true)
                    }}
                    onClick={() => handleOpen(imageUrl)}
                  />
                </Box>
                {imgLoader && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <CircularProgress />
                  </Box>
                )}
              </>
            ) : (
              <Box sx={{ display: 'flex', textAlign: 'center', alignItems: 'center', flexDirection: 'column' }}>
                <Box
                  sx={{
                    mb: 3,
                    width: 35,
                    height: 35,
                    display: 'flex',
                    borderRadius: 1,
                    alignItems: 'center',
                    opacity: 0.2,
                    justifyContent: 'center'
                  }}
                >
                  {/* <Icon icon='tabler:drag-drop' fontSize='3.75rem' /> */}
                  <input
                    {...getInputProps({
                      onChange: event => {
                        // Call uploadImage function here
                        // uploadImage()
                      }
                    })}
                  />
                  <FileUploadOutlined sx={{ width: '24px !important', height: '24px !important' }} />
                </Box>
                <Typography sx={{ fontSize: '14px', opacity: 0.5, mb: 2.5 }}>Upload Logo</Typography>
              </Box>
            )}
          </Box>
          {(files?.length || (isEditComponent && selectedTenant)) && !imgLoader && !imgBroken ? (
            <>
              {!editImg ? (
                <Fragment>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <IconButton
                      color='primary'
                      size='small'
                      variant='contained'
                      onClick={handleEditFiles}
                      sx={{
                        background: '#4567c6',
                        color: '#FFF',
                        borderRadius: '4px',
                        '&:hover': {
                          background: '#375abb !important'
                        }
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color='error'
                      size='small'
                      variant='contained'
                      onClick={handleRemoveAllFiles}
                      sx={{
                        border: '1px solid',
                        background: '#ed6140',
                        color: '#FFF',
                        borderRadius: '4px',
                        '&:hover': {
                          background: '#cf4828 !important'
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Fragment>
              ) : (
                <Fragment>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <IconButton
                      color='primary'
                      size='small'
                      variant='contained'
                      onClick={cancelEditFiles}
                      sx={{
                        border: '1px solid',
                        background: '#ed6140',
                        color: '#FFF',
                        borderRadius: '4px',
                        '&:hover': {
                          background: '#cf4828 !important'
                        }
                      }}
                    >
                      <CancelIcon />
                    </IconButton>
                  </Box>
                </Fragment>
              )}
            </>
          ) : null}
        </Box>
      </DropzoneWrapper>
      <Backdrop sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }} open={open}>
        <div>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <Box sx={{ background: '#FFF', p: 3, borderRadius: 3 }}>
              <Box sx={{ p: 7 }}>
                {teblerEdit ? (
                  <DropzoneWrapper>
                    <Box
                      {...getRootProps({ className: 'dropzone' })}
                      sx={{ maxWidth: 180, width: '100%', height: 130 }}
                    >
                      <Box sx={{ display: 'flex', textAlign: 'center', alignItems: 'center', flexDirection: 'column' }}>
                        <Box
                          sx={{
                            mb: 3,
                            width: 35,
                            height: 35,
                            display: 'flex',
                            borderRadius: 1,
                            alignItems: 'center',
                            opacity: 0.2,
                            justifyContent: 'center'
                          }}
                        >
                          {/* <Icon icon='tabler:drag-drop' fontSize='3.75rem' /> */}

                          <input
                            {...getInputProps({
                              onChange: event => {
                                // Call uploadImage function here
                                // uploadImage()
                              }
                            })}
                          />
                          <FileUploadOutlined sx={{ width: '24px !important', height: '24px !important' }} />
                        </Box>
                        <Typography sx={{ fontSize: '14px', opacity: 0.5, mb: 2.5 }}>Upload Image</Typography>
                      </Box>
                    </Box>
                  </DropzoneWrapper>
                ) : (
                  <Box
                    sx={{
                      maxWidth: '600px',
                      width: '100%',
                      height: 'auto',
                      overflow: 'hidden',
                      '& >img': { width: '100%' }
                    }}
                  >
                    <img src={viewImage} alt='modal-img' />
                  </Box>
                )}
              </Box>
              <Box sx={{ width: '100%', display: 'flex', justifyContent: 'end', mb: '15px' }}>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'end' }}>
                  {teblerEdit ? (
                    <IconButton size='small' variant='outlined' onClick={closeTablerImgEdit}>
                      <CancelIcon />
                    </IconButton>
                  ) : (
                    <>
                      <IconButton size='small' variant='outlined' onClick={tablerImgEdit}>
                        <Icon icon='tabler:edit' />
                      </IconButton>
                      <IconButton size='small' variant='outlined' onClick={handleRemoveAllFiles}>
                        <Icon icon='mingcute:delete-2-line' />
                      </IconButton>
                    </>
                  )}
                </Box>
              </Box>
            </Box>
            <IconButton
              size='small'
              variant='outlined'
              color='default'
              sx={{ background: 'rgba(0,0,0,0.5)', fontSize: '21px', '&:hover': { background: 'rgba(0,0,0,0.6)' } }}
              onClick={handleClose}
            >
              <Close sx={{ color: '#FFF' }} />
            </IconButton>
          </Box>
        </div>
      </Backdrop>
    </>
  )
}

export default UploadLogo
