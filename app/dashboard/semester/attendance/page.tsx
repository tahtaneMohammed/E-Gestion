"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowLeft,
  Users,
  User,
  Clock,
  Calendar,
  Save,
  FileUp,
  AlertCircle,
  Search,
  CheckCircle,
  XCircle,
  Clock4,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ImportedSemesterData, Teacher, Student } from "../import-data/page"

// Type definitions
type AttendanceStatus = "present" | "absent" | "late"

type TeacherAttendance = {
  teacher: Teacher
  status: AttendanceStatus
  date: string
  period: "morning" | "evening"
  notes?: string
}

type StudentAttendance = {
  student: Student
  status: AttendanceStatus
  date: string
  period: "morning" | "evening"
  notes?: string
}

type AttendanceRecord = {
  id: string
  date: string
  day: string
  period: "morning" | "evening"
  teacherAttendance: TeacherAttendance[]
  studentAttendance: StudentAttendance[]
}

const examDays = [
  "الأحد 2024/06/16",
  "الإثنين 2024/06/17",
  "الثلاثاء 2024/06/18",
  "الأربعاء 2024/06/19",
  "الخميس 2024/06/20",
]

export default function SemesterAttendanceManagementPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<"teachers" | "students">("teachers")
  const [selectedDay, setSelectedDay] = useState<string>(examDays[0])
  const [selectedPeriod, setSelectedPeriod] = useState<"morning" | "evening">("morning")
  const [searchQuery, setSearchQuery] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // State for imported data
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [hasImportedData, setHasImportedData] = useState<boolean>(false)

  // State for attendance
  const [teacherAttendance, setTeacherAttendance] = useState<Record<string, AttendanceStatus>>({})
  const [studentAttendance, setStudentAttendance] = useState<Record<string, AttendanceStatus>>({})
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])

  // Filtered lists
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])

  // Load imported data
  useEffect(() => {
    try {
      const savedData = localStorage.getItem("semesterImportedData")
      if (savedData) {
        const parsedData: ImportedSemesterData = JSON.parse(savedData)

        // Only use saved data if it's recent (less than 24 hours old)
        const isRecent = Date.now() - parsedData.timestamp < 24 * 60 * 60 * 1000

        if (isRecent) {
          setTeachers(parsedData.teachers || [])
          setStudents(parsedData.students || [])

          if (
            (parsedData.teachers && parsedData.teachers.length > 0) ||
            (parsedData.students && parsedData.students.length > 0)
          ) {
            setHasImportedData(true)

            toast({
              title: "تم تحميل البيانات",
              description: `تم تحميل ${parsedData.teachers?.length || 0} أستاذ و ${parsedData.students?.length || 0} تلميذ`,
            })
          } else {
            setHasImportedData(false)
            toast({
              title: "بيانات غير مكتملة",
              description: "لم يتم العثور على بيانات كاملة للأساتذة والتلاميذ",
              variant: "destructive",
            })
          }
        } else {
          setHasImportedData(false)
          toast({
            title: "بيانات قديمة",
            description: "البيانات المحفوظة قديمة، يرجى استيراد بيانات جديدة",
            variant: "destructive",
          })
        }
      } else {
        setHasImportedData(false)
        toast({
          title: "لم يتم العثور على بيانات",
          description: "يرجى استيراد البيانات أولاً من صفحة استيراد البيانات",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading imported data:", error)
      setHasImportedData(false)
    }
  }, [toast])

  // Load saved attendance records
  useEffect(() => {
    try {
      const savedRecords = localStorage.getItem("semesterAttendanceRecords")
      if (savedRecords) {
        const parsedRecords: AttendanceRecord[] = JSON.parse(savedRecords)
        setAttendanceRecords(parsedRecords)

        // Load attendance for current day and period if exists
        const currentRecord = parsedRecords.find(
          (record) => record.day === selectedDay && record.period === selectedPeriod,
        )

        if (currentRecord) {
          // Convert teacher attendance array to record
          const teacherStatusMap: Record<string, AttendanceStatus> = {}
          currentRecord.teacherAttendance.forEach((item) => {
            teacherStatusMap[item.teacher.id.toString()] = item.status
          })
          setTeacherAttendance(teacherStatusMap)

          // Convert student attendance array to record
          const studentStatusMap: Record<string, AttendanceStatus> = {}
          currentRecord.studentAttendance.forEach((item) => {
            studentStatusMap[item.student.id.toString()] = item.status
          })
          setStudentAttendance(studentStatusMap)
        }
      }
    } catch (error) {
      console.error("Error loading attendance records:", error)
    }
  }, [selectedDay, selectedPeriod])

  // Filter lists based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTeachers(teachers)
      setFilteredStudents(students)
      return
    }

    const query = searchQuery.toLowerCase()

    const filteredTeachers = teachers.filter(
      (teacher) =>
        teacher.name.toLowerCase().includes(query) ||
        (teacher.subject && teacher.subject.toLowerCase().includes(query)),
    )
    setFilteredTeachers(filteredTeachers)

    const filteredStudents = students.filter(
      (student) =>
        student.name.toLowerCase().includes(query) || (student.class && student.class.toLowerCase().includes(query)),
    )
    setFilteredStudents(filteredStudents)
  }, [searchQuery, teachers, students])

  // Initialize filtered lists
  useEffect(() => {
    setFilteredTeachers(teachers)
    setFilteredStudents(students)
  }, [teachers, students])

  // Handle attendance status change
  const handleTeacherStatusChange = (teacherId: number, status: AttendanceStatus) => {
    setTeacherAttendance((prev) => ({
      ...prev,
      [teacherId]: status,
    }))
  }

  const handleStudentStatusChange = (studentId: number, status: AttendanceStatus) => {
    setStudentAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }))
  }

  // Save attendance records
  const saveAttendanceRecords = () => {
    setIsSaving(true)

    try {
      // Create new attendance record
      const teacherAttendanceArray: TeacherAttendance[] = teachers
        .filter((teacher) => teacherAttendance[teacher.id])
        .map((teacher) => ({
          teacher,
          status: teacherAttendance[teacher.id] || "present",
          date: new Date().toISOString(),
          period: selectedPeriod,
        }))

      const studentAttendanceArray: StudentAttendance[] = students
        .filter((student) => studentAttendance[student.id])
        .map((student) => ({
          student,
          status: studentAttendance[student.id] || "present",
          date: new Date().toISOString(),
          period: selectedPeriod,
        }))

      // Create or update record for current day and period
      const existingRecordIndex = attendanceRecords.findIndex(
        (record) => record.day === selectedDay && record.period === selectedPeriod,
      )

      let newRecords: AttendanceRecord[]

      if (existingRecordIndex >= 0) {
        // Update existing record
        newRecords = [...attendanceRecords]
        newRecords[existingRecordIndex] = {
          ...newRecords[existingRecordIndex],
          teacherAttendance: teacherAttendanceArray,
          studentAttendance: studentAttendanceArray,
        }
      } else {
        // Create new record
        const newRecord: AttendanceRecord = {
          id: `${selectedDay}-${selectedPeriod}-${Date.now()}`,
          date: new Date().toISOString(),
          day: selectedDay,
          period: selectedPeriod,
          teacherAttendance: teacherAttendanceArray,
          studentAttendance: studentAttendanceArray,
        }
        newRecords = [...attendanceRecords, newRecord]
      }

      // Save to localStorage
      localStorage.setItem("semesterAttendanceRecords", JSON.stringify(newRecords))
      setAttendanceRecords(newRecords)

      // Create document entry
      const absentTeachers = teacherAttendanceArray.filter((item) => item.status === "absent").length
      const lateTeachers = teacherAttendanceArray.filter((item) => item.status === "late").length
      const absentStudents = studentAttendanceArray.filter((item) => item.status === "absent").length
      const lateStudents = studentAttendanceArray.filter((item) => item.status === "late").length

      // Save document to documents list
      const documentsData = localStorage.getItem("semesterDocuments") || "[]"
      const documents = JSON.parse(documentsData)

      const documentExists = documents.some(
        (doc: any) => doc.day === selectedDay && doc.period === selectedPeriod && doc.type === "attendance",
      )

      if (!documentExists) {
        const newDocument = {
          id: `attendance-${selectedDay}-${selectedPeriod}-${Date.now()}`,
          title: `محضر الغياب - ${selectedDay} - الفترة ${selectedPeriod === "morning" ? "الصباحية" : "المسائية"}`,
          type: "attendance",
          date: new Date().toISOString().split("T")[0],
          day: selectedDay,
          period: selectedPeriod,
          status: "ready",
          summary: {
            absentTeachers,
            lateTeachers,
            absentStudents,
            lateStudents,
          },
        }

        documents.push(newDocument)
        localStorage.setItem("semesterDocuments", JSON.stringify(documents))
      } else {
        // Update existing document
        const updatedDocuments = documents.map((doc: any) => {
          if (doc.day === selectedDay && doc.period === selectedPeriod && doc.type === "attendance") {
            return {
              ...doc,
              summary: {
                absentTeachers,
                lateTeachers,
                absentStudents,
                lateStudents,
              },
            }
          }
          return doc
        })
        localStorage.setItem("semesterDocuments", JSON.stringify(updatedDocuments))
      }

      toast({
        title: "تم حفظ سجلات الحضور",
        description: "تم حفظ سجلات الحضور والغياب بنجاح",
      })
    } catch (error) {
      console.error("Error saving attendance records:", error)
      toast({
        title: "خطأ في حفظ السجلات",
        description: "حدث خطأ أثناء حفظ سجلات الحضور والغياب",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Navigate to import data page
  const goToImportData = () => {
    router.push("/dashboard/semester/import-data")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center mb-8">
          <Link href="/dashboard/semester">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold mr-4">تسيير الحضور والغياب</h1>
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
                      يجب استيراد بيانات الأساتذة والتلاميذ أولاً من صفحة استيراد البيانات قبل تسجيل الحضور والغياب.
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

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="exam-day" className="text-sm font-medium">
                    يوم الامتحان
                  </label>
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
                  <label htmlFor="exam-period" className="text-sm font-medium">
                    فترة الامتحان
                  </label>
                  <div className="relative">
                    <Clock className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                    <Select
                      value={selectedPeriod}
                      onValueChange={(value: "morning" | "evening") => setSelectedPeriod(value)}
                    >
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

                <div className="space-y-2">
                  <label htmlFor="search" className="text-sm font-medium">
                    بحث
                  </label>
                  <div className="relative">
                    <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="بحث عن اسم أو مادة أو قسم..."
                      className="pr-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Attendance Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "teachers" | "students")}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="teachers" className="text-base py-3">
                    <User className="h-5 w-5 mr-2" />
                    حضور الأساتذة
                  </TabsTrigger>
                  <TabsTrigger value="students" className="text-base py-3">
                    <Users className="h-5 w-5 mr-2" />
                    حضور التلاميذ
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="teachers">
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[60px] text-center">الرقم</TableHead>
                          <TableHead>اسم الأستاذ</TableHead>
                          <TableHead className="w-[150px]">المادة</TableHead>
                          <TableHead className="w-[200px] text-center">الحالة</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTeachers.length > 0 ? (
                          filteredTeachers.map((teacher, index) => (
                            <TableRow key={teacher.id}>
                              <TableCell className="text-center">{index + 1}</TableCell>
                              <TableCell className="font-medium">{teacher.name}</TableCell>
                              <TableCell>{teacher.subject || "غير محدد"}</TableCell>
                              <TableCell>
                                <div className="flex justify-center gap-2">
                                  <Button
                                    variant={teacherAttendance[teacher.id] === "present" ? "default" : "outline"}
                                    size="sm"
                                    className={`h-9 px-3 ${
                                      teacherAttendance[teacher.id] === "present"
                                        ? "bg-green-600 hover:bg-green-700"
                                        : ""
                                    }`}
                                    onClick={() => handleTeacherStatusChange(teacher.id, "present")}
                                  >
                                    <CheckCircle className="h-5 w-5 mr-1" />
                                    حاضر
                                  </Button>
                                  <Button
                                    variant={teacherAttendance[teacher.id] === "absent" ? "default" : "outline"}
                                    size="sm"
                                    className={`h-9 px-3 ${
                                      teacherAttendance[teacher.id] === "absent" ? "bg-red-600 hover:bg-red-700" : ""
                                    }`}
                                    onClick={() => handleTeacherStatusChange(teacher.id, "absent")}
                                  >
                                    <XCircle className="h-5 w-5 mr-1" />
                                    غائب
                                  </Button>
                                  <Button
                                    variant={teacherAttendance[teacher.id] === "late" ? "default" : "outline"}
                                    size="sm"
                                    className={`h-9 px-3 ${
                                      teacherAttendance[teacher.id] === "late" ? "bg-amber-600 hover:bg-amber-700" : ""
                                    }`}
                                    onClick={() => handleTeacherStatusChange(teacher.id, "late")}
                                  >
                                    <Clock4 className="h-5 w-5 mr-1" />
                                    متأخر
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-10 text-gray-500">
                              {searchQuery ? (
                                <div className="flex flex-col items-center">
                                  <Search className="h-8 w-8 mb-2 text-gray-400" />
                                  <span>لم يتم العثور على نتائج للبحث</span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center">
                                  <User className="h-8 w-8 mb-2 text-gray-400" />
                                  <span>لا توجد بيانات للأساتذة</span>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {filteredTeachers.length > 0 && (
                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex gap-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          حاضر: {Object.values(teacherAttendance).filter((status) => status === "present").length}
                        </Badge>
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 px-3 py-1">
                          <XCircle className="h-4 w-4 mr-1" />
                          غائب: {Object.values(teacherAttendance).filter((status) => status === "absent").length}
                        </Badge>
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 px-3 py-1">
                          <Clock4 className="h-4 w-4 mr-1" />
                          متأخر: {Object.values(teacherAttendance).filter((status) => status === "late").length}
                        </Badge>
                      </div>
                      <div>
                        {searchQuery && (
                          <span className="text-sm text-gray-500">تم العثور على {filteredTeachers.length} أستاذ</span>
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="students">
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[60px] text-center">الرقم</TableHead>
                          <TableHead>اسم التلميذ</TableHead>
                          <TableHead className="w-[150px]">القسم</TableHead>
                          <TableHead className="w-[200px] text-center">الحالة</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.length > 0 ? (
                          filteredStudents.map((student, index) => (
                            <TableRow key={student.id}>
                              <TableCell className="text-center">{index + 1}</TableCell>
                              <TableCell className="font-medium">{student.name}</TableCell>
                              <TableCell>{student.class || "غير محدد"}</TableCell>
                              <TableCell>
                                <div className="flex justify-center gap-2">
                                  <Button
                                    variant={studentAttendance[student.id] === "present" ? "default" : "outline"}
                                    size="sm"
                                    className={`h-9 px-3 ${
                                      studentAttendance[student.id] === "present"
                                        ? "bg-green-600 hover:bg-green-700"
                                        : ""
                                    }`}
                                    onClick={() => handleStudentStatusChange(student.id, "present")}
                                  >
                                    <CheckCircle className="h-5 w-5 mr-1" />
                                    حاضر
                                  </Button>
                                  <Button
                                    variant={studentAttendance[student.id] === "absent" ? "default" : "outline"}
                                    size="sm"
                                    className={`h-9 px-3 ${
                                      studentAttendance[student.id] === "absent" ? "bg-red-600 hover:bg-red-700" : ""
                                    }`}
                                    onClick={() => handleStudentStatusChange(student.id, "absent")}
                                  >
                                    <XCircle className="h-5 w-5 mr-1" />
                                    غائب
                                  </Button>
                                  <Button
                                    variant={studentAttendance[student.id] === "late" ? "default" : "outline"}
                                    size="sm"
                                    className={`h-9 px-3 ${
                                      studentAttendance[student.id] === "late" ? "bg-amber-600 hover:bg-amber-700" : ""
                                    }`}
                                    onClick={() => handleStudentStatusChange(student.id, "late")}
                                  >
                                    <Clock4 className="h-5 w-5 mr-1" />
                                    متأخر
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-10 text-gray-500">
                              {searchQuery ? (
                                <div className="flex flex-col items-center">
                                  <Search className="h-8 w-8 mb-2 text-gray-400" />
                                  <span>لم يتم العثور على نتائج للبحث</span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center">
                                  <Users className="h-8 w-8 mb-2 text-gray-400" />
                                  <span>لا توجد بيانات للتلاميذ</span>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {filteredStudents.length > 0 && (
                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex gap-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          حاضر: {Object.values(studentAttendance).filter((status) => status === "present").length}
                        </Badge>
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 px-3 py-1">
                          <XCircle className="h-4 w-4 mr-1" />
                          غائب: {Object.values(studentAttendance).filter((status) => status === "absent").length}
                        </Badge>
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 px-3 py-1">
                          <Clock4 className="h-4 w-4 mr-1" />
                          متأخر: {Object.values(studentAttendance).filter((status) => status === "late").length}
                        </Badge>
                      </div>
                      <div>
                        {searchQuery && (
                          <span className="text-sm text-gray-500">تم العثور على {filteredStudents.length} تلميذ</span>
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="flex justify-center"
        >
          <Button
            size="lg"
            className="px-8 flex items-center gap-2"
            onClick={saveAttendanceRecords}
            disabled={isSaving || !hasImportedData}
          >
            {isSaving ? (
              <>
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                حفظ سجلات الحضور والغياب
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

