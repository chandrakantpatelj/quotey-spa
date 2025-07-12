'use client'

import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { store } from '@/redux/store'

import { Amplify } from 'aws-amplify'
import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'

import awsExports from '@/components/auth/awsexport'
import { components, formFields } from '@/components/auth/AuthenticatorUI'

let isConfigured = false

export default function ReduxProviders({ children }) {
  useEffect(() => {
    if (!isConfigured) {
      Amplify.configure(awsExports)
      isConfigured = true
    }
  }, [])

  return (
    // <Authenticator formFields={formFields} components={components} hideSignUp={true}>
    //   {({ signOut, user }) => <Provider store={store}>{children}</Provider>}
    // </Authenticator>
    <Authenticator>
      {({ signOut, user }) => (
        <div>
          <h1>Hello, {user?.username}</h1>
          <button onClick={signOut}>Sign out</button>
        </div>
      )}
    </Authenticator>
  )
}
