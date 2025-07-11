'use client'

import { useRouter } from 'next/navigation'
import { Box, Button, Grid2, TextField, Typography } from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-hot-toast'

function Page() {
  const router = useRouter()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      address: '',
      source: '',
      assignee: ''
    }
  })

  const onSubmit = data => {
    toast.success('Form Submitted')
    console.log('Form Data:', data)
  }

  return (
    <Box width='100%' height='100%' display='flex' flexDirection='column'>
      <Box>
        <Typography variant='h4' component='h4' fontWeight={700}>
          New Lead
        </Typography>
      </Box>

      <Box mt={2} width='30vw'>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid2 container columnSpacing={2}>
            <Grid2 size={{ xs: 12, sm: 6, md: 6 }} mb={2}>
              <Controller
                name='name'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label='Name'
                    variant='outlined'
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name ? 'This field is required.' : ''}
                  />
                )}
              />
            </Grid2>

            <Grid2 size={{ xs: 12, sm: 6, md: 6 }} mb={2}>
              <Controller
                name='address'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label='Address'
                    variant='outlined'
                    fullWidth
                    error={!!errors.address}
                    helperText={errors.address ? 'This field is required.' : ''}
                  />
                )}
              />
            </Grid2>

            <Grid2 size={{ xs: 12, sm: 6, md: 6 }} mb={2}>
              <Controller
                name='source'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label='Source'
                    variant='outlined'
                    fullWidth
                    error={!!errors.source}
                    helperText={errors.source ? 'This field is required.' : ''}
                  />
                )}
              />
            </Grid2>

            <Grid2 size={{ xs: 12, sm: 6, md: 6 }} mb={2}>
              <Controller
                name='assignee'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label='Assignee'
                    variant='outlined'
                    fullWidth
                    error={!!errors.assignee}
                    helperText={errors.assignee ? 'This field is required.' : ''}
                  />
                )}
              />
            </Grid2>

            <Grid2 size={{ xs: 12 }} className='flex gap-4'>
              <Button variant='contained' color='success' type='submit'>
                Submit
              </Button>
              <Button
                variant='tonal'
                color='secondary'
                type='button'
                onClick={() => {
                  reset()
                  router.push('/lead')
                }}
              >
                Cancel
              </Button>
            </Grid2>
          </Grid2>
        </form>
      </Box>
    </Box>
  )
}

export default Page
