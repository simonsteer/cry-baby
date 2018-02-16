const initialState = {
  path: '/'
}

export default (state = initialState, action) => {
  switch (action.type) {
    case 'CHANGE_ROUTE':
      return {
        ...state,
        path: action.payload
      }
    default:
      return state
  }
}