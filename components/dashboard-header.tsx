"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Bell, LogOut, Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getBasicSettings } from "@/lib/utils/settings-utils"

export function DashboardHeader() {
  const [institutionName, setInstitutionName] = useState<string>("المؤسسة التعليمية")
  const [notifications, setNotifications] = useState<{ id: string; title: string; read: boolean }[]>([])

  useEffect(() => {
    try {
      // Load institution name from settings
      const settings = getBasicSettings(false)
      if (settings && settings.institutionName) {
        setInstitutionName(settings.institutionName)
      }

      // Sample notifications (in a real app, these would come from an API or state management)
      setNotifications([
        { id: "1", title: "تم إنشاء جدول توزيع الحراس", read: false },
        { id: "2", title: "تم تسجيل 3 غيابات جديدة", read: false },
        { id: "3", title: "تم استيراد بيانات الأساتذة بنجاح", read: true },
      ])
    } catch (error) {
      console.error("Error loading settings:", error)
    }
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-6">
      <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
        <span className="text-xl font-bold text-primary">{institutionName}</span>
      </Link>

      <div className="flex-1" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary p-0 text-xs text-primary-foreground"
                variant="default"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>الإشعارات</span>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-auto text-xs">
                تعيين الكل كمقروء
              </Button>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex cursor-pointer flex-col items-start p-3 ${!notification.read ? "bg-muted/50" : ""}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="font-medium">{notification.title}</span>
                  {!notification.read && <Badge variant="default" className="ml-2 h-2 w-2 rounded-full p-0" />}
                </div>
                <span className="mt-1 text-xs text-muted-foreground">منذ دقائق</span>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="p-4 text-center text-muted-foreground">لا توجد إشعارات</div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {institutionName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>حسابي</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <Link href="/dashboard/profile" passHref>
            <DropdownMenuItem>
              <User className="ml-2 h-4 w-4" />
              <span>الملف الشخصي</span>
            </DropdownMenuItem>
          </Link>
          <Link href="/dashboard/settings/basic" passHref>
            <DropdownMenuItem>
              <Settings className="ml-2 h-4 w-4" />
              <span>الإعدادات</span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator />
          <Link href="/logout" passHref>
            <DropdownMenuItem>
              <LogOut className="ml-2 h-4 w-4" />
              <span>تسجيل الخروج</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}

