import React, { useState, useRef } from 'react'
import { SetS3Config } from 'src/@core/components/auth/amlify-config'
// import Storage from '@aws-amplify/storage'
import { generateRandomId } from '../utils/UUID'
import { Amplify } from 'aws-amplify'
import { styled } from '@mui/material'
import { createAlert } from 'src/store/apps/alerts'
import { useDispatch } from 'react-redux'

function ImageUpload({ itemData, setItemData, setAlertMsg, setShowAlert }) {
  const dispatch = useDispatch()
  const [imageName, setImageName] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const uploadInputRef = useRef(null)

  const uploadImage = () => {
    const parts = imageFile?.type?.split('/')
    const extension = parts[1]
    const uuid = generateRandomId(10)
    // SetS3Config('wms-resourses-dev', 'public')
    Amplify.Storage.put(`productimages/${uuid}.${extension}`, imageFile, {
      contentType: imageFile.type,
      ACL: 'public-read'
    })
      .then(result => {
        setItemData({ ...itemData, image: `public/productimages/${uuid}.${extension}` })
        setImageFile(null)
        setAlertMsg('Success uploading file!')
        setShowAlert(true)
        dispatch(createAlert({ message: 'File Uploaded successfully !', type: 'success' }))
      })
      .catch(err => {
        setAlertMsg('Failed uploading file!')
        setShowAlert(true)
      })
  }

  return (
    <div className='App'>
      <input
        type='file'
        accept='image/png, image/jpeg'
        style={{ display: 'none' }}
        ref={uploadInputRef}
        onChange={e => {
          const file = e.target.files[0]
          setImageFile(file)
          setImageName(file.name)
        }}
      />
      <input value={imageName} readOnly placeholder='Select file' />
      <button
        onClick={() => {
          if (uploadInputRef.current) {
            uploadInputRef.current.value = null
            uploadInputRef.current.click()
          }
        }}
        loading={false}
      >
        Browse
      </button>

      {imageFile && <button onClick={uploadImage}>Upload File</button>}

      {/* {!!response && <div>{response}</div>} */}
    </div>
  )
}
export default ImageUpload
