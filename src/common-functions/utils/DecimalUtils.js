import Decimal from 'decimal.js'

export const addDecimals = (a, b) => {
  return new Decimal(a || 0)
    .plus(b || 0)
    .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
    .toFixed(2)
}
export const addDecimalsWithoutRounding = (a, b) => {
  return new Decimal(a || 0).plus(b || 0).toFixed()
}
export const subtractDecimals = (a, b) => {
  return new Decimal(a).minus(b).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed(2)
}

export const subtractDecimalsWithoutRounding = (a, b) => {
  return new Decimal(a).minus(b)
}

export const subtractPercentage = (originalAmount, percentage) => {
  return new Decimal(originalAmount).times(100).div(new Decimal(100).plus(percentage)).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed(2);
}

export const multiplyDecimals = (a, b) => {
  if (a == null || b == null) {
    return 0
  }

  return new Decimal(a).times(b).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed(2)
}
export const multiplyDecimalsWithoutRounding = (a, b) => {
  return new Decimal(a).times(b)
}
export const divideDecimals = (a, b) => {
  return new Decimal(a)
    .div(b || 1)
    .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
    .toFixed(2)
}

export const divideDecimalsWithoutRounding = (a, b) => {
  return new Decimal(a || 0)?.div(b || 1)
}
export const constlessThanOrEqual = (a, b) => {
  return new Decimal(a).comparedTo(b) <= 0
}
export const greaterThanOrEqual = (a, b) => {
  return new Decimal(a).comparedTo(b) >= 0
}
export const lessThan = (a, b) => {
  return new Decimal(a).comparedTo(b) < 0
}
export const greaterThan = (a, b) => {
  return new Decimal(a).comparedTo(b) > 0
}
export const equal = (a, b) => {
  return new Decimal(a).comparedTo(b) == 0
}
export const percentageWithoutRounding = (a, b) => {
  return new Decimal(a).times(100).div(b)
}
export const addPercentageWithoutRounding = (a, b) => {
  var totalPercentage = new Decimal(100).plus(b)
  return new Decimal(a).times(totalPercentage).div(100)
}
export const percentageOfWithoutRounding = (a, b) => {
  return new Decimal(b).times(a).div(100)
}
export const percentageOf = (percentage, originalAmount) => {
  if (percentage == null || originalAmount == null || isNaN(percentage) || isNaN(originalAmount)) {
    console.error('Invalid arguments: percentage or originalAmount is null or NaN')
    return '0.00'
  }
  return new Decimal(originalAmount).times(percentage).div(100).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed(2)
}
