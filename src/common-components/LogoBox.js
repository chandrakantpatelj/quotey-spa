import { useState, useEffect } from 'react'
import { Box, Skeleton } from '@mui/material'
import { useSelector } from 'react-redux'
import { fetchImage } from 'src/common-functions/utils/UtilityFunctions'
import useTradings from 'src/hooks/getData/useTradings'

const LogoBox = ({ data }) => {
  const selectedtenant = useSelector(state => state.tenants?.selectedTenant) || ''
  const { tenantId = '' } = selectedtenant
  const [imgLoader, setImgLoader] = useState(true)
  const [imageUrl, setImageURL] = useState('')

  const { fetchSingleTrading } = useTradings(tenantId)

  useEffect(() => {
    const callFetchQuery = async () => {
      const trading = await fetchSingleTrading(data?.tradingId)
      const logo = trading?.logoImage?.key || selectedtenant?.logoImage?.key || null
      logo && fetchImage(setImageURL, logo, setImgLoader)
    }
    callFetchQuery()
  }, [data, tenantId, selectedtenant, fetchSingleTrading])

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
              height: 'auto',
              objectPosition: { xs: 'left', sm: 'right' }
            },
            // ml: { xs: 0, sm: 'auto' },
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

export default LogoBox
