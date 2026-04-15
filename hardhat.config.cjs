require('dotenv').config({ path: '.env.local' });
const { HardhatUserConfig } = require('hardhat/config');
require('@nomicfoundation/hardhat-toolbox');

const RPC = process.env.WIREFLUID_RPC_URL || 'https://rpc.wirefluid.com';
const CID = parseInt(process.env.WIREFLUID_CHAIN_ID || '1234', 10);
const PKEY = process.env.DEPLOYER_PRIVATE_KEY
  ? [process.env.DEPLOYER_PRIVATE_KEY.startsWith('0x') ? process.env.DEPLOYER_PRIVATE_KEY : `0x${process.env.DEPLOYER_PRIVATE_KEY}`]
  : ['0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'];

/** @type {import('hardhat/config').HardhatUserConfig} */
module.exports = {
  solidity: {
    version: '0.8.26',
    settings: { optimizer: { enabled: true, runs: 200 }, viaIR: true, evmVersion: 'cancun' }
  },
  networks: {
    localhost: { url: 'http://127.0.0.1:8545', chainId: 31337, accounts: PKEY },
    wirefluid: { url: RPC, chainId: CID, accounts: PKEY, timeout: 120000, gasPrice: 'auto' }
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './src/artifacts'
  }
};
