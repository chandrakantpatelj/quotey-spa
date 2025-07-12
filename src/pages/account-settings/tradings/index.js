import Link from 'next/link'
import { useEffect, useState } from 'react'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import { Typography, Button } from '@mui/material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { useDispatch, useSelector } from 'react-redux'
import TradingsListTable from 'src/views/settings/tradingnames/TradingsListTable'
import { checkAuthorizedRoute, hasPermission } from 'src/common-functions/utils/UtilityFunctions'
import { CREATE_TRADING, LIST_TRADING } from 'src/common-functions/utils/Constants'
import useTradings from 'src/hooks/getData/useTradings'
import ErrorBoundary from 'src/pages/ErrorBoundary'
import { useRouter } from 'next/router'

function Tradings() {
  const tenant = useSelector(state => state.tenants?.selectedTenant) || ''
  const { tenantId = '' } = tenant
  const { fetchTradings } = useTradings(tenantId)
  const dispatch = useDispatch()
  const router = useRouter()
  const userProfile = useSelector(state => state.userProfile)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    fetchTradings()
  }, [tenantId, fetchTradings])

  useEffect(() => {
    if (checkAuthorizedRoute(LIST_TRADING, router, userProfile)) {
      setIsAuthorized(true)
    } else {
      setIsAuthorized(false)
    }
  }, [userProfile])

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
            Trading Profiles
          </Typography>
        }
        button={
          hasPermission(userProfile, CREATE_TRADING) && (
            <Button
              variant='contained'
              color='primary'
              startIcon={<AddOutlinedIcon />}
              component={Link}
              scroll={true}
              href={`/account-settings/tradings/add-trading`}
            >
              Add New
            </Button>
          )
        }
      />
      <PageWrapper>
        <TradingsListTable tenantId={tenantId} />
      </PageWrapper>
    </ErrorBoundary>
  )
}

export default Tradings
