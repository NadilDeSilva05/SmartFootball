// Client form options and utility functions

// Form dropdown options
export const getFormOptions = type => {
  const options = {
    titles: [
      { label: 'Mr.', value: 'Mr.' },
      { label: 'Mrs.', value: 'Mrs.' },
      { label: 'Ms.', value: 'Ms.' },
      { label: 'Dr.', value: 'Dr.' },
      { label: 'Prof.', value: 'Prof.' },
      { label: 'Rev.', value: 'Rev.' }
    ],

    genderTypes: [
      { label: 'Male', value: 'Male' },
      { label: 'Female', value: 'Female' },
      { label: 'Other', value: 'Other' },
      { label: 'Prefer not to say', value: 'Prefer not to say' }
    ],

    maritalStatus: [
      { label: 'Single', value: 'Single' },
      { label: 'Married', value: 'Married' },
      { label: 'Divorced', value: 'Divorced' },
      { label: 'Widowed', value: 'Widowed' },
      { label: 'Separated', value: 'Separated' }
    ],

    attendanceStatus: [
      { label: 'Pending', value: 'Pending' },
      { label: 'Accepted', value: 'Accepted' },
      { label: 'Declined', value: 'Declined' },
      { label: 'Maybe', value: 'Maybe' }
    ],

    mealPreferences: [
      { label: 'Non-Vegetarian', value: 'non-vegetarian' },
      { label: 'Vegetarian', value: 'vegetarian' },
      { label: 'Vegan', value: 'vegan' },
      { label: 'Gluten-Free', value: 'gluten-free' },
      { label: 'Halal', value: 'halal' },
      { label: 'Kosher', value: 'kosher' },
      { label: 'Other', value: 'other' }
    ],

    beveragePreferences: [
      { label: 'Alcohol', value: true },
      { label: 'Non-Alcohol', value: false }
    ],

    relationshipTypes: [
      { label: 'Self', value: 'Self' },
      { label: 'Spouse', value: 'Spouse' },
      { label: 'Parent', value: 'Parent' },
      { label: 'Child', value: 'Child' },
      { label: 'Sibling', value: 'Sibling' },
      { label: 'Friend', value: 'Friend' },
      { label: 'Colleague', value: 'Colleague' },
      { label: 'Other', value: 'Other' }
    ],

    clientStatus: [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
      { label: 'Blocked', value: 'blocked' },
      { label: 'Pending', value: 'pending' }
    ]
  }

  return options[type] || []
}

// Format client name
export const formatClientName = client => {
  if (!client) return 'Unknown Client'

  const { title, firstName, middleName, lastName, preferredName } = client

  if (preferredName) {
    return preferredName
  }

  let name = ''
  if (title) name += `${title} `
  if (firstName) name += firstName
  if (middleName) name += ` ${middleName}`
  if (lastName) name += ` ${lastName}`

  return name.trim() || 'Unknown Client'
}

// Format phone number
export const formatPhoneNumber = phone => {
  if (!phone) return ''

  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '')

  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }

  return phone // Return original if can't format
}

// Validate email format
export const isValidEmail = email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate phone number
export const isValidPhone = phone => {
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/
  return phoneRegex.test(phone)
}

// Generate client initials
export const getClientInitials = client => {
  if (!client) return '??'

  const { firstName, lastName, preferredName } = client

  if (preferredName) {
    const names = preferredName.split(' ')
    return names.length > 1
      ? `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase()
      : preferredName.substring(0, 2).toUpperCase()
  }

  const first = firstName?.charAt(0) || '?'
  const last = lastName?.charAt(0) || '?'

  return `${first}${last}`.toUpperCase()
}

// Format date for display
export const formatDate = (date, format = 'short') => {
  if (!date) return ''

  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) return ''

  const options = {
    short: {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    },
    long: {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    },
    time: {
      hour: '2-digit',
      minute: '2-digit'
    }
  }

  return dateObj.toLocaleDateString('en-US', options[format] || options.short)
}

// Get status color
export const getStatusColor = status => {
  const colors = {
    active: 'success',
    inactive: 'default',
    blocked: 'error',
    pending: 'warning',
    Accepted: 'success',
    Declined: 'error',
    Pending: 'warning',
    Maybe: 'info'
  }

  return colors[status] || 'default'
}

// Filter clients based on criteria
export const filterClients = (clients, filters) => {
  if (!clients || !Array.isArray(clients)) return []

  return clients.filter(client => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      const fullName = formatClientName(client).toLowerCase()
      const email = client.primaryEmailAddress?.toLowerCase() || ''
      const phone = client.primaryMobileNumber || ''

      if (!fullName.includes(searchTerm) && !email.includes(searchTerm) && !phone.includes(searchTerm)) {
        return false
      }
    }

    // Gender filter
    if (filters.gender && client.gender !== filters.gender) {
      return false
    }

    // Marital status filter
    if (filters.maritalStatus && client.maritalStatus !== filters.maritalStatus) {
      return false
    }

    // Attendance filter
    if (filters.attendance && client.attendance !== filters.attendance) {
      return false
    }

    // Favorite filter
    if (filters.isFavorite !== null && client.isFavorite !== filters.isFavorite) {
      return false
    }

    // Archive filter
    if (filters.isArchived !== null && client.isArchived !== filters.isArchived) {
      return false
    }

    // Status filter
    if (filters.status && client.status !== filters.status) {
      return false
    }

    return true
  })
}

// Sort clients
export const sortClients = (clients, sortBy = 'name', sortOrder = 'asc') => {
  if (!clients || !Array.isArray(clients)) return []

  return [...clients].sort((a, b) => {
    let aValue, bValue

    switch (sortBy) {
      case 'name':
        aValue = formatClientName(a).toLowerCase()
        bValue = formatClientName(b).toLowerCase()
        break
      case 'email':
        aValue = a.primaryEmailAddress?.toLowerCase() || ''
        bValue = b.primaryEmailAddress?.toLowerCase() || ''
        break
      case 'phone':
        aValue = a.primaryMobileNumber || ''
        bValue = b.primaryMobileNumber || ''
        break
      case 'created':
        aValue = new Date(a.createdAt || 0)
        bValue = new Date(b.createdAt || 0)
        break
      case 'lastActivity':
        aValue = new Date(a.lastActivity || 0)
        bValue = new Date(b.lastActivity || 0)
        break
      default:
        aValue = a[sortBy] || ''
        bValue = b[sortBy] || ''
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
    return 0
  })
}

// Paginate clients
export const paginateClients = (clients, page = 1, pageSize = 10) => {
  if (!clients || !Array.isArray(clients)) return { clients: [], totalPages: 0, totalCount: 0 }

  const totalCount = clients.length
  const totalPages = Math.ceil(totalCount / pageSize)
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize

  return {
    clients: clients.slice(startIndex, endIndex),
    totalPages,
    totalCount,
    currentPage: page,
    hasNext: page < totalPages,
    hasPrev: page > 1
  }
}

// Export client data to CSV
export const exportToCSV = (clients, filename = 'clients.csv') => {
  if (!clients || !Array.isArray(clients) || clients.length === 0) return

  const headers = [
    'Name',
    'Email',
    'Phone',
    'Gender',
    'Attendance',
    'Meal Preference',
    'Number of Guests',
    'Status',
    'Created Date'
  ]

  const csvData = clients.map(client => [
    formatClientName(client),
    client.primaryEmailAddress || '',
    client.primaryMobileNumber || '',
    client.gender || '',
    client.attendance || '',
    client.mealPreferences || '',
    client.numberOfGuests || '0',
    client.status || 'active',
    formatDate(client.createdAt)
  ])

  const csvContent = [headers.join(','), ...csvData.map(row => row.map(field => `"${field}"`).join(','))].join('\n')

  // Create download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

// Generate mock client data for testing
export const generateMockClient = (overrides = {}) => {
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'James', 'Lisa', 'Robert', 'Anna']
  const lastNames = [
    'Smith',
    'Johnson',
    'Williams',
    'Brown',
    'Jones',
    'Garcia',
    'Miller',
    'Davis',
    'Rodriguez',
    'Martinez'
  ]
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  const domain = domains[Math.floor(Math.random() * domains.length)]

  return {
    id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: getFormOptions('titles')[Math.floor(Math.random() * getFormOptions('titles').length)].value,
    firstName,
    lastName,
    preferredName: Math.random() > 0.7 ? `${firstName} ${lastName}` : '',
    gender: getFormOptions('genderTypes')[Math.floor(Math.random() * getFormOptions('genderTypes').length)].value,
    primaryEmailAddress: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
    primaryMobileNumber: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    whatsappNumber: Math.random() > 0.5 ? `+1${Math.floor(Math.random() * 9000000000) + 1000000000}` : '',
    attendance:
      getFormOptions('attendanceStatus')[Math.floor(Math.random() * getFormOptions('attendanceStatus').length)].value,
    numberOfGuests: Math.floor(Math.random() * 5) + 1,
    mealPreferences:
      getFormOptions('mealPreferences')[Math.floor(Math.random() * getFormOptions('mealPreferences').length)].value,
    alcoholic: Math.random() > 0.5,
    message: Math.random() > 0.7 ? 'Special dietary requirements' : '',
    status: getFormOptions('clientStatus')[Math.floor(Math.random() * getFormOptions('clientStatus').length)].value,
    isFavorite: Math.random() > 0.8,
    isArchived: Math.random() > 0.9,
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivity: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    ...overrides
  }
}

// Validation schemas for forms
export const getValidationSchema = (formType = 'create') => {
  const baseSchema = {
    title: 'string',
    firstName: 'string|required',
    lastName: 'string|required',
    gender: 'string|required',
    primaryEmailAddress: 'email|required',
    primaryMobileNumber: 'phone|required'
  }

  const eventSchema = {
    ...baseSchema,
    attendance: 'string|required'
  }

  return formType === 'event' ? eventSchema : baseSchema
}
