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
  Shield,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import * as XLSX from "xlsx"

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
}

export type ImportedData = {
  teachers: Teacher[]
  students: Student[]
  roomsCount: number
  supervisorsPerRoom: number
  timestamp: number
}

export default function ImportDataPage() {
  const router = useRouter()
  const { toast } = useToast()
  const teachersFileRef = useRef<HTMLInputElement>(null)
  const studentsFileRef = useRef<HTMLInputElement>(null)

  const [teachersFile, setTeachersFile] = useState<File | null>(null)
  const [studentsFile, setStudentsFile] = useState<File | null>(null)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [roomsCount, setRoomsCount] = useState<string>("")
  const [supervisorsPerRoom, setSupervisorsPerRoom] = useState<string>("")
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [currentFileType, setCurrentFileType] = useState<"teachers" | "students" | null>(null)

  // Check if there's already imported data
  useEffect(() => {
    try {
      const savedData = localStorage.getItem("importedData")
      if (savedData) {
        const parsedData: ImportedData = JSON.parse(savedData)

        // Only use saved data if it's recent (less than 24 hours old)
        const isRecent = Date.now() - parsedData.timestamp < 24 * 60 * 60 * 1000

        if (isRecent) {
          setTeachers(parsedData.teachers)
          setStudents(parsedData.students)
          setRoomsCount(parsedData.roomsCount.toString())
          setSupervisorsPerRoom(parsedData.supervisorsPerRoom.toString())

          // Set files as loaded (we don't have the actual files, but we mark them as loaded)
          if (parsedData.teachers.length > 0) {
            setTeachersFile(new File([], "teachers.xlsx"))
          }
          if (parsedData.students.length > 0) {
            setStudentsFile(new File([], "students.xlsx"))
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
          // Similar processing for students...
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

            return {
              id: index + 1,
              name: studentName,
              class: row.Class || row.class || row.القسم || row.قسم || "غير محدد",
            }
          })

          setStudents(processedStudents)

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

  // Function to handle save
  const handleSave = () => {
    // Validate all inputs are provided
    if (!teachersFile || !studentsFile || !roomsCount || !supervisorsPerRoom) {
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
      const dataToSave: ImportedData = {
        teachers,
        students,
        roomsCount: Number.parseInt(roomsCount),
        supervisorsPerRoom: Number.parseInt(supervisorsPerRoom),
        timestamp: Date.now(),
      }

      localStorage.setItem("importedData", JSON.stringify(dataToSave))

      // Simulate saving process
      setTimeout(() => {
        setIsSaving(false)
        toast({
          title: "تم حفظ البيانات",
          description: "تم حفظ جميع البيانات بنجاح",
        })

        // Navigate to supervision page after saving
        setTimeout(() => {
          router.push("/dashboard/official/supervision")
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
          <Link href="/dashboard/official">
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
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

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
                معلومات القاعات والحراسة
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="rooms-count">عدد قاعات الامتحان</Label>
                  <div className="relative">
                    <Building2 className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="rooms-count"
                      type="number"
                      min="1"
                      placeholder="أدخل عدد القاعات"
                      className="pr-10"
                      value={roomsCount}
                      onChange={(e) => setRoomsCount(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supervisors-count">عدد الأساتذة الحراس في كل قاعة</Label>
                  <div className="relative">
                    <Shield className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="supervisors-count"
                      type="number"
                      min="1"
                      placeholder="أدخل عدد الحراس لكل قاعة"
                      className="pr-10"
                      value={supervisorsPerRoom}
                      onChange={(e) => setSupervisorsPerRoom(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {roomsCount && supervisorsPerRoom && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-700 text-sm">
                    إجمالي عدد الحراس المطلوبين:{" "}
                    <strong>{Number.parseInt(roomsCount) * Number.parseInt(supervisorsPerRoom)}</strong> أستاذ
                  </p>

                  {teachers.length > 0 &&
                    Number.parseInt(roomsCount) * Number.parseInt(supervisorsPerRoom) > teachers.length && (
                      <div className="mt-2 flex items-center text-amber-600 text-sm">
                        <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span>تنبيه: عدد الحراس المطلوب أكبر من عدد الأساتذة المتوفرين</span>
                      </div>
                    )}
                </div>
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
            disabled={isSaving || !teachersFile || !studentsFile || !roomsCount || !supervisorsPerRoom}
          >
            <Save className="h-5 w-5" />
            {isSaving ? "جاري الحفظ..." : "حفظ البيانات"}
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

