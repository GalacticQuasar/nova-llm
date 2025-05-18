import './App.css'
import { SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import ChatInterface from '@/components/chat-interface'

function App() {
  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <ChatInterface />
      </SidebarInset>
    </>
  )
}

export default App
