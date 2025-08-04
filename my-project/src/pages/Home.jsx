import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight,CircleDollarSign,Leaf  } from "lucide-react"
import {
  Battery,
  Shield,
  Activity ,
  Recycle,
  Users,
  Building2,
  Zap,
  ChevronRight,
  Truck,
  User,
  Lock,
  Database,
  Wallet,
  BarChart , 
  CircleDot
} from "lucide-react";
import { useSelector } from "react-redux";
import GovernmentHomePage from "./Government/GovernmentHome.jsx"
import ManufacturerHomePage from "./Manufacturer/ManfacturerHome.jsx"
import MinerHomePage from "./Miner/MinerHomePage.jsx"
import SupplierHomePage from "./Supplier/SupplierHomePage.jsx"
import TenantAdminHomePage from "./Government/TenantAdminHomePage.jsx"
import TenantHome from "./Tenant/Home.jsx"
import RecyclerDashboard from "./Recycler/RecyclerDashboard.jsx"
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};
const benefits = [
  {
    title: "Economic",
    icon: CircleDollarSign,
    items: [
      "Streamlined aluminium processing and quality control procedures",
      "Reduced production costs through improved material efficiency and recycling",
    ],
  },
  {
    title: "Environmental",
    icon: Leaf,
    items: [
      "Enhanced aluminium recycling reduces energy consumption and carbon footprint",
      "Data-driven production minimizes waste and conserves natural resources",
    ],
  },
  {
    title: "Social",
    icon: Users,
    items: [
      "Decentralized access creates local employment opportunities",
      "Empowers local manufacturers through accessible passport data",
    ],
  },
]
const timelineItems = [
  {
    title: "Information Access",
    content: "Provides manufacturers, processors and recyclers with up-to-date information for the handling of aluminium and specific actors with tailored information such as on the material composition and quality of aluminium."
  },
  {
    title: "Data Management",
    content: "Allows economic operators to gather and re-use information and data on individual aluminium batches more efficiently, enabling better informed choices in their planning activities."
  },
  {
    title: "Market Surveillance",
    content: "Supports market surveillance authorities in carrying out their tasks under sustainability regulations, facilitating monitoring and enforcement activities."
  },
  {
    title: "Expert Opinion",
    content: "The Aluminium Passport's new recycling and sustainability rules are an important step to differentiating Europe's aluminium market on the global stage",
    author: "Industry Expert, Sustainability Director"
  }
]


export default function Component() {
  
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const feature = [
  {
    icon: Battery,
    title: "Aluminium Lifecycle Tracking",
    description: "Monitor the entire lifecycle of aluminium from mining to recycling."
  },
  {
    icon: Shield,
    title: "Compliance Management",
    description: "Ensure adherence to sustainability regulations and global standards."
  },
  {
    icon: Activity,
    title: "Real-time Analytics",
    description: "Access up-to-date information on aluminium quality and composition."
  },
  {
    icon: BarChart,
    title: "Sustainability Metrics",
    description: "Track and report on key sustainability indicators for your aluminium supply chain."
  }
]
  const { roles, isConnected } = useSelector((state) => state.contract);
  const { manufacturer = false, government = false, supplier = false, tenantAdmin = false, miner = false, thirdParty = false, recycler = false, globalAuditor = false } = roles || {};
  
  // Check if user has any role
  const hasAnyRole = government || manufacturer || supplier || tenantAdmin || miner || thirdParty || recycler || globalAuditor;

  // Show role-specific home page only when connected AND has roles
  if (isConnected && hasAnyRole) {
    if (government) {
      return <GovernmentHomePage />;
    }
    
    if (manufacturer) {
      return <ManufacturerHomePage />;
    }
    
    if (miner) {
      return <MinerHomePage />;
    }
    
    if (supplier) {
      return <SupplierHomePage />;
    }
    
    if (tenantAdmin) {
      return <TenantHome />;
    }
    
    if (recycler) {
      return <RecyclerDashboard />;
    }
    
    if (globalAuditor) {
      return <GovernmentHomePage />;
    }
    
    // For other roles (thirdParty), show default home page for now
    // You can add specific home pages for these roles later
  }

  // Show default home page for disconnected users or users without roles

  const features = [
    {
      title: "Blockchain Integration",
      description: "Secure and transparent tracking of battery lifecycle",
      color: "from-emerald-400 to-teal-600",
      icon: "🔗"
    },
    {
      title: "Compliance Management",
      description: "Ensure adherence to EU regulations and standards",
      color: "from-blue-400 to-indigo-600",
      icon: "📋"
    },
    {
      title: "Sustainability Metrics",
      description: "Monitor and improve environmental impact",
      color: "from-amber-400 to-orange-600",
      icon: "🌿"
    }
  ];

  const roleTypes = [
    { name: "Government (Admin)", description: "Oversees the entire system and ensures compliance", icon: "🏛️" },
    { name: "Miner", description: "Extracts raw materials for battery production", icon: "⛏️" },
    { name: "Manufacturer", description: "Produces and registers new batteries", icon: "🏭" },
    { name: "Supplier", description: "Distributes batteries to consumers", icon: "🚚" },
    { name: "Consumer", description: "Uses the battery in their electric vehicle", icon: "🚗" },
    { name: "Recycler", description: "Processes end-of-life batteries for material recovery", icon: "♻️" }
  ];


const testimonials = [
  {
    name: "Michael Kellner",
    role: "Parliamentary State Secretary German Government",
    image: "https://thebatterypass.eu/wp-content/uploads/KellnerMichael.png",
    quote: "Sustainable batteries are a key element for environmentally, socially and climate-friendly electromobility. With the digital Battery Pass, we are getting a big step closer to this goal: Important data, such as the climate footprint or information on the conditions of raw material extraction, repairability and recyclability, will be securely stored in it and exchanged among the economic actors along the battery value chain – from raw material extraction to reuse and recycling. This creates transparency around the electric car battery."
  },
  {
    name: "Tilmann Vahle",
    role: "Circular Mobility Platform Lead",
    image: "https://thebatterypass.eu/wp-content/uploads/VahleTilmann.png",
    quote: "Data-enabled lifecycle management of vehicle batteries is central to strengthen the effectiveness of the EU battery and automotive industry. It will not only accelerate the scaling of the number of electric vehicles, but will also ensure a productive and environmentally sound use of valuable vehicle traction batteries. This will help EU nations and companies to achieve their climate targets, generate high-quality jobs and reduce import dependencies."
  }
  
]

return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900">
  
    <main>
    <div className="bg-gradient-to-br from-blue-100 via-indigo-50 to-blue-100 overflow-hidden relative">
      <section className="">
        {/* Decorative elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 overflow-hidden"
        >
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl opacity-20"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#FF00B0] rounded-full filter blur-3xl opacity-20"></div>
        </motion.div>

        <div className="container mx-auto h-full px-4 py-12 flex items-center relative z-10">
          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            <motion.div variants={fadeIn} className="text-gray-900 max-w-2xl">
              <motion.h1
                variants={fadeIn}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
              >
                Revolutionizing Aluminium Traceability for a{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-700">
                  Sustainable Future
                </span>
              </motion.h1>
              <motion.p variants={fadeIn} className="text-lg md:text-xl mb-8 text-gray-600 leading-relaxed">
                Empower your supply chain with our innovative Aluminium Passport platform. Seamlessly track, verify, and share aluminium lifecycle data to drive compliance, enhance transparency, and accelerate the transition to a circular economy.
              </motion.p>

              <motion.div variants={fadeIn} className="flex space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center px-6 py-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors"
                >
                  Contact us
                  <ArrowRight className="ml-2 h-5 w-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center px-6 py-3 rounded-full border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-semibold transition-colors"
                >
                  Learn More
                </motion.button>
              </motion.div>
            </motion.div>
            <motion.div
              variants={fadeIn}
              className="relative"
            >
              <motion.img
                src="/Home.png"
                alt="Battery Passport Platform Team"
                className="w-full h-auto rounded-lg shadow-2xl"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="absolute -bottom-4 -left-4 bg-white p-4 rounded-lg shadow-lg"
              >
                <p className="text-sm font-semibold text-gray-800">Trusted by 50+ companies worldwide</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating elements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="absolute bottom-4 left-4 text-gray-700 text-sm bg-white/80 px-3 py-1 rounded-full backdrop-blur-sm"
        >
          ISO 27001 Certified
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="absolute bottom-4 right-4 text-gray-700 text-sm bg-white/80 px-3 py-1 rounded-full backdrop-blur-sm"
        >
          GDPR Compliant
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12"
          >
            Empowering Your Aluminium Supply Chain
          </motion.h2>
          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {feature.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className="bg-white/80 backdrop-blur-lg rounded-lg p-6 text-gray-900 hover:bg-white/90 transition-colors shadow-lg"
              >
                <feature.icon className="w-12 h-12 text-blue-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-700">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>

<section className="py-20 px-8 bg-white">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-16">
            {/* Product Compliance */}
            <div>
              <h2 className="text-[#5B46F4] text-3xl md:text-4xl font-bold mb-4">
                Aluminium Passport
              </h2>
              <p className="text-gray-800 text-lg">
                Get audit ready for <span className="font-semibold">sustainability regulations</span> compliance, 
                meet the requirements for aluminium products with <span className="font-semibold">full traceability</span>, 
                and stay ahead with <span className="font-semibold">digital aluminium passports</span>, 
                while maintaining full traceability and data integrity across your supply chain.
              </p>
            </div>

            {/* Three Key Points */}
            <div className="space-y-12">
              {/* Point 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Battery className="w-8 h-8 text-[#5B46F4]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#5B46F4] mb-2">
                    Primary Aluminium Production
                  </h3>
                  <p className="text-gray-700">
                    Track aluminium from bauxite mining through alumina refining to primary 
                    aluminium smelting, ensuring responsible sourcing and production practices.
                  </p>
                </div>
              </div>

              {/* Point 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Shield className="w-8 h-8 text-[#5B46F4]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#5B46F4] mb-2">
                    Secondary Aluminium Processing
                  </h3>
                  <p className="text-gray-700">
                    Monitor recycled aluminium processing, including collection, sorting, 
                    melting, and alloying to create high-quality secondary aluminium products.
                  </p>
                </div>
              </div>

              {/* Point 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Activity className="w-8 h-8 text-[#5B46F4]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#5B46F4] mb-2">
                    Aluminium Products Manufacturing
                  </h3>
                  <p className="text-gray-700">
                    Track aluminium through various manufacturing processes including 
                    extrusion, rolling, casting, and finishing for automotive, aerospace, 
                    construction, and packaging applications.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Battery Passport UI */}
          <div className="relative ">
             <img src="Alminium_passport.png" alt="Aluminium Passport Interface"  className="border-8 border-blue-500 rounded-lg shadow-lg shadow-blue-500/50"/>
          </div>
        </div>
      </div>
    </section>
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-blue-100/50 py-20">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 grid grid-cols-3 -skew-y-12 opacity-[0.03]"
        aria-hidden="true"
      >
        {[...Array(30)].map((_, i) => (
          <div key={i} className="border-r border-b border-blue-900" />
        ))}
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-emerald-800 via-emerald-600 to-teal-600 bg-clip-text text-transparent sm:text-5xl">
            Benefits & Impact
            <span className="block text-base font-medium tracking-normal text-emerald-700 mt-3">
              Transforming the future of aluminium management
            </span>
          </h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className="group relative bg-white p-8 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.1)] overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              {/* Decorative corner gradient */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Icon wrapper */}
              <div className="relative mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-200">
                  {React.createElement(benefit.icon, { className: "w-6 h-6" })}
                </div>
                <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-emerald-50 rounded-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Content */}
              <div className="relative">
                <h3 className="text-xl font-semibold text-emerald-900 mb-4">{benefit.title}</h3>
                <ul className="space-y-3">
                  {benefit.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3 text-emerald-700">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-emerald-600 to-teal-500 text-white flex items-center justify-center text-xs mt-0.5 shadow-sm shadow-emerald-200">
                        {itemIndex + 1}
                      </span>
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bottom decoration */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 to-teal-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </div>
          ))}
        </div>

        <div className="relative mt-16 text-center">
          <p className="max-w-3xl mx-auto text-emerald-700 text-lg italic">
            Our aluminium passport system promotes sustainable practices while creating economic opportunities and
            environmental benefits across the entire aluminium lifecycle.
          </p>
          {/* Decorative elements */}
          <div className="absolute top-1/2 left-0 w-32 h-px bg-gradient-to-r from-emerald-200 to-transparent" />
          <div className="absolute top-1/2 right-0 w-32 h-px bg-gradient-to-l from-emerald-200 to-transparent" />
        </div>
      </div>
    </section>
     
    <section className="relative min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-cyan-50 py-20 px-4 overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[500px] h-[500px] -right-24 -top-24 bg-gradient-to-br from-violet-200/20 to-fuchsia-200/20 rounded-full blur-3xl" />
        <div className="absolute w-[500px] h-[500px] -left-24 -bottom-24 bg-gradient-to-br from-cyan-200/20 to-violet-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-green-500   mb-6">
            Aluminium Passport Initiative
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Transforming aluminium lifecycle management through digital innovation and sustainability
          </p>
        </motion.div>

        <div className="relative">
          {/* Central Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-violet-200 via-fuchsia-200 to-cyan-200" />

          {timelineItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative mb-20 last:mb-0"
            >
              <div className={`flex items-center ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}>
                {/* Timeline Node */}
                <div className="absolute left-1/2 transform -translate-x-1/2">
                  <motion.div whileHover={{ scale: 1.2 }} className="relative w-6 h-6">
                    <div className="absolute inset-0 bg-black rounded-full blur-sm" />
                    <CircleDot className="relative w-6 h-6 text-white" />
                  </motion.div>
                </div>

                {/* Content Card */}
                <motion.div
                  whileHover={{ scale: 1.02, rotateX: "2deg" }}
                  className={`w-[calc(50%-2rem)] group cursor-pointer ${
                    index % 2 === 0 ? "mr-auto pr-8" : "ml-auto pl-8"
                  }`}
                >
                  <div className="relative bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-[0_8px_16px_rgb(0_0_0/0.04)] border border-white/20 overflow-hidden transition-all duration-300 hover:shadow-[0_16px_32px_rgb(0_0_0/0.06)]">
                    {/* Decorative Corner */}
                    <div className="absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br from-violet-100 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <h3 className="text-xl font-semibold bg-gradient-to-r from-green-600 to-green-600 bg-clip-text text-transparent mb-4 flex items-center gap-3">
                      {item.title}
                      <ArrowRight className="w-4 h-4 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </h3>
                    <p className="text-gray-600 leading-relaxed">{item.content}</p>
                    {item.author && (
                      <p className="mt-4 text-sm text-gray-500 italic border-l-2 border-fuchsia-200 pl-4">
                        {item.author}
                      </p>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
   
    </main>

    
  </div>
);
}
