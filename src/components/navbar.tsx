import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  BarChart,
  Settings,
  HelpCircle,
  Power,
  BarChart3
} from "lucide-react"

import { MainNavItem } from "@/types"

interface DocsConfig {
  mainNav: MainNavItem[]
}

export const docsConfig: DocsConfig = {
  mainNav: [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/",
    },
    {
      label: "Customers",
      icon: Users,
      href: "/customers",
    },
    {
      label: "Leads",
      icon: ShoppingCart,
      href: "/leads",
    },
    {
      label: "Analytics",
      icon: BarChart,
      href: "/analytics",
    },
    {
      label: "Sentiment Analysis",
      icon: BarChart3,
      href: "/sentiment-analysis"
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
    },
    {
      label: "Help",
      icon: HelpCircle,
      href: "/help",
    },
    {
      label: "Logout",
      icon: Power,
      href: "/logout",
    },
  ],
}
