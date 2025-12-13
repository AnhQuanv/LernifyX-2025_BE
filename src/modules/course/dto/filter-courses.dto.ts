export class FilterCoursesDto {
  category?: string;
  level?: string;
  rating?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface TeacherCourseFilterDto {
  status?: string;
  search?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}
