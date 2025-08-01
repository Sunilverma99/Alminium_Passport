import React from 'react';
import MaterialCompositionQuery from '../../components/MaterialCompositionQuery';

const SupplierQueryMaterialComposition = () => {
  return <MaterialCompositionQuery userRole="SUPPLIER" requiredTrustLevel={3} />;
};

export default SupplierQueryMaterialComposition; 