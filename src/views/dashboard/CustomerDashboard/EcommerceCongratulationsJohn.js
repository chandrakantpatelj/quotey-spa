// ** MUI Imports
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'

const Illustration = styled('img')(({ theme }) => ({
  right: 20,
  bottom: 0,
  position: 'absolute',
  [theme.breakpoints.down('sm')]: {
    right: 5,
    width: 110
  }
}))

const EcommerceCongratulationsJohn = () => {
  return (
    <Card sx={{ position: 'relative' }}>
      <CardContent>
        <Typography variant='h5' sx={{ mb: 0.5 }}>
          Welcome back, John! 👋
        </Typography>
        <Typography sx={{ mb: 2, color: 'text.secondary' }}>You’ve made 15 purchases this month</Typography>
        <Typography variant='h4' sx={{ mb: 0.75, color: 'primary.main' }}>
          Total Spent: $48.9k
        </Typography>
        <Button variant='contained'>View Sales</Button>
        <Illustration width={116} alt='customer dashboard summary' src='/images/cards/congratulations-john.png' />
      </CardContent>
    </Card>
  )
}

export default EcommerceCongratulationsJohn
