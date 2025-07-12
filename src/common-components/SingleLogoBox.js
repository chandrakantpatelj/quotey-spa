import React, { useState, useEffect } from 'react'
import { Box, Skeleton } from '@mui/material'
import { Amplify } from 'aws-amplify'
import { useSelector } from 'react-redux'
import { fetchImage } from 'src/common-functions/utils/UtilityFunctions'

const SingleLogoBox = ({ data }) => {
  const [imgLoader, setImgLoader] = useState(true)
  const [imageUrl, setImageURL] = useState('')

  useEffect(() => {
    data?.logoImage?.key && fetchImage(setImageURL, data?.logoImage?.key || null, setImgLoader)
  }, [data])

  return (
    <>
      {!imgLoader ? (
        <Box
          sx={{
            maxWidth: '200px',
            width: '100%',
            height: 'auto',
            '> img': {
              width: '100%',
              height: '100%',
              objectPosition: { xs: 'left', sm: 'right' }
            },
            ml: { xs: 0, sm: 'auto' },
            mb: 1
          }}
        >
          <img src={imageUrl} alt='logo' />
        </Box>
      ) : (
        <Skeleton variant='rectangular' width={90} height={90} sx={{ ml: { xs: 0, sm: 'auto' } }} />
      )}
    </>
  )
}

export default SingleLogoBox
