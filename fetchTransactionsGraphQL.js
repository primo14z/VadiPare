"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@apollo/client/core");
const axios_1 = __importDefault(require("axios"));
const cross_fetch_1 = require("cross-fetch");
const XLSX = __importStar(require("xlsx"));
// Polyfill fetch in the global scope
global.fetch = cross_fetch_1.fetch;
function fetchTransactionsGraphQL(token, timestamp) {
    return __awaiter(this, void 0, void 0, function* () {
        // Set up Apollo Client
        const client = new core_1.ApolloClient({
            link: new core_1.HttpLink({
                uri: 'https://streaming.bitquery.io/graphql',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer token'
                },
                fetch: cross_fetch_1.fetch,
            }),
            cache: new core_1.InMemoryCache(),
        });
        // Define the GraphQL query
        const GET_TRADE_INFO = (0, core_1.gql) `
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
        const blockTimeRes = yield axios_1.default.get("https://coins.llama.fi/block/ethereum/1712498031");
        let blockEnd = 0;
        let blockStart = 0;
        if (blockTimeRes.status == 200) {
            blockEnd = blockTimeRes.data.height;
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
    });
}
function readFile() {
    return __awaiter(this, void 0, void 0, function* () {
        const workbook = XLSX.readFile("YoungBoy1Gems.xlsx");
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        // Convert the sheet to JSON with option { header: 1 } to get an array of arrays
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        jsonData.slice(1).forEach((row, index) => __awaiter(this, void 0, void 0, function* () {
            setTimeout(() => __awaiter(this, void 0, void 0, function* () { yield fetchTransactionsGraphQL(row[1], row[2]); }), 5000);
        }));
        // Skip the header row (first row) and log each row
        jsonData.slice(1).forEach((row, index) => {
            console.log(`Row ${index + 1}:`, row);
        });
    });
}
fetchTransactionsGraphQL("", 1);
