// Tipos para los profesores
export type Teacher = {
  id: string
  name: string
  subject: string
}

// Tipos para los estudiantes
export type Student = {
  id: string
  name: string
  class: string
  studentId?: string
  examNumber?: string
}

// Tipos para las salas
export type Room = {
  id: string
  name: string
  capacity: number
  morning?: boolean
  evening?: boolean
}

// Tipo para los días de examen
export type ExamDay = {
  day: string
  date: string
}

// Tipos para las ausencias
export type AbsenceType = "absent" | "late" | "present"
export type AbsenceRecord = {
  id: string
  name: string
  status: AbsenceType
  date: string
  period: "morning" | "evening"
  type: "student" | "teacher"
  notes?: string
}

// Tipos para la configuración
export type BasicSettings = {
  institutionName: string
  academicYear: string
  directorName: string
  logoUrl?: string
}

export type OfficialSettings = {
  examSession: string
  examCenter: string
  centerCode: string
  centerManager: string
  startDate: string
  endDate: string
}

export type SemesterSettings = {
  semesterName: string
  startDate: string
  endDate: string
}

