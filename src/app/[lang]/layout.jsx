// Next Imports
import { headers } from 'next/headers'

// MUI Imports
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'

// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// HOC Imports
import TranslationWrapper from '@/hocs/TranslationWrapper'

// Config Imports
import { i18n } from '@configs/i18n'

// Util Imports

// Global Styles
import '@/app/globals.css'

// Generated Icon CSS
import '@assets/iconify-icons/generated-icons.css'

import { getSystemMode } from '@/@core/utils/serverHelpers.server'

export const metadata = {
  title: 'Vuexy - MUI Next.js Admin Dashboard Template',
  description:
    'Vuexy - MUI Next.js Admin Dashboard Template - is the most developer friendly & highly customizable Admin Dashboard Template based on MUI v5.'
}

export default function RootLayout({ children }) {
  // ✅ These are available at server render time
  const headersList = headers()
  const systemMode = getSystemMode()

  return (
    <html id='__next' lang='en' suppressHydrationWarning>
      <body className='flex is-full min-bs-full flex-auto flex-col'>
        <InitColorSchemeScript attribute='data' defaultMode={systemMode} />
        {/* Wrap for translations later */}
        <TranslationWrapper headersList={headersList} lang='en'>
          {children}
        </TranslationWrapper>
      </body>
    </html>
  )
}
