import { useState } from 'react'
import { alpha } from '@mui/material/styles'
import Icon from 'src/@core/components/icon'
import { useDispatch } from 'react-redux'
import { setActionSalesOrder } from 'src/store/apps/sales'
import { Box, IconButton, MenuItem, Typography, Grid, LinearProgress } from '@mui/material'
import CustomNoRowsOverlay from 'src/common-components/CustomNoRowsOverlay'
import {
  DateFunction,
  NumberFormat,
  rowStatusChip,
  dataTitleStyles,
  dataTextStyles
} from 'src/common-functions/utils/UtilityFunctions'
import CommonStyledMenu from 'src/common-components/CommonStyledMenu'
import CommonCustomerPopup from 'src/common-components/CommonCustomerPopup'
import MobileDataGrid from 'src/common-components/MobileDataGrid'
import StyledButton from 'src/common-components/StyledMuiButton'

const UnifiedSalesdataList = ({ tenantId, salesOrdersObject, loading }) => {
  const dispatch = useDispatch()

  const { currencies = [], customers = [] } = salesOrdersObject || {}

  const [anchorElMap, setAnchorElMap] = useState({})
  const [customerDialogState, setCustomerDialogState] = useState({
    open: false,
    selectedCustomerId: null
  })

  const handleClick = (event, row) => {
    dispatch(setActionSalesOrder(row))
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row?.orderId] = event.currentTarget
    setAnchorElMap(updatedAnchorElMap)
  }

  const handleClose = row => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[row?.orderId] = null
    setAnchorElMap(updatedAnchorElMap)
  }

  const rows = [
    {
      schemaVersion: '1.0',
      tenantId: '660e4b3f48ccd2440d08c681',
      orderId: '68664b811d27a1ad99e573fe',
      orderNo: '11062',
      orderNoPrefix: 'SO-',
      salesInvoiceId: null,
      tradingId: null,
      customerId: '67daab266848da299aade07d',
      salesQuotationId: null,
      salesQuotationNoPrefix: '',
      salesQuotationNo: '',
      reference: '',
      orderDate: '2025-07-03T00:00:00.000Z',
      dueDate: '2025-07-03T00:00:00.000Z',
      expectedDeliveryDate: '2025-07-03T00:00:00.000Z',
      expectedPackingDate: '2025-07-03T00:00:00.000Z',
      deliveryDate: '2025-07-03T00:00:00.000Z',
      paymentTerms: 'Due On Receipt',
      shippingPreference: null,
      status: 'DRAFT',
      currency: 'AUD',
      billingAddress: {
        addressLine1: '',
        addressLine2: '',
        cityOrTown: '',
        state: 'Victoria',
        postcode: '',
        country: 'Australia'
      },
      deliveryAddress: {
        addressLine1: '',
        addressLine2: '',
        cityOrTown: '',
        state: '',
        postcode: '',
        country: 'Australia'
      },
      deliveredBy: '',
      assignedTo: null,
      customerNotes: 'Please pay to bank account\n\nBSB: 110 110\nAccount: 112121212121\n\nThanks \n\nawait ',
      notes: '',
      termsAndConditions: '2nd  from sales order',
      discountType: 'PERCENTAGE',
      discountValue: 0,
      deliveryStatus: null,
      totalQty: 4,
      subtotal: 80,
      totalDiscount: 0,
      totalTax: 8,
      totalOtherCharges: 0,
      totalOtherChargesTax: 0,
      totalAmount: 88,
      depositAmount: 88,
      balance: null,
      orderItems: [
        {
          lineItemId: '68664b6273252e6a1eb7b401',
          itemId: '674d90da43a4633e65b46035',
          itemName: 'Test Product',
          itemCodePrefix: 'SKU-',
          itemCode: '10089',
          itemGroup: 'product',
          itemDescription: '',
          itemDimension: {
            length: 1,
            width: 4,
            height: 1,
            qty: 1
          },
          packingUnit: {
            unit: '',
            description: '',
            qtyPerUnit: 1,
            qty: 0
          },
          qty: 4,
          uom: 'm2',
          originalPrice: 20,
          taxFree: false,
          taxInclusive: false,
          sellingPrice: 20,
          discountPerUnit: 0,
          taxes: [
            {
              taxId: 'GST',
              taxType: 'GST',
              taxName: 'GST',
              taxRate: 10,
              taxAuthorityId: '674d8905e3d6b9643cafcd6d',
              taxValuePerUnit: 2,
              taxValue: 8,
              taxValueCurrency: 'AUD'
            }
          ],
          subtotal: 80,
          totalDiscount: 0,
          totalTax: 8,
          totalNetAmount: 88,
          warehouseId: '660e5ba2e20a5d134c792fab',
          serviceDate: null,
          totalPackedQty: null
        }
      ],
      taxes: [
        {
          taxId: 'GST',
          taxType: 'GST',
          taxName: 'GST',
          taxRate: 10,
          taxAuthorityId: '674d8905e3d6b9643cafcd6d',
          taxValue: 8,
          taxValueCurrency: 'AUD'
        }
      ],
      otherCharges: [
        {
          chargeId: 'CUSTOMER_SHIPPING_CHARGES',
          chargeType: 'CUSTOMER_SHIPPING_CHARGES',
          chargeName: 'Shipping Charges',
          chargedAmount: 0,
          chargedAmountCurrency: 'AUD',
          totalChargeValue: 0,
          includingTax: true,
          taxes: [
            {
              taxId: 'GST',
              taxType: 'GST',
              taxName: 'GST',
              taxRate: 10,
              taxAuthorityId: '674d8905e3d6b9643cafcd6d',
              taxValue: 0,
              taxValueCurrency: 'AUD'
            }
          ]
        },
        {
          chargeId: 'OTHER_CHARGES',
          chargeType: 'OTHER_CHARGES',
          chargeName: 'Other Charges',
          chargedAmount: 0,
          chargedAmountCurrency: 'AUD',
          totalChargeValue: 0,
          includingTax: true,
          taxes: [
            {
              taxId: 'GST',
              taxType: 'GST',
              taxName: 'GST',
              taxRate: 10,
              taxAuthorityId: '674d8905e3d6b9643cafcd6d',
              taxValue: 0,
              taxValueCurrency: 'AUD'
            }
          ]
        }
      ],
      files: [
        {
          fileName: 'image (2).png',
          key: 'salesOrderPdf/rfvFjO9bGf.png'
        },
        {
          fileName: 'Warehouse-po.pdf',
          key: 'salesOrderPdf/lPdZ8P3jkA.pdf'
        }
      ],
      paymentId: null,
      paymentNoPrefix: 'PMT-',
      paymentNo: 10052,
      paymentMethod: '674d8fd34fbfd5edef39ca70',
      paymentReference: '',
      paymentDate: '2025-07-03T00:00:00.000Z',
      paymentStatus: 'PENDING',
      createdDateTime: '2025-07-03T09:21:05.020Z',
      createdBy: null,
      modifiedDateTime: '2025-07-03T11:35:05.442Z',
      modifiedBy: null,
      deletedDateTime: null,
      deletedBy: null
    }
  ]

  const columns = [
    {
      field: 'orderNo',
      headerName: '',
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => {
        const customer = customers?.find(item => item?.customerId == row?.customerId) || {}
        const currency = currencies?.find(item => item?.currencyId === row?.currency)
        return (
          <Box sx={{ width: '100%', p: 2 }}>
            <Grid container spacing={3} sx={{ alignItems: { xs: 'flex-start', md: 'center' } }}>
              <Grid item xs={11}>
                <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                  <Grid item xs={12} sm={12} md={4} lg={4} xl={4} sx={{ pl: 3 }}>
                    {customer?.customerName && (
                      <StyledButton
                        color='primary'
                        onClick={event => {
                          event.stopPropagation()
                          setCustomerDialogState({ open: true, selectedCustomerId: customer?.customerId })
                        }}
                      >
                        {customer?.customerName}
                      </StyledButton>
                    )}
                    <Typography sx={dataTitleStyles}>Customer</Typography>
                  </Grid>
                  <Grid item xs={6} sm={2.4} md={2} lg={2} xl={2}>
                    <Typography sx={dataTextStyles}>
                      <span> {DateFunction(row?.orderDate) || '-'}</span>
                    </Typography>{' '}
                    <Typography sx={dataTitleStyles}>Date</Typography>
                  </Grid>
                  <Grid item xs={6} sm={2.4} md={2} lg={2} xl={2}>
                    <Typography sx={dataTextStyles}>
                      #{row?.orderNoPrefix}
                      {row?.orderNo}
                    </Typography>
                    <Typography sx={dataTextStyles}>Status: {rowStatusChip(row?.status) || '-'}</Typography>

                    <Typography sx={dataTitleStyles}>Order Data</Typography>
                  </Grid>
                  <Grid item xs={6} sm={2.4} md={2} lg={2} xl={2}>
                    <Typography sx={dataTextStyles}>
                      #{row?.paymentNoPrefix}
                      {row?.paymentNo}
                    </Typography>
                    <Typography sx={dataTextStyles}>
                      Payment Status: {rowStatusChip(row?.paymentStatus) || '-'}
                    </Typography>
                    <Typography sx={dataTitleStyles}>Payment Data</Typography>
                  </Grid>
                  <Grid item xs={6} sm={2.4} md={2} lg={2} xl={2}>
                    <Typography sx={dataTextStyles}>
                      <NumberFormat value={row.totalAmount} currency={currency} />
                    </Typography>
                    <Typography sx={{ ...dataTitleStyles, display: { xs: 'block', md: 'none' } }}>Total</Typography>
                    <Typography sx={{ ...dataTitleStyles, display: { xs: 'none', md: 'block' } }}>
                      Total Amount
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={1}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
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
                    anchorEl={anchorElMap[row.orderId]}
                    open={Boolean(anchorElMap[row.orderId])}
                    onClose={() => handleClose(row)}
                  >
                    <MenuItem>
                      <Icon icon={'iconamoon:invoice-light'} />
                      Issue Tax Invoice
                    </MenuItem>

                    <MenuItem>
                      <Icon icon={'ph:package'} />
                      Create Package
                    </MenuItem>

                    <MenuItem>
                      <Icon icon={'iconamoon:do-undo-light'} />
                      Undo TaxInvoice
                    </MenuItem>

                    <MenuItem>
                      <Icon icon={'iconamoon:do-undo-light'} />
                      Undo Confirmation
                    </MenuItem>

                    <MenuItem>
                      <Icon icon={'iconoir:send'} />
                      Send Invoice
                    </MenuItem>

                    <MenuItem>
                      <Icon icon={'ion:print-outline'} />
                      Print Invoice
                    </MenuItem>
                    <MenuItem
                      sx={{
                        color: theme => theme?.palette?.success?.main,
                        '&:hover': {
                          color: theme => theme?.palette?.success?.main + ' !important',
                          backgroundColor: theme =>
                            alpha(theme.palette.success.main, theme.palette.action.selectedOpacity) + ' !important'
                        }
                      }}
                    >
                      <Icon icon='material-symbols:done' />
                      Clear Payment
                    </MenuItem>

                    <MenuItem
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
                </Box>
              </Grid>
            </Grid>
          </Box>
        )
      }
    }
  ]

  return (
    <>
      {loading ? (
        <LinearProgress />
      ) : (
        <MobileDataGrid
          rows={rows}
          columns={columns}
          getRowId={row => row?.orderId}
          slots={{
            columnHeaders: () => null,
            noRowsOverlay: CustomNoRowsOverlay
          }}
          slotProps={{
            noRowsOverlay: {
              mainText: 'No data available'
            }
          }}
        />
      )}

      {customerDialogState?.open && (
        <CommonCustomerPopup
          customerId={customerDialogState?.selectedCustomerId}
          open={customerDialogState?.open}
          setOpen={() => setCustomerDialogState({ open: false, selectedCustomerId: null })}
        />
      )}
    </>
  )
}

export default UnifiedSalesdataList
