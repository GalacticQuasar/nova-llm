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

export function StreamSelect() {
  const { config, updateStreamType } = useConfig()

  return (
    <Select value={config.streamType} onValueChange={updateStreamType}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a stream animation" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Models</SelectLabel>
          <SelectItem value="Chunk">Chunk</SelectItem>
          <SelectItem value="Word">Word</SelectItem>
          <SelectItem value="Character">Character</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}