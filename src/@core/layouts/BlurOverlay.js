import { styled } from '@mui/material/styles'

export const BlurOverlay = styled('div')({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backdropFilter: 'blur(8px)', // Apply blur effect
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1
})
