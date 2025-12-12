import React, { useState, useEffect } from 'react';
import '@/styles/admin/AdminDashboard.css';
import { FaUsers, FaBook, FaChartLine, FaSignOutAlt, FaFileAlt, FaComments } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import CourseManagement from './CourseManagement';
import UnitManagement from './UnitManagement';
import LessonManagement from './LessonManagement';
import type { Unit, Course } from '@/types/admin';
import logoImg from '@/assets/logo.png';

interface Stats {
  totalUsers: number;
  totalCourses: number;
  totalLessons: number;
  activeUsers: number;
}

interface UserRole {
  name: string;
}

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: UserRole[];
  level: string;
  status: string;
  lastLogin: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [userFilter, setUserFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalCourses: 0,
    totalLessons: 0,
    activeUsers: 0
  });

  useEffect(() => {
    const INACTIVITY_TIME = 15 * 60 * 1000; 
    let inactivityTimer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        console.log('Auto logout due to inactivity');
        handleLogout();
      }, INACTIVITY_TIME);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });
    resetTimer();

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, []);

  useEffect(() => {
    fetchStats();
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('enghub_admin_token');
      const response = await fetch('http://localhost:8080/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        setFilteredUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleFilterChange = (filter: 'all' | 'admin' | 'user') => {
    setUserFilter(filter);
    if (filter === 'all') {
      setFilteredUsers(users);
    } else if (filter === 'admin') {
      setFilteredUsers(users.filter(user => 
        user.roles.some(role => role.name === 'ADMIN')
      ));
    } else {
      setFilteredUsers(users.filter(user => 
        user.roles.some(role => role.name === 'USER')
      ));
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('enghub_admin_token');
      const response = await fetch('http://localhost:8080/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Mock data for demo
      setStats({
        totalUsers: 1250,
        totalCourses: 24,
        totalLessons: 180,
        activeUsers: 456
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/admin/login');
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <img src={logoImg} alt="EngHub Admin" className="logo-image" />
          <div className="logo-info">
            <span className="logo-title">EngHub</span>
            <span className="logo-subtitle">Admin Panel</span>
          </div>
        </div>
        
        <nav className="admin-nav">
          <button
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <FaChartLine /> Tổng quan
          </button>
          <button
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <FaUsers /> Người dùng
          </button>
          <button
            className={`nav-item ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('courses');
              setSelectedCourse(null);
              setSelectedUnit(null);
            }}
          >
            <FaBook /> Khóa học
          </button>
          <button
            className={`nav-item ${activeTab === 'feedback' ? 'active' : ''}`}
            onClick={() => setActiveTab('feedback')}
          >
            <FaComments /> Phản hồi
          </button>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> Đăng xuất
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <h1>Bảng điều khiển quản trị</h1>
          <div className="admin-user">
            <span>Xin chào, Admin</span>
            <div className="admin-avatar">A</div>
          </div>
        </header>

        <div className="admin-content">
          {activeTab === 'overview' && (
            <div className="overview-section">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon users">
                    <FaUsers size={32} />
                  </div>
                  <div className="stat-info">
                    <h3>Tổng người dùng</h3>
                    <p className="stat-number">{stats.totalUsers.toLocaleString()}</p>
                    <span className="stat-change positive">+12% so với tháng trước</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon courses">
                    <FaBook size={32} />
                  </div>
                  <div className="stat-info">
                    <h3>Tổng khóa học</h3>
                    <p className="stat-number">{stats.totalCourses}</p>
                    <span className="stat-change positive">+2 khóa học mới</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon lessons">
                    <FaFileAlt size={32} />
                  </div>
                  <div className="stat-info">
                    <h3>Tổng bài học</h3>
                    <p className="stat-number">{stats.totalLessons}</p>
                    <span className="stat-change neutral">Ổn định</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon active">
                    <FaChartLine size={32} />
                  </div>
                  <div className="stat-info">
                    <h3>Người dùng hoạt động</h3>
                    <p className="stat-number">{stats.activeUsers}</p>
                    <span className="stat-change positive">+8% hôm nay</span>
                  </div>
                </div>
              </div>

              <div className="charts-section">
                <div className="chart-card">
                  <h3>📊 Hoạt động gần đây</h3>
                  <p className="placeholder">Biểu đồ thống kê người dùng theo thời gian</p>
                </div>
                <div className="chart-card">
                  <h3>📈 Khóa học phổ biến</h3>
                  <p className="placeholder">Biểu đồ khóa học được học nhiều nhất</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="users-section">
              <div className="section-header">
                <h2>Quản lý người dùng</h2>
                <div className="header-actions">
                  <div className="filter-tabs">
                    <button 
                      className={`filter-tab ${userFilter === 'all' ? 'active' : ''}`}
                      onClick={() => handleFilterChange('all')}
                    >
                      Tất cả
                    </button>
                    <button 
                      className={`filter-tab ${userFilter === 'admin' ? 'active' : ''}`}
                      onClick={() => handleFilterChange('admin')}
                    >
                      Admin
                    </button>
                    <button 
                      className={`filter-tab ${userFilter === 'user' ? 'active' : ''}`}
                      onClick={() => handleFilterChange('user')}
                    >
                      Học viên
                    </button>
                  </div>
                  <button className="add-btn">+ Thêm người dùng</button>
                </div>
              </div>
              
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Tên</th>
                      <th>Email</th>
                      <th>Vai trò</th>
                      <th>Cấp độ</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => {
                        const isAdmin = user.roles.some(role => role.name === 'ADMIN');
                        const fullName = `${user.firstName} ${user.lastName}`;
                        const initial = user.firstName.charAt(0).toUpperCase();
                        
                        return (
                          <tr key={user.id} className={isAdmin ? 'admin-row' : ''}>
                            <td>{user.id}</td>
                            <td>
                              <div className="user-info">
                                <div className={`user-avatar ${isAdmin ? 'admin-avatar' : ''}`}>
                                  {initial}
                                </div>
                                <span>{fullName}</span>
                              </div>
                            </td>
                            <td>{user.email}</td>
                            <td>
                              <span className={`role-badge ${isAdmin ? 'admin' : 'user'}`}>
                                {isAdmin ? 'Admin' : 'Học viên'}
                              </span>
                            </td>
                            <td>
                              <span className="level-badge">{user.level}</span>
                            </td>
                            <td>
                              <span className={`status-badge ${user.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                                {user.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm khóa'}
                              </span>
                            </td>
                            <td>
                              <div className="action-buttons">
                                <button className="action-btn edit" title="Sửa thông tin">
                                  <span className="btn-text">Sửa</span>
                                </button>
                                <button 
                                  className="action-btn delete" 
                                  disabled={isAdmin}
                                  title={isAdmin ? 'Không thể xóa admin' : 'Xóa người dùng'}
                                >
                                  <span className="btn-text">Xóa</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                          Không có người dùng nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="courses-section">
              {selectedUnit ? (
                <LessonManagement 
                  unit={selectedUnit} 
                  onBack={() => setSelectedUnit(null)} 
                />
              ) : selectedCourse ? (
                <UnitManagement 
                  course={selectedCourse}
                  onSelectUnit={setSelectedUnit}
                  onBack={() => setSelectedCourse(null)}
                />
              ) : (
                <CourseManagement onSelectCourse={setSelectedCourse} />
              )}
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="feedback-section">
              <div className="section-header">
                <h2>Phản hồi từ người dùng</h2>
              </div>
              <p className="placeholder">Danh sách phản hồi sẽ hiển thị ở đây</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
