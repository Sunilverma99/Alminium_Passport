import Web3 from "web3";
import EVBatteryPassportCore from "../abis/EVBatteryPassportCore.sol/EVBatteryPassportCore.json";
import DIDManagerABI from "../abis/DIDManager.sol/DIDManager.json";
import CredentialManagerABI from "../abis/CredentialManager.sol/CredentialManager.json";
import SignatureManagerABI from "../abis/SignatureManager.sol/SignatureManager.json";
import EVBatteryPassportQueriesABI from "../abis/BatteryPassportQueries.sol/BatteryPassportQueries.json";
import BatteryPassportUpdaterABI from "../abis/BatteryPassportUpdater.sol/BatteryPassportUpdater.json";
import DiscrepancyManagerABI from "../abis/DiscrepancyManager.sol/DiscrepancyManager.json";

export const initializeContractInstance = async () => {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed. Please install it to use this application.");
    }

    const web3 = new Web3(window.ethereum);
    await window.ethereum.request({ method: "eth_requestAccounts" });

    const chainId = await web3.eth.getChainId();
    console.log("Connected chain id:", chainId);

    // Check if we're on the correct network (Localhost)
    if (chainId !== 31337) {
      console.log("Not connected to Localhost. Attempting to switch...");
      
      try {
        // Try to switch to Localhost
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x7a69' }], // 31337 in hex
        });
        console.log("Successfully switched to Localhost");
      } catch (switchError) {
        // If the network is not added to MetaMask, add it
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x7a69', // 31337 in hex
                chainName: 'Localhost 8545',
                nativeCurrency: {
                  name: 'Ether',
                  symbol: 'ETH',
                  decimals: 18
                },
                rpcUrls: ['http://127.0.0.1:8545'],
                blockExplorerUrls: []
              }]
            });
            console.log("Successfully added Localhost to MetaMask");
          } catch (addError) {
            console.error("Failed to add Localhost network:", addError);
            throw new Error("Please add Localhost network to MetaMask manually");
          }
        } else {
          console.error("Failed to switch to Localhost:", switchError);
          throw new Error("Please switch to Localhost network in MetaMask");
        }
      }
    }

    const accounts = await web3.eth.getAccounts();
    if (!accounts || accounts.length === 0) {
      throw new Error("No Ethereum accounts found. Please connect your wallet.");
    }
    const account = accounts[0];

    const coreAddress = import.meta.env.VITE_EV_BATTERY_PASSPORT_CORE;
    const didManagerAddress = import.meta.env.VITE_DID_MANAGER;
    const credentialManagerAddress = import.meta.env.VITE_CREDENTIAL_MANAGER;
    const signatureManagerAddress = import.meta.env.VITE_SIGNATURE_MANAGER;
    const queriesAddress = import.meta.env.VITE_BATTERY_PASSPORT_QUERIES;
    const updaterAddress = import.meta.env.VITE_BATTERY_PASSPORT_UPDATER;
    const discrepancyManagerAddress = import.meta.env.VITE_DISCREPANCY_MANAGER;

    console.log("Initializing contract instances...");
    console.log("EVBatteryPassportCore:", coreAddress);
    console.log("DIDManager:", didManagerAddress);
    console.log("CredentialManager:", credentialManagerAddress);
    console.log("SignatureManager:", signatureManagerAddress);
    console.log("BatteryPassportQueries:", queriesAddress);
    console.log("BatteryPassportUpdater:", updaterAddress);
    console.log("DiscrepancyManager:", discrepancyManagerAddress);

    if (
      !coreAddress ||
      !didManagerAddress ||
      !credentialManagerAddress ||
      !signatureManagerAddress ||
      !queriesAddress ||
      !updaterAddress ||
      !discrepancyManagerAddress
    ) {
      throw new Error("One or more contract addresses are missing in the environment variables.");
    }

    const addresses = [
      coreAddress,
      didManagerAddress,
      credentialManagerAddress,
      signatureManagerAddress,
      queriesAddress,
      updaterAddress,
      discrepancyManagerAddress
    ];

    for (const addr of addresses) {
      const code = await web3.eth.getCode(addr);
      if (code === "0x") {
        throw new Error(
          `No contract deployed at ${addr}. Please ensure you are connected to the correct network.`
        );
      }
    }

    const evContract = new web3.eth.Contract(
      EVBatteryPassportCore.abi,
      coreAddress
    );
    const didManager = new web3.eth.Contract(
      DIDManagerABI.abi,
      didManagerAddress
    );
    const credentialManager = new web3.eth.Contract(
      CredentialManagerABI.abi,
      credentialManagerAddress
    );
    const signatureManager = new web3.eth.Contract(
      SignatureManagerABI.abi,
      signatureManagerAddress
    );
    const bpQueries = new web3.eth.Contract(
      EVBatteryPassportQueriesABI.abi,
      queriesAddress
    );
    const bpUpdater = new web3.eth.Contract(
      BatteryPassportUpdaterABI.abi,
      updaterAddress
    );
    const discrepancyManager = new web3.eth.Contract(
      DiscrepancyManagerABI.abi,
      discrepancyManagerAddress
    );

    return {
      evContract,
      didManager,
      credentialManager,
      signatureManager,
      bpQueries,
      account,
      web3,
      bpUpdater,
      discrepancyManager
    };
  } catch (error) {
    console.error("Error initializing contract instance:", error);
    // Instead of just alerting, throw the error so it can be handled properly
    throw error;
  }
};
