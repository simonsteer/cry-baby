import React from 'react'
import axios from 'axios'
import store from '../store'
import { connect } from 'react-redux'

import Loading from './loading'
import { draw } from '../graph/draw'

import { getCryptoHistory } from '../actions/get-crypto-history'
import { getUser } from '../actions/get-user'

const cc = require('cryptocompare')

@connect(
  (store => {
    return {
      user: store.user,
      history: store.history,
      coins: store.coinlist
    }
  })
)
export default class Graph extends React.Component {

  constructor() {
    super()
    this.state = {
      increments: {
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      }
    }
  }

  getCryptoHistory(period, ticker, currency) {
    this.props.dispatch(getCryptoHistory(period, ticker, currency)).then(() => {
      cc.priceFull(ticker, currency).then(response => {
        this.props.dispatch(getUser({
          currency,
          lastQueried: {
            ticker,
            currency,
            period,
            marketCap: response[ticker][currency].MKTCAP,
            supply: response[ticker][currency].SUPPLY,
            volume24h: response[ticker][currency].VOLUME24HOUR,
          }
        }))
      })
    })
  }
  
  componentDidMount() {

    const dbRef = firebase.database().ref(`users/${this.props.user.id}/currency`)
    dbRef.on('value', snapshot => {
      const currency = snapshot.val()
      const { period, ticker } = this.props.user.lastQueried
      const watchlist = this.props.user.watchlist
      
      if (watchlist === undefined || watchlist === null) {
        this.getCryptoHistory('6 months', 'BTC', currency)
        return
      }
      this.getCryptoHistory(period, ticker, currency)
    })
  }

  componentDidUpdate() {

    const { list: history } = this.props.history
    const { theme, currency } = this.props.user
    const dataToPlot = history.map(date => {
      return date.close
    })

    if (history.length > 0) {

      let drawcolor
      if (theme === 'black') {
        drawcolor = 'rgb(239, 239, 239)'
      } else {
        drawcolor = 'rgb(166, 166, 166)'
      }
      draw(dataToPlot, history, drawcolor, currency)

      window.removeEventListener('resize', () => draw(dataToPlot, history, drawcolor, currency), true)
      window.addEventListener('resize', () => draw(dataToPlot, history, drawcolor, currency), true)
      
    }
  }

  render() {

    const { ticker, currency, period } = this.props.user.lastQueried

    const divisor =
      period === 'week'
      ? 7
      : period === '3 months'
      ? 3
      : period === '6 months'
      ? 6
      : 12

    const increments =
      period === 'week'
      ? this.state.increments.days
      : this.state.increments.months

    const today = new Date()
    let calendar = []

    for (var i = divisor; i > 0; i -= 1) {
      const d = 
        period === 'week'
          ? i - 1 - today.getDay()
          : new Date(today.getFullYear(), today.getMonth() - i + 1, 1)

      const n = increments[
        period === 'week'
          ? d
          : d.getMonth()
      ];

      period === 'week'
        ? calendar.unshift(n)
        : calendar.push(n)
    }

    console.log(calendar)

    const width = (100 / divisor)
    const buffer = ((365 / 12) - new Date().getDate()) / divisor

    return (
      <div className="graph-container">
      {this.props.history.fetching
        ?
          <Loading />
        :
          <section className="graph">
            <div className="graph__marker">
              <div className="graph__dot">
                <h3 className="graph__header">dd/mm/yyyy: $0.00</h3>
              </div>
            </div>
            <ul className="graph__time-increment" ref="incrementContainer">
              {calendar.map((inc, i) =>
                <li
                  key={inc}
                  style={{
                    width:
                      !i
                        ? `${width - buffer}%`
                        : `${width}%`,
                    marginLeft: !i ? `${buffer}%` : 0
                  }}>
                  {inc}
                </li>)}
            </ul>
            <canvas id="canvas">
            </canvas>
            <ul className="graph__time-options">
              <li
                className={period === 'week' ? 'time-option__active' : ''}
                onClick={() => this.getCryptoHistory('week', ticker, currency)}>1 Week</li>
              <li
                className={period === '3 months' ? 'time-option__active' : ''}
                onClick={() => this.getCryptoHistory('3 months', ticker, currency)}>3 Months</li>
              <li
                className={period === '6 months' ? 'time-option__active' : ''}
                onClick={() => this.getCryptoHistory('6 months', ticker, currency)}>6 Months</li>
              <li
                className={period === 'year' ? 'time-option__active' : ''}
                onClick={() => this.getCryptoHistory('year', ticker, currency)}>1 Year</li>
            </ul>
          </section>
      }
      </div>
    )
  }
}