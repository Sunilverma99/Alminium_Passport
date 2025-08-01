"use client"

import { useState, useEffect } from "react"
import { toast, Toaster } from "react-hot-toast"
import { useDispatch } from "react-redux"
import { initializeContractInstance } from "../../contractInstance"
import {
  UserPlus,
  UserMinus,
  Briefcase,
  Shield,
  Clock,
  Tag,
  Check,
  CloudCog,
  Upload,
  X,
  ExternalLink,
  FileText,
  ImageIcon,
} from "lucide-react"
import { apiFetch } from "../../utils/api"
import { pinata } from "../../utils/config"

// Country options
const countries = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahrain",
  "Bangladesh",
  "Belarus",
  "Belgium",
  "Bolivia",
  "Brazil",
  "Bulgaria",
  "Cambodia",
  "Canada",
  "Chile",
  "China",
  "Colombia",
  "Croatia",
  "Czech Republic",
  "Denmark",
  "Ecuador",
  "Egypt",
  "Estonia",
  "Finland",
  "France",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kuwait",
  "Latvia",
  "Lebanon",
  "Lithuania",
  "Luxembourg",
  "Malaysia",
  "Mexico",
  "Morocco",
  "Netherlands",
  "New Zealand",
  "Norway",
  "Pakistan",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Saudi Arabia",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "South Africa",
  "South Korea",
  "Spain",
  "Sweden",
  "Switzerland",
  "Thailand",
  "Turkey",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Vietnam",
]

// Carbon categories
const carbonCategories = [
  "Class A (< 50 kg CO2e/kWh)",
  "Class B (50-75 kg CO2e/kWh)",
  "Class C (75-100 kg CO2e/kWh)",
  "Class D (100-125 kg CO2e/kWh)",
  "Class E (> 125 kg CO2e/kWh)",
]

// Production volume ranges
const productionVolumeRanges = [
  "< 1,000 units/year",
  "1,000 - 10,000 units/year",
  "10,000 - 50,000 units/year",
  "50,000 - 100,000 units/year",
  "100,000 - 500,000 units/year",
  "> 500,000 units/year",
]

export default function GovernmentHome() {
  const dispatch = useDispatch()
  const [selectedRole, setSelectedRole] = useState("tenant_admin")

  // 1. Expand entityDetails state
  const initialEntityDetails = {
    address: "",
    name: "",
    oemType: "",
    businessRegistrationNumber: "",
    authorizedPersonName: "",
    email: "",
    phone: "",
    headquartersAddress: "",
    countryRegion: "",
    batteryProductionVolume: "",
    licenseComplianceDocs: [], // array of URLs
    carbonCategory: "",
    supportedBatteryChemistries: [], // array
    logoBrandingAssets: "",
    credentialDuration: 0,
    credentialType: "Verifiable Credential",
  }
  const [entityDetails, setEntityDetails] = useState(initialEntityDetails)

  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [hasDefaultAdminRole, setHasDefaultAdminRole] = useState(false)
  const [account, setAccount] = useState("")

  // Pending DID Registration State
  const [pendingDIDs, setPendingDIDs] = useState([])
  const [pendingLoading, setPendingLoading] = useState(false)

  // Upload state
  const [uploadingDocs, setUploadingDocs] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  // Fetch pending DID registrations
  useEffect(() => {
    async function fetchPending() {
      setPendingLoading(true)
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/pending-did`)
        const data = await res.json()
        setPendingDIDs(data.entries || [])
      } catch (err) {
        setPendingDIDs([])
      }
      setPendingLoading(false)
    }
    fetchPending()
  }, [])

  // Handle License/Compliance Docs upload
  const handleDocsUpload = async (e) => {
    const files = Array.from(e.target.files)
    setUploadingDocs(true)
    try {
      const urls = []
      for (const file of files) {
        const res = await pinata.upload.file(file)
        if (res && res.IpfsHash) {
          const url = `https://gateway.pinata.cloud/ipfs/${res.IpfsHash}`
          urls.push(url)
        }
      }
      setEntityDetails((prev) => ({
        ...prev,
        licenseComplianceDocs: [...prev.licenseComplianceDocs, ...urls],
      }))
    } catch (err) {
      toast.error("Failed to upload document(s) to Pinata")
    } finally {
      setUploadingDocs(false)
    }
  }

  // Remove a doc
  const handleRemoveDoc = (url) => {
    setEntityDetails((prev) => ({
      ...prev,
      licenseComplianceDocs: prev.licenseComplianceDocs.filter((u) => u !== url),
    }))
  }

  // Handle Logo upload
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    // Validate file type - only allow images
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload only image files (JPEG, PNG, GIF, WebP, SVG). PDFs and other file types are not allowed for logos.")
      return
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast.error("Logo file size must be less than 5MB.")
      return
    }
    
    setUploadingLogo(true)
    try {
      const res = await pinata.upload.file(file)
      if (res && res.IpfsHash) {
        const url = `https://gateway.pinata.cloud/ipfs/${res.IpfsHash}`
        setEntityDetails((prev) => ({
          ...prev,
          logoBrandingAssets: url,
        }))
        toast.success("Logo uploaded successfully!")
      }
    } catch (err) {
      toast.error("Failed to upload logo to Pinata")
    } finally {
      setUploadingLogo(false)
    }
  }

  // Approve a pending DID registration (full workflow)
  async function approveDID(entry) {
    const { userAddress, role, organizationId, _id } = entry
    try {
      setLoading(true)
      const { didManager, credentialManager, signatureManager, account, web3 } = await initializeContractInstance()

      // Always get the current selected address from MetaMask
      const [signer] = await window.ethereum.request({ method: "eth_requestAccounts" })
      console.log("MetaMask selected address:", signer)
      console.log("account variable:", account)

      // 1. Register the DID
      // Use the exact organization ID from the pending registration (tenant admin's org)
      const normalizedOrgId = organizationId.toLowerCase()
      const normalizedUserAddress = userAddress.toLowerCase()
      const did_name = `did:web:${normalizedOrgId}.com#create-${normalizedUserAddress}`
      const didHash = web3.utils.keccak256(did_name)

      // Set trust level according to the role
      const trustLevels = {
        MANUFACTURER: 4,
        SUPPLIER: 3,
        MINER: 2,
        RECYCLER: 3,
        TENANT_ADMIN: 5,
        GOVERNMENT: 5,
      }
      const trustLevel = trustLevels[role.toUpperCase()] || 3 // Default to 3 if role not found

      // Check if DID is already registered (optional, fallback if method doesn't exist)
      let isRegistered = false
      try {
        isRegistered = await didManager.methods.isDIDRegistered(didHash).call()
        console.log("DID already registered:", isRegistered)
      } catch (e) {
        console.log("Error checking DID registration:", e)
      }

      if (!isRegistered) {
        console.log("Registering DID:", { didHash, did_name, userAddress, trustLevel, role })
        await didManager.methods
          .registerDID(didHash, did_name, userAddress.toLowerCase(), trustLevel, [], [role])
          .send({ from: signer })
        console.log("DID registered successfully")
        // Step 2 completed - DID registered
        setCurrentStep(2)
      }

      console.log("didHash", didHash)
      isRegistered = await didManager.methods.isDIDRegistered(didHash).call()
      console.log("isRegistered", isRegistered)
      console.log("did_name", did_name)

      // 2. Verify the DID
      console.log("Verifying DID...")
      await didManager.methods.verifyGaiaXDID(didHash, true).send({ from: signer })
      console.log("DID verified successfully")
      // Step 3 completed - DID verified
      setCurrentStep(3)

      // 3. Grant role in SignatureManager (for signature validation)
      try {
        const signatureManagerRole = await signatureManager.methods[`${role.toUpperCase()}_ROLE`]().call()
        await signatureManager.methods.grantRole(signatureManagerRole, userAddress).send({ from: signer, gas: 1000000 })
        console.log("Role granted in SignatureManager successfully")
      } catch (error) {
        console.error("Failed to grant role in SignatureManager:", error)
        toast.error("Failed to grant role in SignatureManager. This is required for signature validation.")
        setLoading(false)
        return
      }

      // 4. Issue the credential
      const credential_id = `cred-${normalizedOrgId}-${normalizedUserAddress}`.toLowerCase()
      console.log("Issuing credential with ID:", credential_id)
      const latestBlock = await web3.eth.getBlock("latest")
      const issued_at = Number(latestBlock.timestamp)
      const expires_at = Number(issued_at + 12 * 30 * 24 * 60 * 60)

      const credential_data = JSON.stringify({
        userAddress,
        organizationId: organizationId.toLowerCase(),
        role,
        assignedBy: signer,
      })

      const isVerified = await didManager.methods.isVerified(did_name).call()
      if (!isVerified) {
        toast.error("DID is not verified. Cannot issue credential.")
        setLoading(false)
        return
      }

      try {
        await credentialManager.methods
          .issueVerifiableCredential(
            credential_id,
            did_name,
            credential_data,
            expires_at,
            ["https://www.w3.org/2018/credentials/v2"],
            ["VerifiableCredential"],
            "EcdsaSecp256k1Signature2020",
            `did:ethr:${signer}`,
          )
          .send({ from: signer, gas: 1000000 })
        console.log("Credential issued successfully")
        // Step 4 completed - Credential issued
        setCurrentStep(4)
      } catch (error) {
        console.error("Credential issuance failed:", error)
        toast.error("Failed to issue credential: " + error.message)
        setLoading(false)
        return
      }

      // 5. Sign the credential (required for validation)
      console.log("Signing credential...")
      // Get the issued timestamp from the contract
      const issued_atRetrieved = Number(await credentialManager.methods.getIssuedTimestamp(credential_id).call())

      // Use proper EIP-712 signing with correct signature format
      let signature
      try {
        const domain = {
          name: "CredentialManager",
          version: "1",
          chainId: Number(await web3.eth.getChainId()),
          verifyingContract: credentialManager.options.address,
        }

        const types = {
          Credential: [
            { name: "id", type: "string" },
            { name: "issuer", type: "address" },
            { name: "subject", type: "string" },
            { name: "data", type: "string" },
            { name: "issuedAt", type: "uint256" },
            { name: "expiresAt", type: "uint256" },
          ],
        }

        const value = {
          id: credential_id,
          issuer: signer, // use signer here
          subject: did_name,
          data: credential_data,
          issuedAt: issued_atRetrieved,
          expiresAt: expires_at,
        }

        console.log("EIP-712 signing details:", {
          domain,
          types,
          value,
          chainId: Number(await web3.eth.getChainId()),
          contractAddress: credentialManager.options.address,
        })

        // Use eth_signTypedData_v4 for proper EIP-712 signing
        const rawSignature = await window.ethereum.request({
          method: "eth_signTypedData_v4",
          params: [
            signer,
            JSON.stringify({
              types: {
                EIP712Domain: [
                  { name: "name", type: "string" },
                  { name: "version", type: "string" },
                  { name: "chainId", type: "uint256" },
                  { name: "verifyingContract", type: "address" },
                ],
                ...types,
              },
              primaryType: "Credential",
              domain,
              message: value,
            }),
          ],
        })

        console.log("Raw EIP-712 signature:", rawSignature)

        // Ensure the signature is in the correct format for ECDSA.recover
        // eth_signTypedData_v4 returns a hex string that should be compatible
        signature = rawSignature

        // Verify the signature format (should be 65 bytes = 130 hex characters + '0x' prefix)
        if (signature.length !== 132) {
          throw new Error(`Invalid signature length: ${signature.length}. Expected 132 characters (65 bytes)`)
        }

        console.log("Processed signature:", signature)
        // Step 5 completed - Signature generated
        setCurrentStep(5)

        // Signature recovery test removed for browser compatibility
      } catch (signError) {
        console.error("Error with EIP-712 signing:", signError)
        toast.error("Failed to sign credential: " + signError.message)
        setLoading(false)
        return
      }

      // Sign the credential on-chain and await confirmation
      try {
        await credentialManager.methods.signCredential(credential_id, signature).send({ from: signer })
        console.log("Credential signed successfully")
        // Step 6 completed - Credential signed
        setCurrentStep(6)
      } catch (signTxError) {
        console.error("Error signing credential on-chain:", signTxError)
        toast.error("Failed to sign credential on-chain: " + signTxError.message)
        setLoading(false)
        return
      }

      // Immediately verify the credential is valid and signed (government check)
      try {
        const isCredentialValid = await credentialManager.methods.validateVerifiableCredential(credential_id).call()
        console.log("Credential valid after signing (government check):", isCredentialValid)
        if (!isCredentialValid) {
          toast.error("Credential is not valid after signing!")
          setLoading(false)
          return
        }
        // Step 7 completed - Credential validated
        setCurrentStep(7)
      } catch (verifyError) {
        console.error("Error verifying credential after signing:", verifyError)
        toast.error("Error verifying credential after signing: " + verifyError.message)
        setLoading(false)
        return
      }

      console.log("Credential signing details:", {
        credential_id,
        did_name,
        credential_data,
        credential_dataLength: credential_data.length,
        issued_atRetrieved,
        expires_at,
      })

      // Log the full credential data to see if there are any formatting issues
      console.log("Full credential data:", JSON.stringify(credential_data))
      console.log("Signature details:", {
        signature: signature,
        signatureLength: signature.length,
      })

      // 6. Mark as approved in backend
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/pending-did/${_id}/approve`, { method: "PATCH" })

      // 7. Create user credential in database
      try {
        const response = await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ethereumAddress: userAddress,
            didName: did_name,
            credentialId: credential_id,
            role: role,
            organizationId: organizationId,
          }),
        })

        if (response.ok) {
          toast.success(
            "DID registration approved, role granted in SignatureManager, credential issued, and user created in database!",
          )
        } else {
          const data = await response.json()
          console.error("Error creating user credential:", data)
          toast.error("DID approved but failed to create user in database")
        }
      } catch (userError) {
        console.error("Error creating user credential:", userError)
        toast.error("DID approved but failed to create user in database")
      }

      setPendingDIDs(pendingDIDs.filter((e) => e._id !== _id))
    } catch (err) {
      console.error("Failed to approve DID registration:", err)
      toast.error("Failed to approve DID registration: " + err.message)
    } finally {
      setLoading(false)
      // Reset progress after completion or error
      setTimeout(() => {
        setCurrentStep(0)
      }, 3000) // Reset after 3 seconds to show completion
    }
  }

  useEffect(() => {
    async function checkDefaultAdmin() {
      const { evContract, account } = await initializeContractInstance()
      setAccount(account)
      const defaultAdminRole = await evContract.methods.DEFAULT_ADMIN_ROLE().call()
      const hasRole = await evContract.methods.hasRole(defaultAdminRole, account).call()
      setHasDefaultAdminRole(hasRole)
    }
    checkDefaultAdmin()
  }, [])

  const trustLevels = {
    tenant_admin: 5, // TENANT_ADMIN_ROLE should have highest trust level since they manage other roles
  }

  // Allow only tenant_admin role selection
  const handleRoleChange = (e) => {
    const role = e.target.value
    setSelectedRole(role)
    setEntityDetails((prev) => ({
      ...prev,
      trustLevel: trustLevels[role] || 0,
      address: "",
      name: "",
      email: "",
      credentialDuration: 0,
      credentialType: "",
    }))
  }

  // 2. Add handler for multi-value fields
  const handleMultiInputChange = (name, value) => {
    setEntityDetails((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // 3. Update handleInputChange to support all fields
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEntityDetails((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // 4. Update handleSubmit to send all fields to backend
  const handleSubmit = async (action) => {
    // Scroll to top so user can see progress
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Reset progress and start from step 0
    setCurrentStep(0);

    try {
      const { evContract, didManager, credentialManager, signatureManager, account, web3 } =
        await initializeContractInstance()

      let address = entityDetails.address
      if (!address || typeof address !== "string") {
        toast.error(` Invalid address.`)
        return
      }
      address = address.trim()
      if (!web3.utils.isAddress(address)) {
        toast.error(`Invalid address. Please check the input.`)
        return
      }

      const roleMethod = `${selectedRole.toUpperCase()}_ROLE`
      const role = (await evContract.methods[roleMethod]) ? await evContract.methods[roleMethod]().call() : null
      if (!role) {
        toast.error(` Invalid role for ${selectedRole}.`)
        return
      }

      const actionMethod = action === "add" ? "grantRole" : "revokeRole"
      const actionMessage = action === "add" ? "Granting" : "Revoking"
      setLoading(true)

      // Step 1: Assign Role - move to step 1
      setCurrentStep(1)

      // Check caller's roles before proceeding
      const defaultAdminRole = await evContract.methods.DEFAULT_ADMIN_ROLE().call()
      const hasDefaultAdminRole = await evContract.methods.hasRole(defaultAdminRole, account).call()

      if (selectedRole === "tenant_admin") {
        const tenantAdminRole = await evContract.methods.TENANT_ADMIN_ROLE().call()
        // Check if target address is already assigned to an organization
        try {
          const userOrg = await evContract.methods.getUserOrganization(address).call()
          if (userOrg !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
            toast.error("This address is already assigned to an organization. Please use a different address.")
            setLoading(false)
            return
          }
        } catch (error) {
          console.log("getUserOrganization function not available or error:", error.message)
        }

        // Check if target address already has the role
        const hasTenantAdminRole = await evContract.methods.hasRole(tenantAdminRole, address).call()
      }

      let tx

      // For tenant_admin, use ONLY configureTenantAdmin for adding (never grantRole directly)
      if (selectedRole === "tenant_admin" && action === "add") {
        // Require organization name
        if (!entityDetails.name || entityDetails.name.trim() === "") {
          toast.error("Organization name is required.")
          setLoading(false)
          return
        }

        const organizationIdString = `${entityDetails.name.toLowerCase()}-${address.toLowerCase()}`
        const organizationIdHash = web3.utils.keccak256(organizationIdString)

        // Block if hash is all zeros
        if (organizationIdHash === "0x0000000000000000000000000000000000000000000000000000000000000000") {
          toast.error("Organization ID hash is invalid.")
          setLoading(false)
          return
        }

        // Call contract with hash
        tx = await evContract.methods.configureTenantAdmin(address, organizationIdHash).send({
          from: account,
          gas: 1000000,
        })

        // Step 1 completed - Role assigned
        setCurrentStep(1)

        // Create organization in backend with plain string
        try {
          await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/organization/create`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              organizationId: organizationIdString,
              organizationName: entityDetails.name,
              oemType: entityDetails.oemType,
              businessRegistrationNumber: entityDetails.businessRegistrationNumber,
              authorizedPersonName: entityDetails.authorizedPersonName,
              contactEmail: entityDetails.email,
              contactPhone: entityDetails.phone,
              headquartersAddress: entityDetails.headquartersAddress,
              countryRegion: entityDetails.countryRegion,
              batteryProductionVolume: entityDetails.batteryProductionVolume,
              licenseComplianceDocs: entityDetails.licenseComplianceDocs,
              carbonCategory: entityDetails.carbonCategory,
              supportedBatteryChemistries: entityDetails.supportedBatteryChemistries,
              logoBrandingAssets: entityDetails.logoBrandingAssets,
              ethereumAddress: entityDetails.address,
              credentialDurationMonths: entityDetails.credentialDuration,
              tenantAdminAddress: address,
            }),
          })
          // Empty the form after successful backend submission
          setEntityDetails(initialEntityDetails);
        } catch (orgError) {
          console.error("Error creating organization:", orgError)
        }

        // --- BEGIN: Full onboarding logic from approveDID ---
        try {
          // 1. Register the DID
          const normalizedOrgId = organizationIdString.toLowerCase()
          const normalizedUserAddress = address.toLowerCase()
          const did_name = `did:web:${normalizedOrgId}.com#create-${normalizedUserAddress}`
          const didHash = web3.utils.keccak256(did_name)
          const trustLevel = 5 // Tenant admin should have highest trust level

          // Check if DID is already registered
          let isRegistered = false
          try {
            isRegistered = await didManager.methods.isDIDRegistered(didHash).call()
          } catch (e) {
            console.log("Error checking DID registration:", e)
          }

          if (!isRegistered) {
            await didManager.methods
              .registerDID(didHash, did_name, address.toLowerCase(), trustLevel, [], [selectedRole])
              .send({ from: account })
          }

          // Step 2 completed - DID registered
          setCurrentStep(2)

          // 2. Verify the DID
          await didManager.methods.verifyGaiaXDID(didHash, true).send({ from: account })

          // Step 3 completed - DID verified
          setCurrentStep(3)

          // 3. Grant role in SignatureManager
          try {
            const signatureManagerRole = await signatureManager.methods[`${selectedRole.toUpperCase()}_ROLE`]().call()
            await signatureManager.methods
              .grantRole(signatureManagerRole, address)
              .send({ from: account, gas: 1000000 })
          } catch (error) {
            console.error("Failed to grant role in SignatureManager:", error)
          }

          // 4. Issue the credential
          const credential_id = `cred-${normalizedOrgId}-${normalizedUserAddress}`.toLowerCase()
          const latestBlock = await web3.eth.getBlock("latest")
          const issued_at = Number(latestBlock.timestamp)
          const expires_at = Number(issued_at + 12 * 30 * 24 * 60 * 60)

          const credential_data = JSON.stringify({
            userAddress: address,
            organizationId: organizationIdString,
            role: selectedRole,
            assignedBy: account,
          })

          const isVerified = await didManager.methods.isVerified(did_name).call()
          if (!isVerified) {
            toast.error("DID is not verified. Cannot issue credential.")
            setLoading(false)
            return
          }

          try {
            await credentialManager.methods
              .issueVerifiableCredential(
                credential_id,
                did_name,
                credential_data,
                expires_at,
                ["https://www.w3.org/2018/credentials/v1"],
                ["VerifiableCredential"],
                "EcdsaSecp256k1Signature2019",
                `did:ethr:${account}`,
              )
              .send({ from: account, gas: 1000000 })

            // Step 4 completed - Credential issued
            setCurrentStep(4)
          } catch (error) {
            console.error("Credential issuance failed:", error)
            toast.error("Failed to issue credential: " + error.message)
            setLoading(false)
            return
          }

          // 5. Sign the credential (EIP-712)
          const issued_atRetrieved = Number(await credentialManager.methods.getIssuedTimestamp(credential_id).call())
          let signature
          try {
            const domain = {
              name: "CredentialManager",
              version: "1",
              chainId: Number(await web3.eth.getChainId()),
              verifyingContract: credentialManager.options.address,
            }

            const types = {
              Credential: [
                { name: "id", type: "string" },
                { name: "issuer", type: "address" },
                { name: "subject", type: "string" },
                { name: "data", type: "string" },
                { name: "issuedAt", type: "uint256" },
                { name: "expiresAt", type: "uint256" },
              ],
            }

            const value = {
              id: credential_id,
              issuer: account,
              subject: did_name,
              data: credential_data,
              issuedAt: issued_atRetrieved,
              expiresAt: expires_at,
            }

            const rawSignature = await window.ethereum.request({
              method: "eth_signTypedData_v4",
              params: [
                account,
                JSON.stringify({
                  types: {
                    EIP712Domain: [
                      { name: "name", type: "string" },
                      { name: "version", type: "string" },
                      { name: "chainId", type: "uint256" },
                      { name: "verifyingContract", type: "address" },
                    ],
                    ...types,
                  },
                  primaryType: "Credential",
                  domain,
                  message: value,
                }),
              ],
            })

            signature = rawSignature
            if (signature.length !== 132) {
              throw new Error(`Invalid signature length: ${signature.length}. Expected 132 characters (65 bytes)`)
            }

            // Step 5 completed - Signature generated
            setCurrentStep(5)

            // Optionally: recover and check signature as in approveDID
          } catch (signError) {
            console.error("Error with EIP-712 signing:", signError)
            toast.error("Failed to sign credential: " + signError.message)
            setLoading(false)
            return
          }

          // Sign the credential on-chain and await confirmation
          try {
            await credentialManager.methods.signCredential(credential_id, signature).send({ from: account })
            console.log("Credential signed successfully")

            // Step 6 completed - Credential signed
            setCurrentStep(6)
          } catch (signTxError) {
            console.error("Error signing credential on-chain:", signTxError)
            toast.error("Failed to sign credential on-chain: " + signTxError.message)
            setLoading(false)
            return
          }

          // Immediately verify the credential is valid and signed (admin check)
          try {
            const isCredentialValid = await credentialManager.methods.validateVerifiableCredential(credential_id).call()
            console.log("Credential valid after signing (admin check):", isCredentialValid)
            if (!isCredentialValid) {
              toast.error("Credential is not valid after signing!")
              setLoading(false)
              return
            }

            // Step 7 completed - Credential validated
            setCurrentStep(7)
          } catch (verifyError) {
            console.error("Error verifying credential after signing:", verifyError)
            toast.error("Error verifying credential after signing: " + verifyError.message)
            setLoading(false)
            return
          }

          // 6. Create user credential in database
          try {
            const response = await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/create`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                ethereumAddress: address,
                didName: did_name,
                credentialId: credential_id,
                role: selectedRole,
                organizationId: organizationIdString,
              }),
            })

            if (response.ok) {
              toast.success(
                "Tenant admin fully onboarded: DID registered, verified, role granted, credential issued, signed, and user created!",
              )
            } else {
              const data = await response.json()
              console.error("Error creating user credential:", data)
              toast.error("Onboarding succeeded but failed to create user in database")
            }
          } catch (userError) {
            console.error("Error creating user credential:", userError)
            toast.error("Onboarding succeeded but failed to create user in database")
          }
        } catch (err) {
          console.error("Failed to fully onboard tenant admin:", err)
          toast.error("Failed to fully onboard tenant admin: " + err.message)
          setLoading(false)
          return
        }
        // --- END: Full onboarding logic ---
      } else if (selectedRole === "tenant_admin" && action === "remove") {
        // For removing tenant admin, use revokeRole
        tx = await evContract.methods.revokeRole(role, address).send({
          from: account,
          gas: 1000000,
        })
      }

      setCurrentStep((prev) => prev + 1)
      const receipt = await web3.eth.getTransactionReceipt(await tx.transactionHash)
      if (receipt.status) {
        toast.success(` ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} role ${action}ed successfully!`)
        // Refresh user roles after successful role assignment
        // Removed: await dispatch(checkUserRoles(account)).unwrap();
      } else {
        toast.error(` Failed to ${action} ${selectedRole}.`)
        return
      }

      if (action === "remove") {
        try {
          console.log("Making API request to delete user credential...")
          const response = await apiFetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/user/delete?ethereumAddress=${address}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
            },
          )

          const data = await response.json()
          if (response.ok) {
            toast.success("User credential deleted successfully from the database!")
            console.log("API Response:", data)
            // Refresh user roles after successful role removal
            // Removed: await dispatch(checkUserRoles(account)).unwrap();
            console.log("User roles refreshed after role removal")
          } else {
            toast.error(`Failed to delete user credential: ${data.error}`)
            console.error("API Error:", data)
          }
        } catch (apiError) {
          console.error("Error calling API:", apiError)
          toast.error("Error in calling user credential API.")
        }
      }
    } catch (error) {
      console.error(` Error ${action}ing ${selectedRole}:`, error)
      toast.error(` Failed to ${action} ${selectedRole}.`)
    } finally {
      setLoading(false)
      // Reset progress after completion or error
      setTimeout(() => {
        setCurrentStep(0)
      }, 3000) // Reset after 3 seconds to show completion
    }
  }

  const roles = [{ value: "tenant_admin", label: "Tenant Admin" }]

  const steps = [
    { icon: UserPlus, label: "Select Role" },
    { icon: Briefcase, label: "Assign Role" },
    { icon: Shield, label: "Register DID" },
    { icon: Check, label: "Verify DID" },
    { icon: Tag, label: "Issue Credential" },
    { icon: Clock, label: "Generate signature" },
    { icon: UserPlus, label: "Sign Credential" },
    { icon: Check, label: "Validate Credential" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Toaster position="top-center" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        

        {/* Main Content Card */}
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
          {/* Progress Bar */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
            <div className="flex justify-between items-center">
              {steps.map((step, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      index <= currentStep ? "bg-green-500 text-white shadow-lg scale-110" : "bg-white/20 text-white/70"
                    }`}
                  >
                    <step.icon className="w-6 h-6" />
                  </div>
                  <span className="mt-2 text-xs text-white/90 font-medium text-center max-w-16">{step.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8">
            <div className="flex items-center mb-8">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-r from-blue-100 to-indigo-100">
                <Briefcase className="w-7 h-7 text-blue-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-3xl font-bold text-gray-900">Role Management</h2>
                <p className="text-gray-600">Configure tenant admin roles and organization details</p>
              </div>
            </div>

            {/* Role Selection */}
            <div className="mb-8">
              <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-3">
                Select Role
              </label>
              <select
                id="role"
                value={selectedRole}
                onChange={handleRoleChange}
                className="w-full px-4 py-4 bg-gray-50 text-gray-900 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-lg font-medium"
              >
                <option value="tenant_admin">Tenant Admin</option>
              </select>
            </div>

            {/* Form Fields */}
            <div className="space-y-8">
              {/* Basic Information */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                    <UserPlus className="w-5 h-5 text-white" />
                  </div>
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                      Ethereum Address *
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={entityDetails.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white text-gray-900 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 font-mono text-sm"
                      placeholder="0x..."
                    />
                  </div>

                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Organization Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={entityDetails.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white text-gray-900 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                      placeholder="Enter organization name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={entityDetails.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white text-gray-900 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                      placeholder="contact@organization.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="credentialDuration" className="block text-sm font-semibold text-gray-700 mb-2">
                      Credential Duration (months)
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        id="credentialDuration"
                        name="credentialDuration"
                        value={entityDetails.credentialDuration}
                        onChange={handleInputChange}
                        min="1"
                        max="120"
                        className="w-full pl-12 pr-4 py-3 bg-white text-gray-900 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                        placeholder="12"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Organization Details */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  Organization Details
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="oemType" className="block text-sm font-semibold text-gray-700 mb-2">
                      OEM Type
                    </label>
                    <div className="relative">
                      <select
                        id="oemType"
                        name="oemType"
                        value={entityDetails.oemType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white text-gray-900 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 appearance-none cursor-pointer"
                      >
                        <option value="">Select OEM Type</option>
                        <option value="EV Manufacturer">EV Manufacturer</option>
                        <option value="Battery Pack Integrator">Battery Pack Integrator</option>
                        <option value="Importer">Importer</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="businessRegistrationNumber"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Business Registration Number
                    </label>
                    <input
                      type="text"
                      id="businessRegistrationNumber"
                      name="businessRegistrationNumber"
                      value={entityDetails.businessRegistrationNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white text-gray-900 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300"
                      placeholder="GSTIN, CIN, etc."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label htmlFor="authorizedPersonName" className="block text-sm font-semibold text-gray-700 mb-2">
                      Authorized Person Name
                    </label>
                    <input
                      type="text"
                      id="authorizedPersonName"
                      name="authorizedPersonName"
                      value={entityDetails.authorizedPersonName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white text-gray-900 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300"
                      placeholder="Main contact person"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      value={entityDetails.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white text-gray-900 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label htmlFor="headquartersAddress" className="block text-sm font-semibold text-gray-700 mb-2">
                      Headquarters Address
                    </label>
                    <input
                      type="text"
                      id="headquartersAddress"
                      name="headquartersAddress"
                      value={entityDetails.headquartersAddress}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white text-gray-900 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300"
                      placeholder="Full address"
                    />
                  </div>

                  <div>
                    <label htmlFor="countryRegion" className="block text-sm font-semibold text-gray-700 mb-2">
                      Country / Region
                    </label>
                    <select
                      id="countryRegion"
                      name="countryRegion"
                      value={entityDetails.countryRegion}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white text-gray-900 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300"
                    >
                      <option value="">Select Country</option>
                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                    <Tag className="w-5 h-5 text-white" />
                  </div>
                  Technical Specifications
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="batteryProductionVolume" className="block text-sm font-semibold text-gray-700 mb-2">
                      Battery Production Volume (Est.)
                    </label>
                    <select
                      id="batteryProductionVolume"
                      name="batteryProductionVolume"
                      value={entityDetails.batteryProductionVolume}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white text-gray-900 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300"
                    >
                      <option value="">Select Production Volume</option>
                      {productionVolumeRanges.map((range) => (
                        <option key={range} value={range}>
                          {range}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="carbonCategory" className="block text-sm font-semibold text-gray-700 mb-2">
                      Carbon Category
                    </label>
                    <select
                      id="carbonCategory"
                      name="carbonCategory"
                      value={entityDetails.carbonCategory}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white text-gray-900 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300"
                    >
                      <option value="">Select Carbon Category</option>
                      {carbonCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Supported Battery Chemistries
                  </label>
                  <div className="relative">
                    <select
                      id="supportedBatteryChemistries"
                      name="supportedBatteryChemistries"
                      multiple
                      value={entityDetails.supportedBatteryChemistries}
                      onChange={(e) =>
                        handleMultiInputChange(
                          "supportedBatteryChemistries",
                          Array.from(e.target.selectedOptions, (option) => option.value),
                        )
                      }
                      className="w-full px-4 py-3 bg-white text-gray-900 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 appearance-none cursor-pointer"
                      size="6"
                    >
                      <option value="LFP">LFP (Lithium Iron Phosphate)</option>
                      <option value="NMC">NMC (Nickel Manganese Cobalt)</option>
                      <option value="LMO">LMO (Lithium Manganese Oxide)</option>
                      <option value="LCO">LCO (Lithium Cobalt Oxide)</option>
                      <option value="Solid-state">Solid-state</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 flex items-center">
                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg mr-1">
                      Ctrl
                    </kbd>
                    /
                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg mx-1">
                      Cmd
                    </kbd>
                    to select multiple options
                  </p>

                  {/* Selected items display */}
                  {entityDetails.supportedBatteryChemistries.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {entityDetails.supportedBatteryChemistries.map((chemistry) => (
                        <span
                          key={chemistry}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200"
                        >
                          {chemistry}
                          <button
                            type="button"
                            onClick={() => {
                              const updated = entityDetails.supportedBatteryChemistries.filter((c) => c !== chemistry)
                              handleMultiInputChange("supportedBatteryChemistries", updated)
                            }}
                            className="ml-2 inline-flex items-center justify-center w-4 h-4 text-purple-600 hover:text-purple-800 hover:bg-purple-200 rounded-full transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Document Uploads */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center mr-3">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  Document Uploads
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* License/Compliance Documents */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      License / Compliance Documents
                    </label>

                    <div className="relative">
                      <input
                        type="file"
                        id="licenseComplianceDocs"
                        name="licenseComplianceDocs"
                        accept="application/pdf"
                        multiple
                        onChange={handleDocsUpload}
                        disabled={uploadingDocs}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      />

                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-orange-400 hover:bg-orange-50/50 transition-all duration-300 bg-white">
                        {uploadingDocs ? (
                          <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mb-3"></div>
                            <p className="text-orange-600 font-medium">Uploading documents...</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-3">
                              <Upload className="w-6 h-6 text-white" />
                            </div>
                            <button
                              type="button"
                              className="bg-gray-800 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors mb-2"
                            >
                              Choose files
                            </button>
                            <p className="text-sm text-gray-500">or drag and drop PDF files here</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Uploaded Documents List */}
                    {entityDetails.licenseComplianceDocs.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-medium text-gray-700">Uploaded Documents:</p>
                        {entityDetails.licenseComplianceDocs.map((url, idx) => (
                          <div
                            key={url}
                            className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm"
                          >
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                                <FileText className="w-4 h-4 text-red-600" />
                              </div>
                              <div>
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm font-medium text-gray-900 hover:text-blue-600 flex items-center"
                                >
                                  Document_{idx + 1}.pdf
                                  <ExternalLink className="w-3 h-3 ml-1" />
                                </a>
                                <p className="text-xs text-gray-500">PDF Document</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveDoc(url)}
                              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Logo/Branding Assets */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Logo / Branding Assets</label>

                    <div className="relative">
                      <input
                        type="file"
                        id="logoBrandingAssets"
                        name="logoBrandingAssets"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={uploadingLogo}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      />

                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-orange-400 hover:bg-orange-50/50 transition-all duration-300 bg-white">
                        {uploadingLogo ? (
                          <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mb-3"></div>
                            <p className="text-orange-600 font-medium">Uploading logo...</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-3">
                              <ImageIcon className="w-6 h-6 text-white" />
                            </div>
                            <button
                              type="button"
                              className="bg-gray-800 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors mb-2"
                            >
                              Choose file
                            </button>
                            <p className="text-sm text-gray-500">or drag and drop image files here (JPEG, PNG, GIF, WebP, SVG)</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Uploaded Logo Display */}
                    {entityDetails.logoBrandingAssets && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Uploaded Asset:</p>
                        <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                              <ImageIcon className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <a
                                href={entityDetails.logoBrandingAssets}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-gray-900 hover:text-blue-600 flex items-center"
                              >
                                Organization Logo
                                <ExternalLink className="w-3 h-3 ml-1" />
                              </a>
                              <p className="text-xs text-gray-500">
                                Image File
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEntityDetails((prev) => ({ ...prev, logoBrandingAssets: "" }))}
                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Permission Warning */}
            {selectedRole === "tenant_admin" && !hasDefaultAdminRole && (
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400 p-6 rounded-lg mt-8">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center mr-3">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-yellow-800">Insufficient Permissions</p>
                    <p className="text-yellow-700 text-sm">
                      You do not have DEFAULT_ADMIN_ROLE. Only users with this role can add Tenant Admins.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {(selectedRole !== "tenant_admin" || hasDefaultAdminRole) && (
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button
                  disabled={loading || !selectedRole || !entityDetails.address}
                  onClick={() => handleSubmit("add")}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 ease-in-out hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-green-500/30 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ) : (
                    <UserPlus className="w-5 h-5 mr-2" />
                  )}
                  Add Tenant Admin
                </button>

                <button
                  disabled={loading || !selectedRole || !entityDetails.address}
                  onClick={() => handleSubmit("remove")}
                  className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 ease-in-out hover:from-red-600 hover:to-rose-700 focus:outline-none focus:ring-4 focus:ring-red-500/30 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <UserMinus className="w-5 h-5 mr-2" />
                  Remove Tenant Admin
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Pending DID Registrations Section */}
        {/* The Pending DID Registrations section has been moved to its own page. */}
      </div>
    </div>
  )
}
