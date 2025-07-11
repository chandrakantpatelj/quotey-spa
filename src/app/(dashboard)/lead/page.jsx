'use client'
import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Typography,
  Tabs,
  Chip,
  Avatar,
  useMediaQuery,
  Tab,
  TextField,
  Autocomplete,
  Grid2
} from '@mui/material'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined'
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined'
import { DataGrid, GridColDef, useGridApiRef } from '@mui/x-data-grid'
import PersonAddAlt1OutlinedIcon from '@mui/icons-material/PersonAddAlt1Outlined'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { setLeads } from '@/redux/slices/leadSlice'

export function IconButtonsGroup() {
  const router = useRouter()
  const isMobile = useMediaQuery('(max-width:600px)')
  const iconBoxStyle = {
    border: '1px solid #E0E0E0',
    borderRadius: 2,
    padding: 1.5,
    backgroundColor: '#fff',
    '&:hover': {
      backgroundColor: '#f9f9f9'
    }
  }

  return (
    <Box display='flex' gap={2}>
      <Tooltip title='Filter'>
        <IconButton sx={iconBoxStyle}>
          <TuneOutlinedIcon sx={{ color: '#2E7D32' }} />
        </IconButton>
      </Tooltip>

      <Tooltip title='Delete'>
        <IconButton sx={iconBoxStyle}>
          <DeleteOutlineIcon sx={{ color: '#D32F2F' }} />
        </IconButton>
      </Tooltip>

      <Tooltip title='Download'>
        <IconButton sx={iconBoxStyle}>
          <FileDownloadOutlinedIcon sx={{ color: '#1B5E20' }} />
        </IconButton>
      </Tooltip>

      <Tooltip title='Upload'>
        <IconButton sx={iconBoxStyle}>
          <FileUploadOutlinedIcon sx={{ color: '#1B5E20' }} />
        </IconButton>
      </Tooltip>
      {isMobile ? (
        <Tooltip title='Add Lead'>
          <IconButton sx={iconBoxStyle} onClick={() => router.push('/lead/create')}>
            <PersonAddAlt1OutlinedIcon sx={{ color: '#1B5E20' }} />
          </IconButton>
        </Tooltip>
      ) : (
        <Button variant='contained' color='success' onClick={() => router.push('/lead/create')}>
          + Add Leads
        </Button>
      )}
    </Box>
  )
}
export function LeadTable() {
  const isMobile = useMediaQuery('(max-width:600px)')
  const apiRef = useGridApiRef()

  const getStatusChip = status => {
    const chipStyles = {
      'Closed one': {
        label: 'Closed one',
        color: 'success',
        sx: {
          fontSize: '10px',
          fontWeight: 600,
          height: 20,
          lineHeight: '16px',
          padding: '0 6px',
          borderRadius: '8px'
        }
      },
      'Closed Lost': {
        label: 'Closed Lost',
        color: 'error',
        sx: {
          fontSize: '10px',
          fontWeight: 600,
          height: 20,
          lineHeight: '16px',
          padding: '0 6px',
          borderRadius: '8px'
        }
      },
      Open: {
        label: 'Open',
        color: 'info',
        sx: {
          fontSize: '10px',
          fontWeight: 600,
          height: 20,
          lineHeight: '16px',
          padding: '0 6px',
          borderRadius: '8px'
        }
      }
    }

    const config = chipStyles[status] || {}
    return <Chip size='small' label={config.label} color={config.color} sx={config.sx} />
  }

  const columns = [
    {
      field: 'referenceId',
      headerName: 'Reference ID',
      flex: 1.3,
      renderCell: params => (
        <Box display='flex' gap={1}>
          <input type='checkbox' />
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography fontWeight={600}>{params.value}</Typography>
            {getStatusChip(params.row.status)}
          </Box>
        </Box>
      )
    },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'address', headerName: 'Property Address', flex: 2 },
    { field: 'source', headerName: 'Source', flex: 1 },
    { field: 'created', headerName: 'Created', flex: 1 },
    { field: 'updated', headerName: 'Updated', flex: 1 },
    {
      field: 'assignee',
      headerName: 'Assignee',
      flex: 1,
      renderCell: params => (
        <Box display='flex' alignItems='center' height='100%'>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: '#F7F7F7',
              color: '#5C5C5C',
              fontSize: 14,
              fontWeight: 600,
              border: '1px solid #A0A0A0'
            }}
          >
            {params.value}
          </Avatar>
        </Box>
      )
    },
    {
      field: 'action',
      headerName: '',
      sortable: false,
      flex: 0.3,

      renderCell: () => (
        <IconButton>
          <OpenInNewIcon fontSize='small' color='success' />
        </IconButton>
      )
    }
  ]

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

  return (
    <Box
      sx={{
        width: '100%',
        overflowX: 'auto'
      }}
    >
      <Box sx={{ minWidth: '800px' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          autoHeight
          disableColumnMenu
          hideFooterSelectedRowCount
          sx={{
            backgroundColor: '#FFFFFF',
            border: 'none',

            // Column header area
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#FFFFFF',
              color: '#011408 !important',
              fontWeight: '400'
            },

            // Individual header cells
            '& .MuiDataGrid-columnHeader': {
              backgroundColor: '#FFFFFF'
            },

            // Optional: also override separators if needed
            '& .MuiDataGrid-columnSeparator': {
              display: 'none'
            },

            // Table body cells
            '& .MuiDataGrid-cell': {
              backgroundColor: '#FFFFFF',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            },

            // Virtual scroller background (rows area)
            '& .MuiDataGrid-virtualScroller': {
              backgroundColor: '#FFFFFF'
            },

            // Footer (pagination) area
            '& .MuiDataGrid-footerContainer': {
              backgroundColor: '#FFFFFF'
            }
          }}
          pageSizeOptions={[10, 20, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10, page: 0 } }
          }}
        />
      </Box>
    </Box>
  )
}
function page() {
  const router = useRouter()
  const [value, setValue] = useState(0)
  const dispatch = useDispatch()
  const leads = useSelector(state => state.leads.list)

  const handleChangeTab = (event, newValue) => {
    setValue(newValue)
  }

  const tabs = ['All', 'Leads', 'Closed Won', 'Closed Lost', 'On Hold']

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

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          width: '100%',
          height: '3.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box>
          <Typography variant='h4' component='h4' fontWeight={700}>
            Leads
          </Typography>
        </Box>
        <Box>{<IconButtonsGroup />}</Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: '#ccc', mb: 3 }}>
        <Tabs
          value={value}
          onChange={handleChangeTab}
          textColor='inherit'
          TabIndicatorProps={{ style: { backgroundColor: '#2E7D32', height: 3 } }}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              color: '#A0A0A0'
            },
            '& .Mui-selected': {
              color: '#2E7D32',
              fontWeight: 600
            }
          }}
        >
          {tabs.map((label, index) => (
            <Tab key={index} label={label} />
          ))}
        </Tabs>
      </Box>
      <Grid2 container spacing={2} p={3} mb={1} bgcolor={'#FFFFFF'}>
        <Grid2 size={{ xs: 12, sm: 6, md: 1.5 }}>
          <TextField
            label='Reference ID'
            size='small'
            sx={{
              '& .MuiInputLabel-root': {
                color: '#CED1D7'
              }
            }}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 1.5 }}>
          <TextField
            label='Name'
            size='small'
            sx={{
              '& .MuiInputLabel-root': {
                color: '#CED1D7'
              }
            }}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
          {' '}
          <TextField
            label='Property Address'
            size='small'
            sx={{
              '& .MuiInputLabel-root': {
                color: '#CED1D7'
              }
            }}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
          {' '}
          <Autocomplete
            disablePortal
            options={['Internal', 'External']}
            // sx={{ width: 150 }}
            renderInput={params => (
              <TextField
                {...params}
                label='Source'
                sx={{
                  '& .MuiInputBase-root': {
                    height: '3em',
                    fontSize: '13px'
                  },
                  '& .MuiInputLabel-root': {
                    color: '#CED1D7',
                    top: '-5px'
                  }
                }}
              />
            )}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 1 }}>
          {' '}
          <Autocomplete
            disablePortal
            options={['100', '200']}
            // sx={{ width: 50 }}
            renderInput={params => (
              <TextField
                {...params}
                label='Rate'
                sx={{
                  '& .MuiInputBase-root': {
                    height: '3em',
                    fontSize: '13px'
                  },
                  '& .MuiInputLabel-root': {
                    color: '#CED1D7',
                    top: '-5px'
                  }
                }}
              />
            )}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 1 }}>
          {' '}
          <TextField
            label='Created'
            size='small'
            sx={{
              '& .MuiInputLabel-root': {
                color: '#CED1D7'
              }
            }}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 1 }}>
          {' '}
          <TextField
            label='Updated'
            size='small'
            sx={{
              '& .MuiInputLabel-root': {
                color: '#CED1D7'
              }
            }}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
          {' '}
          <Autocomplete
            disablePortal
            options={['Steve Smith', 'Joe Root']}
            // sx={{ width: "auto" }}
            renderInput={params => (
              <TextField
                {...params}
                label='Assinee'
                sx={{
                  '& .MuiInputBase-root': {
                    height: '3em',
                    fontSize: '13px'
                  },
                  '& .MuiInputLabel-root': {
                    color: '#CED1D7',
                    top: '-5px'
                  }
                }}
              />
            )}
          />
        </Grid2>
      </Grid2>
      <Box>
        <LeadTable />
      </Box>
    </Box>
  )
}

export default page
