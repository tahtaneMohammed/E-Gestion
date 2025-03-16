"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

const SemesterSettingsPage = () => {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    examDuration: "",
    passingGrade: "",
  })
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem("semesterSettings", JSON.stringify(formData))
    toast({
      title: "تم الحفظ بنجاح",
      description: "تم حفظ إعدادات الامتحانات الفصلية",
    })

    // الانتقال إلى لوحة تحكم الامتحانات الفصلية بعد الحفظ
    setTimeout(() => {
      router.push("/dashboard/semester")
    }, 1500)
  }

  useEffect(() => {
    // استرجاع الإعدادات المحفوظة
    const savedSettings = localStorage.getItem("semesterSettings")
    if (savedSettings) {
      setFormData(JSON.parse(savedSettings))
    }
  }, [])

  return (
    <div className="container max-w-2xl mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>إعدادات الامتحانات الفصلية</CardTitle>
          <CardDescription>تعديل المدة الزمنية و درجة النجاح للامتحانات الفصلية</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="examDuration">المدة الزمنية للامتحان (بالدقائق)</Label>
              <Input
                id="examDuration"
                name="examDuration"
                type="number"
                value={formData.examDuration}
                onChange={handleChange}
                placeholder="مثال: 60"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="passingGrade">درجة النجاح</Label>
              <Input
                id="passingGrade"
                name="passingGrade"
                type="number"
                value={formData.passingGrade}
                onChange={handleChange}
                placeholder="مثال: 50"
              />
            </div>
            <Button type="submit">حفظ الإعدادات</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default SemesterSettingsPage

