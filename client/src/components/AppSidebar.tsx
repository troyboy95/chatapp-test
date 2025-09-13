// import { Contact, MessageCircle } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "./ui/button";
import { logoutApi } from "@/api/auth";

// Menu items.
// const items: any = [
//     {title: 'Chats', icon: MessageCircle},
//     {title: 'Contacts', icon: Contact},
// ]

interface AppSidebarProps {
  items: any[];
  index?: number;
  setIndex?: (index: number) => void;
}

export function AppSidebar({items, index, setIndex}: AppSidebarProps) {
  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader>
        <SidebarTrigger />
      </SidebarHeader>  
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item : any, i: number) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton className={index === i ? 'active text-white' : 'inactive text-gray-400'} onClick={() => setIndex?.(i)}>
                      <item.icon />
                      <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button className="text-purple-500" onClick={() => logoutApi()}>
            Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}