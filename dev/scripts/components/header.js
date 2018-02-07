import React from 'react'

import { connect } from 'react-redux'
import store from '../store'
import { getUser } from '../actions/get-user'

import Settings from './settings'

import accounting from 'accounting'

@connect(
  (store => {
    return {
      history: store.history,
      coinlist: store.coinlist,
      user: store.user,
    }
  })
)
export default class Header extends React.Component {
  
  constructor() {
    super()
    this.state = {
      showSettings: false,
      marquee: 0
    }
    this.toggleSettingsPanel = this.toggleSettingsPanel.bind(this)
    this.settingsClickOut = this.settingsClickOut.bind(this)
    this.marqueeTimer = this.marqueeTimer.bind(this)
  }

  toggleSettingsPanel() {
    this.setState({showSettings: !this.state.showSettings})
  }

  marqueeTimer() {
    const { marquee } = this.state
    if (marquee < 2) {
      this.setState({
        marquee: marquee + 1
      })
    } else {
      this.setState({
        marquee: 0
      })
    }
  }

  settingsClickOut(e) {

    if (e.target.className === 'header__settings-button active-button') return

    const settings = document.querySelector('.settings')
    const header = document.querySelector('header')
    
    if (settings === null) return

    const
      startX = settings.offsetLeft,
      endX = settings.offsetLeft + settings.clientWidth,
      startY = settings.offsetTop,
      endY = settings.offsetTop + settings.clientHeight
    
    const leave =
      e.clientX < startX ||
      e.clientX > endX ||
      e.clientY < startY ||
      e.clientY > endY

    if (leave && e.target.className !== 'currency-list__item') this.toggleSettingsPanel()    

  }

  componentDidMount() {
    const theme = firebase.database().ref(`users/${this.props.user.id}/theme`)
    theme.on('value', snapshot => {
      this.props.dispatch(getUser({ theme: snapshot.val() }))
    })
    window.addEventListener('click', this.settingsClickOut, true)

    const intervalId = setInterval(this.marqueeTimer, 3000)
    this.setState({ intervalId })

  }

  componentWillUnmount() {
    clearInterval(this.state.intervalId)
  }

  render() {

    const { ticker, marketCap, supply, volume24h, currency } = this.props.user.lastQueried
    const { marquee } = this.state
    document.querySelector('link').setAttribute('href', `public/styles/style-${this.props.user.theme}.css`)

    return (
      <header>
        <h1 className="header__title">Cry-Baby</h1>
        <span className="header__marquee">
          {ticker}
          {marquee === 0
            ? ` Market Cap: ${accounting.formatMoney(marketCap)}`
            : marquee === 1
            ? ` Circulating Supply: ${accounting.formatMoney(supply)}`
            : marquee === 2
            ? ` 24 Hour Volume: ${accounting.formatMoney(volume24h)}`
            : null
          }
        </span>
        <button
          className={this.state.showSettings ? 'header__settings-button active-button' : 'header__settings-button'}
          onClick={this.toggleSettingsPanel}
        >
          {this.state.showSettings ? 'Close' : 'Settings' }
        </button>
        {this.state.showSettings ? <Settings /> : null }
      </header>
    )
  }
}