import axios from 'axios'
import React from 'react'
import { Route } from 'react-router-dom'

import { AddToListButton, RemoveFromListButton } from './buttons'
import Warning from './warning'

import { connect } from 'react-redux'

import { getCryptoHistory } from '../actions/get-crypto-history'
import { getUser } from '../actions/get-user'

import accounting from 'accounting'
const cc = require('cryptocompare')

@connect(store => {
  return {
    history: store.history,
    user: store.user,
    warning: store.warning
  }
})
export default class CurrencyTile extends React.Component {

  getCryptoHistory(e) {

    if (window.location.pathname !== '/search' && e.target.className !== 'currencies-tracked__remove-button') {
      this.props.dispatch(getCryptoHistory(this.props.user.lastQueried.period, this.props.ticker, this.props.user.currency))

      cc.priceFull(this.props.ticker, this.props.user.currency).then(response => {
  
        const { ticker } = this.props
        const { currency } = this.props.user

        console.log(response[ticker][currency])
        
        this.props.dispatch(getUser({
          lastQueried: {
            ticker,
            period: this.props.user.lastQueried.period,
            currency,
            marketCap: response[ticker][currency].MKTCAP,
            supply: response[ticker][currency].SUPPLY,
            volume24h: response[ticker][currency].VOLUME24HOUR,
          }
        }))
      })
    }
  }
  
  render() {
    const { price, ticker, name, id, parent } = this.props
    return (
      <li
        className="currency-tile"
        onClick={this.getCryptoHistory.bind(this)}
      >
      <div>
        <h3 className="currency-tile--currency">
          {this.props.ticker}
        </h3>
        <div className="currency-tile--currency-info">
          <span className="currency-tile__span">
            {this.props.name}
          </span>
            <span className="currency-tile__span">{accounting.formatMoney(price, { precision: 5 })}</span>
        </div>
      </div>
        <Route path="/search" render={props => <AddToListButton {...props} ticker={ticker} name={name} />} />
        {parent === 'CurrenciesTracked'
          ?
          <RemoveFromListButton id={id} currency={ticker} />
          :
          null
        }
      </li>
    )
  }
}