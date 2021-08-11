import Web3 from 'web3';
import abi from '../../../abi.json';
import sshibaAbi from '../../../sshibaAbi.json';
import { config } from '../../../config';

export const web3 = new Web3(config.provider);

export const contract = new web3.eth.Contract(abi, config.contractAddress);
export const sshibaContract = new web3.eth.Contract(sshibaAbi, config.sshibaAddress);

// Contract functions...
export const getBalanceOf = address => contract.methods.getBalanceOfToken(address).call();
export const getCurrentBonusRatio = () => contract.methods.getCurrentBonusRatio().call();
export const getUserDeposits = (address) => contract.methods.getUserDeposits(address).call();

export const transferToken = (address, amount) => contract.methods.transfer(amount).send({from: address});

export const approveAmount = (address, amount) => {
  return sshibaContract.methods.approve(config.contractAddress, amount).send({ from: address });
}
export const sshibaDecimals = () => sshibaContract.methods.decimals().call();


// Common functions that use web3 only...
export const isAddress = address => web3.utils.isAddress(address);
export const getAccounts = () => web3.eth.getAccounts();
export const getChainId = () => web3.eth.getChainId();
