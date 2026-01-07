import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '@/styles/admin/SkillManagement.css';
import { FaHeadphones, FaBook, FaMicrophone, FaPen, FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

type SkillType = 'listening' | 'reading' | 'speaking' | 'writing';

interface Skill {
  id: number;
  title: string;
  level: string;
  mediaUrl: string | null;
  topic: string;
  thumbnail: string;
  skillType: string;
  metadata: any;
}

interface ListeningExercise {
  id: number;
  title: string;
  audioUrl: string;
  transcript: string;
  questions: Question[];
  level: string;
  duration: number;
}

interface ReadingExercise {
  id: number;
  title: string;
  passage: string;
  questions: Question[];
  level: string;
  readingTime: number;
}

interface SpeakingExercise {
  id: number;
  title: string;
  prompt: string;
  sampleAnswer: string;
  level: string;
  timeLimit: number;
  criteria: string[];
}

interface WritingExercise {
  id: number;
  title: string;
  prompt: string;
  wordLimit: number;
  sampleEssay: string;
  level: string;
  criteria: string[];
}

interface Question {
  id: number;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank';
  options?: string[];
  correctAnswer: string;
}

const SkillManagement: React.FC = () => {
  const navigate = useNavigate();
  const [activeSkill, setActiveSkill] = useState<SkillType>('listening');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch skills from API
  useEffect(() => {
    fetchSkills();
  }, [activeSkill]);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('enghub_admin_token');
      const skillTypeMap = {
        listening: 'LISTENING',
        reading: 'READING',
        speaking: 'SPEAKING',
        writing: 'WRITING'
      };
      
      const response = await fetch(
        `http://localhost:8080/api/skills/type/${skillTypeMap[activeSkill]}?size=90`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setSkills(data.content || []);
      } else {
        console.error('Failed to fetch skills');
        setSkills([]);
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
      setSkills([]);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for each skill
  const [listeningExercises, setListeningExercises] = useState<ListeningExercise[]>([]);

  const [readingExercises, setReadingExercises] = useState<ReadingExercise[]>([]);

  const [speakingExercises, setSpeakingExercises] = useState<SpeakingExercise[]>([]);

  const [writingExercises, setWritingExercises] = useState<WritingExercise[]>([]);

  const handleAddNew = () => {
    // Navigate to add new page based on skill type
    navigate(`/admin/skills/${activeSkill}/new`);
  };

  const handleEdit = (id: number) => {
    // Navigate to edit page based on skill type
    navigate(`/admin/skills/${activeSkill}/${id}`);
  };

  const handleDelete = (id: number) => {
    if (confirm('Bạn có chắc muốn xóa bài tập này?')) {
      switch (activeSkill) {
        case 'listening':
          setListeningExercises(listeningExercises.filter(ex => ex.id !== id));
          break;
        case 'reading':
          setReadingExercises(readingExercises.filter(ex => ex.id !== id));
          break;
        case 'speaking':
          setSpeakingExercises(speakingExercises.filter(ex => ex.id !== id));
          break;
        case 'writing':
          setWritingExercises(writingExercises.filter(ex => ex.id !== id));
          break;
      }
    }
  };

  const renderListeningForm = () => (
    <div className="exercise-form">
      <h3>{editingId ? 'Chỉnh sửa' : 'Thêm'} bài tập Listening</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Tiêu đề <span className="required">*</span></label>
          <input type="text" placeholder="Nhập tiêu đề bài tập" />
        </div>
        <div className="form-group">
          <label>Cấp độ <span className="required">*</span></label>
          <select>
            <option value="A1">A1 - Beginner</option>
            <option value="A2">A2 - Elementary</option>
            <option value="B1">B1 - Intermediate</option>
            <option value="B2">B2 - Upper Intermediate</option>
            <option value="C1">C1 - Advanced</option>
            <option value="C2">C2 - Proficiency</option>
          </select>
        </div>
        <div className="form-group">
          <label>Thời lượng (giây) <span className="required">*</span></label>
          <input type="number" placeholder="120" />
        </div>
        <div className="form-group full-width">
          <label>File Audio <span className="required">*</span></label>
          <div className="file-upload">
            <input type="file" accept="audio/*" />
            <span className="file-label">Chọn file audio (MP3, WAV)</span>
          </div>
        </div>
        <div className="form-group full-width">
          <label>Transcript (Nội dung audio)</label>
          <textarea rows={5} placeholder="Nhập nội dung transcript..."></textarea>
        </div>
        <div className="form-group full-width">
          <label>Câu hỏi</label>
          <div className="questions-section">
            <button className="add-question-btn" type="button">
              <FaPlus /> Thêm câu hỏi
            </button>
          </div>
        </div>
      </div>
      <div className="form-actions">
        <button className="btn-cancel" onClick={() => setShowForm(false)}>
          <FaTimes /> Hủy
        </button>
        <button className="btn-save">
          <FaSave /> Lưu
        </button>
      </div>
    </div>
  );

  const renderReadingForm = () => (
    <div className="exercise-form">
      <h3>{editingId ? 'Chỉnh sửa' : 'Thêm'} bài tập Reading</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Tiêu đề <span className="required">*</span></label>
          <input type="text" placeholder="Nhập tiêu đề bài tập" />
        </div>
        <div className="form-group">
          <label>Cấp độ <span className="required">*</span></label>
          <select>
            <option value="A1">A1 - Beginner</option>
            <option value="A2">A2 - Elementary</option>
            <option value="B1">B1 - Intermediate</option>
            <option value="B2">B2 - Upper Intermediate</option>
            <option value="C1">C1 - Advanced</option>
            <option value="C2">C2 - Proficiency</option>
          </select>
        </div>
        <div className="form-group">
          <label>Thời gian đọc (giây) <span className="required">*</span></label>
          <input type="number" placeholder="300" />
        </div>
        <div className="form-group full-width">
          <label>Đoạn văn <span className="required">*</span></label>
          <textarea rows={10} placeholder="Nhập nội dung đoạn văn..."></textarea>
        </div>
        <div className="form-group full-width">
          <label>Câu hỏi</label>
          <div className="questions-section">
            <button className="add-question-btn" type="button">
              <FaPlus /> Thêm câu hỏi
            </button>
          </div>
        </div>
      </div>
      <div className="form-actions">
        <button className="btn-cancel" onClick={() => setShowForm(false)}>
          <FaTimes /> Hủy
        </button>
        <button className="btn-save">
          <FaSave /> Lưu
        </button>
      </div>
    </div>
  );

  const renderSpeakingForm = () => (
    <div className="exercise-form">
      <h3>{editingId ? 'Chỉnh sửa' : 'Thêm'} bài tập Speaking</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Tiêu đề <span className="required">*</span></label>
          <input type="text" placeholder="Nhập tiêu đề bài tập" />
        </div>
        <div className="form-group">
          <label>Cấp độ <span className="required">*</span></label>
          <select>
            <option value="A1">A1 - Beginner</option>
            <option value="A2">A2 - Elementary</option>
            <option value="B1">B1 - Intermediate</option>
            <option value="B2">B2 - Upper Intermediate</option>
            <option value="C1">C1 - Advanced</option>
            <option value="C2">C2 - Proficiency</option>
          </select>
        </div>
        <div className="form-group">
          <label>Thời gian (giây) <span className="required">*</span></label>
          <input type="number" placeholder="120" />
        </div>
        <div className="form-group full-width">
          <label>Đề bài <span className="required">*</span></label>
          <textarea rows={4} placeholder="Nhập đề bài yêu cầu..."></textarea>
        </div>
        <div className="form-group full-width">
          <label>Câu trả lời mẫu</label>
          <textarea rows={6} placeholder="Nhập câu trả lời mẫu..."></textarea>
        </div>
        <div className="form-group full-width">
          <label>Tiêu chí đánh giá</label>
          <div className="criteria-section">
            <input type="text" placeholder="Nhập tiêu chí (ví dụ: Fluency)" />
            <button className="add-criteria-btn" type="button">
              <FaPlus /> Thêm
            </button>
          </div>
          <div className="criteria-list">
            <span className="criteria-tag">Fluency <FaTimes /></span>
            <span className="criteria-tag">Pronunciation <FaTimes /></span>
            <span className="criteria-tag">Grammar <FaTimes /></span>
          </div>
        </div>
      </div>
      <div className="form-actions">
        <button className="btn-cancel" onClick={() => setShowForm(false)}>
          <FaTimes /> Hủy
        </button>
        <button className="btn-save">
          <FaSave /> Lưu
        </button>
      </div>
    </div>
  );

  const renderWritingForm = () => (
    <div className="exercise-form">
      <h3>{editingId ? 'Chỉnh sửa' : 'Thêm'} bài tập Writing</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Tiêu đề <span className="required">*</span></label>
          <input type="text" placeholder="Nhập tiêu đề bài tập" />
        </div>
        <div className="form-group">
          <label>Cấp độ <span className="required">*</span></label>
          <select>
            <option value="A1">A1 - Beginner</option>
            <option value="A2">A2 - Elementary</option>
            <option value="B1">B1 - Intermediate</option>
            <option value="B2">B2 - Upper Intermediate</option>
            <option value="C1">C1 - Advanced</option>
            <option value="C2">C2 - Proficiency</option>
          </select>
        </div>
        <div className="form-group">
          <label>Giới hạn từ <span className="required">*</span></label>
          <input type="number" placeholder="250" />
        </div>
        <div className="form-group full-width">
          <label>Đề bài <span className="required">*</span></label>
          <textarea rows={4} placeholder="Nhập đề bài yêu cầu..."></textarea>
        </div>
        <div className="form-group full-width">
          <label>Bài viết mẫu</label>
          <textarea rows={8} placeholder="Nhập bài viết mẫu..."></textarea>
        </div>
        <div className="form-group full-width">
          <label>Tiêu chí đánh giá</label>
          <div className="criteria-section">
            <input type="text" placeholder="Nhập tiêu chí (ví dụ: Grammar)" />
            <button className="add-criteria-btn" type="button">
              <FaPlus /> Thêm
            </button>
          </div>
          <div className="criteria-list">
            <span className="criteria-tag">Grammar <FaTimes /></span>
            <span className="criteria-tag">Vocabulary <FaTimes /></span>
            <span className="criteria-tag">Coherence <FaTimes /></span>
          </div>
        </div>
      </div>
      <div className="form-actions">
        <button className="btn-cancel" onClick={() => setShowForm(false)}>
          <FaTimes /> Hủy
        </button>
        <button className="btn-save">
          <FaSave /> Lưu
        </button>
      </div>
    </div>
  );

  const renderForm = () => {
    switch (activeSkill) {
      case 'listening':
        return renderListeningForm();
      case 'reading':
        return renderReadingForm();
      case 'speaking':
        return renderSpeakingForm();
      case 'writing':
        return renderWritingForm();
      default:
        return null;
    }
  };

  const renderExerciseList = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <p>Đang tải dữ liệu...</p>
        </div>
      );
    }

    if (skills.length === 0) {
      return (
        <div className="empty-container">
          <p>Chưa có bài tập nào</p>
        </div>
      );
    }

    return (
      <div className="exercises-list">
        {skills.map((skill) => (
          <div key={skill.id} className="exercise-card">
            {skill.thumbnail && (
              <div className="exercise-thumbnail">
                <img src={skill.thumbnail} alt={skill.title} />
              </div>
            )}
            <div className="exercise-content">
              <h4 className="exercise-title">{skill.title}</h4>
              <div className="exercise-meta">
                <span className={`level-badge ${skill.level.toLowerCase()}`}>
                  {skill.level}
                </span>
                <span className="topic-tag">
                  {skill.topic}
                </span>
              </div>
            </div>
            <div className="exercise-actions">
              <button className="btn-edit" onClick={() => handleEdit(skill.id)}>
                <FaEdit /> Sửa
              </button>
              <button className="btn-delete" onClick={() => handleDelete(skill.id)}>
                <FaTrash /> Xóa
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="skill-management">
      <div className="skill-header">
        <h2>Quản lý Skill</h2>
        <p className="skill-description">Quản lý các bài tập kỹ năng Listening, Reading, Speaking, Writing</p>
      </div>

      <div className="skill-tabs">
        <button
          className={`skill-tab ${activeSkill === 'listening' ? 'active' : ''}`}
          onClick={() => {
            setActiveSkill('listening');
            setShowForm(false);
          }}
        >
          <FaHeadphones /> Listening
        </button>
        <button
          className={`skill-tab ${activeSkill === 'reading' ? 'active' : ''}`}
          onClick={() => {
            setActiveSkill('reading');
            setShowForm(false);
          }}
        >
          <FaBook /> Reading
        </button>
        <button
          className={`skill-tab ${activeSkill === 'speaking' ? 'active' : ''}`}
          onClick={() => {
            setActiveSkill('speaking');
            setShowForm(false);
          }}
        >
          <FaMicrophone /> Speaking
        </button>
        <button
          className={`skill-tab ${activeSkill === 'writing' ? 'active' : ''}`}
          onClick={() => {
            setActiveSkill('writing');
            setShowForm(false);
          }}
        >
          <FaPen /> Writing
        </button>
      </div>

      <div className="skill-content">
        {!showForm && (
          <div className="content-header">
            <h3>
              Danh sách bài tập{' '}
              {activeSkill === 'listening' && 'Listening'}
              {activeSkill === 'reading' && 'Reading'}
              {activeSkill === 'speaking' && 'Speaking'}
              {activeSkill === 'writing' && 'Writing'}
            </h3>
            <button className="btn-add" onClick={handleAddNew}>
              <FaPlus /> Thêm bài tập mới
            </button>
          </div>
        )}

        {showForm ? renderForm() : renderExerciseList()}
      </div>
    </div>
  );
};

export default SkillManagement;
