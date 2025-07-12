import React from 'react'

import { Authenticator, ThemeProvider } from '@aws-amplify/ui-react'
import { components, formFields, theme } from 'src/@core/components/auth/AuthenticatorUI'
import useInactivityLogout from 'src/@core/hooks/useInactivityLogout'

function Amplify_Component({ children }) {
  useInactivityLogout()
  return (
    <>
      {
        <ThemeProvider theme={theme}>
          <Authenticator formFields={formFields} components={components} hideSignUp={true}>
            {children}
          </Authenticator>
        </ThemeProvider>
      }
    </>
  )
}

export default Amplify_Component
