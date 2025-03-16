import jsPDF from "jspdf"
import "jspdf-autotable"
import { getSemesterSettings, getBasicSettings } from "@/lib/settings-utils"

// Define the SupervisionRecord type if not imported
export type SupervisionRecord = {
  room: string | { name: string; type: string }
  mainSupervisor?: string
  secondSupervisor?: string
  thirdSupervisor?: string
  supervisors?: string[]
}

export const generateSupervisionPDF = (records: SupervisionRecord[], day: string, period: string) => {
  // استرجاع إعدادات الامتحانات الفصلية والإعدادات الأساسية
  const semesterSettings = getSemesterSettings()
  const basicSettings = getBasicSettings()

  // Create a new PDF document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  // Set right-to-left mode
  doc.setR2L(true)

  // إضافة الترويسة
  doc.setFont("Cairo", "bold")

  // Add header
  doc.setFontSize(16)
  doc.text("الجمهورية الجزائرية الديمقراطية الشعبية", doc.internal.pageSize.width / 2, 20, { align: "center" })
  doc.setFontSize(14)
  doc.text("وزارة التربية الوطنية", doc.internal.pageSize.width / 2, 30, { align: "center" })

  // استخدام بيانات الإعدادات
  doc.setFontSize(14)
  doc.text(`${basicSettings.institutionName || "المؤسسة التعليمية"}`, doc.internal.pageSize.width / 2, 40, {
    align: "center",
  })
  doc.text(
    `السنة الدراسية: ${basicSettings.academicYear || new Date().getFullYear()}`,
    doc.internal.pageSize.width / 2,
    48,
    { align: "center" },
  )

  // عنوان المستند
  doc.setFontSize(18)
  doc.text(
    `جدول توزيع الحراسة - ${semesterSettings.examSession || "الامتحانات الفصلية"}`,
    doc.internal.pageSize.width / 2,
    58,
    { align: "center" },
  )

  // معلومات الفترة الزمنية
  doc.setFontSize(12)
  const dateText =
    semesterSettings.startDate && semesterSettings.endDate
      ? `الفترة من ${semesterSettings.startDate} إلى ${semesterSettings.endDate}`
      : "الفترة: غير محددة"
  doc.text(dateText, doc.internal.pageSize.width / 2, 66, { align: "center" })

  // Add exam info
  doc.setFontSize(12)
  doc.text(`امتحانات ${semesterSettings.semester || "الفصل الدراسي"}`, 20, 74)
  doc.text(`المستوى: ${semesterSettings.academicLevel || "جميع المستويات"}`, doc.internal.pageSize.width - 20, 74, {
    align: "right",
  })
  doc.text(`الفترة ${period === "morning" ? "الصباحية" : "المسائية"}`, doc.internal.pageSize.width - 20, 82, {
    align: "right",
  })

  // Add title
  doc.setFontSize(16)
  doc.text("جدول توزيع الأساتذة للحراسة", doc.internal.pageSize.width / 2, 92, { align: "center" })

  // Add day info
  doc.setFontSize(12)
  doc.text(`اليوم: ${day}`, doc.internal.pageSize.width / 2, 100, { align: "center" })

  // Create table
  const tableData = records.map((record, index) => {
    const roomName = typeof record.room === "string" ? record.room : record.room.name

    if (record.supervisors) {
      // Handle new format with supervisors array
      return [
        index + 1,
        roomName,
        record.supervisors[0] || "",
        record.supervisors[1] || "",
        record.supervisors[2] || "",
      ]
    } else {
      // Handle old format with individual supervisor fields
      return [
        index + 1,
        roomName,
        record.mainSupervisor || "",
        record.secondSupervisor || "",
        record.thirdSupervisor || "",
      ]
    }
  })

  // @ts-ignore - jspdf-autotable is not properly typed
  doc.autoTable({
    startY: 108,
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
  doc.text(`${basicSettings.directorName || "مدير المؤسسة"}`, doc.internal.pageSize.width - 30, finalY)
  doc.text("الختم والإمضاء", doc.internal.pageSize.width - 30, finalY + 25)

  // Add date
  const today = new Date()
  const dateStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`
  doc.text(`تاريخ الإصدار: ${dateStr}`, 20, doc.internal.pageSize.height - 10)

  // Add page number
  doc.text(`الصفحة 1 من 1`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10, { align: "right" })

  return doc
}

export const downloadPDF = (records: SupervisionRecord[], day: string, period: string) => {
  try {
    const doc = generateSupervisionPDF(records, day, period)
    const filename = `جدول_الحراسة_${day}_${period === "morning" ? "صباحا" : "مساء"}.pdf`

    // Save the PDF
    doc.save(filename)

    return true
  } catch (error) {
    console.error("Error generating PDF:", error)
    return false
  }
}

