import Link from 'next/link'
import React, { useState } from 'react'
import {
  Box,
  Button,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  Grid,
  Card,
  LinearProgress,
  TableContainer
} from '@mui/material'
import { Close } from '@mui/icons-material'
import Icon from 'src/@core/components/icon'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import PageHeader from 'src/@core/components/page-header'
import { formatPhoneNumberIntl } from 'react-phone-number-input'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import { useDispatch, useSelector } from 'react-redux'
import { useTheme } from '@mui/material/styles'
import { setSelectedUserObject } from 'src/store/apps/user'
import { rowStatusChip, toTitleCase } from 'src/common-functions/utils/UtilityFunctions'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'

export default function ViewUser({ userObject, loading }) {
  const theme = useTheme()
  const dispatch = useDispatch()
  const [selectedAccount, setSelectedAccount] = useState(null)
  const user = useSelector(state => state.user.selectedUser)
  const tenantsList = useSelector(state => state.tenants?.data)

  const userProfile = useSelector(state => state.userProfile)
  const { isRootUser } = userProfile
  const { userAccounts = [], userRoles = [] } = userObject || {}

  return (
    <div>
      <React.Fragment>
        <PageHeader
          title={
            <Typography
              sx={{
                fontSize: { xs: '16px', md: '18px' },
                fontWeight: '500'
              }}
            >
              View User - {user?.name}
            </Typography>
          }
          button={
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {isRootUser && (
                <Button
                  variant='contained'
                  color='primary'
                  sx={{ display: { xs: 'none', sm: 'flex' } }}
                  startIcon={<AddOutlinedIcon />}
                  component={Link}
                  scroll={true}
                  href={`/account-settings/user/add-user`}
                >
                  Add New
                </Button>
              )}
              {isRootUser && (
                <IconButton
                  component={Link}
                  scroll={true}
                  href={`/account-settings/user/edit/${user?.username}`}
                  // onClick={() => dispatch(setSelectedUserObject(user))}
                >
                  <Icon icon='tabler:edit' />
                </IconButton>
              )}
              <IconButton component={Link} scroll={true} href='/account-settings/user/'>
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
                <Grid item xs={12}>
                  <Grid item xs={12} sm={6} md={6} lg={4} xl={4}>
                    <CustomAutocomplete
                      options={userAccounts || []}
                      getOptionLabel={option => option?.username || ''}
                      value={selectedAccount || null}
                      onChange={(e, newValue) => {
                        setSelectedAccount(newValue)
                        dispatch(setSelectedUserObject(newValue))
                      }}
                      disableClearable
                      renderInput={params => <CustomTextField {...params} fullWidth label='Users' />}
                      isOptionEqualToValue={(option, value) => option.userId === value.userId}
                      renderOption={(props, option, { selected }) => (
                        <li
                          {...props}
                          style={{
                            backgroundColor: selected ? theme.palette.action.selected : 'transparent',
                            padding: '8px 16px',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease'
                          }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = theme.palette.action.hover)}
                          onMouseLeave={e =>
                            (e.currentTarget.style.backgroundColor = selected
                              ? theme.palette.action.selected
                              : 'transparent')
                          }
                        >
                          {option.username}
                        </li>
                      )}
                    />
                  </Grid>
                </Grid>
                <Grid item xs={12} md={8} lg={8} xl={8}>
                  <Card sx={{ p: 6 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={12}>
                        <Table
                          sx={{
                            width: '100%',
                            border: 0,
                            '& .MuiTableCell-root': {
                              border: 0,
                              padding: '0px !important',
                              verticalAlign: 'top',
                              width: '50%'
                            },
                            '& .MuiTableCell-root .data-name': {
                              fontSize: '13px',
                              color: '#818181',
                              lineHeight: '28px'
                            },
                            '& .MuiTableCell-root .data-value': {
                              fontSize: '13px',
                              fontWeight: 500,
                              color: '#000',
                              lineHeight: '28px'
                            }
                          }}
                        >
                          <TableBody>
                            <TableRow>
                              <TableCell>
                                <Typography
                                  sx={{
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    lineHeight: '26px',
                                    color: '#4567c6 !important',
                                    textAlign: 'left'
                                  }}
                                >
                                  {user?.name}{' '}
                                </Typography>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>
                                <Typography className='data-name'>User Name: {user?.username}</Typography>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>
                                <Typography className='data-name' sx={{ display: 'flex', gap: 1 }}>
                                  mail:{' '}
                                  <a
                                    href={`mailto:${user?.email}`}
                                    style={{ color: 'inherit', textDecoration: 'none', wordBreak: 'break-all' }}
                                  >
                                    {' '}
                                    {user?.email}
                                  </a>{' '}
                                </Typography>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>
                                <Typography className='data-name'>
                                  mobile: {formatPhoneNumberIntl(`+${user?.phoneNumber}`)}{' '}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </Grid>

                      <Grid item xs={12} sm={12}>
                        <Typography sx={{ fontSize: '14px', fontWeight: 500, lineHeight: '22px', mb: 2 }}>
                          Permissions
                        </Typography>
                        <TableContainer>
                          <Table
                            size='small'
                            sx={{
                              '& .MuiTableHead-root': {
                                textTransform: 'capitalize'
                              },
                              '& .MuiTableCell-root': {
                                borderBottom: '1px dashed #D8D8D8'
                              }
                            }}
                          >
                            <TableHead sx={{ bgcolor: 'rgba(248, 250, 254, 1)' }}>
                              <TableRow>
                                <TableCell>Company</TableCell>
                                <TableCell>Admin</TableCell>
                                <TableCell>Roles</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {user?.permissions?.map((item, index) => {
                                const tenant = tenantsList?.find(val => val?.tenantId === item?.tenantId)

                                const roles = item?.roles?.map((val, i) => {
                                  const role = userRoles?.find(x => x.userRoleId === val)
                                  return rowStatusChip(toTitleCase(role?.role))
                                })

                                return (
                                  <TableRow key={index}>
                                    <TableCell align='left'>{tenant?.displayName}</TableCell>
                                    <TableCell align='left'>{item?.isAdmin ? 'Yes' : 'No'}</TableCell>
                                    <TableCell align='left'>
                                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'flex-start' }}>
                                        {roles}
                                      </Box>
                                    </TableCell>
                                  </TableRow>
                                )
                              })}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
              </Grid>
            </div>
          )}
        </PageWrapper>
      </React.Fragment>
    </div>
  )
}
