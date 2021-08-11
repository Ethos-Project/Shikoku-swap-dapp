import Web3 from 'web3';
import abi from '../../../abi.json';
import { config } from '../../../config';

export const web3 = new Web3(config.provider);

export const contract = new web3.eth.Contract(abi, config.contractAddress);

// Contract functions...
export const getBalanceOf = address => contract.methods.getBalanceOfToken(address).call();
export const buyToken = (fromAddress, value) => contract.methods.buyToken().send({ from: fromAddress, value: value });
export const hasRevealed = address => contract.methods.hasRevealed(address).call();
export const revealCode = addressToReveal => contract.methods.reveal().send({ from: addressToReveal });
export const transferToken = (address, amount) => contract.methods.transfer(amount).send({from: address});

// Common functions that use web3 only...
export const isAddress = address => web3.utils.isAddress(address);
export const getAccounts = () => web3.eth.getAccounts();
export const getChainId = () => web3.eth.getChainId();
