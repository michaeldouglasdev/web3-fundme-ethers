import "@typechain/hardhat"
//import "@nomiclabs/hardhat-waffle"
//import "@nomiclabs/hardhat-etherscan"
//import "@nomiclabs/hardhat-ethers"
import "hardhat-gas-reporter"
import "dotenv/config"
import "hardhat-deploy"
import "solidity-coverage"
import { HardhatUserConfig } from "hardhat/config"


import { ETHERSCAN_API_KEY, PRIVATE_KEY, SEPOLIA_CHAIN_ID, SEPOLIA_RPC_URL } from "./constants/contants";

//import "@nomiclabs/hardhat-ethers";
import "@nomicfoundation/hardhat-toolbox";

import dotenv from 'dotenv';
dotenv.config();

const config: HardhatUserConfig = {
  //solidity: "0.8.19",
  solidity: {
    compilers: [
      {
        version: '0.8.19'
      },
      {
        version: '0.6.6',
      }
    ]
  },
  defaultNetwork: 'hardhat',
  networks: {
    sepolia: {
      chainId: SEPOLIA_CHAIN_ID,
      accounts: [PRIVATE_KEY],
      url: SEPOLIA_RPC_URL,

    },
    localhost: {
      chainId: 31337,
      url: 'http://127.0.0.1:8545'
    },
  },
  gasReporter: {
    enabled: true,
    outputFile: 'gas-report.txt',
    noColors: true,
    currency: 'USD',
  },
 etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  namedAccounts: {
    deployer: {
      default: 0
    },
    user: {
      default: 1
    }
  }
};

export default config;
