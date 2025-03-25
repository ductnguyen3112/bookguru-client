import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  business: {},
  selected: {
    staffs: "",
    services: [],
    duration: 0,
    date: Date.now(),
    cost: 0,
  },
};

const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    setBusiness(state, action) {
      state.business = action.payload;
    },
    addServices(state, action) {
      state.selected.services = action.payload;
    },
    addDuration(state, action) {
      state.selected.duration = action.payload;
    },
    addCost(state, action) {
      state.selected.cost = action.payload;
    },
    addStaff(state, action) {
      state.selected.staffs = action.payload;
    },
  },
});

export const { setBusiness, addServices, addDuration, addCost, addStaff } =
  dataSlice.actions;
export default dataSlice.reducer;
