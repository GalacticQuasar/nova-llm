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
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Settings } from "lucide-react"
import { useConfig } from "@/contexts/config-context"

export function ConfigDialog() {
    const { config, updateTool, updateMcpServer } = useConfig()

    const mcpEnabled = config.mcpServer !== "none"

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    data-config-trigger
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
                    <Label className={`text-right ${mcpEnabled ? 'text-red-400' : ''}`}>
                        Tools {mcpEnabled ? '(Disabled due to MCP Mode)' : '(Custom Tools)'}
                    </Label>
                    <div className="grid grid-cols-2 items-center gap-4">
                        <Switch 
                            id="get_time" 
                            checked={config.tools.get_time}
                            disabled={mcpEnabled}
                            onCheckedChange={(checked) => updateTool('get_time', checked)}
                        />
                        <Label htmlFor="get_time" className={`text-right ml-auto flex items-center gap-2 ${mcpEnabled ? 'opacity-50' : ''}`}>
                            Get Time
                            <span className={`text-xs px-2 py-1 rounded ${config.tools.get_time && !mcpEnabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {mcpEnabled ? 'Disabled' : (config.tools.get_time ? 'Enabled' : 'Disabled')}
                            </span>
                        </Label>
                    </div>
                    <div className="grid grid-cols-2 items-center gap-4">
                        <Switch 
                            id="get_random_number" 
                            checked={config.tools.get_random_number}
                            disabled={mcpEnabled}
                            onCheckedChange={(checked) => updateTool('get_random_number', checked)}
                        />
                        <Label htmlFor="get_random_number" className={`text-right ml-auto flex items-center gap-2 ${mcpEnabled ? 'opacity-50' : ''}`}>
                            Get Random Number
                            <span className={`text-xs px-2 py-1 rounded ${config.tools.get_random_number && !mcpEnabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {mcpEnabled ? 'Disabled' : (config.tools.get_random_number ? 'Enabled' : 'Disabled')}
                            </span>
                        </Label>
                    </div>
                    <Separator />
                    <Label className={`text-right`}>
                        MCP Server (Model Context Protocol)
                    </Label>
                    <div className="grid grid-cols-2 items-center gap-4">
                        <Label htmlFor="mcpServer" className="text-right">
                            Server
                        </Label>
                        <Select value={config.mcpServer} onValueChange={updateMcpServer}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select MCP server" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>MCP Servers</SelectLabel>
                                    <SelectItem value="none">None (Custom Tools)</SelectItem>
                                    <SelectItem value="sequential-thinking">Sequential Thinking</SelectItem>
                                    <SelectItem value="weather">Weather MCP</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
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
