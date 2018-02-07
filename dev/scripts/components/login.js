import React from 'react'
import { connect } from 'react-redux'

import { getUser } from '../actions/get-user'

const config = {
  apiKey: "AIzaSyB9tTd-Xd3X2MkfWP8cu6yGU1RN7XmjDZ4",
  authDomain: "cry-bb.firebaseapp.com",
  databaseURL: "https://cry-bb.firebaseio.com",
  projectId: "cry-bb",
  storageBucket: "cry-bb.appspot.com",
  messagingSenderId: "75965572699"
};
firebase.initializeApp(config);

const provider = new firebase.auth.GoogleAuthProvider();
const cc = require('cryptocompare')

@connect(
  (store => {
    return {
      user: store.user
    }
  })
)
export default class Login extends React.Component {
  constructor() {
    super()
    this.login = this.login.bind(this)
  }

  login() {
    firebase.auth().signInWithPopup(provider)
      .then(user => {
      
        const dbRef = firebase.database().ref(`users`)

        dbRef.once('value', (snapshot) => {
          // We can use a variable with a boolean value to determine whether the user exists or not. We will start it with a falsey value, then change it to a truthy value if the user does exist.
          let userExists = false;
          // This for...in loop runs through the 'users' directory, and checks to see if the UID matches any UIDs that exist in that directory. If it does match, then send the user info to the store
          for (let u in snapshot.val()) {
            if (u === user.user.uid) {
              userExists = true
            }
          }
          // If the for...in loop could not match the user's email with any emails that already exist in the directory, then the user doesn't exist yet, we will have to create a directory for that user using .set()
          const fb = firebase.database().ref(`users/${user.user.uid}`)
          if (userExists === false) {
            fb.child('theme').set('black')
            fb.child('currency').set('USD')
            fb.child('watchlist').push(
              {
                name: 'Bitcoin',
                ticker: 'BTC',
                invested: 0
              })
            fb.child('watchlist').push(
              {
                name: 'Etherium',
                ticker: 'ETH',
                invested: 0
              })
            fb.child('watchlist').push(
              {
                name: 'DigitalCash',
                ticker: 'DASH',
                invested: 0
              })
          }
          // We then read get the user's information in firebase once
          // The user is then dispatched to the store

          fb.once('value', u => {

            let watchlist = []
            for (let key in u.val().watchlist) {
              watchlist.push(u.val().watchlist[key])
            }

            let ticker
            if (watchlist.length > 0) {
              ticker = watchlist[0].ticker
            } else {
              ticker = 'BTC'
            }

            const currency = u.val().currency

            cc.priceFull(ticker, currency).then(response => {


              console.log(response, ticker, currency)

              this.props.dispatch(getUser({
                lastQueried: {
                  ticker,
                  period: '6 months',
                  currency,
                  marketCap: response[ticker][currency].MKTCAP,
                  supply: response[ticker][currency].SUPPLY,
                  volume24h: response[ticker][currency].VOLUME24HOUR,
                },
                id: user.user.uid,
                watchlist,
                currency
              }))
            })

          })

        })
      })
  }

  render() {
    return (
      <section className="login">
        <h3 className="login__header">Cry-Baby</h3>
        <p className="login__p">One place to check all your cryptocurrencies</p>
        <button
        className="login__button"
        onClick={this.login}
        >
          Login with Google
        </button>
      </section>
    )
  }
}