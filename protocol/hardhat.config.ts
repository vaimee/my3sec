import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.17",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
            details: {
              yul: true,
            },
          },
        },
      },
    ],
  },
  networks: {
    bellecourWhiteListed: {
      url: "https://bellecour.iex.ec",
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      // Fixed gas price to allow upgradeProxy and atomic call to setHub.
      // Not sure if this is a fix only required for Bellecour.
      gasPrice: 0,
      gas: 6000000,
    },
    bellecour: {
      url: "https://bellecour.iex.ec",
      accounts: {
        mnemonic:
          process.env.DEPLOY_TDD_WALLET_MNEMONIC ?? "test test test test test test test test test test test junk",
        count: 10,
      },
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
