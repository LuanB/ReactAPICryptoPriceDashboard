export default function() {


return {
    dataByTopic: [
        {
            topicName: 'Coin',
            topic: 123,
            dates: this.results.map((ticker, index) => ({
              date: this.moment()
                  .subtract({ [this.state.timeInterval]: this.TIME_UNITS - index })
                 .valueOf(),
              value: ticker.USD
            }) )
        
    
}
]


}


}
