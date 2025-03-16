"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Upload, FileSpreadsheet, Save } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function ImportDataPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleSaveData = () => {
    setIsLoading(true)

    // Simulate saving data
    setTimeout(() => {
      setIsLoading(false)

      toast({
        title: "تم حفظ البيانات",
        description: "تم حفظ بيانات المترشحين والأساتذة بنجاح",
      })
    }, 1500)
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
          <h1 className="text-2xl font-bold mr-4">استيراد البيانات</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-green-500" />
                استيراد بيانات المترشحين
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                <p className="mb-2">قم بسحب ملف Excel هنا أو</p>
                <Button variant="outline">اختر ملف</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-blue-500" />
                استيراد بيانات الأساتذة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                <p className="mb-2">قم بسحب ملف Excel هنا أو</p>
                <Button variant="outline">اختر ملف</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-center">
          <Button size="lg" className="px-8 flex items-center gap-2" onClick={handleSaveData} disabled={isLoading}>
            <Save className="h-5 w-5" />
            {isLoading ? "جاري الحفظ..." : "حفظ البيانات"}
          </Button>
        </div>
      </div>
    </div>
  )
}

