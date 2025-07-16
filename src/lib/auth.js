import { CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js'

import userPool from './cognitoConfig'

export const login = (Username, Password) => {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username, Pool: userPool })

    const authDetails = new AuthenticationDetails({
      Username,
      Password
    })

    user.authenticateUser(authDetails, {
      onSuccess: session => resolve(session),
      onFailure: err => reject(err)
    })
  })
}
