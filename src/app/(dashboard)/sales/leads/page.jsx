'use client'

'use client'

import { useState, useEffect } from 'react'

// ✅ MUI imports
import Tab from '@mui/material/Tab'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import Typography from '@mui/material/Typography'
import { Card, Box } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import Button from '@mui/material/Button'

// ✅ Project imports
import { useAuth } from '@/hooks/useAuth'
import { getLeads } from '@/services/leadsService'
import BasicDataTables from '@/views/Tables/BasicDataTables'
import CustomIconButton from '@/@core/components/mui/IconButton'
import AddLeadDrawer from '@/views/Leads/AddLeadDrawer'

export default function Leads() {
  const { token } = useAuth()
  const [value, setValue] = useState('all')
  const [leads, setLeads] = useState([])
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    if (token) {
      getLeads(token).then(setLeads).catch(console.error)
    }
  }, [token])

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  const handleAddLead = () => setDrawerOpen(true)

  return (
    <div>
      <h1>Leads</h1>
      <Box display='flex' justifyContent='flex-end' alignItems='center' gap={3} sx={{ mb: 2 }}>
        <CustomIconButton aria-label='capture screenshot' color='primary' variant='outlined'>
          <i className='tabler-adjustments-horizontal' />
        </CustomIconButton>
        <CustomIconButton aria-label='capture screenshot' color='error' variant='outlined'>
          <i className='tabler-trash' />
        </CustomIconButton>
        <CustomIconButton aria-label='capture screenshot' color='secondary' variant='outlined'>
          <i className='tabler-download' />
        </CustomIconButton>
        <CustomIconButton aria-label='capture screenshot' color='secondary' variant='outlined'>
          <i className='tabler-upload' />
        </CustomIconButton>

        <Button
          variant='contained'
          onClick={handleAddLead}
          startIcon={<AddIcon />}
          sx={{
            backgroundColor: '#6C63FF',
            textTransform: 'none',
            fontWeight: 'bold',
            '&:hover': { backgroundColor: '#5a52d4' }
          }}
        >
          Add Leads
        </Button>
      </Box>

      <TabContext value={value}>
        <TabList onChange={handleChange} aria-label='centered tabs example'>
          <Tab value='all' label='All' />
          <Tab value='leads' label='Leads' />
          <Tab value='closed-won' label='Closed Won' />
          <Tab value='closed-lost' label='Closed Lost' />
          <Tab value='on-hold' label='On Hold' />
        </TabList>
        <TabPanel value='all'>
          <Card>
            <BasicDataTables leads={leads} />
          </Card>
        </TabPanel>

        <TabPanel value='leads'>
          <Typography>
            Chocolate bar carrot cake candy canes sesame snaps. Cupcake pie gummi bears jujubes candy canes. Chupa chups
            sesame snaps halvah.
          </Typography>
        </TabPanel>

        <TabPanel value='closed-won'>
          <Typography>
            Danish tiramisu jujubes cupcake chocolate bar cake cheesecake chupa chups. Macaroon ice cream tootsie roll
            carrot cake gummi bears.
          </Typography>
        </TabPanel>

        <TabPanel value='closed-lost'>
          <Typography>
            Cake apple pie chupa chups biscuit liquorice tootsie roll liquorice sugar plum. Cotton candy wafer wafer
            jelly cake caramels brownie gummies.
          </Typography>
        </TabPanel>

        <TabPanel value='on-hold'>
          <Typography>
            Danish tiramisu jujubes cupcake chocolate bar cake cheesecake chupa chups. Macaroon ice cream tootsie roll
            carrot cake gummi bears.
          </Typography>
        </TabPanel>
      </TabContext>
      <AddLeadDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  )
}
