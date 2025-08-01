import React from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Users, 
  Shield, 
  Settings, 
  BarChart3, 
  UserPlus,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

const TenantAdminHomePage = () => {
  const stats = [
    {
      title: "Total Organizations",
      value: "12",
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Active Users",
      value: "156",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Pending Approvals",
      value: "8",
      icon: AlertCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "System Health",
      value: "98%",
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    }
  ];

  const quickActions = [
    {
      title: "Manage Organizations",
      description: "Add, edit, or remove tenant organizations",
      icon: Building2,
      link: "/tenant-admin",
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "User Management",
      description: "Manage users and their permissions",
      icon: Users,
      link: "/tenant-admin",
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "System Settings",
      description: "Configure system-wide settings",
      icon: Settings,
      link: "/tenant-admin",
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      title: "Analytics Dashboard",
      description: "View system analytics and reports",
      icon: BarChart3,
      link: "/tenant-admin",
      color: "bg-orange-500 hover:bg-orange-600"
    }
  ];

  const recentActivities = [
    {
      action: "New organization registered",
      organization: "TechCorp Industries",
      time: "2 hours ago",
      status: "success"
    },
    {
      action: "User role updated",
      organization: "GreenEnergy Solutions",
      time: "4 hours ago",
      status: "info"
    },
    {
      action: "System maintenance completed",
      organization: "System",
      time: "6 hours ago",
      status: "success"
    },
    {
      action: "Pending approval required",
      organization: "EcoBattery Co.",
      time: "1 day ago",
      status: "warning"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tenant Admin Dashboard</h1>
              <p className="mt-2 text-gray-600">
                Manage tenant organizations and system-wide configurations
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span className="text-blue-800 font-medium">Tenant Admin</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Common administrative tasks
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <motion.div
                      key={action.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Link
                        to={action.link}
                        className={`block p-4 rounded-lg text-white ${action.color} transition-colors duration-200`}
                      >
                        <div className="flex items-center space-x-3">
                          <action.icon className="w-6 h-6" />
                          <div>
                            <h3 className="font-semibold">{action.title}</h3>
                            <p className="text-sm opacity-90">{action.description}</p>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Latest system activities
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="flex items-start space-x-3"
                    >
                      <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                        activity.status === 'success' ? 'bg-green-400' :
                        activity.status === 'warning' ? 'bg-orange-400' :
                        'bg-blue-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.action}
                        </p>
                        <p className="text-sm text-gray-500">
                          {activity.organization} • {activity.time}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Overview */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">System Overview</h2>
            <p className="text-sm text-gray-600 mt-1">
              Key metrics and system health
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">System Performance</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">98%</p>
                <p className="text-sm text-gray-600 mt-1">Excellent</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Security Status</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">100%</p>
                <p className="text-sm text-gray-600 mt-1">Secure</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4">
                  <UserPlus className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Active Sessions</h3>
                <p className="text-3xl font-bold text-purple-600 mt-2">24</p>
                <p className="text-sm text-gray-600 mt-1">Users Online</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantAdminHomePage; 