import { HardhatRuntimeEnvironment } from "hardhat/types/runtime";
import { task } from "hardhat/config";
import '@typechain/hardhat'
import "@nomiclabs/hardhat-waffle";
import 'dotenv/config'

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (_taskArgs: any, hre: HardhatRuntimeEnvironment) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

export default {
  defaultNetwork: "hardhat",
  // defaultNetwork: "fantom",
  // defaultNetwork: "fantomtestnet",
  networks: {
    hardhat: {
      // accounts: ["591eb0ce783b91584bfaed43c75a141e14c34115586c235bf3daa51587390812"],
      allowUnlimitedContractSize: true
    },
    ganacheui: { // Ganache UI on localhost
      url: "http://127.0.0.1:7545",
      // accounts: [
      //   process.env.WALLET_PRIV_KEY,
      //   process.env.SIGNER_KEY
      // ]
    },
    fantomtestnet: {
      url: "https://rpc.testnet.fantom.network/",
      accounts: [
        process.env.WALLET_PRIV_KEY,
        process.env.SIGNER_KEY
      ],
      gasMultiplier: 3
    },
    fantom: {
      url: "https://rpc.ftm.tools/",
      // accounts: [process.env.WALLET_PRIV_KEY],
      // gas: 5000000,
      gasMultiplier: 3,
    }
  },
  solidity: {
    compilers: [
      {
        version: "0.8.10",
        settings: {
          optimizer: {enabled: process.env.DEBUG ? false : true},
        }
      },
      {
        version: "0.6.12",
      }
    ]
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "../src/artifacts"
  },
  typechain: {
    outDir: '../src/typechain',
    target: 'ethers-v5',
    alwaysGenerateOverloads: false, // should overloads with full signatures like deposit(uint256) be generated always, even if there are no overloads?
    //externalArtifacts: ['externalArtifacts/*.json'], // optional array of glob patterns with external artifacts to process (for example external libs from node_modules)
  },
  mocha: {
    timeout: 7200000
  }
};
