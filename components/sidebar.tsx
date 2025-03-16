"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  ChevronDown,
  FileText,
  Home,
  Settings,
  BookOpen,
  UserCheck,
  FileUp,
  UserX,
  GraduationCap,
  Building,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useMobile } from "@/hooks/use-mobile"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, ...props }: SidebarProps) {
  const pathname = usePathname()
  const isMobile = useMobile()
  const [open, setOpen] = useState<Record<string, boolean>>({
    official: false,
    semester: false,
    settings: false,
  })

  // Expand the section based on the current path
  useEffect(() => {
    if (pathname.includes("/dashboard/official")) {
      setOpen((prev) => ({ ...prev, official: true }))
    } else if (pathname.includes("/dashboard/semester")) {
      setOpen((prev) => ({ ...prev, semester: true }))
    } else if (pathname.includes("/dashboard/settings")) {
      setOpen((prev) => ({ ...prev, settings: true }))
    }
  }, [pathname])

  const toggleSection = (section: string) => {
    setOpen((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  const SidebarContent = (
    <ScrollArea className="h-full py-6">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold">لوحة التحكم</h2>
        <div className="space-y-1">
          <Link href="/dashboard" passHref>
            <Button variant={isActive("/dashboard") ? "secondary" : "ghost"} className="w-full justify-start" size="sm">
              <Home className="ml-2 h-4 w-4" />
              الرئيسية
            </Button>
          </Link>

          {/* الامتحانات الرسمية */}
          <div>
            <Button
              variant="ghost"
              className="w-full justify-between"
              size="sm"
              onClick={() => toggleSection("official")}
            >
              <span className="flex items-center">
                <GraduationCap className="ml-2 h-4 w-4" />
                الامتحانات الرسمية
              </span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", open.official ? "rotate-180" : "")} />
            </Button>
            {open.official && (
              <div className="mr-4 mt-1 space-y-1 border-r pr-4">
                <Link href="/dashboard/official" passHref>
                  <Button
                    variant={isActive("/dashboard/official") ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    size="sm"
                  >
                    <Home className="ml-2 h-4 w-4" />
                    الرئيسية
                  </Button>
                </Link>
                <Link href="/dashboard/official/import-data" passHref>
                  <Button
                    variant={isActive("/dashboard/official/import-data") ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    size="sm"
                  >
                    <FileUp className="ml-2 h-4 w-4" />
                    استيراد البيانات
                  </Button>
                </Link>
                <Link href="/dashboard/official/supervision" passHref>
                  <Button
                    variant={isActive("/dashboard/official/supervision") ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    size="sm"
                  >
                    <UserCheck className="ml-2 h-4 w-4" />
                    تسيير الحراسة
                  </Button>
                </Link>
                <Link href="/dashboard/official/absences" passHref>
                  <Button
                    variant={isActive("/dashboard/official/absences") ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    size="sm"
                  >
                    <UserX className="ml-2 h-4 w-4" />
                    تسيير الغيابات
                  </Button>
                </Link>
                <Link href="/dashboard/official/documents" passHref>
                  <Button
                    variant={isActive("/dashboard/official/documents") ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    size="sm"
                  >
                    <FileText className="ml-2 h-4 w-4" />
                    المطبوعات التنظيمية
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* الامتحانات الفصلية */}
          <div>
            <Button
              variant="ghost"
              className="w-full justify-between"
              size="sm"
              onClick={() => toggleSection("semester")}
            >
              <span className="flex items-center">
                <BookOpen className="ml-2 h-4 w-4" />
                الامتحانات الفصلية
              </span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", open.semester ? "rotate-180" : "")} />
            </Button>
            {open.semester && (
              <div className="mr-4 mt-1 space-y-1 border-r pr-4">
                <Link href="/dashboard/semester" passHref>
                  <Button
                    variant={isActive("/dashboard/semester") ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    size="sm"
                  >
                    <Home className="ml-2 h-4 w-4" />
                    الرئيسية
                  </Button>
                </Link>
                <Link href="/dashboard/semester/import-data" passHref>
                  <Button
                    variant={isActive("/dashboard/semester/import-data") ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    size="sm"
                  >
                    <FileUp className="ml-2 h-4 w-4" />
                    استيراد البيانات
                  </Button>
                </Link>
                <Link href="/dashboard/semester/supervision" passHref>
                  <Button
                    variant={isActive("/dashboard/semester/supervision") ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    size="sm"
                  >
                    <UserCheck className="ml-2 h-4 w-4" />
                    تسيير الحراسة
                  </Button>
                </Link>
                <Link href="/dashboard/semester/absences" passHref>
                  <Button
                    variant={isActive("/dashboard/semester/absences") ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    size="sm"
                  >
                    <UserX className="ml-2 h-4 w-4" />
                    تسيير الغيابات
                  </Button>
                </Link>
                <Link href="/dashboard/semester/documents" passHref>
                  <Button
                    variant={isActive("/dashboard/semester/documents") ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    size="sm"
                  >
                    <FileText className="ml-2 h-4 w-4" />
                    المطبوعات التنظيمية
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* الإعدادات */}
          <div>
            <Button
              variant="ghost"
              className="w-full justify-between"
              size="sm"
              onClick={() => toggleSection("settings")}
            >
              <span className="flex items-center">
                <Settings className="ml-2 h-4 w-4" />
                الإعدادات
              </span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", open.settings ? "rotate-180" : "")} />
            </Button>
            {open.settings && (
              <div className="mr-4 mt-1 space-y-1 border-r pr-4">
                <Link href="/dashboard/settings/basic" passHref>
                  <Button
                    variant={isActive("/dashboard/settings/basic") ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    size="sm"
                  >
                    <Building className="ml-2 h-4 w-4" />
                    إعدادات المؤسسة
                  </Button>
                </Link>
                <Link href="/dashboard/settings/official" passHref>
                  <Button
                    variant={isActive("/dashboard/settings/official") ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    size="sm"
                  >
                    <GraduationCap className="ml-2 h-4 w-4" />
                    الامتحانات الرسمية
                  </Button>
                </Link>
                <Link href="/dashboard/settings/semester" passHref>
                  <Button
                    variant={isActive("/dashboard/settings/semester") ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    size="sm"
                  >
                    <BookOpen className="ml-2 h-4 w-4" />
                    الامتحانات الفصلية
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </ScrollArea>
  )

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="ml-2">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-64 p-0">
          {SidebarContent}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div className={cn("w-64 border-l", className)} {...props}>
      {SidebarContent}
    </div>
  )
}

// Add missing Menu icon
function Menu(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  )
}

