// دالة لإعداد مراقبة التخزين المحلي
export function setupStorageMonitor() {
  if (typeof window === "undefined") return

  // مراقبة التغييرات في localStorage
  window.addEventListener("storage", (event) => {
    console.log(`تم تغيير البيانات المخزنة: ${event.key}`)
    console.log("القيمة القديمة:", event.oldValue)
    console.log("القيمة الجديدة:", event.newValue)
  })

  // تسجيل الدوال الأصلية لـ localStorage
  const originalSetItem = localStorage.setItem
  const originalRemoveItem = localStorage.removeItem

  // استبدال دالة setItem لتسجيل التغييرات
  localStorage.setItem = (key, value) => {
    console.log(`تم حفظ البيانات: ${key}`, value)
    originalSetItem.call(localStorage, key, value)
  }

  // استبدال دالة removeItem لتسجيل التغييرات
  localStorage.removeItem = (key) => {
    console.log(`تم مسح البيانات: ${key}`)
    originalRemoveItem.call(localStorage, key)
  }
}

// دالة للتحقق من صحة البيانات المخزنة
export function validateSettings(settings) {
  // التحقق من وجود البيانات الأساسية
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

// دالة لعرض جميع البيانات المخزنة في localStorage
export function displayAllStoredData() {
  const keys = Object.keys(localStorage)
  const data = {}

  for (const key of keys) {
    try {
      const value = localStorage.getItem(key)
      data[key] = value ? JSON.parse(value) : null
    } catch (error) {
      data[key] = `[خطأ في تحليل البيانات: ${error}]`
    }
  }

  console.log("جميع البيانات المخزنة:", data)
  return data
}

