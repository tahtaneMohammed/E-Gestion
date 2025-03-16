import { jsPDF } from "jspdf"
import "jspdf-autotable"
import { getOfficialSettings, getBasicSettings } from "@/lib/settings-utils"

export type AbsenceRecord = {
  firstName: string
  lastName: string
  className: string
  absenceDate: string
  reason: string
}

export function generatePDF(absencesData: AbsenceRecord[]) {
  // استرجاع إعدادات الامتحانات الرسمية والإعدادات الأساسية
  const officialSettings = getOfficialSettings()
  const basicSettings = getBasicSettings()

  // إنشاء مستند PDF جديد
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  // Set right-to-left mode
  doc.setR2L(true)

  // إضافة الترويسة
  doc.setFont("Cairo", "bold")
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
    `سجل الغيابات - ${officialSettings.examSession || "الامتحانات الرسمية"}`,
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

  // إعدادات الجدول
  const tableColumn = ["الرقم", "الاسم", "اللقب", "القسم", "تاريخ الغياب", "السبب"]
  const tableRows = absencesData.map((absence, index) => [
    index + 1,
    absence.firstName,
    absence.lastName,
    absence.className,
    absence.absenceDate,
    absence.reason,
  ])

  // إضافة الجدول
  ;(doc as any).autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 100,
    theme: "grid",
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
    },
    styles: {
      font: "Cairo",
      halign: "right",
      fontSize: 10,
      cellPadding: 5,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 15 },
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

  // حفظ ملف PDF
  const filename = `سجل_الغيابات_${new Date().toISOString().split("T")[0]}.pdf`
  doc.save(filename)

  return doc
}

