// ** Next Import
import Link from 'next/link'
import Router from 'next/router'
import { useState } from 'react'
// ** MUI Imports
import { Box, Divider, Grid, IconButton, LinearProgress, MenuItem, Typography, alpha } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import Icon from 'src/@core/components/icon'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'
import CommonStyledMenu from 'src/common-components/CommonStyledMenu'
import CustomNoRowsOverlay from 'src/common-components/CustomNoRowsOverlay'
import MobileDataGrid from 'src/common-components/MobileDataGrid'
import { DELETE_ACCOUNT, EDIT_ACCOUNT, VIEW_ACCOUNT } from 'src/common-functions/utils/Constants'
import { dataTextStyles, dataTitleStyles, hasPermission } from 'src/common-functions/utils/UtilityFunctions'
import useCurrencies from 'src/hooks/getData/useCurrencies'
import { useIsLaptop } from 'src/hooks/IsDesktop'
import { setSelectedFinancialAccounts } from 'src/store/apps/financial-Accounts'
import AccountingAccountFilter from './AccountingAccountFilter'
import DeleteFinancialAccount from './DeleteFinancialAccount'

const FinancialAccountsListTable = ({ tenantId, accountData, financialAccountloading }) => {
  const dispatch = useDispatch()
  const userProfile = useSelector(state => state.userProfile)
  const { currencies = [] } = useCurrencies()
  const isLaptop = useIsLaptop()
  const [isFilterActive, setFilterActive] = useState({})
  const { financialAccounts } = accountData
  const router = Router
  const [openDialog, setOpenDialog] = useState(false)
  const [selecedAccounts, setSelecedAccounts] = useState('')
  const [anchorElMap, setAnchorElMap] = useState({})
  const [filteredAccounts, setFilteredAccounts] = useState([])
  const [temporaryFilterData, setTemporaryFilterData] = useState([])
  const [searchedAccount, setSearchedAccount] = useState(null)

  const handleClick = (event, row) => {
    dispatch(setSelectedFinancialAccounts(row))
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.accountId] = event.currentTarget
    setAnchorElMap(updatedAnchorElMap)
  }

  const handleClose = row => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row.accountId] = null
    setAnchorElMap(updatedAnchorElMap)
  }

  const handleDelete = row => {
    setSelecedAccounts(row)
    handleClose(row)
    setOpenDialog(true)
  }

  const handleSearchChange = (event, newValue) => {
    const searchValue = newValue ? newValue.toLowerCase() : ''

    if (searchValue) {
      const matchedAccounts = financialAccounts.filter(account => {
        return (
          account.accountNumber.toLowerCase().includes(searchValue) ||
          account.accountName.toLowerCase().includes(searchValue)
        )
      })

      setFilteredAccounts(matchedAccounts.length > 0 ? matchedAccounts : temporaryFilterData)
    } else {
      setFilteredAccounts(temporaryFilterData)
      setSearchedAccount(null)
    }
  }

  const mobileColumns = [
    {
      field: 'accountNumber',
      headerName: '',
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => {
        const viewPermission = hasPermission(userProfile, VIEW_ACCOUNT)
        const editPermission = hasPermission(userProfile, EDIT_ACCOUNT)
        const deletePermission = hasPermission(userProfile, DELETE_ACCOUNT)

        const currency = currencies?.find(val => val?.currencyId === row?.currency)

        return (
          <Box sx={{ width: '100%', p: 2 }}>
            <Grid container spacing={3} sx={{ alignItems: { xs: 'flex-start', md: 'center' } }}>
              <Grid item xs={11}>
                <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                  <Grid item xs={9} sm={12} md={6}>
                    <Typography sx={{ ...dataTextStyles, fontSize: '14px', fontWeight: 500, lineHeight: '28px' }}>
                      {row.accountName || ''}
                    </Typography>
                    <Box
                      sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: '5px', md: '15px' }, alignItems: 'center' }}
                    >
                      <Typography sx={{ ...dataTitleStyles, color: '#818181' }}>
                        <span style={{ verticalAlign: 'middle', marginRight: '5px', color: '#696969' }}>#</span>
                        {row.accountNumberPrefix}
                        {row.accountNumber || ''}
                      </Typography>
                    </Box>
                    <Typography sx={{ ...dataTitleStyles, color: '#818181' }}>{row?.description}</Typography>
                  </Grid>
                  <Grid item xs={3} sm={3} md={1.5}>
                    <Typography sx={dataTextStyles}>{row.accountType || '-'}</Typography>
                    <Typography sx={dataTitleStyles}>Type</Typography>
                  </Grid>
                  <Grid item xs={0} sm={3} md={3} sx={{ display: { xs: 'none', sm: 'block' } }}>
                    <Typography sx={dataTextStyles}>{row.accountCategory || '-'}</Typography>
                    <Typography sx={dataTitleStyles}>Category</Typography>
                  </Grid>
                  <Grid item xs={0} sm={3} md={1.5} sx={{ display: { xs: 'none', sm: 'block' } }}>
                    {row?.currency ? (
                      <Typography sx={dataTextStyles}>
                        {currency?.symbol} {currency?.currencyId}
                      </Typography>
                    ) : (
                      '-'
                    )}
                    <Typography sx={dataTitleStyles}>Currency</Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={1}>
                {isLaptop ? (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    {viewPermission && (
                      <IconButton
                        component={Link}
                        scroll={true}
                        href={`/accounting/accounts/view/${row?.accountId}`}
                        onClick={event => {
                          event.stopPropagation()
                          dispatch(setSelectedFinancialAccounts(row))
                        }}
                      >
                        <Icon icon='tabler:eye' />
                      </IconButton>
                    )}
                    {editPermission && (
                      <IconButton
                        component={Link}
                        scroll={true}
                        href={`/accounting/accounts/edit/${row?.accountId}`}
                        onClick={event => {
                          event.stopPropagation()
                          dispatch(setSelectedFinancialAccounts(row))
                        }}
                      >
                        <Icon icon='tabler:edit' />
                      </IconButton>
                    )}
                    {deletePermission && (
                      <>
                        <IconButton
                          aria-label='more'
                          id='long-button'
                          aria-haspopup='true'
                          onClick={event => {
                            event.stopPropagation()
                            handleClick(event, row)
                          }}
                        >
                          <Icon icon='iconamoon:menu-kebab-vertical-circle-light' width={25} height={25} />
                        </IconButton>
                        <CommonStyledMenu
                          anchorEl={anchorElMap[row.accountId]}
                          open={Boolean(anchorElMap[row.accountId])}
                          onClose={() => handleClose(row)}
                        >
                          <MenuItem
                            onClick={() => handleDelete(row)}
                            sx={{
                              color: theme => theme?.palette?.error?.main,
                              '&:hover': {
                                color: theme => theme?.palette?.error?.main + ' !important',
                                backgroundColor: theme =>
                                  alpha(theme.palette.error.main, theme.palette.action.selectedOpacity) + ' !important'
                              }
                            }}
                          >
                            <Icon icon='mingcute:delete-2-line' color='inherit' />
                            Delete
                          </MenuItem>
                        </CommonStyledMenu>
                      </>
                    )}
                  </Box>
                ) : (
                  <>
                    <IconButton
                      aria-label='more'
                      id='long-button'
                      aria-haspopup='true'
                      onClick={event => {
                        event.stopPropagation()
                        handleClick(event, row)
                      }}
                    >
                      <Icon icon='iconamoon:menu-kebab-vertical-circle-light' width={27} height={27} />
                    </IconButton>
                    <CommonStyledMenu
                      anchorEl={anchorElMap[row.accountId]}
                      open={Boolean(anchorElMap[row.accountId])}
                      onClose={() => handleClose(row)}
                    >
                      {viewPermission && (
                        <MenuItem component={Link} scroll={true} href={`/accounting/accounts/view/${row.accountId}`}>
                          <Icon icon='tabler:eye' />
                          View
                        </MenuItem>
                      )}
                      {editPermission && (
                        <MenuItem component={Link} scroll={true} href={`/accounting/accounts/edit/${row.accountId}`}>
                          <Icon icon='tabler:edit' />
                          Edit
                        </MenuItem>
                      )}
                      {deletePermission && (
                        <>
                          <Divider sx={{ my: 1 }} />
                          <MenuItem
                            onClick={() => handleDelete(row)}
                            sx={{
                              color: theme => theme?.palette?.error?.main,
                              '&:hover': {
                                color: theme => theme?.palette?.error?.main + ' !important',
                                backgroundColor: theme =>
                                  alpha(theme.palette.error.main, theme.palette.action.selectedOpacity) + ' !important'
                              }
                            }}
                          >
                            <Icon icon='mingcute:delete-2-line' />
                            Delete
                          </MenuItem>
                        </>
                      )}
                    </CommonStyledMenu>
                  </>
                )}
              </Grid>
            </Grid>
          </Box>
        )
      }
    }
  ]

  return (
    <>
      <Grid container spacing={2} sx={{ justifyContent: 'space-between', mb: 3 }}>
        <Grid item xs={7} sm={4} md={4} lg={4} xl={4}>
          <CustomAutocomplete
            options={filteredAccounts.length > 0 || isFilterActive.filterActive ? filteredAccounts : financialAccounts}
            getOptionLabel={option => {
              if (!option) return ''
              return `${option.accountNumber} - ${option.accountName}`
            }}
            filterOptions={options => options}
            value={financialAccounts?.find(option => option.accountId === searchedAccount?.accountId) || null}
            onChange={(event, newValue) => {
              setFilteredAccounts(newValue ? [newValue] : temporaryFilterData)
              setSearchedAccount(newValue)
            }}
            onInputChange={(event, newValue) => {
              if (newValue && newValue.trim() !== '') {
                handleSearchChange(event, newValue)
              }
            }}
            disableClearable={false}
            renderInput={params => <CustomTextField {...params} fullWidth label='Accounts' />}
          />
        </Grid>
        <AccountingAccountFilter
          listData={financialAccounts}
          setFilteredData={setFilteredAccounts}
          isFilterActive={isFilterActive}
          setFilterActive={setFilterActive}
          setTemporaryFilterData={setTemporaryFilterData}
          setSearchedData={setSearchedAccount}
        />
      </Grid>
      {financialAccountloading ? (
        <LinearProgress />
      ) : (
        <MobileDataGrid
          rows={filteredAccounts.length > 0 || isFilterActive.filterActive ? filteredAccounts : financialAccounts}
          columns={mobileColumns}
          getRowId={row => row.accountId}
          initialState={{
            sorting: {
              sortModel: [{ field: 'accountNumber', sort: 'desc' }]
            }
          }}
          styles={{
            '& .MuiDataGrid-row:hover': {
              cursor: 'pointer'
            }
          }}
          onCellClick={(params, event) => {
            event.defaultMuiPrevented = false
          }}
          onRowClick={(params, event) => {
            if (event.target.closest('.MuiButton-root')) {
              event.defaultMuiPrevented = true
              return
            }
            dispatch(setSelectedFinancialAccounts(params.row))
            router.push(`/accounting/accounts/view/${params?.row?.accountId}`)
          }}
          slots={{
            columnHeaders: () => null,
            noRowsOverlay: CustomNoRowsOverlay
          }}
          slotProps={{
            noRowsOverlay: {
              mainText: 'Empty Accounts',
              subText: 'No account available here. Click "Add New" button above to get started.'
            }
          }}
        />
      )}

      {openDialog && (
        <DeleteFinancialAccount
          tenantId={tenantId}
          accountId={selecedAccounts?.accountId}
          openDialog={openDialog}
          setOpenDialog={setOpenDialog}
        />
      )}
    </>
  )
}

export default FinancialAccountsListTable
