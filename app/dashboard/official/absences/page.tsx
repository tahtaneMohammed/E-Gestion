"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Clock, Printer, Search, UserX, Users, BarChart, ChevronLeft, ChevronRight } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getOfficialSettings, getBasicSettings } from "@/lib/settings-utils"
import { generateExamDays } from "@/lib/date-utils"

// Types
type AbsenceType = "absent" | "late" | "present"
type AbsenceRecord = {
  id: string
  name: string
  status: AbsenceType
  date: string
  period: "morning" | "evening"
  type: "student" | "teacher"
  notes?: string
}

type Student = {
  id: string
  name: string
  class: string
  examNumber: string
}

type Teacher = {
  id: string
  name: string
  subject: string
}

// Tipo para los días de examen
type ExamDay = {
  day: string
  date: string
}

export default function OfficialAbsencesPage() {
  const settings = getOfficialSettings()
  const basicSettings = getBasicSettings()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<"students" | "teachers">("students")
  const [searchQuery, setSearchQuery] = useState("")
  const [examDays, setExamDays] = useState<ExamDay[]>([])
  const [selectedDay, setSelectedDay] = useState<string>("")
  const [selectedPeriod, setSelectedPeriod] = useState<"morning" | "evening">("morning")
  const [students, setStudents] = useState<Student[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [savedAbsences, setSavedAbsences] = useState<AbsenceRecord[]>([])
  const [isPdfLoading, setIsPdfLoading] = useState(false)
  const [absenceFilter, setAbsenceFilter] = useState<"all" | "students" | "teachers">("all")

  // Paginación
  const [currentStudentPage, setCurrentStudentPage] = useState(1)
  const [currentTeacherPage, setCurrentTeacherPage] = useState(1)
  const itemsPerPage = 20

  // Filtros para el PDF
  const [pdfDay, setPdfDay] = useState<string>("")
  const [pdfPeriod, setPdfPeriod] = useState<"all" | "morning" | "evening">("all")
  const [pdfType, setPdfType] = useState<"all" | "students" | "teachers">("all")
  const [showPdfDialog, setShowPdfDialog] = useState(false)

  // Estadísticas
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    studentAbsences: 0,
    teacherAbsences: 0,
    studentLates: 0,
    teacherLates: 0,
  })

  // Cargar los días de examen
  useEffect(() => {
    const days = generateExamDays(settings.startDate, settings.endDate)
    setExamDays(days)

    // Establecer el primer día como valor predeterminado
    if (days.length > 0 && !selectedDay) {
      setSelectedDay(`${days[0].day} ${days[0].date}`)
      setPdfDay(`${days[0].day} ${days[0].date}`)
    }
  }, [settings.startDate, settings.endDate, selectedDay])

  // Cargar datos
  useEffect(() => {
    const loadData = () => {
      setIsLoading(true)

      try {
        // Intentar cargar datos del archivo Excel importado
        const savedData = localStorage.getItem("importedData")

        if (savedData) {
          const parsedData = JSON.parse(savedData)

          // Verificar si los datos son recientes (menos de 24 horas)
          const isRecent = Date.now() - parsedData.timestamp < 24 * 60 * 60 * 1000

          if (isRecent) {
            // Cargar profesores de los datos importados
            if (parsedData.teachers && parsedData.teachers.length > 0) {
              const importedTeachers: Teacher[] = parsedData.teachers.map((teacher: any, index: number) => ({
                id: `t${index + 1}`,
                name: teacher.name,
                subject: teacher.subject || "غير محدد",
              }))

              setTeachers(importedTeachers)
            } else {
              // Usar datos de ejemplo si no se encuentran profesores
              loadSampleTeachers()
            }

            // Cargar estudiantes de los datos importados
            if (parsedData.students && parsedData.students.length > 0) {
              const importedStudents: Student[] = parsedData.students.map((student: any, index: number) => ({
                id: `s${index + 1}`,
                name: student.name,
                class: student.class || "غير محدد",
                examNumber: `${2024000 + index + 1}`,
              }))

              setStudents(importedStudents)
            } else {
              // Usar datos de ejemplo si no se encuentran estudiantes
              loadSampleStudents()
            }

            toast({
              title: "تم تحميل البيانات",
              description: "تم تحميل بيانات الأساتذة والمترشحين من ملف الإكسل المستورد",
            })
          } else {
            // Los datos no son recientes, usar datos de ejemplo
            loadSampleStudents()
            loadSampleTeachers()
          }
        } else {
          // No se encontraron datos importados, usar datos de ejemplo
          loadSampleStudents()
          loadSampleTeachers()
        }

        // Verificar si tenemos ausencias guardadas en localStorage
        const savedAbsencesData = localStorage.getItem("officialAbsences")
        if (savedAbsencesData) {
          const absences = JSON.parse(savedAbsencesData)
          setSavedAbsences(absences)
        }
      } catch (error) {
        console.error("Error loading data:", error)
        loadSampleStudents()
        loadSampleTeachers()
      } finally {
        setIsLoading(false)
      }
    }

    // Función para cargar datos de estudiantes de ejemplo
    const loadSampleStudents = () => {
      const sampleStudents: Student[] = Array.from({ length: 50 }, (_, i) => ({
        id: `s${i + 1}`,
        name: `مترشح ${i + 1}`,
        class: `القسم ${Math.floor(i / 5) + 1}`,
        examNumber: `${2024000 + i + 1}`,
      }))

      setStudents(sampleStudents)
    }

    // Función para cargar datos de profesores de ejemplo
    const loadSampleTeachers = () => {
      const sampleTeachers: Teacher[] = Array.from({ length: 40 }, (_, i) => ({
        id: `t${i + 1}`,
        name: `أستاذ ${i + 1}`,
        subject: ["الرياضيات", "الفيزياء", "العلوم الطبيعية", "اللغة العربية", "اللغة الإنجليزية"][i % 5],
      }))

      setTeachers(sampleTeachers)
    }

    loadData()
  }, [toast, settings.startDate, settings.endDate])

  // Actualizar estadísticas cuando cambian los datos
  useEffect(() => {
    const studentAbsences = savedAbsences.filter((a) => a.type === "student" && a.status === "absent").length
    const teacherAbsences = savedAbsences.filter((a) => a.type === "teacher" && a.status === "absent").length
    const studentLates = savedAbsences.filter((a) => a.type === "student" && a.status === "late").length
    const teacherLates = savedAbsences.filter((a) => a.type === "teacher" && a.status === "late").length

    setStats({
      totalStudents: students.length,
      totalTeachers: teachers.length,
      studentAbsences,
      teacherAbsences,
      studentLates,
      teacherLates,
    })
  }, [savedAbsences, students, teachers])

  // Filtrar estudiantes/profesores según la consulta de búsqueda
  const filteredStudents = students.filter(
    (student) =>
      student.name.includes(searchQuery) ||
      student.class.includes(searchQuery) ||
      student.examNumber.includes(searchQuery),
  )

  const filteredTeachers = teachers.filter(
    (teacher) => teacher.name.includes(searchQuery) || teacher.subject.includes(searchQuery),
  )

  // Paginación
  const totalStudentPages = Math.ceil(filteredStudents.length / itemsPerPage)
  const totalTeacherPages = Math.ceil(filteredTeachers.length / itemsPerPage)

  const paginatedStudents = filteredStudents.slice(
    (currentStudentPage - 1) * itemsPerPage,
    currentStudentPage * itemsPerPage,
  )

  const paginatedTeachers = filteredTeachers.slice(
    (currentTeacherPage - 1) * itemsPerPage,
    currentTeacherPage * itemsPerPage,
  )

  // Filtrar ausencias guardadas según el filtro seleccionado
  const filteredAbsences = savedAbsences.filter((absence) => {
    if (absenceFilter === "students") return absence.type === "student"
    if (absenceFilter === "teachers") return absence.type === "teacher"
    return true // Mostrar todas las ausencias
  })

  // Marcar estudiante como ausente
  const markStudentAbsent = (student: Student) => {
    const newAbsence: AbsenceRecord = {
      id: `abs_${Date.now()}_${student.id}`,
      name: student.name,
      status: "absent",
      date: selectedDay,
      period: selectedPeriod,
      type: "student",
      notes: `رقم الامتحان: ${student.examNumber}`,
    }

    const updatedAbsences = [...savedAbsences, newAbsence]
    setSavedAbsences(updatedAbsences)
    localStorage.setItem("officialAbsences", JSON.stringify(updatedAbsences))

    toast({
      title: "تم تسجيل الغياب",
      description: `تم تسجيل غياب ${student.name} بنجاح`,
    })
  }

  // Marcar estudiante como retrasado
  const markStudentLate = (student: Student) => {
    const newAbsence: AbsenceRecord = {
      id: `abs_${Date.now()}_${student.id}`,
      name: student.name,
      status: "late",
      date: selectedDay,
      period: selectedPeriod,
      type: "student",
      notes: `رقم الامتحان: ${student.examNumber}`,
    }

    const updatedAbsences = [...savedAbsences, newAbsence]
    setSavedAbsences(updatedAbsences)
    localStorage.setItem("officialAbsences", JSON.stringify(updatedAbsences))

    toast({
      title: "تم تسجيل التأخر",
      description: `تم تسجيل تأخر ${student.name} بنجاح`,
    })
  }

  // Marcar profesor como ausente
  const markTeacherAbsent = (teacher: Teacher) => {
    const newAbsence: AbsenceRecord = {
      id: `abs_${Date.now()}_${teacher.id}`,
      name: teacher.name,
      status: "absent",
      date: selectedDay,
      period: selectedPeriod,
      type: "teacher",
      notes: `مادة: ${teacher.subject}`,
    }

    const updatedAbsences = [...savedAbsences, newAbsence]
    setSavedAbsences(updatedAbsences)
    localStorage.setItem("officialAbsences", JSON.stringify(updatedAbsences))

    toast({
      title: "تم تسجيل الغياب",
      description: `تم تسجيل غياب ${teacher.name} بنجاح`,
    })
  }

  // Marcar profesor como retrasado
  const markTeacherLate = (teacher: Teacher) => {
    const newAbsence: AbsenceRecord = {
      id: `abs_${Date.now()}_${teacher.id}`,
      name: teacher.name,
      status: "late",
      date: selectedDay,
      period: selectedPeriod,
      type: "teacher",
      notes: `مادة: ${teacher.subject}`,
    }

    const updatedAbsences = [...savedAbsences, newAbsence]
    setSavedAbsences(updatedAbsences)
    localStorage.setItem("officialAbsences", JSON.stringify(updatedAbsences))

    toast({
      title: "تم تسجيل التأخر",
      description: `تم تسجيل تأخر ${teacher.name} بنجاح`,
    })
  }

  // Generar informe de ausencias
  const generateReport = () => {
    setIsPdfLoading(true)

    if (savedAbsences.length === 0) {
      toast({
        title: "لا توجد غيابات",
        description: "لا توجد غيابات مسجلة لإنشاء التقرير",
        variant: "destructive",
      })
      setIsPdfLoading(false)
      return
    }

    try {
      // Crear una nueva ventana para imprimir
      const printWindow = window.open("", "_blank")

      if (!printWindow) {
        toast({
          title: "خطأ في فتح نافذة الطباعة",
          description: "يرجى السماح بفتح النوافذ المنبثقة في المتصفح",
          variant: "destructive",
        })
        setIsPdfLoading(false)
        return
      }

      // Filtrar ausencias según los criterios seleccionados
      let filteredAbsencesForPdf = [...savedAbsences]

      // Filtrar por día si se seleccionó uno específico
      if (pdfDay) {
        filteredAbsencesForPdf = filteredAbsencesForPdf.filter((absence) => absence.date === pdfDay)
      }

      // Filtrar por período si se seleccionó uno específico
      if (pdfPeriod !== "all") {
        filteredAbsencesForPdf = filteredAbsencesForPdf.filter((absence) => absence.period === pdfPeriod)
      }

      // Filtrar por tipo si se seleccionó uno específico
      if (pdfType !== "all") {
        filteredAbsencesForPdf = filteredAbsencesForPdf.filter((absence) => absence.type === pdfType)
      }

      // Filtrar ausencias por tipo
      const studentAbsences = filteredAbsencesForPdf.filter((a) => a.type === "student")
      const teacherAbsences = filteredAbsencesForPdf.filter((a) => a.type === "teacher")

      // Calcular estadísticas
      const studentAbsenceCount = studentAbsences.filter((a) => a.status === "absent").length
      const studentLateCount = studentAbsences.filter((a) => a.status === "late").length
      const teacherAbsenceCount = teacherAbsences.filter((a) => a.status === "absent").length
      const teacherLateCount = teacherAbsences.filter((a) => a.status === "late").length

      // Generar el título del informe según los filtros
      const reportTitle = "محضر الغيابات - امتحان شهادة البكالوريا"
      let reportSubtitle = ""

      if (pdfDay) {
        reportSubtitle += `يوم: ${pdfDay} `
      }

      if (pdfPeriod !== "all") {
        reportSubtitle += `الفترة: ${pdfPeriod === "morning" ? "الصباحية" : "المسائية"} `
      }

      if (pdfType !== "all") {
        reportSubtitle += `النوع: ${pdfType === "students" ? "المترشحين" : "الأساتذة"}`
      }

      // Generar el contenido HTML para el PDF
      const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <title>محضر الغيابات - امتحان شهادة البكالوريا</title>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap');
          
          body {
            font-family: 'Tajawal', Arial, sans-serif;
            margin: 15mm;
            padding: 0;
            direction: rtl;
            font-size: 14px;
            line-height: 1.3;
            letter-spacing: -0.2px;
          }
          
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          
          .header h1 {
            font-size: 18px;
            margin: 3px 0;
            font-weight: 700;
          }
          
          .header h2 {
            font-size: 16px;
            margin: 3px 0;
            font-weight: 500;
          }
          
          .info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 25px;
            border: 1px solid #eee;
            padding: 10px;
            border-radius: 5px;
            background-color: #f9f9f9;
          }
          
          .info-item {
            margin-bottom: 3px;
            font-size: 13px;
          }
          
          .title {
            text-align: center;
            font-size: 18px;
            font-weight: 700;
            margin: 25px 0 5px;
            color: #2563eb;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 5px;
            width: 70%;
            margin-left: auto;
            margin-right: auto;
          }
          
          .subtitle {
            text-align: center;
            font-size: 14px;
            margin: 0 0 25px;
            color: #4b5563;
          }
          
          .section-subtitle {
            font-size: 16px;
            font-weight: 700;
            margin: 15px 0;
            color: #1e40af;
            border-bottom: 1px solid #1e40af;
            padding-bottom: 3px;
            display: inline-block;
          }
          
          .stats-container {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            flex-wrap: wrap;
          }
          
          .stat-box {
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 10px;
            margin-bottom: 10px;
            background-color: #f9f9f9;
            width: calc(25% - 10px);
            box-sizing: border-box;
            text-align: center;
          }
          
          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
          }
          
          .stat-label {
            font-size: 12px;
            color: #666;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            margin-bottom: 30px;
            font-size: 13px;
          }
          
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: center;
          }
          
          th {
            background-color: #f2f2f2;
            font-weight: 700;
            color: #333;
          }
          
          .absent {
            color: #e11d48;
            font-weight: bold;
          }
          
          .late {
            color: #ca8a04;
            font-weight: bold;
          }
          
          .signature {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
          }
          
          .signature-item {
            text-align: center;
          }
          
          .signature-line {
            margin-top: 30px;
            border-top: 1px solid #000;
            width: 120px;
            display: inline-block;
          }
          
          .footer {
            margin-top: 30px;
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: #666;
          }
          
          @media print {
            body {
              margin: 10mm;
            }
            
            .print-button {
              display: none !important;
            }
          }
          
          .print-button {
            background-color: #2563eb;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            margin: 20px auto;
            display: block;
            font-family: 'Tajawal', Arial, sans-serif;
          }
          
          .print-button:hover {
            background-color: #1d4ed8;
          }
          
          .no-data {
            text-align: center;
            padding: 20px;
            color: #666;
            font-style: italic;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>الجمهورية الجزائرية الديمقراطية الشعبية</h1>
          <h2>وزارة التربية الوطنية</h2>
          <h2>الديوان الوطني للامتحانات و المسابقات</h2>
        </div>
        
        <div class="info">
          <div>
            <div class="info-item"><strong>امتحان شهادة البكالوريا دورة ${settings.examSession || "جوان 2025"}</strong></div>
            <div class="info-item"><strong>مركز الامتحان:</strong> ${settings.examCenter || "ثانوية الأمير عبد القادر"}</div>
            <div class="info-item"><strong>رمز المركز:</strong> ${settings.centerCode || "12345"}</div>
          </div>
          <div>
            <div class="info-item"><strong>تاريخ التقرير:</strong> ${new Date().toLocaleDateString("ar-DZ")}</div>
            <div class="info-item"><strong>الفترة:</strong> ${settings.startDate} - ${settings.endDate}</div>
          </div>
        </div>
        
        <div class="title">${reportTitle}</div>
        ${reportSubtitle ? `<div class="subtitle">${reportSubtitle}</div>` : ""}
        
        <div class="stats-container">
          <div class="stat-box">
            <div class="stat-value">${studentAbsenceCount}</div>
            <div class="stat-label">غياب المترشحين</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${studentLateCount}</div>
            <div class="stat-label">تأخر المترشحين</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${teacherAbsenceCount}</div>
            <div class="stat-label">غياب الأساتذة</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${teacherLateCount}</div>
            <div class="stat-label">تأخر الأساتذة</div>
          </div>
        </div>
        
        ${
          pdfType === "all" || pdfType === "students"
            ? `
        <div class="section-subtitle">سجل غياب المترشحين</div>
        
        ${
          studentAbsences.length > 0
            ? `
        <table>
          <thead>
            <tr>
              <th>الرقم</th>
              <th>اسم المترشح</th>
              <th>رقم الامتحان</th>
              <th>التاريخ</th>
              <th>الفترة</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            ${studentAbsences
              .map(
                (absence, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${absence.name}</td>
                <td>${absence.notes?.replace("رقم الامتحان: ", "") || "-"}</td>
                <td>${absence.date}</td>
                <td>${absence.period === "morning" ? "الصباحية" : "المسائية"}</td>
                <td class="${absence.status === "absent" ? "absent" : "late"}">${absence.status === "absent" ? "غائب" : "متأخر"}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
        `
            : '<div class="no-data">لا توجد غيابات مسجلة للمترشحين</div>'
        }
        `
            : ""
        }
        
        ${
          pdfType === "all" || pdfType === "teachers"
            ? `
        <div class="section-subtitle">سجل غياب الأساتذة</div>
        
        ${
          teacherAbsences.length > 0
            ? `
        <table>
          <thead>
            <tr>
              <th>الرقم</th>
              <th>اسم الأستاذ</th>
              <th>المادة</th>
              <th>التاريخ</th>
              <th>الفترة</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            ${teacherAbsences
              .map(
                (absence, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${absence.name}</td>
                <td>${absence.notes?.replace("مادة: ", "") || "-"}</td>
                <td>${absence.date}</td>
                <td>${absence.period === "morning" ? "الصباحية" : "المسائية"}</td>
                <td class="${absence.status === "absent" ? "absent" : "late"}">${absence.status === "absent" ? "غائب" : "متأخر"}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
        `
            : '<div class="no-data">لا توجد غيابات مسجلة للأساتذة</div>'
        }
        `
            : ""
        }
        
        <div class="signature">
          <div class="signature-item">
            <div><strong>${settings.centerManager || "رئيس المركز"}</strong></div>
            <div class="signature-line"></div>
          </div>
          <div class="signature-item">
            <div><strong>الختم والإمضاء</strong></div>
            <div class="signature-line"></div>
          </div>
        </div>
        
        <div class="footer">
          <div>تاريخ الإصدار: ${new Date().toLocaleDateString("ar-DZ")}</div>
          <div>الصفحة 1 من 1</div>
        </div>
        
        <button class="print-button" onclick="window.print(); return false;">طباعة المحضر</button>
      </body>
      </html>
      `

      // Escribir el contenido HTML en la nueva ventana
      printWindow.document.write(htmlContent)
      printWindow.document.close()

      // Enfocar la ventana para imprimir
      printWindow.focus()

      // Crear entrada de documento para guardar en impresiones organizativas
      setTimeout(() => {
        toast({
          title: "تم إنشاء المحضر",
          description: "تم إنشاء محضر الغياب بنجاح",
        })
        setShowPdfDialog(false)
      }, 1500)
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "خطأ في إنشاء المحضر",
        description: "حدث خطأ أثناء إنشاء محضر الغياب",
        variant: "destructive",
      })
    } finally {
      setIsPdfLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center mb-6">
          <Link href="/dashboard/official">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold mr-4">تسيير الغيابات - امتحان شهادة البكالوريا</h1>
        </header>

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white shadow hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 text-blue-500 mr-2" />
                المترشحين
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalStudents}</div>
              <div className="flex items-center justify-between mt-2">
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  {stats.studentAbsences} غائب
                </Badge>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  {stats.studentLates} متأخر
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 text-purple-500 mr-2" />
                الأساتذة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalTeachers}</div>
              <div className="flex items-center justify-between mt-2">
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  {stats.teacherAbsences} غائب
                </Badge>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  {stats.teacherLates} متأخر
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <UserX className="h-5 w-5 text-red-500 mr-2" />
                الغيابات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{savedAbsences.length}</div>
              <div className="flex items-center justify-between mt-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {savedAbsences.filter((a) => a.status === "absent").length} غائب
                </Badge>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  {savedAbsences.filter((a) => a.status === "late").length} متأخر
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <BarChart className="h-5 w-5 text-green-500 mr-2" />
                الإحصائيات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <div className="flex justify-between mb-1">
                  <span>نسبة الغياب:</span>
                  <span className="font-bold">
                    {stats.totalStudents > 0 ? Math.round((stats.studentAbsences / stats.totalStudents) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>نسبة التأخر:</span>
                  <span className="font-bold">
                    {stats.totalStudents > 0 ? Math.round((stats.studentLates / stats.totalStudents) * 100) : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="exam-day">يوم الامتحان</Label>
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger id="exam-day" className="bg-white">
                  <SelectValue placeholder="اختر يوم الامتحان" />
                </SelectTrigger>
                <SelectContent>
                  {examDays.map((day) => (
                    <SelectItem key={`${day.day}-${day.date}`} value={`${day.day} ${day.date}`}>
                      {day.day} {day.date}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="exam-period">فترة الامتحان</Label>
              <Select value={selectedPeriod} onValueChange={(value: "morning" | "evening") => setSelectedPeriod(value)}>
                <SelectTrigger id="exam-period" className="bg-white">
                  <SelectValue placeholder="اختر فترة الامتحان" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">صباحية</SelectItem>
                  <SelectItem value="evening">مسائية</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="search">بحث</Label>
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="بحث عن اسم أو رقم..."
                  className="pr-9 bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pestañas para alternar entre estudiantes y profesores */}
        <div className="bg-white rounded-lg shadow mb-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "students" | "teachers")}>
            <TabsList className="w-full border-b">
              <TabsTrigger value="students" className="flex-1 py-3">
                <Users className="h-5 w-5 mr-2" />
                المترشحين
              </TabsTrigger>
              <TabsTrigger value="teachers" className="flex-1 py-3">
                <Users className="h-5 w-5 mr-2" />
                الأساتذة
              </TabsTrigger>
            </TabsList>

            <TabsContent value="students" className="p-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredStudents.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">الرقم</TableHead>
                          <TableHead>اسم المترشح</TableHead>
                          <TableHead>القسم</TableHead>
                          <TableHead>رقم الامتحان</TableHead>
                          <TableHead className="text-center">الإجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedStudents.map((student, index) => (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">
                              {(currentStudentPage - 1) * itemsPerPage + index + 1}
                            </TableCell>
                            <TableCell>{student.name}</TableCell>
                            <TableCell>{student.class}</TableCell>
                            <TableCell>{student.examNumber}</TableCell>
                            <TableCell>
                              <div className="flex justify-center gap-2">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => markStudentAbsent(student)}
                                  className="h-9"
                                >
                                  <UserX className="h-4 w-4 mr-1" />
                                  غائب
                                </Button>
                                <Button
                                  variant="warning"
                                  size="sm"
                                  onClick={() => markStudentLate(student)}
                                  className="h-9 bg-amber-500 hover:bg-amber-600"
                                >
                                  <Clock className="h-4 w-4 mr-1" />
                                  متأخر
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Paginación para estudiantes */}
                  {totalStudentPages > 1 && (
                    <div className="flex items-center justify-center space-x-2 space-x-reverse mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentStudentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentStudentPage === 1}
                      >
                        <ChevronRight className="h-4 w-4" />
                        السابق
                      </Button>
                      <div className="text-sm">
                        الصفحة {currentStudentPage} من {totalStudentPages}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentStudentPage((prev) => Math.min(prev + 1, totalStudentPages))}
                        disabled={currentStudentPage === totalStudentPages}
                      >
                        التالي
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">لا توجد نتائج مطابقة لبحثك</div>
              )}
            </TabsContent>

            <TabsContent value="teachers" className="p-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredTeachers.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">الرقم</TableHead>
                          <TableHead>اسم الأستاذ</TableHead>
                          <TableHead>المادة</TableHead>
                          <TableHead className="text-center">الإجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedTeachers.map((teacher, index) => (
                          <TableRow key={teacher.id}>
                            <TableCell className="font-medium">
                              {(currentTeacherPage - 1) * itemsPerPage + index + 1}
                            </TableCell>
                            <TableCell>{teacher.name}</TableCell>
                            <TableCell>{teacher.subject}</TableCell>
                            <TableCell>
                              <div className="flex justify-center gap-2">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => markTeacherAbsent(teacher)}
                                  className="h-9"
                                >
                                  <UserX className="h-4 w-4 mr-1" />
                                  غائب
                                </Button>
                                <Button
                                  variant="warning"
                                  size="sm"
                                  onClick={() => markTeacherLate(teacher)}
                                  className="h-9 bg-amber-500 hover:bg-amber-600"
                                >
                                  <Clock className="h-4 w-4 mr-1" />
                                  متأخر
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Paginación para profesores */}
                  {totalTeacherPages > 1 && (
                    <div className="flex items-center justify-center space-x-2 space-x-reverse mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentTeacherPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentTeacherPage === 1}
                      >
                        <ChevronRight className="h-4 w-4" />
                        السابق
                      </Button>
                      <div className="text-sm">
                        الصفحة {currentTeacherPage} من {totalTeacherPages}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentTeacherPage((prev) => Math.min(prev + 1, totalTeacherPages))}
                        disabled={currentTeacherPage === totalTeacherPages}
                      >
                        التالي
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">لا توجد نتائج مطابقة لبحثك</div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Listas de ausencias */}
        {savedAbsences.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Lista de ausencias de estudiantes */}
            <Card className="bg-white shadow">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="text-lg flex items-center">
                  <Users className="h-5 w-5 text-blue-500 mr-2" />
                  غيابات المترشحين
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الاسم</TableHead>
                        <TableHead>التاريخ</TableHead>
                        <TableHead>الحالة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {savedAbsences.filter((a) => a.type === "student").length > 0 ? (
                        savedAbsences
                          .filter((a) => a.type === "student")
                          .slice(0, 5)
                          .map((absence) => (
                            <TableRow key={absence.id}>
                              <TableCell>{absence.name}</TableCell>
                              <TableCell>{absence.date}</TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={
                                    absence.status === "absent"
                                      ? "bg-red-50 text-red-700 border-red-200"
                                      : "bg-amber-50 text-amber-700 border-amber-200"
                                  }
                                >
                                  {absence.status === "absent" ? "غائب" : "متأخر"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                            لا توجد غيابات مسجلة للمترشحين
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Lista de ausencias de profesores */}
            <Card className="bg-white shadow">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="text-lg flex items-center">
                  <Users className="h-5 w-5 text-purple-500 mr-2" />
                  غيابات الأساتذة
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الاسم</TableHead>
                        <TableHead>التاريخ</TableHead>
                        <TableHead>الحالة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {savedAbsences.filter((a) => a.type === "teacher").length > 0 ? (
                        savedAbsences
                          .filter((a) => a.type === "teacher")
                          .slice(0, 5)
                          .map((absence) => (
                            <TableRow key={absence.id}>
                              <TableCell>{absence.name}</TableCell>
                              <TableCell>{absence.date}</TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={
                                    absence.status === "absent"
                                      ? "bg-red-50 text-red-700 border-red-200"
                                      : "bg-amber-50 text-amber-700 border-amber-200"
                                  }
                                >
                                  {absence.status === "absent" ? "غائب" : "متأخر"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                            لا توجد غيابات مسجلة للأساتذة
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Diálogo para configurar el PDF */}
        <Dialog open={showPdfDialog} onOpenChange={setShowPdfDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>إعدادات طباعة محضر الغيابات</DialogTitle>
              <DialogDescription>اختر اليوم والفترة ونوع الغيابات التي تريد تضمينها في المحضر</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="pdf-day">يوم الامتحان</Label>
                <Select value={pdfDay} onValueChange={setPdfDay}>
                  <SelectTrigger id="pdf-day">
                    <SelectValue placeholder="اختر يوم الامتحان" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل الأيام</SelectItem>
                    {examDays.map((day) => (
                      <SelectItem key={`pdf-${day.day}-${day.date}`} value={`${day.day} ${day.date}`}>
                        {day.day} {day.date}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="pdf-period">فترة الامتحان</Label>
                <Select value={pdfPeriod} onValueChange={(value: "all" | "morning" | "evening") => setPdfPeriod(value)}>
                  <SelectTrigger id="pdf-period">
                    <SelectValue placeholder="اختر فترة الامتحان" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل الفترات</SelectItem>
                    <SelectItem value="morning">صباحية</SelectItem>
                    <SelectItem value="evening">مسائية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="pdf-type">نوع الغيابات</Label>
                <Select value={pdfType} onValueChange={(value: "all" | "students" | "teachers") => setPdfType(value)}>
                  <SelectTrigger id="pdf-type">
                    <SelectValue placeholder="اختر نوع الغيابات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="students">المترشحين فقط</SelectItem>
                    <SelectItem value="teachers">الأساتذة فقط</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setShowPdfDialog(false)}>
                إلغاء
              </Button>
              <Button type="button" onClick={generateReport} disabled={isPdfLoading || savedAbsences.length === 0}>
                {isPdfLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    جاري الإنشاء...
                  </>
                ) : (
                  <>إنشاء المحضر</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Botón para generar informe */}
        <div className="flex justify-center mt-8">
          <Button
            size="lg"
            className="gap-2"
            onClick={() => setShowPdfDialog(true)}
            disabled={savedAbsences.length === 0}
          >
            <Printer className="h-5 w-5" />
            طباعة محضر الغيابات
          </Button>
        </div>
      </div>
    </div>
  )
}

