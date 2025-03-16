import { useAppStore } from "../state/store"
import type { SupervisionRecord, SupervisionSchedule, Room, Teacher } from "../types"

// Distribute teachers for official exams supervision
export function distributeOfficialSupervision(
  day: string,
  period: "morning" | "evening",
  teacherNames: string[],
  roomNames: string[],
): SupervisionRecord[] {
  console.log(`Distributing official supervision for ${day}, ${period} period`)

  if (teacherNames.length === 0 || roomNames.length === 0) {
    console.warn("No teachers or rooms available for distribution")
    return []
  }

  // Get current schedule from store
  const store = useAppStore.getState()
  const currentSchedule = store.officialSupervisionSchedule || {}

  // Get previously assigned main supervisors for this day
  const mainSupervisorsForDay = new Set<string>()
  if (period === "evening" && currentSchedule[day]?.["morning"]?.length > 0) {
    currentSchedule[day]["morning"].forEach((record) => {
      if (record.mainSupervisor) {
        mainSupervisorsForDay.add(record.mainSupervisor)
      }
    })
  }

  // Shuffle teachers for random assignment
  const shuffledTeachers = [...teacherNames].sort(() => Math.random() - 0.5)

  // Track assigned teachers
  const assignedTeachers = new Set<string>()

  // Create assignments for each room
  const assignments: SupervisionRecord[] = []

  roomNames.forEach((room) => {
    let mainSupervisor: string

    // If it's evening period, try to keep the same main supervisor from morning
    if (period === "evening" && currentSchedule[day]?.["morning"]?.length > 0) {
      const morningRecord = currentSchedule[day]["morning"].find((r) => r.room === room)
      if (morningRecord && morningRecord.mainSupervisor) {
        mainSupervisor = morningRecord.mainSupervisor
      } else {
        // Find an unassigned teacher for main supervisor
        mainSupervisor =
          shuffledTeachers.find((t) => !assignedTeachers.has(t) && !mainSupervisorsForDay.has(t)) || shuffledTeachers[0]
      }
    } else {
      // Find an unassigned teacher for main supervisor
      mainSupervisor = shuffledTeachers.find((t) => !assignedTeachers.has(t)) || shuffledTeachers[0]
    }

    assignedTeachers.add(mainSupervisor)

    // Find second supervisor
    const secondSupervisor = shuffledTeachers.find((t) => !assignedTeachers.has(t)) || shuffledTeachers[0]
    assignedTeachers.add(secondSupervisor)

    // Find third supervisor
    const thirdSupervisor = shuffledTeachers.find((t) => !assignedTeachers.has(t)) || shuffledTeachers[0]
    assignedTeachers.add(thirdSupervisor)

    assignments.push({
      room,
      mainSupervisor,
      secondSupervisor,
      thirdSupervisor,
    })
  })

  // Update the schedule in the store
  const newSchedule = { ...currentSchedule }
  if (!newSchedule[day]) {
    newSchedule[day] = { morning: [], evening: [] }
  }
  newSchedule[day][period] = assignments

  store.setOfficialSupervisionSchedule(newSchedule)

  return assignments
}

// Distribute teachers for semester exams supervision
export function distributeSemesterSupervision(
  day: string,
  period: "morning" | "evening",
  teacherNames: string[],
  rooms: Room[],
): SupervisionRecord[] {
  console.log(`Distributing semester supervision for ${day}, ${period} period`)

  if (teacherNames.length === 0 || rooms.length === 0) {
    console.warn("No teachers or rooms available for distribution")
    return []
  }

  // Get current schedule from store
  const store = useAppStore.getState()
  const currentSchedule = store.semesterSupervisionSchedule || {}

  // Get teachers who worked in the morning period (to exclude them from evening)
  const morningTeachers = new Set<string>()
  if (period === "evening" && currentSchedule[day]?.["morning"]?.length > 0) {
    currentSchedule[day]["morning"].forEach((record) => {
      if (record.supervisors) {
        record.supervisors.forEach((supervisor) => morningTeachers.add(supervisor))
      }
    })
  }

  // Shuffle teachers for random assignment
  let availableTeachers = [...teacherNames]

  // For evening period, filter out teachers who worked in the morning
  if (period === "evening") {
    availableTeachers = availableTeachers.filter((teacher) => !morningTeachers.has(teacher))
  }

  // Shuffle the available teachers
  availableTeachers = availableTeachers.sort(() => Math.random() - 0.5)

  // Track assigned teachers
  const assignedTeachers = new Set<string>()

  // Create assignments for each room
  const assignments: SupervisionRecord[] = []

  // Process rooms by type
  const regularRooms = rooms.filter((room) => room.type === "regular")
  const specialRooms = rooms.filter((room) => room.type === "special")

  // Assign supervisors to regular rooms (1 supervisor per room)
  for (const room of regularRooms) {
    // Find an unassigned teacher
    const supervisor = availableTeachers.find((t) => !assignedTeachers.has(t))

    // If no unassigned teacher is available, reuse a teacher
    const assignedSupervisor = supervisor || availableTeachers[0]

    if (assignedSupervisor) {
      assignedTeachers.add(assignedSupervisor)

      assignments.push({
        room,
        supervisors: [assignedSupervisor],
      })
    }
  }

  // Assign supervisors to special rooms (2 supervisors per room)
  for (const room of specialRooms) {
    const roomSupervisors: string[] = []

    // Find first supervisor
    const firstSupervisor = availableTeachers.find((t) => !assignedTeachers.has(t))
    if (firstSupervisor) {
      assignedTeachers.add(firstSupervisor)
      roomSupervisors.push(firstSupervisor)
    } else if (availableTeachers.length > 0) {
      roomSupervisors.push(availableTeachers[0])
    }

    // Find second supervisor
    const secondSupervisor = availableTeachers.find((t) => !assignedTeachers.has(t))
    if (secondSupervisor) {
      assignedTeachers.add(secondSupervisor)
      roomSupervisors.push(secondSupervisor)
    } else if (availableTeachers.length > 0) {
      roomSupervisors.push(availableTeachers[0])
    }

    assignments.push({
      room,
      supervisors: roomSupervisors,
    })
  }

  // Update the schedule in the store
  const newSchedule = { ...currentSchedule }
  if (!newSchedule[day]) {
    newSchedule[day] = { morning: [], evening: [] }
  }
  newSchedule[day][period] = assignments

  store.setSemesterSupervisionSchedule(newSchedule)

  return assignments
}

// Get supervision schedule for official exams
export function getOfficialSupervisionSchedule(): SupervisionSchedule {
  return useAppStore.getState().officialSupervisionSchedule || {}
}

// Get supervision schedule for semester exams
export function getSemesterSupervisionSchedule(): SupervisionSchedule {
  return useAppStore.getState().semesterSupervisionSchedule || {}
}

// Función para distribuir profesores en salas
export function distributeTeachers(
  teachers: Teacher[],
  rooms: Room[],
  examDays: { day: string; date: string }[],
  selectedRooms: string[] = [],
) {
  // Si no hay profesores, salas o días de examen, devolver un objeto vacío
  if (!teachers.length || !rooms.length || !examDays.length) {
    return {}
  }

  // Filtrar solo las salas seleccionadas si se proporciona una lista
  const availableRooms = selectedRooms.length > 0 ? rooms.filter((room) => selectedRooms.includes(room.name)) : rooms

  if (availableRooms.length === 0) {
    return {}
  }

  // Crear un objeto para almacenar la distribución
  const distribution: Record<string, Record<string, Record<string, string[]>>> = {}

  // Inicializar la estructura de distribución
  examDays.forEach((examDay) => {
    const dayKey = `${examDay.day} ${examDay.date}`
    distribution[dayKey] = {
      morning: {},
      evening: {},
    }

    // Inicializar cada sala para la mañana y la tarde
    availableRooms.forEach((room) => {
      distribution[dayKey].morning[room.name] = []
      distribution[dayKey].evening[room.name] = []
    })
  })

  // Crear una copia de los profesores para no modificar el array original
  const availableTeachers = [...teachers]

  // Crear un mapa para rastrear los días en que cada profesor ya está asignado
  const teacherAssignments: Record<string, Set<string>> = {}
  teachers.forEach((teacher) => {
    teacherAssignments[teacher.id] = new Set()
  })

  // Distribuir profesores para cada día y período
  examDays.forEach((examDay) => {
    const dayKey = `${examDay.day} ${examDay.date}`

    // Distribuir para el período de la mañana
    distributeForPeriod(dayKey, "morning", availableTeachers, availableRooms, distribution, teacherAssignments)

    // Distribuir para el período de la tarde
    distributeForPeriod(dayKey, "evening", availableTeachers, availableRooms, distribution, teacherAssignments)
  })

  return distribution
}

// Función auxiliar para distribuir profesores en un período específico
function distributeForPeriod(
  day: string,
  period: "morning" | "evening",
  teachers: Teacher[],
  rooms: Room[],
  distribution: Record<string, Record<string, Record<string, string[]>>>,
  teacherAssignments: Record<string, Set<string>>,
) {
  // Crear una copia de las salas para no modificar el array original
  const availableRooms = [...rooms]

  // Ordenar las salas por capacidad (de mayor a menor)
  availableRooms.sort((a, b) => b.capacity - a.capacity)

  // Para cada sala, asignar profesores
  availableRooms.forEach((room) => {
    // Determinar cuántos profesores necesita esta sala
    const supervisorsNeeded = Math.ceil(room.capacity / 20) // 1 profesor por cada 20 estudiantes

    // Asignar profesores a esta sala
    for (let i = 0; i < supervisorsNeeded; i++) {
      // Encontrar un profesor disponible que no esté asignado este día
      const availableTeacherIndex = teachers.findIndex((teacher) => !teacherAssignments[teacher.id].has(day))

      if (availableTeacherIndex !== -1) {
        const teacher = teachers[availableTeacherIndex]

        // Agregar el profesor a la sala
        distribution[day][period][room.name].push(teacher.name)

        // Marcar al profesor como asignado para este día
        teacherAssignments[teacher.id].add(day)

        // Mover al profesor al final de la lista para equilibrar la carga
        teachers.push(...teachers.splice(availableTeacherIndex, 1))
      }
    }
  })
}

// Función para calcular estadísticas de supervisión
export function calculateSupervisionStats(
  distribution: Record<string, Record<string, Record<string, string[]>>>,
  teachers: Teacher[],
) {
  // Inicializar estadísticas
  const stats = {
    totalAssignments: 0,
    assignmentsPerTeacher: {} as Record<string, number>,
    assignmentsPerDay: {} as Record<string, number>,
    assignmentsPerRoom: {} as Record<string, number>,
    morningAssignments: 0,
    eveningAssignments: 0,
  }

  // Inicializar contadores para cada profesor
  teachers.forEach((teacher) => {
    stats.assignmentsPerTeacher[teacher.name] = 0
  })

  // Recorrer la distribución y contar asignaciones
  Object.keys(distribution).forEach((day) => {
    stats.assignmentsPerDay[day] = 0
    ;["morning", "evening"].forEach((period) => {
      Object.keys(distribution[day][period as "morning" | "evening"]).forEach((room) => {
        const teachersInRoom = distribution[day][period as "morning" | "evening"][room]

        // Incrementar el contador total
        stats.totalAssignments += teachersInRoom.length

        // Incrementar el contador por período
        if (period === "morning") {
          stats.morningAssignments += teachersInRoom.length
        } else {
          stats.eveningAssignments += teachersInRoom.length
        }

        // Incrementar el contador por día
        stats.assignmentsPerDay[day] += teachersInRoom.length

        // Incrementar el contador por sala
        stats.assignmentsPerRoom[room] = (stats.assignmentsPerRoom[room] || 0) + teachersInRoom.length

        // Incrementar el contador por profesor
        teachersInRoom.forEach((teacherName) => {
          stats.assignmentsPerTeacher[teacherName] = (stats.assignmentsPerTeacher[teacherName] || 0) + 1
        })
      })
    })
  })

  return stats
}

