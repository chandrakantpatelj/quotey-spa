import { useEffect, useState } from 'react'
import { Box } from '@mui/material'
import { fetchImage } from 'src/common-functions/utils/UtilityFunctions'

function ShowItemImages({ product }) {
  const [imgLoader, setImgLoader] = useState(true)
  const [imageUrl, setImageURL] = useState('')

  useEffect(() => {
    product.images.length > 0 && fetchImage(setImageURL, product.images[0].key || null, setImgLoader)
  }, [product])

  return (
    <>
      {!imgLoader ? (
        <Box
          sx={{
            width: '60px',
            height: '100%',
            '> img': {
              width: '100%',
              height: 'auto'
            }
          }}
        >
          <img src={imageUrl} alt='image' />
        </Box>
      ) : (
        <Box
          sx={{
            width: '60px',
            height: '60px'
          }}
        ></Box>
      )}
    </>
  )
}

export default ShowItemImages
