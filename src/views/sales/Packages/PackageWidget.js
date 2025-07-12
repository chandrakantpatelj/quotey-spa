import { useState } from 'react'

import { Card, CardContent, CardHeader } from '@mui/material'

import { TabList, TabPanel } from '@mui/lab'
import TabContext from '@mui/lab/TabContext'

import { useTheme } from '@mui/material/styles'

import { renderTabs } from 'src/common-functions/utils/UtilityFunctions'
import AttachmentTabPackage from './AttachmentTabPackage'

const tabData = [
  {
    type: 'attachments',
    avatarIcon: 'carbon:document-attachment'
  }
]

const renderTabPanels = (value, salesPackage) => {
  switch (value) {
    case 'attachments':
      return (
        <TabPanel value='attachments'>
          <AttachmentTabPackage salesPackage={salesPackage} folderName={'SALES_PACKAGE_PDF'} />
        </TabPanel>
      )
  }
}

const PackageWidget = ({ selectedPackage }) => {
  const [value, setValue] = useState('attachments')

  const theme = useTheme()

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  return (
    <>
      <Card>
        <CardHeader title='Related Records' />
        <CardContent sx={{ '& .MuiTabPanel-root': { p: 0 } }}>
          <TabContext value={value}>
            <TabList
              variant='scrollable'
              scrollButtons='auto'
              onChange={handleChange}
              aria-label='earning report tabs'
              sx={{
                border: '0 !important',
                '& .MuiTabs-indicator': { display: 'none' },
                '& .MuiTab-root': {
                  p: 0,
                  minWidth: 0,
                  overflow: 'visible',
                  borderRadius: '10px',
                  paddingTop: '15px',
                  '&:not(:last-child)': { mr: 4 }
                },
                '& .MuiTabs-scroller': {
                  paddingTop: '15px'
                },
                mb: 7
              }}
            >
              {renderTabs(value, theme, tabData, selectedPackage)}
            </TabList>
            {renderTabPanels(value, selectedPackage)}
          </TabContext>
        </CardContent>
      </Card>
    </>
  )
}

export default PackageWidget
