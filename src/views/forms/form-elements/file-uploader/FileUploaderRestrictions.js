// ** React Imports
import { Fragment, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import Button from '@mui/material/Button'
import ListItem from '@mui/material/ListItem'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Components
import toast from 'react-hot-toast'
import { useDropzone } from 'react-dropzone'
import DropzoneWrapper from 'src/@core/styles/libs/react-dropzone'

const FileUploaderRestrictions = () => {
  // ** State
  const [files, setFiles] = useState([])

  // ** Hooks
  const { getRootProps, getInputProps } = useDropzone({
    maxFiles: 2,
    maxSize: 2000000,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    onDrop: acceptedFiles => {
      setFiles(acceptedFiles.map(file => Object.assign(file)))
    },
    onDropRejected: () => {
      toast.error('You can only upload 2 files & maximum size of 2 MB.', {
        duration: 2000
      })
    }
  })

  const renderFilePreview = file => {
    if (file.type.startsWith('image')) {
      return <img width={38} height={38} alt={file.name} src={URL.createObjectURL(file)} />
    } else {
      return <Icon icon='tabler:file-description' />
    }
  }

  const handleRemoveFile = file => {
    const uploadedFiles = files
    const filtered = uploadedFiles.filter(i => i.name !== file.name)
    setFiles([...filtered])
  }

  const fileList = files.map(file => (
    <ListItem key={file.name}>
      <div className='file-details'>
        <div className='file-preview'>{renderFilePreview(file)}</div>
        <div>
          <Typography className='file-name'>{file.name}</Typography>
          <Typography className='file-size' variant='body2'>
            {Math.round(file.size / 100) / 10 > 1000
              ? `${(Math.round(file.size / 100) / 10000).toFixed(1)} mb`
              : `${(Math.round(file.size / 100) / 10).toFixed(1)} kb`}
          </Typography>
        </div>
      </div>
      <IconButton onClick={() => handleRemoveFile(file)}>
        <Icon icon='tabler:x' fontSize={20} />
      </IconButton>
    </ListItem>
  ))

  const handleRemoveAllFiles = () => {
    setFiles([])
  }

  return (
    <DropzoneWrapper>
      <Fragment>
        <div {...getRootProps({ className: 'dropzone' })}>
          <input {...getInputProps()} />
          <Box sx={{ display: 'flex', textAlign: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <Box
              sx={{
                mb: '20px',
                width: 50,
                height: 50,
                opacity: 0.2
                // display: 'flex',
                // borderRadius: 1,
                // alignItems: 'center',
                // justifyContent: 'center',
                // backgroundColor: theme => `rgba(${theme.palette.customColors.main}, 0.08)`
              }}
            >
              <Icon
                icon='tabler:drag-drop'
                width='50px'
                height='50px'
                sx={{ width: '100%', height: '100%', fontSize: '50px' }}
              />
            </Box>
            <Typography sx={{ color: 'rgba(0, 0, 0, 0.5)', fontSize: '14px', mb: '10px' }}>
              Drag image(s) here or <span style={{ color: '#4567C6' }}> Browse image</span>
            </Typography>
            {/* <Typography sx={{ color: 'text.secondary' }}>Allowed *.jpeg, *.jpg, *.png, *.gif</Typography> */}
            <Typography sx={{ color: 'rgba(0, 0, 0, 0.5)', fontSize: '14px' }}>
              You can add up to 15 images each not exceeding 5 MB.
            </Typography>
          </Box>
        </div>
        {files.length ? (
          <Fragment>
            <List>{fileList}</List>
            <div className='buttons'>
              <Button color='error' variant='outlined' onClick={handleRemoveAllFiles}>
                Remove All
              </Button>
              <Button variant='contained'>Upload Files</Button>
            </div>
          </Fragment>
        ) : null}
      </Fragment>
    </DropzoneWrapper>
  )
}

export default FileUploaderRestrictions
