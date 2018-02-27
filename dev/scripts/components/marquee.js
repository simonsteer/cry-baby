import React from 'react'
export default class Marquee extends React.Component {
  componentDidMount() {
    this.props.start()
  }

  componentWillUnmount() {
    this.props.end()
  }

  render() {
    const { marquee, ticker, mktCap, vol24, supply, currency } = this.props
    return (
      <span className="header__marquee">
        {ticker}
        {
          marquee === 0
          ? ` Market Cap: ${mktCap.toLocaleString(
                currency === 'CNY' ? 'zh-Hans-CN' : 'en-US',
                {
                  style: 'currency',
                  currency: currency === 'USD' || currency === 'CAD' || currency === 'AUD' ? 'USD' : currency,
                  maximumFractionDigits: 6
                })}`
          : marquee === 1
          ? ` Circulating Supply: ${supply.toLocaleString(
                  currency === 'CNY' ? 'zh-Hans-CN' : 'en-US',
                {
                  style: 'currency',
                  currency: currency === 'USD' || currency === 'CAD' || currency === 'AUD' ? 'USD' : currency,
                  maximumFractionDigits: 6
                })}`
          : marquee === 2
          ? ` 24 Hour Volume: ${vol24.toLocaleString(
                  currency === 'CNY' ? 'zh-Hans-CN' : 'en-US',
                {
                  style: 'currency',
                  currency: currency === 'USD' || currency === 'CAD' || currency === 'AUD' ? 'USD' : currency,
                  maximumFractionDigits: 6
                })}`
          : null
        }
      </span>
    )
  }
}