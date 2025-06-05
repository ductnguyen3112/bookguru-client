import { createSlice } from "@reduxjs/toolkit";

const createGuest = () => ({
  services: [],
  duration: 0,
  cost: 0,
  staffs: [],
  staff: "any",
  time: "",
  note: "",
  preference: false,
  date: Date.now(),
});

const initialState = {
  guests: [],
  currentGuestIndex: 0,
};

const groupSlice = createSlice({
  name: "group",
  initialState,
  reducers: {
    setGuests(state, action) {
      state.guests = action.payload;
    },

    addGuest(state) {
      state.guests.push(createGuest());
    },

    setGuestIndex(state, action) {
      state.currentGuestIndex = action.payload;
    },

    updateGuestServices(state, action) {
      const { index, services } = action.payload;
      if (state.guests[index]) state.guests[index].services = services;
    },

    updateGuestCost(state, action) {
      const { index, cost } = action.payload;
      if (state.guests[index]) state.guests[index].cost = cost;
    },

    updateGuestDuration(state, action) {
      const { index, duration } = action.payload;
      if (state.guests[index]) state.guests[index].duration = duration;
    },

    updateGuestStaffs(state, action) {
      const { index, staffs } = action.payload;
      if (state.guests[index]) state.guests[index].staffs = staffs;
    },

    updateGuestStaff(state, action) {
      const { index, staff } = action.payload;
      if (state.guests[index]) state.guests[index].staff = staff;
    },

    updateGuestNote(state, action) {
      const { index, note } = action.payload;
      if (state.guests[index]) state.guests[index].note = note;
    },

    updateGuestTime(state, action) {
      const { index, time } = action.payload;
      if (state.guests[index]) state.guests[index].time = time;
    },

    updateGuestDate(state, action) {
      const { index, date } = action.payload;
      if (state.guests[index]) state.guests[index].date = date;
    },

    updateGuestPreference(state, action) {
      const { index, preference } = action.payload;
      if (state.guests[index]) state.guests[index].preference = preference;
    },
  },
});

export const {
  setGuests,
  addGuest,
  setGuestIndex,
  updateGuestServices,
  updateGuestCost,
  updateGuestDuration,
  updateGuestStaffs,
  updateGuestStaff,
  updateGuestNote,
  updateGuestTime,
  updateGuestDate,
  updateGuestPreference,
} = groupSlice.actions;

export default groupSlice.reducer;
