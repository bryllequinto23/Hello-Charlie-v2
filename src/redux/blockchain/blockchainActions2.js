// constants
import Web3EthContract from "web3-eth-contract";
import Web3 from "web3";
// log
import { fetchData } from "../data/dataActions";

const connectRequest = () => {
  return {
    type: "CONNECTION_REQUEST",
  };
};

const connectSuccess = (payload) => {
  return {
    type: "CONNECTION_SUCCESS",
    payload: payload,
  };
};

const connectFailed = (payload) => {
  return {
    type: "CONNECTION_FAILED",
    payload: payload,
  };
};

const updateAccountRequest = (payload) => {
  return {
    type: "UPDATE_ACCOUNT",
    payload: payload,
  };
};

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      infuraId: "6292cfa3cf5e46d1b7cff91402a29224" // required
    }
  },
  coinbasewallet: {
    package: CoinbaseWalletSDK, // Required
    options: {
      appName: "Hello Charlie", // Required
      infuraId: "6292cfa3cf5e46d1b7cff91402a29224", // Required
      chainId: 4, // Optional. It defaults to 1 if not provided
      darkMode: false // Optional. Use dark theme, defaults to false
    }
  }
};

const web3Modal = new Web3Modal({
  network: "rinkeby", // optional
  cacheProvider: true, // optional
  providerOptions // required
});

export const connect = () => {
  return async (dispatch) => {
    dispatch(connectRequest());
    const abiResponse = await fetch("/config/abi.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const abi = await abiResponse.json();
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const CONFIG = await configResponse.json();

    let provider = await web3Modal.connect();
    let web3 = new Web3(provider);

    console.log(web3);





    // const { ethereum } = window;
    // const metamaskIsInstalled = ethereum && ethereum.isMetaMask;
    // if (metamaskIsInstalled) {
    //   Web3EthContract.setProvider(ethereum);
    //   let web3 = new Web3(ethereum);
    //   try {
    //     const accounts = await ethereum.request({
    //       method: "eth_requestAccounts",
    //     });
    //     const networkId = await ethereum.request({
    //       method: "net_version",
    //     });
    //     if (networkId == CONFIG.NETWORK.ID) {
    //       const SmartContractObj = new Web3EthContract(
    //         abi,
    //         CONFIG.CONTRACT_ADDRESS
    //       );
    //       dispatch(
    //         connectSuccess({
    //           account: accounts[0],
    //           smartContract: SmartContractObj,
    //           web3: web3,
    //         })
    //       );
    //       // Add listeners start
    //       ethereum.on("accountsChanged", (accounts) => {
    //         dispatch(updateAccount(accounts[0]));
    //       });
    //       ethereum.on("chainChanged", () => {
    //         window.location.reload();
    //       });
    //       // Add listeners end
    //     } else {
    //       dispatch(connectFailed(`Change network to ${CONFIG.NETWORK.NAME}.`));
    //     }
    //   } catch (err) {
    //     dispatch(connectFailed("Something went wrong."));
    //   }
    // } else {
    //   dispatch(connectFailed("Install Metamask."));
    // }
  };
};

export const updateAccount = (account) => {
  return async (dispatch) => {
    dispatch(updateAccountRequest({ account: account }));
    dispatch(fetchData(account));
  };
};