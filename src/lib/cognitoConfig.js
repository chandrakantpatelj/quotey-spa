import { CognitoUserPool } from 'amazon-cognito-identity-js'

const poolData = {
  UserPoolId: process.env.NEXT_PUBLIC_AUTH_USER_POOL_ID,
  ClientId: process.env.NEXT_PUBLIC_AUTH_USER_POOL_WEB_CLIENT_ID
}

const userPool = new CognitoUserPool(poolData)

export default userPool
