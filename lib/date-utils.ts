// تحويل النص إلى كائن تاريخ
export function parseDate(dateString: string): Date {
  // التحقق من صحة تنسيق التاريخ (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(dateString)) {
    console.error(`تنسيق التاريخ غير صحيح: ${dateString}. يجب أن يكون بتنسيق YYYY-MM-DD`)
    return new Date() // إرجاع التاريخ الحالي في حالة الخطأ
  }

  return new Date(dateString)
}

// الحصول على اسم اليوم بالعربية
export function getArabicDayName(date: Date): string {
  const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
  return days[date.getDay()]
}

// تنسيق التاريخ بالصيغة العربية
export function formatArabicDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, "0")
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const year = date.getFullYear()

  return `${day}/${month}/${year}`
}

// Función para generar los días de examen entre dos fechas
export function generateExamDays(startDate: string, endDate: string) {
  if (!startDate || !endDate) {
    return []
  }

  // Convertir las fechas de string a objetos Date
  const start = new Date(startDate)
  const end = new Date(endDate)

  // Verificar si las fechas son válidas
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return []
  }

  // Array para almacenar los días
  const days = []

  // Nombres de los días en árabe
  const dayNames = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]

  // Clonar la fecha de inicio para no modificarla
  const currentDate = new Date(start)

  // Iterar desde la fecha de inicio hasta la fecha de fin
  while (currentDate <= end) {
    // Obtener el nombre del día en árabe
    const dayName = dayNames[currentDate.getDay()]

    // Formatear la fecha como DD/MM/YYYY
    const formattedDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()}`

    // Agregar el día al array
    days.push({
      day: dayName,
      date: formattedDate,
    })

    // Avanzar al siguiente día
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return days
}

// Función para formatear una fecha en formato DD/MM/YYYY
export function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, "0")
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const year = date.getFullYear()

  return `${day}/${month}/${year}`
}

// Función para verificar si una fecha está entre dos fechas
export function isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
  return date >= startDate && date <= endDate
}

// Función para calcular la diferencia en días entre dos fechas
export function daysBetweenDates(startDate: Date, endDate: Date): number {
  const oneDay = 24 * 60 * 60 * 1000 // Milisegundos en un día
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  return Math.round(diffTime / oneDay)
}

// تحويل تاريخ من تنسيق DD/MM/YYYY إلى YYYY-MM-DD
export function convertToISODate(dateString: string): string {
  // التحقق من صحة تنسيق التاريخ (DD/MM/YYYY)
  const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/
  const match = dateString.match(dateRegex)

  if (!match) {
    console.error(`تنسيق التاريخ غير صحيح: ${dateString}. يجب أن يكون بتنسيق DD/MM/YYYY`)
    return ""
  }

  const [, day, month, year] = match
  return `${year}-${month}-${day}`
}

// تحويل تاريخ من تنسيق YYYY-MM-DD إلى DD/MM/YYYY
export function convertFromISODate(dateString: string): string {
  // التحقق من صحة تنسيق التاريخ (YYYY-MM-DD)
  const dateRegex = /^(\d{4})-(\d{2})-(\d{2})$/
  const match = dateString.match(dateRegex)

  if (!match) {
    console.error(`تنسيق التاريخ غير صحيح: ${dateString}. يجب أن يكون بتنسيق YYYY-MM-DD`)
    return ""
  }

  const [, year, month, day] = match
  return `${day}/${month}/${year}`
}

