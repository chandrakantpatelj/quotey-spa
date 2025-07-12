import { Button, Heading, Image, Text, View, useAuthenticator, useTheme } from '@aws-amplify/ui-react'

const amplifyColors = {
  primary: {
    10: 'rgba(69, 103, 198, 0.1)',
    20: 'rgba(69, 103, 198, 0.2)',
    40: 'rgba(69, 103, 198, 0.4)',
    60: 'rgba(69, 103, 198, 0.6)',
    80: 'rgba(69, 103, 198, 0.8)',
    90: ' rgba(69, 103, 198, 0.9)',
    100: 'rgba(69, 103, 198, 1)',
    dark: 'rgba(46, 78, 167, 1)'
  }
}

export const theme = {
  name: 'my-theme',
  tokens: {
    colors: {
      brand: {
        primary: {
          10: { value: amplifyColors.primary[10] },
          20: { value: amplifyColors.primary[20] },
          40: { value: amplifyColors.primary[40] },
          60: { value: amplifyColors.primary[60] },
          80: { value: amplifyColors.primary[80] },
          90: { value: amplifyColors.primary[90] },
          100: { value: amplifyColors.primary[100] }
        }
      }
    },
    font: {
      // primary: { value: '#4567C6' },
      interactive: { value: '#4567C6' }
      // ...
    },
    components: {
      button: {
        primary: {
          backgroundColor: { value: amplifyColors.primary[100] },
          _hover: {
            backgroundColor: { value: amplifyColors.primary.dark }
          }
        }
      }
    }
  }
}

export const components = {
  Header() {
    const { tokens } = useTheme()

    return (
      <View textAlign='center' padding={tokens.space.large}>
        {/* <Image alt='Amplify logo' src='https://docs.amplify.aws/assets/logo-dark.svg' /> */}
        <img src='/warehouse-img/Logo.png' alt='logo' />
      </View>
    )
  },

  Footer() {
    const { tokens } = useTheme()

    return (
      <View textAlign='center' padding={tokens.space.large}>
        <Text color={tokens.colors.neutral[80]}>&copy; All Rights Reserved</Text>
      </View>
    )
  },

  SignIn: {
    Header() {
      const { tokens } = useTheme()

      return (
        <Heading padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`} level={3}>
          Sign in
        </Heading>
      )
    },
    Footer() {
      const { toResetPassword } = useAuthenticator()
      const { tokens } = useTheme()

      return (
        <View textAlign='center'>
          <Button
            fontWeight='normal'
            // color={tokens.colors.brand.primary[100].value}
            // colorTheme='default'
            onClick={toResetPassword}
            size='small'
            variation='link'
            marginBottom={'10px'}
          >
            Reset Password
          </Button>
        </View>
      )
    }
  },

  SignUp: {
    Header() {
      const { tokens } = useTheme()

      return (
        <Heading padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`} level={3}>
          Create a new account
        </Heading>
      )
    },
    Footer() {
      const { toSignIn } = useAuthenticator()

      return (
        <View textAlign='center'>
          <Button fontWeight='normal' isFullWidth={false} onClick={toSignIn} size='small' variation='link'>
            Back to Sign In
          </Button>
        </View>
      )
    }
  },
  ConfirmSignUp: {
    Header() {
      const { tokens } = useTheme()
      return (
        <Heading padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`} level={3}>
          Enter Information:
        </Heading>
      )
    },
    Footer() {
      return <Text>Footer Information</Text>
    }
  },
  SetupTOTP: {
    Header() {
      const { tokens } = useTheme()
      return (
        <Heading padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`} level={3}>
          Enter Information:
        </Heading>
      )
    },
    Footer() {
      return <Text>Footer Information</Text>
    }
  },
  ConfirmSignIn: {
    Header() {
      const { tokens } = useTheme()
      return (
        <Heading padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`} level={3}>
          Enter Information:
        </Heading>
      )
    },
    Footer() {
      return <Text>Footer Information</Text>
    }
  },
  ResetPassword: {
    Header() {
      const { tokens } = useTheme()
      return (
        <Heading padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`} level={3}>
          Enter Information:
        </Heading>
      )
    }
  },
  ConfirmResetPassword: {
    Header() {
      const { tokens } = useTheme()
      return (
        <Heading padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`} level={3}>
          Enter Information:
        </Heading>
      )
    },
    Footer() {
      return <Text>Footer Information</Text>
    }
  }
}

export const formFields = {
  signIn: {
    username: {
      label: 'Username ',
      required: true,
      placeholder: 'Enter your Username'
    }
  },
  signUp: {
    email: {
      label: 'Email:',
      placeholder: 'Enter your Email:',
      isRequired: false,
      order: 1
    },
    password: {
      label: 'Password:',
      placeholder: 'Enter your Password:',
      isRequired: false,
      order: 2
    },
    confirm_password: {
      label: 'Confirm Password:',
      order: 3
    }
  },
  forceNewPassword: {
    password: {
      placeholder: 'Enter your Password:'
    }
  },
  resetPassword: {
    username: {
      placeholder: 'Enter your email:'
    }
  },
  confirmResetPassword: {
    confirmation_code: {
      placeholder: 'Enter your Confirmation Code:',
      label: 'Email Confirmation Code',
      isRequired: false
    },
    confirm_password: {
      placeholder: 'Enter your Password Please:'
    }
  },
  setupTOTP: {
    QR: {
      totpIssuer: 'test issuer',
      totpUsername: 'amplify_qr_test_user'
    },
    confirmation_code: {
      label: 'New Label',
      placeholder: 'Enter your Confirmation Code:',
      isRequired: false
    }
  }
}
