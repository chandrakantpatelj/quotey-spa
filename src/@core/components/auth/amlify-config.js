export const AuthConfig = {
  Auth: {
    region: process.env.NEXT_PUBLIC_AUTH_AWS_REGION,
    userPoolId: process.env.NEXT_PUBLIC_AUTH_USER_POOL_ID,
    userPoolWebClientId: process.env.NEXT_PUBLIC_AUTH_USER_POOL_WEB_CLIENT_ID,
    identityPoolId: process.env.NEXT_PUBLIC_AUTH_IDENTITY_POOL_ID
  },
  Storage: {
    bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
    region: process.env.NEXT_PUBLIC_S3_BUCKET_REGION,
    level: 'public',
    identityPoolId: process.env.NEXT_PUBLIC_AUTH_IDENTITY_POOL_ID
  }
}
export const myAppConfig = {
  aws_appsync_graphqlEndpoint: process.env.NEXT_PUBLIC_APPSYNC_API_URL,
  aws_appsync_region: process.env.NEXT_PUBLIC_APPSYNC_AWS_REGION,
  aws_appsync_authenticationType: 'AMAZON_COGNITO_USER_POOLS' // You have configured Auth with Amazon Cognito User Pool ID and Web Client Id
}
