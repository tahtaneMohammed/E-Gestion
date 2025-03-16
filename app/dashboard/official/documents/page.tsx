"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  ArrowLeft,
  Download,
  FileText,
  Printer,
  ClipboardList,
  CalendarDays,
  UserX,
  Send,
  ExternalLink,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { downloadPDF } from "../supervision/pdf-generator"
import { getOfficialSettings } from "@/lib/settings-utils"

// Types
type DocumentType = {
  id: string
  title: string
  type: "supervision" | "attendance" | "report" | "official"
  date: string
  day: string
  period: "morning" | "evening"
  status: "ready" | "draft" | "pending"
}

export default function OfficialDocumentsPage() {
  const { toast } = useToast()
  const [documents, setDocuments] = useState<DocumentType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const settings = getOfficialSettings()

  // Load saved documents
  useEffect(() => {
    // In a real app, this would load from a database or localStorage
    // For this demo, we'll create some sample documents
    const loadDocuments = () => {
      setIsLoading(true)

      // Check if we have supervision data in localStorage
      const savedData = localStorage.getItem("supervisionSchedule")

      // Create sample documents
      const sampleDocuments: DocumentType[] = [
        {
          id: "doc1",
          title: "جدول توزيع الحراس - الأحد 2024/06/16 - الفترة الصباحية",
          type: "supervision",
          date: "2024/06/16",
          day: "الأحد 2024/06/16",
          period: "morning",
          status: "ready",
        },
        {
          id: "doc2",
          title: "جدول توزيع الحراس - الأحد 2024/06/16 - الفترة المسائية",
          type: "supervision",
          date: "2024/06/16",
          day: "الأحد 2024/06/16",
          period: "evening",
          status: "ready",
        },
        {
          id: "doc3",
          title: "محضر غياب المترشحين - الأحد 2024/06/16 - الفترة الصباحية",
          type: "attendance",
          date: "2024/06/16",
          day: "الأحد 2024/06/16",
          period: "morning",
          status: "ready",
        },
        {
          id: "doc4",
          title: "محضر استلام أوراق الإجابة - الأحد 2024/06/16",
          type: "official",
          date: "2024/06/16",
          day: "الأحد 2024/06/16",
          period: "morning",
          status: "pending",
        },
        {
          id: "doc5",
          title: "تقرير سير الامتحان - الأحد 2024/06/16",
          type: "report",
          date: "2024/06/16",
          day: "الأحد 2024/06/16",
          period: "morning",
          status: "draft",
        },
      ]

      setDocuments(sampleDocuments)
      setIsLoading(false)
    }

    loadDocuments()
  }, [])

  // Handle document download
  const handleDownload = (document: DocumentType) => {
    if (document.type === "supervision") {
      // In a real app, you would load the actual supervision data
      // For this demo, we'll create some sample data
      const sampleRecords = Array.from({ length: 10 }, (_, i) => ({
        room: `قاعة ${i + 1}`,
        mainSupervisor: `أستاذ رئيسي ${i + 1}`,
        secondSupervisor: `أستاذ ثاني ${i + 1}`,
        thirdSupervisor: `أستاذ ثالث ${i + 1}`,
      }))

      downloadPDF(
        sampleRecords,
        document.day,
        document.period,
        "12345", // Center code
        "ثانوية الأمير عبد القادر", // Center name
        "جميع المواد", // Subject
      )

      toast({
        title: "تم تحميل المستند",
        description: "تم تحميل المستند بنجاح",
      })
    } else {
      // For other document types
      toast({
        title: "جاري تحميل المستند",
        description: "جاري تحميل المستند، يرجى الانتظار...",
      })

      setTimeout(() => {
        toast({
          title: "تم تحميل المستند",
          description: "تم تحميل المستند بنجاح",
        })
      }, 1500)
    }
  }

  // Handle document print
  const handlePrint = (document: DocumentType) => {
    // Similar to download but opens in a new window for printing
    toast({
      title: "جاري إعداد الطباعة",
      description: "جاري إعداد المستند للطباعة",
    })

    // In a real app, you would generate the print view
    // For this demo, we'll just show a success message
    setTimeout(() => {
      toast({
        title: "تم إرسال المستند للطباعة",
        description: "تم إرسال المستند للطباعة بنجاح",
      })
    }, 1000)
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
          <h1 className="text-2xl font-bold mr-4">الوثائق التنظيمية</h1>
        </header>

        {/* Main Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card 1: Documents */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="col-span-1"
          >
            <Card className="h-full border-t-4 border-t-blue-500 hover:shadow-xl transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                  <ClipboardList className="h-6 w-6 text-blue-500" />
                  <span>الوثائق الخاصة بالامتحانات</span>
                </CardTitle>
                <CardDescription>الوثائق الرسمية المتعلقة بتنظيم الامتحانات</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">عدد الوثائق:</span>
                    <Badge className="bg-blue-500">{documents.filter((d) => d.type === "report").length}</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-2 gap-2">
                    <ExternalLink className="h-4 w-4" />
                    <span>عرض الوثائق</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 2: Supervision Tables */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="col-span-1"
          >
            <Card className="h-full border-t-4 border-t-green-500 hover:shadow-xl transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                  <CalendarDays className="h-6 w-6 text-green-500" />
                  <span>جداول الحراسة اليومية</span>
                </CardTitle>
                <CardDescription>جداول توزيع الأساتذة على قاعات الامتحان</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">عدد الجداول:</span>
                    <Badge className="bg-green-500">{documents.filter((d) => d.type === "supervision").length}</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-2 gap-2">
                    <ExternalLink className="h-4 w-4" />
                    <span>عرض الجداول</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 3: Absence Records */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="col-span-1"
          >
            <Card className="h-full border-t-4 border-t-red-500 hover:shadow-xl transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                  <UserX className="h-6 w-6 text-red-500" />
                  <span>محاضر الغياب</span>
                </CardTitle>
                <CardDescription>محاضر غياب المترشحين خلال فترات الامتحان</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">عدد المحاضر:</span>
                    <Badge className="bg-red-500">{documents.filter((d) => d.type === "attendance").length}</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-2 gap-2">
                    <ExternalLink className="h-4 w-4" />
                    <span>عرض المحاضر</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 4: Documents to Send (Only for Official Exams) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="col-span-1"
          >
            <Card className="h-full border-t-4 border-t-purple-500 hover:shadow-xl transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Send className="h-6 w-6 text-purple-500" />
                  <span>الوثائق الواجب إرسالها</span>
                </CardTitle>
                <CardDescription>الوثائق المطلوب إرسالها للديوان الوطني للامتحانات</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">عدد الوثائق:</span>
                    <Badge className="bg-purple-500">{documents.filter((d) => d.type === "official").length}</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-2 gap-2">
                    <ExternalLink className="h-4 w-4" />
                    <span>عرض القائمة</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Documents Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden mb-8"
        >
          <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold">قائمة المستندات</h2>
            <Button size="sm" className="gap-2">
              <FileText className="h-4 w-4" />
              <span>إنشاء مستند جديد</span>
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">الرقم</TableHead>
                  <TableHead>عنوان المستند</TableHead>
                  <TableHead className="w-[120px]">التاريخ</TableHead>
                  <TableHead className="w-[120px]">النوع</TableHead>
                  <TableHead className="w-[120px]">الحالة</TableHead>
                  <TableHead className="w-[150px]">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                        <span>جاري تحميل المستندات...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : documents.length > 0 ? (
                  documents.map((doc, index) => (
                    <TableRow key={doc.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{doc.title}</TableCell>
                      <TableCell>{doc.date}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            doc.type === "supervision"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : doc.type === "attendance"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : doc.type === "official"
                                  ? "bg-purple-50 text-purple-700 border-purple-200"
                                  : "bg-blue-50 text-blue-700 border-blue-200"
                          }
                        >
                          {doc.type === "supervision"
                            ? "جدول حراسة"
                            : doc.type === "attendance"
                              ? "محضر غياب"
                              : doc.type === "official"
                                ? "وثيقة رسمية"
                                : "تقرير"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            doc.status === "ready" ? "default" : doc.status === "draft" ? "outline" : "secondary"
                          }
                          className={
                            doc.status === "ready"
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : doc.status === "draft"
                                ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                                : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                          }
                        >
                          {doc.status === "ready" ? "جاهز" : doc.status === "draft" ? "مسودة" : "قيد الإنتظار"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="h-8 px-2" onClick={() => handleDownload(doc)}>
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 px-2" onClick={() => handlePrint(doc)}>
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      لا توجد مستندات متاحة حالياً
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

