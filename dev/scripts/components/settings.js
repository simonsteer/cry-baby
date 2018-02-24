import React from 'react'

import { connect } from 'react-redux'

import store from '../store'
import { getUser } from '../actions/get-user'

@connect(
  (store => {
    return {
      user: store.user
    }
  })
)
export default class Settings extends React.Component {

  constructor() {
    super()
    this.state = {
      currencies: ['AUD', 'CAD', 'EUR', 'GBP', 'JPY', 'KRW', 'CNY', 'USD'],
      showCurrencyList: false
    }
    this.logout = this.logout.bind(this)
    this.changeTheme = this.changeTheme.bind(this)
    this.showCurrencyList = this.showCurrencyList.bind(this)
    this.exitCurrencyList = this.exitCurrencyList.bind(this)
    this.changeCurrency = this.changeCurrency.bind(this)
  }

  logout(e) {
    e.preventDefault();
    firebase.auth().signOut()
      .then(() => {
        this.props.dispatch(getUser({
          id: '',
          theme: '',
          watchlist: []
        }))
      })
  }

  changeTheme(stylesheet) {
    const dbRef = firebase.database().ref(`users/${this.props.user.id}/theme`)
    dbRef.set(stylesheet)
  }

  showCurrencyList() {
    this.setState({
      showCurrencyList: true
    })
  }

  exitCurrencyList() {
    this.setState({
      showCurrencyList: false,
    })
  }
  
  changeCurrency(cur) {
    if (cur === this.props.user.currency) return;
    const dbRef = firebase.database().ref(`users/${this.props.user.id}`)
    dbRef.child('currency').set(cur)
    dbRef.once('value', snapshot => {
      this.props.dispatch(getUser(snapshot.val()))
    })
  }

  componentWillUnmount() {
    this.setState({
      showCurrencyList: false,
    })
    window.removeEventListener('click', this.exitCurrencyList, true)
  }

  componentDidMount() {
    window.addEventListener('click', this.exitCurrencyList, true)
  }


  render() {
    const index = this.state.currencies.indexOf(this.props.user.currency)
    let currencies = this.state.currencies
    currencies = currencies.filter(cur => cur !== this.props.user.currency)
    currencies.unshift(this.props.user.currency)
    return (
      <div className="settings">
        <ul className="settings-list">
          <li className="settings__theme">
            <div>Interface Color</div>
            <div>
              <button
                className="settings__button"
                onClick={() => this.changeTheme('black')}
              >
                Black
            </button>
              <button
                className="settings__button"
                onClick={() => this.changeTheme('white')}
              >
                White
            </button>
            </div>
          </li>
          <li className="settings__currency">
            <div>Currency</div>
            <ul
              className={this.state.showCurrencyList ? "currency-list open" : "currency-list" }
              onClick={this.showCurrencyList}
            >
              {currencies.map(cur => {
                return <li className="currency-list__item" key={cur} onClick={() => this.changeCurrency(cur)}>{cur}</li>
              })}
            </ul>
          </li>
          <li className="settings__logout">
            <button
              className="settings__button"
              onClick={this.logout}
            >
              Logout
            </button>
            <span>Donate BTC: 3CERXT7P2SfGLnAZQP7Z4rXCzYAfNtRNgd</span>
            <span>Donate ETH: 0x3cdfcb1cfe97b79f1cc6f83789837789c8ccd1b5</span>
            <span>Donate LTC: LcBYSHqDj6XsQgGeEM1fUJfv2CPYgjvtwG</span>
            <a href="mailto:hello@56.digital">contact</a>
          </li>
        </ul>
      </div>
    )
  }
}