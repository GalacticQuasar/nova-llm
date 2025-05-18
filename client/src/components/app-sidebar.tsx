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
      <SidebarHeader>
        <SidebarTrigger className="m-0.5 scale-125 hover:text-teal-300" />
        <Button variant="outline" className="flex items-center gap-2 text-teal-300 hover:text-white">
          <CirclePlus className="m-1 scale-125" />
          {!isCollapsed ? <span className="">New Chat</span> : null}
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <div className={`transition-opacity duration-300 ${isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
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
