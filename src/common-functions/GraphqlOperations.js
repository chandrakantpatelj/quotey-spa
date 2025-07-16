import { API, graphqlOperation } from 'aws-amplify'

export async function fetchData(operation) {
  try {
    const res = await API.graphql(graphqlOperation(operation))
    return await res.data
  } catch (err) {
    console.error('error fetching data', err)
    return err
  }
}

export async function writeData(operation, payload) {
  try {
    const res = await API.graphql(graphqlOperation(operation, { ...payload }))
    return await res.data
  } catch (err) {
    console.error('error fetching data', err)
    return err
  }
}
