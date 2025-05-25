import * as React from "react"

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
  return (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Models</SelectLabel>
          <SelectItem value="gemini-2.0-flash">Gemini 2.0 Flash</SelectItem>
          <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
          <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
