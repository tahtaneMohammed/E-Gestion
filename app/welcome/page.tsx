"use client"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"

export default function WelcomePage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <motion.div
        className="max-w-3xl text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1
          className="text-6xl font-bold text-primary mb-6"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          E-Gestion
        </motion.h1>

        <motion.p
          className="text-xl text-gray-700 mb-12 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          نظام رقمي متكامل يتيح لك تنظيم وتسيير امتحانات المدارس الفصلية والامتحانات الرسمية مثل شهادة البكالوريا وشهادة
          التعليم المتوسط . يوفر التطبيق واجهة سهلة الاستخدام مع أدوات متقدمة لإدارة جميع مراحل الامتحانات امن تسيير
          الغيابات و التأطير و الحراسة و كل الوثائق و المطبوعات التنظيمية.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <Link href="/login">
            <Button size="lg" className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all">
              ابدأ الآن
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-4 text-sm text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        Développé par M.tahtane 2025 © Version 1.0
      </motion.div>
    </div>
  )
}

