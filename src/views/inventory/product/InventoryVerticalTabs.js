// import React, { Fragment, useState } from 'react'
// import { styled } from '@mui/material/styles'
// import { Grid, RadioGroup, Radio, Chip, Checkbox, FormGroup, Button } from '@mui/material'
// import Box from '@mui/material/Box'
// import Tab from '@mui/material/Tab'
// import MuiTabList from '@mui/lab/TabList'
// import TabPanel from '@mui/lab/TabPanel'
// import TabContext from '@mui/lab/TabContext'
// import Typography from '@mui/material/Typography'
// import Autocomplete from '@mui/material/Autocomplete'
// import CustomTextField from 'src/@core/components/mui/text-field'
// import CustomDatePicker from 'src/views/forms/form-elements/pickers/CustomDatePicker'

// import Icon from 'src/@core/components/icon'

// import { top100Films } from 'src/@fake-db/autocomplete'

// function InventoryVerticalTabs() {
//   const [value, setValue] = useState('1')

//   const handleChange = (event, newValue) => {
//     setValue(newValue)
//   }

//   const TabList = styled(MuiTabList)(({ theme }) => ({
//     '&, & .MuiTabs-scroller': {
//       boxSizing: 'content-box',
//       padding: theme.spacing(1.25, 1.25, 2),
//       margin: `${theme.spacing(-1.25, -1.25, -2)} !important`
//     },
//     '& .MuiTabs-indicator': {
//       display: 'none'
//     },
//     '& .Mui-selected': {
//       display: 'flex',
//       boxShadow: theme.shadows[2],
//       backgroundColor: theme.palette.primary.main,
//       color: `${theme.palette.common.white} !important`
//     },
//     '&, & .MuiTabs-root': {
//       minWidth: 200,
//       padding: '0px 50px 0px 0px',
//       borderRight: { xs: '0px', sm: '1px solid #808080' },
//       [theme.breakpoints.down('sm')]: {
//         borderRight: 0,
//         padding: '30px',
//         borderBottom: `1px solid ${theme.palette.divider}`
//       }
//     },

//     '& .MuiTab-root': {
//       display: 'flex',
//       flexDirection: 'row',
//       justifyContent: 'flex-start',
//       alignItems: 'center',
//       lineHeight: 1,
//       maxWidth: 174,
//       width: '100%',
//       fontSize: '14px',
//       color: 'rgba(0, 0, 0, 0.5)',
//       padding: '8px 12px',
//       borderRadius: theme.shape.borderRadius,
//       '&:hover': {
//         color: theme.palette.primary.main
//       },
//       '&>.MuiTab-iconWrapper': {
//         marginBottom: '0px !important',
//         marginRight: '10px',
//         width: '25px',
//         height: '25px'
//       }
//     }
//   }))

//   return (
//     <>
//       <TabContext value={value}>
//         <Box
//           sx={{
//             border: { xs: '1px solid #d9d9d9', sm: '0px' },
//             display: 'flex',
//             padding: '10px 0px',
//             flexDirection: { xs: 'column', sm: 'row' },
//             alignItems: { xs: 'center', sm: 'flex-start' },
//             '& .MuiTabPanel-root': {
//               flexGrow: 1,
//               padding: { xs: '15px', sm: '0px 30px' }
//             }
//           }}
//         >
//           <TabList orientation='vertical' onChange={handleChange} aria-label='customized vertical tabs example'>
//             <Tab value='1' label='Restock' icon={<Icon icon='tabler:box' />} />
//             <Tab value='2' label='Shipping' icon={<Icon icon='tabler:truck' />} />
//             <Tab value='3' label='Global Delivery' icon={<Icon icon='mdi:web' />} />
//             <Tab value='4' label='Attributes' icon={<Icon icon='tabler:link' />} />
//             <Tab value='5' label='Advanced' icon={<Icon icon='tabler:lock' />} />
//           </TabList>
//           <TabPanel value='1'>
//             <Fragment>
//               <Grid container spacing={5}>
//                 <Grid item xs={12}>
//                   <Typography sx={{ fontSize: {xs:'16px',md:'18px'}, fontWeight: 500, color: 'text.primary' }}>Restock</Typography>
//                 </Grid>
//                 <Grid item xs={12}>
//                   <Box sx={{ display: 'flex', gap: 3, marginBottom: '13px' }}>
//                     <CustomTextField
//                       fullWidth
//                       label='Add to Stock'
//                       // value={username}
//                       placeholder='Quality'
//                     />

//                     <Button size='small' variant='contained'>
//                       Confirm
//                     </Button>
//                   </Box>
//                   <Typography
//                     sx={{ fontSize: '14px', fontWeight: '600', lineHeight: '24px', color: `rgba(0, 0, 0, 0.5) ` }}
//                   >
//                     {' '}
//                     Product in stock now: <span style={{ fontWeight: 400 }}> 54</span>
//                   </Typography>
//                   <Typography
//                     sx={{ fontSize: '14px', fontWeight: '600', lineHeight: '24px', color: `rgba(0, 0, 0, 0.5) ` }}
//                   >
//                     {' '}
//                     Product in transit: <span style={{ fontWeight: 400 }}> 390</span>
//                   </Typography>
//                   <Typography
//                     sx={{ fontSize: '14px', fontWeight: '600', lineHeight: '24px', color: `rgba(0, 0, 0, 0.5) ` }}
//                   >
//                     {' '}
//                     Last time restocked: <span style={{ fontWeight: 400 }}>24th June, 2023 </span>
//                   </Typography>
//                   <Typography
//                     sx={{ fontSize: '14px', fontWeight: '600', lineHeight: '24px', color: `rgba(0, 0, 0, 0.5) ` }}
//                   >
//                     {' '}
//                     Total stock over lifetime: <span style={{ fontWeight: 400 }}> 2430 </span>
//                   </Typography>
//                 </Grid>
//               </Grid>
//             </Fragment>
//           </TabPanel>
//           <TabPanel value='2'>
//             <Fragment>
//               <Grid container spacing={5}>
//                 <Grid item xs={12}>
//                   <Typography sx={{ fontSize: {xs:'16px',md:'18px'}, fontWeight: 500, color: 'text.primary' }}> Shipping</Typography>
//                 </Grid>

//                 <Grid item xs={12} sm={12}>
//                   <RadioGroup>
//                     <Box
//                       sx={{
//                         display: 'flex',
//                         justifyContent: 'flex-start',
//                         alignItems: 'flex-start',
//                         marginBottom: '26px'
//                       }}
//                     >
//                       <Radio value='seller' sx={{ padding: '0px', marginRight: '12px' }} />

//                       <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
//                         <Typography sx={{ fontSize: '16px', marginBottom: '7px' }}>Fulfilled by Seller</Typography>
//                         <Typography sx={{ fontSize: '12px', color: 'rgba(0,0,0,0.50)' }}>
//                           You'll be responsible for product delivery. Any damage or delay during shipping may cost you a
//                           Damage fee.
//                         </Typography>
//                       </Box>
//                     </Box>
//                     <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
//                       <Radio value='compny name' sx={{ padding: '0px', marginRight: '12px' }} />

//                       <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
//                         <Box
//                           sx={{
//                             height: '100%',
//                             display: 'flex',
//                             flexDirection: 'row',
//                             alignItems: 'center',
//                             marginBottom: '7px'
//                           }}
//                         >
//                           <Typography sx={{ fontSize: '16px' }}>Fulfilled by Company name</Typography>{' '}
//                           <Chip
//                             label='Recommanded'
//                             size='small'
//                             variant='outlined'
//                             color='warning'
//                             sx={{ m: '0px 5px', borderRadius: '5px', lineHeight: 1 }}
//                           />
//                         </Box>
//                         <Typography sx={{ fontSize: '12px', color: 'rgba(0,0,0,0.50)' }}>
//                           Your product, Our responsibility. For a measly fee, we will handle the delivery process for
//                           you.
//                         </Typography>
//                       </Box>
//                     </Box>
//                   </RadioGroup>
//                 </Grid>
//               </Grid>
//             </Fragment>
//           </TabPanel>
//           <TabPanel value='3'>
//             <Fragment>
//               <Grid container spacing={5}>
//                 <Grid item xs={12}>
//                   <Typography sx={{ fontSize: {xs:'16px',md:'18px'}, fontWeight: 500, color: 'text.primary' }}>
//                     {' '}
//                     Global Delivery
//                   </Typography>
//                 </Grid>
//                 <Grid item xs={12} sm={12}>
//                   <RadioGroup>
//                     <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
//                       <Radio value='delivery' sx={{ padding: '0px', marginRight: '12px' }} />

//                       <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', marginBottom: '10px' }}>
//                         <Typography sx={{ fontSize: '16px', marginBottom: '7px' }}>Worldwide delivery</Typography>

//                         <Typography sx={{ fontSize: '12px', color: 'rgba(0,0,0,0.50)' }}>
//                           Only available with Shipping method:{' '}
//                           <span style={{ color: `rgba(69, 103, 198, 1)` }}> Fulfilled by Company name</span>
//                         </Typography>
//                       </Box>
//                     </Box>
//                     <Box
//                       sx={{
//                         display: 'flex',
//                         justifyContent: 'flex-start',
//                         alignItems: 'flex-start',
//                         marginBottom: '10px'
//                       }}
//                     >
//                       <Radio value='selected-countries' sx={{ padding: '0px', marginRight: '12px' }} />
//                       <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
//                         <Typography sx={{ fontSize: '16px', marginBottom: '7px' }}>Selected Countries</Typography>
//                         <CustomTextField label='CountryName' placeholder='Type Country Name' fullWidth />
//                       </Box>
//                     </Box>
//                     <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
//                       <Radio value='local-delivery' sx={{ padding: '0px', marginRight: '12px' }} />

//                       <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
//                         <Typography sx={{ fontSize: '16px', marginBottom: '7px' }}>Local delivery</Typography>

//                         <Typography sx={{ fontSize: '12px', color: 'rgba(0,0,0,0.50)' }}>
//                           Deliver to your country of residence :
//                           <span style={{ color: `rgba(69, 103, 198, 1)` }}> Change profile address</span>
//                         </Typography>
//                       </Box>
//                     </Box>
//                   </RadioGroup>
//                 </Grid>
//               </Grid>
//             </Fragment>
//           </TabPanel>
//           <TabPanel value='4'>
//             <Fragment>
//               <Grid container spacing={5}>
//                 <Grid item xs={12}>
//                   <Typography sx={{ fontSize: {xs:'16px',md:'18px'}, fontWeight: 500, color: 'text.primary' }}>
//                     {' '}
//                     Global Delivery
//                   </Typography>
//                 </Grid>
//                 <Grid item xs={12} sm={12}>
//                   <FormGroup>
//                     <Box
//                       sx={{
//                         display: 'flex',
//                         justifyContent: 'flex-start',
//                         alignItems: 'flex-start',
//                         marginBottom: '10px'
//                       }}
//                     >
//                       <Checkbox value='returnable-product' sx={{ padding: '0px', marginRight: '12px' }} />

//                       <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
//                         <Typography variant='subtitle1' sx={{ fontSize: '16px', lineHeight: 2 }}>
//                           Returnable Product
//                         </Typography>
//                       </Box>
//                     </Box>
//                     <Box
//                       sx={{
//                         display: 'flex',
//                         justifyContent: 'flex-start',
//                         alignItems: 'flex-start',
//                         marginBottom: '10px'
//                       }}
//                     >
//                       <Checkbox value='biodegradable' sx={{ padding: '0px', marginRight: '12px' }} />
//                       <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
//                         <Typography sx={{ fontSize: '16px', lineHeight: 2 }}>Biodegradable</Typography>
//                       </Box>
//                     </Box>
//                     <Box
//                       sx={{
//                         display: 'flex',
//                         justifyContent: 'flex-start',
//                         alignItems: 'flex-start',
//                         marginBottom: '10px'
//                       }}
//                     >
//                       <Checkbox value='frozen-product' sx={{ padding: '0px', marginRight: '12px' }} />

//                       <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
//                         <Typography sx={{ fontSize: '16px', lineHeight: 2, marginBottom: '7px' }}>
//                           Frozen Product
//                         </Typography>
//                         <CustomTextField label='Temperature' placeholder='Max allowed Temperature' fullWidth />
//                       </Box>
//                     </Box>
//                     <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
//                       <Checkbox value='expiry-date-product' sx={{ padding: '0px', marginRight: '12px' }} />

//                       <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
//                         <Typography sx={{ fontSize: '16px', lineHeight: 2, marginBottom: '7px' }}>
//                           Expiry Date of Product
//                         </Typography>
//                         <CustomDatePicker
//                           placeholderText='MM-DD-YYYY'
//                           label={'Expiry Date'}
//                           popperPlacement={'bottom'}
//                           sx={{ width: 259 }}
//                         />
//                       </Box>
//                     </Box>
//                   </FormGroup>
//                 </Grid>
//               </Grid>
//             </Fragment>
//           </TabPanel>
//           <TabPanel value='5'>
//             <Fragment>
//               <Grid container spacing={5}>
//                 <Grid item xs={12}>
//                   <Typography sx={{ fontSize: {xs:'16px',md:'18px'}, fontWeight: 500, color: 'text.primary' }}> Advanced</Typography>
//                 </Grid>
//                 <Grid item xs={12} sm={6} xl={4}>
//                   <Autocomplete
//                     options={top100Films}
//                     id='autocomplete-outlined'
//                     getOptionLabel={option => option.title || ''}
//                     renderInput={params => (
//                       <CustomTextField {...params} label='Product ID Type' placeholder='ISBN' fullWidth />
//                     )}
//                   />
//                 </Grid>
//                 <Grid item xs={12} sm={6} xl={4}>
//                   <Autocomplete
//                     options={top100Films}
//                     id='autocomplete-outlined'
//                     getOptionLabel={option => option.title || ''}
//                     renderInput={params => (
//                       <CustomTextField {...params} label='Product ID' placeholder='ISBN Number' fullWidth />
//                     )}
//                   />
//                 </Grid>
//               </Grid>
//             </Fragment>
//           </TabPanel>
//         </Box>
//       </TabContext>
//     </>
//   )
// }

// export default InventoryVerticalTabs

import React from 'react'

function InventoryVerticalTabs() {
  return <div>InventoryVerticalTabs</div>
}

export default InventoryVerticalTabs
