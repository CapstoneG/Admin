import React, { useState } from 'react';
import type { Unit, Course } from '@/types/admin';
import { FaPlus, FaEdit, FaTrash, FaBook, FaArrowLeft } from 'react-icons/fa';
import '@/styles/admin/UnitManagement.css';

interface UnitManagementProps {
  course: Course;
  onSelectUnit: (unit: Unit) => void;
  onBack: () => void;
  onRefresh?: () => Promise<void>;
}

const UnitManagement: React.FC<UnitManagementProps> = ({ course, onSelectUnit, onBack, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [formData, setFormData] = useState({
    courseId: course.id,
    title: '',
    description: '',
    orderIndex: 0,
    icon: 'FaBook'
  });

  const handleOpenModal = (unit?: Unit) => {
    if (unit) {
      setEditingUnit(unit);
      setFormData({
        courseId: course.id,
        title: unit.title,
        description: unit.description,
        orderIndex: unit.orderIndex,
        icon: 'FaBook'
      });
    } else {
      setEditingUnit(null);
      setFormData({
        courseId: course.id,
        title: '',
        description: '',
        orderIndex: course.units.length,
        icon: 'FaBook'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUnit(null);
    setFormData({
      courseId: course.id,
      title: '',
      description: '',
      orderIndex: 0,
      icon: 'FaBook'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('enghub_admin_token');
      const url = editingUnit 
        ? `http://localhost:8080/api/v1/units/${editingUnit.id}`
        : `http://localhost:8080/api/v1/units`;
      
      const method = editingUnit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        handleCloseModal();
        if (onRefresh) {
          await onRefresh();
        }
      }
    } catch (error) {
      console.error('Error saving unit:', error);
      alert('Có lỗi xảy ra khi lưu unit');
    }
  };

  const handleDelete = async (unitId: number) => {
    if (!confirm('Bạn có chắc muốn xóa unit này?')) return;

    try {
      const token = localStorage.getItem('enghub_admin_token');
      const response = await fetch(`http://localhost:8080/api/v1/units/${unitId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        if (onRefresh) {
          await onRefresh();
        }
      }
    } catch (error) {
      console.error('Error deleting unit:', error);
      alert('Có lỗi xảy ra khi xóa unit');
    }
  };

  return (
    <div className="unit-management">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>
          <FaArrowLeft /> Quay lại
        </button>
      </div>

      <div className="course-banner">
        <div className="course-info">
          <h1 className="course-title">{course.title}</h1>
          <p className="course-desc">{course.description}</p>
        </div>
        <button className="add-btn" onClick={() => handleOpenModal()}>
          <FaPlus /> Thêm Unit
        </button>
      </div>

      <div className="units-grid">
        {course.units.map(unit => (
          <div key={unit.id} className="unit-card">
            <div className="unit-header">
              <div className="unit-number">#{unit.orderIndex}</div>
              <h3 className="unit-title">{unit.title}</h3>
            </div>
            
            <p className="unit-description">{unit.description}</p>
            
            <div className="unit-stats">
              <div className="stat-item">
                <FaBook />
                <div className="stat-content">
                  <span className="stat-value">{unit.lessons.length}</span>
                  <span className="stat-label">bài học</span>
                </div>
              </div>
            </div>

            <div className="unit-actions">
              <button 
                className="action-btn view"
                onClick={() => onSelectUnit(unit)}
              >
                Xem Lessons
              </button>
              <button 
                className="action-btn edit"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenModal(unit);
                }}
              >
                <FaEdit />
              </button>
              <button 
                className="action-btn delete"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(unit.id);
                }}
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {course.units.length === 0 && (
        <div className="empty-state">
          <p>Chưa có unit nào. Hãy tạo unit đầu tiên!</p>
        </div>
      )}

      {/* Create/Edit Unit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingUnit ? 'Chỉnh sửa Unit' : 'Tạo Unit mới'}</h2>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="unit-form">
              <div className="form-group">
                <label>Tiêu đề</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ví dụ: Unit 1: Greetings"
                  required
                />
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả nội dung của unit"
                  rows={3}
                  required
                />
              </div>

              <div className="form-group">
                <label>Thứ tự</label>
                <input
                  type="number"
                  value={formData.orderIndex}
                  onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) })}
                  min="0"
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={handleCloseModal}>
                  Hủy
                </button>
                <button type="submit" className="submit-btn">
                  {editingUnit ? 'Cập nhật' : 'Tạo Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnitManagement;
