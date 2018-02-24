import React from 'react'
import CurrencyTile from './currency-tile'
import Loading from './loading'

import { connect } from 'react-redux'
import { getCoinlist } from '../actions/get-coinlist'
import { getCoinlistData } from '../actions/get-coinlist-data'

@connect(store => {
  return {
    user: store.user,
    coinlist: store.coinlist,
    coinlistdata: store.coinlistdata,
    scrollbar: store.scrollbar
  }
})
export default class Search extends React.Component {
  constructor() {
    super()
    this.state = {
      cryptos: [],
      page: 0,
      results: []
    }
    this.getCoins = this.getCoins.bind(this)
    this.tiles = this.tiles.bind(this)
    this.pageLoader = this.pageLoader.bind(this)
    this.handleSearchInput = this.handleSearchInput.bind(this)
    this.handleSearchEnter = this.handleSearchEnter.bind(this)
  }


  getCoins() {

    // Remove the scroll event listener when getCoins fires
    // This will prevent multiple API calls from bubbling up before previous ones finish
    const search = document.querySelector('.search-module')
    search.removeEventListener('scroll', this.pageLoader)

    let { cryptos, page, results } = this.state

    // List is declared as an array of 40 cryptocurrencies
    // The page the user is on will determine where the list will be sliced out of the total array of cryptocurreny tickers from
    // eg. page 0 will slice at (0, 40), page 1 at (40, 80), etc.
    const list = cryptos.slice(page * 40, (page + 1) * 40)

    // When the list of 40 cryptocurrencies has been sliced, get the data for each coin to be displayed
    this.props.dispatch(getCoinlistData(list, this.props.user.currency)).then(response => {
      
      // For each cryptocurrency queried, push that information into the results
      for (let key in response.value) {
       results.push({ [key]: response.value[key] })
      }
      
      // Set the state of results to the previous array plus the new 40 cryptocurrencies
      // Re-attach the scroll event listener for the search container
      this.setState({
        results,
        page: page + 1
      }, () => {
        search.addEventListener('scroll', this.pageLoader)
      })

    })
  }

  pageLoader(event) {
    const { scrollHeight, scrollTop, clientHeight } = event.target

    // Check if the user has scrolled to the bottom of the search container
    // If they have, call getCoins to load the next 40 results
    if (scrollHeight - scrollTop === clientHeight) {
      this.getCoins()
    }
  }

  // to be called in the render
  tiles = () => {

    // Create an empty array to hold all of the search result items to append to the search module
    let tiles = []
    const list = this.state.results

    // Loop through the search results data, push a CurrencyTile into the empty array per search result item
    // Pass in the necessary data to display as props on each CurrencyTile
    for (let i = 0; i < list.length; i++) {
      const ticker = Object.keys(list[i])[0]
      tiles.push(
        <CurrencyTile
          ticker={ticker}
          name={this.props.coinlist.list[ticker].CoinName}
          key={ticker}
          price={list[i][ticker][this.props.user.currency]}
        />)
    }

    // Return the populated array of CurrencyTiles
    return tiles

  }
    
  componentDidMount() {

    const dbRef = firebase.database().ref(`users/${this.props.user.id}/currency`)

    // Check for what the user has set as their native currency, then:
    dbRef.on('value', () => {

      // Reset the state in case there are too many results for the API to query
      this.setState({
        cryptos: [],
        page: 0,
        results: []
      }, () => {

        // after state has been reset, get the list of cryptocurrencies available to query
        this.props.dispatch(getCoinlist()).then(() => {
          // set state on the component to an array of tickers with Object.keys()
          this.setState({
            cryptos: Object.keys(this.props.coinlist.list)
          }, () => {
            // call getCoins to update the state of [results] to the first 40 coins in the list
            this.getCoins()
          })
        })
      })
    })
  }

  handleSearchEnter(event) {
    const search = document.querySelector('.search-module__input')
    if (event.keyCode === 13 && document.activeElement === search) {
      this.handleSearchInput(search.value)
      search.value = ''
    }
  }

  handleSearchInput(input) {
    const string = new RegExp(input, 'i')
    let list = this.props.coinlist.list
    let tickers = Object.keys(this.props.coinlist.list)

    let cryptos = []

    for (let i = 0; i < tickers.length; i++) {
      if (string.test(list[tickers[i]].CoinName) || string.test(list[tickers[i]].Name)) {
        cryptos.push(tickers[i])
      }
    }
    
    this.setState({
      cryptos,
      page: 0,
      results: []
    }, () => {
      this.getCoins()
    })

  }

  render() {
    return (
      <div className="search-container">
        {this.props.coinlist.fetching
        ?
          <Loading />
        :
          <div className="search-module" onScroll={this.pageLoader} style={{ marginRight: `-${this.props.scrollbar.width}px` }}>
            <input
              className="search-module__input"
              type="text"
              placeholder="Type then hit enter to search by ticker or coin name"
              onKeyDown={this.handleSearchEnter}
            />
            <ul className="search-module__currencies-list">
              {this.tiles()}
            </ul>
          </div>
        }
      </div>
      
    )
  }
}