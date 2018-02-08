export default function warning(show = false, currency = null, id = null) {
  return {
    type: 'WARN_USER',
    payload: {
      show,
      currency,
      id
    }
  }
}