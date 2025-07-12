import { createAlert } from 'src/store/apps/alerts'
import { Storage } from 'aws-amplify' // Import Storage from aws-amplify

export const uploadImage = async (files, logoImage, dispatch) => {
  try {
    const file = files[0]
    if (!file) {
      return
    }

    await Storage.put(logoImage?.key, file, {
      contentType: file.type,
      ACL: 'public-read'
    })
  } catch (error) {
    console.error('Error uploading key:', error)
    dispatch(createAlert({ message: 'Image uploading failed!', type: 'error' }))
  }
}
