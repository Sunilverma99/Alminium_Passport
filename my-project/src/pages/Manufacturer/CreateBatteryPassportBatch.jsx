import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { initializeContractInstance } from '../../contractInstance';

export default function CreateBatteryPassportBatch() {
  const [batchId, setBatchId] = useState('');
  const [credentialId, setCredentialId] = useState('');
  const [jsonData, setJsonData] = useState('[]');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const passports = JSON.parse(jsonData);
      const { evContract, account, web3 } = await initializeContractInstance();
      const didHash = web3.utils.keccak256(`did:web:marklytics.com#create-${account}`);

      const domain = {
        name: 'EVBatteryPassport',
        version: '1',
        chainId: Number(await web3.eth.getChainId()),
        verifyingContract: evContract.options.address
      };

      const typedData = {
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' }
          ],
          AddBatch: [
            { name: 'batchId', type: 'uint256' },
            { name: 'sender', type: 'address' }
          ]
        },
        primaryType: 'AddBatch',
        domain,
        message: { batchId: Number(batchId), sender: account }
      };

      const signature = await window.ethereum.request({
        method: 'eth_signTypedData_v4',
        params: [account, JSON.stringify(typedData)]
      });

      const batch = {
        passports: passports.map(p => p.uniqueIdentifier),
        externalURNs: passports.map(p => p.externalURN),
        materialHashes: passports.map(p => p.materialCompositionHash),
        carbonHashes: passports.map(p => p.carbonFootprintHash),
        performanceHashes: passports.map(p => p.performanceDataHash),
        circularityHashes: passports.map(p => p.circularityDataHash),
        labelsHashes: passports.map(p => p.labelsDataHash),
        dueDiligenceHashes: passports.map(p => p.dueDiligenceHash),
        generalProductInfoHashes: passports.map(p => p.generalProductInfoHash),
        qrCodeUrls: passports.map(p => p.qrCodeUrl),
        batchId: Number(batchId),
        offChainMultihashes: passports.map(p => p.offChainHash)
      };

      await evContract.methods
        .addBatteryPassportsBatch(didHash, batch, credentialId, signature)
        .send({ from: account });
      toast.success('Batch created successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create batch');
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Create Battery Passport Batch</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={batchId}
          onChange={e => setBatchId(e.target.value)}
          placeholder="Batch ID"
          className="border p-2 w-full"
          required
        />
        <input
          type="text"
          value={credentialId}
          onChange={e => setCredentialId(e.target.value)}
          placeholder="Credential ID"
          className="border p-2 w-full"
          required
        />
        <textarea
          value={jsonData}
          onChange={e => setJsonData(e.target.value)}
          placeholder="Array of passport objects as JSON"
          className="border p-2 w-full h-40"
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Submit Batch
        </button>
      </form>
    </div>
  );
}
