import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaPlus, FaTrash, FaUpload } from 'react-icons/fa';
import '@/styles/admin/skills/WritingEdit.css';
import { uploadService } from '@/services/uploadService';

interface Keyword {
  word: string;
  meaning: string;
}

interface WritingData {
  id?: number;
  title: string;
  skillType: string;
  topic: string;
  level: string;
  thumbnail: string;
  metadata: {
    description: string;
    prompt: string;
    wordCountMin: number;
    wordCountMax: number;
    tips: string[];
    ideaHints: string[];
    keywords: Keyword[];
  };
}

const WritingEdit: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  const [formData, setFormData] = useState<WritingData>({
    title: '',
    skillType: 'WRITING',
    topic: '',
    level: 'Beginner',
    thumbnail: '',
    metadata: {
      description: '',
      prompt: '',
      wordCountMin: 0,
      wordCountMax: 0,
      tips: [''],
      ideaHints: [''],
      keywords: [{ word: '', meaning: '' }]
    }
  });

  useEffect(() => {
    if (id && id !== 'new') {
      fetchWritingData();
    }
  }, [id]);

  const fetchWritingData = async () => {
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
      console.error('Error fetching writing data:', error);
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
      console.error('Error saving writing:', error);
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

  // Tips management
  const addTip = () => {
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        tips: [...formData.metadata.tips, '']
      }
    });
  };

  const updateTip = (index: number, value: string) => {
    const newTips = [...formData.metadata.tips];
    newTips[index] = value;
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        tips: newTips
      }
    });
  };

  const removeTip = (index: number) => {
    const newTips = formData.metadata.tips.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        tips: newTips
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

  // Keywords management
  const addKeyword = () => {
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        keywords: [...formData.metadata.keywords, { word: '', meaning: '' }]
      }
    });
  };

  const updateKeyword = (index: number, field: keyof Keyword, value: string) => {
    const newKeywords = [...formData.metadata.keywords];
    newKeywords[index] = {
      ...newKeywords[index],
      [field]: value
    };
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        keywords: newKeywords
      }
    });
  };

  const removeKeyword = (index: number) => {
    const newKeywords = formData.metadata.keywords.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        keywords: newKeywords
      }
    });
  };

  if (loading && (!id || id === 'new')) {
    return <div className="loading-writing">Đang tải...</div>;
  }

  return (
    <div className="writing-edit-writing">
      <div className="header-writing">
        <button className="back-btn-writing" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Quay lại
        </button>
        <h2>{id && id !== 'new' ? 'Chỉnh sửa' : 'Thêm mới'} bài tập Writing</h2>
      </div>

      <form onSubmit={handleSubmit} className="form-writing">
        {/* Basic Information */}
        <div className="section-writing">
          <h3 className="section-title-writing">Thông tin cơ bản</h3>
          
          <div className="form-grid-writing">
            <div className="form-group-writing full-width-writing">
              <label>Tiêu đề <span className="required-writing">*</span></label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Nhập tiêu đề bài tập"
                required
              />
            </div>

            <div className="form-group-writing">
              <label>Chủ đề <span className="required-writing">*</span></label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="Nhập chủ đề"
                required
              />
            </div>

            <div className="form-group-writing">
              <label>Cấp độ <span className="required-writing">*</span></label>
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

            <div className="form-group-writing">
              <label>Số từ tối thiểu</label>
              <input
                type="number"
                value={formData.metadata.wordCountMin}
                onChange={(e) => setFormData({
                  ...formData,
                  metadata: { ...formData.metadata, wordCountMin: parseInt(e.target.value) || 0 }
                })}
                placeholder="Ví dụ: 60"
                min="0"
              />
            </div>

            <div className="form-group-writing">
              <label>Số từ tối đa</label>
              <input
                type="number"
                value={formData.metadata.wordCountMax}
                onChange={(e) => setFormData({
                  ...formData,
                  metadata: { ...formData.metadata, wordCountMax: parseInt(e.target.value) || 0 }
                })}
                placeholder="Ví dụ: 100"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Thumbnail Upload */}
        <div className="section-writing">
          <h3 className="section-title-writing">Thumbnail</h3>

          <div className="media-upload-writing">
            <div className="upload-area-writing">
              {formData.thumbnail && (
                <img src={formData.thumbnail} alt="Thumbnail" className="preview-img-writing" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailUpload}
                id="thumbnail-upload-writing"
                className="hidden-input-writing"
              />
              <label htmlFor="thumbnail-upload-writing" className="upload-btn-writing">
                <FaUpload /> {uploadingThumbnail ? 'Đang upload...' : 'Upload ảnh'}
              </label>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="section-writing">
          <h3 className="section-title-writing">Mô tả</h3>
          
          <div className="form-group-writing full-width-writing">
            <textarea
              rows={3}
              value={formData.metadata.description}
              onChange={(e) => setFormData({
                ...formData,
                metadata: { ...formData.metadata, description: e.target.value }
              })}
              placeholder="Nhập mô tả ngắn về bài tập..."
            />
          </div>
        </div>

        {/* Prompt */}
        <div className="section-writing">
          <h3 className="section-title-writing">Đề bài <span className="required-writing">*</span></h3>
          
          <div className="form-group-writing full-width-writing">
            <textarea
              rows={5}
              value={formData.metadata.prompt}
              onChange={(e) => setFormData({
                ...formData,
                metadata: { ...formData.metadata, prompt: e.target.value }
              })}
              placeholder="Nhập đề bài yêu cầu học viên viết về chủ đề..."
              required
            />
          </div>
        </div>

        {/* Tips */}
        <div className="section-writing">
          <div className="section-header-writing">
            <h3 className="section-title-writing">Mẹo viết</h3>
            <button
              type="button"
              className="add-btn-writing"
              onClick={addTip}
            >
              <FaPlus /> Thêm mẹo
            </button>
          </div>

          <div className="list-writing">
            {formData.metadata.tips.map((tip, index) => (
              <div key={index} className="list-item-writing">
                <div className="item-header-writing">
                  <span className="item-number-writing">Mẹo {index + 1}</span>
                  <button
                    type="button"
                    className="remove-btn-writing"
                    onClick={() => removeTip(index)}
                  >
                    <FaTrash />
                  </button>
                </div>
                <input
                  type="text"
                  value={tip}
                  onChange={(e) => updateTip(index, e.target.value)}
                  placeholder="Nhập mẹo viết..."
                />
              </div>
            ))}
          </div>
        </div>

        {/* Idea Hints */}
        <div className="section-writing">
          <div className="section-header-writing">
            <h3 className="section-title-writing">Gợi ý ý tưởng</h3>
            <button
              type="button"
              className="add-btn-writing"
              onClick={addIdeaHint}
            >
              <FaPlus /> Thêm gợi ý
            </button>
          </div>

          <div className="list-writing">
            {formData.metadata.ideaHints.map((hint, index) => (
              <div key={index} className="list-item-writing">
                <div className="item-header-writing">
                  <span className="item-number-writing">Gợi ý {index + 1}</span>
                  <button
                    type="button"
                    className="remove-btn-writing"
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

        {/* Keywords */}
        <div className="section-writing">
          <div className="section-header-writing">
            <h3 className="section-title-writing">Từ vựng quan trọng</h3>
            <button
              type="button"
              className="add-btn-writing"
              onClick={addKeyword}
            >
              <FaPlus /> Thêm từ vựng
            </button>
          </div>

          <div className="keywords-list-writing">
            {formData.metadata.keywords.map((keyword, index) => (
              <div key={index} className="keyword-card-writing">
                <div className="keyword-header-writing">
                  <span className="keyword-number-writing">Từ {index + 1}</span>
                  <button
                    type="button"
                    className="remove-btn-writing"
                    onClick={() => removeKeyword(index)}
                  >
                    <FaTrash />
                  </button>
                </div>
                <div className="keyword-fields-writing">
                  <div className="keyword-field-writing">
                    <label>Từ vựng</label>
                    <input
                      type="text"
                      value={keyword.word}
                      onChange={(e) => updateKeyword(index, 'word', e.target.value)}
                      placeholder="Nhập từ vựng..."
                    />
                  </div>
                  <div className="keyword-field-writing">
                    <label>Nghĩa</label>
                    <input
                      type="text"
                      value={keyword.meaning}
                      onChange={(e) => updateKeyword(index, 'meaning', e.target.value)}
                      placeholder="Nhập nghĩa..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="form-actions-writing">
          <button
            type="button"
            className="cancel-btn-writing"
            onClick={() => navigate(-1)}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="save-btn-writing"
            disabled={loading}
          >
            <FaSave /> {loading ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WritingEdit;
