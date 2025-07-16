import { Circle, Close } from '@mui/icons-material'
import { Alert, Box, List, ListItem, ListItemIcon, Snackbar, Typography } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import { useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { generateRandomId } from 'src/common-functions/utils/UUID'
import Icon from 'src/@core/components/icon'
import ViewPdfPopup from 'src/common-components/ViewPdfPopup'
import ShowFileList from './ShowFileList'

function CustomFilesUpload({ setValue, selectedPdFile, setSelectedPdFile, folderName }) {
  const [viewPdfPopupOpen, setViewPdfPopupOpen] = useState(false)
  const [files, setFiles] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null) // To store the currently selected file for full preview

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: true,
    accept: '.pdf',
    onDrop: acceptedFiles => {
      const updatedFiles = acceptedFiles.map(file => {
        const uuid = generateRandomId(10)
        const extension = file.type.split('/')[1]
        const key = `${folderName}/${uuid}.${extension}`
        const fileName = file.name
        return { key, file, fileName }
      })
      setSelectedPdFile(prevFiles => [...prevFiles, ...updatedFiles])
      setFiles(true)
    }
  })

  useEffect(() => {
    if (files) {
      uploadPdf()
      setFiles(false)
    }
  }, [files])

  const uploadPdf = () => {
    const filePathsArray = selectedPdFile?.map(item => {
      return { key: item.key, fileName: item.fileName }
    })

    setValue('files', filePathsArray)
  }

  const removeFile = file => {
    setSelectedPdFile(prevFiles => prevFiles?.filter(f => f.key !== file.key))
    setFiles(true)
  }

  return (
    <>
      <Box
        sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-start', mb: 5 }}
      >
        <div {...getRootProps()} style={dropzoneStyles}>
          <input {...getInputProps()} />
          {isDragActive ? (
            <p style={{ color: '#4567c6' }}>Drop the files here...</p>
          ) : (
            <p style={{ color: '#4567c6' }}>Drag and drop multiple files here, or click to select files</p>
          )}
        </div>
      </Box>
      <div>
        {selectedPdFile?.length > 0 && (
          <div>
            <Typography variant='h6' sx={{ mb: 0 }}>
              Selected Files:
            </Typography>
            <Box sx={{ py: 0, pl: 0, mb: 1, maxWidth: '50%' }}>
              <ShowFileList selectedPdFile={selectedPdFile} removeFile={removeFile} />
            </Box>
          </div>
        )}
      </div>
      {viewPdfPopupOpen && (
        <ViewPdfPopup
          selectedFile={selectedFile}
          viewPdfPopupOpen={viewPdfPopupOpen}
          setViewPdfPopupOpen={setViewPdfPopupOpen}
        />
      )}
    </>
  )
}
const dropzoneStyles = {
  border: '2px dashed #cccccc',
  // borderColor: '#4567c6',
  borderRadius: '4px',
  padding: '20px',
  textAlign: 'center',
  cursor: 'pointer'
}

export default CustomFilesUpload
