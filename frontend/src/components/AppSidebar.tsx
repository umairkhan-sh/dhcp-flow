// external libraries imports
import {
  Bolt,
  Braces,
  CirclePlus,
  FilePenLine,
  GalleryVerticalEnd,
  Grip,
  List,
  LogOut,
} from "lucide-react";
// components imports
import { SidebarPlatform } from "@/components/SidebarPlatform";
import { SidebarStartHere } from "@/components/SidebarStartHere";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import { useAuthStore } from "@/Store/AuthStore";
import { SidebarSubnets } from "./SidebarSubnets";

// data for the sidebar
const data = {
  startHereSectionData: [
    {
      name: "Dashboard",
      url: "/dashboard",
      icon: Grip,
    },
    {
      name: "Settings",
      url: "/settings",
      icon: Bolt,
    },
  ],
  sidebarSubnetsData: [
    {
      name: "Show Subnets",
      url: "/show-subnets",
      icon: List,
    },
    {
      name: "Add new Subnet",
      url: "/add-subnet",
      icon: CirclePlus,
    },
  ],

  sidebarPlatformSectionData: [
    {
      name: "Show Configuration",
      url: "/show-configuration",
      icon: Braces,
    },
    {
      name: "Custom Configuration",
      url: "/custom-configuration",
      icon: FilePenLine,
    },
  ],
};

// appsidebar component
const AppSidebar = () => {
  const setIsAuthenticated = useAuthStore((state) => state.setIsAuthenticated);

  return (
    <Sidebar className="text-white">
      <SidebarHeader className="bg-gray-900 text-white">
        <SidebarMenuButton size="lg" className="bg-gray-800 hover:bg-gray-700">
          <div className="flex justify-center items-center bg-sidebar-primary bg-white rounded-lg text-sidebar-primary-foreground aspect-square size-8">
            <GalleryVerticalEnd className="text-black size-4" />
          </div>
          <div className="flex-1 grid text-left text-sm text-white leading-tight">
            <span className="font-semibold truncate">DHCP Flow</span>
            <span className="text-xs truncate">Pro Edition - v1.1 (beta)</span>
          </div>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent className="bg-gray-900 text-white">
        <SidebarStartHere data={data.startHereSectionData} />
        <SidebarPlatform data={data.sidebarPlatformSectionData} />
        <SidebarSubnets data={data.sidebarSubnetsData} />
      </SidebarContent>
      <SidebarFooter className="bg-gray-900">
        <Button
          className="bg-gray-800 hover:bg-gray-700 text-white"
          onClick={() => setIsAuthenticated(false)}
        >
          Logout
          <LogOut />
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
