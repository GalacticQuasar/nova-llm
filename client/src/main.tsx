import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { ConfigProvider } from "@/contexts/config-context"
import { ChatProvider } from "@/contexts/chat-context"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ConfigProvider>
        <ChatProvider>
          <SidebarProvider>
            <App />
            <Toaster />
          </SidebarProvider>
        </ChatProvider>
      </ConfigProvider>
    </ThemeProvider>
  </StrictMode>,
)
