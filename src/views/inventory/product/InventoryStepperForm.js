// // ** React Imports
// import { Fragment, useState } from 'react'

// // ** MUI Imports
// import Box from '@mui/material/Box'
// import Card from '@mui/material/Card'
// import Grid from '@mui/material/Grid'
// import Avatar from '@mui/material/Avatar'
// import Button from '@mui/material/Button'
// import Divider from '@mui/material/Divider'
// import Stepper from '@mui/material/Stepper'
// import { styled } from '@mui/material/styles'
// import StepLabel from '@mui/material/StepLabel'
// import Typography from '@mui/material/Typography'
// import MuiStep from '@mui/material/Step'
// import Autocomplete from '@mui/material/Autocomplete'
// import { RadioGroup, Radio, Chip, Checkbox, FormGroup } from '@mui/material'
// import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
// import DatePicker from 'react-datepicker'

// import CardContent from '@mui/material/CardContent'

// // ** Third Party Imports
// import toast from 'react-hot-toast'

// // ** Icon Imports
// import Icon from 'src/@core/components/icon'

// // ** Custom Components Imports
// import CustomTextField from 'src/@core/components/mui/text-field'

// // ** Util Import

// // ** Styled Component
// import StepperWrapper from 'src/@core/styles/mui/stepper'
// import CustomDatePicker from 'src/views/forms/form-elements/pickers/CustomDatePicker'

// import { top100Films } from 'src/@fake-db/autocomplete'

// const steps = [
//   {
//     icon: 'tabler:box',
//     title: 'Restock'
//   },
//   {
//     icon: 'tabler:truck',
//     title: 'Shipping'
//   },
//   {
//     icon: 'mdi:web',
//     title: 'Global Delivery'
//   },
//   {
//     icon: 'tabler:link',
//     title: 'Attributes'
//   },
//   {
//     icon: 'tabler:lock',
//     title: 'Advanced'
//   }
// ]

// const StepperHeaderContainer = styled(CardContent)(({ theme }) => ({
//   borderRight: `1px solid ${theme.palette.divider}`,
//   padding: '1.5rem 0px',
//   [theme.breakpoints.down('md')]: {
//     borderRight: 0,
//     padding: '30px',
//     borderBottom: `1px solid ${theme.palette.divider}`
//   }
// }))

// const Step = styled(MuiStep)(({ theme }) => ({
//   '& .MuiStepLabel-root': {
//     padding: '0px'
//   },
//   '&:not(:last-of-type) .MuiStepLabel-root': {
//     // paddingBottom: theme.spacing(6)
//   },
//   '&:last-of-type .MuiStepLabel-root': {
//     paddingBottom: 0
//   },
//   '& .MuiStepLabel-iconContainer': {
//     display: 'none'
//   },
//   '& .MuiStepLabel-label': {
//     maxWidth: '174px',
//     width: '100%',
//     padding: '0px',
//     borderRadius: '6px',
//     padding: '8px 12px'
//   },

//   '.step-label .MuiAvatar-root,.step-label .step-title': {
//     color: '#808080'
//   },

//   '.step-label .MuiAvatar-root': {
//     width: '24px',
//     height: '24px',
//     padding: '0px',
//     marginRight: '7px',
//     background: 'none'
//   },
//   '.step-label .step-title': {
//     fontSize: '14px',
//     fontWeight: '400'
//   },

//   '.Mui-active .step-label .MuiAvatar-root,.Mui-active .step-label .step-title': {
//     color: '#FFF'
//   },

//   '.MuiStepLabel-label.Mui-active ': {
//     background: '#4567C6',
//     color: '#FFF !important'
//   },

//   '& .MuiStep-root .step-title': {
//     fontSize: '14px !important',
//     fontWeight: '400'
//   }
// }))

// const InventoryStepperForm = () => {
//   const [activeStep, setActiveStep] = useState(0)

//   // Handle Stepper
//   const handleBack = () => {
//     setActiveStep(prevActiveStep => prevActiveStep - 1)
//   }

//   const handleNext = () => {
//     setActiveStep(prevActiveStep => prevActiveStep + 1)
//     if (activeStep === steps.length - 1) {
//       toast.success('Form Submitted')
//     }
//   }

//   const handleReset = () => {
//     setActiveStep(0)
//   }

//   const getStepContent = step => {
//     switch (step) {
//       case 0:
//         return (
//           <Fragment>
//             <Grid item xs={12}>
//               <CustomTextField
//                 fullWidth
//                 label='Add to Stock'
//                 // value={username}
//                 placeholder='Quality'
//                 sx={{ marginBottom: '13px' }}
//               />

//               <Typography
//                 sx={{ fontSize: '14px', fontWeight: '400', lineHeight: '24px', color: `rgba(0, 0, 0, 0.5) ` }}
//               >
//                 {' '}
//                 <span style={{ fontWeight: '600 !important' }}> Product in stock now:</span> 54
//               </Typography>
//               <Typography
//                 sx={{ fontSize: '14px', fontWeight: '400', lineHeight: '24px', color: `rgba(0, 0, 0, 0.5) ` }}
//               >
//                 {' '}
//                 <span style={{ fontWeight: '600 !important' }}>Product in transit: </span> 390
//               </Typography>
//               <Typography
//                 sx={{ fontSize: '14px', fontWeight: '400', lineHeight: '24px', color: `rgba(0, 0, 0, 0.5) ` }}
//               >
//                 {' '}
//                 <span style={{ fontWeight: '600 !important' }}> Last time restocked: </span> 24th June, 2023
//               </Typography>
//               <Typography
//                 sx={{ fontSize: '14px', fontWeight: '400', lineHeight: '24px', color: `rgba(0, 0, 0, 0.5) ` }}
//               >
//                 {' '}
//                 <span style={{ fontWeight: '600 !important' }}> Total stock over lifetime: </span> 2430
//               </Typography>
//             </Grid>
//           </Fragment>
//         )
//       case 1:
//         return (
//           <Fragment key={step}>
//             <Grid item xs={12} sm={12}>
//               <RadioGroup>
//                 <Box
//                   sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', marginBottom: '26px' }}
//                 >
//                   <Radio value='seller' sx={{ padding: '0px', marginRight: '12px' }} />

//                   <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
//                     <Typography sx={{ fontSize: '16px', marginBottom: '7px' }}>Fulfilled by Seller</Typography>
//                     <Typography sx={{ fontSize: '12px', color: 'rgba(0,0,0,0.50)' }}>
//                       You'll be responsible for product delivery. Any damage or delay during shipping may cost you a
//                       Damage fee.
//                     </Typography>
//                   </Box>
//                 </Box>
//                 <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
//                   <Radio value='compny name' sx={{ padding: '0px', marginRight: '12px' }} />

//                   <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
//                     <Box
//                       sx={{
//                         height: '100%',
//                         display: 'flex',
//                         flexDirection: 'row',
//                         alignItems: 'center',
//                         marginBottom: '7px'
//                       }}
//                     >
//                       <Typography sx={{ fontSize: '16px' }}>Fulfilled by Company name</Typography>{' '}
//                       <Chip
//                         label='Recommanded'
//                         size='small'
//                         variant='outlined'
//                         color='warning'
//                         sx={{ m: '0px 5px', borderRadius: '5px', lineHeight: 1 }}
//                       />
//                     </Box>
//                     <Typography sx={{ fontSize: '12px', color: 'rgba(0,0,0,0.50)' }}>
//                       Your product, Our responsibility. For a measly fee, we will handle the delivery process for you.
//                     </Typography>
//                   </Box>
//                 </Box>
//               </RadioGroup>
//             </Grid>
//           </Fragment>
//         )
//       case 2:
//         return (
//           <Fragment key={step}>
//             <Grid item xs={12} sm={12}>
//               <RadioGroup>
//                 <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
//                   <Radio value='delivery' sx={{ padding: '0px', marginRight: '12px' }} />

//                   <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', marginBottom: '10px' }}>
//                     <Typography sx={{ fontSize: '16px', marginBottom: '7px' }}>Worldwide delivery</Typography>

//                     <Typography sx={{ fontSize: '12px', color: 'rgba(0,0,0,0.50)' }}>
//                       Only available with Shipping method:{' '}
//                       <span style={{ color: `rgba(69, 103, 198, 1)` }}> Fulfilled by Company name</span>
//                     </Typography>
//                   </Box>
//                 </Box>
//                 <Box
//                   sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', marginBottom: '10px' }}
//                 >
//                   <Radio value='selected-countries' sx={{ padding: '0px', marginRight: '12px' }} />
//                   <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
//                     <Typography sx={{ fontSize: '16px', marginBottom: '7px' }}>Selected Countries</Typography>
//                     <CustomTextField label='CountryName' placeholder='Type Country Name' fullWidth />
//                   </Box>
//                 </Box>
//                 <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
//                   <Radio value='local-delivery' sx={{ padding: '0px', marginRight: '12px' }} />

//                   <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
//                     <Typography sx={{ fontSize: '16px', marginBottom: '7px' }}>Local delivery</Typography>

//                     <Typography sx={{ fontSize: '12px', color: 'rgba(0,0,0,0.50)' }}>
//                       Deliver to your country of residence :
//                       <span style={{ color: `rgba(69, 103, 198, 1)` }}> Change profile address</span>
//                     </Typography>
//                   </Box>
//                 </Box>
//               </RadioGroup>
//             </Grid>
//           </Fragment>
//         )
//       case 3:
//         return (
//           <Fragment key={step}>
//             <Grid item xs={12} sm={12}>
//               <FormGroup>
//                 <Box
//                   sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', marginBottom: '10px' }}
//                 >
//                   <Checkbox value='returnable-product' sx={{ padding: '0px', marginRight: '12px' }} />

//                   <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
//                     <Typography variant='subtitle1' sx={{ fontSize: '16px', lineHeight: 2 }}>
//                       Returnable Product
//                     </Typography>
//                   </Box>
//                 </Box>
//                 <Box
//                   sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', marginBottom: '10px' }}
//                 >
//                   <Checkbox value='biodegradable' sx={{ padding: '0px', marginRight: '12px' }} />
//                   <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
//                     <Typography sx={{ fontSize: '16px', lineHeight: 2 }}>Biodegradable</Typography>
//                   </Box>
//                 </Box>
//                 <Box
//                   sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', marginBottom: '10px' }}
//                 >
//                   <Checkbox value='frozen-product' sx={{ padding: '0px', marginRight: '12px' }} />

//                   <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
//                     <Typography sx={{ fontSize: '16px', lineHeight: 2, marginBottom: '7px' }}>
//                       Frozen Product
//                     </Typography>
//                     <CustomTextField label='Temperature' placeholder='Max allowed Temperature' fullWidth />
//                   </Box>
//                 </Box>
//                 <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
//                   <Checkbox value='expiry-date-product' sx={{ padding: '0px', marginRight: '12px' }} />

//                   <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
//                     <Typography sx={{ fontSize: '16px', lineHeight: 2, marginBottom: '7px' }}>
//                       Expiry Date of Product
//                     </Typography>
//                     <CustomDatePicker
//                       placeholderText='MM-DD-YYYY'
//                       label={'Expiry Date'}
//                       popperPlacement={'bottom'}
//                       sx={{ width: 259 }}
//                     />
//                   </Box>
//                 </Box>
//               </FormGroup>
//             </Grid>
//           </Fragment>
//         )
//       case 4:
//         return (
//           <Fragment key={step}>
//             <Grid item xs={12} sm={6}>
//               <Autocomplete
//                 options={top100Films}
//                 id='autocomplete-outlined'
//                 getOptionLabel={option => option.title || ''}
//                 renderInput={params => (
//                   <CustomTextField {...params} label='Product ID Type' placeholder='ISBN' fullWidth />
//                 )}
//               />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <Autocomplete
//                 options={top100Films}
//                 id='autocomplete-outlined'
//                 getOptionLabel={option => option.title || ''}
//                 renderInput={params => (
//                   <CustomTextField {...params} label='Product ID' placeholder='ISBN Number' fullWidth />
//                 )}
//               />
//             </Grid>
//           </Fragment>
//         )
//       default:
//         return 'Unknown Step'
//     }
//   }

//   const renderContent = () => {
//     if (activeStep === steps.length) {
//       return (
//         <>
//           <Typography>All steps are completed!</Typography>
//           <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
//             <Button variant='contained' size='small' onClick={handleReset}>
//               Reset
//             </Button>
//           </Box>
//         </>
//       )
//     } else {
//       return (
//         <form onSubmit={e => e.preventDefault()}>
//           <Grid container spacing={5}>
//             <Grid item xs={12}>
//               <Typography sx={{ fontSize: {xs:'16px',md:'18px'}, fontWeight: 500, color: 'text.primary' }}>
//                 {steps[activeStep].title}
//               </Typography>
//             </Grid>
//             {getStepContent(activeStep)}
//             <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
//               <Button variant='outlined' color='primary' size='small' disabled={activeStep === 0} onClick={handleBack}>
//                 Back
//               </Button>
//               <Button variant='contained' size='small' onClick={handleNext}>
//                 {activeStep === steps.length - 1 ? 'Submit' : 'Confirm'}
//               </Button>
//             </Grid>
//           </Grid>
//         </form>
//       )
//     }
//   }

//   return (
//     <Card
//       sx={{
//         display: 'flex',
//         flexDirection: { xs: 'column', md: 'row' },
//         border: { xs: theme => `1px solid ${theme.palette.divider} !important`, md: '0px' },
//         backgroundColor: 'transparent',
//         boxShadow: 'none'
//       }}
//     >
//       <StepperHeaderContainer>
//         <StepperWrapper sx={{ height: '100%', border: '0px' }}>
//           <Stepper
//             activeStep={activeStep}
//             orientation='vertical'
//             connector={<></>}
//             sx={{ height: '100%', minWidth: '15rem', p: 0 }}
//           >
//             {steps.map((step, index) => {
//               return (
//                 <Step key={index}>
//                   <StepLabel>
//                     <div className='step-label'>
//                       <Avatar>
//                         <Icon icon={step.icon} />
//                       </Avatar>

//                       <div>
//                         <Typography className='step-title'>{step.title}</Typography>
//                       </div>
//                     </div>
//                   </StepLabel>
//                 </Step>
//               )
//             })}
//           </Stepper>
//         </StepperWrapper>
//       </StepperHeaderContainer>
//       <Divider sx={{ m: '0 !important' }} />
//       <CardContent sx={{ width: '100%' }}>{renderContent()}</CardContent>
//     </Card>
//   )
// }

// export default InventoryStepperForm

import React from 'react'

function InventoryStepperForm() {
  return <div>InventoryStepperForm</div>
}

export default InventoryStepperForm
