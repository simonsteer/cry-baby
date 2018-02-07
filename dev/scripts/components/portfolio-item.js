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
    const value = e.target.value.slice(this.props.ticker.length + 2)
    this.setState({
      value
    })
  }
  
  handleEnter(event) {
    const input = document.querySelector(`#${this.props.id}`)
    if (event.keyCode === 13 && document.activeElement === input) {
      document.querySelector(`#${this.props.id}`).blur()
    }
  }

  handleBlur() {
    const dbRef = firebase.database().ref(`users/${this.props.user.id}/watchlist/${this.props.id}`)
    dbRef.child('invested').set(this.state.value)
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
        <span>${accounting.formatNumber(total)}</span>
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