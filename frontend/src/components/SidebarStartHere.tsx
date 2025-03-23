// external libraries imports
import { type LucideIcon } from "lucide-react";
// components imports
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "react-router";

// sidebarstarthere component
export function SidebarStartHere({
  data,
}: {
  data: {
    name: string;
    url: string;
    icon: LucideIcon;
  }[];
}) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel className="text-gray-400">Platform</SidebarGroupLabel>
      <SidebarMenu>
        {data.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <SidebarMenuItem
              key={item.name}
              className={isActive ? "bg-white text-black rounded-sm" : ""}
            >
              <SidebarMenuButton asChild>
                <Link to={item.url}>
                  <item.icon />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
