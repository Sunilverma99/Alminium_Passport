const Web3 = require('web3');
const EVBatteryPassportCoreABI = require('../src/abis/EVBatteryPassportCore.json');

async function setBatteryPassportUpdater() {
  try {
    // Connect to local network
    const web3 = new Web3('http://localhost:8545');
    
    // Get accounts
    const accounts = await web3.eth.getAccounts();
    const adminAccount = accounts[0]; // Use first account as admin
    
    console.log('Admin account:', adminAccount);
    
    // Contract addresses (update these with your actual deployed addresses)
    const evContractAddress = process.env.VITE_EV_BATTERY_PASSPORT_CORE || '0xdc64a140aa3e981100a9beca4e685f962f0cf6c9';
    const updaterAddress = process.env.VITE_BATTERY_PASSPORT_UPDATER || '0x5FbDB2315678afecb367f032d93F642f64180aa3';
    
    console.log('EVBatteryPassportCore address:', evContractAddress);
    console.log('BatteryPassportUpdater address:', updaterAddress);
    
    // Create contract instance
    const evContract = new web3.eth.Contract(EVBatteryPassportCoreABI.abi, evContractAddress);
    
    // Check current updater address
    const currentUpdater = await evContract.methods.batteryPassportUpdater().call();
    console.log('Current updater address:', currentUpdater);
    
    if (currentUpdater === '0x0000000000000000000000000000000000000000') {
      console.log('Setting BatteryPassportUpdater...');
      
      // Set the updater contract
      const tx = await evContract.methods
        .setBatteryPassportUpdater(updaterAddress)
        .send({ 
          from: adminAccount, 
          gas: 100000 
        });
      
      console.log('Transaction hash:', tx.transactionHash);
      console.log('BatteryPassportUpdater set successfully!');
      
      // Verify the update
      const newUpdater = await evContract.methods.batteryPassportUpdater().call();
      console.log('New updater address:', newUpdater);
    } else {
      console.log('BatteryPassportUpdater is already set.');
    }
    
  } catch (error) {
    console.error('Error setting BatteryPassportUpdater:', error);
  }
}

setBatteryPassportUpdater(); 