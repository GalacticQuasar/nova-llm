import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

export interface ConfigState {
  model: string
  tools: {
    get_time: boolean
    get_random_number: boolean
  }
  streamType: string
  mcpServer: string
}

interface ConfigContextType {
  config: ConfigState
  updateModel: (model: string) => void
  updateTool: (toolName: keyof ConfigState['tools'], enabled: boolean) => void
  updateStreamType: (streamType: string) => void
  updateMcpServer: (server: string) => void
  saveConfig: () => void
}

const defaultConfig: ConfigState = {
  model: "gemini-2.5-flash",
  tools: {
    get_time: false,
    get_random_number: false
  },
  streamType: "Word",
  mcpServer: "none"
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined)

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ConfigState>(() => {
    // Load from localStorage on initialization
    const saved = localStorage.getItem('nova-config')
    if (saved) {
      const parsed = JSON.parse(saved)
      // Migrate from old mcpEnabled boolean to mcpServer string
      if (parsed.mcpEnabled !== undefined && parsed.mcpServer === undefined) {
        parsed.mcpServer = parsed.mcpEnabled ? 'weather' : 'none'
        delete parsed.mcpEnabled
      }
      return parsed
    }
    return defaultConfig
  })

  const updateModel = (model: string) => {
    setConfig(prev => ({ ...prev, model }))
  }

  const updateTool = (toolName: keyof ConfigState['tools'], enabled: boolean) => {
    setConfig(prev => ({
      ...prev,
      tools: {
        ...prev.tools,
        [toolName]: enabled
      }
    }))
  }

  const updateStreamType = (streamType: string) => {
    setConfig(prev => ({ ...prev, streamType }))
  }

  const updateMcpServer = (server: string) => {
    setConfig(prev => ({ ...prev, mcpServer: server }))
  }

  const saveConfig = () => {
    localStorage.setItem('nova-config', JSON.stringify(config))
  }

  // Auto-save to localStorage whenever config changes
  useEffect(() => {
    localStorage.setItem('nova-config', JSON.stringify(config))
  }, [config])

  const value: ConfigContextType = {
    config,
    updateModel,
    updateTool,
    updateStreamType,
    updateMcpServer,
    saveConfig
  }

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  )
}

export function useConfig() {
  const context = useContext(ConfigContext)
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider')
  }
  return context
} 