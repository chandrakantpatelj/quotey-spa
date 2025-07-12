// ** Next Import
import Link from 'next/link'
import Router from 'next/router'
import React, { useEffect } from 'react'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import { Box, Button, IconButton, Typography, Grid, LinearProgress } from '@mui/material'
import { useSelector } from 'react-redux'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { Close } from '@mui/icons-material'
import AccountEntryViewSection from './AccountEntryViewSection'
import { hasPermission } from 'src/common-functions/utils/UtilityFunctions'
import { CREATE_ACCOUNT_ENTRY } from 'src/common-functions/utils/Constants'

export default function ViewAccountEntry({ accountsData, loading }) {
  const route = Router
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId)
  const userProfile = useSelector(state => state.userProfile)
  const createPermission = hasPermission(userProfile, CREATE_ACCOUNT_ENTRY)

  const selectedAccountEntry = useSelector(state => state?.accountTransactions?.selectedAccountTransaction) || {}
  useEffect(() => {
    if (Object.keys(selectedAccountEntry).length === 0) {
      route.push('/accounting/transactions/')
    }
  }, [selectedAccountEntry, tenantId])

  return (
    <React.Fragment>
      <PageHeader
        title={
          <Typography
            sx={{
              fontSize: { xs: '16px', md: '18px' },
              fontWeight: '500'
            }}
          >
            View Account Transaction - {selectedAccountEntry?.transactionNo}
          </Typography>
        }
        button={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {createPermission && (
              <Button
                variant='contained'
                color='primary'
                sx={{ display: { xs: 'none', sm: 'flex' } }}
                startIcon={<AddOutlinedIcon />}
                component={Link}
                scroll={true}
                href={`/accounting/transactions/new`}
              >
                Add New
              </Button>
            )}

            <IconButton
              variant='outlined'
              color='default'
              component={Link}
              scroll={true}
              href='/accounting/transactions/'
            >
              <Close sx={{ color: theme => theme.palette.primary.main }} />
            </IconButton>
          </Box>
        }
      />
      <PageWrapper>
        {loading ? (
          <LinearProgress />
        ) : (
          <Grid container spacing={{ xs: 5, xl: 10 }}>
            <Grid item xs={12} md={12} lg={12} xl={8}>
              <AccountEntryViewSection
                transactionNo={selectedAccountEntry?.transactionNo}
                accountsData={accountsData}
              />
            </Grid>
          </Grid>
        )}
      </PageWrapper>
    </React.Fragment>
  )
}
