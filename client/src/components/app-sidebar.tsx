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
  useSidebar,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { NavUser } from "./nav-user"
import { CirclePlus, Trash2 } from "lucide-react"
import { useChat } from "@/contexts/chat-context"

const user = {
  name: "User",
  email: "user@example.com",
  avatar: "Galactic-Logo.png",
}

export function AppSidebar() {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  const { chats, currentChatId, loadChat, clearCurrentChat, deleteChat } = useChat()

  const handleNewChat = () => {
    clearCurrentChat()
  }

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
                <SidebarMenuButton className="text-teal-300" onClick={handleNewChat}>
                  <CirclePlus className="scale-140" />
                  <span className="ml-2 font-mono">New Chat</span>
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
                {chats.map((chat) => (
                  <SidebarMenuItem className="my-0.5 group/item" key={chat.id}>
                    <div className="flex items-center gap-1 w-full">
                      <SidebarMenuButton
                        isActive={chat.id === currentChatId}
                        onClick={() => loadChat(chat.id)}
                        className="flex-1"
                      >
                        <span className="truncate">{chat.title}</span>
                      </SidebarMenuButton>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteChat(chat.id)
                        }}
                        className="opacity-0 group-hover/item:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
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
