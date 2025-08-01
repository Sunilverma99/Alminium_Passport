import { useDispatch, useSelector } from 'react-redux';

// Custom hook for typed dispatch and selector
export const useAppDispatch = useDispatch;
export const useAppSelector = useSelector;

// Custom hooks for specific slices
export const useContract = () => {
  return useSelector((state) => state.contract);
};

export const useBattery = () => {
  return useSelector((state) => state.battery);
};

export const useOrganization = () => {
  return useSelector((state) => state.organization);
};

// Custom hooks for specific data
export const useUserRoles = () => {
  const contract = useContract();
  return {
    hasGovernmentRole: contract.roles?.government || false,
    hasTenantAdminRole: contract.roles?.tenantAdmin || false,
    hasManufacturerRole: contract.roles?.manufacturer || false,
    hasSupplierRole: contract.roles?.supplier || false,
    hasRecyclerRole: contract.roles?.recycler || false,
    hasConsumerRole: contract.roles?.thirdParty || false,
    hasMinerRole: contract.roles?.miner || false,
  };
};

export const useUserAccount = () => {
  const contract = useContract();
  return {
    account: contract.userAddress,
    isConnected: contract.isConnected,
    isConnecting: contract.isLoading,
  };
};

export const useBatteryStats = () => {
  const battery = useBattery();
  return battery.stats;
};

export const useOrganizationStats = () => {
  const organization = useOrganization();
  return organization.stats;
};

export const useOrganizationMembers = () => {
  const organization = useOrganization();
  return organization.members;
}; 