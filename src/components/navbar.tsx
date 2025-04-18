import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { BarChart3, Bot, Building, LogOut, ShoppingCart, LineChart, Menu, X } from "lucide-react";
import { useCompany } from "@/contexts/CompanyContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const navItems = [
  {
    name: "Dashboard",
    path: "/",
    icon: BarChart3,
  },
  {
    name: "Messages",
    path: "/messages",
    icon: ShoppingCart,
  },
  {
    name: "Chatbot",
    path: "/chatbot",
    icon: Bot,
  },
  {
    name: "Sentiment Analysis",
    path: "/sentiment-analysis",
    icon: LineChart,
  },
  {
    name: "IshanTech Demo",
    path: "/ishantech-demo",
    icon: ShoppingCart,
  },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentCompany, setCurrentCompany } = useCompany();
  
  const initials = currentCompany ? currentCompany.companyName.substring(0, 2).toUpperCase() : "CR";
  
  // Check if user is logged in
  useEffect(() => {
    const protectedRoutes = ['/', '/messages', '/chatbot', '/company-profile', '/sentiment-analysis'];
    
    if (protectedRoutes.includes(location.pathname) && !currentCompany && !localStorage.getItem("currentCompany")) {
      navigate("/company-login");
    }
  }, [location.pathname, currentCompany, navigate]);
  
  const handleLogout = () => {
    localStorage.removeItem("currentCompany");
    setCurrentCompany(null);
    toast.info("Logged out successfully");
    navigate("/company-login");
  };

  return (
    <nav className="fixed left-0 top-0 w-full bg-white/90 backdrop-blur-xl z-40 border-b border-border shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-primary/80 to-primary p-2 rounded-lg">
                <span className="text-xl font-semibold tracking-tight text-white">CRM</span>
              </div>
              <span className="text-xs py-0.5 px-1.5 bg-primary/10 text-primary rounded-md">Beta</span>
            </Link>
            
            {currentCompany && (
              <div className="ml-4 border-l pl-4">
                <div className="text-sm font-medium">{currentCompany.companyName}</div>
              </div>
            )}
            
            <div className="hidden sm:ml-10 sm:flex sm:space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    "group flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                    location.pathname === item.path
                      ? "text-white bg-primary shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {currentCompany && (
              <>
                <Link 
                  to="/company-profile" 
                  className="hidden sm:flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
                >
                  <Building className="h-4 w-4" />
                  <span>Company Profile</span>
                </Link>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="hidden sm:flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </>
            )}
            
            <Link 
              to={currentCompany ? "/company-profile" : "/company-login"} 
              className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-primary/80 to-primary text-white transition-transform hover:scale-105"
            >
              <span className="text-sm font-medium">{initials}</span>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div
        className={cn(
          "sm:hidden absolute w-full bg-white/95 backdrop-blur-md border-b border-border shadow-subtle transition-all duration-300 ease-in-out",
          mobileMenuOpen ? "max-h-screen py-2" : "max-h-0 overflow-hidden py-0"
        )}
      >
        <div className="space-y-1 px-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "group flex items-center space-x-2 px-3 py-2 text-base font-medium rounded-md transition-colors",
                location.pathname === item.path
                  ? "text-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          ))}
          
          {currentCompany && (
            <>
              <Link
                to="/company-profile"
                className="group flex items-center space-x-2 px-3 py-2 text-base font-medium rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Building className="h-5 w-5" />
                <span>Company Profile</span>
              </Link>
              
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full group flex items-center space-x-2 px-3 py-2 text-base font-medium rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-accent text-left"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
