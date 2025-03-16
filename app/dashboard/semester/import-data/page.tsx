"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowLeft,
  Save,
  Upload,
  FileSpreadsheet,
  Users,
  User,
  Building2,
  CheckCircle,
  ShipWheelIcon as Wheelchair,
  Plus,
  Trash2,
  Edit2,
  Printer,
  SplitSquareVertical,
  BookOpen,
  School,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import * as XLSX from "xlsx"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { jsPDF } from "jspdf"
import "jspdf-autotable"
import { getSemesterSettings } from "@/lib/utils/settings-utils"

// Add these types
export type Teacher = {
  id: number
  name: string
  subject?: string
}

export type Student = {
  id: number
  name: string
  class?: string
  studentId?: string
  level?: string
  group?: number
}

export type Room = {
  id: number
  name: string
  type: "regular" | "special"
}

export type ImportedSemesterData = {
  teachers: Teacher[]
  students: Student[]
  rooms: Room[]
  timestamp: number
}

export default function SemesterImportDataPage() {
  const router = useRouter()
  const { toast } = useToast()
  const teachersFileRef = useRef<HTMLInputElement>(null)
  const studentsFileRef = useRef<HTMLInputElement>(null)

  const [teachersFile, setTeachersFile] = useState<File | null>(null)
  const [studentsFile, setStudentsFile] = useState<File | null>(null)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [regularRoomsCount, setRegularRoomsCount] = useState<string>("")
  const [specialRoomsCount, setSpecialRoomsCount] = useState<string>("")
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [currentFileType, setCurrentFileType] = useState<"teachers" | "students" | null>(null)

  // New state for room configuration
  const [showRoomConfig, setShowRoomConfig] = useState<boolean>(false)
  const [rooms, setRooms] = useState<Room[]>([])
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null)
  const [editingRoomName, setEditingRoomName] = useState<string>("")

  // New state for student grouping
  const [showStudentGrouping, setShowStudentGrouping] = useState<boolean>(false)
  const [availableClasses, setAvailableClasses] = useState<string[]>([])
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [groupCount, setGroupCount] = useState<"1" | "2">("1")
  const [groupedStudents, setGroupedStudents] = useState<{
    group1: Student[]
    group2: Student[]
  }>({ group1: [], group2: [] })
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false)

  // Check if there's already imported data
  useEffect(() => {
    try {
      const savedData = localStorage.getItem("semesterImportedData")
      if (savedData) {
        const parsedData: ImportedSemesterData = JSON.parse(savedData)

        // Only use saved data if it's recent (less than 24 hours old)
        const isRecent = Date.now() - parsedData.timestamp < 24 * 60 * 60 * 1000

        if (isRecent) {
          setTeachers(parsedData.teachers)
          setStudents(parsedData.students)

          // Set rooms from saved data
          if (parsedData.rooms && parsedData.rooms.length > 0) {
            setRooms(parsedData.rooms)
            setShowRoomConfig(true)

            // Count regular and special rooms
            const regular = parsedData.rooms.filter((r) => r.type === "regular").length
            const special = parsedData.rooms.filter((r) => r.type === "special").length
            setRegularRoomsCount(regular.toString())
            setSpecialRoomsCount(special.toString())
          }

          // Set files as loaded (we don't have the actual files, but we mark them as loaded)
          if (parsedData.teachers.length > 0) {
            setTeachersFile(new File([], "teachers.xlsx"))
          }
          if (parsedData.students.length > 0) {
            setStudentsFile(new File([], "students.xlsx"))

            // Extract available classes from students
            const classes = [...new Set(parsedData.students.map((student) => student.class).filter(Boolean))]
            setAvailableClasses(classes as string[])

            if (classes.length > 0) {
              setShowStudentGrouping(true)
            }
          }

          toast({
            title: "تم استرجاع البيانات المحفوظة",
            description: "تم استرجاع البيانات التي تم استيرادها سابقاً",
          })
        }
      }
    } catch (error) {
      console.error("Error loading saved data:", error)
    }
  }, [toast])

  // Function to handle teacher file upload
  const handleTeachersFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Check if file is Excel
      if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
        toast({
          title: "خطأ في الملف",
          description: "يرجى اختيار ملف Excel (.xlsx أو .xls)",
          variant: "destructive",
        })
        return
      }

      setTeachersFile(file)
      setCurrentFileType("teachers")
      setIsUploading(true)
      setUploadProgress(0)
      readExcelFile(file, "teachers")
    }
  }

  // Function to handle student file upload
  const handleStudentsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Check if file is Excel
      if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
        toast({
          title: "خطأ في الملف",
          description: "يرجى اختيار ملف Excel (.xlsx أو .xls)",
          variant: "destructive",
        })
        return
      }

      setStudentsFile(file)
      setCurrentFileType("students")
      setIsUploading(true)
      setUploadProgress(0)
      readExcelFile(file, "students")
    }
  }

  // Function to read Excel file
  const readExcelFile = (file: File, type: "teachers" | "students") => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval)
              return 90
            }
            return prev + 10
          })
        }, 200)

        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })

        // Get the first sheet
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        console.log("Excel data imported:", jsonData) // Log the raw data for debugging

        // Check if we have data
        if (jsonData.length === 0) {
          toast({
            title: "ملف فارغ",
            description: "الملف لا يحتوي على بيانات. يرجى التحقق من المحتوى.",
            variant: "destructive",
          })
          setIsUploading(false)
          setUploadProgress(0)
          return
        }

        // Process the data
        if (type === "teachers") {
          // Try to detect the name column by checking common column names
          const possibleNameColumns = ["Name", "name", "الاسم", "اسم", "Teacher", "teacher", "الأستاذ", "استاذ", "مدرس"]

          // Get the first row to inspect the keys
          const firstRow = jsonData[0]
          const rowKeys = Object.keys(firstRow)
          console.log("Excel columns:", rowKeys) // Log column names for debugging

          // Try to find a name column
          let nameColumn = null
          for (const key of rowKeys) {
            if (possibleNameColumns.some((col) => key.toLowerCase().includes(col.toLowerCase()))) {
              nameColumn = key
              break
            }
          }

          // If we couldn't find a name column, use the first column
          if (!nameColumn && rowKeys.length > 0) {
            nameColumn = rowKeys[0]
          }

          console.log("Using name column:", nameColumn) // Log the column we're using for names

          // Process teachers
          const processedTeachers = jsonData.map((row: any, index) => {
            // Get name from detected column or fallback to first property
            let teacherName = nameColumn ? row[nameColumn] : Object.values(row)[0]

            // If name is undefined/null/empty, create a placeholder
            if (!teacherName) {
              teacherName = `أستاذ ${index + 1}`
            }

            // Convert to string if it's not already
            teacherName = String(teacherName).trim()

            return {
              id: index + 1,
              name: teacherName,
              subject: row.Subject || row.subject || row.المادة || row.مادة || "غير محدد",
            }
          })

          console.log("Processed teachers:", processedTeachers) // Log processed teachers for debugging

          setTeachers(processedTeachers)

          // Complete the progress and show success
          setTimeout(() => {
            setUploadProgress(100)
            setTimeout(() => {
              setIsUploading(false)
              setUploadProgress(0)
              toast({
                title: "تم استيراد قائمة الأساتذة",
                description: `تم استيراد ${processedTeachers.length} أستاذ بنجاح`,
              })
            }, 500)
          }, 500)
        } else {
          // Process students with additional fields
          const processedStudents = jsonData.map((row: any, index) => {
            // Try to find student name in various possible columns
            let studentName =
              row.Name || row.name || row.الاسم || row.اسم || row.Student || row.student || row.الطالب || row.طالب

            // If no name found, use first property value
            if (!studentName && Object.values(row).length > 0) {
              studentName = Object.values(row)[0]
            }

            // If still no name, create a placeholder
            if (!studentName) {
              studentName = `طالب ${index + 1}`
            }

            // Convert to string
            studentName = String(studentName).trim()

            // Extract student ID, level, and class
            const studentId =
              row.StudentId || row.studentId || row.ID || row.id || row.رقم_التسجيل || row.رقم || `${index + 1}`
            const level = row.Level || row.level || row.المستوى || row.مستوى || "غير محدد"
            const className = row.Class || row.class || row.القسم || row.قسم || "غير محدد"

            return {
              id: index + 1,
              name: studentName,
              studentId: String(studentId),
              level: String(level),
              class: String(className),
            }
          })

          setStudents(processedStudents)

          // Extract available classes
          const classes = [...new Set(processedStudents.map((student) => student.class).filter(Boolean))]
          setAvailableClasses(classes)

          if (classes.length > 0) {
            setShowStudentGrouping(true)
            setSelectedClass(classes[0])
          }

          // Complete the progress and show success
          setTimeout(() => {
            setUploadProgress(100)
            setTimeout(() => {
              setIsUploading(false)
              setUploadProgress(0)
              toast({
                title: "تم استيراد قائمة الطلاب",
                description: `تم استيراد ${processedStudents.length} طالب بنجاح`,
              })
            }, 500)
          }, 500)
        }
      } catch (error) {
        console.error("Error reading Excel file:", error)
        setIsUploading(false)
        setUploadProgress(0)
        toast({
          title: "خطأ في قراءة الملف",
          description: "حدث خطأ أثناء قراءة ملف Excel. يرجى التأكد من صحة الملف والمحاولة مرة أخرى.",
          variant: "destructive",
        })
      }
    }

    reader.onerror = () => {
      setIsUploading(false)
      setUploadProgress(0)
      toast({
        title: "خطأ في قراءة الملف",
        description: "حدث خطأ أثناء قراءة الملف. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      })
    }

    reader.readAsArrayBuffer(file)
  }

  // Function to generate rooms based on counts
  const generateRooms = () => {
    if (!regularRoomsCount && !specialRoomsCount) {
      toast({
        title: "بيانات غير مكتملة",
        description: "يرجى إدخال عدد القاعات العادية أو الخاصة",
        variant: "destructive",
      })
      return
    }

    const regularCount = Number.parseInt(regularRoomsCount || "0")
    const specialCount = Number.parseInt(specialRoomsCount || "0")

    if (regularCount + specialCount === 0) {
      toast({
        title: "عدد القاعات صفر",
        description: "يجب أن يكون هناك قاعة واحدة على الأقل",
        variant: "destructive",
      })
      return
    }

    // Generate room objects
    const newRooms: Room[] = []

    // Add regular rooms
    for (let i = 1; i <= regularCount; i++) {
      newRooms.push({
        id: i,
        name: `قاعة ${i}`,
        type: "regular",
      })
    }

    // Add special rooms
    for (let i = 1; i <= specialCount; i++) {
      newRooms.push({
        id: regularCount + i,
        name: `قاعة خاصة ${i}`,
        type: "special",
      })
    }

    setRooms(newRooms)
    setShowRoomConfig(true)
  }

  // Function to handle room type change
  const handleRoomTypeChange = (roomId: number, type: "regular" | "special") => {
    setRooms(rooms.map((room) => (room.id === roomId ? { ...room, type } : room)))
  }

  // Function to start editing room name
  const startEditingRoom = (room: Room) => {
    setEditingRoomId(room.id)
    setEditingRoomName(room.name)
  }

  // Function to save edited room name
  const saveRoomName = () => {
    if (!editingRoomName.trim()) {
      toast({
        title: "اسم القاعة فارغ",
        description: "يرجى إدخال اسم للقاعة",
        variant: "destructive",
      })
      return
    }

    setRooms(rooms.map((room) => (room.id === editingRoomId ? { ...room, name: editingRoomName.trim() } : room)))

    setEditingRoomId(null)
    setEditingRoomName("")
  }

  // Function to cancel editing
  const cancelEditing = () => {
    setEditingRoomId(null)
    setEditingRoomName("")
  }

  // Function to divide students into groups
  const divideStudentsIntoGroups = () => {
    if (!selectedClass) {
      toast({
        title: "لم يتم اختيار القسم",
        description: "يرجى اختيار القسم أولاً",
        variant: "destructive",
      })
      return
    }

    // Filter students by selected class
    const classStudents = students.filter((student) => student.class === selectedClass)

    if (classStudents.length === 0) {
      toast({
        title: "لا يوجد طلاب",
        description: "لا يوجد طلاب في القسم المختار",
        variant: "destructive",
      })
      return
    }

    // Shuffle students for random distribution
    const shuffledStudents = [...classStudents].sort(() => Math.random() - 0.5)

    if (groupCount === "1") {
      // All students in one group
      const studentsWithGroup = shuffledStudents.map((student) => ({
        ...student,
        group: 1,
      }))

      setGroupedStudents({
        group1: studentsWithGroup,
        group2: [],
      })

      // Update the main students array with group information
      setStudents(
        students.map((student) => {
          if (student.class === selectedClass) {
            return { ...student, group: 1 }
          }
          return student
        }),
      )

      toast({
        title: "تم تقسيم الطلاب",
        description: `تم وضع ${shuffledStudents.length} طالب في فوج واحد`,
      })
    } else {
      // Divide into two groups
      const halfLength = Math.ceil(shuffledStudents.length / 2)
      const group1 = shuffledStudents.slice(0, halfLength).map((student) => ({
        ...student,
        group: 1,
      }))
      const group2 = shuffledStudents.slice(halfLength).map((student) => ({
        ...student,
        group: 2,
      }))

      setGroupedStudents({
        group1,
        group2,
      })

      // Update the main students array with group information
      setStudents(
        students.map((student) => {
          if (student.class === selectedClass) {
            const inGroup1 = group1.some((g1) => g1.id === student.id)
            return { ...student, group: inGroup1 ? 1 : 2 }
          }
          return student
        }),
      )

      toast({
        title: "تم تقسيم الطلاب",
        description: `تم تقسيم ${shuffledStudents.length} طالب إلى فوجين: ${group1.length} في الفوج الأول و ${group2.length} في الفوج الثاني`,
      })
    }
  }

  // Function to generate PDF for student groups
  const generateStudentGroupsPDF = async () => {
    if (!selectedClass || (groupedStudents.group1.length === 0 && groupedStudents.group2.length === 0)) {
      toast({
        title: "لا يوجد بيانات",
        description: "يرجى تقسيم الطلاب أولاً",
        variant: "destructive",
      })
      return
    }

    setIsGeneratingPDF(true)

    try {
      // Get settings
      const settings = getSemesterSettings()

      // Create PDF document
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      // Set right-to-left mode
      doc.setR2L(true)

      // Function to add header to each page
      const addHeader = () => {
        // Add header
        doc.setFont("Cairo", "bold")
        doc.setFontSize(16)
        doc.text("الجمهورية الجزائرية الديمقراطية الشعبية", doc.internal.pageSize.width / 2, 20, { align: "center" })
        doc.setFontSize(14)
        doc.text("وزارة التربية الوطنية", doc.internal.pageSize.width / 2, 30, { align: "center" })

        // Add school info
        doc.setFontSize(14)
        doc.text(settings.schoolName || "", doc.internal.pageSize.width / 2, 40, { align: "center" })
        doc.text(`السنة الدراسية: ${settings.academicYear || ""}`, doc.internal.pageSize.width / 2, 50, {
          align: "center",
        })

        // Add document title
        doc.setFontSize(18)
        doc.text(`قائمة تلاميذ القسم: ${selectedClass}`, doc.internal.pageSize.width / 2, 60, { align: "center" })

        // Add exam session
        doc.setFontSize(14)
        doc.text(`${settings.examSession || ""}`, doc.internal.pageSize.width / 2, 70, { align: "center" })
      }

      // Function to add footer to each page
      const addFooter = () => {
        // Add signature
        doc.text(
          settings.principalName || "مدير المؤسسة",
          doc.internal.pageSize.width - 30,
          doc.internal.pageSize.height - 30,
        )
        doc.text("الختم والإمضاء", doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 20)

        // Add date
        const today = new Date()
        const dateStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`
        doc.text(`تاريخ الإصدار: ${dateStr}`, 20, doc.internal.pageSize.height - 10)
      }

      // Function to add a group table
      const addGroupTable = (group: Student[], groupNumber: number) => {
        // Add header to the page
        addHeader()

        // Add group title
        doc.setFontSize(16)
        doc.text(`الفوج ${groupNumber}`, doc.internal.pageSize.width / 2, 80, { align: "center" })

        // Create table data
        const tableColumn = ["الرقم", "رقم التسجيل", "الاسم واللقب"]
        const tableRows = group.map((student, index) => [index + 1, student.studentId || "-", student.name])

        // Add table
        ;(doc as any).autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: 90,
          styles: { font: "Cairo", halign: "right", fontSize: 10 },
          headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
          columnStyles: {
            0: { halign: "center", cellWidth: 15 },
            1: { cellWidth: 30 },
            2: { cellWidth: 120 },
          },
        })

        // Add footer
        addFooter()
      }

      // Add Group 1 table on first page
      if (groupedStudents.group1.length > 0) {
        addGroupTable(groupedStudents.group1, 1)
      }

      // Add Group 2 table on second page if exists
      if (groupedStudents.group2.length > 0) {
        doc.addPage()
        addGroupTable(groupedStudents.group2, 2)
      }

      // Save the PDF
      doc.save(`قائمة_تلاميذ_${selectedClass}.pdf`)

      toast({
        title: "تم إنشاء الملف بنجاح",
        description: "تم إنشاء ملف PDF لقوائم الطلاب",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "خطأ في إنشاء الملف",
        description: "حدث خطأ أثناء إنشاء ملف PDF",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  // Function to handle save
  const handleSave = () => {
    // Validate all inputs are provided
    if (!teachersFile || !studentsFile || rooms.length === 0) {
      toast({
        title: "بيانات غير مكتملة",
        description: "يرجى استكمال جميع البيانات المطلوبة قبل الحفظ",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    // Save data to localStorage
    try {
      const dataToSave: ImportedSemesterData = {
        teachers,
        students,
        rooms,
        timestamp: Date.now(),
      }

      localStorage.setItem("semesterImportedData", JSON.stringify(dataToSave))

      // Simulate saving process
      setTimeout(() => {
        setIsSaving(false)
        toast({
          title: "تم حفظ البيانات",
          description: "تم حفظ جميع البيانات بنجاح",
        })

        // Navigate to supervision page after saving
        setTimeout(() => {
          router.push("/dashboard/semester/supervision")
        }, 1000)
      }, 1500)
    } catch (error) {
      console.error("Error saving data:", error)
      setIsSaving(false)
      toast({
        title: "خطأ في حفظ البيانات",
        description: "حدث خطأ أثناء حفظ البيانات. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center mb-8">
          <Link href="/dashboard/semester">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold mr-4">استيراد البيانات</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Teachers Import Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card className="h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <User className="h-6 w-6 text-blue-500 mr-2" />
                    <h2 className="text-xl font-semibold">قائمة الأساتذة</h2>
                  </div>
                  {teachers.length > 0 && (
                    <div className="bg-blue-100 text-blue-700 rounded-full px-3 py-1 flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span className="font-medium">{teachers.length} أستاذ</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <input
                      type="file"
                      ref={teachersFileRef}
                      onChange={handleTeachersFileChange}
                      className="hidden"
                      accept=".xlsx,.xls"
                    />

                    {!teachersFile ? (
                      <div className="cursor-pointer" onClick={() => teachersFileRef.current?.click()}>
                        <FileSpreadsheet className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-500 mb-1">اضغط لاختيار ملف Excel</p>
                        <p className="text-xs text-gray-400">(.xlsx, .xls)</p>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-center mb-2">
                          <FileSpreadsheet className="h-8 w-8 text-green-500 mr-2" />
                          <span className="font-medium text-green-600">{teachersFile.name}</span>
                        </div>

                        <div className="flex justify-center">
                          <Button variant="outline" size="sm" onClick={() => teachersFileRef.current?.click()}>
                            <Upload className="h-4 w-4 mr-1" />
                            تغيير الملف
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {teachers.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <p className="text-green-700 text-sm">
                        تم التحقق من صحة الملف وقراءة بيانات {teachers.length} أستاذ بنجاح
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Students Import Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Users className="h-6 w-6 text-indigo-500 mr-2" />
                    <h2 className="text-xl font-semibold">قائمة التلاميذ</h2>
                  </div>
                  {students.length > 0 && (
                    <div className="bg-indigo-100 text-indigo-700 rounded-full px-3 py-1 flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span className="font-medium">{students.length} تلميذ</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <input
                      type="file"
                      ref={studentsFileRef}
                      onChange={handleStudentsFileChange}
                      className="hidden"
                      accept=".xlsx,.xls"
                    />

                    {!studentsFile ? (
                      <div className="cursor-pointer" onClick={() => studentsFileRef.current?.click()}>
                        <FileSpreadsheet className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-500 mb-1">اضغط لاختيار ملف Excel</p>
                        <p className="text-xs text-gray-400">(.xlsx, .xls)</p>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-center mb-2">
                          <FileSpreadsheet className="h-8 w-8 text-green-500 mr-2" />
                          <span className="font-medium text-green-600">{studentsFile.name}</span>
                        </div>

                        <div className="flex justify-center">
                          <Button variant="outline" size="sm" onClick={() => studentsFileRef.current?.click()}>
                            <Upload className="h-4 w-4 mr-1" />
                            تغيير الملف
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {students.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <p className="text-green-700 text-sm">
                        تم التحقق من صحة الملف وقراءة بيانات {students.length} تلميذ بنجاح
                      </p>
                    </div>
                  )}
                  {students.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium mb-2">معاينة البيانات المستوردة:</h3>
                      <div className="max-h-60 overflow-y-auto border rounded-md">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 sticky top-0">
                            <tr>
                              <th className="p-2 text-right">الرقم</th>
                              <th className="p-2 text-right">رقم التسجيل</th>
                              <th className="p-2 text-right">الاسم</th>
                              <th className="p-2 text-right">القسم</th>
                              <th className="p-2 text-right">المستوى</th>
                            </tr>
                          </thead>
                          <tbody>
                            {students.slice(0, 10).map((student) => (
                              <tr key={student.id} className="border-t hover:bg-gray-50">
                                <td className="p-2">{student.id}</td>
                                <td className="p-2">{student.studentId || "-"}</td>
                                <td className="p-2">{student.name}</td>
                                <td className="p-2">{student.class || "-"}</td>
                                <td className="p-2">{student.level || "-"}</td>
                              </tr>
                            ))}
                            {students.length > 10 && (
                              <tr className="border-t">
                                <td colSpan={5} className="p-2 text-center text-gray-500 italic">
                                  ... و {students.length - 10} تلميذ آخر
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Student Grouping Section */}
        {showStudentGrouping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <School className="h-6 w-6 text-amber-500 mr-2" />
                  <h2 className="text-xl font-semibold">تقسيم التلاميذ حسب القسم</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="class-select">اختر القسم</Label>
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger id="class-select" className="w-full">
                        <SelectValue placeholder="اختر القسم" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableClasses.map((className) => (
                          <SelectItem key={className} value={className}>
                            {className}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="group-count">عدد الأفواج</Label>
                    <RadioGroup
                      value={groupCount}
                      onValueChange={(value) => setGroupCount(value as "1" | "2")}
                      className="flex space-x-4 space-x-reverse"
                    >
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="1" id="group-1" />
                        <Label htmlFor="group-1">فوج واحد</Label>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="2" id="group-2" />
                        <Label htmlFor="group-2">فوجين</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <div className="flex justify-center mb-6">
                  <Button
                    onClick={divideStudentsIntoGroups}
                    className="flex items-center gap-2"
                    disabled={!selectedClass}
                  >
                    <SplitSquareVertical className="h-4 w-4" />
                    تقسيم التلاميذ
                  </Button>
                </div>

                {(groupedStudents.group1.length > 0 || groupedStudents.group2.length > 0) && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-700 mb-2 flex items-center">
                        <BookOpen className="h-5 w-5 mr-2" />
                        نتائج التقسيم للقسم: {selectedClass}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-3 shadow-sm">
                          <h4 className="font-medium text-gray-700 mb-2">
                            الفوج الأول: {groupedStudents.group1.length} تلميذ
                          </h4>
                          <div className="max-h-40 overflow-y-auto">
                            <ul className="text-sm space-y-1">
                              {groupedStudents.group1.slice(0, 5).map((student) => (
                                <li key={student.id} className="text-gray-600">
                                  {student.name}
                                </li>
                              ))}
                              {groupedStudents.group1.length > 5 && (
                                <li className="text-gray-500 italic">
                                  و {groupedStudents.group1.length - 5} تلميذ آخر...
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>

                        {groupedStudents.group2.length > 0 && (
                          <div className="bg-white rounded-lg p-3 shadow-sm">
                            <h4 className="font-medium text-gray-700 mb-2">
                              الفوج الثاني: {groupedStudents.group2.length} تلميذ
                            </h4>
                            <div className="max-h-40 overflow-y-auto">
                              <ul className="text-sm space-y-1">
                                {groupedStudents.group2.slice(0, 5).map((student) => (
                                  <li key={student.id} className="text-gray-600">
                                    {student.name}
                                  </li>
                                ))}
                                {groupedStudents.group2.length > 5 && (
                                  <li className="text-gray-500 italic">
                                    و {groupedStudents.group2.length - 5} تلميذ آخر...
                                  </li>
                                )}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <Button
                        onClick={generateStudentGroupsPDF}
                        variant="outline"
                        className="flex items-center gap-2"
                        disabled={isGeneratingPDF}
                      >
                        <Printer className="h-4 w-4" />
                        {isGeneratingPDF ? "جاري إنشاء الملف..." : "طباعة قوائم التلاميذ"}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Room Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Building2 className="h-6 w-6 text-amber-500 mr-2" />
                معلومات القاعات
              </h2>

              {!showRoomConfig ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="regular-rooms-count">عدد القاعات العادية</Label>
                      <div className="relative">
                        <Building2 className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          id="regular-rooms-count"
                          type="number"
                          min="0"
                          placeholder="أدخل عدد القاعات العادية"
                          className="pr-10"
                          value={regularRoomsCount}
                          onChange={(e) => setRegularRoomsCount(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="special-rooms-count">عدد القاعات الخاصة</Label>
                      <div className="relative">
                        <Wheelchair className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          id="special-rooms-count"
                          type="number"
                          min="0"
                          placeholder="أدخل عدد القاعات الخاصة"
                          className="pr-10"
                          value={specialRoomsCount}
                          onChange={(e) => setSpecialRoomsCount(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-center">
                    <Button onClick={generateRooms} className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      إنشاء القاعات
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">إجمالي عدد القاعات:</span>
                      <span className="font-medium">{rooms.length}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowRoomConfig(false)}
                      className="flex items-center gap-1"
                    >
                      <Edit2 className="h-4 w-4" />
                      تعديل العدد
                    </Button>
                  </div>

                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="p-2 text-right">اسم القاعة</th>
                          <th className="p-2 text-right">نوع القاعة</th>
                          <th className="p-2 text-center">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rooms.map((room) => (
                          <tr key={room.id} className="border-t">
                            <td className="p-2">
                              {editingRoomId === room.id ? (
                                <Input
                                  value={editingRoomName}
                                  onChange={(e) => setEditingRoomName(e.target.value)}
                                  className="h-8"
                                  autoFocus
                                />
                              ) : (
                                room.name
                              )}
                            </td>
                            <td className="p-2">
                              <RadioGroup
                                value={room.type}
                                onValueChange={(value) => handleRoomTypeChange(room.id, value as "regular" | "special")}
                                className="flex space-x-2 space-x-reverse"
                              >
                                <div className="flex items-center space-x-2 space-x-reverse">
                                  <RadioGroupItem value="regular" id={`regular-${room.id}`} />
                                  <Label htmlFor={`regular-${room.id}`}>عادية</Label>
                                </div>
                                <div className="flex items-center space-x-2 space-x-reverse">
                                  <RadioGroupItem value="special" id={`special-${room.id}`} />
                                  <Label htmlFor={`special-${room.id}`}>خاصة</Label>
                                </div>
                              </RadioGroup>
                            </td>
                            <td className="p-2 text-center">
                              {editingRoomId === room.id ? (
                                <div className="flex gap-2 justify-center">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={saveRoomName}
                                    className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={cancelEditing}
                                    className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => startEditingRoom(room)}
                                  className="h-8 px-2"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-700 text-sm">
                      <span className="font-medium">ملاحظة:</span> القاعات العادية تحتاج إلى حارس واحد، بينما القاعات
                      الخاصة تحتاج إلى حارسين.
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Upload Progress */}
        {isUploading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm mb-2">
                  {currentFileType === "teachers" ? "جاري معالجة ملف الأساتذة..." : "جاري معالجة ملف الطلاب..."}
                </p>
                <Progress value={uploadProgress} className="h-2" />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="flex justify-end"
        >
          <Button
            size="lg"
            className="px-8 flex items-center gap-2"
            onClick={handleSave}
            disabled={isSaving || !teachersFile || !studentsFile || rooms.length === 0}
          >
            <Save className="h-5 w-5" />
            {isSaving ? "جاري الحفظ..." : "حفظ البيانات"}
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

