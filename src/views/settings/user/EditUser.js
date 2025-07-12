import Link from 'next/link'
import Router from 'next/router'
import React, { useState } from 'react'
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  FormHelperText,
  Grid,
  IconButton,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import PageHeader from 'src/@core/components/page-header'
import { Close } from '@mui/icons-material'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import CustomTextField from 'src/@core/components/mui/text-field'
import { Controller, useForm } from 'react-hook-form'
import EditPhoneInput from 'src/common-components/EditPhoneInput'
import { useDispatch, useSelector } from 'react-redux'
import { createAlert } from 'src/store/apps/alerts'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { UpdateUserAccountMutation } from 'src/@core/components/graphql/user-account-queries'
import useUserAccountRoles from 'src/hooks/getData/useUserAccountRoles'
import { rowStatusChip, toTitleCase } from 'src/common-functions/utils/UtilityFunctions'
import Icon from 'src/@core/components/icon'
import AddPermissionPopup from 'src/views/settings/user/AddPermissionPopup'
import EditPermissionPopup from 'src/views/settings/user/EditPermissionPopup'
import DeletePermission from './DeletePermission'
import { setUpdateUserAccount } from 'src/store/apps/user'

function EditUser({ userObject, loading }) {
  const router = Router
  const dispatch = useDispatch()
  const selectedUser = useSelector(state => state.user.selectedUser)
  const tenantsList = useSelector(state => state.tenants?.data)

  const { userRoles } = userObject
  const [isAddNewModalOpen, setIsAddNewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const [selectedPermission, setSelectedPermission] = useState(false)

  const [loader, setLoader] = React.useState(false)

  const {
    reset,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: selectedUser,
    mode: 'onChange'
  })

  const check = () => {
    // firstFieldRef?.current.focus()
    const fieldName = Object.keys(errors)[0]
    const errName = document.getElementById(fieldName)
    errName?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
  }
  const saveEditedUser = async user => {
    setLoader(true)

    const {
      username,
      permissions,
      createdDateTime,
      createdBy,
      updatedDateTime,
      updatedBy,
      lastLoginDateTime,
      ...userAccount
    } = user
    try {
      const response = await writeData(UpdateUserAccountMutation(), { username, userAccount })

      if (response.updateUserAccount) {
        dispatch(setUpdateUserAccount(response.updateUserAccount))
        dispatch(createAlert({ message: 'User update successfully !', type: 'success' }))
        router.push('/account-settings/user/')
      } else {
        setLoader(false)
        dispatch(createAlert({ message: 'User updatetion failed  !', type: 'error' }))
      }
    } catch (e) {
      setLoader(false)
      console.error(e)
    }
  }
  const handleCancel = () => {
    router.push('/account-settings/user/')
    reset()
  }

  return (
    <>
      <PageHeader
        title={
          <Typography
            sx={{
              fontSize: { xs: '16px', md: '18px' },
              fontWeight: '500'
            }}
          >
            Edit User Account- {selectedUser?.username}
          </Typography>
        }
        button={
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
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
            <IconButton
              variant='outlined'
              color='default'
              sx={{ fontSize: '21px' }}
              component={Link}
              scroll={true}
              href={`/account-settings/user/`}
            >
              <Close sx={{ color: theme => theme.palette.primary.main }} />
            </IconButton>
          </Box>
          // )
        }
      />

      <PageWrapper>
        {loading ? (
          <LinearProgress />
        ) : (
          <>
            <Grid container spacing={{ xs: 6 }}>
              <Grid item xs={12} md={4}>
                <form onSubmit={handleSubmit(saveEditedUser)}>
                  <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                    <Grid item xs={12}>
                      <Controller
                        name='name'
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <CustomTextField
                            id='name'
                            {...field}
                            fullWidth
                            label='Name'
                            error={Boolean(errors.name)}
                            {...(errors.name && { helperText: 'Name is required' })}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Controller
                        name='phoneNumber'
                        control={control}
                        rules={{ required: true }}
                        render={({ field: { value, onChange } }) => (
                          <EditPhoneInput
                            name='phoneNumber'
                            label='Phone Number'
                            value={value}
                            onChange={onChange}
                            error={Boolean(errors.mobile)}
                          />
                        )}
                      />
                      {errors?.phoneNumber && <FormHelperText error>Mobile Number is required</FormHelperText>}
                    </Grid>
                    <Grid item xs={12}>
                      <Controller
                        name='email'
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <CustomTextField
                            id='email'
                            type='email'
                            {...field}
                            fullWidth
                            label='Email'
                            error={Boolean(errors.email)}
                            {...(errors.email && { helperText: 'Email is required' })}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          justifyContent: { xs: 'center', sm: 'start' },
                          gap: '20px',
                          marginTop: { xs: '20px', sm: '50px' }
                        }}
                      >
                        <Button variant='contained' type='submit' onClick={check}>
                          Save
                        </Button>
                        <Button type='reset' variant='outlined' onClick={handleCancel}>
                          Cancel
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </form>
              </Grid>
              <Grid item xs={12} md={8}>
                <Box
                  sx={{ display: 'flex', gap: 1, justifyContent: 'space-between', alignItems: 'center', mb: '10px' }}
                >
                  <Typography sx={{ fontSize: '15px', fontWeight: 500, lineHeight: '40px' }}>Permissions</Typography>
                  {/* <IconButton
                variant='outlined'
                color='success'
                sx={{ fontSize: '20px' }}
                onClick={() => setIsAddNewModalOpen(true)}
              >
                <Icon icon='material-symbols:add-box-outline' />
              </IconButton> */}
                  <Button
                    size='small'
                    variant='outlined'
                    color='primary'
                    startIcon={<AddOutlinedIcon />}
                    onClick={() => setIsAddNewModalOpen(true)}
                  >
                    Add Permission
                  </Button>
                </Box>
                {isAddNewModalOpen && (
                  <AddPermissionPopup
                    open={isAddNewModalOpen}
                    setOpen={setIsAddNewModalOpen}
                    selectedUser={selectedUser}
                    userRoles={userRoles}
                  />
                )}

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
                      <TableCell sx={{ textAlign: 'right' }}>Acion</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedUser?.permissions?.map(item => {
                      const tenant = tenantsList?.find(val => val?.tenantId === item?.tenantId)

                      const roles = item?.roles?.map((val, i) => {
                        const role = userRoles?.find(x => x.userRoleId === val)
                        return rowStatusChip(toTitleCase(role?.role))
                      })

                      return (
                        <TableRow key={item?.permissionId}>
                          <TableCell align='left'>{tenant?.displayName}</TableCell>
                          <TableCell align='left'>{item?.isAdmin ? 'Yes' : 'No'}</TableCell>
                          <TableCell align='left'>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'flex-start' }}>
                              {roles}
                            </Box>
                          </TableCell>
                          <TableCell align='right'>
                            <Box
                              sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                justifyContent: 'end',
                                gap: 0.5,
                                alignItems: 'flex-start'
                              }}
                            >
                              <IconButton
                                size='small'
                                variant='outlined'
                                onClick={() => {
                                  setIsEditModalOpen(true)
                                  setSelectedPermission(item)
                                }}
                              >
                                <Icon icon='tabler:edit' color='inherit' />
                              </IconButton>
                              <IconButton
                                size='small'
                                variant='outlined'
                                color='error'
                                onClick={() => {
                                  setIsDeleteModalOpen(true)
                                  setSelectedPermission(item)
                                }}
                              >
                                <Icon icon='mingcute:delete-2-line' color='inherit' />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </Grid>
            </Grid>
            {isEditModalOpen && (
              <EditPermissionPopup
                open={isEditModalOpen}
                setOpen={setIsEditModalOpen}
                selectedPermission={selectedPermission}
                selectedUser={selectedUser}
                userRoles={userRoles}
              />
            )}
            {isDeleteModalOpen && (
              <DeletePermission
                open={isDeleteModalOpen}
                setOpen={setIsDeleteModalOpen}
                permissionId={selectedPermission?.permissionId}
                username={selectedUser?.username}
              />
            )}
          </>
        )}

        {loader && (
          <Backdrop sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }} open={loader}>
            <CircularProgress color='inherit' />
          </Backdrop>
        )}
      </PageWrapper>
    </>
  )
}

export default EditUser
