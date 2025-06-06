// store.js
import { configureStore } from "@reduxjs/toolkit";
import dataReducer from "./slices/dataSlice";
import groupReducer from "./slices/groupSlice"; // assuming you have a guestSlice

const store = configureStore({
  reducer: {
    data: dataReducer,
    group: groupReducer, // assuming you have a guestReducer
    // add other reducers here
  },
});

export default store;
