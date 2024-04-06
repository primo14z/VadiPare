import axios from 'axios';

const API_KEY = '';
const CONTRACT_ADDRESS = '0x85f7cfe910393fb5593c65230622aa597e4223f1';

async function fetchTransactions() {
    try {
        const response = await axios.get(`https://api.etherscan.io/api`, {
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
        } else {
            console.log('Error fetching transactions:', response.data);
        }
    } catch (error) {
        console.error('Error fetching transactions:', error);
    }
}

fetchTransactions();
