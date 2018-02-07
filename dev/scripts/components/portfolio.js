import React from 'react'
import { Link } from 'react-router-dom'

import PortfolioItem from './portfolio-item'

import { connect } from 'react-redux'

import accounting from 'accounting'
const cc = require('cryptocompare')

@connect(
  (store => {
    return {
      user: store.user,
      scrollbar: store.scrollbar
    }
  })
)
export default class Portfolio extends React.Component {
  constructor() {
    super()
    this.state = {
      items: [],
      portfolioTotal: 0
    }
  }

  componentDidMount() {
    
    const dbRef = firebase.database().ref(`users/${this.props.user.id}`)
    
    dbRef.on('value', (snapshot) => {

      const { watchlist, currency } = snapshot.val()
      if (watchlist === null || watchlist === undefined) {
        this.setState({
          items: [],
          portfolioTotal: 0
        })
        return
      }

      let tickers = []
      let items = []
      let keys = {}

      for (let key in watchlist) {
        const item = watchlist[key]
        tickers.push(item.ticker)
        keys[item.ticker] = key
      }

      cc.priceMulti(tickers, currency).then(prices => {

        let portfolioTotal = 0

        for (let crypto in watchlist) {

          const item = watchlist[crypto]
          const invested = item.invested
          const conversion = prices[item.ticker][currency]

          portfolioTotal = portfolioTotal + (invested * conversion)

          items.push(
            <PortfolioItem
              id={keys[item.ticker]}
              key={`p${item.name}`}
              invested={item.invested}
              ticker={item.ticker}
              conversion={prices[item.ticker][currency]}
            />
          )
        }

        this.setState({
          portfolioTotal,
          items
        })

      })
    })
  }

  render() {
    return (
      <div className="portfolio" style={{ marginRight: `-${this.props.scrollbar.width}px` }}>
        <h3>Total Portfolio Value</h3>
        <h2>{accounting.formatMoney(this.state.portfolioTotal)}</h2>
        <div className="portfolio-feed">
          {this.state.items.length > 0
          ?
            this.state.items.map(item => item)
          :
            <p className="portfolio__empty-message">There aren't any currencies in your portfolio/watchlist :(<br />
            <Link to="/search">Add some from the search page</Link>.</p>
          }
        </div>
      </div>
    )
  }
}