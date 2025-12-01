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
// MENU CONFIG
// ----------------------
const mainMenu = [
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

const cmsMenu = [
  { label: "Blogs", path: "/admin/blogs" },
  { label: "Testimonials", path: "/admin/testimonials" },
  { label: "UTM Links", path: "/admin/utm-links" },
  { label: "Financial Dictionary", path: "/admin/financial-dictionary" },
  { label: "News & Press", path: "/admin/news" },
];

// ----------------------
// PERMISSION CHECKER
// ----------------------
function hasPermission(module: string, action: string): boolean {
  try {
    const accessLevel = localStorage.getItem("adminAccessLevel");
    if (accessLevel === "god_level") return true;

    const raw = localStorage.getItem("adminPermissions");
    if (!raw) return false;

    const perms = JSON.parse(raw) as { module: string; actions: string[] }[];
    const found = perms.find(p => p.module === module);
    return !!found && found.actions.includes(action);
  } catch (err) {
    console.error("Permission error:", err);
    return false;
  }
}

// ----------------------
// SIDEBAR
// ----------------------
const AppSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <Sidebar className="border-r">
      {/* HEADER */}
      <SidebarHeader className="border-b p-4 h-16 flex items-center">
        <img src={infinzLogo} alt="Logo" className="h-8" />
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">

        {/* MAIN MENU */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenu
                .filter(i => hasPermission(i.module, i.action))
                .map(item => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      tooltip={state === "collapsed" ? item.label : undefined}
                      isActive={isActive(item.path)}
                    >
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-2 py-2 rounded-md transition-colors ${
                            isActive
                              ? "bg-accent text-accent-foreground"
                              : "hover:bg-accent"
                          }`
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="text-sm">{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* CMS MENU */}
        <SidebarGroup>
          <SidebarGroupLabel>Content Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {cmsMenu.map(item => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    tooltip={state === "collapsed" ? item.label : undefined}
                    isActive={isActive(item.path)}
                  >
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-2 py-2 rounded-md transition-colors ${
                          isActive
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-accent"
                        }`
                      }
                    >
                      <ReceiptText className="h-4 w-4" />
                      <span className="text-sm">{item.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* FOOTER */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={state === "collapsed" ? "Change Password" : undefined}>
                  <NavLink to="/reset-password" className="flex items-center gap-3 px-2 py-2 hover:bg-accent rounded-md">
                    <Key className="h-4 w-4" /> Change Password
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  tooltip={state === "collapsed" ? "Logout" : undefined}
                  className="text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" /> Logout
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
          <header className="sticky top-0 z-40 h-16 px-6 border-b bg-background/95 backdrop-blur flex items-center justify-between">
            <SidebarTrigger />

            <h2 className="text-sm font-semibold capitalize">
              {location.pathname.replace("/admin/", "").replace("-", " ") || "Dashboard"}
            </h2>

            <Avatar>
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
          </header>

          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
