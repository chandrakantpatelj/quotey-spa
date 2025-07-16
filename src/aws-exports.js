const awsConfig = {
  Auth: {
    Cognito: {
      region: process.env.NEXT_PUBLIC_AUTH_AWS_REGION,
      userPoolId: process.env.NEXT_PUBLIC_AUTH_USER_POOL_ID,
      userPoolClientId: process.env.NEXT_PUBLIC_AUTH_USER_POOL_WEB_CLIENT_ID,
      identityPoolId: process.env.NEXT_PUBLIC_AUTH_IDENTITY_POOL_ID
    }
  },
  Storage: {
    bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
    region: process.env.NEXT_PUBLIC_S3_BUCKET_REGION
  },
  aws_appsync_graphqlEndpoint: process.env.NEXT_PUBLIC_APPSYNC_API_URL,
  aws_appsync_region: process.env.NEXT_PUBLIC_APPSYNC_AWS_REGION,
  appEnv: process.env.NEXT_PUBLIC_APP_ENV
}

export default awsConfig
