// // "use client"

// import { useState } from "react"
// import { motion } from "framer-motion"
// import { ChevronRight } from "lucide-react"

// export default function ProductShowcase() {
//   const [hoveredCard, setHoveredCard] = useState(null)

//   const products = [
//     {
//       icon: (
//         <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//           <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
//         </svg>
//       ),
//       title: "Digital Twin (DT)",
//       why: "To Optimize Various Manufacturing Processes",
//       deliverables:
//         "Implement DT technology to simulate and improve production processes, reducing costs and increasing efficiency.",
//     },
//     {
//       icon: (
//         <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//           <path d="M8 7V17M12 11V17M16 3V17M4 21H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
//         </svg>
//       ),
//       title: "ESG Benchmarking",
//       why: "To Improve ESG Performance",
//       deliverables:
//         "Incorporate ESG metrics to measure and improve environmental impact, social responsibility, and governance standards.",
//     },
//     {
//       icon: (
//         <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//           <path d="M4 4H20V16H4V4ZM4 8H20M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
//         </svg>
//       ),
//       title: "Digital Passport (DPP)",
//       why: "To Enhance Supply Chain Transparency",
//       deliverables:
//         "Use DPP systems to track and verify the sourcing and movement of materials, ensuring ethical practices and regulatory compliance.",
//     },
//     {
//       icon: (
//         <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//           <path
//             d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z"
//             fill="currentColor"
//           />
//           <path
//             d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
//             stroke="currentColor"
//             strokeWidth="2"
//           />
//         </svg>
//       ),
//       title: "Business Simulation Game",
//       why: "Strengthen Strategic Decision-Making",
//       deliverables: "Utilize simulation tools to forecast outcomes, test strategies, and prepare for market dynamics.",
//     },
//   ]


// }

"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

export default function ProductShowcase() {
  const [hoveredCard, setHoveredCard] = useState(null)

  const products = [
    {
      icon: "🏭",
      title: "Digital Twin (DT)",
      description: "Implement DT technology to simulate and improve production processes, reducing costs and increasing efficiency.",
    },
    {
      icon: "🌿",
      title: "ESG Benchmarking",
      description: "Incorporate ESG metrics to measure and improve environmental impact, social responsibility, and governance standards.",
    },
    {
      icon: "📊",
      title: "Business Simulation Game",
      description: "Utilize simulation tools to forecast outcomes, test strategies, and prepare for market dynamics.",
    },
    {
      icon: "🔗",
      title: "Digital Passport (DPP)",
      description: "Use DPP systems to track and verify the sourcing and movement of materials, ensuring ethical practices and regulatory compliance.",
    },
  ]

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-6 text-gray-900">Revolutionizing Industries with Innovation</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Empowering businesses with cutting-edge solutions for smarter manufacturing and sustainable growth.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              onHoverStart={() => setHoveredCard(index)}
              onHoverEnd={() => setHoveredCard(null)}
              className="relative group"
            >
              <div className="bg-gray-50 rounded-xl p-6 transition-all duration-300 group-hover:shadow-lg group-hover:bg-gray-100">
                <div className="text-4xl mb-4">{product.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{product.title}</h3>
                <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                  {product.description}
                </p>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: hoveredCard === index ? 1 : 0, y: hoveredCard === index ? 0 : 10 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4"
                >
                  <button className="text-blue-600 hover:text-blue-700 transition-colors duration-300 font-medium flex items-center">
                    Learn more <ArrowRight className="ml-1 w-4 h-4" />
                  </button>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <h2 className="text-3xl font-semibold mb-6 text-gray-900">Ready to transform your business?</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-blue-600 text-white rounded-full font-semibold inline-flex items-center space-x-2 hover:bg-blue-700 transition duration-300"
          >
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}

