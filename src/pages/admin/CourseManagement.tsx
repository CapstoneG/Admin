import React, { useState, useEffect } from 'react';
import type { Course, Unit } from '@/types/admin';
import { FaArrowRight } from 'react-icons/fa';
import '@/styles/admin/CourseManagement.css';
import logo from '@/assets/logo.png';

interface CourseManagementProps {
  onSelectCourse: (course: Course) => void;
}

const CourseManagement: React.FC<CourseManagementProps> = ({ onSelectCourse }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/courses');
      
      if (response.ok) {
        const data = await response.json();
        if (data.code === 0 && data.result) {
          setCourses(data.result);
        }
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelBadgeColor = (level: string) => {
    const lowerLevel = level.toLowerCase();
    switch (lowerLevel) {
      case 'beginner':
        return 'level-beginner';
      case 'intermediate':
        return 'level-intermediate';
      case 'advanced':
        return 'level-advanced';
      default:
        return 'level-beginner';
    }
  };

  const getTotalLessons = (units: Unit[]) => {
    return units.reduce((total, unit) => total + unit.lessons.length, 0);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Đang tải khóa học...</p>
      </div>
    );
  }

  return (
    <div className="course-management">
      <div className="section-header">
        <h2>Quản lý Khóa học</h2>
      </div>

      <div className="courses-grid">
        {courses.map(course => (
          <div key={course.id} className="course-card" onClick={() => onSelectCourse(course)}>
            <div className="course-header">
              <div className="course-icon">
                <img src={logo} alt="Course" />
              </div>
              <span className={`level-badge ${getLevelBadgeColor(course.level)}`}>
                {course.level}
              </span>
            </div>

            <h3 className="course-title">{course.title}</h3>
            <p className="course-description">{course.description}</p>

            <div className="course-meta">
              <div className="meta-item">
                <span className="meta-label">Ngôn ngữ</span>
                <span className="meta-value">{course.language.name}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Units</span>
                <span className="meta-value">{course.units.length}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Lessons</span>
                <span className="meta-value">{getTotalLessons(course.units)}</span>
              </div>
            </div>

            <div className="course-footer">
              <button className="view-btn">
                Quản lý Units & Lessons
                <FaArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="empty-state">
          <img src={logo} alt="Empty" style={{width: '64px', height: '64px', opacity: 0.4}} />
          <h3>Chưa có khóa học nào</h3>
          <p>Hệ thống chưa có khóa học. Vui lòng thêm khóa học từ backend.</p>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
