import {
  createOtherSettingMutation,
  updateOtherSettingMutation
} from 'src/@core/components/graphql/other-setting-queries'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { SCHEMA_VERSION } from 'src/common-functions/utils/Constants'
import { addOtherSetting, setOtherSettings } from 'src/store/apps/other-setting'

async function SaveOtherSetting(settings, tenantId, newItem, dispatch) {
  const schemaVersion = SCHEMA_VERSION
  const { manufacturer = [], brand = [], uom = [], productCategory = [], productClass = [] } = settings || {}
  const createOrUpdateSettings = (existingValues, newValue) => {
    const valuesArray = Array.isArray(existingValues) ? existingValues : []
    if (valuesArray.includes(newValue) || newValue === null || newValue === '') {
      return valuesArray
    } else {
      return [...valuesArray, newValue]
    }
  }
  // const variantUnits = newItem?.variants?.map(variant => variant?.unit).filter(unit => unit !== null && unit !== '')

  // const allUnits = [
  //   newItem?.uom,
  //   newItem?.itemWeight?.unit,
  //   newItem?.itemDimension?.unit,
  //   newItem?.packageDimension?.unit,
  //   newItem?.packageWeight?.unit
  // ].filter(unit => unit !== null && unit !== '')

  const allUnits = [newItem?.uom].filter(uom => uom !== null && uom !== '')
  const finalUnit = [...new Set(allUnits)] // Remove duplicates

  if (settings?.manufacturer) {
  }
  function arraysAreEqual(array1, array2) {
    // Check if the arrays are the same length
    if (array1.length !== array2.length) {
      return false
    }

    // Check each element in the arrays
    for (let i = 0; i < array1.length; i++) {
      if (array1[i] !== array2[i]) {
        return false
      }
    }

    // If all elements are equal, return true
    return true
  }

  const updatedSettings = {
    schemaVersion,
    manufacturer: createOrUpdateSettings(manufacturer, newItem?.manufacturer),
    brand: createOrUpdateSettings(brand, newItem?.brand),
    uom: [...new Set([...finalUnit, ...uom])],
    productCategory: createOrUpdateSettings(productCategory, newItem?.productCategory),
    productClass: createOrUpdateSettings(productClass, newItem?.productClass)
  }

  const data1 = { tenantId, otherSetting: updatedSettings }
  if (
    !(manufacturer || []).length &&
    !(brand || []).length &&
    !(productCategory || []).length &&
    !(productClass || []).length &&
    !(uom || []).length
  ) {
    console.log('add api called')
    dispatch(addOtherSetting(data1))
    try {
      await writeData(createOtherSettingMutation(), { tenantId, otherSetting: updatedSettings })
    } catch (error) {
      throw error
    }
  } else {
    if (
      (!manufacturer.includes(newItem.manufacturer) && newItem.manufacturer) ||
      (!brand.includes(newItem.brand) && newItem.brand) ||
      (!productCategory.includes(newItem.productCategory) && newItem.productCategory) ||
      (!productClass.includes(newItem.productClass) && newItem.productClass) ||
      !arraysAreEqual(updatedSettings.uom, uom)
    ) {
      try {
        const response = await writeData(updateOtherSettingMutation(), { tenantId, otherSetting: updatedSettings })
        if (response.updateOtherSetting) {
          dispatch(setOtherSettings(response.updateOtherSetting))
        }
      } catch (error) {
        // Handle any errors and optionally dispatch an error action
        throw error
      }
    }
  }
}

export default SaveOtherSetting
