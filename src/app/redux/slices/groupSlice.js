// --- Redux Slice: groupBookingSlice.js ---
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  allowedGuests: 5,
  modalGuests: false,
  staffSelection: false,

  currentGuest: 1,
  guests: [
    {
      id: 1,
      name: "",
      email: "",
      _id: "",
      isMainBooker: true,
      services: [],
      staffs: [],
      start: null,
      end: null,
      staff: "any",
      duration: 0,
      cost: 0,
    },
  ],
  date: new Date().toISOString().split("T")[0], // Default to today
  time: null,
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
          staff: "",
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

      if (guest) {
        Object.assign(guest, data);

        // ✅ Automatically filter staffs that are common across all selected services
        if (Array.isArray(data.services) && data.services.length > 0) {
          // Start with the staff list of the first service
          let commonStaffs = data.services[0].staff || [];

          // Intersect with staff lists from remaining services
          for (let i = 1; i < data.services.length; i++) {
            const serviceStaff = data.services[i].staff || [];
            commonStaffs = commonStaffs.filter((id) =>
              serviceStaff.includes(id)
            );
          }

          guest.staffs = [...new Set(commonStaffs.map(String))];
        } else {
          guest.staffs = [];
        }
      }
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
    setStaffSelection(state, action) {
      state.staffSelection = action.payload;
    },
    
    updateGuestStaff(state, action) {
      const { guestId, staff } = action.payload;
      const guest = state.guests.find((g) => g.id === guestId);

      if (guest) {
        guest.staff = staff;
      }
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
  setStaffSelection,
  updateGuestStaff,
} = groupSlice.actions;
export default groupSlice.reducer;
