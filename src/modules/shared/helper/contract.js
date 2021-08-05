import Web3 from 'web3';
import abi from '../../../abi.json';
import { config } from '../../../config';

let web3 = new Web3('https://bsc-dataseed1.binance.org:443');

export let contract = new web3.eth.Contract(abi, config.contractAddress);

// Contract functions...
export const getBalanceOf = address => contract.methods.balanceOf(address).call();
export const buyToken = async (fromAddress, value) => {
  web3 = new Web3(Web3.givenProvider);
  contract = new web3.eth.Contract(abi, config.contractAddress);
  return contract.methods.buyToken().send({ from: fromAddress, value: value });
}

// Common functions that use web3 only...
export const isAddress = address => web3.utils.isAddress(address);
export const getAccounts = () => {
  web3 = new Web3(Web3.givenProvider);
  return web3.eth.getAccounts();
};
export const getChainId = () => web3.eth.getChainId();
