import { useDispatch, useSelector } from 'react-redux'

import {
  Dialog,
  DialogTitle,
  Alert,
  DialogContent,
  Grid,
  Box,
  Button,
  Typography,
  Checkbox,
  Popper
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import CustomCloseButton from '../../../common-components/CustomCloseButton'
import CustomTextField from 'src/@core/components/mui/text-field'
import { Controller, useForm } from 'react-hook-form'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { createAlert } from 'src/store/apps/alerts'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import { UpdatePermissionMutation } from 'src/@core/components/graphql/user-account-queries'
import { toTitleCase } from 'src/common-functions/utils/UtilityFunctions'
import { setLoading, setSelectedUserObject, setUpdateUserAccount } from 'src/store/apps/user'
import { styled } from '@mui/system'

export default function EditPermissionPopup({ open, setOpen, selectedPermission, selectedUser, userRoles }) {
  const dispatch = useDispatch()

  const tenantsList = useSelector(state => state.tenants?.data)

  const roles = userRoles?.filter(item => selectedPermission?.roles?.includes(item?.userRoleId))
  const StyledPopper = styled(Popper)({
    maxHeight: '160px', // Fixed height
    overflowY: 'auto' // Enable scrolling
  })
  const permissionFields = {
    ...selectedPermission,
    tenantId: selectedPermission?.tenantId,
    roles: roles
  }

  const {
    control,
    reset,
    handleSubmit: handlePermissionSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: permissionFields,
    mode: 'onChange'
  })

  const check = () => {
    const fieldName = Object.keys(errors)[0]
    const errName = document.getElementById(fieldName)
    errName?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
  }
  const savePermissions = async data => {
    const permissionId = data?.permissionId
    const roleIds = data?.roles?.map(item => {
      return item?.userRoleId
    })

    const permission = { ...data, roles: roleIds }
    delete permission?.permissionId
    const username = selectedUser?.username

    try {
      dispatch(setLoading(true))
      const response = await writeData(UpdatePermissionMutation(), { username, permissionId, permission })
      if (response.updatePermission) {
        dispatch(setUpdateUserAccount(response.updatePermission))
        dispatch(setSelectedUserObject(response.updatePermission))
        dispatch(createAlert({ message: 'Permission updated successfully !', type: 'success' }))
        setOpen(false)
      } else {
        dispatch(createAlert({ message: 'Failed to update permission!', type: 'error' }))
        setOpen(false)
      }
    } catch (e) {
      console.error(e)
    } finally {
      dispatch(setLoading(false))
    }
  }

  const handleCancel = () => {
    setOpen(false)
    reset()
  }
  const handleClose = () => {
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      disableEscapeKeyDown
      maxWidth='xs'
      fullWidth={true}
      scroll='paper'
      aria-labelledby='alert-dialog-title'
      aria-describedby='alert-dialog-description'
      onClose={(event, reason) => {
        if (reason !== 'backdropClick') {
          handleClose()
        }
      }}
      sx={{
        '& .MuiDialog-paper': {
          overflow: 'visible',
          pt: '10px !important',
          verticalAlign: 'top'
        }
      }}
    >
      <DialogTitle id='alert-dialog-title'>
        <Alert severity='info' icon={false} sx={{ color: 'rgba(0,0,0,0.8)' }}>
          Edit User Permission
        </Alert>{' '}
      </DialogTitle>
      <DialogContent sx={{ py: 8 }}>
        <CustomCloseButton onClick={handleClose}>
          <Icon icon='tabler:x' fontSize='1.25rem' />
        </CustomCloseButton>

        <form onSubmit={handlePermissionSubmit(savePermissions)}>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12}>
              <Controller
                name='tenantId'
                control={control}
                rules={{
                  required: 'Company is required'
                }}
                render={({ field }) => (
                  <CustomAutocomplete
                    {...field}
                    options={tenantsList || []}
                    getOptionLabel={option => option?.displayName || ''}
                    value={tenantsList?.find(option => option.tenantId === field.value) || null}
                    onChange={(e, newValue) => {
                      field.onChange(newValue.tenantId)
                    }}
                    disableClearable
                    renderInput={params => (
                      <CustomTextField
                        {...params}
                        fullWidth
                        label='Company'
                        error={Boolean(errors.tenantId)}
                        helperText={errors.tenantId?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='roles'
                control={control}
                rules={{ required: false }}
                render={({ field }) => (
                  <CustomAutocomplete
                    multiple
                    selectOnFocus
                    clearOnBlur
                    handleHomeEndKeys
                    filterSelectedOptions // Ensures selected options are excluded automatically
                    options={userRoles}
                    forcePopupIcon={true}
                    value={field.value}
                    onChange={(e, newValue) => {
                      field.onChange(newValue)
                    }}
                    filterOptions={(options, { inputValue }) => {
                      const unselectedOptions = options.filter(
                        option => !field.value?.some(selected => selected?.role === option?.role)
                      )
                      if (!inputValue) {
                        return unselectedOptions
                      }
                      return unselectedOptions.filter(option =>
                        option.role?.toLowerCase().includes(inputValue.toLowerCase())
                      )
                    }}
                    PopperComponent={props => <StyledPopper {...props} />}
                    PopperProps={{
                      disablePortal: true // Keeps Popper within the container
                    }}
                    getOptionLabel={option => toTitleCase(option?.role) || ''}
                    renderOption={(props, option) => <li {...props}>{toTitleCase(option?.role)}</li>}
                    renderInput={params => <CustomTextField {...params} label='Roles' fullWidth />}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', alignItems: 'center' }}>
                <Controller
                  name='isAdmin'
                  control={control}
                  render={({ field }) => (
                    <Checkbox sx={{ p: '4px' }} defaultChecked={selectedPermission?.isAdmin} {...field} />
                  )}
                />
                <Typography sx={{ fontSize: '12px' }}>Is Admin</Typography>
              </Box>
            </Grid>
          </Grid>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: { xs: '10px', md: '20px' },
              marginTop: { xs: '20px', sm: '30px' }
            }}
          >
            <Button variant='contained' type='submit' onClick={check}>
              Save
            </Button>
            <Button type='reset' variant='outlined' onClick={handleCancel}>
              Cancel
            </Button>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  )
}
