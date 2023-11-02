export const creditFormat = (credits, modifier = 1000000) => {
  const number = credits / modifier

  return new Intl
    .NumberFormat('en-US', {style: 'currency', currency: 'USD'})
    .format(number)
}

export function dateFormat(dateString) {
  const date = new Date(dateString)
  const day = date.getDate().toString().padStart(2, '0')
  const year = date.getFullYear()
  const monthArray = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const month = monthArray[date.getMonth()]
  return `${month} ${day}, ${year}`
}
