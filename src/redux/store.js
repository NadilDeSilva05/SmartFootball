import { combineReducers, configureStore } from '@reduxjs/toolkit'
import authenticationReducer from './slices/authenticationSlice'
import attendanceReducer from './slices/attendanceSlice'

// Stub reducers (slices removed): same state shape, no-op
const stub = (init = {}) => (state = init, action) => state

const layoutStub = stub({
  isOpen: [],
  defaultId: 'default',
  fontFamily: `'Roboto', sans-serif`,
  borderRadius: 12,
  opened: true
})
const notificationStub = stub({ snackText: '', snackVariant: '' })
const modalStub = stub({
  GOAL_MODAL: { modalName: 'GOAL_MODAL', modalStatus: false },
  ADD_CLIENT_FILE_MODAL: { modalName: 'ADD_CLIENT_FILE_MODAL', modalStatus: false }
})

const appReducer = combineReducers({
  customization: layoutStub,
  notificationReducer: notificationStub,
  modalReducer: modalStub,
  authenticationReducer,
  compositeDataReducer: stub({ compositeRequestSuccessData: null, isCompositeRequestLoading: false }),
  clientReducer: stub({
    clientList: [],
    clients: [],
    clientDetail: null,
    isLoading: false,
    totalCount: 0,
    currentPage: 1,
    cursors: {},
    filterClientsRequestLoading: false,
    filterClientsRequestSuccessData: null,
    filteredClientListData: [],
    saveClientRequestLoading: false,
    isClientDetailRequestLoading: false,
    updateClientRequestLoading: false,
    selectedClientDetail: {},
    selectedClientDetailFailed: null
  }),
  settingsReducer: stub({ isGetSettingsLoading: false, getSettingsSuccessData: null, isUpdateSettingsLoading: false }),
  paymentsReducer: stub({}),
  teamMembersReducer: stub({ teamMembersList: [], teamMembersListData: [], isTeamMembersListLoading: false }),
  advisorProfileSettingsReducer: stub({}),
  dashboardStatisticsReducer: stub({ clientStatisticsData: {}, clientStatisticsLoading: false }),
  eventReducer: stub({ events: [] }),
  cashflowReducer: stub({ getCashflowSuccessData: null, isGetCashflowLoading: false }),
  tasksReducer: stub({}),
  attendance: attendanceReducer,
  penaltyReducer: stub({ penaltyList: [] }),
  clientProgressReducer: stub({ progressList: [] }),
  clientSchedulesReducer: stub({ schedulesList: [], schedules: [], isLoading: false, error: null, isCreating: false, isUpdating: false, isDeleting: false }),
  clientMealPlansReducer: stub({ mealPlansList: [] })
})

export const store = configureStore({
  reducer: appReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false
    })
})

export default store
