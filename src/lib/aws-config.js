import { Amplify } from 'aws-amplify'

const awsConfig = {
  Auth: {
    region: 'ap-southeast-2', // Your AWS region
    userPoolId: 'ap-southeast-2_TZOh1RKDU', // Your User Pool ID
    userPoolWebClientId: '2b9kvr9oj8b44uit2k8co2fde9', // Your App Client ID
    authenticationFlowType: 'USER_PASSWORD_AUTH',
    oauth: {
      domain: 'your-domain.auth.us-east-1.amazoncognito.com', // Optional: if using hosted UI
      scope: ['email', 'profile', 'openid'],
      redirectSignIn: 'http://localhost:3000/', // Your redirect URL
      redirectSignOut: 'http://localhost:3000/', // Your sign out URL
      responseType: 'code'
    }
  }
}

Amplify.configure(awsConfig)
export default awsConfig
