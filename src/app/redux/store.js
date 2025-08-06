// store.js
import { configureStore } from "@reduxjs/toolkit";
import dataReducer from "./slices/dataSlice";
import groupReducer from "./slices/groupSlice"; // assuming you have a guestSlice
 // assuming you have a clientSlice
const store = configureStore({
  reducer: {
    data: dataReducer,
    group: groupReducer, // assuming you have a guestReducer
     
  },
});

export default store;
