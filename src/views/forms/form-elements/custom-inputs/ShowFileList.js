'use client'

import { useState } from 'react'
import { List, ListItem, Typography, IconButton, Box, Tooltip } from '@mui/material'
import Icon from 'src/@core/components/icon'
import ViewPdfPopup from 'src/common-components/ViewPdfPopup'

const ShowFileList = ({ selectedPdFile, removeFile }) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [viewPdfPopupOpen, setViewPdfPopupOpen] = useState(false)

  const handleOpenPopup = (file, key, fileName) => {
    setViewPdfPopupOpen(true)
    setSelectedFile({ file, key, fileName })
  }

  return (
    <div>
      <Box>
        <List dense>
          {selectedPdFile?.map(({ file, fileName, key }) => (
            <ListItem
              key={key}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2,
                cursor: 'pointer'
              }}
              onClick={() => handleOpenPopup(file, key, fileName)}
            >
              <>
                {['jpg', 'jpeg', 'png', 'gif'].includes(fileName.split('.').pop().toLowerCase()) ? (
                  <Icon
                    icon='material-symbols:image-outline' // Image icon
                    style={{
                      color: '#4567c6',
                      width: '40px',
                      height: '40px',
                      overflow: 'hidden'
                    }}
                  />
                ) : (
                  <Icon
                    icon='vscode-icons:file-type-pdf2' // PDF icon
                    style={{
                      width: '40px',
                      height: '40px',
                      overflow: 'hidden'
                    }}
                  />
                )}
              </>

              <div style={{ flexGrow: 1, paddingLeft: '16px' }}>
                <Typography sx={{ fontSize: '13px', fontWeight: 500 }}>
                  {fileName} {typeof file === 'object' && `- ${formatBytes(file.size)}`}
                </Typography>
              </div>
              <Tooltip title='Delete' placement='top'>
                <IconButton
                  size='small'
                  color='error'
                  onClick={e => {
                    e.stopPropagation() // Prevent triggering file selection
                    removeFile({ fileName, key })
                  }}
                >
                  <Icon icon='mingcute:delete-2-line' sx={{ fontSize: '20px' }} />
                </IconButton>
              </Tooltip>
            </ListItem>
          ))}
        </List>
      </Box>

      {viewPdfPopupOpen && (
        <ViewPdfPopup
          selectedFile={selectedFile}
          viewPdfPopupOpen={viewPdfPopupOpen}
          setViewPdfPopupOpen={setViewPdfPopupOpen}
        />
      )}
    </div>
  )
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default ShowFileList
