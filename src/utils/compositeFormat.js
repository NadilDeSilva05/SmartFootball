// Utility functions for form options and data formatting

/**
 * Get predefined options for form dropdowns
 * @param {string} type - The type of options to get
 * @returns {Array} Array of options with label and value properties
 */
export const getOptionsData = type => {
  const options = {
    gender: [
      { label: 'Male', value: 'male' },
      { label: 'Female', value: 'female' },
      { label: 'Other', value: 'other' }
    ],
    maritalStatus: [
      { label: 'Single', value: 'single' },
      { label: 'Married', value: 'married' },
      { label: 'Divorced', value: 'divorced' },
      { label: 'Widowed', value: 'widowed' }
    ],
    clientStatus: [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
      { label: 'Blocked', value: 'blocked' }
    ],
    attendanceStatus: [
      { label: 'Present', value: 'present' },
      { label: 'Absent', value: 'absent' },
      { label: 'Late', value: 'late' },
      { label: 'Excused', value: 'excused' }
    ]
  }

  return options[type] || []
}

/**
 * Format client data for display
 * @param {Object} client - Client data object
 * @returns {Object} Formatted client data
 */
export const formatClientData = client => {
  return {
    ...client,
    displayName: client.name || 'Unknown',
    displayEmail: client.email || 'No email',
    displayPhone: client.phone || 'No phone',
    displayGender: client.gender ? client.gender.charAt(0).toUpperCase() + client.gender.slice(1) : 'Not specified',
    displayMaritalStatus: client.maritalStatus
      ? client.maritalStatus.charAt(0).toUpperCase() + client.maritalStatus.slice(1)
      : 'Not specified',
    displayStatus: client.status ? client.status.charAt(0).toUpperCase() + client.status.slice(1) : 'Unknown',
    displayLastActivity: client.lastActivity ? new Date(client.lastActivity).toLocaleDateString() : 'Never',
    initials: client.name
      ? client.name
          .split(' ')
          .map(n => n.charAt(0))
          .join('')
          .toUpperCase()
      : 'U'
  }
}

/**
 * Validate client form data
 * @param {Object} formData - Form data to validate
 * @returns {Object} Validation result with isValid and errors
 */
export const validateClientForm = formData => {
  const errors = {}

  // Required fields
  if (!formData.name || formData.name.trim() === '') {
    errors.name = 'Name is required'
  }

  if (!formData.email || formData.email.trim() === '') {
    errors.email = 'Email is required'
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = 'Email format is invalid'
  }

  if (!formData.phone || formData.phone.trim() === '') {
    errors.phone = 'Phone number is required'
  } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
    errors.phone = 'Phone number format is invalid'
  }

  // Optional field validations
  if (formData.dateOfBirth && new Date(formData.dateOfBirth) > new Date()) {
    errors.dateOfBirth = 'Date of birth cannot be in the future'
  }

  if (
    formData.emergencyPhone &&
    formData.emergencyPhone.trim() !== '' &&
    !/^\+?[\d\s\-\(\)]{10,}$/.test(formData.emergencyPhone)
  ) {
    errors.emergencyPhone = 'Emergency phone number format is invalid'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = date => {
  if (!date) return 'Not specified'

  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    return 'Invalid date'
  }
}

/**
 * Format phone number for display
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = phone => {
  if (!phone) return 'No phone'

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')

  // Format as (XXX) XXX-XXXX for US numbers
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }

  // For international numbers, just return as is
  return phone
}

/**
 * Generate avatar URL or initials
 * @param {Object} client - Client data
 * @returns {Object} Avatar info with url and initials
 */
export const getAvatarInfo = client => {
  return {
    url: client.avatar || null,
    initials: client.name
      ? client.name
          .split(' ')
          .map(n => n.charAt(0))
          .join('')
          .toUpperCase()
      : 'U',
    backgroundColor: client.isFavorite ? '#ff4444' : '#1976d2'
  }
}

/**
 * Filter clients based on search and filter criteria
 * @param {Array} clients - Array of client objects
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered clients
 */
export const filterClients = (clients, filters) => {
  if (!Array.isArray(clients)) return []

  return clients.filter(client => {
    // Search filter
    if (filters.search && filters.search.trim() !== '') {
      const searchLower = filters.search.toLowerCase()
      const matchesSearch =
        client.name?.toLowerCase().includes(searchLower) ||
        client.email?.toLowerCase().includes(searchLower) ||
        client.phone?.toLowerCase().includes(searchLower)

      if (!matchesSearch) return false
    }

    // Status filters
    if (filters.all) {
      return true
    }

    if (filters.favorite !== null && client.isFavorite !== filters.favorite) {
      return false
    }

    if (filters.archived !== null && client.isArchived !== filters.archived) {
      return false
    }

    // Gender filter
    if (filters.gender && client.gender !== filters.gender.value) {
      return false
    }

    // Marital status filter
    if (filters.maritalStatus && client.maritalStatus !== filters.maritalStatus.value) {
      return false
    }

    return true
  })
}

export default {
  getOptionsData,
  formatClientData,
  validateClientForm,
  formatDate,
  formatPhoneNumber,
  getAvatarInfo,
  filterClients
}
