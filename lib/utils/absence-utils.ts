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

// Función para filtrar ausencias por tipo
export function filterAbsencesByType(absences: AbsenceRecord[], type: "student" | "teacher"): AbsenceRecord[] {
  return absences.filter((absence) => absence.type === type)
}

// Función para filtrar ausencias por estado
export function filterAbsencesByStatus(absences: AbsenceRecord[], status: AbsenceType): AbsenceRecord[] {
  return absences.filter((absence) => absence.status === status)
}

// Función para filtrar ausencias por fecha
export function filterAbsencesByDate(absences: AbsenceRecord[], date: string): AbsenceRecord[] {
  return absences.filter((absence) => absence.date === date)
}

// Función para filtrar ausencias por período
export function filterAbsencesByPeriod(absences: AbsenceRecord[], period: "morning" | "evening"): AbsenceRecord[] {
  return absences.filter((absence) => absence.period === period)
}

// Función para calcular estadísticas de ausencias
export function calculateAbsenceStats(absences: AbsenceRecord[], totalStudents: number, totalTeachers: number) {
  const studentAbsences = absences.filter((a) => a.type === "student" && a.status === "absent").length
  const teacherAbsences = absences.filter((a) => a.type === "teacher" && a.status === "absent").length
  const studentLates = absences.filter((a) => a.type === "student" && a.status === "late").length
  const teacherLates = absences.filter((a) => a.type === "teacher" && a.status === "late").length

  return {
    totalStudents,
    totalTeachers,
    studentAbsences,
    teacherAbsences,
    studentLates,
    teacherLates,
    studentAbsenceRate: totalStudents > 0 ? (studentAbsences / totalStudents) * 100 : 0,
    teacherAbsenceRate: totalTeachers > 0 ? (teacherAbsences / totalTeachers) * 100 : 0,
    studentLateRate: totalStudents > 0 ? (studentLates / totalStudents) * 100 : 0,
    teacherLateRate: totalTeachers > 0 ? (teacherLates / totalTeachers) * 100 : 0,
  }
}

// Función para agrupar ausencias por fecha
export function groupAbsencesByDate(absences: AbsenceRecord[]): Record<string, AbsenceRecord[]> {
  const grouped: Record<string, AbsenceRecord[]> = {}

  absences.forEach((absence) => {
    if (!grouped[absence.date]) {
      grouped[absence.date] = []
    }
    grouped[absence.date].push(absence)
  })

  return grouped
}

// Función para agrupar ausencias por tipo
export function groupAbsencesByType(absences: AbsenceRecord[]): Record<string, AbsenceRecord[]> {
  const grouped: Record<string, AbsenceRecord[]> = {
    student: [],
    teacher: [],
  }

  absences.forEach((absence) => {
    grouped[absence.type].push(absence)
  })

  return grouped
}

