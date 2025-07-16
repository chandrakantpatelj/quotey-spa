import { Dialog, DialogTitle, Alert, DialogContent } from '@mui/material'
import Icon from 'src/@core/components/icon'
import CustomCloseButton from './CustomCloseButton'

export default function ViewPdfPopup({ selectedFile, viewPdfPopupOpen, setViewPdfPopupOpen }) {
  const handleClose = () => {
    setViewPdfPopupOpen(false)
  }

  const fileExtension = selectedFile?.fileName?.split('.').pop().toLowerCase()
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension)

  return (
    <Dialog
      open={viewPdfPopupOpen}
      disableEscapeKeyDown
      maxWidth='md'
      fullWidth={true}
      scroll='paper'
      aria-labelledby='alert-dialog-title'
      aria-describedby='alert-dialog-description'
      onClose={(event, reason) => {
        if (reason !== 'backdropClick') {
        }
      }}
      sx={{
        '& .MuiDialog-paper': {
          overflow: 'visible',
          p: '20px 0px !important',
          verticalAlign: 'top',
          height: '100%'
        }
      }}
    >
      <DialogTitle id='alert-dialog-title'>
        <Alert severity='info' sx={{ color: 'rgba(0,0,0,0.8)' }}>
          {selectedFile.fileName}
        </Alert>{' '}
      </DialogTitle>
      <DialogContent sx={{ py: 8 }}>
        <CustomCloseButton onClick={handleClose}>
          <Icon icon='tabler:x' fontSize='1.25rem' />
        </CustomCloseButton>
        {isImage ? (
          <img
            src={typeof selectedFile.file === 'string' ? selectedFile.file : URL.createObjectURL(selectedFile.file)}
            alt={selectedFile?.fileName}
            onError={e => {
              e.target.style.display = 'none'
            }}
            style={{
              maxWidth: '100%',
              maxHeight: '80vh',
              objectFit: 'contain'
            }}
          />
        ) : (
          <iframe
            title={selectedFile.fileName}
            src={typeof selectedFile.file === 'string' ? selectedFile.file : URL.createObjectURL(selectedFile.file)}
            name={selectedFile.fileName}
            width='100%'
            height='100%'
            frameBorder='0'
          ></iframe>
        )}
      </DialogContent>
    </Dialog>
  )
}
