import Link from 'next/link'
import { useEffect, useState } from 'react'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import { Typography, Button, LinearProgress, Tooltip, IconButton, Box } from '@mui/material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import UserListTable from 'src/views/settings/user/UserListTable'
import { useDispatch, useSelector } from 'react-redux'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import { useRouter } from 'next/router'
import { Refresh } from '@mui/icons-material'
import useUserAccounts from 'src/hooks/getData/useUserAccounts'
import { resetUserAccounts } from 'src/store/apps/user'

function User() {
  const dispatch = useDispatch()
  const router = useRouter()

  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId) || ''
  const userProfile = useSelector(state => state.userProfile)
  const [isAuthorized, setIsAuthorized] = useState(false)
  let { userAccounts, loading } = useUserAccounts()
  const [userObject, setUserObject] = useState()
  const { isRootUser } = userProfile

  useEffect(() => {
    setUserObject({ userAccounts: userAccounts })
  }, [userAccounts])

  useEffect(() => {
    if (isRootUser) {
      setIsAuthorized(true)
    } else {
      router.push('/unauthorized')
      setIsAuthorized(false)
    }
  }, [tenantId, userProfile])

  if (!isAuthorized) {
    return null
  }
  return (
    <ErrorBoundary tenantId={tenantId} dispatch={dispatch}>
      <PageHeader
        title={
          <Typography
            sx={{
              fontSize: { xs: '16px', md: '18px' },
              fontWeight: '500'
            }}
          >
            Users
          </Typography>
        }
        button={
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Tooltip title='Reload' placement='top'>
              <IconButton
                color='default'
                sx={{ fontSize: '21px' }}
                onClick={() => {
                  dispatch(resetUserAccounts())
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
            {isRootUser && (
              <Button
                variant='contained'
                color='primary'
                startIcon={<AddOutlinedIcon />}
                component={Link}
                scroll={true}
                href={`/account-settings/user/add-user`}
              >
                Add New
              </Button>
            )}
          </Box>
        }
      />
      <PageWrapper>{loading ? <LinearProgress /> : <UserListTable userObject={userObject} />}</PageWrapper>
    </ErrorBoundary>
  )
}

export default User
