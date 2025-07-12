import { Amplify } from 'aws-amplify'
import { AuthConfig } from 'src/@core/components/auth/amlify-config'
Amplify.configure(AuthConfig)

export const deleteImage = async imageUrl => {
  try {
    console.log('imageUrl deleteImageFun', imageUrl)

    const result = await Amplify.Storage.remove(imageUrl, { level: 'public' })
    console.log('result', result)
    return true
  } catch (error) {
    console.error('File Deletion failed!', error)

    return false
  }
}
