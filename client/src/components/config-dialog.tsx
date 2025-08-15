import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ModelSelect } from "@/components/model-select"
import { StreamSelect } from "@/components/stream-select"
import { Separator } from "@/components/ui/separator"
import { Settings } from "lucide-react"
import { useConfig } from "@/contexts/config-context"

export function ConfigDialog() {
    const { config, updateTool, updateMcpEnabled } = useConfig()

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    className={`cursor-pointer border-1 rounded-lg text-muted-foreground bg-input/20 hover:bg-input/20 hover:text-teal-300 transition-colors duration-300`}
                >
                    <Settings className="scale-125" />
                    <span className="text-xs">Configuration</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] text-white">
                <DialogHeader>
                    <DialogTitle>Configuration</DialogTitle>
                    <DialogDescription>
                        Configure the LLM and the tools it can use.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 items-center gap-4">
                        <Label htmlFor="model" className="text-right">
                            Model
                        </Label>
                        <ModelSelect />
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 items-center gap-4">
                        <Switch 
                            id="mcpEnabled" 
                            checked={config.mcpEnabled}
                            onCheckedChange={(checked) => updateMcpEnabled(checked)}
                        />
                        <Label htmlFor="mcpEnabled" className="text-right flex items-center gap-2">
                            MCP Mode
                            <span className={`text-xs px-2 py-1 rounded ${config.mcpEnabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {config.mcpEnabled ? 'Enabled' : 'Disabled'}
                            </span>
                        </Label>
                    </div>
                    <Separator />
                    <Label className="text-right">
                        Tools {config.mcpEnabled ? '(Disabled due to MCP Mode)' : '(Custom Tools)'}
                    </Label>
                    <div className="grid grid-cols-2 items-center gap-4">
                        <Switch 
                            id="get_time" 
                            checked={config.tools.get_time}
                            disabled={config.mcpEnabled}
                            onCheckedChange={(checked) => updateTool('get_time', checked)}
                        />
                        <Label htmlFor="get_time" className={`text-right ml-auto flex items-center gap-2 ${config.mcpEnabled ? 'opacity-50' : ''}`}>
                            Get Time
                            <span className={`text-xs px-2 py-1 rounded ${config.tools.get_time && !config.mcpEnabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {config.mcpEnabled ? 'Disabled' : (config.tools.get_time ? 'Enabled' : 'Disabled')}
                            </span>
                        </Label>
                    </div>
                    <div className="grid grid-cols-2 items-center gap-4">
                        <Switch 
                            id="get_random_number" 
                            checked={config.tools.get_random_number}
                            disabled={config.mcpEnabled}
                            onCheckedChange={(checked) => updateTool('get_random_number', checked)}
                        />
                        <Label htmlFor="get_random_number" className={`text-right ml-auto flex items-center gap-2 ${config.mcpEnabled ? 'opacity-50' : ''}`}>
                            Get Random Number
                            <span className={`text-xs px-2 py-1 rounded ${config.tools.get_random_number && !config.mcpEnabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {config.mcpEnabled ? 'Disabled' : (config.tools.get_random_number ? 'Enabled' : 'Disabled')}
                            </span>
                        </Label>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 items-center gap-4">
                        <Label htmlFor="model" className="text-right">
                            Stream Animation
                        </Label>
                        <StreamSelect />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
