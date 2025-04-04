"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { UserX, Shield, FileText, ArrowLeft, LogOut, Settings, Calendar, BarChart, FileUp } from "lucide-react"

export default function SemesterDashboard() {
  const [activeCard, setActiveCard] = useState<string | null>(null)

  const services = [
    {
      id: "import",
      title: "استيراد البيانات",
      description: "استيراد بيانات الطلاب والأساتذة وإعداد القاعات",
      icon: <FileUp className="h-10 w-10" />,
      color: "bg-blue-500",
      link: "/dashboard/semester/import-data",
    },
    {
      id: "absences",
      title: "تسيير الغيابات",
      description: "إدارة غيابات الطلاب وإصدار التقارير اللازمة",
      icon: <UserX className="h-10 w-10" />,
      color: "bg-red-500",
      link: "/dashboard/semester/absences",
    },
    {
      id: "supervision",
      title: "تسيير الحراسة",
      description: "جدولة المراقبين وتوزيعهم على القاعات",
      icon: <Shield className="h-10 w-10" />,
      color: "bg-purple-500",
      link: "/dashboard/semester/supervision",
    },
    {
      id: "documents",
      title: "المطبوعات التنظيمية",
      description: "إنشاء وطباعة الوثائق التنظيمية للامتحانات الفصلية",
      icon: <FileText className="h-10 w-10" />,
      color: "bg-green-500",
      link: "/dashboard/semester/documents",
    },
    {
      id: "schedule",
      title: "جدول الامتحانات",
      description: "إنشاء وتعديل جدول الامتحانات الفصلية",
      icon: <Calendar className="h-10 w-10" />,
      color: "bg-amber-500",
      link: "/dashboard/semester/schedule",
    },
    {
      id: "results",
      title: "النتائج والإحصائيات",
      description: "إدخال النتائج وإصدار التقارير الإحصائية",
      icon: <BarChart className="h-10 w-10" />,
      color: "bg-cyan-500",
      link: "/dashboard/semester/results",
    },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <Link href="/settings">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">لوحة تحكم الامتحانات الفصلية</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/settings">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <LogOut className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </header>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {services.map((service) => (
            <motion.div key={service.id} variants={item}>
              <Card
                className={`h-full transition-all duration-300 hover:shadow-xl cursor-pointer ${
                  activeCard === service.id ? "ring-2 ring-primary ring-offset-2" : ""
                }`}
                onClick={() => setActiveCard(service.id)}
              >
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className={`${service.color} text-white p-4 rounded-full mb-4`}>{service.icon}</div>
                  <h2 className="text-xl font-bold mb-2">{service.title}</h2>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <Link href={service.link || "#"} className="w-full">
                    <Button className="mt-auto w-full">الدخول</Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

