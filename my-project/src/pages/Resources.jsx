
import { useState } from "react"
import { motion } from "framer-motion"
import { FileText, Video, Book, Users, Globe, BarChart } from "lucide-react"

const resources = [
  {
    icon: <FileText className="w-6 h-6" />,
    title: "White Papers",
    description: "In-depth analysis on battery passport technology and implementation",
  },
  {
    icon: <Video className="w-6 h-6" />,
    title: "Webinars",
    description: "Expert-led sessions on the latest in battery passport developments",
  },
  {
    icon: <Book className="w-6 h-6" />,
    title: "Case Studies",
    description: "Real-world applications and success stories of battery passports",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Industry Partnerships",
    description: "Collaborations driving innovation in battery passport solutions",
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Regulatory Updates",
    description: "Stay informed on global battery passport regulations and standards",
  },
  {
    icon: <BarChart className="w-6 h-6" />,
    title: "Market Reports",
    description: "Comprehensive analysis of the battery passport market landscape",
  },
]

export default function BatteryPassportResources() {
  const [hoveredCard, setHoveredCard] = useState(null)

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-hidden">
      {/* Animated Background Pattern */}
      {/* <div className="fixed inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-blue-500/5" />
      </div> */}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Company Name and Tagline */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-600 via-blue-600 to-purple-600">
            AEIFORO  Solutions
          </h1>
          <p className="text-xl text-gray-600">Empowering the Future of Sustainable Energy with Battery Passports</p>
        </motion.div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {resources.map((resource, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              onHoverStart={() => setHoveredCard(index)}
              onHoverEnd={() => setHoveredCard(null)}
              className="relative group"
            >
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-green-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl`}
              />
              <div className="relative overflow-hidden rounded-2xl backdrop-blur-sm border border-gray-200 bg-white/80 shadow-lg h-full">
                <div className="p-6">
                  {/* Icon with gradient background */}
                  <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-gray-200 mb-4">
                    <div className="text-green-600 group-hover:text-green-700 transition-colors duration-300">
                      {resource.icon}
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-green-700 transition-colors duration-300">
                    {resource.title}
                  </h3>

                  <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                    {resource.description}
                  </p>

                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-green-500/5 rounded-full blur-xl group-hover:bg-green-500/10 transition-colors duration-300" />
                  <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-colors duration-300" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">
            Ready to Explore Our Battery Passport Resources?
          </h2>
          <p className="text-gray-600 mb-6">
            Dive into our comprehensive collection of materials and stay at the forefront of battery passport
            innovation.
          </p>
          <a
            href="#contact"
            className="inline-block px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-300"
          >
            Access Resources
          </a>
        </motion.div>
      </div>
    </div>
  )
}
