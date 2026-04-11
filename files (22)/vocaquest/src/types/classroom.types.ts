// src/types/classroom.types.ts
export interface Classroom {
  id:               string;
  name:             string;
  teacher_id:       string;
  grade_band:       string;
  school_id?:       string;
  class_code:       string;
  hide_leaderboard: boolean;
  created_at:       string;
}

export interface TeacherAssignment {
  id:           string;
  classroom_id: string;
  word_ids:     string[];
  due_date?:    string;
  assigned_by:  string;
  notes?:       string;
  created_at:   string;
}
