import React from 'react'
import { Link } from 'react-router-dom'

import { connect } from 'react-redux'

import warning from '../actions/warn-user'
import changeRoute from '../actions/change-route'

@connect(store => {
  return {
    route: store.route
  }
})
class AddMoreButton extends React.Component {
  render() {
    return (
      <Link to="/search" onClick={() => this.props.dispatch(changeRoute('search'))}>
        Add More
      </Link>
    )
  }
}

@connect(store => {
  return {
    route: store.route
  }
})
class CloseSearchButton extends React.Component {
  render() {
    return (
      <Link to="/" onClick={() => this.props.dispatch(changeRoute('/'))} className="active-button">
        Close
      </Link>
    )
  }
}

@connect(store => {
  return {
    history: store.history,
    user: store.user
  }
})
class AddToListButton extends React.Component {

  constructor() {
    super();
    this.addToWatchList = this.addToWatchList.bind(this)
  }

  addToWatchList() {
    const dbRef = firebase.database().ref(`users/${this.props.user.id}/watchlist`)
    dbRef.push({
      ticker: this.props.ticker,
      name: this.props.name,
      invested: 0
    })
  }

  render() {
    return (
      <button className="search-module__button" onClick={this.addToWatchList}>
        Add to List
      </button>
    )
  }
}

@connect(store => {
  return {
    history: store.history,
    user: store.user
  }
})
class RemoveFromListButton extends React.Component {

  constructor() {
    super();
    this.warnUser = this.warnUser.bind(this)
  }

  warnUser() {
    const { currency, id, dispatch } = this.props
    dispatch(warning(true, currency, id))
  }

  render() {
    return (
      <button className="currencies-tracked__remove-button" onClick={this.warnUser}>
        –
      </button>
    )
  }
}

const LoginButton = () => {
  return (
    <button className="login__button">
      Login with Google
    </button>
  )
}

module.exports = {
  AddMoreButton,
  CloseSearchButton,
  AddToListButton,
  RemoveFromListButton,
  LoginButton,
}