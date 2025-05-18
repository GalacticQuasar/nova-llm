import { useState } from 'react'
import './App.css'
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import ChatInterface from '@/components/chat-interface'

function App() {
  return (
    <>
      <AppSidebar />
      <main>
        <SidebarTrigger />
        <ChatInterface />
      </main>
    </>
  )
}

export default App
