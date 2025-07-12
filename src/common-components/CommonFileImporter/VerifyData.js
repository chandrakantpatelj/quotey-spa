import React from 'react'
import { Box, Table, TableCell, TableBody, TableRow, TableHead } from '@mui/material'

function VerifyData({ values, mappedColumns, skipHeader }) {
  return (
    <>
      {values?.length > 0 && (
        <Box sx={{ height: '650px', overflow: 'hidden', overflowY: 'auto' }}>
          <Table>
            {skipHeader ? (
              <TableHead>
                <TableRow>
                  {mappedColumns
                    ?.filter(col => col.index !== -1)
                    .map((col, idx) => (
                      <TableCell key={idx} sx={{ py: '9.5px !important', background: '#dbdbdb' }}>
                        {col.columnName} → {values[0][col.index]}
                      </TableCell>
                    ))}
                </TableRow>
              </TableHead>
            ) : null}

            <TableBody>
              {values?.slice(skipHeader ? 1 : 0).map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {mappedColumns
                    .filter(col => col.index !== -1)
                    .map((col, colIndex) => (
                      <TableCell key={colIndex} sx={{ py: '8.5px !important' }}>
                        {row[col.index] ?? ''}
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

export default VerifyData
