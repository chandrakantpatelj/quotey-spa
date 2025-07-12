import { Box, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'

function MapColumns({ template, firstRow, mappedColumns, setMappedColumns }) {
  const handleHeaderChange = (selectedOption, idx) => {
    const newMappedColumns = [...mappedColumns]
    newMappedColumns[idx].index = selectedOption?.index ?? -1 // Clear = -1
    setMappedColumns(newMappedColumns)
  }

  // const handleClear = idx => {
  //   const newMappedColumns = [...mappedColumns]
  //   newMappedColumns[idx].index = -1
  //   setMappedColumns(newMappedColumns)
  // }

  return (
    <>
      <Table
        size='small'
        border='1'
        sx={{
          borderColor: 'inherit',
          maxWidth: 700,
          width: '100%',
          m: '0px auto',
          '& .MuiTableHead-root': {
            background: '#F4F6F8'
          },
          '& .MuiTableCell-root': {
            py: '12px',
            borderBottom: '1px dashed #EBEBEB'
          },
          '& .MuiTableCell-head': {
            py: '12px',
            textTransform: 'capitalize',
            fontWeight: 500,
            color: '#667380'
          },
          '& .MuiTableBody-root .MuiTableRow-root:last-of-type .MuiTableCell-root': {
            py: '12px',
            borderBottom: '1px solid #eeeeee'
          }
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: '40%' }}>Template Fields</TableCell>
            <TableCell sx={{ width: '60%' }}>Columns in your File</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {template?.map((item, index) => (
            <TableRow key={item}>
              <TableCell sx={{ textTransform: 'capitalize' }}>{item?.columnName}</TableCell>
              <TableCell>
                <CustomAutocomplete
                  options={(firstRow || []).map((header, i) => ({ label: header, index: i }))}
                  value={
                    mappedColumns[index]?.index >= 0
                      ? { label: firstRow[mappedColumns[index].index], index: mappedColumns[index].index }
                      : null
                  }
                  onChange={(event, newValue) => handleHeaderChange(newValue, index)}
                  getOptionLabel={option => option?.label || ''}
                  isOptionEqualToValue={(option, value) => option.index === value.index}
                  renderOption={(props, option) => (
                    <Box component='li' {...props}>
                      {option.label}
                    </Box>
                  )}
                  clearOnEscape
                  renderInput={params => <CustomTextField {...params} fullWidth label='Select Column' />}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}

export default MapColumns
