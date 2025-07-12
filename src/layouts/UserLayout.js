import useMediaQuery from '@mui/material/useMediaQuery'
import { useEffect } from 'react'

// ** Layout Imports
// !Do not remove this Layout import
import Layout from 'src/@core/layouts/Layout'

// ** Navigation Imports
import VerticalNavItems from 'src/navigation/vertical'

// ** Component Import
import VerticalAppBarContent from './components/vertical/AppBarContent'

// ** Hook Import
import { useSettings } from 'src/@core/hooks/useSettings'
import { useSelector } from 'react-redux'

const UserLayout = ({ children, contentHeightFixed }) => {
  const userProfile = useSelector(state => state.userProfile)
  const selectedTenant = useSelector(state => state.tenants?.selectedTenant)
  const isTenantEmpty = !selectedTenant || Object.keys(selectedTenant).length === 0
  // ** Hooks
  const { settings, saveSettings } = useSettings()

  // ** Vars for server side navigation
  // const { menuItems: verticalMenuItems } = ServerSideVerticalNavItems()

  // ** Media query to determine if the screen is smaller than 'lg'
  const hidden = useMediaQuery(theme => theme.breakpoints.down('lg'))
  // Move layout change logic to a useEffect to prevent early return
  useEffect(() => {
    if (hidden && settings.layout === 'horizontal') {
      saveSettings({ ...settings, layout: 'vertical' }) // Update layout through saveSettings function
    }
  }, [hidden, settings, saveSettings])

  return (
    <Layout
      hidden={isTenantEmpty ? true : hidden}
      settings={settings}
      saveSettings={saveSettings}
      contentHeightFixed={contentHeightFixed}
      verticalLayoutProps={{
        navMenu: {
          navItems: VerticalNavItems(userProfile)
        },
        appBar: {
          content: props => (
            <VerticalAppBarContent
              hidden={isTenantEmpty ? false : hidden}
              settings={settings}
              saveSettings={saveSettings}
              toggleNavVisibility={props.toggleNavVisibility}
            />
          )
        }
      }}
      // {...(settings.layout === 'horizontal' && {
      //   horizontalLayoutProps: {
      //     navMenu: {
      //       navItems: HorizontalNavItems()

      //       // Uncomment the below line when using server-side menu in horizontal layout and comment the above line
      //       // navItems: horizontalMenuItems
      //     },
      //     appBar: {
      //       content: () => <HorizontalAppBarContent hidden={hidden} settings={settings} saveSettings={saveSettings} />
      //     }
      //   }
      // })}
    >
      {children}
    </Layout>
  )
}

export default UserLayout
