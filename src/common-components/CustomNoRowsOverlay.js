import { Box, Typography } from '@mui/material'
import { GridOverlay } from '@mui/x-data-grid'

function CustomNoRowsOverlay({ mainText, subText }) {
  return (
    <GridOverlay>
      <Box
        sx={{
          maxWidth: '850px',
          width: '100%',
          outline: '2px dotted #eee',
          outlineOffset: '-17px',
          margin: '0 auto',
          padding: '30px 10px'
        }}
      >
        <Typography variant='h5' component='h5' align='center' sx={{ marginBottom: '10px' }}>
          {mainText}
        </Typography>
        <Typography variant='p' component='p' align='center'>
          {subText}
        </Typography>
      </Box>
    </GridOverlay>
  )
}

export default CustomNoRowsOverlay
