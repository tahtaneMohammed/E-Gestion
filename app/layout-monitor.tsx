"use client"

import { useEffect } from "react"
import { setupStorageMonitor } from "@/lib/storage-monitor"

export default function LayoutMonitor() {
  useEffect(() => {
    // إعداد مراقبة التخزين المحلي
    setupStorageMonitor()

    // طباعة رسالة تأكيد
    console.log("تم تفعيل مراقبة التخزين المحلي")

    // عرض البيانات المخزنة عند بدء التشغيل
    const keys = Object.keys(localStorage)
    console.log(`تم العثور على ${keys.length} عنصر مخزن في localStorage`)

    // التحقق من وجود إعدادات
    const officialSettings = localStorage.getItem("officialSettings")
    const semesterSettings = localStorage.getItem("semesterSettings")

    if (officialSettings) {
      console.log("تم العثور على إعدادات الامتحانات الرسمية")
    } else {
      console.warn("لم يتم العثور على إعدادات الامتحانات الرسمية")
    }

    if (semesterSettings) {
      console.log("تم العثور على إعدادات الامتحانات الفصلية")
    } else {
      console.warn("لم يتم العثور على إعدادات الامتحانات الفصلية")
    }
  }, [])

  // هذا المكون لا يعرض أي شيء في واجهة المستخدم
  return null
}

