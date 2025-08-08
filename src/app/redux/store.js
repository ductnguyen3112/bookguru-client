// src/app/redux/store.js
import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import groupReducer from './slices/groupSlice'
import dataReducer from './slices/dataSlice'
// …other imports

const store = configureStore({
  reducer: {
    auth: authReducer,
    group: groupReducer,
    data: dataReducer,

    // …other slices
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false }),
})

export default store
