// export default function Component() {
//   const PassportField = ({ icon, label, value, gradientFrom, gradientTo }) => (
//     <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
//       <span style={{ marginRight: '12px', color: '#4B5563' }}>{icon}</span>
//       <span style={{ fontSize: '14px', fontWeight: 500, color: '#374151', marginRight: '8px' }}>{label}:</span>
//       <span 
//         style={{
//           fontSize: '14px',
//           fontWeight: 600,
//           color: 'white',
//           padding: '4px 12px',
//           borderRadius: '9999px',
//           background: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})`,
//           boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
//         }}
//       >
//         {value}
//       </span>
//     </div>
//   )

//   return (
//     <div style={{ 
//       maxWidth: '28rem', 
//       margin: '0 auto', 
//       backgroundColor: 'white', 
//       borderRadius: '0.5rem', 
//       boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
//       overflow: 'hidden'
//     }}>
//       <div style={{ 
//         borderBottom: '2px solid rgba(59, 130, 246, 0.2)', 
//         paddingBottom: '1rem', 
//         marginBottom: '1rem',
//         padding: '1.5rem'
//       }}>
//         <h1 style={{ 
//           fontSize: '1.5rem', 
//           fontWeight: 'bold', 
//           textAlign: 'center', 
//           color: '#1E40AF'
//         }}>
//           RoHS Data Passport
//         </h1>
//       </div>
//       <div style={{ padding: '0 1.5rem 1.5rem' }}>
//         <div style={{ marginBottom: '1.5rem' }}>
//           <section>
//             <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1E40AF', marginBottom: '0.5rem' }}>Site Information</h2>
//             <PassportField
//               icon="🏢"
//               label="Manufacturer"
//               value="Full disclosure"
//               gradientFrom="#F59E0B"
//               gradientTo="#D97706"
//             />
//             <PassportField
//               icon="📍"
//               label="Site Name"
//               value="Full disclosure"
//               gradientFrom="#F59E0B"
//               gradientTo="#D97706"
//             />
//           </section>

//           <section style={{ marginTop: '1.5rem' }}>
//             <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1E40AF', marginBottom: '0.5rem' }}>Product Details</h2>
//             <PassportField
//               icon="✅"
//               label="Certifications"
//               value="Full disclosure"
//               gradientFrom="#F59E0B"
//               gradientTo="#D97706"
//             />
//             <PassportField
//               icon="📦"
//               label="Product Name"
//               value="Full disclosure"
//               gradientFrom="#F59E0B"
//               gradientTo="#D97706"
//             />
//             <PassportField
//               icon="⚛️"
//               label="Asset Type"
//               value="Public"
//               gradientFrom="#EC4899"
//               gradientTo="#BE185D"
//             />
//             <div style={{ marginLeft: '2rem', marginTop: '0.5rem' }}>
//               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px' }}>
//                 <span style={{ color: '#4B5563' }}>Methyl Bromide:</span>
//                 <span style={{ fontWeight: 600 }}>&lt;1%</span>
//               </div>
//               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
//                 <span style={{ color: '#4B5563' }}>Fluorinated coating:</span>
//                 <span style={{ fontWeight: 600 }}>&lt;1%</span>
//               </div>
//             </div>
//           </section>

//           <section style={{ marginTop: '1.5rem' }}>
//             <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1E40AF', marginBottom: '0.5rem' }}>Batch Information</h2>
//             <PassportField
//               icon="⚖️"
//               label="Weight"
//               value="Public"
//               gradientFrom="#EC4899"
//               gradientTo="#BE185D"
//             />
//             <PassportField
//               icon="📄"
//               label="Certifications"
//               value="Full disclosure"
//               gradientFrom="#F59E0B"
//               gradientTo="#D97706"
//             />
//           </section>
//         </div>

//         <div style={{ 
//           marginTop: '2rem', 
//           paddingTop: '1rem', 
//           borderTop: '2px solid rgba(59, 130, 246, 0.2)',
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center'
//         }}>
//           <div style={{ fontSize: '14px', color: '#4B5563' }}>
//             <div>Issue Date: {new Date().toLocaleDateString()}</div>
//             <div>Passport No: RoHS-{Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
//           </div>
//           <div style={{ 
//             width: '5rem', 
//             height: '5rem', 
//             backgroundColor: 'rgba(59, 130, 246, 0.1)', 
//             borderRadius: '9999px', 
//             display: 'flex', 
//             alignItems: 'center', 
//             justifyContent: 'center' 
//           }}>
//             <img src="/seal.png" alt="RoHS Seal" style={{ width: '4rem', height: '4rem' }} />
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
export default function Component() {
  const PassportField = ({ icon, label, value, gradientFrom, gradientTo }) => (
    <div className="flex items-center mb-4">
      <span className="mr-3 text-gray-400">{icon}</span>
      <span className="text-sm font-medium text-gray-300 mr-2">{label}:</span>
      <span 
        className={`text-sm font-semibold text-white px-3 py-1 rounded-full bg-gradient-to-r ${gradientFrom} ${gradientTo} shadow-sm`}
      >
        {value}
      </span>
    </div>
  )

  return (
    <div className="max-w-md mx-auto bg-gray-800 shadow-lg overflow-hidden text-gray-200">
      <div className="border-b-2 border-blue-500/20 pb-4 mb-4 p-6">
        <h1 className="text-2xl font-bold text-center text-blue-400">
          RoHS Data Passport
        </h1>
      </div>
      <div className="px-6 pb-6">
        <div className="mb-6">
          <section>
            <h2 className="text-lg font-semibold text-blue-400 mb-2">Site Information</h2>
            <PassportField
              icon="🏢"
              label="Manufacturer"
              value="Full disclosure"
              gradientFrom="from-yellow-500"
              gradientTo="to-yellow-700"
            />
            <PassportField
              icon="📍"
              label="Site Name"
              value="Full disclosure"
              gradientFrom="from-yellow-500"
              gradientTo="to-yellow-700"
            />
          </section>

          <section className="mt-6">
            <h2 className="text-lg font-semibold text-blue-400 mb-2">Product Details</h2>
            <PassportField
              icon="✅"
              label="Certifications"
              value="Full disclosure"
              gradientFrom="from-yellow-500"
              gradientTo="to-yellow-700"
            />
            <PassportField
              icon="📦"
              label="Product Name"
              value="Full disclosure"
              gradientFrom="from-yellow-500"
              gradientTo="to-yellow-700"
            />
            <PassportField
              icon="⚛️"
              label="Asset Type"
              value="Public"
              gradientFrom="from-pink-500"
              gradientTo="to-pink-700"
            />
            <div className="ml-8 mt-2 space-y-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Methyl Bromide:</span>
                <span className="font-semibold">&lt;1%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Fluorinated coating:</span>
                <span className="font-semibold">&lt;1%</span>
              </div>
            </div>
          </section>

          <section className="mt-6">
            <h2 className="text-lg font-semibold text-blue-400 mb-2">Batch Information</h2>
            <PassportField
              icon="⚖️"
              label="Weight"
              value="Public"
              gradientFrom="from-pink-500"
              gradientTo="to-pink-700"
            />
            <PassportField
              icon="📄"
              label="Certifications"
              value="Full disclosure"
              gradientFrom="from-yellow-500"
              gradientTo="to-yellow-700"
            />
          </section>
        </div>

        <div className="mt-8 pt-4 border-t-2 border-blue-500/20 flex justify-between items-center">
          <div className="text-sm text-gray-400">
            <div>Issue Date: {new Date().toLocaleDateString()}</div>
            <div>Passport No: RoHS-{Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
          </div>
          <div className="w-20 h-20 bg-blue-400/10 rounded-full flex items-center justify-center">
            <img src="/seal.png" alt="RoHS Seal" className="w-16 h-16" />
          </div>
        </div>
      </div>
    </div>
  )
}