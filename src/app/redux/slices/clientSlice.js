import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  appointments: [],
  favoriteShop: null,
};

const clientSlice = createSlice({
  name: "client",
  initialState,
  reducers: {
    setAppointments(state, action) {
      state.appointments = action.payload;
    },
    setFavoriteShop(state, action) {
      state.favoriteShop = action.payload;
    },
  },
});

export const { setAppointments, setFavoriteShop } = clientSlice.actions;
export default clientSlice.reducer;
