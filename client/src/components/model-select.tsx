import { useConfig } from "@/contexts/config-context"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function ModelSelect() {
  const { config, updateModel } = useConfig()

  return (
    <Select value={config.model} onValueChange={updateModel}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Models</SelectLabel>
          <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
          <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
          <SelectItem value="gemini-2.0-flash">Gemini 2.0 Flash</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
