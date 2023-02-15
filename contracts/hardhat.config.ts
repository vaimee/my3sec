import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    bellecourWhiteListed: {
      url: "https://bellecour.iex.ec",
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
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
