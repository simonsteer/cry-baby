import React from 'react'
import { Route } from 'react-router-dom'

import Graph from './graph'
import NewsFeed from './news-feed'
import Search from './search'
import Portfolio from './portfolio'

export default class Info extends React.Component {
  constructor() {
    super()
    this.state = {
      isMobile: false,
      panel: 0
    }
    this.checkIfMobileView = this.checkIfMobileView.bind(this)
    this.changePanel = this.changePanel.bind(this)
  }

  checkIfMobileView() {
    if (window.innerWidth <= 750 && !this.state.isMobile) {
      this.setState({
        isMobile: true
      })
    } else if (window.innerWidth > 750 && this.state.isMobile) {
      this.setState({
        isMobile: false,
        panel: this.state.panel === 0 ? 2 : this.state.panel
      })
    }
  }

  changePanel(n) {
    this.setState({
      panel: n
    })
  }

  componentDidMount() {
    if (window.innerWidth <= 750) {
      this.setState({
        isMobile: true
      })
    } else {
      this.setState({
        panel: 2
      })
    }
    window.addEventListener('resize', this.checkIfMobileView)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.checkIfMobileView)
  }

  render() {
    const { isMobile, panel } = this.state
    const { pathname: path } = window.location

    return (
      <div className="currency-info">
        <Route path="/search" component={Search} />
        {path === '/' && !isMobile ? <Graph /> : null}
        {path === '/' && isMobile && panel === 0 ? <Graph /> : null}
        {path === '/' && panel === 1 ? <Portfolio /> : null}
        {path === '/' && panel === 2 ? <NewsFeed /> : null}
        {path === '/'
          ?
          <ul className="panel-selector">
            {isMobile
              ?
              <li
                className={panel === 0 ? 'panel-active' : ''}
                onClick={() => this.changePanel(0)}>
                Graph
              </li>
              :
              null
            }
            <li
              className={panel === 1 ? 'panel-active' : ''}
              onClick={() => this.changePanel(1)}>
              Portfolio
            </li>
            <li
              className={panel === 2 ? 'panel-active' : ''}
              onClick={() => this.changePanel(2)}>
              News
            </li>
          </ul>
          :
          null
        }
      </div>
    )
  }
}
