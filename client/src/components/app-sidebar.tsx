import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarHeader,
  useSidebar,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { NavUser } from "./nav-user"
import { CirclePlus } from "lucide-react"
import { Button } from "@/components/ui/button"

// Menu items
const items = [
  {
    title: "How to cut a watermelon?",
    url: "#",
  },
  {
    title: "What color are bananas?",
    url: "#",
  },
  {
    title: "Explain the theory of relativity",
    url: "#",
  },
  {
    title: "How to make a cake?",
    url: "#",
  },
  {
    title: "How to make a sandwich?",
    url: "#",
  },
]

const user = {
  name: "User",
  email: "user@example.com",
  avatar: "Galactic-Logo.png",  // Update this to be dynamically later
}

export function AppSidebar() {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar collapsible="icon">

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="hover:bg-transparent" asChild>
                  <a href="#">
                    <SidebarTrigger className="scale-125 hover:text-teal-300" />
                    <span className="ml-2 font-serif text-2xl">Nova</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="text-teal-300 hover:text-teal-500" asChild>
                  <a href="#">
                    <CirclePlus className="scale-140" />
                    <span className="ml-2 font-mono">New Chat</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <div className={`transition-opacity duration-300 ${isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                {items.map((item) => (
                  <SidebarMenuItem className="my-0.5" key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </div>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
