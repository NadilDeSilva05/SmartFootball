import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export const requestGetAllAttendance = createAsyncThunk(
  'attendance/requestGetAllAttendance',
  async (
    { queryParams = {}, handleGetAllAttendanceSuccessCallback, handleGetAllAttendanceFailedCallback },
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams(queryParams).toString()
      const res = await fetch(`/api/attendance${params ? `?${params}` : ''}`)
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        handleGetAllAttendanceFailedCallback?.(data)
        return rejectWithValue(data)
      }
      handleGetAllAttendanceSuccessCallback?.(data)
      return data
    } catch (err) {
      handleGetAllAttendanceFailedCallback?.(err)
      return rejectWithValue(err)
    }
  }
)

const initialState = {
  isGetAllAttendanceLoading: false,
  getAllAttendanceSuccessData: null,
  getAllAttendanceErrorData: null
}

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  extraReducers: builder => {
    builder
      .addCase(requestGetAllAttendance.pending, state => {
        state.isGetAllAttendanceLoading = true
        state.getAllAttendanceErrorData = null
      })
      .addCase(requestGetAllAttendance.fulfilled, (state, action) => {
        state.isGetAllAttendanceLoading = false
        state.getAllAttendanceSuccessData = action.payload
        state.getAllAttendanceErrorData = null
      })
      .addCase(requestGetAllAttendance.rejected, (state, action) => {
        state.isGetAllAttendanceLoading = false
        state.getAllAttendanceErrorData = action.payload ?? action.error
      })
  }
})

export default attendanceSlice.reducer
