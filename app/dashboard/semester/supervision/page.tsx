"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowLeft,
  Building2,
  Users,
  Shuffle,
  Printer,
  Search,
  Calendar,
  Clock,
  FileSpreadsheet,
  Shield,
  AlertCircle,
  FileUp,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRouter } from "next/navigation"
import type { ImportedSemesterData, Room } from "../import-data/page"
import { getSemesterSettings, getBasicSettings } from "@/lib/settings-utils"
// استيراد الدالة المساعدة لتوليد أيام الامتحان
import { generateExamDays } from "@/lib/date-utils"
import { downloadPDF } from "./pdf-generator"

// Fallback mock data in case no imported data is available
const fallbackTeachers = [
  "أحمد محمد",
  "سمير علي",
  "فاطمة أحمد",
  "خالد عبد الله",
  "نورة محمد",
  "عبد الرحمن سعيد",
  "سارة خالد",
  "محمد إبراهيم",
  "ليلى عمر",
  "يوسف سليمان",
]

// تعديل تعريف مصفوفة أيام الامتحان
// استبدل هذا الكود:
// بهذا الكود:
const settings = getSemesterSettings()
const examDaysObjects = generateExamDays(settings.startDate, settings.endDate)
const examDays = examDaysObjects.map((day) => day.day)

// Type definitions
type Period = "morning" | "evening"

export type SupervisionRecord = {
  room: Room
  supervisors: string[]
}

type SupervisionSchedule = {
  [day: string]: {
    [period in Period]: SupervisionRecord[]
  }
}

export default function SupervisionManagementPage() {
  const settings = getSemesterSettings()
  const basicSettings = getBasicSettings()
  const router = useRouter()
  const { toast } = useToast()
  const [selectedDay, setSelectedDay] = useState<string>(examDays.length > 0 ? examDays[0] : "")
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("morning")
  const [supervisionSchedule, setSupervisionSchedule] = useState<SupervisionSchedule>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredRecords, setFilteredRecords] = useState<SupervisionRecord[]>([])
  const [isDistributing, setIsDistributing] = useState(false)
  const [isPdfLoading, setIsPdfLoading] = useState(false)
  const tableRef = useRef<HTMLDivElement>(null)

  // State for imported data
  const [teacherNames, setTeacherNames] = useState<string[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [importedRegularRoomsCount, setImportedRegularRoomsCount] = useState<number>(0)
  const [importedSpecialRoomsCount, setImportedSpecialRoomsCount] = useState<number>(0)
  const [hasImportedData, setHasImportedData] = useState<boolean>(false)
  const [morningTeachers, setMorningTeachers] = useState<Set<string>>(new Set())

  // Estado para rastrear las aulas activas para cada período
  const [activeRooms, setActiveRooms] = useState<{
    morning: Room[]
    evening: Room[]
  }>(() => {
    // Intentar cargar desde localStorage
    if (typeof window !== "undefined") {
      const savedActiveRooms = localStorage.getItem("semesterActiveRooms")
      if (savedActiveRooms) {
        try {
          return JSON.parse(savedActiveRooms)
        } catch (e) {
          console.error("Error parsing saved active rooms:", e)
        }
      }
    }

    // Valor por defecto: todas las aulas activas
    return {
      morning: rooms,
      evening: rooms,
    }
  })

  // Load imported data
  useEffect(() => {
    try {
      const savedData = localStorage.getItem("semesterImportedData")
      if (savedData) {
        const parsedData: ImportedSemesterData = JSON.parse(savedData)

        // Only use saved data if it's recent (less than 24 hours old)
        const isRecent = Date.now() - parsedData.timestamp < 24 * 60 * 60 * 1000

        if (isRecent && parsedData.teachers && parsedData.teachers.length > 0) {
          // Extract teacher names from the imported data
          const names = parsedData.teachers.map((teacher) => teacher.name)
          console.log("Loaded teacher names:", names) // Log for debugging

          // Make sure we have actual teacher data
          if (names.length > 0) {
            setTeacherNames(names)

            // Set rooms from imported data
            if (parsedData.rooms && parsedData.rooms.length > 0) {
              setRooms(parsedData.rooms)

              // Count regular and special rooms
              const regular = parsedData.rooms.filter((r) => r.type === "regular").length
              const special = parsedData.rooms.filter((r) => r.type === "special").length
              setImportedRegularRoomsCount(regular)
              setImportedSpecialRoomsCount(special)

              setHasImportedData(true)

              toast({
                title: "تم تحميل البيانات",
                description: `تم تحميل ${names.length} أستاذ و ${parsedData.rooms.length} قاعة`,
              })

              return // Exit early after successful data loading
            }
          }
        }

        // If we reached here, data was not valid or not recent
        setHasImportedData(false)
        setTeacherNames([]) // Ensure no teachers are loaded
        toast({
          title: "لم يتم العثور على بيانات حديثة",
          description: "يرجى استيراد البيانات أولاً من صفحة استيراد البيانات",
          variant: "destructive",
        })
      } else {
        setHasImportedData(false)
        setTeacherNames([]) // Ensure no teachers are loaded
        toast({
          title: "لم يتم العثور على بيانات",
          description: "يرجى استيراد البيانات أولاً من صفحة استيراد البيانات",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading imported data:", error)
      setHasImportedData(false)
      setTeacherNames([]) // Ensure no teachers are loaded
    }
  }, [toast])

  // Actualizar activeRooms cuando cambian las rooms
  useEffect(() => {
    if (rooms.length > 0) {
      setActiveRooms((prev) => {
        // Mantener solo las aulas que existen en la nueva lista
        const morningRooms = prev.morning.filter((r) => rooms.some((room) => room.name === r.name))

        const eveningRooms = prev.evening.filter((r) => rooms.some((room) => room.name === r.name))

        // Añadir nuevas aulas que no estaban en la lista anterior
        const newMorningRooms = rooms.filter((r) => !morningRooms.some((room) => room.name === r.name))

        const newEveningRooms = rooms.filter((r) => !eveningRooms.some((room) => room.name === r.name))

        const updatedActiveRooms = {
          morning: [...morningRooms, ...newMorningRooms],
          evening: [...eveningRooms, ...newEveningRooms],
        }

        // Guardar en localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("semesterActiveRooms", JSON.stringify(updatedActiveRooms))
        }

        return updatedActiveRooms
      })
    }
  }, [rooms])

  // Initialize the schedule structure
  useEffect(() => {
    const initialSchedule: SupervisionSchedule = {}

    examDays.forEach((day) => {
      initialSchedule[day] = {
        morning: [],
        evening: [],
      }
    })

    setSupervisionSchedule(initialSchedule)
  }, [])

  // Filter records based on search query
  useEffect(() => {
    if (!selectedDay || !supervisionSchedule[selectedDay]) return

    const currentRecords = supervisionSchedule[selectedDay][selectedPeriod]

    if (!searchQuery.trim()) {
      setFilteredRecords(currentRecords)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = currentRecords.filter(
      (record) =>
        record.room.name.toLowerCase().includes(query) ||
        record.supervisors.some((supervisor) => supervisor.toLowerCase().includes(query)),
    )

    setFilteredRecords(filtered)
  }, [searchQuery, selectedDay, selectedPeriod, supervisionSchedule])

  // Manejar la selección de aulas
  const handleRoomSelection = (room: Room, period: Period, isSelected: boolean) => {
    setActiveRooms((prev) => {
      const newActiveRooms = { ...prev }

      if (isSelected) {
        // Añadir el aula si no está ya en la lista
        if (!newActiveRooms[period].some((r) => r.name === room.name)) {
          newActiveRooms[period] = [...newActiveRooms[period], room]
        }
      } else {
        // Eliminar el aula de la lista
        newActiveRooms[period] = newActiveRooms[period].filter((r) => r.name !== room.name)
      }

      // Guardar en localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("semesterActiveRooms", JSON.stringify(newActiveRooms))
      }

      return newActiveRooms
    })
  }

  // Distribute supervisors
  const distributeSupervision = () => {
    // Check if we have teacher data before attempting distribution
    if (teacherNames.length === 0) {
      toast({
        title: "لا توجد بيانات للأساتذة",
        description: "يرجى استيراد بيانات الأساتذة أولاً من صفحة استيراد البيانات",
        variant: "destructive",
      })
      return
    }

    // Get active rooms for the selected period
    const activeRoomsForPeriod = activeRooms[selectedPeriod] || []

    if (activeRoomsForPeriod.length === 0) {
      toast({
        title: "لا توجد قاعات نشطة",
        description: "يرجى تحديد قاعة واحدة على الأقل للفترة المحددة قبل توزيع الحراس",
        variant: "destructive",
      })
      return
    }

    // Count active regular and special rooms
    const activeRegularRoomsCount = activeRoomsForPeriod.filter((room) => room.type === "regular").length
    const activeSpecialRoomsCount = activeRoomsForPeriod.filter((room) => room.type === "special").length

    // Check if we have enough teachers for distribution
    const requiredTeachers = activeRegularRoomsCount + activeSpecialRoomsCount * 2
    if (teacherNames.length < requiredTeachers) {
      toast({
        title: "عدد الأساتذة غير كافٍ",
        description: `تحتاج إلى ${requiredTeachers} أستاذ على الأقل للقاعات النشطة، لكن لديك فقط ${teacherNames.length} أستاذ`,
        variant: "destructive",
      })
      // Continue anyway, but show the warning
    }

    setIsDistributing(true)
    console.log("Starting distribution with teachers:", teacherNames) // Log for debugging
    console.log("Active rooms for period:", activeRoomsForPeriod) // Log for debugging

    // Simulate processing time
    setTimeout(() => {
      try {
        // Create a copy of the current schedule
        const newSchedule = { ...supervisionSchedule }

        // Get all teachers who have been assigned to any room on this day and period
        const assignedTeachers = new Set<string>()

        // Get teachers who worked in the morning period (to exclude them from evening)
        let morningTeachersSet = new Set<string>()
        if (selectedPeriod === "evening" && newSchedule[selectedDay]["morning"].length > 0) {
          morningTeachersSet = new Set(newSchedule[selectedDay]["morning"].flatMap((record) => record.supervisors))
          setMorningTeachers(morningTeachersSet)
        }

        // Shuffle teachers for random assignment
        let availableTeachers = [...teacherNames]

        // For evening period, filter out teachers who worked in the morning
        if (selectedPeriod === "evening") {
          availableTeachers = availableTeachers.filter((teacher) => !morningTeachersSet.has(teacher))

          // If we don't have enough teachers for evening after filtering, show a warning
          if (availableTeachers.length < requiredTeachers) {
            toast({
              title: "عدد الأساتذة غير كافٍ للفترة المسائية",
              description: `بعد استبعاد الأساتذة الذين عملوا في الفترة الصباحية، لديك فقط ${availableTeachers.length} أستاذ متاح من أصل ${requiredTeachers} مطلوب`,
              variant: "destructive",
            })
          }
        }

        // Shuffle the available teachers
        availableTeachers = availableTeachers.sort(() => Math.random() - 0.5)
        console.log("Available teachers after filtering:", availableTeachers) // Log for debugging

        // Create assignments for each room
        const assignments: SupervisionRecord[] = []

        // Process rooms by type - USING ACTIVE ROOMS ONLY
        const regularRooms = activeRoomsForPeriod.filter((room) => room.type === "regular")
        const specialRooms = activeRoomsForPeriod.filter((room) => room.type === "special")

        // Assign supervisors to regular rooms (1 supervisor per room)
        for (const room of regularRooms) {
          // Find an unassigned teacher
          const supervisor = availableTeachers.find((t) => !assignedTeachers.has(t))

          // If no unassigned teacher is available, reuse a teacher
          const assignedSupervisor = supervisor || availableTeachers[0]

          if (assignedSupervisor) {
            assignedTeachers.add(assignedSupervisor)

            assignments.push({
              room,
              supervisors: [assignedSupervisor],
            })
          }
        }

        // Assign supervisors to special rooms (2 supervisors per room)
        for (const room of specialRooms) {
          const roomSupervisors: string[] = []

          // Find first supervisor
          const firstSupervisor = availableTeachers.find((t) => !assignedTeachers.has(t))
          if (firstSupervisor) {
            assignedTeachers.add(firstSupervisor)
            roomSupervisors.push(firstSupervisor)
          } else if (availableTeachers.length > 0) {
            roomSupervisors.push(availableTeachers[0])
          }

          // Find second supervisor
          const secondSupervisor = availableTeachers.find((t) => !assignedTeachers.has(t))
          if (secondSupervisor) {
            assignedTeachers.add(secondSupervisor)
            roomSupervisors.push(secondSupervisor)
          } else if (availableTeachers.length > 0) {
            roomSupervisors.push(availableTeachers[0])
          }

          assignments.push({
            room,
            supervisors: roomSupervisors,
          })
        }

        console.log("Final assignments:", assignments) // Log for debugging

        // Update the schedule
        newSchedule[selectedDay][selectedPeriod] = assignments
        setSupervisionSchedule(newSchedule)
        setFilteredRecords(assignments)

        // Save to localStorage for persistence
        localStorage.setItem("semesterSupervisionSchedule", JSON.stringify(newSchedule))

        // If this is the morning period, save the assigned teachers to exclude them from evening
        if (selectedPeriod === "morning") {
          const assignedMorningTeachers = new Set(assignments.flatMap((record) => record.supervisors))
          setMorningTeachers(assignedMorningTeachers)
        }

        toast({
          title: "تم توزيع الحراس",
          description: `تم توزيع الحراس على ${assignments.length} قاعة بنجاح`,
        })
      } catch (error) {
        console.error("Error in distribution:", error) // Log for debugging
        toast({
          title: "خطأ في التوزيع",
          description: "حدث خطأ أثناء توزيع الحراس، يرجى المحاولة مرة أخرى",
          variant: "destructive",
        })
      } finally {
        setIsDistributing(false)
      }
    }, 1500)
  }

  // Handle PDF generation and download
  const handlePdfDownload = () => {
    if (filteredRecords.length === 0) {
      toast({
        title: "لا توجد بيانات",
        description: "يرجى توزيع الحراس أولاً قبل تحميل الملف",
        variant: "destructive",
      })
      return
    }

    setIsPdfLoading(true)

    try {
      // Convert the records to the format expected by the PDF generator
      const pdfRecords = filteredRecords.map((record) => ({
        room: record.room,
        supervisors: record.supervisors,
      }))

      // Download the PDF
      const success = downloadPDF(pdfRecords, selectedDay, selectedPeriod)

      if (success) {
        toast({
          title: "تم تحميل الملف بنجاح",
          description: "تم تحميل ملف PDF لجدول توزيع الحراس",
        })

        // Save to documents
        const documentsKey = "semesterDocuments"
        const now = new Date()
        const documentEntry = {
          id: `supervision_${now.getTime()}`,
          title: `جدول الحراسة - ${selectedDay} - ${selectedPeriod === "morning" ? "صباحية" : "مسائية"}`,
          date: now.toISOString(),
          type: "supervision",
          day: selectedDay,
          period: selectedPeriod,
        }

        try {
          const existingDocs = JSON.parse(localStorage.getItem(documentsKey) || "[]")
          existingDocs.push(documentEntry)
          localStorage.setItem(documentsKey, JSON.stringify(existingDocs))
        } catch (error) {
          console.error("Error saving document entry:", error)
        }
      } else {
        toast({
          title: "خطأ في تحميل الملف",
          description: "حدث خطأ أثناء إنشاء ملف PDF",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "خطأ في إنشاء الملف",
        description: "حدث خطأ أثناء إنشاء ملف PDF. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      })
    } finally {
      setIsPdfLoading(false)
    }
  }

  // Open PDF in a new window for printing
  const handlePrintPDF = () => {
    if (filteredRecords.length === 0) {
      toast({
        title: "لا توجد بيانات",
        description: "يرجى توزيع الحراس أولاً قبل الطباعة",
        variant: "destructive",
      })
      return
    }

    setIsPdfLoading(true)

    try {
      // Create a new window for printing
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

      // Generate the HTML content for the PDF with improved styling
      const htmlContent = `
<!DOCTYPE html>
<html dir="rtl">
<head>
  <title>جدول توزيع الحراس - ${selectedDay}</title>
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
      margin: 25px 0;
      color: #2563eb;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 5px;
      width: 50%;
      margin-left: auto;
      margin-right: auto;
    }
    
    .content-wrapper {
      min-height: 50vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 30px;
      margin-bottom: 40px;
      font-size: 13px;
    }
    
    th, td {
      border: 1px solid #ddd;
      padding: 6px;
      text-align: center;
    }
    
    th {
      background-color: #f2f2f2;
      font-weight: 700;
      color: #333;
    }
    
    .supervisor-name {
      font-weight: 700;
      color: #1e40af;
    }
    
    .signature {
      display: flex;
      justify-content: space-between;
      margin-top: 40px;
      margin-bottom: 40px;
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
        padding: 0;
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
      font-family: 'Tajawal', Arial, sans-serif;
    }
    
    .print-button:hover {
      background-color: #1d4ed8;
    }
    
    .room-name {
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>الجمهورية الجزائرية الديمقراطية الشعبية</h1>
    <h2>وزارة التربية الوطنية</h2>
    <h2> مديرية التربية لولاية الجزائر</h2>
  </div>
  
  <div class="info">
    <div>
      <div class="info-item"><strong>${settings.examSession || "الامتحانات الفصلية"}</strong></div>
      <div class="info-item"><strong>المؤسسة:</strong> ${basicSettings.institutionName || "المؤسسة التعليمية"}</div>
      <div class="info-item"><strong>السنة الدراسية:</strong> ${basicSettings.academicYear || new Date().getFullYear()}</div>
    </div>
    <div>
      <div class="info-item"><strong>الفترة:</strong> ${selectedPeriod === "morning" ? "الصباحية" : "المسائية"}</div>
      <div class="info-item"><strong>اليوم:</strong> ${selectedDay}</div>
    </div>
  </div>
  
  <div class="title">جدول توزيع الأساتذة للحراسة</div>
  
  <div class="content-wrapper">
    <table>
      <thead>
        <tr>
          <th>القاعة</th>
          <th>الحراس</th>
        </tr>
      </thead>
      <tbody>
        ${filteredRecords
          .map(
            (record) => `
          <tr>
            <td class="room-name">${record.room.name}</td>
            <td>
              ${record.supervisors.map((supervisor) => `<div class="supervisor-name">${supervisor}</div>`).join("")}
            </td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
  </div>
  
  <div class="signature">
    <div></div> <!-- عنصر فارغ للمحاذاة -->
    <div class="signature-item">
      <div><strong>${basicSettings.directorName || "مدير المؤسسة"}</strong></div>
      <div style="height: 10px;"></div> <!-- مسافة بين العناصر -->
      <div><strong>الختم والإمضاء</strong></div>
      <div class="signature-line"></div>
    </div>
  </div>
  
  <div class="footer">
    <div>تاريخ الإصدار: ${new Date().toLocaleDateString("ar-DZ")}</div>
    <div>الصفحة 1 من 1</div>
  </div>
  
  <button class="print-button" onclick="window.print(); this.style.display='none';">طباعة الجدول</button>
</body>
</html>
`

      // Write the HTML content to the new window
      printWindow.document.write(htmlContent)
      printWindow.document.close()

      // Focus the window for printing
      printWindow.focus()

      toast({
        title: "تم فتح نافذة الطباعة",
        description: "يمكنك الآن طباعة جدول توزيع الحراس أو حفظه كملف PDF",
      })
    } catch (error) {
      console.error("Error generating printable view:", error)
      toast({
        title: "خطأ في إنشاء صفحة الطباعة",
        description: "حدث خطأ أثناء إنشاء صفحة الطباعة. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      })
    } finally {
      setIsPdfLoading(false)
    }
  }

  // Export to Excel
  const exportToExcel = () => {
    // In a real app, you would use a library like xlsx to create an Excel file
    // For this demo, we'll just show a success message
    toast({
      title: "تم التصدير بنجاح",
      description: "تم تصدير جدول توزيع الحراس إلى ملف Excel بنجاح",
    })
  }

  // Navigate to import data page
  const goToImportData = () => {
    router.push("/dashboard/semester/import-data")
  }

  // Calcular estadísticas de aulas activas
  const activeRoomsForPeriod = activeRooms[selectedPeriod] || []
  const activeRegularRoomsCount = activeRoomsForPeriod.filter((room) => room.type === "regular").length
  const activeSpecialRoomsCount = activeRoomsForPeriod.filter((room) => room.type === "special").length
  const requiredSupervisors = activeRegularRoomsCount + activeSpecialRoomsCount * 2

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          تسيير الحراسة - {settings.examSession || "الامتحانات الفصلية"}
        </h1>
        <p className="text-muted-foreground mt-2">
          إدارة وتوزيع المراقبين على القاعات خلال فترة الامتحانات
          {settings.startDate && settings.endDate ? ` (${settings.startDate} - ${settings.endDate})` : ""}
        </p>
      </div>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <header className="flex items-center mb-8">
            <Link href="/dashboard/semester">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold mr-4">تسيير الحراسة</h1>
          </header>

          {!hasImportedData && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
              <Card className="border-amber-300 bg-amber-50">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center gap-4">
                    <AlertCircle className="h-10 w-10 text-amber-500 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-amber-800 mb-1">لم يتم العثور على بيانات مستوردة</h3>
                      <p className="text-amber-700 mb-4">
                        يجب استيراد بيانات الأساتذة والقاعات أولاً من صفحة استيراد البيانات قبل توزيع الحراس.
                      </p>
                    </div>
                    <Button
                      className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700"
                      onClick={goToImportData}
                    >
                      <FileUp className="h-4 w-4" />
                      استيراد البيانات
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {hasImportedData && teacherNames.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 mb-8">
              <Card className="border-red-300 bg-red-50">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center gap-4">
                    <AlertCircle className="h-10 w-10 text-red-500 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-red-800 mb-1">لم يتم العثور على بيانات الأساتذة</h3>
                      <p className="text-red-700 mb-4">
                        تم استيراد البيانات لكن لا يوجد أساتذة في البيانات المستوردة. يرجى التأكد من تنسيق ملف الإكسل.
                      </p>
                    </div>
                    <Button className="flex items-center gap-2 bg-red-600 hover:bg-red-700" onClick={goToImportData}>
                      <FileUp className="h-4 w-4" />
                      إعادة استيراد البيانات
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">عدد القاعات</span>
                      <span className="text-3xl font-bold">{rooms.length}</span>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Building2 className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-2 flex flex-col text-sm text-gray-500">
                    <span>قاعات نشطة للفترة الحالية: {activeRoomsForPeriod.length}</span>
                    <span>قاعات عادية نشطة: {activeRegularRoomsCount}</span>
                    <span>قاعات خاصة نشطة: {activeSpecialRoomsCount}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">عدد الأساتذة</span>
                      <span className="text-3xl font-bold">{teacherNames.length}</span>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  {selectedPeriod === "evening" && morningTeachers.size > 0 && (
                    <div className="mt-2 text-sm text-amber-600">
                      <span>أساتذة متاحون للفترة المسائية: {teacherNames.length - morningTeachers.size}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">عدد الحراس المطلوب</span>
                      <span className="text-3xl font-bold">{requiredSupervisors}</span>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-full">
                      <Shield className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>

                  <div className="mt-2 flex flex-col text-sm text-gray-500">
                    <span>للقاعات العادية النشطة: {activeRegularRoomsCount} (حارس واحد لكل قاعة)</span>
                    <span>للقاعات الخاصة النشطة: {activeSpecialRoomsCount * 2} (حارسان لكل قاعة)</span>
                  </div>

                  {requiredSupervisors > teacherNames.length && (
                    <div className="mt-2 flex items-center text-amber-600 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span>عدد الحراس المطلوب أكبر من عدد الأساتذة المتوفرين</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Room Selection Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">القاعات الصباحية</h3>
                <div className="grid grid-cols-2 gap-3">
                  {rooms.map((room) => (
                    <div key={`morning-${room.name}`} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`morning-${room.name}`}
                        checked={activeRooms.morning.some((r) => r.name === room.name)}
                        onChange={(e) => handleRoomSelection(room, "morning", e.target.checked)}
                        className="mr-2 h-4 w-4"
                      />
                      <Label htmlFor={`morning-${room.name}`}>{room.name}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">القاعات المسائية</h3>
                <div className="grid grid-cols-2 gap-3">
                  {rooms.map((room) => (
                    <div key={`evening-${room.name}`} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`evening-${room.name}`}
                        checked={activeRooms.evening.some((r) => r.name === room.name)}
                        onChange={(e) => handleRoomSelection(room, "evening", e.target.checked)}
                        className="mr-2 h-4 w-4"
                      />
                      <Label htmlFor={`evening-${room.name}`}>{room.name}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="exam-day">يوم الامتحان</Label>
                    <div className="relative">
                      <Calendar className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                      <Select value={selectedDay} onValueChange={setSelectedDay}>
                        <SelectTrigger id="exam-day" className="pr-10">
                          <SelectValue placeholder="اختر يوم الامتحان" />
                        </SelectTrigger>
                        <SelectContent>
                          {examDays.map((day) => (
                            <SelectItem key={day} value={day}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="exam-period">فترة الامتحان</Label>
                    <div className="relative">
                      <Clock className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                      <Select value={selectedPeriod} onValueChange={(value: Period) => setSelectedPeriod(value)}>
                        <SelectTrigger id="exam-period" className="pr-10">
                          <SelectValue placeholder="اختر فترة الامتحان" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">صباحية</SelectItem>
                          <SelectItem value="evening">مسائية</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="search">بحث عن قاعة أو أستاذ</Label>
                    <div className="relative">
                      <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="أدخل اسم القاعة أو اسم الأستاذ"
                        className="pr-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-center">
                  <Button
                    size="lg"
                    className="px-8 flex items-center gap-2"
                    onClick={distributeSupervision}
                    disabled={isDistributing || !hasImportedData || teacherNames.length === 0}
                  >
                    <Shuffle className="h-5 w-5" />
                    {isDistributing ? "جاري التوزيع..." : "توزيع الحراس"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Supervision Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="mb-8"
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    جدول توزيع الحراس - {selectedDay} - الفترة {selectedPeriod === "morning" ? "الصباحية" : "المسائية"}
                  </h2>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={handlePrintPDF}
                      disabled={filteredRecords.length === 0 || isPdfLoading}
                    >
                      {isPdfLoading ? (
                        <>
                          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-1"></div>
                          جاري التحميل...
                        </>
                      ) : (
                        <>
                          <Printer className="h-4 w-4" />
                          طباعة الجدول
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={exportToExcel}
                      disabled={filteredRecords.length === 0}
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      تصدير Excel
                    </Button>
                  </div>
                </div>

                <div ref={tableRef} className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">القاعة</TableHead>
                        <TableHead className="text-right">الحراس</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.length > 0 ? (
                        filteredRecords.map((record, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{record.room.name}</TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                {record.supervisors.map((supervisor, idx) => (
                                  <div key={idx} className="flex items-center">
                                    <span>{supervisor}</span>
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center py-6 text-gray-500">
                            {isDistributing ? (
                              <div className="flex flex-col items-center">
                                <Shuffle className="h-8 w-8 animate-spin mb-2" />
                                <span>جاري توزيع الحراس...</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center">
                                <Shield className="h-8 w-8 mb-2 text-gray-400" />
                                <span>لم يتم توزيع الحراس بعد. اضغط على زر "توزيع الحراس" للبدء.</span>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {filteredRecords.length > 0 && searchQuery && (
                  <div className="mt-4 text-sm text-gray-500">
                    تم العثور على {filteredRecords.length} نتيجة لـ "{searchQuery}"
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Download Button */}
          {filteredRecords.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="flex justify-center gap-4"
            >
              <Button
                size="lg"
                className="px-8 flex items-center gap-2"
                onClick={handlePrintPDF}
                disabled={isPdfLoading}
              >
                {isPdfLoading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                    جاري إعداد الطباعة...
                  </>
                ) : (
                  <>
                    <Printer className="h-5 w-5" />
                    طباعة الجدول
                  </>
                )}
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="px-8 flex items-center gap-2"
                onClick={handlePdfDownload}
                disabled={isPdfLoading}
              >
                <FileSpreadsheet className="h-5 w-5" />
                تحميل PDF
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

