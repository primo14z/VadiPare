import {ApolloClient, InMemoryCache, gql, HttpLink} from '@apollo/client/core';
import axios from 'axios';
import {fetch} from 'cross-fetch';
import * as XLSX from 'xlsx';
import {read} from "fs";

// Polyfill fetch in the global scope
global.fetch = fetch;

async function fetchTransactionsGraphQL(token: string, timestamp: number) {
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
  query MyQuery($token: String!, $startblock: String!, $endblock: String!) {
    EVM(network: eth, mempool: true, dataset: combined) {
    DEXTrades(
      where: {Trade: {Sell: {Currency: {SmartContract: {is: $token}}}}, Block: {Number: {le: $endblock, gt: $startblock}}}
      orderBy: {descending: Block_Number}
    ) {
      Trade {
        Buy {
          Currency {
            Name
            SmartContract
            Symbol
          }
          Amount
          Seller
        }
        Sell {
          Currency {
            Name
            SmartContract
            Symbol
          }
          Amount
        }
      }
      Block {
        Number
        Time
      }
    }
  }
  }`;

  // Primer responsa - wallet je 'Seller' (0x01f389b211e4d9ab162135236a32b1b367a1a96b)
  // {
  //   "Block": {
  //   "Number": "19604452",
  //       "Time": "2024-04-07T14:36:35Z"
  // },
  //   "Trade": {
  //   "Buy": {
  //     "Amount": "0.280000000000000000",
  //         "Currency": {
  //       "Name": "Wrapped Ether",
  //           "SmartContract": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  //           "Symbol": "WETH"
  //     },
  //     "Seller": "0x01f389b211e4d9ab162135236a32b1b367a1a96b"
  //   },
  //   "Sell": {
  //     "Amount": "2044.870724052485812770",
  //         "Currency": {
  //       "Name": "PyroSync AI",
  //           "SmartContract": "0x988cec475e01db276713ab3eb14505eb46cac5ce",
  //           "Symbol": "PSAI"
  //     }
  //   }
  // }
  // },





  const blockTimeRes = await axios.get("https://coins.llama.fi/block/ethereum/1712498031");
  let blockEnd = 0;
  let blockStart = 0;
  if (blockTimeRes.status == 200) {
    blockEnd  = blockTimeRes.data.height;
    blockStart = blockEnd - 300; // prb ura manj
  }

// Define variables for the query
  const variables = {
    token: "0x9e9fbde7c7a83c43913bddc8779158f1368f0413",
    startblock: blockStart.toString(),
    endblock: (blockEnd + 1).toString()
  };

// Execute the query
  client.query({
    query: GET_TRADE_INFO,
    variables: variables,
  })
      .then(result => console.log("Complete Data:", JSON.stringify(result.data, null, 2)))
      .catch(error => console.error(error));
}

async function readFile() {
  const workbook = XLSX.readFile("YoungBoy1Gems.xlsx");
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // Convert the sheet to JSON with option { header: 1 } to get an array of arrays
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  jsonData.slice(1).forEach(async (row: any, index) => {
    setTimeout(async () => {await fetchTransactionsGraphQL(row[1], row[2]);}, 5000)
  })

  // Skip the header row (first row) and log each row
  jsonData.slice(1).forEach((row, index) => {
    console.log(`Row ${index + 1}:`, row);
  });
}

fetchTransactionsGraphQL("", 1);