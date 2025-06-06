// --- Redux Slice: groupBookingSlice.js ---
import { createSlice } from "@reduxjs/toolkit";
import { set } from "mongoose";

const initialState = {
  allowedGuests: 5,
  modalGuests: false,
  currentGuest: 1,

  guests: [
    {
      id: 1,
      name: "",
      email: "",
      _id: "",
      isMainBooker: true,
      services: [],
      staff: "any",
      duration: 0,
      cost: 0,
    },
  ],
  date: "",
  time: "",
  clientPhone: "",
};

const groupSlice = createSlice({
  name: "group",
  initialState,
  reducers: {
    addGuest(state) {
      if (state.guests.length < state.allowedGuests) {
        const newId = state.guests.length + 1;
        state.guests.push({
          id: newId,
          name: "",
          isMainBooker: false,
          services: [],
          staff: "any",
          duration: 0,
          cost: 0,
        });
      }
    },
    removeGuest(state, action) {
      state.guests = state.guests.filter((g) => g.id !== action.payload);
    },
    updateGuest(state, action) {
      const { id, data } = action.payload;
      const guest = state.guests.find((g) => g.id === id);
      if (guest) Object.assign(guest, data);
    },
    setGroupDate(state, action) {
      state.date = action.payload;
    },
    setGroupTime(state, action) {
      state.time = action.payload;
    },
    setClientPhone(state, action) {
      state.clientPhone = action.payload;
    },
    setAllowedGuests(state, action) {
      state.allowedGuests = action.payload;
    },
    setModalGuest(state, action) {
      state.modalGuests = action.payload;
    },
    setCurrentGuest(state, action) {
      state.currentGuest = action.payload;
    },

    removeGuestById(state, action) {
      state.guests = state.guests.filter((g) => g.id !== action.payload);
    },
 
  },
});

export const {
  addGuest,
  removeGuest,
  updateGuest,
  setGroupDate,
  setGroupTime,
  setClientPhone,
  setAllowedGuests,
  setModalGuest,
  setCurrentGuest,
  removeGuestById,
} = groupSlice.actions;
export default groupSlice.reducer;
