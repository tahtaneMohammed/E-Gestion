"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Download, FileText, Printer, ClipboardList, CalendarDays, UserX, ExternalLink } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { getSemesterSettings } from "@/lib/settings-utils"

// Types
type DocumentType = {
  id: string
  title: string
  type: "supervision" | "attendance" | "report"
  date: string
  day: string
  period: "morning" | "evening"
  status: "ready" | "draft" | "pending"
  summary?: {
    absentTeachers?: number
    lateTeachers?: number
    absentStudents?: number
    lateStudents?: number
  }
}

export default function SemesterDocumentsPage() {
  const { toast } = useToast()
  const [documents, setDocuments] = useState<DocumentType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const settings = getSemesterSettings()

  // Load saved documents
  useEffect(() => {
    const loadDocuments = () => {
      setIsLoading(true)

      try {
        // Load documents from localStorage
        const savedDocuments = localStorage.getItem("semesterDocuments")

        if (savedDocuments) {
          const parsedDocuments: DocumentType[] = JSON.parse(savedDocuments)
          setDocuments(parsedDocuments)
        } else {
          // Create sample documents if none exist
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
              title: "محضر الغياب - الأحد 2024/06/16 - الفترة الصباحية",
              type: "attendance",
              date: "2024/06/16",
              day: "الأحد 2024/06/16",
              period: "morning",
              status: "ready",
              summary: {
                absentTeachers: 2,
                lateTeachers: 1,
                absentStudents: 5,
                lateStudents: 3,
              },
            },
            {
              id: "doc3",
              title: "تقرير سير الامتحان - الأحد 2024/06/16",
              type: "report",
              date: "2024/06/16",
              day: "الأحد 2024/06/16",
              period: "morning",
              status: "draft",
            },
            {
              id: "doc4",
              title: "جدول توزيع الحراس - الإثنين 2024/06/17 - الفترة الصباحية",
              type: "supervision",
              date: "2024/06/17",
              day: "الإثنين 2024/06/17",
              period: "morning",
              status: "pending",
            },
          ]

          setDocuments(sampleDocuments)
          localStorage.setItem("semesterDocuments", JSON.stringify(sampleDocuments))
        }
      } catch (error) {
        console.error("Error loading documents:", error)
        toast({
          title: "خطأ في تحميل المستندات",
          description: "حدث خطأ أثناء تحميل المستندات",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadDocuments()
  }, [toast])

  // Handle document download
  const handleDownload = (document: DocumentType) => {
    if (document.type === "supervision") {
      // Open the supervision PDF
      window.open("/dashboard/semester/supervision", "_blank")

      toast({
        title: "تم فتح جدول الحراسة",
        description: "تم فتح جدول الحراسة في نافذة جديدة",
      })
    } else if (document.type === "attendance") {
      // Generate attendance report
      const printWindow = window.open("", "_blank")

      if (!printWindow) {
        toast({
          title: "خطأ في فتح نافذة الطباعة",
          description: "يرجى السماح بفتح النوافذ المنبثقة في المتصفح",
          variant: "destructive",
        })
        return
      }

      // Generate HTML content for attendance report
      const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <title>${document.title}</title>
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
          
          .summary {
            margin: 30px 0;
          }
          
          .summary-title {
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 15px;
            color: #333;
          }
          
          .summary-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
          
          .summary-card {
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 15px;
          }
          
          .summary-card-title {
            font-size: 14px;
            font-weight: 700;
            margin-bottom: 10px;
            color: #333;
          }
          
          .summary-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
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
            font-size: 16px;
            margin: 20px auto;
            display: block;
            font-family: 'Tajawal', Arial, sans-serif;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>الجمهورية الجزائرية الديمقراطية الشعبية</h1>
          <h2>وزارة التربية الوطنية</h2>
          <h2>مديرية التربية لولاية الجزائر</h2>
        </div>
        
        <div class="info">
          <div>
            <div class="info-item"><strong>الامتحانات الفصلية</strong></div>
            <div class="info-item"><strong>المؤسسة:</strong> ${settings?.establishmentName || "ثانوية الأمير عبد القادر"}</div>
          </div>
          <div>
            <div class="info-item"><strong>الفترة:</strong> ${document.period === "morning" ? "الصباحية" : "المسائية"}</div>
            <div class="info-item"><strong>اليوم:</strong> ${document.day}</div>
          </div>
        </div>
        
        <div class="title">محضر الغياب</div>
        
        <div class="summary">
          <div class="summary-title">ملخص الحضور والغياب</div>
          
          <div class="summary-grid">
            <div class="summary-card">
              <div class="summary-card-title">الأساتذة</div>
              <div class="summary-item">
                <span>عدد الغائبين:</span>
                <strong>${document.summary?.absentTeachers || 0}</strong>
              </div>
              <div class="summary-item">
                <span>عدد المتأخرين:</span>
                <strong>${document.summary?.lateTeachers || 0}</strong>
              </div>
            </div>
            
            <div class="summary-card">
              <div class="summary-card-title">التلاميذ</div>
              <div class="summary-item">
                <span>عدد الغائبين:</span>
                <strong>${document.summary?.absentStudents || 0}</strong>
              </div>
              <div class="summary-item">
                <span>عدد المتأخرين:</span>
                <strong>${document.summary?.lateStudents || 0}</strong>
              </div>
            </div>
          </div>
        </div>
        
        <div class="signature">
          <div></div> <!-- عنصر فارغ للمحاذاة -->
          <div class="signature-item">
            <div><strong>مدير المؤسسة</strong></div>
            <div style="height: 10px;"></div> <!-- مسافة بين العناصر -->
            <div><strong>الختم والإمضاء</strong></div>
            <div class="signature-line"></div>
          </div>
        </div>
        
        <div class="footer">
          <div>تاريخ الإصدار: ${new Date().toLocaleDateString("ar-DZ")}</div>
          <div>الصفحة 1 من 1</div>
        </div>
        
        <button class="print-button" onclick="window.print(); this.style.display='none';">طباعة المحضر</button>
      </body>
      </html>
      `

      // Write the HTML content to the new window
      printWindow.document.write(htmlContent)
      printWindow.document.close()

      // Focus the window for printing
      printWindow.focus()

      toast({
        title: "تم فتح محضر الغياب",
        description: "تم فتح محضر الغياب في نافذة جديدة",
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
    handleDownload(document)
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
          <h1 className="text-2xl font-bold mr-4">الوثائق التنظيمية</h1>
        </header>

        {/* Main Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Documents */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card className="h-full border-t-4 border-t-blue-500 hover:shadow-xl transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                  <ClipboardList className="h-6 w-6 text-blue-500" />
                  <span>الوثائق الخاصة بالامتحانات</span>
                </CardTitle>
                <CardDescription>الوثائق الرسمية المتعلقة بتنظيم الامتحانات الفصلية</CardDescription>
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
        </div>

        {/* Documents Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
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
                                : "bg-blue-50 text-blue-700 border-blue-200"
                          }
                        >
                          {doc.type === "supervision"
                            ? "جدول حراسة"
                            : doc.type === "attendance"
                              ? "محضر غياب"
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

