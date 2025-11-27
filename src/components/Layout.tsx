import { useEffect } from "react";
import { Outlet, useNavigate, useLocation, NavLink } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import infinzLogo from "@/assets/logo_colour.png";

import {
  Users,
  BarChart3,
  LogOut,
  Key,
  ShieldCheck,
  ReceiptText,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

// ----------------------
// MENU CONFIGURATION
// ----------------------
const menuItems = [
  {
    icon: BarChart3,
    label: "Dashboard",
    path: "/dashboard",
    module: "dashboard",
    action: "view",
  },
  {
    icon: Users,
    label: "Leads",
    path: "/leads",
    module: "leads",
    action: "view",
  },
  {
    icon: ShieldCheck,
    label: "Roles & Permissions",
    path: "/roles-permissions",
    module: "employee-management",
    action: "view",
  },
  {
    icon: ShieldCheck,
    label: "Logs",
    path: "/logs",
    module: "logs",
    action: "view",
  },
] as const;

// ----------------------
// PERMISSION CHECKER
// ----------------------
function hasPermission(module: string, action: string): boolean {
  try {
    const accessLevel = localStorage.getItem("adminAccessLevel");

    if (accessLevel === "god_level") return true;

    const raw = localStorage.getItem("adminPermissions");
    if (!raw) return false;

    const perms = JSON.parse(raw) as {
      module: string;
      actions: string[];
    }[];

    const found = perms.find((p) => p.module === module);
    if (!found) return false;

    return found.actions.includes(action);
  } catch (error) {
    console.error("Permission check error:", error);
    return false;
  }
}

// ----------------------
// SIDEBAR COMPONENT
// ----------------------
const AppSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminPermissions");
    localStorage.removeItem("adminAccessLevel");
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className="border-r">
      {/* HEADER */}
      <SidebarHeader className="border-b p-4 h-16 flex items-center">
        <div className="flex items-center space-x-2">
          <img src={infinzLogo} alt="INFINZ Logo" className="h-8 w-auto" />
        </div>
      </SidebarHeader>

      {/* SIDEBAR MENU */}
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {/* Main Items */}
              {menuItems
                .filter((item) => hasPermission(item.module, item.action))
                .map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.path)}
                      tooltip={state === "collapsed" ? item.label : undefined}
                      className="w-full justify-start"
                    >
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-2 py-2 rounded-md transition-colors ${
                            isActive
                              ? "bg-accent text-accent-foreground"
                              : "hover:bg-accent hover:text-accent-foreground"
                          }`
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {item.label}
                        </span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}

              {/* ------------------------------ */}
              {/* BLOGS                         */}
              {/* ------------------------------ */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname.startsWith("/admin/blogs")}
                  tooltip={state === "collapsed" ? "Blogs" : undefined}
                  className="w-full justify-start"
                >
                  <NavLink
                    to="/admin/blogs"
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-2 py-2 rounded-md transition-colors ${
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent hover:text-accent-foreground"
                      }`
                    }
                  >
                    <ReceiptText className="h-4 w-4" />
                    <span className="text-sm font-medium">Blogs</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* ------------------------------ */}
              {/* TESTIMONIALS                   */}
              {/* ------------------------------ */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname.startsWith("/admin/testimonials")}
                  tooltip={state === "collapsed" ? "Testimonials" : undefined}
                  className="w-full justify-start"
                >
                  <NavLink
                    to="/admin/testimonials"
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-2 py-2 rounded-md transition-colors ${
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent hover:text-accent-foreground"
                      }`
                    }
                  >
                    <ReceiptText className="h-4 w-4" />
                    <span className="text-sm font-medium">Testimonials</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname.startsWith("/admin/testimonials")}
                  tooltip={state === "collapsed" ? "Testimonials" : undefined}
                  className="w-full justify-start"
                >
                  <NavLink
                    to="/admin/utm-links"
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-2 py-2 rounded-md transition-colors ${
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent hover:text-accent-foreground"
                      }`
                    }
                  >
                    <ReceiptText className="h-4 w-4" />
                    <span className="text-sm font-medium">UTM Links</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* FOOTER MENU */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={
                    state === "collapsed" ? "Change Password" : undefined
                  }
                  className="w-full justify-start"
                >
                  <NavLink
                    to="/reset-password"
                    className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <Key className="h-4 w-4" />
                    <span className="text-sm font-medium">Change Password</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  tooltip={state === "collapsed" ? "Logout" : undefined}
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm font-medium">Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

// ----------------------
// MAIN LAYOUT WRAPPER
// ----------------------
const Layout = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />

        <SidebarInset className="flex flex-col w-full">
          <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-6 py-4 h-16 flex items-center">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
              </div>
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          <main className="flex-1 px-6 py-6">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
