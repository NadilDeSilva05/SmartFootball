export const rgbaToHex = (colorStr, forceRemoveAlpha = false) => {
  // Check if colorStr is valid
  if (!colorStr || typeof colorStr !== 'string') {
    return '#000000' // Return a default color if input is invalid
  }

  // Check if the input string contains '/'
  const hasSlash = colorStr.includes('/')

  if (hasSlash) {
    // Extract the RGBA values from the input string
    const rgbaValues = colorStr.match(/(\d+)\s+(\d+)\s+(\d+)\s+\/\s+([\d.]+)/)

    if (!rgbaValues || rgbaValues.length < 5) {
      // If regex doesn't match or doesn't have enough values, return a fallback
      console.warn('Invalid color format:', colorStr)

      return '#000000' // Return default color
    }

    const [red, green, blue, alpha] = rgbaValues.slice(1, 5).map(parseFloat)

    // Validate the parsed values
    if (isNaN(red) || isNaN(green) || isNaN(blue) || isNaN(alpha)) {
      console.warn('Invalid color values:', colorStr)

      return '#000000'
    }

    // Convert the RGB values to hexadecimal format
    const redHex = Math.max(0, Math.min(255, Math.round(red)))
      .toString(16)
      .padStart(2, '0')

    const greenHex = Math.max(0, Math.min(255, Math.round(green)))
      .toString(16)
      .padStart(2, '0')

    const blueHex = Math.max(0, Math.min(255, Math.round(blue)))
      .toString(16)
      .padStart(2, '0')

    // Convert alpha to a hexadecimal format (assuming it's already a decimal value in the range [0, 1])
    const alphaHex = forceRemoveAlpha
      ? ''
      : Math.round(Math.max(0, Math.min(1, alpha)) * 255)
          .toString(16)
          .padStart(2, '0')

    // Combine the hexadecimal values to form the final hex color string
    const hexColor = `#${redHex}${greenHex}${blueHex}${alphaHex}`

    return hexColor
  } else {
    // Use the second code block for the case when '/' is not present
    try {
      return (
        '#' +
        colorStr
          .replace(/^rgba?\(|\s+|\)$/g, '') // Get's rgba / rgb string values
          .split(',') // splits them at ","
          .filter((string, index) => !forceRemoveAlpha || index !== 3)
          .map(string => parseFloat(string)) // Converts them to numbers
          .map((number, index) => (index === 3 ? Math.round(number * 255) : number)) // Converts alpha to 255 number
          .map(number => Math.max(0, Math.min(255, number)).toString(16)) // Converts numbers to hex with bounds checking
          .map(string => (string.length === 1 ? '0' + string : string)) // Adds 0 when length of one number is 1
          .join('')
      )
    } catch (error) {
      console.warn('Error converting color:', colorStr, error)

      return '#000000'
    }
  }
}
