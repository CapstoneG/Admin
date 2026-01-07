import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaPlus, FaTrash, FaUpload, FaPlay, FaPause } from 'react-icons/fa';
import '@/styles/admin/skills/ListeningEdit.css';
import { uploadService } from '@/services/uploadService';

interface Question {
  id?: number;
  type: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface ListeningData {
  id?: number;
  title: string;
  skillType: string;
  topic: string;
  level: string;
  thumbnail: string;
  mediaUrl: string;
  metadata: {
    duration: string;
    description: string;
    transcript: string[];
    questions: Question[];
  };
}

const ListeningEdit: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const [formData, setFormData] = useState<ListeningData>({
    title: '',
    skillType: 'LISTENING',
    topic: '',
    level: 'Beginner',
    thumbnail: '',
    mediaUrl: '',
    metadata: {
      duration: '',
      description: '',
      transcript: [''],
      questions: []
    }
  });

  useEffect(() => {
    if (id && id !== 'new') {
      fetchListeningData();
    }
  }, [id]);

  useEffect(() => {
    if (formData.mediaUrl) {
      const audio = new Audio(formData.mediaUrl);
      setAudioElement(audio);

      audio.addEventListener('ended', () => {
        setIsPlaying(false);
      });

      return () => {
        audio.pause();
        audio.src = '';
      };
    }
  }, [formData.mediaUrl]);

  const fetchListeningData = async () => {
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
      console.error('Error fetching listening data:', error);
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
      console.error('Error saving listening:', error);
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

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAudio(true);
      const result = await uploadService.uploadAudio(file);
      if (result) {
        setFormData({ ...formData, mediaUrl: result.url });
      }
    } catch (error) {
      console.error('Error uploading audio:', error);
      alert('Upload audio thất bại!');
    } finally {
      setUploadingAudio(false);
    }
  };

  const togglePlayAudio = () => {
    if (!audioElement) return;

    if (isPlaying) {
      audioElement.pause();
      setIsPlaying(false);
    } else {
      audioElement.play();
      setIsPlaying(true);
    }
  };

  const addTranscriptParagraph = () => {
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        transcript: [...formData.metadata.transcript, '']
      }
    });
  };

  const updateTranscriptParagraph = (index: number, value: string) => {
    const newTranscript = [...formData.metadata.transcript];
    newTranscript[index] = value;
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        transcript: newTranscript
      }
    });
  };

  const removeTranscriptParagraph = (index: number) => {
    const newTranscript = formData.metadata.transcript.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        transcript: newTranscript
      }
    });
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      type: 'mcq',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
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
    return <div className="loading-listening">Đang tải...</div>;
  }

  return (
    <div className="listening-edit-listening">
      <div className="header-listening">
        <button className="back-btn-listening" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Quay lại
        </button>
        <h2>{id && id !== 'new' ? 'Chỉnh sửa' : 'Thêm mới'} bài tập Listening</h2>
      </div>

      <form onSubmit={handleSubmit} className="form-listening">
        {/* Basic Information */}
        <div className="section-listening">
          <h3 className="section-title-listening">Thông tin cơ bản</h3>
          
          <div className="form-grid-listening">
            <div className="form-group-listening full-width-listening">
              <label>Tiêu đề <span className="required-listening">*</span></label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Nhập tiêu đề bài tập"
                required
              />
            </div>

            <div className="form-group-listening">
              <label>Chủ đề <span className="required-listening">*</span></label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="Nhập chủ đề"
                required
              />
            </div>

            <div className="form-group-listening">
              <label>Cấp độ <span className="required-listening">*</span></label>
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

            <div className="form-group-listening">
              <label>Thời lượng</label>
              <input
                type="text"
                value={formData.metadata.duration}
                onChange={(e) => setFormData({
                  ...formData,
                  metadata: { ...formData.metadata, duration: e.target.value }
                })}
                placeholder="Ví dụ: 3:40"
              />
            </div>

            <div className="form-group-listening full-width-listening">
              <label>Mô tả</label>
              <textarea
                rows={3}
                value={formData.metadata.description}
                onChange={(e) => setFormData({
                  ...formData,
                  metadata: { ...formData.metadata, description: e.target.value }
                })}
                placeholder="Nhập mô tả ngắn về bài tập"
              />
            </div>
          </div>
        </div>

        {/* Media Upload */}
        <div className="section-listening">
          <h3 className="section-title-listening">Media</h3>

          <div className="media-grid-listening">
            <div className="media-upload-listening">
              <label>Thumbnail</label>
              <div className="upload-area-listening">
                {formData.thumbnail && (
                  <img src={formData.thumbnail} alt="Thumbnail" className="preview-img-listening" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  id="thumbnail-upload"
                  className="hidden-input-listening"
                />
                <label htmlFor="thumbnail-upload" className="upload-btn-listening">
                  <FaUpload /> {uploadingThumbnail ? 'Đang upload...' : 'Upload ảnh'}
                </label>
              </div>
            </div>

            <div className="media-upload-listening">
              <label>Audio File <span className="required-listening">*</span></label>
              <div className="upload-area-listening">
                {formData.mediaUrl && (
                  <div className="audio-preview-listening">
                    <button
                      type="button"
                      className="play-btn-listening"
                      onClick={togglePlayAudio}
                    >
                      {isPlaying ? <FaPause /> : <FaPlay />}
                    </button>
                    <span className="audio-url-listening">{formData.mediaUrl.substring(0, 50)}...</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  id="audio-upload"
                  className="hidden-input-listening"
                />
                <label htmlFor="audio-upload" className="upload-btn-listening">
                  <FaUpload /> {uploadingAudio ? 'Đang upload...' : 'Upload audio'}
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Transcript */}
        <div className="section-listening">
          <div className="section-header-listening">
            <h3 className="section-title-listening">Transcript</h3>
            <button
              type="button"
              className="add-btn-listening"
              onClick={addTranscriptParagraph}
            >
              <FaPlus /> Thêm đoạn
            </button>
          </div>

          <div className="transcript-list-listening">
            {formData.metadata.transcript.map((para, index) => (
              <div key={index} className="transcript-item-listening">
                <div className="transcript-header-listening">
                  <span className="transcript-number-listening">Đoạn {index + 1}</span>
                  <button
                    type="button"
                    className="remove-btn-listening"
                    onClick={() => removeTranscriptParagraph(index)}
                  >
                    <FaTrash />
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={para}
                  onChange={(e) => updateTranscriptParagraph(index, e.target.value)}
                  placeholder="Nhập nội dung transcript..."
                />
              </div>
            ))}
          </div>
        </div>

        {/* Questions */}
        <div className="section-listening">
          <div className="section-header-listening">
            <h3 className="section-title-listening">Câu hỏi</h3>
            <button
              type="button"
              className="add-btn-listening"
              onClick={addQuestion}
            >
              <FaPlus /> Thêm câu hỏi
            </button>
          </div>

          <div className="questions-list-listening">
            {formData.metadata.questions.map((question, qIndex) => (
              <div key={qIndex} className="question-card-listening">
                <div className="question-header-listening">
                  <span className="question-number-listening">Câu hỏi {qIndex + 1}</span>
                  <button
                    type="button"
                    className="remove-btn-listening"
                    onClick={() => removeQuestion(qIndex)}
                  >
                    <FaTrash /> Xóa
                  </button>
                </div>

                <div className="question-form-listening">
                  <div className="form-group-listening full-width-listening">
                    <label>Câu hỏi</label>
                    <textarea
                      rows={2}
                      value={question.question}
                      onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                      placeholder="Nhập câu hỏi..."
                    />
                  </div>

                  <div className="options-grid-listening">
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="option-item-listening">
                        <label>
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
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

                  <div className="form-group-listening full-width-listening">
                    <label>Giải thích</label>
                    <textarea
                      rows={2}
                      value={question.explanation}
                      onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                      placeholder="Nhập giải thích cho đáp án đúng..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="form-actions-listening">
          <button
            type="button"
            className="cancel-btn-listening"
            onClick={() => navigate(-1)}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="save-btn-listening"
            disabled={loading}
          >
            <FaSave /> {loading ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ListeningEdit;
