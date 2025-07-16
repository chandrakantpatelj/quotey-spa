import { useEffect } from 'react'
import { Box, TableBody, TableRow, TableCell, IconButton, Typography, TableHead } from '@mui/material'
import CustomTextField from 'src/@core/components/mui/text-field'
import Icon from 'src/@core/components/icon'
import { useDispatch } from 'react-redux'
import { Controller, useFieldArray } from 'react-hook-form'
import {
  floatPattern,
  floatPatternMsg,
  handleDecimalPlaces,
  safeNumber,
  NumberFormat,
  getOnFocusConfig
} from 'src/common-functions/utils/UtilityFunctions'
import { RendorDimensions, RendorSalesItemData, ViewItemsTableWrapper } from 'src/common-components/CommonPdfDesign'
import useIsDesktop from 'src/hooks/IsDesktop'
import { greaterThan } from 'src/common-functions/utils/DecimalUtils'

export default function ReturnSalesOrderItemsTable({ control, getValues, trigger, watch, currency, allWarehouses }) {
  const dispatch = useDispatch()
  const isDesktop = useIsDesktop()

  const { update, remove } = useFieldArray({
    control,
    name: 'orderItems',
    rules: {
      required: false
    }
  })

  const totalPrice = watch('totalAmount')
  let orderItems = getValues('orderItems')

  useEffect(() => {
    trigger(['depositAmount'])
  }, [totalPrice])

  return (
    <>
      <>
        <ViewItemsTableWrapper>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '3%' }}>#</TableCell>
              <TableCell sx={{ width: '40%' }}>Item</TableCell>
              {isDesktop ? <TableCell sx={{ width: '6%' }}>Dimensions</TableCell> : null}
              <TableCell sx={{ width: '8%' }}>Qty</TableCell>
              {isDesktop ? <TableCell sx={{ width: '10%' }}>Warehouse</TableCell> : null}
              {isDesktop ? <TableCell sx={{ width: '11%' }}>Rate</TableCell> : null}
              {isDesktop ? <TableCell sx={{ width: '15%' }}>Return Qty</TableCell> : null}
              <TableCell sx={{ width: '18%' }}>Total</TableCell>
              <TableCell sx={{ width: '2%' }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orderItems?.length > 0 ? (
              orderItems?.map((orderItem, index) => {
                const warehouse = allWarehouses?.find(item => item?.warehouseId === orderItem?.warehouseId) || {}
                return (
                  <TableRow key={orderItem?.lineItemId}>
                    <TableCell>{index + 1}</TableCell>

                    <RendorSalesItemData index={index} orderItem={orderItem} currency={currency} showData={true} />

                    {isDesktop ? (
                      <TableCell>
                        <RendorDimensions orderItem={orderItem} />{' '}
                      </TableCell>
                    ) : null}

                    <TableCell>
                      {orderItem?.qty} {orderItem?.uom}
                    </TableCell>

                    {isDesktop ? <TableCell>{warehouse?.name}</TableCell> : null}

                    {isDesktop ? (
                      <TableCell>
                        <NumberFormat value={safeNumber(orderItem?.sellingPrice).toFixed(2)} currency={currency} />
                      </TableCell>
                    ) : null}
                    <TableCell>
                      <Controller
                        name={`orderItems[${index}].returnQty`}
                        control={control}
                        rules={{
                          required: 'Return Qty is required',
                          pattern: {
                            value: floatPattern,
                            message: floatPatternMsg
                          },
                          validate: value => {
                            if (Number(value) <= 0) {
                              return 'Qty should be greater than zero'
                            }
                            if (greaterThan(value, orderItem?.qty)) {
                              return 'Qty should be less than or equal to Ordered Qty'
                            }
                            return true
                          }
                        }}
                        //
                        render={({ field, fieldState: { error } }) => (
                          <CustomTextField
                            // sx={{ width: '40%' }}
                            label='Return Qty'
                            inputProps={{ min: 0 }}
                            // value={orderItem?.packingUnit?.qty}
                            onChange={e => {
                              const value = e.target.value
                              const formattedValue = handleDecimalPlaces(value)
                              field.onChange(formattedValue)

                              update(`orderItems[${index}].returnQty`, formattedValue)
                            }}
                            InputProps={{
                              ...getOnFocusConfig(field, 0)
                            }}
                            error={Boolean(error)}
                            helperText={error?.message}
                          />
                        )}
                      />
                    </TableCell>

                    <TableCell>
                      <NumberFormat value={orderItem?.subtotal?.toFixed(2)} currency={currency} />
                    </TableCell>
                    <TableCell>
                      {' '}
                      <IconButton
                        variant='outlined'
                        color='error'
                        onClick={() => {
                          remove(index)
                        }}
                      >
                        <Icon icon='mingcute:delete-2-line' />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8}>
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: '30px 10px'
                    }}
                  >
                    <Typography variant='h5' align='center' display='block'>
                      No Items
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </ViewItemsTableWrapper>
      </>
    </>
  )
}
