// تعريف أنواع البيانات
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

// الإعدادات الافتراضية
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

// دالة للحصول على الإعدادات الأساسية
export function getBasicSettings(forceRefresh = false): BasicSettings {
  try {
    // في بيئة المتصفح، نحاول الحصول على الإعدادات من التخزين المحلي
    if (typeof window !== "undefined") {
      const savedSettings = localStorage.getItem("basicSettings")

      // إذا كانت الإعدادات موجودة ولا نريد تحديثها بالقوة، نعيدها
      if (savedSettings && !forceRefresh) {
        return JSON.parse(savedSettings)
      }

      // إذا لم تكن الإعدادات موجودة، نستخدم الإعدادات الافتراضية ونحفظها
      if (!savedSettings) {
        localStorage.setItem("basicSettings", JSON.stringify(defaultBasicSettings))
      }
    }

    // إعادة الإعدادات الافتراضية
    return defaultBasicSettings
  } catch (error) {
    console.error("Error loading basic settings:", error)
    return defaultBasicSettings
  }
}

// دالة للحصول على إعدادات الامتحانات الرسمية
export function getOfficialSettings(forceRefresh = false): OfficialExamSettings {
  try {
    // في بيئة المتصفح، نحاول الحصول على الإعدادات من التخزين المحلي
    if (typeof window !== "undefined") {
      const savedSettings = localStorage.getItem("officialSettings")

      // إذا كانت الإعدادات موجودة ولا نريد تحديثها بالقوة، نعيدها
      if (savedSettings && !forceRefresh) {
        return JSON.parse(savedSettings)
      }

      // إذا لم تكن الإعدادات موجودة، نستخدم الإعدادات الافتراضية ونحفظها
      if (!savedSettings) {
        localStorage.setItem("officialSettings", JSON.stringify(defaultOfficialSettings))
      }
    }

    // إعادة الإعدادات الافتراضية
    return defaultOfficialSettings
  } catch (error) {
    console.error("Error loading official settings:", error)
    return defaultOfficialSettings
  }
}

// دالة للحصول على إعدادات الامتحانات الفصلية
export function getSemesterSettings(forceRefresh = false): SemesterExamSettings {
  try {
    // في بيئة المتصفح، نحاول الحصول على الإعدادات من التخزين المحلي
    if (typeof window !== "undefined") {
      const savedSettings = localStorage.getItem("semesterSettings")

      // إذا كانت الإعدادات موجودة ولا نريد تحديثها بالقوة، نعيدها
      if (savedSettings && !forceRefresh) {
        return JSON.parse(savedSettings)
      }

      // إذا لم تكن الإعدادات موجودة، نستخدم الإعدادات الافتراضية ونحفظها
      if (!savedSettings) {
        localStorage.setItem("semesterSettings", JSON.stringify(defaultSemesterSettings))
      }
    }

    // إعادة الإعدادات الافتراضية
    return defaultSemesterSettings
  } catch (error) {
    console.error("Error loading semester settings:", error)
    return defaultSemesterSettings
  }
}

// دالة لحفظ الإعدادات الأساسية
export function saveBasicSettings(settings: BasicSettings): void {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem("basicSettings", JSON.stringify(settings))
    }
  } catch (error) {
    console.error("Error saving basic settings:", error)
  }
}

// دالة لحفظ إعدادات الامتحانات الرسمية
export function saveOfficialSettings(settings: OfficialExamSettings): void {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem("officialSettings", JSON.stringify(settings))
    }
  } catch (error) {
    console.error("Error saving official settings:", error)
  }
}

// دالة لحفظ إعدادات الامتحانات الفصلية
export function saveSemesterSettings(settings: SemesterExamSettings): void {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem("semesterSettings", JSON.stringify(settings))
    }
  } catch (error) {
    console.error("Error saving semester settings:", error)
  }
}

// التحقق من صحة الإعدادات
export function validateSettings(settings: any): boolean {
  if (!settings || typeof settings !== "object") {
    console.error("الإعدادات غير صالحة أو غير موجودة")
    return false
  }

  // التحقق من وجود الحقول الأساسية
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

