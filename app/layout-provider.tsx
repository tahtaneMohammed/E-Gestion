"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { migrateLegacyData } from "@/lib/utils/migration-utils"

export default function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [isMigrated, setIsMigrated] = useState(false)

  useEffect(() => {
    // Check if we need to migrate legacy data
    const needsMigration = localStorage.getItem("egest-migration-completed") !== "true"

    if (needsMigration) {
      console.log("Starting data migration process")

      // Migrate legacy data to the new store
      const migrationSuccess = migrateLegacyData()

      if (migrationSuccess) {
        // Mark migration as completed
        localStorage.setItem("egest-migration-completed", "true")

        // Clear legacy data (optional - can be commented out if you want to keep the legacy data as backup)
        // clearLegacyData();

        console.log("Data migration completed successfully")
      } else {
        console.error("Data migration failed")
      }

      setIsMigrated(true)
    } else {
      setIsMigrated(true)
    }
  }, [])

  // Show loading state until migration is complete
  if (!isMigrated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-lg font-medium">جاري تحميل التطبيق...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

