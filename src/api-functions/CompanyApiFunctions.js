import {
  getAllTenantQuery,
  createTenantMutation,
  updateTenantMutation
} from 'src/@core/components/graphql/company-queries'
import { fetchData, writeData } from 'src/common-functions/GraphqlOperations'

export const getAllTenants = async (setTenants, setShowProgress) => {
  setShowProgress(true)
  const res = await fetchData(getAllTenantQuery())
  res && setShowProgress(false)
  console.log('getAllTenants RESULT::', res)
  setTenants(res?.getAllTenants)
}

export const createTenant = async (tenant, tenants, setTenants, setShowProgress, setShowAlert, setAlertMsg) => {
  const res = await writeData(createTenantMutation(), { tenant })
  console.log('createTenant::', res)
  if (res?.createTenant) {
    setTenants([...tenants, { ...res?.createTenant }])
    setShowProgress(false)
    setAlertMsg('Company Added successfully')
    setShowAlert(true)
  } else {
    setShowProgress(false)
    setAlertMsg('Company creation failed')
    setShowAlert(true)
  }
}

export const updateTenant = async (
  tenantId,
  tenant,
  tenants,
  setTenants,
  setShowProgress,
  setShowAlert,
  setAlertMsg
) => {
  const res = await writeData(updateTenantMutation(), { tenantId, tenant })
  console.log('updateTenant::', res)
  if (res?.updateTenant) {
    let filterData = [...tenants]
    filterData.forEach((tenant, index) => {
      if (tenant.tenantId === res?.updateTenant.tenantId) {
        filterData[index] = res?.updateTenant
      }
    })
    setTenants(filterData)
    // setShowProgress(false)
    // setAlertMsg('Tenant Updated successfully')
    // setShowAlert(true)
  } else {
    // setShowProgress(false)
    // setAlertMsg('Tenant updation failed')
    // setShowAlert(true)
  }
}
