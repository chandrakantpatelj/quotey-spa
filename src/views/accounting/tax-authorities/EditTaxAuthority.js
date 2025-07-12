// ** Next Import
import Link from 'next/link'
import Router from 'next/router'
import React, { useState, useEffect } from 'react'
import { Box, IconButton, Typography, Grid, Button, Snackbar, Alert, Backdrop, CircularProgress } from '@mui/material'
import CustomTextField from 'src/@core/components/mui/text-field'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { useDispatch, useSelector } from 'react-redux'
import EditPhoneInput from 'src/common-components/EditPhoneInput'
import PageHeader from 'src/@core/components/page-header'
import { Close } from '@mui/icons-material'
import { writeData } from 'src/common-functions/GraphqlOperations'
import PageWrapper from 'src/@core/layouts/PageWrapper'
import { useForm, Controller } from 'react-hook-form'
import { createAlert } from 'src/store/apps/alerts'
import CustomFilesUpload from 'src/views/forms/form-elements/custom-inputs/CustomFilesUpload'
import { UploadMultipleFileS3Api } from 'src/views/forms/form-elements/custom-inputs/UploadMultipleFileS3Api'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import DeleteUploadFile from 'src/views/forms/form-elements/custom-inputs/DeleteUploadFile'
import { fetchPdfFile, parseDate } from 'src/common-functions/utils/UtilityFunctions'
import { TAX_AUTHORITY_PDF } from 'src/common-functions/utils/Constants'
import CustomDatePicker from 'src/views/forms/form-elements/pickers/CustomDatePicker'
import { EditTaxAuthorityMutation } from 'src/@core/components/graphql/tax-authorities-queries'
import { updateTaxAuthority } from 'src/store/apps/tax-authority'
import useCountries from 'src/hooks/getData/useCountries'

export default function EditTaxAuthority() {
  const router = Router
  const dispatch = useDispatch()
  const tenant = useSelector(state => state.tenants?.selectedTenant)

  const { tenantId } = tenant || {}
  const selectedTaxAuthority = useSelector(state => state?.taxAuthority?.selectedTaxAuthority)
  const { countries } = useCountries()
  const [selectedPdFile, setSelectedPdFile] = useState([])
  const [deletedPdFiles, setDeletedPdFiles] = useState([])
  const [loader, setLoader] = React.useState(false)

  const [taxAuthorityAddressCountry, settaxAuthorityAddressCountry] = useState(
    countries?.find(obj => obj.name === selectedTaxAuthority?.taxAuthorityAddress?.country)
  )

  const defaultData = { ...selectedTaxAuthority }

  const {
    reset,
    control,
    setValue,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: defaultData,
    mode: 'onChange'
  })
  useEffect(() => {
    if (Object.keys(selectedTaxAuthority).length === 0) {
      router.push('/accounting/tax-authorities/')
    }
  }, [selectedTaxAuthority, tenantId])

  useEffect(() => {
    if (selectedTaxAuthority?.files?.length > 0) {
      selectedTaxAuthority?.files?.map(item => {
        fetchPdfFile(setSelectedPdFile, item)
      })
      setDeletedPdFiles(selectedTaxAuthority?.files)
    }
  }, [selectedTaxAuthority])

  const [open, setOpen] = useState(false)
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setOpen(false)
  }

  const check = () => {
    setOpen(true)
    const fieldName = Object.keys(errors)[0]
    const errName = document.getElementById(fieldName)
    errName?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
  }

  const handleEditTaxAuthority = async editData => {
    setOpen(false)
    setLoader(true)
    const taxAuthorityId = editData?.taxAuthorityId

    const payload = editData
    delete payload.taxAuthorityId
    delete payload.tenantId
    delete payload.taxAuthorityCode
    delete payload.taxAuthorityCodePrefix
    delete payload.createdDateTime
    delete payload.createdBy
    delete payload.modifiedDateTime
    delete payload.modifiedBy
    const taxAuthority = {
      ...payload,
      taxAuthorityRegistration: {
        ...payload?.taxAuthorityRegistration,
        registrationDate: parseDate(payload?.taxAuthorityRegistration?.registrationDate),
        registrationExpiryDate: parseDate(payload?.taxAuthorityRegistration?.registrationExpiryDate)
      }
    }
    try {
      const response = await writeData(EditTaxAuthorityMutation(), { tenantId, taxAuthorityId, taxAuthority })
      if (response.updateTaxAuthority) {
        if (deletedPdFiles.length > 0 && selectedPdFile) {
          deletedPdFiles.forEach(async element => {
            const findDeleted = selectedPdFile.find(item => item.key === element.key)
            if (!findDeleted) {
              await DeleteUploadFile(element.key)
            }
          })
        }
        if (selectedPdFile || selectedPdFile?.length !== 0 || selectedPdFile[0]) {
          await UploadMultipleFileS3Api(selectedPdFile, dispatch)
        }
        dispatch(updateTaxAuthority(response.updateTaxAuthority))
        dispatch(createAlert({ message: 'Tax Authority Updated  successfully !', type: 'success' }))
        router.push('/accounting/tax-authorities/')
      } else {
        setLoader(false)
        dispatch(createAlert({ message: 'Tax Authority Updation  failed !', type: 'error' }))
      }
    } catch (error) {
      // Handle any errors and optionally dispatch an error action
      setLoader(false)
      dispatch(createAlert({ message: 'Tax Authority Updation  failed !', type: 'error' }))
    }
  }

  const handleCancel = () => {
    reset()
    router.push('/accounting/tax-authorities/')
  }

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
              {`Edit Tax Authority - ${selectedTaxAuthority?.taxAuthorityCode}`}{' '}
            </Typography>
          }
          button={
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                variant='contained'
                color='primary'
                sx={{ display: { xs: 'none', sm: 'flex' } }}
                startIcon={<AddOutlinedIcon />}
                component={Link}
                scroll={true}
                href={`/accounting/tax-authorities/add`}
              >
                Add New
              </Button>
              <IconButton
                variant='outlined'
                color='default'
                sx={{ fontSize: '21px' }}
                component={Link}
                scroll={true}
                href='/accounting/tax-authorities/'
              >
                <Close sx={{ color: theme => theme.palette.primary.main }} />
              </IconButton>
            </Box>
          }
        />

        <PageWrapper>
          <form onSubmit={handleSubmit(handleEditTaxAuthority)}>
            <Grid container spacing={{ xs: 6 }}>
              <Grid item xs={12} md={12} lg={8}>
                <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                  <Grid item xs={12} sm={6} md={4} lg={4}>
                    <Controller
                      name='taxAuthorityName'
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <CustomTextField
                          id='taxAuthorityName'
                          {...field}
                          fullWidth
                          label='Name'
                          // value={value}
                          // onChange={onChange}
                          error={Boolean(errors.taxAuthorityName)}
                          {...(errors.taxAuthorityName && { helperText: 'Name is required' })}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={10} lg={9} xl={8}>
                <Typography sx={{ fontSize: '15px', fontWeight: 500, lineHeight: '40px' }}>Address</Typography>
                <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                  <Grid item xs={12} sm={12} md={4} lg={4}>
                    <Controller
                      name='taxAuthorityAddress.addressLine1'
                      control={control}
                      rules={{ required: false }}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          fullWidth
                          label='Address Line 1'
                          error={Boolean(errors.taxAuthorityAddress?.addressLine1)}
                          {...(errors.taxAuthorityAddress?.addressLine1 && {
                            helperText: ' Address Line 1 is required'
                          })}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12} md={4} lg={4}>
                    <Controller
                      name='taxAuthorityAddress.addressLine2'
                      control={control}
                      rules={{ required: false }}
                      render={({ field }) => (
                        <CustomTextField fullWidth label='Address Line 2' {...field} onChange={field.onChange} />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={4}>
                    <Controller
                      name='taxAuthorityAddress.postcode'
                      control={control}
                      rules={{ required: false }}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          fullWidth
                          label='Zip Code'
                          error={Boolean(errors.taxAuthorityAddress?.postcode)}
                          {...(errors.taxAuthorityAddress?.postcode && { helperText: 'ZIP Code is required' })}
                        />
                      )}
                    />
                  </Grid>
                  {/* <Grid item xs={0} sm={6} lg={0} sx={{ display: { xs: 'none', lg: 'block' } }}></Grid> */}
                  <Grid item xs={12} sm={6} md={4} lg={4}>
                    <Controller
                      name='taxAuthorityAddress.cityOrTown'
                      control={control}
                      rules={{ required: false }}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          fullWidth
                          label='City / Town'
                          error={Boolean(errors.taxAuthorityAddress?.cityOrTown)}
                          {...(errors.taxAuthorityAddress?.cityOrTown && { helperText: 'City is required' })}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={4}>
                    <Controller
                      name='taxAuthorityAddress.country'
                      control={control}
                      rules={{ required: false }}
                      render={({ field }) => (
                        <CustomAutocomplete
                          {...field}
                          disableClearable
                          options={countries}
                          getOptionLabel={option => option.name || ''}
                          getOptionSelected={(option, value) => {
                            return option.name === value.name
                          }}
                          isOptionEqualToValue={(option, value) => option.name === value?.name}
                          value={{ name: field.value }}
                          onChange={(event, newValue) => {
                            field.onChange(newValue?.name)
                            settaxAuthorityAddressCountry(newValue)
                            setValue('taxAuthorityAddress.state', '')
                          }}
                          renderInput={params => (
                            <CustomTextField
                              {...params}
                              label='Select Country'
                              fullWidth
                              error={Boolean(errors.taxAuthorityAddress?.country)}
                              {...(errors.taxAuthorityAddress?.country && { helperText: ' Country is required' })}
                            />
                          )}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={4}>
                    <Controller
                      name='taxAuthorityAddress.state'
                      control={control}
                      rules={{ required: false }}
                      render={({ field }) => (
                        <CustomAutocomplete
                          {...field}
                          disableClearable
                          options={
                            !taxAuthorityAddressCountry?.states?.length <= 0 ? taxAuthorityAddressCountry?.states : []
                          }
                          getOptionLabel={option => option.name || ''}
                          getOptionSelected={(option, value) => {
                            return option.name === value.name
                          }}
                          isOptionEqualToValue={(option, value) => option.name === value?.name}
                          value={{ name: field.value }}
                          onChange={(event, newValue) => {
                            field.onChange(newValue?.name)
                          }}
                          renderInput={params => (
                            <CustomTextField
                              {...params}
                              label='Select State'
                              fullWidth
                              error={Boolean(errors.taxAuthorityAddress?.state)}
                              {...(errors.taxAuthorityAddress?.state && { helperText: 'State is required' })}
                            />
                          )}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={10} lg={9} xl={8}>
                <Typography sx={{ fontSize: '15px', fontWeight: 500, lineHeight: '40px' }}>Contact</Typography>
                <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                  <Grid item xs={12} sm={12} md={4} lg={4}>
                    <Controller
                      name='taxAuthorityContact.contactName'
                      control={control}
                      rules={{ required: false }}
                      render={({ field }) => <CustomTextField {...field} fullWidth label='Name' />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12} md={4} lg={4}>
                    <Controller
                      name='taxAuthorityContact.contactEmail'
                      control={control}
                      rules={{ required: false }}
                      render={({ field }) => <CustomTextField {...field} fullWidth label='Email' />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12} md={4} lg={4}>
                    <Controller
                      name='taxAuthorityContact.contactPhone'
                      control={control}
                      rules={{ required: false }}
                      render={({ field: { value, onChange } }) => (
                        <EditPhoneInput
                          name='taxAuthorityContact.contactPhone'
                          label='Mobile'
                          value={value}
                          onChange={onChange}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={10} lg={9} xl={8}>
                <Typography sx={{ fontSize: '15px', fontWeight: 500, lineHeight: '40px' }}>Registration</Typography>
                <Grid container spacing={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                  <Grid item xs={12} sm={12} md={4} lg={4}>
                    <Controller
                      name='taxAuthorityRegistration.registrationNo'
                      control={control}
                      rules={{ required: false }}
                      render={({ field }) => <CustomTextField {...field} fullWidth label='Registration No' />}
                    />
                  </Grid>
                  <Grid item xs={6} md={4} lg={4}>
                    <Controller
                      name='taxAuthorityRegistration.registrationDate'
                      control={control}
                      rules={{ required: false }}
                      render={({ field }) => (
                        <CustomDatePicker
                          fullWidth={true}
                          date={new Date(field.value)}
                          onChange={field.onChange}
                          label='Registration Date'
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6} md={4} lg={4}>
                    <Controller
                      name='taxAuthorityRegistration.registrationExpiryDate'
                      control={control}
                      rules={{ required: false }}
                      render={({ field }) => (
                        <CustomDatePicker
                          fullWidth={true}
                          date={new Date(field.value)}
                          onChange={field.onChange}
                          label='Registration ExpiryDate'
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12} md={10} lg={9} xl={8}>
                <Controller
                  name='taxAuthorityDescription'
                  control={control}
                  rules={{ required: false }}
                  render={({ field: { value, onChange } }) => (
                    <CustomTextField
                      fullWidth
                      label='Description'
                      multiline
                      minRows={2}
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <CustomFilesUpload
                  setValue={setValue}
                  selectedPdFile={selectedPdFile}
                  setSelectedPdFile={setSelectedPdFile}
                  folderName={TAX_AUTHORITY_PDF}
                />
              </Grid>
            </Grid>

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: { xs: 'center', sm: 'start' },
                gap: '20px',
                marginTop: { xs: '30px', sm: '50px' }
              }}
            >
              <Button variant='contained' type='submit' onClick={check}>
                Save
              </Button>

              <Button variant='outlined' type='reset' onClick={handleCancel}>
                Cancel
              </Button>
            </Box>
          </form>
        </PageWrapper>
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          open={open}
          autoHideDuration={3000}
          onClose={handleClose}
        >
          <Alert onClose={handleClose} severity='error' variant='filled' sx={{ width: '100%' }}>
            Please enter all required data
          </Alert>
        </Snackbar>
        {loader ? (
          <Backdrop sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }} open={loader}>
            <CircularProgress color='inherit' />
          </Backdrop>
        ) : null}
      </React.Fragment>
    </div>
  )
}
