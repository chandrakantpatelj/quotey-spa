import { Amplify } from 'aws-amplify'
import React from 'react'
import { AuthConfig } from 'src/@core/components/auth/amlify-config'
Amplify.configure(AuthConfig)

async function DeleteUploadFile(key) {
  try {
    await Amplify.Storage.remove(key, { level: 'public' })
  } catch (error) {
    console.error('File Deletion failed!', error)
  }
}

export default DeleteUploadFile
