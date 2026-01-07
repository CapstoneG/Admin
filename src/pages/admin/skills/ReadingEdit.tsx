import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaPlus, FaTrash, FaUpload } from 'react-icons/fa';
import '@/styles/admin/skills/ReadingEdit.css';
import { uploadService } from '@/services/uploadService';

interface Vocabulary {
  word: string;
  partOfSpeech: string;
  meaning: string;
  example: string;
}

interface Question {
  id?: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface ReadingData {
  id?: number;
  title: string;
  skillType: string;
  topic: string;
  level: string;
  thumbnail: string;
  metadata: {
    estimatedTime: string;
    content: string[];
    vocabulary: Vocabulary[];
    questions: Question[];
  };
}

const ReadingEdit: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  const [formData, setFormData] = useState<ReadingData>({
    title: '',
    skillType: 'READING',
    topic: '',
    level: 'Beginner',
    thumbnail: '',
    metadata: {
      estimatedTime: '',
      content: [''],
      vocabulary: [],
      questions: []
    }
  });

  useEffect(() => {
    if (id && id !== 'new') {
      fetchReadingData();
    }
  }, [id]);

  const fetchReadingData = async () => {
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
      console.error('Error fetching reading data:', error);
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
      console.error('Error saving reading:', error);
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

  // Content management
  const addContentParagraph = () => {
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        content: [...formData.metadata.content, '']
      }
    });
  };

  const updateContentParagraph = (index: number, value: string) => {
    const newContent = [...formData.metadata.content];
    newContent[index] = value;
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        content: newContent
      }
    });
  };

  const removeContentParagraph = (index: number) => {
    const newContent = formData.metadata.content.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        content: newContent
      }
    });
  };

  // Vocabulary management
  const addVocabulary = () => {
    const newVocab: Vocabulary = {
      word: '',
      partOfSpeech: 'noun',
      meaning: '',
      example: ''
    };
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        vocabulary: [...formData.metadata.vocabulary, newVocab]
      }
    });
  };

  const updateVocabulary = (index: number, field: keyof Vocabulary, value: string) => {
    const newVocabulary = [...formData.metadata.vocabulary];
    newVocabulary[index] = { ...newVocabulary[index], [field]: value };
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        vocabulary: newVocabulary
      }
    });
  };

  const removeVocabulary = (index: number) => {
    const newVocabulary = formData.metadata.vocabulary.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        vocabulary: newVocabulary
      }
    });
  };

  // Question management
  const addQuestion = () => {
    const newQuestion: Question = {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    };
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        questions: [...formData.metadata.questions, newQuestion]
      }
    });
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...formData.metadata.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        questions: newQuestions
      }
    });
  };

  const updateQuestionOption = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...formData.metadata.questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        questions: newQuestions
      }
    });
  };

  const removeQuestion = (index: number) => {
    const newQuestions = formData.metadata.questions.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        questions: newQuestions
      }
    });
  };

  if (loading && (!id || id === 'new')) {
    return <div className="loading-reading">Đang tải...</div>;
  }

  return (
    <div className="reading-edit-reading">
      <div className="header-reading">
        <button className="back-btn-reading" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Quay lại
        </button>
        <h2>{id && id !== 'new' ? 'Chỉnh sửa' : 'Thêm mới'} bài tập Reading</h2>
      </div>

      <form onSubmit={handleSubmit} className="form-reading">
        {/* Basic Information */}
        <div className="section-reading">
          <h3 className="section-title-reading">Thông tin cơ bản</h3>
          
          <div className="form-grid-reading">
            <div className="form-group-reading full-width-reading">
              <label>Tiêu đề <span className="required-reading">*</span></label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Nhập tiêu đề bài tập"
                required
              />
            </div>

            <div className="form-group-reading">
              <label>Chủ đề <span className="required-reading">*</span></label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="Nhập chủ đề"
                required
              />
            </div>

            <div className="form-group-reading">
              <label>Cấp độ <span className="required-reading">*</span></label>
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

            <div className="form-group-reading">
              <label>Thời gian ước tính</label>
              <input
                type="text"
                value={formData.metadata.estimatedTime}
                onChange={(e) => setFormData({
                  ...formData,
                  metadata: { ...formData.metadata, estimatedTime: e.target.value }
                })}
                placeholder="Ví dụ: 10-15 minutes"
              />
            </div>
          </div>
        </div>

        {/* Thumbnail Upload */}
        <div className="section-reading">
          <h3 className="section-title-reading">Thumbnail</h3>

          <div className="media-upload-reading">
            <div className="upload-area-reading">
              {formData.thumbnail && (
                <img src={formData.thumbnail} alt="Thumbnail" className="preview-img-reading" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailUpload}
                id="thumbnail-upload-reading"
                className="hidden-input-reading"
              />
              <label htmlFor="thumbnail-upload-reading" className="upload-btn-reading">
                <FaUpload /> {uploadingThumbnail ? 'Đang upload...' : 'Upload ảnh'}
              </label>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="section-reading">
          <div className="section-header-reading">
            <h3 className="section-title-reading">Nội dung bài đọc</h3>
            <button
              type="button"
              className="add-btn-reading"
              onClick={addContentParagraph}
            >
              <FaPlus /> Thêm đoạn
            </button>
          </div>

          <div className="content-list-reading">
            {formData.metadata.content.map((paragraph, index) => (
              <div key={index} className="content-item-reading">
                <div className="content-header-reading">
                  <span className="content-number-reading">Đoạn {index + 1}</span>
                  <button
                    type="button"
                    className="remove-btn-reading"
                    onClick={() => removeContentParagraph(index)}
                  >
                    <FaTrash />
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={paragraph}
                  onChange={(e) => updateContentParagraph(index, e.target.value)}
                  placeholder="Nhập nội dung đoạn văn..."
                />
              </div>
            ))}
          </div>
        </div>

        {/* Vocabulary */}
        <div className="section-reading">
          <div className="section-header-reading">
            <h3 className="section-title-reading">Từ vựng</h3>
            <button
              type="button"
              className="add-btn-reading"
              onClick={addVocabulary}
            >
              <FaPlus /> Thêm từ vựng
            </button>
          </div>

          <div className="vocabulary-list-reading">
            {formData.metadata.vocabulary.map((vocab, index) => (
              <div key={index} className="vocabulary-card-reading">
                <div className="vocabulary-header-reading">
                  <span className="vocabulary-number-reading">Từ {index + 1}</span>
                  <button
                    type="button"
                    className="remove-btn-reading"
                    onClick={() => removeVocabulary(index)}
                  >
                    <FaTrash /> Xóa
                  </button>
                </div>

                <div className="vocabulary-form-reading">
                  <div className="form-row-reading">
                    <div className="form-group-reading">
                      <label>Từ vựng</label>
                      <input
                        type="text"
                        value={vocab.word}
                        onChange={(e) => updateVocabulary(index, 'word', e.target.value)}
                        placeholder="Nhập từ vựng"
                      />
                    </div>
                    <div className="form-group-reading">
                      <label>Loại từ</label>
                      <select
                        value={vocab.partOfSpeech}
                        onChange={(e) => updateVocabulary(index, 'partOfSpeech', e.target.value)}
                      >
                        <option value="noun">Noun (Danh từ)</option>
                        <option value="verb">Verb (Động từ)</option>
                        <option value="adjective">Adjective (Tính từ)</option>
                        <option value="adverb">Adverb (Trạng từ)</option>
                        <option value="preposition">Preposition (Giới từ)</option>
                        <option value="conjunction">Conjunction (Liên từ)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group-reading full-width-reading">
                    <label>Nghĩa</label>
                    <input
                      type="text"
                      value={vocab.meaning}
                      onChange={(e) => updateVocabulary(index, 'meaning', e.target.value)}
                      placeholder="Nhập nghĩa tiếng Việt"
                    />
                  </div>

                  <div className="form-group-reading full-width-reading">
                    <label>Ví dụ</label>
                    <textarea
                      rows={2}
                      value={vocab.example}
                      onChange={(e) => updateVocabulary(index, 'example', e.target.value)}
                      placeholder="Nhập câu ví dụ..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Questions */}
        <div className="section-reading">
          <div className="section-header-reading">
            <h3 className="section-title-reading">Câu hỏi</h3>
            <button
              type="button"
              className="add-btn-reading"
              onClick={addQuestion}
            >
              <FaPlus /> Thêm câu hỏi
            </button>
          </div>

          <div className="questions-list-reading">
            {formData.metadata.questions.map((question, qIndex) => (
              <div key={qIndex} className="question-card-reading">
                <div className="question-header-reading">
                  <span className="question-number-reading">Câu hỏi {qIndex + 1}</span>
                  <button
                    type="button"
                    className="remove-btn-reading"
                    onClick={() => removeQuestion(qIndex)}
                  >
                    <FaTrash /> Xóa
                  </button>
                </div>

                <div className="question-form-reading">
                  <div className="form-group-reading full-width-reading">
                    <label>Câu hỏi</label>
                    <textarea
                      rows={2}
                      value={question.question}
                      onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                      placeholder="Nhập câu hỏi..."
                    />
                  </div>

                  <div className="options-grid-reading">
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="option-item-reading">
                        <label>
                          <input
                            type="radio"
                            name={`correct-reading-${qIndex}`}
                            checked={question.correctAnswer === oIndex}
                            onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                          />
                          Đáp án {oIndex + 1}
                        </label>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateQuestionOption(qIndex, oIndex, e.target.value)}
                          placeholder={`Nhập đáp án ${oIndex + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="form-actions-reading">
          <button
            type="button"
            className="cancel-btn-reading"
            onClick={() => navigate(-1)}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="save-btn-reading"
            disabled={loading}
          >
            <FaSave /> {loading ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReadingEdit;
