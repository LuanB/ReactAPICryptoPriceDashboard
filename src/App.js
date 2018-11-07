import React, { Component } from 'react';
import './App.css';
import styled from 'styled-components';
import AppBar from './AppBar';
import CoinList from './CoinList'
import _ from 'lodash';

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

const MAX_FAVORITES = 10;


class App extends Component {
  
  state = {
    page: 'settings',
    favorites: ['ETH', 'BTC', 'WAN','XRP', 'EOS'],
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
      <div style={{marginBottom: 30}}>  {CoinList.call(this, true)} </div>
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
  
  addCoinToFavorites = (key) => {
    let favorites = [...this.state.favorites];
    if (favorites.length < MAX_FAVORITES){
      favorites.push(key);
      this.setState({favorites})
      }
  }
  
  removeCoinFromFavorites = (key) => {
  let favorites = [...this.state.favorites];
  this.setState({favorites: _.pull(favorites, key)})
  }
  
  isInFavorites = (key) => { 
    return _.includes(this.state.favorites, key)
  } 
  
  render() {
    return (
      <AppLayout>
        {AppBar.call(this)}
    {this.loadingContent() ||
  <Content>
    {this.displayingSettings() && this.settingsContent()}
      
    
  </Content>}
  
  </AppLayout>
  );
  }
}

export default App;
