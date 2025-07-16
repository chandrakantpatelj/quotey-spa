// ** Next Imports
'use client'
import Head from 'next/head'
import { Router } from 'next/router'

// ** Store Imports
import { store, persistor } from 'src/store'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

// ** Loader Import
import NProgress from 'nprogress'

// ** Emotion Imports

// ** Config Imports
import 'src/configs/i18n'
import { defaultACLObj } from 'src/configs/acl'
import themeConfig from 'src/configs/themeConfig'

// ** Fake-DB Import
import 'src/@fake-db'

// ** Third Party Import
import { Toaster } from 'react-hot-toast'

// ** Component Imports
import UserLayout from 'src/layouts/UserLayout'
import ThemeComponent from 'src/@core/theme/ThemeComponent'
import AuthGuard from 'src/@core/components/auth/AuthGuard'
import GuestGuard from 'src/@core/components/auth/GuestGuard'

// ** Spinner Import
import Spinner from 'src/@core/components/spinner'

// ** Contexts
import { SettingsConsumer, SettingsProvider } from 'src/@core/context/settingsContext'

// ** Styled Components
import ReactHotToast from 'src/@core/styles/libs/react-hot-toast'
import CommonAlert from 'src/@core/components/common-components/CommonAlert'

// ** Utils Imports
import { createEmotionCache } from 'src/@core/utils/create-emotion-cache'

// ** Prismjs Styles
import 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'

// ** React Perfect Scrollbar Style
import 'react-perfect-scrollbar/dist/css/styles.css'
import 'src/iconify-bundle/icons-bundle-react'

// ** Global css styles
import '@aws-amplify/ui-react/styles.css'

import '../../styles/globals.css'
import { AuthConfig, myAppConfig } from 'src/@core/components/auth/amlify-config'
import Amplify_Component from 'src/views/amplify_component'
import { Amplify, API, graphqlOperation } from 'aws-amplify'
import { useEffect } from 'react'
import { getAllClients } from 'src/@core/components/graphql/queries'
Amplify.configure(AuthConfig)
Amplify.configure(myAppConfig)
// import '../../src/@core/components/auth/aws-exports'
const clientSideEmotionCache = createEmotionCache()

// ** Pace Loader
if (themeConfig.routingLoader) {
  Router.events.on('routeChangeStart', () => {
    NProgress.start()
  })
  Router.events.on('routeChangeError', () => {
    NProgress.done()
  })
  Router.events.on('routeChangeComplete', () => {
    NProgress.done()
  })
}

const Guard = ({ children, authGuard, guestGuard }) => {
  if (guestGuard) {
    return <GuestGuard fallback={<Spinner />}>{children}</GuestGuard>
  } else if (!guestGuard && !authGuard) {
    return <>{children}</>
  } else {
    return <AuthGuard fallback={<Spinner />}>{children}</AuthGuard>
  }
}

// ** Configure JSS & ClassName
const App = props => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props

  // Variables
  const contentHeightFixed = Component.contentHeightFixed ?? false

  const getLayout =
    Component.getLayout ?? (page => <UserLayout contentHeightFixed={contentHeightFixed}>{page}</UserLayout>)
  const setConfig = Component.setConfig ?? undefined
  const authGuard = Component.authGuard ?? true
  const guestGuard = Component.guestGuard ?? false
  const aclAbilities = Component.acl ?? defaultACLObj
  useEffect(() => {
    async function fetchData() {
      try {
        API.graphql(graphqlOperation(getAllClients)).then(data => {
          console.log('data', data)
          console.log('data', data)
        })
      } catch (err) {
        console.log('error fetching todos', err)
      }
    }

    // fetchData()
  }, [])

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {/* <CacheProvider value={emotionCache}> */}
        <Head>
          <title>{`${themeConfig.templateName}`}</title>
          <meta
            name='description'
            content={`${themeConfig.templateName} – Material Design React Admin Dashboard Template – is the most developer friendly & highly customizable Admin Dashboard Template based on MUI v5.`}
          />
          <meta name='keywords' content='Material Design, MUI, Admin Template, React Admin Template' />
          <meta name='viewport' content='initial-scale=1, maximum-scale=1, width=device-width, user-scalable=no' />
        </Head>

        <Amplify_Component>
          <SettingsProvider {...(setConfig ? { pageSettings: setConfig() } : {})}>
            <SettingsConsumer>
              {({ settings }) => {
                return (
                  <ThemeComponent settings={settings}>
                    {/* <Guard authGuard={authGuard} guestGuard={guestGuard}> */}
                    {/* <AclGuard aclAbilities={aclAbilities} guestGuard={guestGuard} authGuard={authGuard}> */}
                    {getLayout(<Component {...pageProps} />)}
                    {/* </AclGuard> */}
                    {/* </Guard> */}
                    <ReactHotToast>
                      <Toaster position={settings.toastPosition} toastOptions={{ className: 'react-hot-toast' }} />
                    </ReactHotToast>
                    <CommonAlert />
                  </ThemeComponent>
                )
              }}
            </SettingsConsumer>
          </SettingsProvider>
        </Amplify_Component>
        {/* </CacheProvider> */}
      </PersistGate>
    </Provider>
  )
}

export default App
