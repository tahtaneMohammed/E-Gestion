"use client"

import { useState, useEffect } from "react"
import { getOfficialSettings, getSemesterSettings } from "@/lib/utils/settings-utils"

type SettingsType = "official" | "semester" | "general" // Assuming 'general' is also a valid type

export const useSettings = (type: SettingsType) => {
  const [settings, setSettings] = useState(type === "official" ? getOfficialSettings() : getSemesterSettings())

  useEffect(() => {
    if (type === "official") {
      setSettings(getOfficialSettings())
    } else if (type === "semester") {
      setSettings(getSemesterSettings())
    }
    // Add a general settings retrieval if needed, based on other files
  }, [type])

  return { settings }
}

