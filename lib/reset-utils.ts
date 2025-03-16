// دالة لإعادة ضبط التطبيق بالكامل
export function resetApplication() {
  // مسح جميع بيانات localStorage
  const keys = Object.keys(localStorage)
  for (const key of keys) {
    localStorage.removeItem(key)
    console.log(`تم مسح: ${key}`)
  }

  // إعادة تحميل الصفحة
  window.location.href = "/welcome"
}

// دالة لمسح جميع بيانات localStorage المتعلقة بالتطبيق
export function clearAllAppData() {
  // الحصول على جميع مفاتيح localStorage
  const keys = Object.keys(localStorage)
  let clearedItems = 0

  // مسح جميع المفاتيح المتعلقة بالتطبيق
  for (const key of keys) {
    if (
      key.includes("Settings") ||
      key.includes("supervision") ||
      key.includes("absences") ||
      key.includes("documents") ||
      key.includes("imported")
    ) {
      localStorage.removeItem(key)
      console.log(`تم مسح: ${key}`)
      clearedItems++
    }
  }

  return clearedItems
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

