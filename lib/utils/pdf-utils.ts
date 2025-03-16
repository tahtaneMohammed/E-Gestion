import { jsPDF } from "jspdf"
import "jspdf-autotable"
import { getOfficialSettings, getSemesterSettings, validateSettings } from "./settings-utils"
import type { SupervisionRecord, AbsenceRecord } from "../types"

// Generate supervision PDF for official exams
export function generateOfficialSupervisionPDF(records: SupervisionRecord[], day: string, period: string): jsPDF {
  console.log("Generating official supervision PDF")

  // Get settings from the store
  const settings = getOfficialSettings()

  // Validate settings
  if (!validateSettings(settings)) {
    console.warn("Invalid settings for PDF generation")
  }

  // Create PDF document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  // Set right-to-left mode
  doc.setR2L(true)

  // Add header
  doc.setFont("Cairo", "bold")
  doc.setFontSize(16)
  doc.text("الجمهورية الجزائرية الديمقراطية الشعبية", doc.internal.pageSize.width / 2, 20, { align: "center" })
  doc.setFontSize(14)
  doc.text("وزارة التربية الوطنية", doc.internal.pageSize.width / 2, 30, { align: "center" })
  doc.text("الديوان الوطني للامتحانات و المسابقات", doc.internal.pageSize.width / 2, 40, { align: "center" })

  // Add school info
  doc.setFontSize(14)
  doc.text(settings.schoolName || "", doc.internal.pageSize.width / 2, 50, { align: "center" })
  doc.text(`السنة الدراسية: ${settings.academicYear || ""}`, doc.internal.pageSize.width / 2, 58, { align: "center" })

  // Add document title
  doc.setFontSize(18)
  doc.text(`جدول توزيع الحراسة - ${settings.examSession || ""}`, doc.internal.pageSize.width / 2, 68, {
    align: "center",
  })

  // Add date range
  doc.setFontSize(12)
  const dateText =
    settings.startDate && settings.endDate
      ? `الفترة من ${settings.startDate} إلى ${settings.endDate}`
      : "الفترة: غير محددة"
  doc.text(dateText, doc.internal.pageSize.width / 2, 76, { align: "center" })

  // Add exam info
  doc.setFontSize(12)
  doc.text(`امتحان ${settings.examSession || ""} ${settings.academicYear || ""}`, 20, 84)
  doc.text(`رمز المركز: ${settings.centerCode || ""}`, doc.internal.pageSize.width - 20, 84, { align: "right" })
  doc.text(`مركز الامتحان: ${settings.centerName || settings.schoolName || ""}`, 20, 92)
  doc.text(`الفترة ${period === "morning" ? "الصباحية" : "المسائية"}`, doc.internal.pageSize.width - 20, 92, {
    align: "right",
  })

  // Add title
  doc.setFontSize(16)
  doc.text("جدول توزيع الأساتذة للحراسة", doc.internal.pageSize.width / 2, 102, { align: "center" })

  // Add day info
  doc.setFontSize(12)
  doc.text(`اليوم: ${day}`, doc.internal.pageSize.width / 2, 110, { align: "center" })

  // Create table data
  const tableData = records.map((record, index) => [
    index + 1,
    typeof record.room === "string" ? record.room : record.room.name,
    record.mainSupervisor || "",
    record.secondSupervisor || "",
    record.thirdSupervisor || "",
  ])

  // Add table
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

  // Add signature
  const finalY = (doc as any).lastAutoTable.finalY + 20
  doc.text(settings.principalName || "رئيس المركز", doc.internal.pageSize.width - 30, finalY)
  doc.text("الختم والإمضاء", doc.internal.pageSize.width - 30, finalY + 25)

  // Add date
  const today = new Date()
  const dateStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`
  doc.text(`تاريخ الإصدار: ${dateStr}`, 20, doc.internal.pageSize.height - 10)

  // Add page number
  doc.text(`الصفحة 1 من 1`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10, { align: "right" })

  return doc
}

// Generate supervision PDF for semester exams
export function generateSemesterSupervisionPDF(records: SupervisionRecord[], day: string, period: string): jsPDF {
  console.log("Generating semester supervision PDF")

  // Get settings from the store
  const settings = getSemesterSettings()

  // Validate settings
  if (!validateSettings(settings)) {
    console.warn("Invalid settings for PDF generation")
  }

  // Create PDF document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  // Set right-to-left mode
  doc.setR2L(true)

  // Add header
  doc.setFont("Cairo", "bold")
  doc.setFontSize(16)
  doc.text("الجمهورية الجزائرية الديمقراطية الشعبية", 105, 10, { align: "center" })
  doc.text("وزارة التربية الوطنية", 105, 18, { align: "center" })

  // Add school info
  doc.setFontSize(14)
  doc.text(settings.schoolName || "", 105, 26, { align: "center" })
  doc.text(`السنة الدراسية: ${settings.academicYear || ""}`, 105, 34, { align: "center" })

  // Add document title
  doc.setFontSize(18)
  doc.text(`جدول توزيع الحراسة - ${settings.examSession || ""}`, 105, 45, { align: "center" })

  // Add date range
  doc.setFontSize(12)
  const dateText =
    settings.startDate && settings.endDate
      ? `الفترة من ${settings.startDate} إلى ${settings.endDate}`
      : "الفترة: غير محددة"
  doc.text(dateText, 105, 55, { align: "center" })

  // Add exam info
  doc.setFontSize(12)
  const examInfo = `امتحان ${settings.examSession || ""} ${settings.academicYear || ""}`
  doc.text(examInfo, 20, 65)
  doc.text(`مركز الامتحان: ${settings.centerName || settings.schoolName || ""}`, 20, 73)

  // Create table data
  const tableData = records.map((record, index) => [
    index + 1,
    typeof record.room === "string" ? record.room : record.room.name,
    record.supervisors ? record.supervisors.join(", ") : "",
  ])

  // Add table
  ;(doc as any).autoTable({
    head: [["الرقم", "القاعة", "الحراس"]],
    body: tableData,
    startY: 85,
    theme: "grid",
    styles: { font: "Cairo", halign: "right", fontSize: 10 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
    columnStyles: {
      0: { halign: "center", cellWidth: 15 },
      1: { cellWidth: 40 },
      2: { cellWidth: 120 },
    },
  })

  // Add signature
  const finalY = (doc as any).lastAutoTable.finalY + 20
  doc.text(settings.principalName || "مدير المؤسسة", 190, finalY)
  doc.text("الختم والإمضاء", 190, finalY + 25)

  // Add date
  const today = new Date()
  const dateStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`
  doc.text(`تاريخ الإصدار: ${dateStr}`, 20, doc.internal.pageSize.height - 10)

  return doc
}

// Generate absence PDF for official exams
export function generateOfficialAbsencePDF(absences: AbsenceRecord[]): jsPDF {
  console.log("Generating official absence PDF")

  // Get settings from the store
  const settings = getOfficialSettings()

  // Validate settings
  if (!validateSettings(settings)) {
    console.warn("Invalid settings for PDF generation")
  }

  // Create PDF document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  // Set right-to-left mode
  doc.setR2L(true)

  // Add header
  doc.setFont("Cairo", "bold")
  doc.setFontSize(16)
  doc.text("الجمهورية الجزائرية الديمقراطية الشعبية", 105, 10, { align: "center" })
  doc.text("وزارة التربية الوطنية", 105, 18, { align: "center" })
  doc.text("الديوان الوطني للامتحانات و المسابقات", 105, 26, { align: "center" })

  // Add school info
  doc.setFontSize(14)
  doc.text(settings.schoolName || "", 105, 34, { align: "center" })
  doc.text(`السنة الدراسية: ${settings.academicYear || ""}`, 105, 42, { align: "center" })

  // Add document title
  doc.setFontSize(18)
  doc.text(`سجل الغيابات - ${settings.examSession || ""}`, 105, 52, { align: "center" })

  // Add date range
  doc.setFontSize(12)
  const dateText =
    settings.startDate && settings.endDate
      ? `الفترة من ${settings.startDate} إلى ${settings.endDate}`
      : "الفترة: غير محددة"
  doc.text(dateText, 105, 60, { align: "center" })

  // Add exam info
  doc.setFontSize(12)
  doc.text(`امتحان ${settings.examSession || ""} ${settings.academicYear || ""}`, 20, 70)
  doc.text(`رمز المركز: ${settings.centerCode || ""}`, 190, 70, { align: "right" })
  doc.text(`مركز الامتحان: ${settings.centerName || settings.schoolName || ""}`, 20, 78)

  // Create table data
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

  // Add table
  ;(doc as any).autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 85,
    styles: { font: "Cairo", halign: "right", fontSize: 10 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
  })

  // Add signature
  const finalY = (doc as any).lastAutoTable.finalY + 20
  doc.text(settings.principalName || "مدير المؤسسة", 190, finalY)
  doc.text("الختم والإمضاء", 190, finalY + 25)

  // Add date
  const today = new Date()
  const dateStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`
  doc.text(`تاريخ الإصدار: ${dateStr}`, 20, doc.internal.pageSize.height - 10)

  return doc
}

// Generate absence PDF for semester exams
export function generateSemesterAbsencePDF(absences: AbsenceRecord[]): jsPDF {
  console.log("Generating semester absence PDF")

  // Get settings from the store
  const settings = getSemesterSettings()

  // Validate settings
  if (!validateSettings(settings)) {
    console.warn("Invalid settings for PDF generation")
  }

  // Create PDF document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  // Set right-to-left mode
  doc.setR2L(true)

  // Add header
  doc.setFont("Cairo", "bold")
  doc.setFontSize(16)
  doc.text("الجمهورية الجزائرية الديمقراطية الشعبية", 105, 10, { align: "center" })
  doc.text("وزارة التربية الوطنية", 105, 18, { align: "center" })

  // Add school info
  doc.setFontSize(14)
  doc.text(settings.schoolName || "", 105, 26, { align: "center" })
  doc.text(`السنة الدراسية: ${settings.academicYear || ""}`, 105, 34, { align: "center" })

  // Add document title
  doc.setFontSize(18)
  doc.text(`سجل الغيابات - ${settings.examSession || ""}`, 105, 45, { align: "center" })

  // Add date range
  doc.setFontSize(12)
  const dateText =
    settings.startDate && settings.endDate
      ? `الفترة من ${settings.startDate} إلى ${settings.endDate}`
      : "الفترة: غير محددة"
  doc.text(dateText, 105, 55, { align: "center" })

  // Add exam info
  doc.setFontSize(12)
  doc.text(`امتحان ${settings.examSession || ""} ${settings.academicYear || ""}`, 20, 65)
  doc.text(`مركز الامتحان: ${settings.centerName || settings.schoolName || ""}`, 20, 73)

  // Create table data
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

  // Add table
  ;(doc as any).autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 85,
    styles: { font: "Cairo", halign: "right", fontSize: 10 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
  })

  // Add signature
  const finalY = (doc as any).lastAutoTable.finalY + 20
  doc.text(settings.principalName || "مدير المؤسسة", 190, finalY)
  doc.text("الختم والإمضاء", 190, finalY + 25)

  // Add date
  const today = new Date()
  const dateStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`
  doc.text(`تاريخ الإصدار: ${dateStr}`, 20, doc.internal.pageSize.height - 10)

  return doc
}

// Download PDF helper function
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

