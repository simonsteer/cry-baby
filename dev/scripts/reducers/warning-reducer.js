const initialState = {}

export default (state = initialState, action) => {
  switch (action.type) {
    case 'WARN_USER':
      return {
        ...state,
        ...action.payload
      }
    default:
      return state
  }
}