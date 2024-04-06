"use strict";
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
const axios_1 = __importDefault(require("axios"));
const API_KEY = '8F9UN1K5JAE6GUC2A7FRWJ54TST6X2WJX2';
const CONTRACT_ADDRESS = '0x85f7cfe910393fb5593c65230622aa597e4223f1';
function fetchTransactions() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(`https://api.etherscan.io/api`, {
                params: {
                    module: 'account',
                    action: 'tokentx',
                    address: CONTRACT_ADDRESS,
                    page: 1,
                    offset: 100,
                    startblock: 0,
                    endblock: 99999999,
                    sort: 'asc',
                    apikey: API_KEY,
                },
            });
            // const response = await axios.get("https://api.etherscan.io/api?module=account&action=balance&address=0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae&tag=latest&apikey=8F9UN1K5JAE6GUC2A7FRWJ54TST6X2WJX2");
            if (response.data.status === '1') {
                console.log('Transactions:', response.data.result);
            }
            else {
                console.log('Error fetching transactions:', response.data);
            }
        }
        catch (error) {
            console.error('Error fetching transactions:', error);
        }
    });
}
fetchTransactions();
