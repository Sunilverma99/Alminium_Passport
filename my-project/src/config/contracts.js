// Contract configuration
export const CONTRACT_CONFIG = {
  // Update this address after deploying your contracts
  EVBatteryPassportCore: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Default Hardhat address
  
  // Network configurations
  networks: {
    // Local development (Hardhat)
    31337: {
      name: 'Hardhat Local',
      EVBatteryPassportCore: '0x5FbDB2315678afecb367f032d93F642f64180aa3'
    },
    // Sepolia testnet
    11155111: {
      name: 'Sepolia',
      EVBatteryPassportCore: '0x...' // Add your deployed contract address here
    },
    // Ethereum mainnet
    1: {
      name: 'Ethereum Mainnet',
      EVBatteryPassportCore: '0x...' // Add your deployed contract address here
    },
    // Polygon Amoy testnet
    80002: {
      name: 'Polygon Amoy',
      EVBatteryPassportCore: '0xC54A4b0EB43B4c81FD8Ea8ae7cdbca138B15C24d'
    }
  }
};

// Helper function to get contract address for current network
export const getContractAddress = (contractName, networkId) => {
  const network = CONTRACT_CONFIG.networks[networkId];
  if (network && network[contractName] && network[contractName] !== '0x...') {
    return network[contractName];
  }
  // Return null if no valid contract address is found for this network
  return null;
}; 