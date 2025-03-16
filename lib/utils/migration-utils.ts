import { useAppStore } from "../state/store"
import type {
  OfficialSettings,
  SemesterSettings,
  SupervisionSchedule,
  AbsenceRecord,
  ImportedData,
  ImportedSemesterData,
} from "../types"

// Migrate legacy data from localStorage to the new store
export function migrateLegacyData(): boolean {
  try {
    console.log("Starting migration of legacy data")

    // Get store
    const store = useAppStore.getState()

    // Migrate official settings
    try {
      const officialSettings = localStorage.getItem("officialSettings")
      if (officialSettings) {
        const parsedSettings = JSON.parse(officialSettings) as OfficialSettings
        store.setOfficialSettings(parsedSettings)
        console.log("Migrated official settings")
      }
    } catch (error) {
      console.error("Error migrating official settings:", error)
    }

    // Migrate semester settings
    try {
      const semesterSettings = localStorage.getItem("semesterSettings")
      if (semesterSettings) {
        const parsedSettings = JSON.parse(semesterSettings) as SemesterSettings
        store.setSemesterSettings(parsedSettings)
        console.log("Migrated semester settings")
      }
    } catch (error) {
      console.error("Error migrating semester settings:", error)
    }

    // Migrate imported official data
    try {
      const importedData = localStorage.getItem("importedData")
      if (importedData) {
        const parsedData = JSON.parse(importedData) as ImportedData
        store.setOfficialTeachers(parsedData.teachers)
        store.setOfficialStudents(parsedData.students)
        console.log("Migrated official imported data")
      }
    } catch (error) {
      console.error("Error migrating official imported data:", error)
    }

    // Migrate imported semester data
    try {
      const importedSemesterData = localStorage.getItem("semesterImportedData")
      if (importedSemesterData) {
        const parsedData = JSON.parse(importedSemesterData) as ImportedSemesterData
        store.setSemesterTeachers(parsedData.teachers)
        store.setSemesterStudents(parsedData.students)
        store.setSemesterRooms(parsedData.rooms)
        console.log("Migrated semester imported data")
      }
    } catch (error) {
      console.error("Error migrating semester imported data:", error)
    }

    // Migrate official supervision schedule
    try {
      const supervisionSchedule = localStorage.getItem("supervisionSchedule")
      if (supervisionSchedule) {
        const parsedSchedule = JSON.parse(supervisionSchedule) as SupervisionSchedule
        store.setOfficialSupervisionSchedule(parsedSchedule)
        console.log("Migrated official supervision schedule")
      }
    } catch (error) {
      console.error("Error migrating official supervision schedule:", error)
    }

    // Migrate semester supervision schedule
    try {
      const semesterSupervisionSchedule = localStorage.getItem("semesterSupervisionSchedule")
      if (semesterSupervisionSchedule) {
        const parsedSchedule = JSON.parse(semesterSupervisionSchedule) as SupervisionSchedule
        store.setSemesterSupervisionSchedule(parsedSchedule)
        console.log("Migrated semester supervision schedule")
      }
    } catch (error) {
      console.error("Error migrating semester supervision schedule:", error)
    }

    // Migrate official absences
    try {
      const officialAbsences = localStorage.getItem("officialAbsences")
      if (officialAbsences) {
        const parsedAbsences = JSON.parse(officialAbsences) as AbsenceRecord[]
        parsedAbsences.forEach((absence) => store.addOfficialAbsence(absence))
        console.log("Migrated official absences")
      }
    } catch (error) {
      console.error("Error migrating official absences:", error)
    }

    // Migrate semester absences
    try {
      const semesterAbsences = localStorage.getItem("semesterAbsences")
      if (semesterAbsences) {
        const parsedAbsences = JSON.parse(semesterAbsences) as AbsenceRecord[]
        parsedAbsences.forEach((absence) => store.addSemesterAbsence(absence))
        console.log("Migrated semester absences")
      }
    } catch (error) {
      console.error("Error migrating semester absences:", error)
    }

    console.log("Migration completed successfully")
    return true
  } catch (error) {
    console.error("Error during migration:", error)
    return false
  }
}

// Clear legacy data from localStorage after successful migration
export function clearLegacyData(): void {
  try {
    // List of legacy keys to remove
    const legacyKeys = [
      "officialSettings",
      "semesterSettings",
      "importedData",
      "semesterImportedData",
      "supervisionSchedule",
      "semesterSupervisionSchedule",
      "officialAbsences",
      "semesterAbsences",
    ]

    // Remove each key
    legacyKeys.forEach((key) => {
      try {
        localStorage.removeItem(key)
        console.log(`Removed legacy key: ${key}`)
      } catch (error) {
        console.error(`Error removing legacy key ${key}:`, error)
      }
    })

    console.log("Legacy data cleared successfully")
  } catch (error) {
    console.error("Error clearing legacy data:", error)
  }
}

