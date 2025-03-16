import { create } from "zustand"
import { persist } from "zustand/middleware"
import type {
  OfficialSettings,
  SemesterSettings,
  Teacher,
  Student,
  Room,
  SupervisionSchedule,
  AbsenceRecord,
} from "../types"

interface AppState {
  // Settings
  officialSettings: OfficialSettings
  semesterSettings: SemesterSettings

  // Imported data
  officialTeachers: Teacher[]
  officialStudents: Student[]
  semesterTeachers: Teacher[]
  semesterStudents: Student[]
  semesterRooms: Room[]

  // Schedules
  officialSupervisionSchedule: SupervisionSchedule
  semesterSupervisionSchedule: SupervisionSchedule

  // Absences
  officialAbsences: AbsenceRecord[]
  semesterAbsences: AbsenceRecord[]

  // Actions
  setOfficialSettings: (settings: Partial<OfficialSettings>) => void
  setSemesterSettings: (settings: Partial<SemesterSettings>) => void
  setOfficialTeachers: (teachers: Teacher[]) => void
  setOfficialStudents: (students: Student[]) => void
  setSemesterTeachers: (teachers: Teacher[]) => void
  setSemesterStudents: (students: Student[]) => void
  setSemesterRooms: (rooms: Room[]) => void
  setOfficialSupervisionSchedule: (schedule: SupervisionSchedule) => void
  setSemesterSupervisionSchedule: (schedule: SupervisionSchedule) => void
  addOfficialAbsence: (absence: AbsenceRecord) => void
  addSemesterAbsence: (absence: AbsenceRecord) => void
  resetApplication: () => void
}

// Default empty settings
const defaultOfficialSettings: OfficialSettings = {
  schoolName: "",
  schoolAddress: "",
  principalName: "",
  examSession: "",
  academicYear: new Date().getFullYear().toString(),
  startDate: "",
  endDate: "",
  startHour: "",
  endHour: "",
  coordinatorName: "",
  contactPhone: "",
  contactEmail: "",
  centerCode: "",
  centerName: "",
}

const defaultSemesterSettings: SemesterSettings = {
  ...defaultOfficialSettings,
  examDuration: "",
  passingGrade: "",
}

// Create the store with persistence
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      officialSettings: defaultOfficialSettings,
      semesterSettings: defaultSemesterSettings,
      officialTeachers: [],
      officialStudents: [],
      semesterTeachers: [],
      semesterStudents: [],
      semesterRooms: [],
      officialSupervisionSchedule: {},
      semesterSupervisionSchedule: {},
      officialAbsences: [],
      semesterAbsences: [],

      // Actions
      setOfficialSettings: (settings) =>
        set((state) => ({
          officialSettings: { ...state.officialSettings, ...settings },
        })),

      setSemesterSettings: (settings) =>
        set((state) => ({
          semesterSettings: { ...state.semesterSettings, ...settings },
        })),

      setOfficialTeachers: (teachers) => set({ officialTeachers: teachers }),

      setOfficialStudents: (students) => set({ officialStudents: students }),

      setSemesterTeachers: (teachers) => set({ semesterTeachers: teachers }),

      setSemesterStudents: (students) => set({ semesterStudents: students }),

      setSemesterRooms: (rooms) => set({ semesterRooms: rooms }),

      setOfficialSupervisionSchedule: (schedule) => set({ officialSupervisionSchedule: schedule }),

      setSemesterSupervisionSchedule: (schedule) => set({ semesterSupervisionSchedule: schedule }),

      addOfficialAbsence: (absence) =>
        set((state) => ({
          officialAbsences: [...state.officialAbsences, absence],
        })),

      addSemesterAbsence: (absence) =>
        set((state) => ({
          semesterAbsences: [...state.semesterAbsences, absence],
        })),

      resetApplication: () =>
        set({
          officialSettings: defaultOfficialSettings,
          semesterSettings: defaultSemesterSettings,
          officialTeachers: [],
          officialStudents: [],
          semesterTeachers: [],
          semesterStudents: [],
          semesterRooms: [],
          officialSupervisionSchedule: {},
          semesterSupervisionSchedule: {},
          officialAbsences: [],
          semesterAbsences: [],
        }),
    }),
    {
      name: "egest-storage",
      // Only persist specific parts of the state if needed
      partialize: (state) => ({
        officialSettings: state.officialSettings,
        semesterSettings: state.semesterSettings,
        officialTeachers: state.officialTeachers,
        officialStudents: state.officialStudents,
        semesterTeachers: state.semesterTeachers,
        semesterStudents: state.semesterStudents,
        semesterRooms: state.semesterRooms,
        officialSupervisionSchedule: state.officialSupervisionSchedule,
        semesterSupervisionSchedule: state.semesterSupervisionSchedule,
        officialAbsences: state.officialAbsences,
        semesterAbsences: state.semesterAbsences,
      }),
    },
  ),
)

