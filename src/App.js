import React, { Component } from 'react';
import './App.css';
import styled from 'styled-components';

import _ from 'lodash';
import fuzzy from 'fuzzy';
import moment from 'moment'


import Search from './Search'
import Dashboard from './Dashboard'
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
const MAX_FAVORITES = 10;
const TIME_UNITS = 10;

const checkFirstVisit = () => {
  let cryptoDashData = JSON.parse(localStorage.getItem('cryptoDash'));
  if (!cryptoDashData){
    return {
      firstVisit: true,
      page: 'settings'
    }
  }
  let {favorites, currentFavorite} = cryptoDashData;
  return {
    favorites,
    currentFavorite
  };
}




class App extends Component {
  
  state = {
    page: 'dashboard',
    favorites: ['ETH', 'BTC', 'WAN','XRP', 'EOS'],
    timeInterval: 'months',
    ...checkFirstVisit()
  }
  
  componentDidMount = () => {
    // fetch coins
    this.fetchHistorical();
    this.fetchCoins();
    this.fetchPrices();
    
  }
  
  
  fetchPrices = async () => {
    let prices;
    try {
      prices = await this.prices();
    } catch(e) {
      this.setState({error: true});
    }
      this.setState({prices});
  }
  
  fetchHistorical = async () => {
     if (this.state.firstVisit) return;
     let results = await this.historical();
     let historical = [
       {
         name: this.state.currentFavorite,
         data: results.map((ticker, index) => [
           moment()
             .subtract({ [this.state.timeInterval]: TIME_UNITS - index })
             .valueOf(),
           ticker.USD
         ])
       }
     ];
     this.setState({ historical });
   };
  
   historical = () => {
     let promises = [];
     for (let units = TIME_UNITS; units > 0; units--) {
       promises.push(
         cc.priceHistorical(
           this.state.currentFavorite,
           ['USD'],
           moment()
             .subtract({ [this.state.timeInterval]: units })
             .toDate()
         )
       );
     }
     return Promise.all(promises);
   };
  
  prices = () => {
    let promises = [];
    this.state.favorites.forEach(sym => {
      promises.push(cc.priceFull(sym, 'USD'));
    })
    return Promise.all(promises);
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
    let currentFavorite = this.state.favorites[0];
    this.setState({
      firstVisit: false,
      page: 'dashboard',
      prices: null,
      currentFavorite: this.state.favorites[0],
      historical: null
    });
    this.fetchPrices(); 
    this.fetchHistorical();
        localStorage.setItem('cryptoDash', JSON.stringify({
          favorites: this.state.favorites,
          currentFavorite
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
      return (<div>Loading coins....</div>)
    }
    if(!this.state.prices) {
      return (<div>Loading prices...</div>)
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
    {this.displayingDashboard() && Dashboard.call(this)}
  
  </Content>}
  
  </AppLayout>
  );
  }
}

export default App;
