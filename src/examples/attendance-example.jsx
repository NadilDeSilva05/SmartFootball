import React, { useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { requestGetAllAttendance } from '../redux/slices/attendanceSlice'

/**
 * 📋 **GET All Attendance Records Example**
 *
 * This example demonstrates how to use the GET /attendance endpoint
 * with all available query parameters for filtering and pagination.
 */

const AttendanceExample = () => {
  const dispatch = useDispatch()

  // Redux state
  const { isGetAllAttendanceLoading, getAllAttendanceSuccessData, getAllAttendanceErrorData } = useSelector(
    state => state.attendance
  )

  // Example query parameters
  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 10,
    status: 'Present',
    date: '2024-01-15',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    userId: 'user123',
    sortBy: 'date',
    sortOrder: 'desc'
  })

  // Example 1: Get all attendance records (no filters)
  const handleGetAllAttendance = useCallback(() => {
    const handleSuccess = response => {
      console.log('✅ All attendance records:', response)
    }

    const handleError = error => {
      console.error('❌ Error fetching attendance:', error)
    }

    dispatch(
      requestGetAllAttendance({
        queryParams: {},
        handleGetAllAttendanceSuccessCallback: handleSuccess,
        handleGetAllAttendanceFailedCallback: handleError
      })
    )
  }, [dispatch])

  // Example 2: Get attendance with pagination
  const handleGetAttendanceWithPagination = useCallback(() => {
    const handleSuccess = response => {
      console.log('✅ Paginated attendance records:', response)
    }

    const handleError = error => {
      console.error('❌ Error fetching paginated attendance:', error)
    }

    dispatch(
      requestGetAllAttendance({
        queryParams: {
          page: 1,
          limit: 20
        },
        handleGetAllAttendanceSuccessCallback: handleSuccess,
        handleGetAllAttendanceFailedCallback: handleError
      })
    )
  }, [dispatch])

  // Example 3: Get attendance with status filter
  const handleGetAttendanceByStatus = useCallback(
    status => {
      const handleSuccess = response => {
        console.log(`✅ Attendance records with status ${status}:`, response)
      }

      const handleError = error => {
        console.error('❌ Error fetching attendance by status:', error)
      }

      dispatch(
        requestGetAllAttendance({
          queryParams: {
            status: status,
            page: 1,
            limit: 50
          },
          handleGetAllAttendanceSuccessCallback: handleSuccess,
          handleGetAllAttendanceFailedCallback: handleError
        })
      )
    },
    [dispatch]
  )

  // Example 4: Get attendance with date range
  const handleGetAttendanceByDateRange = useCallback(() => {
    const handleSuccess = response => {
      console.log('✅ Attendance records by date range:', response)
    }

    const handleError = error => {
      console.error('❌ Error fetching attendance by date range:', error)
    }

    dispatch(
      requestGetAllAttendance({
        queryParams: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          page: 1,
          limit: 100
        },
        handleGetAllAttendanceSuccessCallback: handleSuccess,
        handleGetAllAttendanceFailedCallback: handleError
      })
    )
  }, [dispatch])

  // Example 5: Get attendance for specific user
  const handleGetAttendanceByUser = useCallback(
    userId => {
      const handleSuccess = response => {
        console.log(`✅ Attendance records for user ${userId}:`, response)
      }

      const handleError = error => {
        console.error('❌ Error fetching attendance by user:', error)
      }

      dispatch(
        requestGetAllAttendance({
          queryParams: {
            userId: userId,
            page: 1,
            limit: 50
          },
          handleGetAllAttendanceSuccessCallback: handleSuccess,
          handleGetAllAttendanceFailedCallback: handleError
        })
      )
    },
    [dispatch]
  )

  // Example 6: Get attendance with sorting
  const handleGetAttendanceWithSorting = useCallback(() => {
    const handleSuccess = response => {
      console.log('✅ Sorted attendance records:', response)
    }

    const handleError = error => {
      console.error('❌ Error fetching sorted attendance:', error)
    }

    dispatch(
      requestGetAllAttendance({
        queryParams: {
          sortBy: 'date',
          sortOrder: 'desc',
          page: 1,
          limit: 20
        },
        handleGetAllAttendanceSuccessCallback: handleSuccess,
        handleGetAllAttendanceFailedCallback: handleError
      })
    )
  }, [dispatch])

  // Example 7: Complex query with multiple filters
  const handleGetComplexAttendanceQuery = useCallback(() => {
    const handleSuccess = response => {
      console.log('✅ Complex attendance query results:', response)
    }

    const handleError = error => {
      console.error('❌ Error with complex attendance query:', error)
    }

    dispatch(
      requestGetAllAttendance({
        queryParams: {
          page: 1,
          limit: 20,
          status: 'Present',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          userId: 'user123',
          sortBy: 'date',
          sortOrder: 'desc'
        },
        handleGetAllAttendanceSuccessCallback: handleSuccess,
        handleGetAllAttendanceFailedCallback: handleError
      })
    )
  }, [dispatch])

  return (
    <div style={{ padding: '20px' }}>
      <h1>📋 Attendance API Examples</h1>

      <div style={{ marginBottom: '20px' }}>
        <h3>Loading State: {isGetAllAttendanceLoading ? 'Loading...' : 'Ready'}</h3>
        {getAllAttendanceErrorData && (
          <p style={{ color: 'red' }}>Error: {JSON.stringify(getAllAttendanceErrorData)}</p>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button onClick={handleGetAllAttendance}>🔍 Get All Attendance Records</button>

        <button onClick={handleGetAttendanceWithPagination}>
          📄 Get Attendance with Pagination (page=1, limit=20)
        </button>

        <button onClick={() => handleGetAttendanceByStatus('Present')}>✅ Get Present Attendance Records</button>

        <button onClick={() => handleGetAttendanceByStatus('Absent')}>❌ Get Absent Attendance Records</button>

        <button onClick={() => handleGetAttendanceByStatus('Late')}>⏰ Get Late Attendance Records</button>

        <button onClick={handleGetAttendanceByDateRange}>📅 Get Attendance by Date Range (Jan 1-31, 2024)</button>

        <button onClick={() => handleGetAttendanceByUser('user123')}>👤 Get Attendance for User ID: user123</button>

        <button onClick={handleGetAttendanceWithSorting}>📊 Get Sorted Attendance (by date, descending)</button>

        <button onClick={handleGetComplexAttendanceQuery}>🔧 Complex Query (multiple filters)</button>
      </div>

      {getAllAttendanceSuccessData && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
          <h3>📊 Latest Response Data:</h3>
          <pre style={{ fontSize: '12px', overflow: 'auto' }}>
            {JSON.stringify(getAllAttendanceSuccessData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default AttendanceExample

/**
 * 📋 **API Endpoint Documentation**
 *
 * **GET /attendance**
 *
 * **Query Parameters:**
 * - `page` (optional): Page number (default: 1)
 * - `limit` (optional): Records per page (default: 10)
 * - `status` (optional): Filter by status (Present, Absent, Late, Excused)
 * - `date` (optional): Filter by specific date (YYYY-MM-DD)
 * - `startDate` (optional): Filter from start date (YYYY-MM-DD)
 * - `endDate` (optional): Filter to end date (YYYY-MM-DD)
 * - `userId` (optional): Filter by specific user ID
 * - `sortBy` (optional): Sort field (default: 'date')
 * - `sortOrder` (optional): Sort order 'asc' or 'desc' (default: 'desc')
 *
 * **Example Requests:**
 *
 * 1. Get all records:
 *    GET /attendance
 *
 * 2. Get with pagination:
 *    GET /attendance?page=1&limit=20
 *
 * 3. Get by status:
 *    GET /attendance?status=Present&page=1&limit=50
 *
 * 4. Get by date range:
 *    GET /attendance?startDate=2024-01-01&endDate=2024-01-31
 *
 * 5. Get by user:
 *    GET /attendance?userId=user123
 *
 * 6. Get with sorting:
 *    GET /attendance?sortBy=date&sortOrder=desc
 *
 * 7. Complex query:
 *    GET /attendance?page=1&limit=20&status=Present&startDate=2024-01-01&endDate=2024-01-31&userId=user123&sortBy=date&sortOrder=desc
 */
