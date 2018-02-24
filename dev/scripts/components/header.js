import React from 'react'

import { connect } from 'react-redux'
import store from '../store'
import { getUser } from '../actions/get-user'

import Settings from './settings'
import Marquee from './marquee'

@connect(
  (store => {
    return {
      history: store.history,
      coinlist: store.coinlist,
      user: store.user
    }
  })
)
export default class Header extends React.Component {

  constructor() {
    super()
    this.state = {
      showSettings: false,
      showMarquee: false,
      marquee: 0
    }
    this.toggleSettingsPanel = this.toggleSettingsPanel.bind(this)
    this.settingsClickOut = this.settingsClickOut.bind(this)
    this.marqueeTimer = this.marqueeTimer.bind(this)
    this.startInterval = this.startInterval.bind(this)
    this.endInterval = this.endInterval.bind(this)
    this.toggleMarquee = this.toggleMarquee.bind(this)
  }

  toggleSettingsPanel() {
    this.setState({ showSettings: !this.state.showSettings })
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

  toggleMarquee(e) {
    window.innerWidth >= 500
      ?
      this.state.showMarquee === false
        ? this.setState({ showMarquee: true })
        : () => {}
      :
      this.state.showMarquee === true
        ? this.setState({ showMarquee: false })
        : () => {}
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
      document.querySelector('link').setAttribute('href', `public/styles/style-${snapshot.val()}.css`)
    })

    window.innerWidth >= 500 ? this.setState({ showMarquee: true }) : () => {}

    window.addEventListener('click', this.settingsClickOut, true)
    window.addEventListener('resize', this.toggleMarquee, true)
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.settingsClickOut, true)
    window.removeEventListener('resize', this.toggleMarquee, true)
  }

  startInterval() {
    const intervalId = setInterval(this.marqueeTimer, 5000)
    this.setState({ intervalId })
  }

  endInterval() {
    clearInterval(this.state.intervalId)
  }

  render() {

    const { ticker, marketCap, supply, volume24h, currency } = this.props.user.lastQueried
    const { marquee } = this.state

    return (
      <header>
        <h1 className="header__title">Cry-Baby</h1>
        {this.state.showMarquee ?
          <span style={{ height: '100%', overflowY: 'hidden', display: 'flex' }}>
            <Marquee
              start={this.startInterval}
              end={this.endInterval}
              ticker={ticker}
              currency={this.props.user.currency}
              marquee={marquee}
              mktCap={marketCap}
              vol24={volume24h}
              supply={supply}
            />
          </span>
        : null}
        <button
          className={this.state.showSettings ? 'header__settings-button active-button' : 'header__settings-button'}
          onClick={this.toggleSettingsPanel}
        >
          {this.state.showSettings ? 'Close' : 'Settings'}
        </button>
        {this.state.showSettings ? <Settings /> : null}
      </header>
    )
  }
}