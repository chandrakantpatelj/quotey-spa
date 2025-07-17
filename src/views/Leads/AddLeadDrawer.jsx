'use client'

import React from 'react'

// ✅ MUI components
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  TextField,
  MenuItem,
  Button,
  Divider,
  Checkbox,
  FormControlLabel
} from '@mui/material'

import CloseIcon from '@mui/icons-material/Close'

const leadSources = ['Internal', 'External', 'Referral']

export default function AddLeadDrawer({ open, onClose }) {
  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 500,
          padding: 4
        }
      }}
    >
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={3}>
        <Typography variant='h4' fontWeight='bold'>
          New Lead
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 4 }} />

      <Box display='flex' flexDirection='column' gap={5}>
        <TextField label='Name' variant='outlined' fullWidth size='small' />
        <TextField label='Email' variant='outlined' fullWidth size='small' />
        <TextField label='Phone' variant='outlined' fullWidth size='small' />

        <TextField label='Lead Source' select variant='outlined' fullWidth size='small' defaultValue='Internal'>
          {leadSources.map(source => (
            <MenuItem key={source} value={source}>
              {source}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label='Notes'
          variant='outlined'
          fullWidth
          multiline
          rows={3}
          helperText='1000 characters remaining'
        />

        <FormControlLabel control={<Checkbox />} label='Send Welcome Letter to Customer' />
      </Box>

      <Box display='flex' justifyContent='flex-end' alignItems='center' gap={2} mt={3}>
        <Button variant='outlined' onClick={onClose} sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          variant='contained'
          sx={{
            textTransform: 'none',
            backgroundColor: '#6C63FF',
            '&:hover': { backgroundColor: '#5a52d4' }
          }}
        >
          Save
        </Button>
      </Box>
    </Drawer>
  )
}
