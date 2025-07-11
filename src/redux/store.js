import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import leadReducer from "./slices/leadSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    leads: leadReducer,
  },
});
