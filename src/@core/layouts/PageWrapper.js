import React from 'react'
import { styled } from '@mui/material/styles'
import { useSelector } from 'react-redux'
import { BlurOverlay } from './BlurOverlay'
import { Alert } from '@mui/material'
import { useRouter } from 'next/router'

const ContentWrapper = styled('main')(({ theme }) => ({
  flexGrow: 1,
  width: '100%',
  padding: '40px 45px',
  transition: 'padding .25s ease-in-out',
  [theme.breakpoints.down('lg')]: {
    padding: '35px'
  },
  [theme.breakpoints.down('sm')]: {
    padding: '15px'
  }
}))

function PageWrapper(props) {
  const router = useRouter()
  const { children } = props
  const tenantObject = useSelector(state => state.tenants)
  const { selectedTenant, data: tenants } = tenantObject || {}
  const isTenantEmpty =
    !selectedTenant || Object.keys(selectedTenant).length === 0
      ? router.pathname !== '/account-settings/company/add-company'
      : false

  return (
    <ContentWrapper>
      {isTenantEmpty && (
        <BlurOverlay>
          <Alert severity='warning'>Please select a company to proceed</Alert>
        </BlurOverlay>
      )}
      <div style={{ filter: isTenantEmpty ? 'blur(4px)' : 'none' }}>{children}</div>
    </ContentWrapper>
  )
}

export default PageWrapper
