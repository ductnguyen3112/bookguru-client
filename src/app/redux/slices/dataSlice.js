import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  business: {},
  modal: false,
  modalTitle: "",
  isLoggedIn: false,
  bookSelection:false,


  selected: {
    staffs: [],
    staff: "any",
    services: [],
    duration: 0,
    time: "",
    user: "",
    status: "",
    note: "",
    preference: false,
    date: Date.now(),
    cost: 0,
  },
  client: {
    loading: false,
    phone: "",
    code: "",
    verifyCode: "",
    verifyId: "",
    verifyStatus: "",
    remainingTime: 0,
    resendDisabled: false,
    confirmOTP: false,

    
  },
  clientData: {
    client: { clientName: "", clientPhone: "", clientEmail: "", _id: "" },

    appointments: [],
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
      state.selected.staff = action.payload;
    },
    addStaffs(state, action) {
      state.selected.staffs = action.payload;
    },
    addTime(state, action) {
      state.selected.time = action.payload;
    },
    addNote(state, action) {
      state.selected.note = action.payload;
    },
    addDate(state, action) {
      state.selected.date = action.payload;
    },
    setModal(state, action) {
      state.modal = action.payload;
    },
    setPreference(state, action) {
      state.selected.preference = action.payload;
    },
    setModalTitle(state, action) {
      state.modalTitle = action.payload;
    },
    setPhone(state, action) {
      state.client.phone = action.payload;
    },
    setCode(state, action) {
      state.client.code = action.payload;
    },
    setVerifyCode(state, action) {
      state.client.verifyCode = action.payload;
    },
    setLoading(state, action) {
      state.client.loading = action.payload;
    },
    setResendDisabled(state, action) {
      state.client.resendDisabled = action.payload;
    },
    setLoggedIn(state, action) {
      state.isLoggedIn = action.payload;
    },
    setClientData(state, action) {
      state.clientData = action.payload;
    },
    setRandomStaff(state, action) {
      state.selected.randomStaff = action.payload;
    },
    setBookSelection(state, action) {
      state.bookSelection = action.payload;
    },
    setConfirmOTP(state, action) {
      state.client.confirmOTP = action.payload;
    },
    setRemainingTime(state, action) {
      state.client.remainingTime = action.payload;
    },

  },
});

export const {
  setBusiness,
  addServices,
  addDuration,
  addCost,
  addStaff,
  addTime,
  addNote,
  setModal,
  setModalTitle,
  setPhone,
  setCode,
  setVerifyCode,
  setLoading,
  setResendDisabled,
  setLoggedIn,
  setClientData,
  addStaffs,
  setPreference,
  addDate,
  setRandomStaff,
  setBookSelection,
  setConfirmOTP,
  setRemainingTime,

} = dataSlice.actions;
export default dataSlice.reducer;
