'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

// Component Imports
import Pricing from '@components/pricing'
import { useDispatch, useSelector } from 'react-redux'
import { setLeads } from '@/redux/slices/leadSlice'
import { useEffect } from 'react'

const PricingPage = ({ data }) => {
  const dispatch = useDispatch()
  const leads = useSelector(state => state.leads.list)

  useEffect(() => {
    const rows = Array.from({ length: 10 }).map((_, i) => ({
      id: i + 1,
      referenceId: 'VH00034',
      name: 'Murthy test job',
      address: '155 Parramatta Rd, Sydney, NSW, 2046',
      source: 'Internal',
      created: '23-06-2025',
      updated: '02-07-2025',
      assignee: 'RA',
      status: i % 3 === 0 ? 'Closed one' : i % 3 === 1 ? 'Closed Lost' : 'Open'
    }))
    dispatch(setLeads(rows))
  }, [])
  console.log('LEADS', leads)
  return (
    <Card>
      <CardContent className='xl:!plb-16 xl:pli-[6.25rem] pbs-10 pbe-5 pli-5 sm:p-16'>
        <Pricing data={data} />
      </CardContent>
    </Card>
  )
}

export default PricingPage
