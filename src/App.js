import React, { Component } from 'react';
import './App.css';
import styled from 'styled-components';
import AppBar from './AppBar';
import CoinList from './CoinList'

const cc = require('cryptocompare');



const AppLayout = styled.div`
  padding: 40px;
`

const Content = styled.div`
  
`

const checkFirstVisit = () => {
  let cryptoDashData = localStorage.getItem('cryptoDash');
  if (!cryptoDashData){
    return {
      firstVisit: true,
      page: 'settings'
    }
  }
  return {};
}


class App extends Component {
  
  state = {
    page: 'settings',
    ...checkFirstVisit()
  }
  
  componentDidMount = () => {
    // fetch coins
    this.fetchCoins();
  }
  
  fetchCoins = async () => {
    let coinList = (await cc.coinList()).Data;
    this.setState({coinList});
  }
  
  
  displayingDashboard = () => this.state.page === 'dashboard'
  displayingSettings = () => this.state.page === 'settings'
  firstVisitMessage = () => {
    if(this.state.firstVisit){
      return <div>Welcome to the Crypto Dashboard, please select your favorite coin </div>
    }
  }
  
  confirmFavorites = () =>{
    localStorage.setItem('cryptoDash', 'test');
    this.setState({
      firstVisit: false,
      page: 'dashboard'
    })
  }
  
  settingsContent = () => {
    return ( 
      <div>
      {this.firstVisitMessage()}
      <div onClick={this.confirmFavorites}>
        Confirm Favorites
      </div>
      <div>
        {CoinList.call(this)}
      </div>
    </div>
  )
  }
  
  loadingContent = () => {
    if(!this.state.coinList) {
      return (<div>Loading ....</div>)
    }
  }
  
  render() {
    return (
      <AppLayout>
        {AppBar.call(this)}
    {this.loadingContent() ||
  <Content>
    {this.displayingSettings() && this.settingsContent()}
      <div onClick={this.confirmFavorites}>
    </div>
  </Content>}
  
  </AppLayout>
  );
  }
}

export default App;
