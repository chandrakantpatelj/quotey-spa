import React from 'react'
import { Box, Checkbox, Table, TableCell, TableBody, TableRow, TableHead, Typography } from '@mui/material'

function DisplayParsedData({ values, skipHeader, setSkipHeader }) {
  const handleSkipHeaderChange = event => {
    setSkipHeader(event.target.checked)
  }

  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', my: 7 }}>
        <Checkbox sx={{ p: '4px' }} checked={skipHeader} onChange={handleSkipHeaderChange} />
        <Typography sx={{ fontSize: '13px' }}>Skip Header</Typography>
      </Box>

      {values?.length > 0 && (
        <Box sx={{ height: '650px', overflow: 'hidden', overflowY: 'auto' }}>
          <Table stickyHeader>
            {skipHeader ? (
              <TableHead>
                <TableRow>
                  {values[0]?.map((row, index) => (
                    <TableCell
                      key={index}
                      sx={{ py: '9.5px !important', textTransform: 'capitalize', background: '#dbdbdb' }}
                    >
                      {row}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
            ) : null}

            <TableBody>
              {values?.slice(skipHeader ? 1 : 0).map((value, rowIndex) => (
                <TableRow key={rowIndex}>
                  {value?.map((cell, cellIndex) => (
                    <TableCell key={cellIndex} sx={{ py: '8.5px !important' }}>
                      {cell}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </>
  )
}

export default DisplayParsedData
