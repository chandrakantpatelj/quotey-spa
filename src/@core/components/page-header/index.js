// ** MUI Imports

import { Box } from '@mui/material'

const PageHeader = props => {
  // ** Props
  const { title, button } = props

  return (
    <>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '3px',
          // height: 65,
          minHeight: 65,
          padding: { xs: '15px', sm: '14px 35px', lg: '14px 45px' },
          borderBottom: `1px solid #D6D6D6`,
          position: 'sticky',
          top: '87px',
          zIndex: 1000,
          background: '#FFF'
        }}
      >
        {title || ''}
        {button && button}
      </Box>
    </>
  )
}

export default PageHeader
