import Web3 from 'web3';

async function debugContracts() {
  try {
    // Connect to local network
    const web3 = new Web3('http://localhost:8545');
    
    // Get accounts
    const accounts = await web3.eth.getAccounts();
    const userAccount = accounts[0];
    
    console.log('User account:', userAccount);
    
    // Contract addresses from .env
    const coreAddress = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9';
    const updaterAddress = '0x0165878A594ca255338adfa4d48449f69242Eb8F';
    const didManagerAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
    const signatureManagerAddress = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';
    
    console.log('\n=== Contract Addresses ===');
    console.log('Core Contract:', coreAddress);
    console.log('Updater Contract:', updaterAddress);
    console.log('DID Manager:', didManagerAddress);
    console.log('Signature Manager:', signatureManagerAddress);
    
    // Check if contracts exist
    console.log('\n=== Contract Existence Check ===');
    const coreCode = await web3.eth.getCode(coreAddress);
    const updaterCode = await web3.eth.getCode(updaterAddress);
    const didManagerCode = await web3.eth.getCode(didManagerAddress);
    const signatureManagerCode = await web3.eth.getCode(signatureManagerAddress);
    
    console.log('Core Contract exists:', coreCode !== '0x');
    console.log('Updater Contract exists:', updaterCode !== '0x');
    console.log('DID Manager exists:', didManagerCode !== '0x');
    console.log('Signature Manager exists:', signatureManagerCode !== '0x');
    
    if (coreCode === '0x' || updaterCode === '0x') {
      console.log('\n❌ ERROR: One or more contracts are not deployed!');
      return;
    }
    
    // Basic ABI for checking updater address
    const coreABI = [
      {
        "inputs": [],
        "name": "batteryPassportUpdater",
        "outputs": [{"type": "address"}],
        "stateMutability": "view",
        "type": "function"
      }
    ];
    
    const coreContract = new web3.eth.Contract(coreABI, coreAddress);
    
    // Check updater address in main contract
    console.log('\n=== Updater Link Check ===');
    try {
      const linkedUpdater = await coreContract.methods.batteryPassportUpdater().call();
      console.log('Updater address in main contract:', linkedUpdater);
      console.log('Addresses match:', linkedUpdater.toLowerCase() === updaterAddress.toLowerCase());
      
      if (linkedUpdater === '0x0000000000000000000000000000000000000000') {
        console.log('❌ ERROR: Updater is not linked to main contract!');
      }
    } catch (error) {
      console.log('❌ ERROR checking updater link:', error.message);
    }
    
  } catch (error) {
    console.error('Debug error:', error);
  }
}

debugContracts(); 