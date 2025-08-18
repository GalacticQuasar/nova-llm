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
//  SidebarHeader,
  useSidebar,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { NavUser } from "./nav-user"
import { CirclePlus } from "lucide-react"
//import { Button } from "@/components/ui/button"

// Menu items
const items = [
  {
    title: "How to cut a watermelon?",
    url: "",
  },
  {
    title: "What color are bananas?",
    url: "",
  },
  {
    title: "Explain the theory of relativity.",
    url: "",
  },
  {
    title: "How to bake a cake?",
    url: "",
  },
  {
    title: "How to make a sandwich?",
    url: "",
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
                <div className="peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden transition-[width,height,padding] group-has-data-[sidebar=menu-action]/menu-item:pr-8 data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0">
                  <SidebarTrigger className="scale-125 hover:text-teal-300 cursor-pointer" />
                  <a href="/">
                    <span className="ml-2 font-serif text-2xl">Nova</span>
                  </a>
                </div>
              </SidebarMenuItem>
              <SidebarMenuItem className="mt-2">
                <SidebarMenuButton className="text-teal-300" asChild>
                  <a href="/new">
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
