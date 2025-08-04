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
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#00FFB0] rounded-full filter blur-3xl opacity-20"></div>
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
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFB0] to-[#00E69E]">
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
                  className="inline-flex items-center px-6 py-3 rounded-full bg-[#00FFB0] hover:bg-[#00E69E] text-black font-semibold transition-colors"
                >
                  Contact us
                  <ArrowRight className="ml-2 h-5 w-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center px-6 py-3 rounded-full border border-[#00FFB0] text-[#00FFB0] hover:bg-[#00FFB0] hover:text-black font-semibold transition-colors"
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
                <feature.icon className="w-12 h-12 text-[#00FFB0] mb-4" />
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
             <img src="Alminium_passport.png" alt="Aluminium Passport Interface"  className="border-8 border-green-500 rounded-lg shadow-lg shadow-green-500/50"/>
          </div>
        </div>
      </div>
    </section>
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 to-emerald-100/50 py-20">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 grid grid-cols-3 -skew-y-12 opacity-[0.03]"
        aria-hidden="true"
      >
        {[...Array(30)].map((_, i) => (
          <div key={i} className="border-r border-b border-emerald-900" />
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
   

      <section class="bg-white dark:bg-gray-900">
  <div class="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6 ">
      <div class="mx-auto max-w-screen-sm text-center mb-8 lg:mb-16">
          <h2 class="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">Our Team</h2>
          <p class="font-light text-gray-500 lg:mb-16 sm:text-xl dark:text-gray-400">
Discover our innovative aluminium passport solution, designed to enhance transparency, traceability, and sustainability in the aluminium ecosystem using decentralized technologies.
</p>

      </div> 
      <div class="grid gap-8 mb-6 lg:mb-16 md:grid-cols-2">
          <div class="items-center bg-gray-50 rounded-lg shadow sm:flex dark:bg-gray-800 dark:border-gray-700">
              <a href="#">
                  <img class="w-full rounded-lg sm:rounded-none sm:rounded-l-lg" src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/bonnie-green.png" alt="Bonnie Avatar"/>
              </a>
              <div class="p-5">
                  <h3 class="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                      <a href="#">Bonnie Green</a>
                  </h3>
                  <span class="text-gray-500 dark:text-gray-400">CEO & Web Developer</span>
                  <p class="mt-3 mb-4 font-light text-gray-500 dark:text-gray-400">Bonnie drives the technical strategy of the flowbite platform and brand.</p>
                  <ul class="flex space-x-4 sm:mt-0">
                      <li>
                          <a href="#" class="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clip-rule="evenodd" /></svg>
                          </a>
                      </li>
                      <li>
                          <a href="#" class="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                          </a>
                      </li>
                      <li>
                          <a href="#" class="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" /></svg>
                          </a>
                      </li>
                      <li>
                          <a href="#" class="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z" clip-rule="evenodd" /></svg>
                          </a>
                      </li>
                  </ul>
              </div>
          </div> 
          <div class="items-center bg-gray-50 rounded-lg shadow sm:flex dark:bg-gray-800 dark:border-gray-700">
              <a href="#">
                  <img class="w-full rounded-lg sm:rounded-none sm:rounded-l-lg" src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/jese-leos.png" alt="Jese Avatar"/>
              </a>
              <div class="p-5">
                  <h3 class="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                      <a href="#">Jese Leos</a>
                  </h3>
                  <span class="text-gray-500 dark:text-gray-400">CTO</span>
                  <p class="mt-3 mb-4 font-light text-gray-500 dark:text-gray-400">Jese drives the technical strategy of the flowbite platform and brand.</p>
                  <ul class="flex space-x-4 sm:mt-0">
                      <li>
                          <a href="#" class="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clip-rule="evenodd" /></svg>
                          </a>
                      </li>
                      <li>
                          <a href="#" class="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                          </a>
                      </li>
                      <li>
                          <a href="#" class="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" /></svg>
                          </a>
                      </li>
                      <li>
                          <a href="#" class="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z" clip-rule="evenodd" /></svg>
                          </a>
                      </li>
                  </ul>
              </div>
          </div> 
          <div class="items-center bg-gray-50 rounded-lg shadow sm:flex dark:bg-gray-800 dark:border-gray-700">
              <a href="#">
                  <img class="w-full rounded-lg sm:rounded-none sm:rounded-l-lg" src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/michael-gouch.png" alt="Michael Avatar"/>
              </a>
              <div class="p-5">
                  <h3 class="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                      <a href="#">Michael Gough</a>
                  </h3>
                  <span class="text-gray-500 dark:text-gray-400">Senior Front-end Developer</span>
                  <p class="mt-3 mb-4 font-light text-gray-500 dark:text-gray-400">Michael drives the technical strategy of the flowbite platform and brand.</p>
                  <ul class="flex space-x-4 sm:mt-0">
                      <li>
                          <a href="#" class="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clip-rule="evenodd" /></svg>
                          </a>
                      </li>
                      <li>
                          <a href="#" class="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                          </a>
                      </li>
                      <li>
                          <a href="#" class="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" /></svg>
                          </a>
                      </li>
                      <li>
                          <a href="#" class="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z" clip-rule="evenodd" /></svg>
                          </a>
                      </li>
                  </ul>
              </div>
          </div> 
          <div class="items-center bg-gray-50 rounded-lg shadow sm:flex dark:bg-gray-800 dark:border-gray-700">
              <a href="#">
                  <img class="w-full rounded-lg sm:rounded-none sm:rounded-l-lg" src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/sofia-mcguire.png" alt="Sofia Avatar"/>
              </a>
              <div class="p-5">
                  <h3 class="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                      <a href="#">Lana Byrd</a>
                  </h3>
                  <span class="text-gray-500 dark:text-gray-400">Marketing & Sale</span>
                  <p class="mt-3 mb-4 font-light text-gray-500 dark:text-gray-400">Lana drives the technical strategy of the flowbite platform and brand.</p>
                  <ul class="flex space-x-4 sm:mt-0">
                      <li>
                          <a href="#" class="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clip-rule="evenodd" /></svg>
                          </a>
                      </li>
                      <li>
                          <a href="#" class="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                          </a>
                      </li>
                      <li>
                          <a href="#" class="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" /></svg>
                          </a>
                      </li>
                      <li>
                          <a href="#" class="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z" clip-rule="evenodd" /></svg>
                          </a>
                      </li>
                  </ul>
              </div>
          </div>  
      </div>  
  </div>
</section>
    </main>

    
  </div>
);
}
