// ** Next Import
import Link from 'next/link'
import Router from 'next/router'
import React, { useEffect } from 'react'
import PageHeader from 'src/@core/components/page-header'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import { Box, Button, IconButton, Typography, Grid, LinearProgress, MenuItem } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { Close } from '@mui/icons-material'
import { hasPermission } from 'src/common-functions/utils/UtilityFunctions'
import { CREATE_STATEMENT, MANAGE_STATEMENT } from 'src/common-functions/utils/Constants'
import TaxStatementViewSection from './TaxStatementViewSection'
import { undoPaymentClearingForTaxStatementMutation } from 'src/@core/components/graphql/tax-payments-queries'
import { createAlert } from 'src/store/apps/alerts'
import CommonStyledMenu from 'src/common-components/CommonStyledMenu'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import Icon from 'src/@core/components/icon'
import { writeData } from 'src/common-functions/GraphqlOperations'
import {
  markedStatementAsConfirmedQuery,
  undoConfirmedTaxStatementQuery
} from 'src/@core/components/graphql/tax-statement-queries'

export default function ViewTaxStatement({ taxStatementData, loading }) {
  const route = Router
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId)
  const dispatch = useDispatch()
  const userProfile = useSelector(state => state.userProfile)

  const selectedTaxStatement = useSelector(state => state?.taxStatements?.selectedTaxStatement) || {}
  const managePermission = hasPermission(userProfile, MANAGE_STATEMENT)

  useEffect(() => {
    if (Object.keys(selectedTaxStatement).length === 0) {
      route.push('/accounting/tax-statements/')
    }
  }, [selectedTaxStatement, tenantId])
  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl)
  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const MarkStatus = async data => {
    setAnchorEl(null)
    const { tenantId, statementId } = data
    try {
      const response = await writeData(markedStatementAsConfirmedQuery(), { tenantId, statementId })
      if (response.markedStatementAsConfirmed) {
        dispatch(setUpdatetaxStatement(response.markedStatementAsConfirmed))
        dispatch(createAlert({ message: 'Status changed successfully!', type: 'success' }))
      } else {
        dispatch(createAlert({ message: response?.errors?.[0]?.message, type: 'error' }))
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const UndoStatus = async data => {
    setAnchorEl(null)
    const { tenantId, statementId } = data
    try {
      const response = await writeData(undoConfirmedTaxStatementQuery(), { tenantId, statementId })
      if (response.undoConfirmedTaxStatement) {
        dispatch(setUpdatetaxStatement(response.undoConfirmedTaxStatement))
        dispatch(createAlert({ message: 'Status changed successfully!', type: 'success' }))
      } else {
        dispatch(createAlert({ message: response?.errors?.[0]?.message, type: 'error' }))
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const handleUndoClearedTaxStatement = async () => {
    setAnchorEl(null)
    try {
      const response = await writeData(undoPaymentClearingForTaxStatementMutation(), {
        tenantId,
        taxStatementId: selectedTaxStatement.statementId
      })
      const { undoPaymentClearingForTaxStatement } = response
      if (undoPaymentClearingForTaxStatement) {
        // dispatch(resettaxStatement())
        dispatch(createAlert({ message: 'Undo Payment Clearing successfully!', type: 'success' }))
      } else {
        dispatch(createAlert({ message: response?.errors?.[0]?.message, type: 'error' }))
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }
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
            View Tax Statement - {selectedTaxStatement?.statementNo}
          </Typography>
        }
        button={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {hasPermission(userProfile, CREATE_STATEMENT) && (
              <Button
                variant='contained'
                color='primary'
                sx={{ display: { xs: 'none', sm: 'flex' } }}
                startIcon={<AddOutlinedIcon />}
                component={Link}
                scroll={true}
                href={`/accounting/tax-statements/add`}
              >
                Add New
              </Button>
            )}
            {selectedTaxStatement?.status === 'CONFIRMED' && (
              <div>
                <IconButton
                  aria-label='more'
                  id='long-button'
                  aria-controls={open ? 'long-menu' : undefined}
                  aria-expanded={open ? 'true' : undefined}
                  aria-haspopup='true'
                  onClick={handleClick}
                >
                  <Icon icon='iconamoon:menu-kebab-horizontal-circle' width={23} height={23} />
                </IconButton>

                <CommonStyledMenu anchorEl={anchorEl} open={open} onClose={handleClose}>
                  {managePermission && selectedTaxStatement?.status === 'DRAFT' && (
                    <MenuItem
                      onClick={() => {
                        MarkStatus(selectedTaxStatement)
                      }}
                    >
                      <Icon icon={'teenyicons:file-tick-outline'} />
                      Mark As Confirmed
                    </MenuItem>
                  )}
                  {managePermission && selectedTaxStatement?.status === 'CONFIRMED' && (
                    <MenuItem
                      onClick={() => {
                        UndoStatus(selectedTaxStatement)
                      }}
                    >
                      <Icon icon={'iconamoon:do-undo-light'} />
                      Undo Confirmation
                    </MenuItem>
                  )}
                  <MenuItem
                    variant='outlined'
                    onClick={() => {
                      setAnchorEl(null)
                      handleUndoClearedTaxStatement()
                    }}
                  >
                    <Icon icon={'iconamoon:do-undo-light'} />
                    Undo Cleared Payment
                  </MenuItem>
                </CommonStyledMenu>
              </div>
            )}

            <IconButton
              variant='outlined'
              color='default'
              sx={{ fontSize: '21px' }}
              component={Link}
              scroll={true}
              href='/accounting/tax-statements/'
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
          <div>
            <Grid container spacing={{ xs: 5, xl: 10 }}>
              <Grid item xs={12} md={12} lg={12} xl={10}>
                <TaxStatementViewSection
                  taxStatementId={selectedTaxStatement?.statementId}
                  taxStatementData={taxStatementData}
                />
              </Grid>
            </Grid>
          </div>
        )}
      </PageWrapper>
    </React.Fragment>
  )
}
