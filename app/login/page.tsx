"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, User, Lock } from "lucide-react"
import { motion } from "framer-motion"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would validate credentials here
    router.push("/settings")
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-modern p-6 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 transform -skew-y-6 -translate-y-24 z-0"></div>
      <div className="absolute bottom-0 right-0 w-full h-64 bg-gradient-to-l from-purple-400/20 to-indigo-400/20 transform skew-y-6 translate-y-24 z-0"></div>

      {/* Animated circles */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-200/20 z-0"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-purple-200/20 z-0"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/30 z-0"
          style={{
            width: Math.random() * 10 + 5,
            height: Math.random() * 10 + 5,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: Math.random() * 5 + 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: Math.random() * 5,
          }}
        />
      ))}

      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-sm z-10 overflow-hidden card-modern">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
        <CardHeader className="space-y-1 text-center pb-6">
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
              <User className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              تسجيل الدخول
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              أدخل بيانات الاعتماد الخاصة بك للوصول إلى نظام E&apos;gest
            </CardDescription>
          </motion.div>
        </CardHeader>
        <CardContent className="space-y-6">
          <motion.form
            onSubmit={handleLogin}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-700 font-medium">
                  اسم المستخدم
                </Label>
                <div className="relative group">
                  <User className="absolute right-3 top-3 h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition-colors duration-200" />
                  <Input
                    id="username"
                    placeholder="أدخل اسم المستخدم"
                    className="pr-10 border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all duration-200 shadow-sm input-modern"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-700 font-medium">
                    كلمة المرور
                  </Label>
                  <Button variant="link" className="text-xs p-0 h-auto text-indigo-600 hover:text-indigo-800">
                    نسيت كلمة المرور؟
                  </Button>
                </div>
                <div className="relative group">
                  <Lock className="absolute right-3 top-3 h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition-colors duration-200" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pr-10 border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all duration-200 shadow-sm input-modern"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 shadow-md hover:shadow-lg transition-all duration-200 btn-modern"
                >
                  دخول
                </Button>
              </motion.div>
            </div>
          </motion.form>
        </CardContent>
        <CardFooter className="flex justify-center pb-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }}>
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs flex items-center gap-1 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors duration-200"
              >
                العودة للصفحة الرئيسية
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </motion.div>
        </CardFooter>
      </Card>

      <motion.div
        className="absolute bottom-4 text-sm text-gray-500 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        Développé par M.tahtane 2025 © Version 1.0
      </motion.div>
    </div>
  )
}

