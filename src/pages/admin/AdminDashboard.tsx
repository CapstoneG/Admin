import React, { useState, useEffect } from 'react';
import '@/styles/admin/AdminDashboard.css';
import { FaUsers, FaBook, FaChartLine, FaSignOutAlt, FaFileAlt, FaComments, FaLayerGroup, FaTrophy } from 'react-icons/fa';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { authService, type User } from '@/services/authService';
import CourseManagement from './CourseManagement';
import UnitManagement from './UnitManagement';
import LessonManagement from './LessonManagement';
import SkillManagement from './SkillManagement';
import FlashcardManagement from './FlashcardManagement';
import type { Unit, Course } from '@/types/admin';
import logoImg from '@/assets/logo.png';

interface Stats {
  totalUsers: number;
  totalLessons: number;
  totalSkills: number;
  activeUsers: number;
  totalDeck: number;
}

interface ActivityData {
  name: string;
  flashcards: number;
  lessons: number;
  skills: number;
}

interface ActivityDataSkill {
  name: string;
  students: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [activityDataSkill, setActivityDataSkill] = useState<ActivityDataSkill[]>([]);

  const fetchCourseDetails = async (courseId: number) => {
    try {
      const token = localStorage.getItem('enghub_admin_token');
      const response = await fetch(`http://localhost:8080/api/v1/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.code === 0 && data.result) {
          setSelectedCourse(data.result);
          // If we're viewing a unit, update it too
          if (selectedUnit) {
            const updatedUnit = data.result.units.find((u: Unit) => u.id === selectedUnit.id);
            if (updatedUnit) {
              setSelectedUnit(updatedUnit);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
    }
  };

  const handleRefreshCourse = async () => {
    if (selectedCourse) {
      await fetchCourseDetails(selectedCourse.id);
    }
  };

  const handleRefreshUnit = async () => {
    if (selectedCourse) {
      await fetchCourseDetails(selectedCourse.id);
    }
  };
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [userFilter, setUserFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalLessons: 0,
    totalSkills: 0,
    activeUsers: 0,
    totalDeck: 0
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
    fetchCurrentUser();
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchCurrentUser = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

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
        user.roles?.some(role => role.name === 'ADMIN') ?? false
      ));
    } else {
      setFilteredUsers(users.filter(user => 
        user.roles?.some(role => role.name === 'USER') ?? false
      ));
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('enghub_admin_token');
      const response = await fetch('http://localhost:8080/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.code === 0 && data.result) {
          setStats({
            totalUsers: data.result.totalUsers,
            totalLessons: data.result.totalLessons,
            totalSkills: data.result.totalSkills,
            activeUsers: data.result.activeUsers,
            totalDeck: data.result.totalDeck
          });
          setActivityData(data.result.activityData || []);
          setActivityDataSkill(data.result.activityDataSkill || []);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

  const handleToggleUserStatus = async (userId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const action = newStatus === 'ACTIVE' ? 'kích hoạt' : 'vô hiệu hóa';
    
    if (!confirm(`Bạn có chắc muốn ${action} người dùng này?`)) return;

    try {
      await authService.updateUserStatus(userId, newStatus);
      // Refresh user list after status update
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
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
            className={`nav-item ${activeTab === 'flashcard' ? 'active' : ''}`}
            onClick={() => setActiveTab('flashcard')}
          >
            <FaLayerGroup /> Flashcard
          </button>
          <button
            className={`nav-item ${activeTab === 'skill' ? 'active' : ''}`}
            onClick={() => setActiveTab('skill')}
          >
            <FaTrophy /> Skill
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
            <span>Xin chào, {currentUser ? `${currentUser.lastName}` : 'Admin'}</span>
            <div className="admin-avatar">
              {currentUser?.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt="Admin Avatar" />
              ) : (
                <img src="https://ui-avatars.com/api/?name=Admin&background=667eea&color=fff&size=128" alt="Admin Avatar" />
              )}
            </div>
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
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon lessons">
                    <FaFileAlt size={32} />
                  </div>
                  <div className="stat-info">
                    <h3>Tổng bài học</h3>
                    <p className="stat-number">{stats.totalLessons}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon skills">
                    <FaTrophy size={32} />
                  </div>
                  <div className="stat-info">
                    <h3>Tổng kỹ năng</h3>
                    <p className="stat-number">{stats.totalSkills}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon deck">
                    <FaLayerGroup size={32} />
                  </div>
                  <div className="stat-info">
                    <h3>Tổng bộ thẻ</h3>
                    <p className="stat-number">{stats.totalDeck}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon active">
                    <FaChartLine size={32} />
                  </div>
                  <div className="stat-info">
                    <h3>Người dùng hoạt động</h3>
                    <p className="stat-number">{stats.activeUsers}</p>
                  </div>
                </div>
              </div>

              <div className="charts-section">
                <div className="chart-card">
                  <h3>Tổng thời gian học</h3>
                  <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={activityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                          }} 
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="flashcards" 
                          stroke="#667eea" 
                          strokeWidth={3}
                          name="Flashcards"
                          dot={{ fill: '#667eea', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="lessons" 
                          stroke="#f5576c" 
                          strokeWidth={3}
                          name="Bài học"
                          dot={{ fill: '#f5576c', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="skills" 
                          stroke="#f59e0b" 
                          strokeWidth={3}
                          name="Kỹ năng"
                          dot={{ fill: '#f59e0b', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="chart-card">
                  <h3>Hoạt động theo kỹ năng</h3>
                  <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={activityDataSkill}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="name" 
                          stroke="#6b7280"
                          angle={-15}
                          textAnchor="end"
                          height={80}
                          fontSize={12}
                        />
                        <YAxis stroke="#6b7280" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                          }} 
                        />
                        <Legend />
                        <Bar 
                          dataKey="students" 
                          fill="#667eea" 
                          name="Học viên"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
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
                        const isAdmin = user.roles?.some(role => role.name === 'ADMIN') ?? false;
                        const fullName = `${user.firstName} ${user.lastName}`;
                        const initial = user.firstName.charAt(0).toUpperCase();
                        
                        return (
                          <tr key={user.id} className={isAdmin ? 'admin-row' : ''}>
                            <td>{user.id}</td>
                            <td>
                              <div className="user-info">
                                <div className={`user-avatar ${isAdmin ? 'admin-avatar' : ''}`}>
                                  {user.avatarUrl ? (
                                    <img src={user.avatarUrl} alt={fullName} />
                                  ) : (
                                    <span className="avatar-initial">{initial}</span>
                                  )}
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
                                <button 
                                  className={`action-btn ${user.status === 'ACTIVE' ? 'disable' : 'enable'}`}
                                  onClick={() => handleToggleUserStatus(user.id, user.status || 'ACTIVE')}
                                  disabled={isAdmin}
                                  title={isAdmin ? 'Không thể thay đổi trạng thái admin' : (user.status === 'ACTIVE' ? 'Vô hiệu hóa tài khoản' : 'Kích hoạt tài khoản')}
                                >
                                  <span className="btn-text">
                                    {user.status === 'ACTIVE' ? 'Disable' : 'Active'}
                                  </span>
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
                  onRefresh={handleRefreshUnit}
                />
              ) : selectedCourse ? (
                <UnitManagement 
                  course={selectedCourse}
                  onSelectUnit={setSelectedUnit}
                  onBack={() => setSelectedCourse(null)}
                  onRefresh={handleRefreshCourse}
                />
              ) : (
                <CourseManagement onSelectCourse={setSelectedCourse} />
              )}
            </div>
          )}

          {activeTab === 'flashcard' && (
            <FlashcardManagement />
          )}

          {activeTab === 'skill' && (
            <SkillManagement />
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
