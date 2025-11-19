import { Outlet } from "react-router-dom"
import { useAuth } from "@/layouts/Root"
import { useSelector } from "react-redux"
import Button from "@/components/atoms/Button"
import ApperIcon from "@/components/ApperIcon"

const Layout = () => {
  const { logout } = useAuth()
  const { user, isAuthenticated } = useSelector(state => state.user)

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <h1 className="text-xl font-semibold text-slate-800">FlowTrack</h1>
            </div>
            
            {isAuthenticated && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-slate-600">
                  Welcome, {user?.firstName || user?.name || 'User'}
                </span>
                <Button
                  onClick={logout}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <ApperIcon name="LogOut" size={16} />
                  <span>Logout</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout