import './App.css'
import { SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import ChatInterface from '@/components/chat-interface'

function App() {
  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <SidebarTrigger />
        <ChatInterface />
      </SidebarInset>
    </>
  )
}

export default App
