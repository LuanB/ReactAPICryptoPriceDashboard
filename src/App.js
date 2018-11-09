import React, { Component } from 'react';
import './App.css';
import styled from 'styled-components';

import _ from 'lodash';
import fuzzy from 'fuzzy';


import Search from './Search'
import {ConfirmButton} from './Button'
import AppBar from './AppBar';
import CoinList from './CoinList'




const cc = require('cryptocompare');



const AppLayout = styled.div`
  padding: 40px;
`

const Content = styled.div`
  
`

export const CenterDiv = styled.div`
  display: grid;
  justify-content: center;
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

    this.setState({
      firstVisit: false,
      page: 'dashboard'
    });
        localStorage.setItem('cryptoDash', JSON.stringify({
          favorites: this.state.favorites
        }));
  }
  
  settingsContent = () => {
    return ( 
      <div>
      {this.firstVisitMessage()}
      

      
      <div style={{marginBottom: 30}}>  
        {CoinList.call(this, true)} 
        
        <CenterDiv>  
          <ConfirmButton onClick={this.confirmFavorites}>
            Confirm Favorites
          </ConfirmButton>
          
        </CenterDiv>
        
        {Search.call(this)}
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
  
  handlerFilter = _.debounce((inputValue) => {
    
    let coinSymbols = Object.keys(this.state.coinList);
    
    let coinNames = coinSymbols.map(sym => this.state.coinList[sym].CoinName);
    let allStringsToSearch = coinSymbols.concat(coinNames);
    let fuzzyResults = fuzzy.filter(inputValue, allStringsToSearch, {}).map(result => result.string);
    let filteredCoins = _.pickBy(this.state.coinList, (result, symKey) => {
      let coinName = result.CoinName;
      // If our fuzy results contains this symbol OR the coinName, include it (return true)
      
      return  _.includes(fuzzyResults, symKey) || _.includes(fuzzyResults, coinName);
      
    });
    
    this.setState({filteredCoins})
    
    console.log(filteredCoins);
    
    
  } , 500)
  
  
  filterCoins = (e) => {
     let inputValue = _.get(e, 'target.value');
     if(!inputValue) {
       this.setState({filteredCoins: null});
       return;
     }
     this.handlerFilter(inputValue);
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
