import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ModelSelect } from "@/components/model-select"
import { Separator } from "@/components/ui/separator"
import { Settings } from "lucide-react"

export function ConfigDialog() {
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
                    <Label htmlFor="model" className="text-right">
                        Tools
                    </Label>
                    <div className="grid grid-cols-2 items-center gap-4">
                        <Switch id="get_time" />
                        <Label htmlFor="get_time" className="text-right">
                            Get Time
                        </Label>
                    </div>
                    <div className="grid grid-cols-2 items-center gap-4">
                        <Switch id="get_random_number" />
                        <Label htmlFor="get_random_number" className="text-right">
                            Get Random Number
                        </Label>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit">Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
