import { combineReducers } from 'redux'

import user from './user-reducer'
import history from './history-reducer'
import coinlist from './coin-reducer'
import coinlistdata from './coin-reducer'
import news from './news-reducer'
import scrollbar from './scrollbar-width-reducer'
import warning from './warning-reducer'

export default combineReducers({
  user,
  history,
  coinlist,
  coinlistdata,
  news,
  scrollbar,
  warning
})