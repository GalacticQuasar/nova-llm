import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

export interface ConfigState {
  model: string
  tools: {
    get_time: boolean
    get_random_number: boolean
  }
  streamType: string
}

interface ConfigContextType {
  config: ConfigState
  updateModel: (model: string) => void
  updateTool: (toolName: keyof ConfigState['tools'], enabled: boolean) => void
  updateStreamType: (streamType: string) => void
  saveConfig: () => void
}

const defaultConfig: ConfigState = {
  model: "gemini-2.0-flash",
  tools: {
    get_time: true,
    get_random_number: true
  },
  streamType: "Chunk"
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined)

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ConfigState>(() => {
    // Load from localStorage on initialization
    const saved = localStorage.getItem('nova-config')
    return saved ? JSON.parse(saved) : defaultConfig
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