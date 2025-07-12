// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'


export const appCommanAlertSlice = createSlice({
    name: 'appCommanAlert',
    initialState: {
        alerts: []
    },
    reducers: {
        createAlert: (state, action) => {
            state?.alerts?.push({
                message: action?.payload?.message,
                type: action?.payload?.type
            })
        },
        emptyAlerts: (state, action) => {
            state.alerts = []
        }
    }
})

export const { createAlert, emptyAlerts } = appCommanAlertSlice.actions
export default appCommanAlertSlice.reducer