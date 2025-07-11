import { createSlice } from "@reduxjs/toolkit";

const leadSlice = createSlice({
  name: "leads",
  initialState: { list: [] },
  reducers: {
    setLeads: (state, action) => {
      state.list = action.payload;
    },
    addLead: (state, action) => {
      state.list.push(action.payload);
    },
  },
});

export const { setLeads, addLead } = leadSlice.actions;
export default leadSlice.reducer;
