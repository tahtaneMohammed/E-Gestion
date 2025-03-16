import { jsPDF } from "jspdf"
import "jspdf-autotable"
import { getOfficialSettings } from "./utils/settings-utils"
import type { SupervisionRecord, AbsenceRecord } from "./types"

// دالة لإنشاء ملف PDF لجدول الإشراف
export function generateSupervisionPDF(records: SupervisionRecord[], day: string, period: string): jsPDF {
  // تحميل الإعدادات مع إجبار التحديث من localStorage
  const settings = getOfficialSettings(true)
  console.log("Using settings for PDF generation:", settings)

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  doc.setR2L(true)

  // Set document properties
  doc.setProperties({
    title: `جدول توزيع الحراسة - ${settings.examSession || ""} ${settings.academicYear || ""}`,
    subject: `جدول توزيع الحراسة ليوم ${day} - الفترة ${period === "morning" ? "الصباحية" : "المسائية"}`,
    author: settings.schoolName || "المؤسسة التعليمية",
    keywords: "امتحانات, حراسة, توزيع",
    creator: "E'gest Desktop App",
    language: "ar-SA", // Add language metadata
  })

  doc.setFont("Cairo", "bold")
  doc.setFontSize(16)
  doc.text("الجمهورية الجزائرية الديمقراطية الشعبية", doc.internal.pageSize.width / 2, 20, { align: "center" })
  doc.setFontSize(14)
  doc.text("وزارة التربية الوطنية", doc.internal.pageSize.width / 2, 30, { align: "center" })
  doc.text("الديوان الوطني للامتحانات و المسابقات", doc.internal.pageSize.width / 2, 40, { align: "center" })

  // استخدام اسم المدرسة من الإعدادات
  const schoolName = settings.schoolName || "المؤسسة التعليمية"
  doc.setFontSize(14)
  doc.text(schoolName, doc.internal.pageSize.width / 2, 50, { align: "center" })
  doc.text(`السنة الدراسية: ${settings.academicYear || ""}`, doc.internal.pageSize.width / 2, 58, { align: "center" })

  doc.setFontSize(18)
  // Add title with structure tag if supported
  doc.setFont("Cairo", "bold")
  // Some PDF libraries support structure tags for accessibility
  // If jsPDF supports it, you would use something like:
  // doc.tag.startTag("H1");
  doc.text(`جدول توزيع الحراسة - ${settings.examSession || ""}`, doc.internal.pageSize.width / 2, 68, {
    align: "center",
  })
  // doc.tag.endTag();

  doc.setFontSize(12)
  const dateText =
    settings.startDate && settings.endDate
      ? `الفترة من ${settings.startDate} إلى ${settings.endDate}`
      : "الفترة: غير محددة"
  doc.text(dateText, doc.internal.pageSize.width / 2, 76, { align: "center" })

  doc.setFontSize(12)
  doc.text(`امتحان ${settings.examSession || ""} ${settings.academicYear || ""}`, 20, 84)

  // استخدام رمز المركز من الإعدادات
  const centerCode = settings.centerCode || ""
  doc.text(`رمز المركز: ${centerCode}`, doc.internal.pageSize.width - 20, 84, { align: "right" })

  // استخدام اسم مركز الامتحان من الإعدادات
  const centerName = settings.centerName || schoolName
  doc.text(`مركز الامتحان: ${centerName}`, 20, 92)

  doc.text(`الفترة ${period === "morning" ? "الصباحية" : "المسائية"}`, doc.internal.pageSize.width - 20, 92, {
    align: "right",
  })

  doc.setFontSize(16)
  doc.text("جدول توزيع الأساتذة للحراسة", doc.internal.pageSize.width / 2, 102, { align: "center" })

  doc.setFontSize(12)
  doc.text(`اليوم: ${day}`, doc.internal.pageSize.width / 2, 110, { align: "center" })

  const tableData = records.map((record, index) => [
    index + 1,
    typeof record.room === "string" ? record.room : record.room.name,
    record.mainSupervisor || "",
    record.secondSupervisor || "",
    record.thirdSupervisor || "",
  ])
  ;(doc as any).autoTable({
    startY: 118,
    head: [["الرقم", "القاعة", "الحارس الرئيسي", "الحارس الثاني", "الحارس الثالث"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
    },
    styles: {
      halign: "right",
      cellPadding: 5,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 15 },
      1: { cellWidth: 30 },
      2: { cellWidth: 45 },
      3: { cellWidth: 45 },
      4: { cellWidth: 45 },
    },
  })

  // استخدام اسم المدير من الإعدادات
  const principalName = settings.principalName || "مدير المؤسسة"
  const finalY = (doc as any).lastAutoTable.finalY + 20
  doc.text(principalName, doc.internal.pageSize.width - 30, finalY)
  doc.text("الختم والإمضاء", doc.internal.pageSize.width - 30, finalY + 25)

  const today = new Date()
  const dateStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`
  doc.text(`تاريخ الإصدار: ${dateStr}`, 20, doc.internal.pageSize.height - 10)

  doc.text(`الصفحة 1 من 1`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10, { align: "right" })

  return doc
}

// دالة لإنشاء ملف PDF لسجل الغيابات
export function generateAbsencesPDF(absences: AbsenceRecord[]): jsPDF {
  // تحميل الإعدادات مع إجبار التحديث من localStorage
  const settings = getOfficialSettings(true)
  console.log("Using settings for absences PDF generation:", settings)

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  doc.setR2L(true)

  // Set document properties
  doc.setProperties({
    title: `سجل الغيابات - ${settings.examSession || ""} ${settings.academicYear || ""}`,
    subject: "سجل الغيابات",
    author: settings.schoolName || "المؤسسة التعليمية",
    keywords: "امتحانات, غيابات, سجل",
    creator: "E'gest Desktop App",
    language: "ar-SA", // Add language metadata
  })

  doc.setFont("Cairo", "bold")
  doc.setFontSize(16)
  doc.text("الجمهورية الجزائرية الديمقراطية الشعبية", 105, 10, { align: "center" })
  doc.text("وزارة التربية الوطنية", 105, 18, { align: "center" })
  doc.text("الديوان الوطني للامتحانات و المسابقات", 105, 26, { align: "center" })

  // استخدام اسم المدرسة من الإعدادات
  const schoolName = settings.schoolName || "المؤسسة التعليمية"
  doc.setFontSize(14)
  doc.text(schoolName, 105, 34, { align: "center" })
  doc.text(`السنة الدراسية: ${settings.academicYear || ""}`, 105, 42, { align: "center" })

  doc.setFontSize(18)
  // Add title with structure tag if supported
  doc.setFont("Cairo", "bold")
  // Some PDF libraries support structure tags for accessibility
  // If jsPDF supports it, you would use something like:
  // doc.tag.startTag("H1");
  doc.text(`سجل الغيابات - ${settings.examSession || ""}`, 105, 52, { align: "center" })
  // doc.tag.endTag();

  doc.setFontSize(12)
  const dateText =
    settings.startDate && settings.endDate
      ? `الفترة من ${settings.startDate} إلى ${settings.endDate}`
      : "الفترة: غير محددة"
  doc.text(dateText, 105, 60, { align: "center" })

  doc.setFontSize(12)
  doc.text(`امتحان ${settings.examSession || ""} ${settings.academicYear || ""}`, 20, 70)

  // استخدام رمز المركز من الإعدادات
  const centerCode = settings.centerCode || ""
  doc.text(`رمز المركز: ${centerCode}`, 190, 70, { align: "right" })

  // استخدام اسم مركز الامتحان من الإعدادات
  const centerName = settings.centerName || schoolName
  doc.text(`مركز الامتحان: ${centerName}`, 20, 78)

  const tableColumn = ["الرقم", "الاسم", "النوع", "التاريخ", "الفترة", "الحالة", "ملاحظات"]
  const tableRows = absences.map((absence, index) => [
    index + 1,
    absence.name,
    absence.type === "student" ? "طالب" : "أستاذ",
    absence.date,
    absence.period === "morning" ? "الصباحية" : "المسائية",
    absence.status === "absent" ? "غائب" : "متأخر",
    absence.notes || "-",
  ])
  ;(doc as any).autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 85,
    styles: { font: "Cairo", halign: "right", fontSize: 10 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
  })

  // استخدام اسم المدير من الإعدادات
  const principalName = settings.principalName || "مدير المؤسسة"
  const finalY = (doc as any).lastAutoTable.finalY + 20
  doc.text(principalName, 190, finalY)
  doc.text("الختم والإمضاء", 190, finalY + 25)

  const today = new Date()
  const dateStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`
  doc.text(`تاريخ الإصدار: ${dateStr}`, 20, doc.internal.pageSize.height - 10)

  return doc
}

// دالة مساعدة لتنزيل ملف PDF
export function downloadPDF(doc: jsPDF, filename: string): boolean {
  try {
    doc.save(filename)
    console.log(`PDF downloaded: ${filename}`)
    return true
  } catch (error) {
    console.error("Error downloading PDF:", error)
    return false
  }
}

