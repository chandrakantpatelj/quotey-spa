import { Storage } from 'aws-amplify' // Import Storage from aws-amplify
import { createAlert } from 'src/store/apps/alerts'

export const UploadMultipleFileS3Api = async (selectedPdfFiles, dispatch) => {
  if (!selectedPdfFiles || selectedPdfFiles.length === 0) {
    console.error('No file selected for upload')
    return
  }

  try {
    await Promise.all(
      selectedPdfFiles.map(async ({ file, key }) => {
        // Using Promise.all to wait for all uploads
        if (typeof file === 'object' && file !== null) {
          await Storage.put(key, file, {
            contentType: file.type,
            ACL: 'public-read'
          })
        }
      })
    )
  } catch (error) {
    console.error('Error in uploadPdf:', error)
    dispatch(createAlert({ message: 'Pdf Uploading failed!', type: 'error' }))
  }
}
