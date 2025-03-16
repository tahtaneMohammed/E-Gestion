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
  Calendar,
  Clock,
  FileSpreadsheet,
  Printer,
  Search,
  Shield,
  Shuffle,
  Users,
  Building2,
  AlertCircle,
  FileUp,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import type { ImportedData } from "../import-data/page"
import { getOfficialSettings, getBasicSettings } from "@/lib/settings-utils"
import { generateExamDays } from "@/lib/date-utils"

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

const fallbackRooms = ["قاعة 1", "قاعة 2", "قاعة 3", "قاعة 4", "قاعة 5"]

// تعريف نوع يوم الامتحان
type ExamDay = {
  day: string
  date: string
}

// الحصول على الإعدادات
const settings = getOfficialSettings()
const basicSettings = getBasicSettings()

// إنشاء مصفوفة أيام الامتحان
const examDaysArray = generateExamDays(settings.startDate, settings.endDate)

// إذا كانت المصفوفة فارغة، استخدم قيم افتراضية
const examDays: ExamDay[] =
  examDaysArray.length > 0
    ? examDaysArray
    : [
        { day: "الأحد", date: "16/06/2024" },
        { day: "الإثنين", date: "17/06/2024" },
        { day: "الثلاثاء", date: "18/06/2024" },
        { day: "الأربعاء", date: "19/06/2024" },
        { day: "الخميس", date: "20/06/2024" },
      ]

// Type definitions
type Period = "morning" | "evening"
export type SupervisionRecord = {
  room: string
  mainSupervisor: string
  secondSupervisor: string
  thirdSupervisor: string
}

type SupervisionSchedule = {
  [dayKey: string]: {
    [period in Period]: SupervisionRecord[]
  }
}

export default function SupervisionManagementPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedDay, setSelectedDay] = useState<ExamDay>(examDays[0])
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("morning")
  const [supervisionSchedule, setSupervisionSchedule] = useState<SupervisionSchedule>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredRecords, setFilteredRecords] = useState<SupervisionRecord[]>([])
  const [isDistributing, setIsDistributing] = useState(false)
  const [isPdfLoading, setIsPdfLoading] = useState(false)
  const tableRef = useRef<HTMLDivElement>(null)

  // State for imported data
  const [teacherNames, setTeacherNames] = useState<string[]>([])
  const [roomNames, setRoomNames] = useState<string[]>(fallbackRooms)
  const [supervisorsPerRoom, setSupervisorsPerRoom] = useState<number>(3)
  const [hasImportedData, setHasImportedData] = useState<boolean>(false)
  const [centerName, setCenterName] = useState<string>(
    settings.examCenter || basicSettings.schoolName || "ثانوية الأمير عبد القادر",
  )
  const [centerCode, setCenterCode] = useState<string>(settings.centerCode || "12345")

  // Load imported data
  useEffect(() => {
    try {
      const savedData = localStorage.getItem("importedData")
      if (savedData) {
        const parsedData: ImportedData = JSON.parse(savedData)

        // Only use saved data if it's recent (less than 24 hours old)
        const isRecent = Date.now() - parsedData.timestamp < 24 * 60 * 60 * 1000

        if (isRecent && parsedData.teachers && parsedData.teachers.length > 0) {
          // Extract teacher names from the imported data
          const names = parsedData.teachers.map((teacher) => teacher.name)
          console.log("Loaded teacher names:", names) // Log for debugging

          // Make sure we have actual teacher data
          if (names.length > 0) {
            setTeacherNames(names)

            // Generate room names based on the imported room count
            const rooms = Array.from({ length: parsedData.roomsCount }, (_, i) => `قاعة ${i + 1}`)
            setRoomNames(rooms)

            // Set supervisors per room
            setSupervisorsPerRoom(parsedData.supervisorsPerRoom)

            setHasImportedData(true)

            toast({
              title: "تم تحميل البيانات",
              description: `تم تحميل ${names.length} أستاذ و ${rooms.length} قاعة`,
            })

            return // Exit early after successful data loading
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

  // Initialize the schedule structure
  useEffect(() => {
    const initialSchedule: SupervisionSchedule = {}

    examDays.forEach((examDay) => {
      // استخدام تركيبة اليوم والتاريخ كمفتاح فريد
      const dayKey = `${examDay.day} ${examDay.date}`
      initialSchedule[dayKey] = {
        morning: [],
        evening: [],
      }
    })

    setSupervisionSchedule(initialSchedule)
  }, [])

  // الحصول على المفتاح الكامل ليوم الامتحان
  const getFullDayKey = (examDay: ExamDay) => `${examDay.day} ${examDay.date}`

  // Filter records based on search query
  useEffect(() => {
    if (!selectedDay) return

    const dayKey = getFullDayKey(selectedDay)
    if (!supervisionSchedule[dayKey]) return

    const currentRecords = supervisionSchedule[dayKey][selectedPeriod]

    if (!searchQuery.trim()) {
      setFilteredRecords(currentRecords)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = currentRecords.filter(
      (record) =>
        record.room.toLowerCase().includes(query) ||
        record.mainSupervisor.toLowerCase().includes(query) ||
        record.secondSupervisor.toLowerCase().includes(query) ||
        record.thirdSupervisor.toLowerCase().includes(query),
    )

    setFilteredRecords(filtered)
  }, [searchQuery, selectedDay, selectedPeriod, supervisionSchedule])

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

    // Check if we have enough teachers for distribution
    if (teacherNames.length < roomNames.length * supervisorsPerRoom) {
      toast({
        title: "عدد الأساتذة غير كافٍ",
        description: `تحتاج إلى ${roomNames.length * supervisorsPerRoom} أستاذ على الأقل، لكن لديك فقط ${teacherNames.length} أستاذ`,
        variant: "destructive",
      })
      // Continue anyway, but show the warning
    }

    setIsDistributing(true)
    console.log("Starting distribution with teachers:", teacherNames) // Log for debugging

    // Simulate processing time
    setTimeout(() => {
      try {
        // Create a copy of the current schedule
        const newSchedule = { ...supervisionSchedule }
        const dayKey = getFullDayKey(selectedDay)

        // Get previously assigned main supervisors for this day
        const mainSupervisorsForDay = new Set<string>()
        if (selectedPeriod === "evening" && newSchedule[dayKey]["morning"].length > 0) {
          newSchedule[dayKey]["morning"].forEach((record) => {
            mainSupervisorsForDay.add(record.mainSupervisor)
          })
        }

        // Get all teachers who have been assigned to any room on this day and period
        const assignedTeachers = new Set<string>()

        // Shuffle teachers for random assignment
        const shuffledTeachers = [...teacherNames].sort(() => Math.random() - 0.5)
        console.log("Shuffled teachers:", shuffledTeachers) // Log for debugging

        // Create assignments for each room
        const assignments: SupervisionRecord[] = []

        roomNames.forEach((room, index) => {
          let mainSupervisor: string

          // If it's evening period, try to keep the same main supervisor from morning
          if (selectedPeriod === "evening" && newSchedule[dayKey]["morning"].length > 0) {
            const morningRecord = newSchedule[dayKey]["morning"].find((r) => r.room === room)
            if (morningRecord) {
              mainSupervisor = morningRecord.mainSupervisor
            } else {
              // Find an unassigned teacher for main supervisor
              mainSupervisor =
                shuffledTeachers.find((t) => !assignedTeachers.has(t) && !mainSupervisorsForDay.has(t)) ||
                shuffledTeachers[0]
            }
          } else {
            // Find an unassigned teacher for main supervisor
            mainSupervisor = shuffledTeachers.find((t) => !assignedTeachers.has(t)) || shuffledTeachers[0]
          }

          assignedTeachers.add(mainSupervisor)

          // Find second supervisor
          const secondSupervisor = shuffledTeachers.find((t) => !assignedTeachers.has(t)) || shuffledTeachers[0]
          assignedTeachers.add(secondSupervisor)

          // Find third supervisor
          const thirdSupervisor = shuffledTeachers.find((t) => !assignedTeachers.has(t)) || shuffledTeachers[0]
          assignedTeachers.add(thirdSupervisor)

          assignments.push({
            room,
            mainSupervisor,
            secondSupervisor,
            thirdSupervisor,
          })
        })

        console.log("Final assignments:", assignments) // Log for debugging

        // Update the schedule
        newSchedule[dayKey][selectedPeriod] = assignments
        setSupervisionSchedule(newSchedule)
        setFilteredRecords(assignments)

        // Save to localStorage for persistence
        localStorage.setItem("supervisionSchedule", JSON.stringify(newSchedule))

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
        <title>جدول توزيع الحراس - ${selectedDay.day} ${selectedDay.date}</title>
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
            margin-bottom: 15px;
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
            margin-bottom: 15px;
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
            margin: 15px 0;
            color: #2563eb;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 5px;
            width: 50%;
            margin-left: auto;
            margin-right: auto;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
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
            margin-top: 30px;
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
            
            button {
              display: none;
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
          
          .room-name {
            font-weight: 500;
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
            <div class="info-item"><strong>${settings.examType || "امتحان شهادة البكالوريا"} ${settings.examSession || "دورة جوان 2025"}</strong></div>
            <div class="info-item"><strong>مركز الامتحان:</strong> ${centerName}</div>
            <div class="info-item"><strong>المادة:</strong> جميع المواد</div>
          </div>
          <div>
            <div class="info-item"><strong>رمز المركز:</strong> ${centerCode}</div>
            <div class="info-item"><strong>الفترة:</strong> ${selectedPeriod === "morning" ? "الصباحية" : "المسائية"}</div>
            <div class="info-item"><strong>اليوم:</strong> ${selectedDay.day} ${selectedDay.date}</div>
          </div>
        </div>
        
        <div class="title">جدول توزيع الأساتذة للحراسة</div>
        
        <table>
          <thead>
            <tr>
              <th>القاعة</th>
              <th>الحارس الرئيسي</th>
              <th>الحارس الثاني</th>
              <th>الحارس الثالث</th>
            </tr>
          </thead>
          <tbody>
            ${filteredRecords
              .map(
                (record) => `
              <tr>
                <td class="room-name">${record.room}</td>
                <td class="supervisor-name">${record.mainSupervisor}</td>
                <td class="supervisor-name">${record.secondSupervisor}</td>
                <td class="supervisor-name">${record.thirdSupervisor}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
        
        <div class="signature">
          <div class="signature-item">
            <div><strong>رئيس المركز</strong></div>
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
        
        <button class="print-button" onclick="window.print(); return false;">طباعة الجدول</button>
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
    router.push("/dashboard/official/import-data")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center mb-8">
          <Link href="/dashboard/official">
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
                  <Button className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700" onClick={goToImportData}>
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

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              تسيير الحراسة - {settings.examSession || "الامتحانات الرسمية"}
            </h1>
            <p className="text-muted-foreground mt-2">
              إدارة وتوزيع المراقبين على القاعات خلال فترة الامتحانات
              {settings.startDate && settings.endDate ? ` (${settings.startDate} - ${settings.endDate})` : ""}
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">عدد القاعات</span>
                      <span className="text-3xl font-bold">{roomNames.length}</span>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Building2 className="h-6 w-6 text-blue-600" />
                    </div>
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
                      <span className="text-3xl font-bold">{roomNames.length * supervisorsPerRoom}</span>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-full">
                      <Shield className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>

                  {roomNames.length * supervisorsPerRoom > teacherNames.length && (
                    <div className="mt-3 flex items-center text-amber-600 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span>عدد الحراس المطلوب أكبر من عدد الأساتذة المتوفرين</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
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
                      <Select
                        value={getFullDayKey(selectedDay)}
                        onValueChange={(value) => {
                          const selected = examDays.find((day) => getFullDayKey(day) === value)
                          if (selected) setSelectedDay(selected)
                        }}
                      >
                        <SelectTrigger id="exam-day" className="pr-10">
                          <SelectValue placeholder="اختر يوم الامتحان" />
                        </SelectTrigger>
                        <SelectContent>
                          {examDays.map((examDay) => (
                            <SelectItem key={getFullDayKey(examDay)} value={getFullDayKey(examDay)}>
                              {examDay.day} {examDay.date}
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
                    جدول توزيع الحراس - {selectedDay.day} {selectedDay.date} - الفترة{" "}
                    {selectedPeriod === "morning" ? "الصباحية" : "المسائية"}
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
                        <TableHead className="text-right">الحارس الرئيسي</TableHead>
                        <TableHead className="text-right">الحارس الثاني</TableHead>
                        <TableHead className="text-right">الحارس الثالث</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.length > 0 ? (
                        filteredRecords.map((record, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{record.room}</TableCell>
                            <TableCell>
                              {record.mainSupervisor}
                              {selectedPeriod === "evening" && (
                                <Badge variant="outline" className="mr-2 bg-blue-50">
                                  رئيسي
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>{record.secondSupervisor}</TableCell>
                            <TableCell>{record.thirdSupervisor}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-6 text-gray-500">
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
              className="flex justify-center"
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
                    طباعة جدول التوزيع
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

