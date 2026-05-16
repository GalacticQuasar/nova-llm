import './App.css'
import { SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import ChatInterface from '@/components/chat-interface'
import { WelcomeBanner } from '@/components/welcome-banner'

function App() {
  return (
    <>
      <WelcomeBanner />
      <AppSidebar />
      <SidebarInset>
        <ChatInterface />
      </SidebarInset>
    </>
  )
}

export default App
