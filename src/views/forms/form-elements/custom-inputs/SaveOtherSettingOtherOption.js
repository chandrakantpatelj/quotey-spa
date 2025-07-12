import { updateOtherSettingMutation } from 'src/@core/components/graphql/other-setting-queries'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { SCHEMA_VERSION } from 'src/common-functions/utils/Constants'
import { resetOtherSettings } from 'src/store/apps/other-setting'

async function SaveOtherSettingOtherOption(tenantId, settings, savedSalesOrder, dispatch, fieldName) {
  const customerNotesKey = `${fieldName}CustomerNotes`
  const termsAndConditionsKey = `${fieldName}TermsAndConditions`

  delete savedSalesOrder?.tenantId
  delete settings?.tenantId

  const matchCustomerNotes = findMatch(settings[customerNotesKey], savedSalesOrder.customerNotes)
  const matchTermsAndConditions = findMatch(settings[termsAndConditionsKey], savedSalesOrder?.termsAndConditions)
  if (
    (!matchCustomerNotes && savedSalesOrder?.customerNotes !== '') ||
    (!matchTermsAndConditions && savedSalesOrder?.termsAndConditions !== '')
  ) {
    try {
      const otherSetting = updateSettings(settings, savedSalesOrder, customerNotesKey, termsAndConditionsKey)

      const response = await writeData(updateOtherSettingMutation(), { tenantId, otherSetting })
      if (response.updateOtherSetting) {
        dispatch(resetOtherSettings())
      }
    } catch (error) {
      console.log('error', error)
    }
  }
}

function findMatch(existingArray, newValue) {
  return existingArray?.includes(newValue) || false // Check if newValue exists in existingArray
}

function updateSettings(settings, savedSalesOrder, customerNotesKey, termsAndConditionsKey) {
  const { termsAndConditions, customerNotes } = savedSalesOrder || {}

  const terms =
    termsAndConditions && termsAndConditions !== ''
      ? [...new Set([...(settings[termsAndConditionsKey] || []), termsAndConditions])]
      : settings[termsAndConditionsKey] || []

  const notes =
    customerNotes && customerNotes !== ''
      ? [...new Set([...(settings[customerNotesKey] || []), customerNotes])]
      : settings[customerNotesKey] || []

  return {
    ...settings,
    schemaVersion: SCHEMA_VERSION,
    [customerNotesKey]: notes,
    [termsAndConditionsKey]: terms
  }
}

export default SaveOtherSettingOtherOption
