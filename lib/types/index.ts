// Core application types
export type ExamType = "official" | "semester"

// Settings types
export interface BaseSettings {
  schoolName: string
  schoolAddress: string
  principalName: string
  examSession: string
  academicYear: string
  startDate: string
  endDate: string
  startHour: string
  endHour: string
  coordinatorName: string
  contactPhone: string
  contactEmail: string
  centerCode: string
  centerName: string
}

export interface OfficialSettings extends BaseSettings {}

export interface SemesterSettings extends BaseSettings {
  examDuration: string
  passingGrade: string
}

// User types
export interface Teacher {
  id: string | number
  name: string
  subject?: string
}

export interface Student {
  id: string | number
  name: string
  class?: string
  examNumber?: string
  studentId?: string
}

// Room types
export interface Room {
  id: string | number
  name: string
  type: "regular" | "special"
}

// Supervision types
export interface SupervisionRecord {
  room: string | Room
  mainSupervisor?: string
  secondSupervisor?: string
  thirdSupervisor?: string
  supervisors?: string[]
}

export interface SupervisionSchedule {
  [day: string]: {
    [period in "morning" | "evening"]: SupervisionRecord[]
  }
}

// Absence types
export type AbsenceType = "absent" | "late" | "present"

export interface AbsenceRecord {
  id: string
  name: string
  status: AbsenceType
  date: string
  period: "morning" | "evening"
  type: "student" | "teacher"
  notes?: string
}

// Import data types
export interface ImportedData {
  teachers: Teacher[]
  students: Student[]
  roomsCount: number
  supervisorsPerRoom: number
  timestamp: number
}

export interface ImportedSemesterData {
  teachers: Teacher[]
  students: Student[]
  rooms: Room[]
  timestamp: number
}

