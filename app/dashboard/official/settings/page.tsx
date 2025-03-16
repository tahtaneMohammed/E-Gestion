"use client"

import { useState, useEffect } from "react"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Trash2, Info, RefreshCw } from "lucide-react"
import { resetApplication, clearAllAppData, displayAllStoredData } from "@/lib/reset-utils"
import { getOfficialSettings, saveOfficialSettings, validateSettings } from "@/lib/settings-utils"
import { useRouter } from "next/navigation"

export default function OfficialSettingsPage() {
  const [formData, setFormData] = useState({
    schoolName: "",
    schoolAddress: "",
    principalName: "",
    examSession: "",
    academicYear: "",
    startDate: "",
    endDate: "",
    startHour: "",
    endHour: "",
    coordinatorName: "",
    contactPhone: "",
    contactEmail: "",
    centerCode: "",
    centerName: "",
  })

  const router = useRouter()

  useEffect(() => {
    // استرجاع الإعدادات المحفوظة
    try {
      const savedSettings = getOfficialSettings()
      if (savedSettings) {
        setFormData(savedSettings)
        console.log("تم تحميل إعدادات الامتحانات الرسمية:", savedSettings)
      } else {
        console.log("لم يتم العثور على إعدادات محفوظة للامتحانات الرسمية")
      }
    } catch (error) {
      console.error("خطأ في تحميل إعدادات الامتحانات الرسمية:", error)
    }
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    try {
      // التحقق من صحة الإعدادات
      if (!validateSettings(formData)) {
        toast({
          title: "بيانات غير مكتملة",
          description: "يرجى إدخال جميع البيانات المطلوبة",
          variant: "destructive",
        })
        return
      }

      // حفظ الإعدادات
      saveOfficialSettings(formData)

      console.log("تم حفظ إعدادات الامتحانات الرسمية:", formData)
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم حفظ إعدادات الامتحانات الرسمية",
      })

      // الانتقال إلى لوحة تحكم الامتحانات الرسمية بعد الحفظ
      setTimeout(() => {
        router.push("/dashboard/official")
      }, 1500)
    } catch (error) {
      console.error("خطأ في حفظ إعدادات الامتحانات الرسمية:", error)
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء حفظ الإعدادات",
        variant: "destructive",
      })
    }
  }

  const clearStoredData = () => {
    try {
      const clearedItems = clearAllAppData()

      // إعادة تعيين النموذج إلى القيم الافتراضية
      setFormData({
        schoolName: "",
        schoolAddress: "",
        principalName: "",
        examSession: "",
        academicYear: "",
        startDate: "",
        endDate: "",
        startHour: "",
        endHour: "",
        coordinatorName: "",
        contactPhone: "",
        contactEmail: "",
        centerCode: "",
        centerName: "",
      })

      toast({
        title: "تم مسح البيانات",
        description: `تم مسح ${clearedItems} من العناصر المخزنة بنجاح`,
      })
    } catch (error) {
      console.error("خطأ في مسح البيانات:", error)
      toast({
        title: "خطأ في مسح البيانات",
        description: "حدث خطأ أثناء محاولة مسح البيانات المخزنة",
        variant: "destructive",
      })
    }
  }

  const showStoredData = () => {
    try {
      const data = displayAllStoredData()
      const officialSettings = localStorage.getItem("officialSettings")
      const settingsObj = officialSettings ? JSON.parse(officialSettings) : {}

      toast({
        title: "البيانات المخزنة",
        description: `
          الإعدادات: ${officialSettings ? "موجودة" : "غير موجودة"}
          اسم المدرسة: ${settingsObj.schoolName || "غير محدد"}
          رمز المركز: ${settingsObj.centerCode || "غير محدد"}
          عدد العناصر المخزنة: ${Object.keys(data).length}
        `,
      })
    } catch (error) {
      toast({
        title: "خطأ في عرض البيانات",
        description: "حدث خطأ أثناء محاولة عرض البيانات المخزنة",
        variant: "destructive",
      })
    }
  }

  const handleReset = () => {
    if (confirm("هل أنت متأكد من رغبتك في إعادة ضبط التطبيق بالكامل؟ سيتم مسح جميع البيانات.")) {
      resetApplication()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">إعدادات الامتحانات الرسمية</h1>
        <p className="text-muted-foreground mt-2">قم بتعيين الإعدادات الأساسية للامتحانات الرسمية</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">معلومات عامة</TabsTrigger>
          <TabsTrigger value="dates">التواريخ والأوقات</TabsTrigger>
          <TabsTrigger value="contact">معلومات الاتصال</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>المعلومات العامة</CardTitle>
                <CardDescription>أدخل المعلومات الأساسية للمدرسة ودورة الامتحانات</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <Label htmlFor="schoolName">اسم المدرسة</Label>
                    <Input
                      id="schoolName"
                      name="schoolName"
                      value={formData.schoolName}
                      onChange={handleInputChange}
                      className="mt-2"
                    />
                  </div>
                  <div className="form-group">
                    <Label htmlFor="schoolAddress">عنوان المدرسة</Label>
                    <Input
                      id="schoolAddress"
                      name="schoolAddress"
                      value={formData.schoolAddress}
                      onChange={handleInputChange}
                      className="mt-2"
                    />
                  </div>
                  <div className="form-group">
                    <Label htmlFor="principalName">اسم المدير</Label>
                    <Input
                      id="principalName"
                      name="principalName"
                      value={formData.principalName}
                      onChange={handleInputChange}
                      className="mt-2"
                    />
                  </div>
                  <div className="form-group">
                    <Label htmlFor="examSession">دورة الامتحانات</Label>
                    <Input
                      id="examSession"
                      name="examSession"
                      value={formData.examSession}
                      onChange={handleInputChange}
                      className="mt-2"
                    />
                  </div>
                  <div className="form-group">
                    <Label htmlFor="academicYear">السنة الدراسية</Label>
                    <Input
                      id="academicYear"
                      name="academicYear"
                      value={formData.academicYear}
                      onChange={handleInputChange}
                      className="mt-2"
                    />
                  </div>
                  <div className="form-group">
                    <Label htmlFor="centerCode">رمز المركز</Label>
                    <Input
                      id="centerCode"
                      name="centerCode"
                      value={formData.centerCode}
                      onChange={handleInputChange}
                      className="mt-2"
                    />
                  </div>
                  <div className="form-group">
                    <Label htmlFor="centerName">اسم مركز الامتحان</Label>
                    <Input
                      id="centerName"
                      name="centerName"
                      value={formData.centerName}
                      onChange={handleInputChange}
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>التواريخ والأوقات</CardTitle>
                <CardDescription>حدد تواريخ وأوقات الامتحانات الرسمية</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <Label htmlFor="startDate">تاريخ البدء</Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="mt-2"
                    />
                  </div>
                  <div className="form-group">
                    <Label htmlFor="endDate">تاريخ الانتهاء</Label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="mt-2"
                    />
                  </div>
                  <div className="form-group">
                    <Label htmlFor="startHour">ساعة البدء</Label>
                    <Input
                      id="startHour"
                      name="startHour"
                      type="time"
                      value={formData.startHour}
                      onChange={handleInputChange}
                      className="mt-2"
                    />
                  </div>
                  <div className="form-group">
                    <Label htmlFor="endHour">ساعة الانتهاء</Label>
                    <Input
                      id="endHour"
                      name="endHour"
                      type="time"
                      value={formData.endHour}
                      onChange={handleInputChange}
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>معلومات الاتصال</CardTitle>
                <CardDescription>أدخل معلومات الاتصال للمنسق</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <Label htmlFor="coordinatorName">اسم المنسق</Label>
                    <Input
                      id="coordinatorName"
                      name="coordinatorName"
                      value={formData.coordinatorName}
                      onChange={handleInputChange}
                      className="mt-2"
                    />
                  </div>
                  <div className="form-group">
                    <Label htmlFor="contactPhone">رقم الهاتف</Label>
                    <Input
                      id="contactPhone"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleInputChange}
                      className="mt-2"
                    />
                  </div>
                  <div className="form-group">
                    <Label htmlFor="contactEmail">البريد الإلكتروني</Label>
                    <Input
                      id="contactEmail"
                      name="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <div className="flex justify-between mt-6">
            <div className="flex gap-2">
              <Button type="button" variant="destructive" className="flex items-center gap-2" onClick={clearStoredData}>
                <Trash2 className="h-4 w-4" />
                <span>مسح البيانات المخزنة</span>
              </Button>
              <Button type="button" variant="outline" className="flex items-center gap-2" onClick={showStoredData}>
                <Info className="h-4 w-4" />
                <span>عرض البيانات المخزنة</span>
              </Button>
              <Button type="button" variant="destructive" className="flex items-center gap-2" onClick={handleReset}>
                <RefreshCw className="h-4 w-4" />
                <span>إعادة ضبط التطبيق</span>
              </Button>
            </div>
            <Button type="submit" className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              <span>حفظ الإعدادات</span>
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  )
}

