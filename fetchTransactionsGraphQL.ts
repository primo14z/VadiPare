import {ApolloClient, InMemoryCache, gql, HttpLink} from '@apollo/client/core';
import axios from 'axios';
import {fetch} from 'cross-fetch';

// Polyfill fetch in the global scope
global.fetch = fetch;

async function fetchTransactionsGraphQL() {
  // Set up Apollo Client
  const client = new ApolloClient({
    link: new HttpLink({
      uri: 'https://streaming.bitquery.io/graphql',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token'
      },
      fetch,
    }),
    cache: new InMemoryCache(),
  });


// Define the GraphQL query
  const GET_TRADE_INFO = gql`
    query MyQuery {
      EVM(network: eth, $token: String!, $startblock: Number!, $endblock: Number!) {
        DEXTrades(where: {Block: {Number: {lt: "$startblock", gt: "$endblock"}}}) {
          Trade {
            Buy {
              Currency {
                SmartContract(selectWhere: {is: "$token"})
              }
            }
          }
        }
      }
    }`;

  const blockTimeRes = await axios.get("https://coins.llama.fi/block/ethereum/1677274655");
  let blockEnd = 0;
  let blockStart = 0;
  if (blockTimeRes.status == 200) {
    blockEnd  = blockTimeRes.data.height;
    blockStart = blockEnd - 300; // prb ura manj
  }

// Define variables for the query
  const variables = {
    network: "eth",
    token: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    startblock: blockStart,
    endblock: blockEnd
  };

// Execute the query
  client.query({
    query: GET_TRADE_INFO,
    variables: variables,
  })
      .then(result => console.log("Complete Data:", JSON.stringify(result.data, null, 2)))
      .catch(error => console.error(error));
}