import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaPlus, FaTrash, FaUpload } from 'react-icons/fa';
import '@/styles/admin/skills/SpeakingEdit.css';
import { uploadService } from '@/services/uploadService';

interface SpeakingData {
  id?: number;
  title: string;
  skillType: string;
  topic: string;
  level: string;
  thumbnail: string;
  metadata: {
    estimatedTime: string;
    prompt: string;
    followUpQuestions: string[];
    ideaHints: string[];
    usefulPhrases: string[];
  };
}

const SpeakingEdit: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  const [formData, setFormData] = useState<SpeakingData>({
    title: '',
    skillType: 'SPEAKING',
    topic: '',
    level: 'Beginner',
    thumbnail: '',
    metadata: {
      estimatedTime: '',
      prompt: '',
      followUpQuestions: [''],
      ideaHints: [''],
      usefulPhrases: ['']
    }
  });

  useEffect(() => {
    if (id && id !== 'new') {
      fetchSpeakingData();
    }
  }, [id]);

  const fetchSpeakingData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('enghub_admin_token');
      const response = await fetch(`http://localhost:8080/api/skills/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(data);
      }
    } catch (error) {
      console.error('Error fetching speaking data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('enghub_admin_token');
      const url = id && id !== 'new' 
        ? `http://localhost:8080/api/skills/${id}` 
        : 'http://localhost:8080/api/skills';
      
      const method = id && id !== 'new' ? 'PUT' : 'POST';
      
      // Prepare data: array for POST, single object for PUT
      const requestData = method === 'POST' ? [formData] : formData;
      
      console.log('Request data:', requestData);

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        alert('Lưu thành công!');
        navigate(-1);
      } else {
        alert('Có lỗi xảy ra!');
      }
    } catch (error) {
      console.error('Error saving speaking:', error);
      alert('Có lỗi xảy ra!');
    } finally {
      setLoading(false);
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingThumbnail(true);
      const result = await uploadService.uploadImage(file);
      if (result) {
        setFormData({ ...formData, thumbnail: result.url });
      }
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      alert('Upload ảnh thất bại!');
    } finally {
      setUploadingThumbnail(false);
    }
  };

  // Follow-up Questions management
  const addFollowUpQuestion = () => {
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        followUpQuestions: [...formData.metadata.followUpQuestions, '']
      }
    });
  };

  const updateFollowUpQuestion = (index: number, value: string) => {
    const newQuestions = [...formData.metadata.followUpQuestions];
    newQuestions[index] = value;
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        followUpQuestions: newQuestions
      }
    });
  };

  const removeFollowUpQuestion = (index: number) => {
    const newQuestions = formData.metadata.followUpQuestions.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        followUpQuestions: newQuestions
      }
    });
  };

  // Idea Hints management
  const addIdeaHint = () => {
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        ideaHints: [...formData.metadata.ideaHints, '']
      }
    });
  };

  const updateIdeaHint = (index: number, value: string) => {
    const newHints = [...formData.metadata.ideaHints];
    newHints[index] = value;
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        ideaHints: newHints
      }
    });
  };

  const removeIdeaHint = (index: number) => {
    const newHints = formData.metadata.ideaHints.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        ideaHints: newHints
      }
    });
  };

  // Useful Phrases management
  const addUsefulPhrase = () => {
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        usefulPhrases: [...formData.metadata.usefulPhrases, '']
      }
    });
  };

  const updateUsefulPhrase = (index: number, value: string) => {
    const newPhrases = [...formData.metadata.usefulPhrases];
    newPhrases[index] = value;
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        usefulPhrases: newPhrases
      }
    });
  };

  const removeUsefulPhrase = (index: number) => {
    const newPhrases = formData.metadata.usefulPhrases.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        usefulPhrases: newPhrases
      }
    });
  };

  if (loading && (!id || id === 'new')) {
    return <div className="loading-speaking">Đang tải...</div>;
  }

  return (
    <div className="speaking-edit-speaking">
      <div className="header-speaking">
        <button className="back-btn-speaking" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Quay lại
        </button>
        <h2>{id && id !== 'new' ? 'Chỉnh sửa' : 'Thêm mới'} bài tập Speaking</h2>
      </div>

      <form onSubmit={handleSubmit} className="form-speaking">
        {/* Basic Information */}
        <div className="section-speaking">
          <h3 className="section-title-speaking">Thông tin cơ bản</h3>
          
          <div className="form-grid-speaking">
            <div className="form-group-speaking full-width-speaking">
              <label>Tiêu đề <span className="required-speaking">*</span></label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Nhập tiêu đề bài tập"
                required
              />
            </div>

            <div className="form-group-speaking">
              <label>Chủ đề <span className="required-speaking">*</span></label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="Nhập chủ đề"
                required
              />
            </div>

            <div className="form-group-speaking">
              <label>Cấp độ <span className="required-speaking">*</span></label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                required
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div className="form-group-speaking">
              <label>Thời gian ước tính</label>
              <input
                type="text"
                value={formData.metadata.estimatedTime}
                onChange={(e) => setFormData({
                  ...formData,
                  metadata: { ...formData.metadata, estimatedTime: e.target.value }
                })}
                placeholder="Ví dụ: 1-2 minutes"
              />
            </div>
          </div>
        </div>

        {/* Thumbnail Upload */}
        <div className="section-speaking">
          <h3 className="section-title-speaking">Thumbnail</h3>

          <div className="media-upload-speaking">
            <div className="upload-area-speaking">
              {formData.thumbnail && (
                <img src={formData.thumbnail} alt="Thumbnail" className="preview-img-speaking" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailUpload}
                id="thumbnail-upload-speaking"
                className="hidden-input-speaking"
              />
              <label htmlFor="thumbnail-upload-speaking" className="upload-btn-speaking">
                <FaUpload /> {uploadingThumbnail ? 'Đang upload...' : 'Upload ảnh'}
              </label>
            </div>
          </div>
        </div>

        {/* Prompt */}
        <div className="section-speaking">
          <h3 className="section-title-speaking">Đề bài <span className="required-speaking">*</span></h3>
          
          <div className="form-group-speaking full-width-speaking">
            <textarea
              rows={5}
              value={formData.metadata.prompt}
              onChange={(e) => setFormData({
                ...formData,
                metadata: { ...formData.metadata, prompt: e.target.value }
              })}
              placeholder="Nhập đề bài yêu cầu học viên nói về chủ đề..."
              required
            />
          </div>
        </div>

        {/* Follow-up Questions */}
        <div className="section-speaking">
          <div className="section-header-speaking">
            <h3 className="section-title-speaking">Câu hỏi tiếp theo</h3>
            <button
              type="button"
              className="add-btn-speaking"
              onClick={addFollowUpQuestion}
            >
              <FaPlus /> Thêm câu hỏi
            </button>
          </div>

          <div className="list-speaking">
            {formData.metadata.followUpQuestions.map((question, index) => (
              <div key={index} className="list-item-speaking">
                <div className="item-header-speaking">
                  <span className="item-number-speaking">Câu hỏi {index + 1}</span>
                  <button
                    type="button"
                    className="remove-btn-speaking"
                    onClick={() => removeFollowUpQuestion(index)}
                  >
                    <FaTrash />
                  </button>
                </div>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => updateFollowUpQuestion(index, e.target.value)}
                  placeholder="Nhập câu hỏi tiếp theo..."
                />
              </div>
            ))}
          </div>
        </div>

        {/* Idea Hints */}
        <div className="section-speaking">
          <div className="section-header-speaking">
            <h3 className="section-title-speaking">Gợi ý ý tưởng</h3>
            <button
              type="button"
              className="add-btn-speaking"
              onClick={addIdeaHint}
            >
              <FaPlus /> Thêm gợi ý
            </button>
          </div>

          <div className="list-speaking">
            {formData.metadata.ideaHints.map((hint, index) => (
              <div key={index} className="list-item-speaking">
                <div className="item-header-speaking">
                  <span className="item-number-speaking">Gợi ý {index + 1}</span>
                  <button
                    type="button"
                    className="remove-btn-speaking"
                    onClick={() => removeIdeaHint(index)}
                  >
                    <FaTrash />
                  </button>
                </div>
                <input
                  type="text"
                  value={hint}
                  onChange={(e) => updateIdeaHint(index, e.target.value)}
                  placeholder="Nhập gợi ý ý tưởng..."
                />
              </div>
            ))}
          </div>
        </div>

        {/* Useful Phrases */}
        <div className="section-speaking">
          <div className="section-header-speaking">
            <h3 className="section-title-speaking">Cụm từ hữu ích</h3>
            <button
              type="button"
              className="add-btn-speaking"
              onClick={addUsefulPhrase}
            >
              <FaPlus /> Thêm cụm từ
            </button>
          </div>

          <div className="list-speaking">
            {formData.metadata.usefulPhrases.map((phrase, index) => (
              <div key={index} className="list-item-speaking">
                <div className="item-header-speaking">
                  <span className="item-number-speaking">Cụm từ {index + 1}</span>
                  <button
                    type="button"
                    className="remove-btn-speaking"
                    onClick={() => removeUsefulPhrase(index)}
                  >
                    <FaTrash />
                  </button>
                </div>
                <input
                  type="text"
                  value={phrase}
                  onChange={(e) => updateUsefulPhrase(index, e.target.value)}
                  placeholder="Nhập cụm từ hữu ích..."
                />
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="form-actions-speaking">
          <button
            type="button"
            className="cancel-btn-speaking"
            onClick={() => navigate(-1)}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="save-btn-speaking"
            disabled={loading}
          >
            <FaSave /> {loading ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SpeakingEdit;
