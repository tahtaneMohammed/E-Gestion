// Define types
export type BasicSettings = {
  institutionName: string
  institutionAddress: string
  institutionPhone: string
  institutionEmail: string
  directorName: string
  directorTitle: string
  academicYear: string
  logo?: string
}

export type OfficialExamSettings = {
  examSession: string
  startDate: string
  endDate: string
  examType: string
  examLevel: string
  examCenter: string
  centerManager: string
  centerCode: string
  schoolName?: string
  schoolAddress?: string
  principalName?: string
  startHour?: string
  endHour?: string
  coordinatorName?: string
  contactPhone?: string
  contactEmail?: string
  centerName?: string
}

export type SemesterExamSettings = {
  examSession: string
  startDate: string
  endDate: string
  semester: string
  academicLevel: string
  schoolName?: string
  schoolAddress?: string
  principalName?: string
  academicYear?: string
  startHour?: string
  endHour?: string
  coordinatorName?: string
  contactPhone?: string
  contactEmail?: string
  centerCode?: string
  centerName?: string
  examDuration?: string
  passingGrade?: string
}

// Default settings
const defaultBasicSettings: BasicSettings = {
  institutionName: "المؤسسة التعليمية",
  institutionAddress: "عنوان المؤسسة",
  institutionPhone: "0123456789",
  institutionEmail: "info@example.com",
  directorName: "مدير المؤسسة",
  directorTitle: "مدير",
  academicYear: "2023-2024",
}

const defaultOfficialSettings: OfficialExamSettings = {
  examSession: "الدورة العادية",
  startDate: "2024-06-01",
  endDate: "2024-06-15",
  examType: "شهادة البكالوريا",
  examLevel: "السنة الثالثة ثانوي",
  examCenter: "مركز الامتحان",
  centerManager: "مدير المركز",
  centerCode: "12345",
  schoolName: "",
  schoolAddress: "",
  principalName: "",
  startHour: "",
  endHour: "",
  coordinatorName: "",
  contactPhone: "",
  contactEmail: "",
  centerName: "",
}

const defaultSemesterSettings: SemesterExamSettings = {
  examSession: "الفصل الأول",
  startDate: "2024-01-15",
  endDate: "2024-01-25",
  semester: "الفصل الأول",
  academicLevel: "جميع المستويات",
  schoolName: "",
  schoolAddress: "",
  principalName: "",
  academicYear: new Date().getFullYear().toString(),
  startHour: "",
  endHour: "",
  coordinatorName: "",
  contactPhone: "",
  contactEmail: "",
  centerCode: "",
  centerName: "",
  examDuration: "",
  passingGrade: "",
}

// Function to get basic settings
export function getBasicSettings(forceRefresh = false): BasicSettings {
  try {
    if (typeof window !== "undefined") {
      const savedSettings = localStorage.getItem("basicSettings")

      if (savedSettings && !forceRefresh) {
        return JSON.parse(savedSettings)
      }

      if (!savedSettings) {
        localStorage.setItem("basicSettings", JSON.stringify(defaultBasicSettings))
      }
    }

    return defaultBasicSettings
  } catch (error) {
    console.error("Error loading basic settings:", error)
    return defaultBasicSettings
  }
}

// Function to get official settings
export function getOfficialSettings(forceRefresh = false): OfficialExamSettings {
  try {
    if (typeof window !== "undefined") {
      const savedSettings = localStorage.getItem("officialSettings")

      if (savedSettings && !forceRefresh) {
        return JSON.parse(savedSettings)
      }

      if (!savedSettings) {
        localStorage.setItem("officialSettings", JSON.stringify(defaultOfficialSettings))
      }
    }

    return defaultOfficialSettings
  } catch (error) {
    console.error("Error loading official settings:", error)
    return defaultOfficialSettings
  }
}

// Function to get semester settings
export function getSemesterSettings(forceRefresh = false): SemesterExamSettings {
  try {
    if (typeof window !== "undefined") {
      const savedSettings = localStorage.getItem("semesterSettings")

      if (savedSettings && !forceRefresh) {
        return JSON.parse(savedSettings)
      }

      if (!savedSettings) {
        localStorage.setItem("semesterSettings", JSON.stringify(defaultSemesterSettings))
      }
    }

    return defaultSemesterSettings
  } catch (error) {
    console.error("Error loading semester settings:", error)
    return defaultSemesterSettings
  }
}

// Function to save basic settings
export function saveBasicSettings(settings: BasicSettings): void {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem("basicSettings", JSON.stringify(settings))
    }
  } catch (error) {
    console.error("Error saving basic settings:", error)
  }
}

// Function to save official settings
export function saveOfficialSettings(settings: OfficialExamSettings): void {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem("officialSettings", JSON.stringify(settings))
    }
  } catch (error) {
    console.error("Error saving official settings:", error)
  }
}

// Function to save semester settings
export function saveSemesterSettings(settings: SemesterExamSettings): void {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem("semesterSettings", JSON.stringify(settings))
    }
  } catch (error) {
    console.error("Error saving semester settings:", error)
  }
}

// Function to validate settings
export function validateSettings(settings: any): boolean {
  if (!settings || typeof settings !== "object") {
    console.error("الإعدادات غير صالحة أو غير موجودة")
    return false
  }

  const requiredFields = ["schoolName", "principalName", "academicYear"]
  const missingFields = []

  for (const field of requiredFields) {
    if (!settings[field]) {
      missingFields.push(field)
      console.warn(`الحقل المطلوب غير موجود: ${field}`)
    }
  }

  if (missingFields.length > 0) {
    console.warn(`الحقول المفقودة: ${missingFields.join(", ")}`)
    return false
  }

  return true
}

