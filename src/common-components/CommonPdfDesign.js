import {
  Box,
  Card,
  Grid,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { NumericFormat } from 'react-number-format'
import PerfectScrollbarComponent from 'react-perfect-scrollbar'
import { formatPhoneNumberIntl } from 'react-phone-number-input'
import { useSelector } from 'react-redux'
import { DateFunction } from 'src/common-functions/utils/UtilityFunctions'
import useTradings from 'src/hooks/getData/useTradings'
import useIsDesktop from 'src/hooks/IsDesktop'
import CommonItemPopup from './CommonItemPopup'
import LogoBox from './LogoBox'
import StyledButton from './StyledMuiButton'

export const CompanyData = ({ data }) => {
  const isDesktop = useIsDesktop()

  const selectedTenant = useSelector(state => state.tenants?.selectedTenant) || ''
  const { tenantId = '' } = selectedTenant
  const { fetchSingleTrading } = useTradings(tenantId)
  const [trading, setTrading] = useState({})

  useEffect(() => {
    const callFetchQuery = async () => {
      const trading = await fetchSingleTrading(data?.tradingId)
      if (trading) {
        setTrading(trading)
      }
    }
    callFetchQuery()
  }, [data, tenantId, fetchSingleTrading])

  const isTradingProfile = useMemo(() => Object.keys(trading).length >= 1, [trading])
  const tenant = {
    ...selectedTenant,
    businessName: isTradingProfile ? trading?.businessName : selectedTenant?.businessName,
    attributes: isTradingProfile ? trading?.attributes : selectedTenant?.attributes,
    mobile: isTradingProfile ? trading?.mobile : selectedTenant?.mobile,
    emailAddress: isTradingProfile ? trading?.emailAddress : selectedTenant?.emailAddress,
    billingAddress: isTradingProfile ? trading?.address : selectedTenant?.billingAddress
  }

  return (
    <>
      <Typography
        sx={{
          fontSize: '15px',
          color: '#000',
          fontWeight: 500,
          wordBreak: 'break-all',
          lineHeight: '26px'
        }}
      >
        {tenant?.businessName}
      </Typography>
      {isDesktop
        ? tenant?.attributes?.map((attribute, index) => {
            let key = attribute?.key
            if ((key || '')?.toLowerCase()?.trim() === 'abn') {
              return (
                <Typography
                  sx={{
                    fontSize: '11px',
                    color: '#818181',
                    wordBreak: 'break-all',
                    lineHeight: '21px'
                  }}
                  key={index}
                >
                  <span style={{ fontWeight: 500 }}>ABN:</span> {attribute?.value}
                </Typography>
              )
            }
            return null
          })
        : null}
      {isDesktop ? (
        <>
          <Typography
            sx={{
              fontSize: '11px',
              color: '#818181',
              wordBreak: 'break-all',
              lineHeight: '21px'
            }}
          >
            {tenant?.billingAddress?.addressLine1}
            {tenant?.billingAddress?.addressLine2 && `${', ' + tenant?.billingAddress?.addressLine2}`}
          </Typography>
          <Typography
            sx={{
              fontSize: '11px',
              color: '#818181',
              wordBreak: 'break-all',
              lineHeight: '21px'
            }}
          >
            {tenant?.billingAddress?.cityOrTown},{tenant?.billingAddress?.state},
          </Typography>
          <Typography
            sx={{
              fontSize: '11px',
              color: '#818181',
              wordBreak: 'break-all',
              lineHeight: '21px'
            }}
          >
            {tenant?.billingAddress?.postcode}, {tenant?.billingAddress?.country}
          </Typography>
        </>
      ) : null}
      {isDesktop ? (
        <Typography
          sx={{
            fontSize: '11px',
            color: '#818181',
            wordBreak: 'break-all',
            lineHeight: '21px'
          }}
        >
          {tenant?.emailAddress}
        </Typography>
      ) : null}
      {isDesktop ? (
        <Typography
          sx={{
            fontSize: '11px',
            color: '#818181',
            wordBreak: 'break-all',
            lineHeight: '21px'
          }}
        >
          {formatPhoneNumberIntl(`+${tenant?.mobile}`)}
        </Typography>
      ) : null}
      {isDesktop
        ? tenant?.attributes?.map((attribute, index) => {
            let key = attribute?.key
            if ((key || '')?.toLowerCase()?.trim() === 'website') {
              return (
                <Typography
                  sx={{
                    fontSize: '11px',
                    color: '#818181',
                    wordBreak: 'break-all',
                    lineHeight: '21px'
                  }}
                  key={index}
                >
                  {attribute?.value}
                </Typography>
              )
            }
            return null
          })
        : null}
    </>
  )
}

export const PrintCompanyData = ({ data }) => {
  const selectedTenant = useSelector(state => state.tenants?.selectedTenant) || ''
  const { tenantId = '' } = selectedTenant
  const { fetchSingleTrading } = useTradings(tenantId)
  const [trading, setTrading] = useState({})

  useEffect(() => {
    const callFetchQuery = async () => {
      const trading = await fetchSingleTrading(data?.tradingId)
      if (trading) {
        setTrading(trading)
      }
    }
    callFetchQuery()
  }, [data, tenantId, fetchSingleTrading])

  const isTradingProfile = useMemo(() => Object.keys(trading).length >= 1, [trading])

  const tenant = {
    ...selectedTenant,
    businessName: isTradingProfile ? trading?.businessName : selectedTenant?.businessName,
    attributes: isTradingProfile ? trading?.attributes : selectedTenant?.attributes,
    mobile: isTradingProfile ? trading?.mobile : selectedTenant?.mobile,
    emailAddress: isTradingProfile ? trading?.emailAddress : selectedTenant?.emailAddress,
    billingAddress: isTradingProfile ? trading?.address : selectedTenant?.billingAddress
  }

  return (
    <>
      <Typography
        sx={{
          fontSize: '15px',
          color: '#000',
          fontWeight: 500,
          wordBreak: 'break-all',
          lineHeight: '26px'
        }}
      >
        {tenant?.businessName}
      </Typography>
      {tenant?.attributes?.map((attribute, index) => {
        let key = attribute?.key
        if ((key || '')?.toLowerCase()?.trim() === 'abn') {
          return (
            <Typography
              sx={{
                fontSize: '11px',
                color: '#818181',
                wordBreak: 'break-all',
                lineHeight: '21px'
              }}
              key={index}
            >
              <span style={{ fontWeight: 500 }}>ABN:</span> {attribute?.value}
            </Typography>
          )
        }
        return null
      })}

      <Typography
        sx={{
          fontSize: '11px',
          color: '#818181',
          wordBreak: 'break-all',
          lineHeight: '21px'
        }}
      >
        {tenant?.billingAddress?.addressLine1}
        {tenant?.billingAddress?.addressLine2 && `${', ' + tenant?.billingAddress?.addressLine2}`}
      </Typography>
      <Typography
        sx={{
          fontSize: '11px',
          color: '#818181',
          wordBreak: 'break-all',
          lineHeight: '21px'
        }}
      >
        {tenant?.billingAddress?.cityOrTown},{tenant?.billingAddress?.state},
      </Typography>
      <Typography
        sx={{
          fontSize: '11px',
          color: '#818181',
          wordBreak: 'break-all',
          lineHeight: '21px'
        }}
      >
        {tenant?.billingAddress?.postcode}, {tenant?.billingAddress?.country}
      </Typography>

      <Typography
        sx={{
          fontSize: '11px',
          color: '#818181',
          wordBreak: 'break-all',
          lineHeight: '21px'
        }}
      >
        {tenant?.emailAddress}
      </Typography>

      <Typography
        sx={{
          fontSize: '11px',
          color: '#818181',
          wordBreak: 'break-all',
          lineHeight: '21px'
        }}
      >
        {formatPhoneNumberIntl(`+${tenant?.mobile}`)}
      </Typography>

      {tenant?.attributes?.map((attribute, index) => {
        let key = attribute?.key
        if ((key || '')?.toLowerCase()?.trim() === 'website') {
          return (
            <Typography
              sx={{
                fontSize: '11px',
                color: '#818181',
                wordBreak: 'break-all',
                lineHeight: '21px'
              }}
              key={index}
            >
              {attribute?.value}
            </Typography>
          )
        }
        return null
      })}
    </>
  )
}
export const ShowAddress = ({ data }) => {
  return (
    <>
      <TableRow>
        <TableCell>
          {(data?.addressLine1 || data?.addressLine2) && (
            <Typography className='data-name'>
              {data?.addressLine1}
              {data?.addressLine2 && `, ${data.addressLine2}`}
            </Typography>
          )}

          {(data?.cityOrTown || data?.state) && (
            <Typography className='data-name'>
              {data?.cityOrTown}
              {data?.cityOrTown && data?.state && `, `}
              {data?.state}
            </Typography>
          )}

          {(data?.postcode || data?.country) && (
            <Typography className='data-name'>
              {data?.postcode}
              {data?.postcode && data?.country && `, `}
              {data?.country}
            </Typography>
          )}
        </TableCell>
      </TableRow>
    </>
  )
}

export const CommonAddress = ({ data }) => {
  return (
    <>
      {/* <ShowAddress data={data?.billingAddress} /> */}
      <TableRow>
        <TableCell>
          <Typography className='data-name'>
            {/* <a href={'mailto:'} style={{ color: 'inherit', textDecoration: 'none', wordBreak: 'break-all' }}> */}{' '}
            {data?.emailAddress}
            {/* </a>{' '} */}
          </Typography>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell>
          <Typography className='data-name'>{formatPhoneNumberIntl(`+${data?.mobile}`)}</Typography>
        </TableCell>
      </TableRow>
    </>
  )
}

export const RendorDimensions = ({ orderItem }) => {
  const products = useSelector(state => state.products?.data || [])

  const item = products?.find(item => item?.itemId === orderItem?.itemId)
  return (
    <>
      {item?.enablePackingUnit ? (
        <>
          {orderItem?.packingUnit?.qtyPerUnit}{' '}
          <span style={{ fontSize: '11px' }}>
            {' '}
            ({orderItem?.uom}/{orderItem?.packingUnit?.unit})
          </span>
          <br />
          <span>Qty: {orderItem?.packingUnit?.qty}</span>
        </>
      ) : item?.enableDimension ? (
        <>
          {item?.dimensions?.length !== null && orderItem?.itemDimension?.length}{' '}
          {item?.dimensions?.width !== null && (
            <>
              <span style={{ color: '#818181' }}>×</span>
              {orderItem?.itemDimension?.width}
            </>
          )}
          {item?.dimensions?.height !== null && (
            <>
              <span style={{ color: '#818181' }}>×</span>
              {orderItem?.itemDimension?.height}
            </>
          )}
          <br />
          <span>Qty: {orderItem?.itemDimension?.qty}</span>
        </>
      ) : (
        <>
          {orderItem?.uom === 'm2' && (
            <>
              {orderItem?.itemDimension?.length} <span style={{ color: '#818181' }}>×</span>{' '}
              {orderItem?.itemDimension?.width}
              <br /> <span>Qty: {orderItem?.itemDimension?.qty}</span>
            </>
          )}
          {orderItem?.uom === 'm3' && (
            <>
              {orderItem?.itemDimension?.length} <span style={{ color: '#818181' }}>×</span>{' '}
              {orderItem?.itemDimension?.width} <span style={{ color: '#818181' }}>×</span>{' '}
              {orderItem?.itemDimension?.height} <br />
              <span>Qty: {orderItem?.itemDimension?.qty}</span>
            </>
          )}
          {orderItem?.uom !== 'm2' && orderItem?.uom !== 'm3' && <> Qty: {orderItem?.itemDimension?.qty} </>}
        </>
      )}
    </>
  )
}

export const RendorItemData = ({ index, orderItem, currency, showData }) => {
  const isDesktop = useIsDesktop()
  const [openDialog, setOpenDialog] = useState({})
  const products = useSelector(state => state?.products?.data) || []

  const item = products?.find(item => item?.itemId === orderItem?.itemId) || {}
  const handleOpenDialoge = index => {
    setOpenDialog(prevOpen => ({
      ...prevOpen,
      [index]: !prevOpen[index]
    }))
  }
  return (
    <>
      <StyledButton color='primary' onClick={() => handleOpenDialoge(index)}>
        {orderItem?.itemCode}
      </StyledButton>

      <Typography variant='h6' sx={{ fontSize: '12px', fontWeight: 500, lineHeight: '20px' }}>
        {orderItem?.itemName}
      </Typography>

      <Typography
        sx={{
          fontSize: '11px',
          fontWeight: 400,
          lineHeight: '14px',
          color: '#667380'
        }}
      >
        {orderItem?.itemDescription}
      </Typography>
      {!isDesktop && showData ? (
        <Typography
          variant='h6'
          sx={{
            fontSize: '11px',
            fontWeight: 500,
            lineHeight: '20px',
            color: '#667380'
          }}
        >
          Price -
          <NumericFormat
            value={(orderItem?.purchasePrice || 0).toFixed(2)}
            thousandSeparator=','
            displayType={'text'}
            prefix={currency?.displayAlignment === 'left' ? `${currency?.symbol}${' '}` : ''}
            suffix={currency?.displayAlignment === 'right' ? `${' '}${currency?.symbol}` : ''}
          />
        </Typography>
      ) : null}

      {openDialog[index] ? (
        <CommonItemPopup openDialog={openDialog[index]} setOpenDialog={setOpenDialog} itemId={orderItem?.itemId} />
      ) : null}
    </>
  )
}

export const RendorSalesItemData = ({ index, orderItem, currency, showData }) => {
  const isDesktop = useIsDesktop()
  const [openDialog, setOpenDialog] = useState({})

  const handleOpenDialoge = index => {
    setOpenDialog(prevOpen => ({
      ...prevOpen,
      [index]: !prevOpen[index]
    }))
  }
  return (
    <>
      <StyledButton color='primary' onClick={() => handleOpenDialoge(index)}>
        {' '}
        {orderItem?.itemCodePrefix}
        {orderItem?.itemCode}
      </StyledButton>

      <Typography variant='h6' sx={{ fontSize: '12px', fontWeight: 500, lineHeight: '20px' }}>
        {orderItem?.itemName}{' '}
      </Typography>

      <Typography
        sx={{
          fontSize: '11px',
          fontWeight: 400,
          lineHeight: '14px',
          color: '#667380',
          wordBreak: 'break-word',
          overflowWrap: 'break-word'
        }}
      >
        {orderItem?.itemDescription}
      </Typography>
      {!isDesktop && showData ? (
        <>
          <Typography
            variant='h6'
            sx={{
              fontSize: '11px',
              fontWeight: 500,
              lineHeight: '20px',
              color: '#667380'
            }}
          >
            Rate -
            <NumericFormat
              value={orderItem?.sellingPrice}
              thousandSeparator=','
              displayType={'text'}
              prefix={currency?.displayAlignment === 'left' ? `${currency?.symbol}${' '}` : ''}
              suffix={currency?.displayAlignment === 'right' ? `${' '}${currency?.symbol}` : ''}
            />{' '}
          </Typography>
        </>
      ) : null}

      {openDialog[index] ? (
        <CommonItemPopup openDialog={openDialog[index]} setOpenDialog={setOpenDialog} itemId={orderItem?.itemId} />
      ) : null}
    </>
  )
}

export const RendorPackageItemData = ({ index, orderItem, currency, showData }) => {
  const isDesktop = useIsDesktop()
  const [openDialog, setOpenDialog] = useState({})
  const products = useSelector(state => state?.products?.data) || []

  const item = products?.find(item => item?.itemId === orderItem?.itemId) || {}
  const handleOpenDialoge = index => {
    setOpenDialog(prevOpen => ({
      ...prevOpen,
      [index]: !prevOpen[index]
    }))
  }
  return (
    <>
      <TableCell>
        <StyledButton color='primary' onClick={() => handleOpenDialoge(index)}>
          {orderItem?.itemCode}
        </StyledButton>

        <Typography variant='h6' sx={{ fontSize: '12px', fontWeight: 500, lineHeight: '20px' }}>
          {orderItem?.itemName}
        </Typography>

        <Typography
          sx={{
            fontSize: '11px',
            fontWeight: 400,
            lineHeight: '14px',
            color: '#667380'
          }}
        >
          {orderItem?.itemDescription}
        </Typography>
        {!isDesktop && showData ? (
          <Typography
            variant='h6'
            sx={{
              fontSize: '11px',
              fontWeight: 500,
              lineHeight: '20px',
              color: '#667380'
            }}
          >
            Price -
            <NumericFormat
              value={(orderItem?.purchasePrice || 0).toFixed(2)}
              thousandSeparator=','
              displayType={'text'}
              prefix={currency?.displayAlignment === 'left' ? `${currency?.symbol}${' '}` : ''}
              suffix={currency?.displayAlignment === 'right' ? `${' '}${currency?.symbol}` : ''}
            />
          </Typography>
        ) : null}

        <Typography
          sx={{
            fontSize: '11px',
            fontWeight: 400,
            lineHeight: '20px',
            color: '#667380',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            alignItems: 'center'
          }}
        >
          {item?.enablePackingUnit ? (
            <>
              <div>
                {orderItem?.packingUnit?.qtyPerUnit}{' '}
                <span style={{ fontSize: '11px' }}>
                  {' '}
                  ({orderItem?.packedQtyUom}/{orderItem?.packingUnit?.unit})
                </span>
              </div>
              <span style={{ display: 'block', textAlign: 'center' }}>Qty: {orderItem?.packingUnit?.qty}</span>
            </>
          ) : item?.enableDimension ? (
            <>
              {item?.dimensions?.length !== null && orderItem?.itemDimension?.length}{' '}
              {item?.dimensions?.width !== null && (
                <>
                  <span style={{ color: '#818181' }}>×</span>
                  {orderItem?.itemDimension?.width}
                </>
              )}
              {item?.dimensions?.height !== null && (
                <>
                  <span style={{ color: '#818181' }}>×</span>
                  {orderItem?.itemDimension?.height}
                </>
              )}
              <span style={{ display: 'block', textAlign: 'center' }}>Qty: {orderItem?.itemDimension?.qty}</span>
            </>
          ) : (
            <>
              {orderItem?.packedQtyUom === 'm2' && (
                <>
                  {orderItem?.itemDimension?.length} <span style={{ color: '#818181' }}>×</span>{' '}
                  {orderItem?.itemDimension?.width}{' '}
                  <span style={{ display: 'block', textAlign: 'center' }}>Qty: {orderItem?.itemDimension?.qty}</span>
                </>
              )}
              {orderItem?.packedQtyUom === 'm3' && (
                <>
                  {orderItem?.itemDimension?.length} <span style={{ color: '#818181' }}>×</span>{' '}
                  {orderItem?.itemDimension?.width} <span style={{ color: '#818181' }}>×</span>{' '}
                  {orderItem?.itemDimension?.height}
                  <span style={{ display: 'block', textAlign: 'center' }}>Qty: {orderItem?.itemDimension?.qty}</span>
                </>
              )}
              {orderItem?.packedQtyUom !== 'm2' && orderItem?.packedQtyUom !== 'm3' && (
                <> Qty: {orderItem?.itemDimension?.qty} </>
              )}
            </>
          )}
        </Typography>

        {openDialog[index] ? (
          <CommonItemPopup openDialog={openDialog[index]} setOpenDialog={setOpenDialog} itemId={orderItem?.itemId} />
        ) : null}
      </TableCell>
    </>
  )
}

export const RendorPrintSalesItemData = ({ index, orderItem }) => {
  const [openDialog, setOpenDialog] = useState({})
  const products = useSelector(state => state?.products?.data) || []

  const item = products?.find(item => item?.itemId === orderItem?.itemId) || {}

  const handleOpenDialoge = index => {
    setOpenDialog(prevOpen => ({
      ...prevOpen,
      [index]: !prevOpen[index]
    }))
  }
  return (
    <>
      <Typography variant='h6' sx={{ fontSize: '12px', fontWeight: 500, lineHeight: '20px' }}>
        {orderItem?.itemName}{' '}
      </Typography>
      {/* <RendorDimensions orderItem={orderItem} /> */}

      <Typography
        sx={{
          fontSize: '11px',
          fontWeight: 400,
          lineHeight: '14px',
          color: '#667380'
        }}
      >
        {orderItem?.itemDescription}
      </Typography>
      <StyledButton color='primary' onClick={() => handleOpenDialoge(index)}>
        {orderItem?.itemCodePrefix}
        {orderItem?.itemCode}
      </StyledButton>

      <Typography
        sx={{
          fontSize: '12px',
          fontWeight: 400,
          lineHeight: '20px',
          color: '#667380',
          textAlign: 'left'
        }}
      >
        {item?.enablePackingUnit ? (
          <>
            {/* <div>{orderItem?.packingUnit?.unit}</div>({orderItem?.packingUnit?.qty}{' '}
            <span style={{ color: '#818181' }}>×</span> {orderItem?.packingUnit?.qtyPerUnit}) */}
            {orderItem?.packingUnit?.qtyPerUnit}{' '}
            <span style={{ fontSize: '11px' }}>
              {' '}
              ({orderItem?.uom}/{orderItem?.packingUnit?.unit})
            </span>
            <span>(Qty: {orderItem?.packingUnit?.qty})</span>
          </>
        ) : item?.enableDimension ? (
          <>
            {item?.dimensions?.length !== null && orderItem?.itemDimension?.length}{' '}
            {item?.dimensions?.width !== null && (
              <>
                <span style={{ color: '#818181' }}>×</span>
                {orderItem?.itemDimension?.width}
              </>
            )}
            {item?.dimensions?.height !== null && (
              <>
                <span style={{ color: '#818181' }}>×</span>
                {orderItem?.itemDimension?.height}
              </>
            )}
            <span>(Qty: {orderItem?.itemDimension?.qty})</span>
          </>
        ) : (
          <>
            {orderItem?.uom === 'm2' && (
              <>
                {orderItem?.itemDimension?.length} <span style={{ color: '#818181' }}>×</span>{' '}
                {orderItem?.itemDimension?.width} <span>(Qty: {orderItem?.itemDimension?.qty})</span>
              </>
            )}
            {orderItem?.uom === 'm3' && (
              <>
                {orderItem?.itemDimension?.length} <span style={{ color: '#818181' }}>×</span>{' '}
                {orderItem?.itemDimension?.width} <span style={{ color: '#818181' }}>×</span>{' '}
                {orderItem?.itemDimension?.height}
                <span>(Qty: {orderItem?.itemDimension?.qty})</span>
              </>
            )}
            {orderItem?.uom !== 'm2' && orderItem?.uom !== 'm3' && <> Qty: {orderItem?.itemDimension?.qty} </>}
          </>
        )}
      </Typography>
      <Typography sx={{ fontSize: '12px', lineHeight: '20px' }}>
        {orderItem?.serviceDate && `Service Date: ${DateFunction(orderItem?.serviceDate)}`}
      </Typography>

      {openDialog[index] ? (
        <CommonItemPopup openDialog={openDialog[index]} setOpenDialog={setOpenDialog} itemId={orderItem?.itemId} />
      ) : null}
    </>
  )
}

export const RendorPrintItemData = ({ orderItem }) => {
  return (
    <>
      <Typography variant='h6' sx={{ fontSize: '12px', fontWeight: 500, lineHeight: '20px' }}>
        {orderItem?.itemName}{' '}
      </Typography>
      <Typography
        sx={{
          fontSize: '12px',
          fontWeight: 500,
          color: '#667380'
        }}
      >
        {orderItem?.itemCodePrefix}
        {orderItem?.itemCode}
      </Typography>
      <Typography
        sx={{
          fontSize: '11px',
          fontWeight: 400,
          lineHeight: '14px',
          color: '#667380'
        }}
      >
        {orderItem?.itemDescription}
      </Typography>
    </>
  )
}

const PerfectScrollbar = styled(PerfectScrollbarComponent)({
  maxHeight: '70vh'
})

export const ViewDataList = ({ children }) => {
  return (
    <>
      <Grid item xs={0} sm={0} md={4} lg={4} xl={3} sx={{ display: { xs: 'none', md: 'block' } }}>
        {/* <TableContainer sx={{ maxHeight: '70vh', overflowY: 'auto' }}> */}
        <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>
          <Table
            stickyHeader={true}
            sx={{
              width: '100%',
              '& .MuiTableHead-root': {
                background: '#F4F6F8'
              },
              '& .MuiTableRow-root': {
                cursor: 'pointer'
              },
              '& .MuiTableRow-root:hover': {
                background: 'rgba(0,0,0,0.04)'
              },
              '& .MuiTableCell-root': {
                padding: '12px 10px !important',
                borderBottom: '1px dashed #EBEBEB',
                textAlign: 'left !important'
              }
            }}
          >
            {children}
          </Table>{' '}
        </PerfectScrollbar>
      </Grid>
    </>
  )
}

export const ViewItemsTableWrapper = ({ children }) => {
  return (
    <TableContainer>
      <Table
        stickyHeader={true}
        sx={{
          minWidth: 300,
          width: '100%',

          '& .MuiTableHead-root': {
            background: '#F4F6F8'
          },
          '& .MuiTableCell-root': {
            padding: '10px 6px',
            borderBottom: '1px dashed #EBEBEB',
            textAlign: 'right',
            fontSize: '12px'
          },
          '& .MuiTableCell-body': {
            padding: '6px !important'
          },

          '& .MuiTableCell-head': {
            textTransform: 'capitalize',
            fontWeight: 500,
            color: '#667380'
          },
          '& .MuiTableCell-footer': {
            padding: '8px 10px !important'
          },
          '& .MuiTableCell-root:nth-of-type(1),& .MuiTableCell-root:nth-of-type(2)': {
            textAlign: 'left'
          },
          '& .MuiTableCell-root:nth-of-type(3)': {
            textAlign: 'center'
          },
          '& .MuiTableCell-root:first-of-type': {
            pl: '6px !important'
          },
          '& .MuiTableCell-root:last-of-type': {
            pr: '6px !important'
          }
        }}
      >
        {children}
      </Table>
    </TableContainer>
  )
}
export const PrintViewItemsTableWrapper = ({ children }) => {
  return (
    <>
      <TableContainer>
        <Table
          sx={{
            width: '100%',
            '& .MuiTableHead-root': {
              backgroundColor: '#FFF',
              borderTop: '1px solid #000',
              borderBottom: '1px solid #000'
            },
            '& .MuiTableCell-root': {
              padding: '10px 6px',
              borderBottom: '1px dashed #EBEBEB',
              textAlign: 'right',
              fontSize: '12px'
            },
            '& .MuiTableCell-body': {
              padding: '6px !important'
            },

            '& .MuiTableCell-head': {
              textTransform: 'uppercase',
              fontWeight: 500
            },
            '& .MuiTableCell-footer': {
              padding: '8px 10px !important'
            },
            '& .MuiTableCell-root:nth-of-type(1),& .MuiTableCell-root:nth-of-type(2)': {
              textAlign: 'left'
            },
            '& .MuiTableCell-root:nth-of-type(3)': {
              textAlign: 'center'
            },
            '& .MuiTableCell-root:first-of-type': {
              pl: '6px !important'
            },
            '& .MuiTableCell-root:last-of-type': {
              pr: '6px !important'
            }
          }}
        >
          {children}
        </Table>
      </TableContainer>
    </>
  )
}

export const CommonViewTable = ({ children }) => {
  return (
    <>
      <Table
        sx={{
          width: '100%',
          border: 0,
          '& .MuiTableCell-root': {
            border: 0,
            // verticalAlign: 'top !important',
            padding: '0px !important'
          },
          '& .MuiTableCell-root .data-name': {
            fontSize: '12px',
            color: '#818181',
            lineHeight: '23px'
          },
          '& .MuiTableCell-root .data-value': {
            fontSize: '12px',
            fontWeight: 500,
            color: '#000',
            lineHeight: '23px'
          }
        }}
      >
        {children}
      </Table>
    </>
  )
}

export const PdfLayout = ({
  data,
  DataList,
  section2,
  section3,
  itemsSection,
  notesSection,
  totalsSection,
  lastSection
}) => {
  // const [isListVisible, setIsListVisible] = useState(true)
  // const toggleListVisibility = () => {
  //   setIsListVisible(!isListVisible)
  // }
  return (
    <div>
      <>
        {/* <IconButton
          variant='outlined'
          color='primary'
          sx={{
            fontSize: '21px',
            display: {
              xs: 'none',
              sm: 'none',
              md: 'inline-flex'
            }
          }}
          scroll={true}
          onClick={toggleListVisibility}
        >
          {isListVisible ? <VisibilityOffIcon /> : <VisibilityIcon />}
        </IconButton> */}

        {/* <Box
          sx={{
            display: {
              xs: 'none',
              sm: 'none',
              md: 'inline'
            },
            ml: 1
          }}
        >
          {isListVisible ? 'Hide List' : 'Show List'}
        </Box> */}
      </>
      <Grid container spacing={{ xs: 5, xl: 10 }}>
        {/* {isListVisible && <ViewDataList>{DataList}</ViewDataList>} */}
        <Grid item xs={12} md={8} lg={8} xl={7.7}>
          <Card sx={{ p: 6, width: '100%' }}>
            <Grid container spacing={5}>
              <Grid item xs={12}>
                <Grid
                  container
                  spacing={5}
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' }
                  }}
                >
                  <Grid item xs={12} sm={7} md={6.5} xl={7.1}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        flexWrap: { xs: 'wrap', md: 'nowrap' },
                        gap: 2
                      }}
                    >
                      <LogoBox data={data} />
                      <div>
                        <CompanyData data={data} />
                      </div>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={5} md={4} lg={4} xl={3.7}>
                    <Table
                      sx={{
                        border: 0,
                        '& .MuiTableCell-root': {
                          border: 0,
                          // verticalAlign: 'top !important',
                          padding: '0px !important'
                        },
                        '& .MuiTableCell-root .data-name': {
                          fontSize: '12px',
                          color: '#818181',
                          lineHeight: '23px'
                        },
                        '& .MuiTableCell-root .data-value': {
                          fontSize: '12px',
                          fontWeight: 500,
                          color: '#000',
                          lineHeight: '23px'
                        }
                      }}
                    >
                      <TableBody>{section2}</TableBody>
                    </Table>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid
                  container
                  spacing={5}
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' }
                  }}
                >
                  <Grid item xs={12} sm={6} md={5} xl={3.5}>
                    {section3}
                  </Grid>
                  <Grid item xs={0} sm={0} md={1.5} xl={3.6} sx={{ display: { xs: 'none', md: 'block' } }}></Grid>
                  <Grid item xs={12} sm={6} md={5} lg={4} xl={3.7}>
                    <Typography
                      sx={{
                        fontSize: '13px',
                        fontWeight: 600,
                        lineHeight: '24px'
                      }}
                    >
                      Delivery Address
                    </Typography>
                    <CommonViewTable>
                      <TableBody>
                        <ShowAddress data={data?.deliveryAddress} />
                      </TableBody>
                    </CommonViewTable>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <ViewItemsTableWrapper>{itemsSection}</ViewItemsTableWrapper>
              </Grid>
              <Grid item xs={12}>
                <Grid
                  container
                  spacing={6}
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column-reverse', md: 'row' },
                    justifyContent: 'space-between'
                  }}
                >
                  <Grid item xs={12} md={6}>
                    <Box sx={{ p: 4 }}>{notesSection}</Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Table
                      sx={{
                        '& .MuiTableCell-root': {
                          padding: '8px 10px !important',
                          borderBottom: '1px dashed #EBEBEB',
                          textAlign: 'right',
                          fontSize: '12px'
                        },
                        '& .data-value p': {
                          textWrap: 'nowrap'
                        }
                      }}
                    >
                      <TableBody>{totalsSection} </TableBody>
                    </Table>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <CommonViewTable>
                  <TableBody>{lastSection}</TableBody>
                </CommonViewTable>
              </Grid>
              <Grid item xs={12}>
                {data?.termsAndConditions ? (
                  <>
                    <Typography
                      sx={{
                        fontSize: '14px',
                        fontWeight: 600
                      }}
                    >
                      Terms and Conditions
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: '#818181', lineHeight: '22px' }}>
                      <div>
                        <pre
                          style={{
                            fontFamily: 'inherit',
                            whiteSpace: 'pre-wrap'
                          }}
                        >
                          {data?.termsAndConditions}
                        </pre>
                      </div>
                    </Typography>
                  </>
                ) : null}
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </div>
  )
}

export const PrintPdfLayout = ({ data, currency, section2, section3, itemsSection, notesSection, totalsSection }) => {
  return (
    <Table>
      <TableBody>
        <TableRow>
          <TableCell colSpan={2} sx={{ border: 0 }}>
            <Grid container spacing={6}>
              <Grid item xs={6.5}>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2
                  }}
                >
                  <Box>
                    <LogoBox data={data} />
                  </Box>

                  <div>
                    <CompanyData data={data} />
                  </div>
                </Box>
              </Grid>
              <Grid item xs={0.5}></Grid>

              <Grid item xs={4.5}>
                <CommonViewTable>
                  <TableBody>{section2}</TableBody>
                </CommonViewTable>
              </Grid>
            </Grid>
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell colSpan={2} sx={{ border: 0 }}>
            <Grid container spacing={6} sx={{ display: 'flex' }}>
              <Grid item xs={6.5}>
                {section3}
              </Grid>
              <Grid item xs={0.5}></Grid>
              <Grid item xs={4.5}>
                <Typography
                  sx={{
                    fontSize: '14px',
                    fontWeight: 600,
                    lineHeight: '22px',
                    mb: 1
                  }}
                >
                  Delivery Address
                </Typography>
                <CommonViewTable>
                  <TableBody>
                    {/* <TableRow>
                        <TableCell colSpan={2}> */}
                    <ShowAddress data={data?.deliveryAddress} />{' '}
                    {/* </TableCell>
                      </TableRow> */}
                  </TableBody>
                </CommonViewTable>
              </Grid>
            </Grid>
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell colSpan={2} sx={{ border: 0 }}>
            <ViewItemsTableWrapper>{itemsSection}</ViewItemsTableWrapper>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell colSpan={2} sx={{ border: 0 }}>
            <Grid container spacing={6}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 4 }}>{notesSection}</Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Table
                  sx={{
                    '& .MuiTableCell-root': {
                      padding: '6px 10px !important',
                      borderBottom: '1px dashed #EBEBEB',
                      textAlign: 'right',
                      fontSize: '12px'
                    }
                  }}
                >
                  <TableBody>{totalsSection}</TableBody>
                </Table>
                {/* </Box> */}
              </Grid>
            </Grid>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell colSpan={2} sx={{ border: 0 }}>
            {data?.termsAndConditions ? (
              <>
                {' '}
                <Typography
                  sx={{
                    fontSize: '13px',
                    fontWeight: 600
                  }}
                >
                  Terms and Conditions
                </Typography>
                <Typography sx={{ fontSize: '12px', color: '#818181', lineHeight: '21px' }}>
                  <div>
                    <pre
                      style={{
                        fontFamily: 'inherit',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {data?.termsAndConditions}
                    </pre>
                  </div>{' '}
                </Typography>
              </>
            ) : null}{' '}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

export const PrintEmailPdfLayout = ({
  data,
  currency,
  section2,
  section3,
  itemsSection,
  notesSection,
  totalsSection
}) => {
  return (
    <>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell colSpan={2} sx={{ border: 0 }}>
              <Grid container spacing={6}>
                <Grid item xs={5}>
                  <div>
                    <PrintCompanyData data={data} />
                  </div>
                </Grid>
                <Grid item xs={3}>
                  <Typography sx={{ fontSize: '20px', fontWeight: 600, color: '#003366' }}>Tax Invoice</Typography>
                </Grid>

                <Grid item xs={4} sx={{ display: 'flex', alignItems: 'start', justifyContent: 'flex-end' }}>
                  <LogoBox data={data} />
                </Grid>
              </Grid>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={2} sx={{ borderBottom: '2px solid #003366' }}></TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={2} sx={{ border: 0 }}>
              <Grid container spacing={6}>
                <Grid item xs={5}>
                  <CommonViewTable>
                    <TableBody>{section3}</TableBody>
                  </CommonViewTable>
                </Grid>

                <Grid item xs={7} sx={{ display: 'flex', alignItems: 'start', justifyContent: 'flex-end' }}>
                  <Table align='right'>
                    <TableBody>{section2}</TableBody>
                  </Table>
                </Grid>
              </Grid>
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell colSpan={2} sx={{ border: 0 }}>
              <PrintViewItemsTableWrapper>{itemsSection}</PrintViewItemsTableWrapper>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={2} sx={{ border: 0 }}>
              <Grid container spacing={6}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 4 }}>{notesSection}</Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Table
                    sx={{
                      '& .MuiTableCell-root': {
                        padding: '6px 10px !important',
                        borderBottom: '1px dashed #EBEBEB',
                        fontSize: '12px'
                      }
                    }}
                  >
                    <TableBody>{totalsSection}</TableBody>
                  </Table>
                  {/* </Box> */}
                </Grid>
              </Grid>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={2} sx={{ border: 0 }}>
              {data?.termsAndConditions ? (
                <>
                  {' '}
                  <Typography
                    sx={{
                      fontSize: '13px',
                      fontWeight: 600
                    }}
                  >
                    Terms and Conditions
                  </Typography>
                  <Typography sx={{ fontSize: '12px', color: '#818181', lineHeight: '21px' }}>
                    <div>
                      <pre
                        style={{
                          fontFamily: 'inherit',
                          whiteSpace: 'pre-wrap'
                        }}
                      >
                        {data?.termsAndConditions}
                      </pre>
                    </div>{' '}
                  </Typography>
                </>
              ) : null}{' '}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </>
  )
}
