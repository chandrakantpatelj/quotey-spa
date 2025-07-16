'use client'

import React from 'react'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material'
import ArrowUpward from '@mui/icons-material/ArrowUpward'
import ArrowDownward from '@mui/icons-material/ArrowDownward'

// ✅ Dummy data
const leads = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'New', date: '2025-07-10' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Contacted', date: '2025-07-12' }
]

const quotes = [
  { id: 101, customer: 'John Doe', amount: '$1200', status: 'Pending', date: '2025-07-13' },
  { id: 102, customer: 'Jane Smith', amount: '$950', status: 'Approved', date: '2025-07-14' }
]

// ✅ Summary Card Component
function SummaryCard({ title, value, change, isPositive }) {
  return (
    <Card sx={{ p: 2 }}>
      <CardContent>
        <Typography variant='subtitle2' color='text.secondary'>
          {title}
        </Typography>
        <Typography variant='h5' fontWeight='bold'>
          {value}
        </Typography>
        <Box display='flex' alignItems='center' mt={1} color={isPositive ? 'success.main' : 'error.main'}>
          {isPositive ? <ArrowUpward fontSize='small' /> : <ArrowDownward fontSize='small' />}
          <Typography variant='body2' ml={0.5}>
            {change}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

// ✅ Leads Table
function LeadsTable() {
  return (
    <Card>
      <CardContent>
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
          <Typography variant='h6'>Recent Leads</Typography>
          <Button variant='contained' size='small'>
            View All
          </Button>
        </Box>
        <TableContainer component={Paper} sx={{ maxHeight: 250 }}>
          <Table stickyHeader size='small'>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leads.map(lead => (
                <TableRow key={lead.id}>
                  <TableCell>{lead.name}</TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell>{lead.status}</TableCell>
                  <TableCell>{lead.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )
}

// ✅ Quotes Table
function QuotesTable() {
  return (
    <Card>
      <CardContent>
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
          <Typography variant='h6'>Recent Quotes</Typography>
          <Button variant='contained' size='small'>
            View All
          </Button>
        </Box>
        <TableContainer component={Paper} sx={{ maxHeight: 250 }}>
          <Table stickyHeader size='small'>
            <TableHead>
              <TableRow>
                <TableCell>Customer</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {quotes.map(quote => (
                <TableRow key={quote.id}>
                  <TableCell>{quote.customer}</TableCell>
                  <TableCell>{quote.amount}</TableCell>
                  <TableCell>{quote.status}</TableCell>
                  <TableCell>{quote.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )
}

// ✅ Main Dashboard
export default function LeadQuoteDashboard() {
  return (
    <Box p={3}>
      <Typography variant='h4' fontWeight='bold' mb={3}>
        Lead & Quote Dashboard
      </Typography>

      {/* ✅ Summary Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard title='Total Leads' value='152' change='+12%' isPositive />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard title='Total Quotes' value='89' change='+5%' isPositive />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard title='Conversion Rate' value='58%' change='-2%' isPositive={false} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard title='Revenue' value='$12,500' change='+8%' isPositive />
        </Grid>
      </Grid>

      {/* ✅ Leads & Quotes */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <LeadsTable />
        </Grid>
        <Grid item xs={12} md={6}>
          <QuotesTable />
        </Grid>
      </Grid>
    </Box>
  )
}
