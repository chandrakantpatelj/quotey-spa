'use client'

import { Amplify } from 'aws-amplify'
import { AuthConfig } from '@/components/auth/amplify-config'

Amplify.configure(AuthConfig)

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
