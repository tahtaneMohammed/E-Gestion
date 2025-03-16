import * as XLSX from "xlsx"
import { useAppStore } from "../state/store"
import type { Teacher, Student, Room, ImportedData, ImportedSemesterData } from "../types"

// Process Excel file for teachers
export async function processTeachersExcel(file: File): Promise<Teacher[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })

        // Get the first sheet
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        if (jsonData.length === 0) {
          reject(new Error("No data found in the Excel file"))
          return
        }

        // Try to detect the name column
        const firstRow = jsonData[0]
        const rowKeys = Object.keys(firstRow)

        // Possible name column identifiers
        const possibleNameColumns = ["Name", "name", "الاسم", "اسم", "Teacher", "teacher", "الأستاذ", "استاذ", "مدرس"]

        // Find name column
        let nameColumn = null
        for (const key of rowKeys) {
          if (possibleNameColumns.some((col) => key.toLowerCase().includes(col.toLowerCase()))) {
            nameColumn = key
            break
          }
        }

        // If no name column found, use the first column
        if (!nameColumn && rowKeys.length > 0) {
          nameColumn = rowKeys[0]
        }

        // Process teachers
        const processedTeachers = jsonData.map((row: any, index) => {
          // Get name from detected column or fallback to first property
          let teacherName = nameColumn ? row[nameColumn] : Object.values(row)[0]

          // If name is undefined/null/empty, create a placeholder
          if (!teacherName) {
            teacherName = `أستاذ ${index + 1}`
          }

          // Convert to string if it's not already
          teacherName = String(teacherName).trim()

          return {
            id: index + 1,
            name: teacherName,
            subject: row.Subject || row.subject || row.المادة || row.مادة || "غير محدد",
          }
        })

        resolve(processedTeachers)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error("Error reading file"))
    }

    reader.readAsArrayBuffer(file)
  })
}

// Process Excel file for students
export async function processStudentsExcel(file: File): Promise<Student[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })

        // Get the first sheet
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        if (jsonData.length === 0) {
          reject(new Error("No data found in the Excel file"))
          return
        }

        // Process students
        const processedStudents = jsonData.map((row: any, index) => {
          // Try to find student name in various possible columns
          let studentName =
            row.Name || row.name || row.الاسم || row.اسم || row.Student || row.student || row.الطالب || row.طالب

          // If no name found, use first property value
          if (!studentName && Object.values(row).length > 0) {
            studentName = Object.values(row)[0]
          }

          // If still no name, create a placeholder
          if (!studentName) {
            studentName = `طالب ${index + 1}`
          }

          // Convert to string
          studentName = String(studentName).trim()

          return {
            id: index + 1,
            name: studentName,
            class: row.Class || row.class || row.القسم || row.قسم || "غير محدد",
            examNumber: row.ExamNumber || row.examNumber || row.رقم_الامتحان || `${2024000 + index + 1}`,
          }
        })

        resolve(processedStudents)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error("Error reading file"))
    }

    reader.readAsArrayBuffer(file)
  })
}

// Import official exam data
export async function importOfficialData(
  teachersFile: File | null,
  studentsFile: File | null,
  roomsCount: number,
  supervisorsPerRoom: number,
): Promise<ImportedData> {
  let teachers: Teacher[] = []
  let students: Student[] = []

  if (teachersFile) {
    teachers = await processTeachersExcel(teachersFile)
  }

  if (studentsFile) {
    students = await processStudentsExcel(studentsFile)
  }

  const importedData: ImportedData = {
    teachers,
    students,
    roomsCount,
    supervisorsPerRoom,
    timestamp: Date.now(),
  }

  // Save to store
  const store = useAppStore.getState()
  store.setOfficialTeachers(teachers)
  store.setOfficialStudents(students)

  return importedData
}

// Import semester exam data
export async function importSemesterData(
  teachersFile: File | null,
  studentsFile: File | null,
  rooms: Room[],
): Promise<ImportedSemesterData> {
  let teachers: Teacher[] = []
  let students: Student[] = []

  if (teachersFile) {
    teachers = await processTeachersExcel(teachersFile)
  }

  if (studentsFile) {
    students = await processStudentsExcel(studentsFile)
  }

  const importedData: ImportedSemesterData = {
    teachers,
    students,
    rooms,
    timestamp: Date.now(),
  }

  // Save to store
  const store = useAppStore.getState()
  store.setSemesterTeachers(teachers)
  store.setSemesterStudents(students)
  store.setSemesterRooms(rooms)

  return importedData
}

