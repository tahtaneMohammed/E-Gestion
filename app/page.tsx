"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function WelcomePage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-modern p-6 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 transform -skew-y-6 -translate-y-24"></div>
        <div className="absolute bottom-0 right-0 w-full h-64 bg-gradient-to-l from-purple-400/10 to-indigo-400/10 transform skew-y-6 translate-y-24"></div>
      </div>

      {/* Animated circles */}
      <motion.div
        className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full bg-blue-200/10 z-0"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 15,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-1/3 right-1/3 w-64 h-64 rounded-full bg-purple-200/10 z-0"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Floating particles */}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/20 z-0"
          style={{
            width: Math.random() * 8 + 4,
            height: Math.random() * 8 + 4,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: Math.random() * 5 + 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: Math.random() * 5,
          }}
        />
      ))}

      <motion.div
        className="max-w-3xl text-center z-10 bg-white/5 backdrop-blur-sm p-8 rounded-3xl shadow-soft"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1
          className="text-5xl md:text-6xl font-bold mb-6 title-gradient"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          E&apos;gest
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-gray-700 mb-12 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          نظام متكامل لإدارة الامتحانات المدرسية والرسمية بكفاءة عالية. يتيح لك تنظيم وتسيير امتحانات المدارس الفصلية
          والامتحانات الرسمية مثل شهادة البكالوريا وشهادة التعليم المتوسط وشهادة التعليم الابتدائي. يوفر التطبيق واجهة
          سهلة الاستخدام مع أدوات متقدمة لإدارة جميع مراحل الامتحانات من التخطيط إلى إصدار النتائج.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <Link href="/login">
            <Button
              size="lg"
              className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all btn-modern bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
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
        الإصدار 1.0.0 © 2025 Developed by tahtane Mohammed
      </motion.div>
    </div>
  )
}

