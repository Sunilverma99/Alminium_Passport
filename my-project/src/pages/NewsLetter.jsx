"use client"

import  React from "react"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Mail, Newspaper, Bell, BookOpen, Check } from "lucide-react"
import toast from "react-hot-toast"

const features = [
  {
    icon: <Newspaper className="w-6 h-6" />,
    title: "Unlimited Digital Access",
    description: "Read all our articles anytime, anywhere",
  },
  {
    icon: <Bell className="w-6 h-6" />,
    title: "Breaking News Alerts",
    description: "Stay informed with real-time notifications",
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: "Exclusive Content",
    description: "Access in-depth analysis and special reports",
  },
  {
    icon: <Check className="w-6 h-6" />,
    title: "Ad-Supported Browsing",
    description: "Enjoy our content with minimal interruptions",
  },
  {
    icon: <Mail className="w-6 h-6" />,
    title: "Weekly Newsletter",
    description: "Get a curated selection of top stories",
  },
]

export default function FreeNewspaperSubscription() {
  const [email, setEmail] = useState("")
  const [hoveredCard, setHoveredCard] = useState(null)

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault()
      if (!email) {
        toast.error("Please provide your email address.")
        return
      }
      console.log("Subscription submitted:", { email })
      setEmail("")
      toast.success("Thank you for subscribing!")
    },
    [email],
  )

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-hidden">
      {/* Animated Background Pattern */}
      {/* <div className="fixed inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />
      </div> */}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top Subscription Form */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="relative w-full sm:w-auto">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full sm:w-64 pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 shadow-sm"
                placeholder="Enter your email"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
            >
              Subscribe Now
            </button>
          </form>
        </motion.div>

        {/* Newspaper Name and Tagline */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
            The Daily Chronicle
          </h1>
          <p className="text-xl text-gray-600">Stay Informed with Our Award-Winning Journalism, Now Free for All</p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
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
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl`}
              />
              <div className="relative overflow-hidden rounded-2xl backdrop-blur-sm border border-gray-200 bg-white/80 shadow-lg h-full">
                <div className="p-6">
                  {/* Icon with gradient background */}
                  <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-gray-200 mb-4">
                    <div className="text-blue-600 group-hover:text-blue-700 transition-colors duration-300">
                      {feature.icon}
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors duration-300">
                    {feature.title}
                  </h3>

                  <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                    {feature.description}
                  </p>

                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-colors duration-300" />
                  <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-colors duration-300" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Terms */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center text-sm text-gray-600"
        >
          By subscribing, you agree to our Terms of Service and Privacy Policy.
        </motion.p>
      </div>
    </div>
  )
}
