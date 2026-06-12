export interface DocenteDashboardSummary {
  totalStudents: number;
  pendingEvaluations: number;
  todayAttendances: number;
  monthlyAnnotations: number;
}

export interface DocenteDashboardAssignment {
  cadId: number;
  courseId: number;
  courseName: string;
  subjectId: number;
  subjectName: string;
  subjectCode: string;
  sala: { id: number; nombre: string };
}

export interface DocenteDashboardCourse {
  courseId: number;
  courseName: string;
  attendanceCount: number;
  generalAverage: number;
}

export interface DocenteDashboardResponse {
  summary: DocenteDashboardSummary;
  assignments: DocenteDashboardAssignment[];
  courses: DocenteDashboardCourse[];
}
