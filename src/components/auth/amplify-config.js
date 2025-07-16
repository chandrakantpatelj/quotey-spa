// src/components/auth/amplify-config.js ✅

export const AuthConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_AUTH_USER_POOL_ID,
      userPoolClientId: process.env.NEXT_PUBLIC_AUTH_USER_POOL_WEB_CLIENT_ID,
      identityPoolId: process.env.NEXT_PUBLIC_AUTH_IDENTITY_POOL_ID,
      signUpVerificationMethod: 'code' // optional
    },
    region: process.env.NEXT_PUBLIC_AUTH_AWS_REGION
  },

  Storage: {
    S3: {
      bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
      region: process.env.NEXT_PUBLIC_S3_BUCKET_REGION,
      defaultAccessLevel: 'public'
    }
  },

  API: {
    GraphQL: {
      endpoint: process.env.NEXT_PUBLIC_APPSYNC_API_URL,
      region: process.env.NEXT_PUBLIC_APPSYNC_AWS_REGION,
      defaultAuthMode: 'userPool' // AMAZON_COGNITO_USER_POOLS
    }
  }
}
