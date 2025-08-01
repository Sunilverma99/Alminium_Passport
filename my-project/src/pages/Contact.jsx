
import  React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Phone, MapPin, Twitter, Linkedin, Facebook, Instagram } from "lucide-react"
import toast from "react-hot-toast"

export default function ContactUs() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Form submitted:", formState)
    setFormState({ name: "", email: "", message: "" })
    toast.success("Message sent successfully!")
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-hidden">
      {/* Animated Background Pattern */}
      {/* <div className="fixed inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />
      </div> */}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
            Contact Us
          </h1>
          <p className="text-xl text-gray-600">Get in touch with Marklytics for innovative solutions</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-50 blur-xl" />
            <div className="relative overflow-hidden rounded-2xl backdrop-blur-sm border border-gray-200 bg-white/80 shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={formState.name}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formState.email}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formState.message}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-300 shadow-sm"
                >
                  Send Message
                </button>
              </form>
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-8"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-50 blur-xl" />
              <div className="relative overflow-hidden rounded-2xl backdrop-blur-sm border border-gray-200 bg-white/80 shadow-lg p-6">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">Contact Information</h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Mail className="text-blue-600 flex-shrink-0" />
                    <div className="flex flex-col text-gray-700">
                      <span>info@marklytics.com</span>
                      <span>vijay.s@marklytics.com</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Phone className="text-blue-600 flex-shrink-0" />
                    <span className="text-gray-700">+44 7720216021</span>
                  </div>
                  <div className="flex items-start space-x-4">
                    <MapPin className="text-blue-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">Priory Street, HDTI Building, Coventry, England CV1 5FB, GB</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-500/20 to-orange-500/20 opacity-50 blur-xl" />
              <div className="relative overflow-hidden rounded-2xl backdrop-blur-sm border border-gray-200 bg-white/80 shadow-lg p-6">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">Office Hours</h2>
                <ul className="space-y-2 text-gray-700">
                  <li>Monday - Friday: 9:00 AM - 6:00 PM</li>
                  <li>Saturday: 10:00 AM - 4:00 PM</li>
                  <li>Sunday: Closed</li>
                </ul>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/20 to-yellow-500/20 opacity-50 blur-xl" />
              <div className="relative overflow-hidden rounded-2xl backdrop-blur-sm border border-gray-200 bg-white/80 shadow-lg p-6">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">Connect With Us</h2>
                <p className="mb-6 text-gray-700">Follow us on social media for the latest updates and insights:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <a href="https://x.com/Marklyticsuk" className="flex flex-col items-center space-y-2 group">
                    <div className="p-3 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors duration-300">
                      <Twitter className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors duration-300">
                      Twitter
                    </span>
                  </a>
                  <a
                    href="https://www.linkedin.com/company/marklytics"
                    className="flex flex-col items-center space-y-2 group"
                  >
                    <div className="p-3 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors duration-300">
                      <Linkedin className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors duration-300">
                      LinkedIn
                    </span>
                  </a>
                  <a
                    href="https://www.facebook.com/MarklyticsUK"
                    className="flex flex-col items-center space-y-2 group"
                  >
                    <div className="p-3 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors duration-300">
                      <Facebook className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors duration-300">
                      Facebook
                    </span>
                  </a>
                  <a
                    href="https://www.instagram.com/marklytics.co.uk/"
                    className="flex flex-col items-center space-y-2 group"
                  >
                    <div className="p-3 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors duration-300">
                      <Instagram className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors duration-300">
                      Instagram
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
