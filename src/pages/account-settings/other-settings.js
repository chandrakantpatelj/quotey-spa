import { useEffect, useState } from 'react'
import { styled } from '@mui/material/styles'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import { Typography, LinearProgress } from '@mui/material'
import MuiTabList from '@mui/lab/TabList'
import OtherSetting from 'src/views/settings/othersettings/OtherSetting'
import { useDispatch, useSelector } from 'react-redux'
import { checkAuthorizedRoute } from 'src/common-functions/utils/UtilityFunctions'
import { LIST_OTHER_SETTING } from 'src/common-functions/utils/Constants'
import ErrorBoundary from '../ErrorBoundary'
import { useRouter } from 'next/router'
import useOtherSettings from 'src/hooks/getData/useOtherSettings'

function OtherSettings() {
  const dispatch = useDispatch()
  const router = useRouter()
  const userProfile = useSelector(state => state.userProfile)

  const [isAuthorized, setIsAuthorized] = useState(false)
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId) || ''
  const [otherSettingObject, setOtherSettingObject] = useState({})
  const { fetchOtherSettings, loadingOtherSetting } = useOtherSettings(tenantId)

  const TabList = styled(MuiTabList)(({ theme }) => ({
    borderBottom: '0 !important',
    '&, & .MuiTabs-scroller': {
      boxSizing: 'content-box',
      padding: theme.spacing(1.25, 1.25, 2),
      margin: `${theme.spacing(-1.25, -1.25, -2)} !important`
    },
    '& .MuiTabs-indicator': {
      display: 'none'
    },
    '& .MuiTabs-root': {
      minHeight: '32px'
    },
    '& .Mui-selected': {
      boxShadow: theme.shadows[2],
      backgroundColor: theme.palette.primary.main,
      color: `${theme.palette.common.white} !important`
    },
    '& .MuiTab-root': {
      lineHeight: 1,
      borderRadius: theme.shape.borderRadius,
      minHeight: '32px',
      fontSize: '14px',
      padding: '8px 14px',
      '&:hover': {
        color: theme.palette.primary.main,
        opacity: 1
      }
    }
  }))

  useEffect(() => {
    const checkAuthRoute = async () => {
      if (checkAuthorizedRoute(LIST_OTHER_SETTING, router, userProfile)) {
        setIsAuthorized(true)
        const otherSettings = await fetchOtherSettings()

        const distructObject = {
          settings: otherSettings
        }
        setOtherSettingObject(distructObject)
      } else {
        setIsAuthorized(false)
      }
    }
    checkAuthRoute()
  }, [tenantId, userProfile, fetchOtherSettings])

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
            Other Settings
          </Typography>
        }
      />
      <PageWrapper>
        {/* <TabContext value={tab}>
          <TabList
            textColor='inherit'
            allowScrollButtonsMobile={true}
            scrollButtons={'auto'}
            onChange={(e, newValue) => setTab(newValue)}
            aria-label='lab API tabs example'
          >
            <Tab label='Other' value='other-setting' />
          </TabList>
          <Divider sx={{ my: 2 }} />
        
          <TabPanel sx={{ p: { xs: 2, md: 4 } }} value='other-setting'> */}
        {loadingOtherSetting ? (
          <LinearProgress />
        ) : (
          <OtherSetting
            otherSettingObject={otherSettingObject}
            setOtherSettingObject={setOtherSettingObject}
            loading={loadingOtherSetting}
          />
        )}
        {/* </TabPanel>
        </TabContext> */}
      </PageWrapper>
    </ErrorBoundary>
  )
}

export default OtherSettings
