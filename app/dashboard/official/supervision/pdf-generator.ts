import jsPDF from "jspdf"
import "jspdf-autotable"
import { getOfficialSettings, getBasicSettings } from "@/lib/settings-utils"

// Define the SupervisionRecord type if not imported
export type SupervisionRecord = {
  room: string
  mainSupervisor: string
  secondSupervisor: string
  thirdSupervisor: string
}

export const generateSupervisionPDF = (records: SupervisionRecord[], day: string, period: string) => {
  // استرجاع إعدادات الامتحانات الرسمية والإعدادات الأساسية
  const officialSettings = getOfficialSettings()
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
  doc.text("الديوان الوطني للامتحانات و المسابقات", doc.internal.pageSize.width / 2, 40, { align: "center" })

  // استخدام بيانات الإعدادات
  doc.setFontSize(14)
  doc.text(`${basicSettings.institutionName || "المؤسسة التعليمية"}`, doc.internal.pageSize.width / 2, 50, {
    align: "center",
  })
  doc.text(
    `السنة الدراسية: ${basicSettings.academicYear || new Date().getFullYear()}`,
    doc.internal.pageSize.width / 2,
    58,
    { align: "center" },
  )

  // عنوان المستند
  doc.setFontSize(18)
  doc.text(
    `جدول توزيع الحراسة - ${officialSettings.examSession || "الامتحانات الرسمية"}`,
    doc.internal.pageSize.width / 2,
    68,
    { align: "center" },
  )

  // معلومات الفترة الزمنية
  doc.setFontSize(12)
  const dateText =
    officialSettings.startDate && officialSettings.endDate
      ? `الفترة من ${officialSettings.startDate} إلى ${officialSettings.endDate}`
      : "الفترة: غير محددة"
  doc.text(dateText, doc.internal.pageSize.width / 2, 76, { align: "center" })

  // Add exam info
  doc.setFontSize(12)
  doc.text(
    `امتحان ${officialSettings.examType || "شهادة البكالوريا"} دورة ${officialSettings.examSession || "جوان 2025"}`,
    20,
    84,
  )
  doc.text(`رمز المركز: ${officialSettings.centerCode || "غير محدد"}`, doc.internal.pageSize.width - 20, 84, {
    align: "right",
  })
  doc.text(`مركز الامتحان: ${officialSettings.examCenter || "غير محدد"}`, 20, 92)
  doc.text(`الفترة ${period === "morning" ? "الصباحية" : "المسائية"}`, doc.internal.pageSize.width - 20, 92, {
    align: "right",
  })

  // Add title
  doc.setFontSize(16)
  doc.text("جدول توزيع الأساتذة للحراسة", doc.internal.pageSize.width / 2, 102, { align: "center" })

  // Add day info
  doc.setFontSize(12)
  doc.text(`اليوم: ${day}`, doc.internal.pageSize.width / 2, 110, { align: "center" })

  // Create table
  const tableData = records.map((record, index) => [
    index + 1,
    record.room,
    record.mainSupervisor,
    record.secondSupervisor,
    record.thirdSupervisor,
  ])

  // @ts-ignore - jspdf-autotable is not properly typed
  doc.autoTable({
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
  doc.text(`${officialSettings.centerManager || "رئيس المركز"}`, doc.internal.pageSize.width - 30, finalY)
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

