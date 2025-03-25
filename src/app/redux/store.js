// store.js
import { configureStore } from "@reduxjs/toolkit";
import dataReducer from "./slices/dataSlice";

const store = configureStore({
  reducer: {
    data: dataReducer,
    // add other reducers here
  },
});

export default store;
