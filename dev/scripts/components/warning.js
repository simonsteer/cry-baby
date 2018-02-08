import React from 'react'
import { connect } from 'react-redux'

import warning from '../actions/warn-user'

@connect(
  (store => {
    return {
      user: store.user
    }
  })
)
export default class Warning extends React.Component {

  removeFromWatchlist() {
    const dbRef = firebase.database().ref(`users/${this.props.user.id}/watchlist`)
    dbRef.child(this.props.id).remove()
    this.props.dispatch(warning(false))
  }

  render() {
    return (
      <div className="warning">
        <p>
          Are you sure you want to remove {this.props.currency} from your watchlist and portfolio?
      </p>
        <div>
          <button onClick={this.removeFromWatchlist.bind(this)}>Yes</button>
          <button onClick={() => this.props.dispatch(warning(false))}>No</button>
        </div>
      </div>
    )
  }
}