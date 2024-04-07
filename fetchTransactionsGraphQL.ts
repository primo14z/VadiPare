import { ApolloClient, InMemoryCache, gql, HttpLink } from '@apollo/client/core';
import { fetch } from 'cross-fetch';

// Polyfill fetch in the global scope
global.fetch = fetch;

// Set up Apollo Client
const client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://streaming.bitquery.io/graphql',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ory_at_O9OKI6Ga4Uoas9z5TH5-L-PY8EHJWPuIMQsk4VHKf60.wFPNep4F9bUuvS7qmVx0pNhI9lRo8nABy1Ox47etE-E'
    },
    fetch,
  }),
  cache: new InMemoryCache(),
});

// Define the GraphQL query
const GET_TRADE_INFO = gql`
query GetTradeInfo($network: evm_network, $token: String!, $token2: String!) {
  EVM(network: $network, dataset: combined) {
    Unique_Buyers: DEXTrades(
      where: {Block: {Time: {since: "2023-09-27T01:00:00Z", till: "2023-09-27T02:00:00Z"}}, Trade: {Buy: {Currency: {SmartContract: {is: $token}}}, Sell: {Currency: {SmartContract: {is: $token2}}}}}
    ) {
      count(distinct: Trade_Buy_Buyer)
    }
    Unique_Sellers: DEXTrades(
      where: {Block: {Time: {since: "2023-08-26T01:00:00Z", till: "2023-08-26T02:00:00Z"}}, Trade: {Sell: {Currency: {SmartContract: {is: $token}}}, Buy:{Currency:{SmartContract:{is: $token2}}}}}
    ) {
      count(distinct: Trade_Sell_Seller)
    }
    Total_Transactions: DEXTrades(
      where: {Block: {Time: {since: "2023-09-27T01:00:00Z", till: "2023-09-27T02:00:00Z"}}, Trade: {Buy: {Currency: {SmartContract: {is: $token}}}, Sell: {Currency: {SmartContract: {is: $token2}}}}}
    ) {
      count(distinct: Transaction_Hash)
    }
    Total_Buy_Amount: DEXTrades(
      where: {Block: {Time: {since: "2023-09-27T01:00:00Z", till: "2023-09-27T02:00:00Z"}}, Trade: {Buy: {Currency: {SmartContract: {is: $token}}}, Sell: {Currency: {SmartContract: {is: $token2}}}}}
    ) {
      sum(of:Trade_Buy_Amount)
    }
    Total_Sell_Amount: DEXTrades(
      where: {Block: {Time: {since: "2023-09-27T01:00:00Z", till: "2023-09-27T02:00:00Z"}}, Trade: {Buy: {Currency: {SmartContract: {is: $token}}}, Sell: {Currency: {SmartContract: {is: $token2}}}}}
    ) {
      sum(of:Trade_Sell_Amount)
    }
  }
}`;

// Define variables for the query
const variables = {
  network: "eth",
  token: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  token2: "0x20561172f791f915323241e885b4f7d5187c36e1"
};

// Execute the query
client.query({
  query: GET_TRADE_INFO,
  variables: variables,
})
  .then(result => console.log(result.data))
  .catch(error => console.error(error));
