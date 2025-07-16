import { useAuthenticator, useTheme, View, Button, Heading, Text } from '@aws-amplify/ui-react'

const amplifyColors = {
  primary: {
    10: 'rgba(69, 103, 198, 0.1)',
    20: 'rgba(69, 103, 198, 0.2)',
    40: 'rgba(69, 103, 198, 0.4)',
    60: 'rgba(69, 103, 198, 0.6)',
    80: 'rgba(69, 103, 198, 0.8)',
    90: 'rgba(69, 103, 198, 0.9)',
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
      interactive: { value: '#4567C6' }
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
