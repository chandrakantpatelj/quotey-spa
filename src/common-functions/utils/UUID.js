export function generateRandomId(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let randomId = ''

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    randomId += characters.charAt(randomIndex)
  }

  return randomId
}

export function generateUniqueId() {
  // Get current timestamp in milliseconds
  const timestamp = new Date().getTime()

  // Generate a random number between 100000 and 999999
  const randomNum = Math.floor(Math.random() * 900000) + 100000

  // Combine timestamp and random number to create a unique ID
  const uniqueId = `${timestamp}${randomNum}`

  // Extract the last 6 digits to ensure a 6-digit ID
  const sixDigitId = uniqueId.slice(-6)

  return sixDigitId
}
