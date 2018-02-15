import React from 'react'
import accounting from 'accounting'

export default class Marquee extends React.Component {
  componentDidMount() {
    this.props.start()
  }

  componentWillUnmount() {
    this.props.end()
  }

  render() {
    const { marquee, ticker, mktCap, vol24, supply } = this.props
    return (
      <span className="header__marquee">
        {ticker}
        {
          marquee === 0
          ? ` Market Cap: ${accounting.formatMoney(mktCap)}`
          : marquee === 1
          ? ` Circulating Supply: ${accounting.formatMoney(supply)}`
          : marquee === 2
          ? ` 24 Hour Volume: ${accounting.formatMoney(vol24)}`
          : null
        }
      </span>
    )
  }
}