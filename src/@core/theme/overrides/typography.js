const typography = {
  MuiTypography: {
    styleOverrides: {
      gutterBottom: ({ theme }) => ({
        color: '#000'
        // marginBottom: theme.spacing(2)
      })
    },
    variants: [
      {
        props: { variant: 'h1' },
        style: ({ theme }) => ({ color: theme.palette.text.primary, marginBottom: 'unset' })
      },
      {
        props: { variant: 'h2' },
        style: ({ theme }) => ({ color: theme.palette.text.primary, marginBottom: 'unset' })
      },
      {
        props: { variant: 'h3' },
        style: ({ theme }) => ({ color: theme.palette.text.primary, marginBottom: 'unset' })
      },
      {
        props: { variant: 'h4' },
        style: ({ theme }) => ({ color: theme.palette.text.primary, marginBottom: 'unset' })
      },
      {
        props: { variant: 'h5' },
        style: ({ theme }) => ({ color: theme.palette.text.primary, marginBottom: 'unset' })
      },
      {
        props: { variant: 'h6' },
        style: ({ theme }) => ({ color: theme.palette.text.primary, marginBottom: '0px' })
      },
      {
        props: { variant: 'subtitle1' },
        style: ({ theme }) => ({ color: theme.palette.text.primary, margin: '0px' })
      },
      {
        props: { variant: 'subtitle2' },
        style: ({ theme }) => ({ color: theme.palette.text.secondary, marginBottom: 'unset' })
      },
      {
        props: { variant: 'body1' },
        style: ({ theme }) => ({ color: theme.palette.text.primary, marginBottom: 'unset' })
      },
      {
        props: { variant: 'body2' },
        style: ({ theme }) => ({ color: theme.palette.text.secondary, marginBottom: 'unset' })
      },
      {
        props: { variant: 'button' },
        style: ({ theme }) => ({ textTransform: 'none', color: theme.palette.text.primary })
      },
      {
        props: { variant: 'caption' },
        style: ({ theme }) => ({ color: theme.palette.text.secondary })
      },
      {
        props: { variant: 'overline' },
        style: ({ theme }) => ({ color: theme.palette.text.secondary })
      }
    ]
  }
}

export default typography
