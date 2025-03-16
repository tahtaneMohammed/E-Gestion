"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import {
  getBasicSettings,
  saveBasicSettings,
  getOfficialSettings,
  saveOfficialSettings,
  getSemesterSettings,
  saveSemesterSettings,
} from "@/lib/settings-utils"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("basic")
  const router = useRouter()

  // Basic Settings
  const [basicSettings, setBasicSettings] = useState({
    institutionName: "",
    institutionAddress: "",
    institutionPhone: "",
    institutionEmail: "",
    directorName: "",
    directorTitle: "",
    academicYear: "",
  })

  // Official Exam Settings
  const [officialSettings, setOfficialSettings] = useState({
    examSession: "",
    startDate: "",
    endDate: "",
    examType: "",
    examLevel: "",
    examCenter: "",
    centerManager: "",
    centerCode: "",
  })

  // Semester Exam Settings
  const [semesterSettings, setSemesterSettings] = useState({
    examSession: "",
    startDate: "",
    endDate: "",
    semester: "",
    academicLevel: "",
  })

  // Load settings on component mount
  useEffect(() => {
    setBasicSettings(getBasicSettings())
    setOfficialSettings(getOfficialSettings())
    setSemesterSettings(getSemesterSettings())
  }, [])

  // Handle basic settings form submission
  const handleBasicSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveBasicSettings(basicSettings)
    toast({
      title: "تم الحفظ بنجاح",
      description: "تم حفظ الإعدادات الأساسية",
    })
    // Eliminar la redirección
  }

  // Handle official exam settings form submission
  const handleOfficialSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // التحقق من صحة تنسيق التاريخ
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(officialSettings.startDate) || !dateRegex.test(officialSettings.endDate)) {
      toast({
        title: "خطأ في تنسيق التاريخ",
        description: "يرجى إدخال التاريخ بتنسيق YYYY-MM-DD مثل 2024-06-15",
        variant: "destructive",
      })
      return
    }

    saveOfficialSettings(officialSettings)
    toast({
      title: "تم الحفظ بنجاح",
      description: "تم حفظ إعدادات الامتحانات الرسمية",
    })
    // الانتقال إلى لوحة تحكم الامتحانات الرسمية بعد الحفظ
    setTimeout(() => {
      router.push("/dashboard/official")
    }, 1500)
  }

  // Handle semester exam settings form submission
  const handleSemesterSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // التحقق من صحة تنسيق التاريخ
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(semesterSettings.startDate) || !dateRegex.test(semesterSettings.endDate)) {
      toast({
        title: "خطأ في تنسيق التاريخ",
        description: "يرجى إدخال التاريخ بتنسيق YYYY-MM-DD مثل 2024-06-15",
        variant: "destructive",
      })
      return
    }

    saveSemesterSettings(semesterSettings)
    toast({
      title: "تم الحفظ بنجاح",
      description: "تم حفظ إعدادات الامتحانات الفصلية",
    })
    // الانتقال إلى لوحة تحكم الامتحانات الفصلية بعد الحفظ
    setTimeout(() => {
      router.push("/dashboard/semester")
    }, 1500)
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">إعدادات التطبيق</h1>

      <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">الإعدادات الأساسية</TabsTrigger>
          <TabsTrigger value="official">الامتحانات الرسمية</TabsTrigger>
          <TabsTrigger value="semester">الامتحانات الفصلية</TabsTrigger>
        </TabsList>

        {/* Basic Settings Tab */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>الإعدادات الأساسية</CardTitle>
              <CardDescription>إعدادات المؤسسة التعليمية الأساسية</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBasicSettingsSubmit} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="institutionName">اسم المؤسسة</Label>
                  <Input
                    id="institutionName"
                    value={basicSettings.institutionName}
                    onChange={(e) => setBasicSettings({ ...basicSettings, institutionName: e.target.value })}
                    placeholder="أدخل اسم المؤسسة"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="institutionAddress">عنوان المؤسسة</Label>
                  <Input
                    id="institutionAddress"
                    value={basicSettings.institutionAddress}
                    onChange={(e) => setBasicSettings({ ...basicSettings, institutionAddress: e.target.value })}
                    placeholder="أدخل عنوان المؤسسة"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="institutionPhone">رقم الهاتف</Label>
                    <Input
                      id="institutionPhone"
                      value={basicSettings.institutionPhone}
                      onChange={(e) => setBasicSettings({ ...basicSettings, institutionPhone: e.target.value })}
                      placeholder="أدخل رقم الهاتف"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="institutionEmail">البريد الإلكتروني</Label>
                    <Input
                      id="institutionEmail"
                      type="email"
                      value={basicSettings.institutionEmail}
                      onChange={(e) => setBasicSettings({ ...basicSettings, institutionEmail: e.target.value })}
                      placeholder="أدخل البريد الإلكتروني"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="directorName">اسم المدير</Label>
                    <Input
                      id="directorName"
                      value={basicSettings.directorName}
                      onChange={(e) => setBasicSettings({ ...basicSettings, directorName: e.target.value })}
                      placeholder="أدخل اسم المدير"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="directorTitle">صفة المدير</Label>
                    <Input
                      id="directorTitle"
                      value={basicSettings.directorTitle}
                      onChange={(e) => setBasicSettings({ ...basicSettings, directorTitle: e.target.value })}
                      placeholder="أدخل صفة المدير"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="academicYear">السنة الدراسية</Label>
                  <Input
                    id="academicYear"
                    value={basicSettings.academicYear}
                    onChange={(e) => setBasicSettings({ ...basicSettings, academicYear: e.target.value })}
                    placeholder="مثال: 2023-2024"
                  />
                </div>

                <div className="flex justify-between mt-4">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      if (
                        confirm(
                          "هل أنت متأكد من رغبتك في مسح جميع البيانات المستوردة والغيابات وجداول الحراسة؟ لا يمكن التراجع عن هذا الإجراء.",
                        )
                      ) {
                        // مسح البيانات من localStorage
                        const keys = Object.keys(localStorage)
                        let deletedCount = 0

                        for (const key of keys) {
                          if (
                            key.includes("imported") ||
                            key.includes("absences") ||
                            key.includes("supervision") ||
                            key.includes("attendance")
                          ) {
                            localStorage.removeItem(key)
                            deletedCount++
                          }
                        }

                        toast({
                          title: "تم مسح البيانات",
                          description: `تم مسح ${deletedCount} من العناصر المخزنة بنجاح`,
                        })
                      }
                    }}
                  >
                    مسح جميع البيانات المستوردة
                  </Button>
                  <Button type="submit">حفظ الإعدادات</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Official Exams Settings Tab */}
        <TabsContent value="official">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الامتحانات الرسمية</CardTitle>
              <CardDescription>إعدادات خاصة بالامتحانات الرسمية</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleOfficialSettingsSubmit} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="officialExamSession">دورة الامتحان</Label>
                  <Input
                    id="officialExamSession"
                    value={officialSettings.examSession}
                    onChange={(e) => setOfficialSettings({ ...officialSettings, examSession: e.target.value })}
                    placeholder="مثال: الدورة العادية"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="officialStartDate">تاريخ بداية الامتحانات</Label>
                    <Input
                      id="officialStartDate"
                      type="date"
                      value={officialSettings.startDate}
                      onChange={(e) => setOfficialSettings({ ...officialSettings, startDate: e.target.value })}
                      placeholder="YYYY-MM-DD"
                    />
                    <p className="text-xs text-gray-500">أدخل التاريخ بتنسيق YYYY-MM-DD مثل 2024-06-15</p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="officialEndDate">تاريخ نهاية الامتحانات</Label>
                    <Input
                      id="officialEndDate"
                      type="date"
                      value={officialSettings.endDate}
                      onChange={(e) => setOfficialSettings({ ...officialSettings, endDate: e.target.value })}
                      placeholder="YYYY-MM-DD"
                    />
                    <p className="text-xs text-gray-500">أدخل التاريخ بتنسيق YYYY-MM-DD مثل 2024-06-25</p>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="officialExamType">نوع الامتحان</Label>
                  <Input
                    id="officialExamType"
                    value={officialSettings.examType}
                    onChange={(e) => setOfficialSettings({ ...officialSettings, examType: e.target.value })}
                    placeholder="مثال: شهادة البكالوريا"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="officialExamLevel">المستوى الدراسي</Label>
                  <Input
                    id="officialExamLevel"
                    value={officialSettings.examLevel}
                    onChange={(e) => setOfficialSettings({ ...officialSettings, examLevel: e.target.value })}
                    placeholder="مثال: السنة الثالثة ثانوي"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="officialExamCenter">مركز الامتحان</Label>
                    <Input
                      id="officialExamCenter"
                      value={officialSettings.examCenter}
                      onChange={(e) => setOfficialSettings({ ...officialSettings, examCenter: e.target.value })}
                      placeholder="أدخل اسم مركز الامتحان"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="officialCenterManager">مدير المركز</Label>
                    <Input
                      id="officialCenterManager"
                      value={officialSettings.centerManager}
                      onChange={(e) => setOfficialSettings({ ...officialSettings, centerManager: e.target.value })}
                      placeholder="أدخل اسم مدير المركز"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="officialCenterCode">رمز المركز</Label>
                  <Input
                    id="officialCenterCode"
                    value={officialSettings.centerCode}
                    onChange={(e) => setOfficialSettings({ ...officialSettings, centerCode: e.target.value })}
                    placeholder="أدخل رمز المركز"
                  />
                </div>

                <Button type="submit">حفظ الإعدادات</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Semester Exams Settings Tab */}
        <TabsContent value="semester">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الامتحانات الفصلية</CardTitle>
              <CardDescription>إعدادات خاصة بالامتحانات الفصلية</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSemesterSettingsSubmit} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="semesterExamSession">دورة الامتحان</Label>
                  <Input
                    id="semesterExamSession"
                    value={semesterSettings.examSession}
                    onChange={(e) => setSemesterSettings({ ...semesterSettings, examSession: e.target.value })}
                    placeholder="مثال: الفصل الأول"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="semesterStartDate">تاريخ بداية الامتحانات</Label>
                    <Input
                      id="semesterStartDate"
                      type="date"
                      value={semesterSettings.startDate}
                      onChange={(e) => setSemesterSettings({ ...semesterSettings, startDate: e.target.value })}
                      placeholder="YYYY-MM-DD"
                    />
                    <p className="text-xs text-gray-500">أدخل التاريخ بتنسيق YYYY-MM-DD مثل 2024-01-15</p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="semesterEndDate">تاريخ نهاية الامتحانات</Label>
                    <Input
                      id="semesterEndDate"
                      type="date"
                      value={semesterSettings.endDate}
                      onChange={(e) => setSemesterSettings({ ...semesterSettings, endDate: e.target.value })}
                      placeholder="YYYY-MM-DD"
                    />
                    <p className="text-xs text-gray-500">أدخل التاريخ بتنسيق YYYY-MM-DD مثل 2024-01-25</p>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="semesterName">الفصل الدراسي</Label>
                  <Input
                    id="semesterName"
                    value={semesterSettings.semester}
                    onChange={(e) => setSemesterSettings({ ...semesterSettings, semester: e.target.value })}
                    placeholder="مثال: الفصل الأول"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="semesterAcademicLevel">المستوى الدراسي</Label>
                  <Input
                    id="semesterAcademicLevel"
                    value={semesterSettings.academicLevel}
                    onChange={(e) => setSemesterSettings({ ...semesterSettings, academicLevel: e.target.value })}
                    placeholder="مثال: جميع المستويات"
                  />
                </div>

                <Button type="submit">حفظ الإعدادات</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}

