import React from 'react'
import { connect } from 'react-redux'

import accounting from 'accounting'

@connect(
  (store => {
    return {
      user: store.user
    }
  })
)
export default class PortfolioItem extends React.Component {
  constructor() {
    super()
    this.state = {
      value: ''
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleEnter = this.handleEnter.bind(this)
    this.handleBlur = this.handleBlur.bind(this)
  }

  handleChange(e) {
    let value = e.target.value.slice(this.props.ticker.length + 2)
    const hasOnePeriod = value.indexOf('.') !== -1 && value.indexOf('.') === value.lastIndexOf('.')

    this.setState({
      value: hasOnePeriod
        ? value.replace(/[^\d\.]/, '')
        : parseFloat(value.replace(/[^\d\.]/, '')) || 0
    })
  }
  
  handleEnter(event) {
    const input = document.querySelector(`#${this.props.id}`)
    if (event.keyCode === 13 && document.activeElement === input) {
      document.querySelector(`#${this.props.id}`).blur()
    }
  }

  handleBlur(e) {
    const dbRef = firebase.database().ref(`users/${this.props.user.id}/watchlist/${this.props.id}`)
    dbRef.child('invested').set(Number(this.state.value))
    document.querySelector(`#${this.props.id}`).blur()
  }

  componentDidMount() {
    const dbRef = firebase.database().ref(`users/${this.props.user.id}/watchlist/${this.props.id}`)
    dbRef.on('value', (snapshot) => {
        if (snapshot.val() === null) return
        const invested = snapshot.val().invested
        this.setState({ value: invested })
    })

    window.addEventListener('keydown', this.handleEnter)
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleEnter)
  }
  
  render() {

    const total = (Number(this.state.value) * this.props.conversion)

    return (
      <div className="portfolio-item">
        <span>
          {total.toLocaleString(
            'en-US',
            {
              style: 'currency',
              currency: this.props.user.currency,
              maximumFractionDigits: 6
            })}
        </span>
        <input
          type="text"
          id={this.props.id}
          className="portfolio-item__input"
          onChange={this.handleChange}
          onBlur={this.handleBlur}
          disabled={this.state.disabled}
          placeholder={`${this.props.ticker} invested`}
          value={`${this.props.ticker}: ${this.state.value}`} />
      </div>
    )
  }
}