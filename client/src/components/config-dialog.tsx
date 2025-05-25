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
import { Separator } from "@/components/ui/separator"
import { Settings } from "lucide-react"
import { useConfig } from "@/contexts/config-context"

export function ConfigDialog() {
    const { config, updateTool } = useConfig()

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
                    <Label className="text-right">
                        Tools
                    </Label>
                    <div className="grid grid-cols-2 items-center gap-4">
                        <Switch 
                            id="get_time" 
                            checked={config.tools.get_time}
                            onCheckedChange={(checked) => updateTool('get_time', checked)}
                        />
                        <Label htmlFor="get_time" className="text-right flex items-center gap-2">
                            Get Time
                            <span className={`text-xs px-2 py-1 rounded ${config.tools.get_time ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {config.tools.get_time ? 'Enabled' : 'Disabled'}
                            </span>
                        </Label>
                    </div>
                    <div className="grid grid-cols-2 items-center gap-4">
                        <Switch 
                            id="get_random_number" 
                            checked={config.tools.get_random_number}
                            onCheckedChange={(checked) => updateTool('get_random_number', checked)}
                        />
                        <Label htmlFor="get_random_number" className="text-right flex items-center gap-2">
                            Get Random Number
                            <span className={`text-xs px-2 py-1 rounded ${config.tools.get_random_number ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {config.tools.get_random_number ? 'Enabled' : 'Disabled'}
                            </span>
                        </Label>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
