import React from 'react';
import MaterialCompositionQuery from '../../components/MaterialCompositionQuery';

const GovernmentQueryMaterialComposition = () => {
  return <MaterialCompositionQuery userRole="GOVERNMENT" requiredTrustLevel={5} />;
};

export default GovernmentQueryMaterialComposition; 