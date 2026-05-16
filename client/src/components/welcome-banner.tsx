import { useState } from 'react'
import { X } from 'lucide-react'

export function WelcomeBanner() {
    const [visible, setVisible] = useState(() => {
        return !localStorage.getItem('nova-welcome-dismissed')
    })

    if (!visible) return null

    const handleDismiss = () => {
        localStorage.setItem('nova-welcome-dismissed', 'true')
        setVisible(false)
    }

    const handleConfigClick = () => {
        const trigger = document.querySelector('[data-config-trigger]') as HTMLButtonElement | null
        if (trigger) trigger.click()
    }

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded-lg bg-teal-900/90 border border-teal-700/50 shadow-lg shadow-teal-900/30 backdrop-blur-sm text-teal-100 text-sm max-w-lg">
            <p className="text-center">
                First time using Nova LLM? Check out the{' '}
                <button
                    onClick={handleConfigClick}
                    className="underline underline-offset-2 hover:text-teal-300 transition-colors cursor-pointer"
                >
                    configuration
                </button>
                {' '}to select your model, tools, MCP server, and text streaming mode!
            </p>
            <button onClick={handleDismiss} className="shrink-0 hover:text-white transition-colors cursor-pointer">
                <X size={16} />
            </button>
        </div>
    )
}