import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Icon from 'src/@core/components/icon'

import useCurrencies from 'src/hooks/getData/useCurrencies'
import { useFinancialAccounts } from 'src/hooks/getData/useFinancialAccounts'
import useTaxAuthorities from 'src/hooks/getData/useTaxAuthorities'
import TaxStatementViewSection from './TaxStatementViewSection'
import { Alert, Dialog, DialogContent, DialogTitle, Typography } from '@mui/material'
import CustomCloseButton from 'src/common-components/CustomCloseButton'

export default function TaxStatementPopup({ statementId, open, onClose }) {
  const tenantId = useSelector(state => state.tenants?.selectedTenant?.tenantId) || ''

  const { currencies, loading: currencyLoading } = useCurrencies()
  const { taxAuthorities, taxAuthorityLoading } = useTaxAuthorities(tenantId)
  const { financialAccounts, financialAccountloading } = useFinancialAccounts(tenantId)

  //   const loading = currencyLoading || taxAuthorityLoading || financialAccountloading

  const [taxStatementData, setTaxStatementData] = useState({})

  useEffect(() => {
    setTaxStatementData({
      currencies: currencies,
      taxAuthorities: taxAuthorities,
      accounts: financialAccounts
    })
  }, [tenantId])

  return (
    <Dialog
      open={open}
      disableEscapeKeyDown
      // maxWidth={false}
      scroll='paper'
      aria-labelledby='alert-dialog-title'
      aria-describedby='alert-dialog-description'
      onClose={(event, reason) => {
        if (reason !== 'backdropClick') {
          onClose
        }
      }}
      sx={{
        '& .MuiDialog-paper': {
          overflow: 'visible',
          p: '20px 0px !important',
          maxWidth: '1150px',
          height: '100%',
          width: '100%',
          verticalAlign: 'top'
        }
      }}
    >
      <DialogTitle id='alert-dialog-title'>
        <Alert severity='info' sx={{ color: 'rgba(0,0,0,0.8)' }}>
          Tax Statement Details
        </Alert>{' '}
      </DialogTitle>
      <DialogContent sx={{ py: 8 }}>
        <CustomCloseButton onClick={onClose}>
          <Icon icon='tabler:x' fontSize='1.25rem' />
        </CustomCloseButton>
        {statementId !== null || statementId !== undefined ? (
          <TaxStatementViewSection taxStatementId={statementId} taxStatementData={taxStatementData} />
        ) : (
          <Typography variant='h4' textAlign={'center'}>
            This Tax Statement is not available.
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  )
}
