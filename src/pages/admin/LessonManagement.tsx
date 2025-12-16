import React, { useState } from 'react';
import type { Unit, Lesson, LessonType } from '@/types/admin';
import { uploadService } from '@/services';
import { FaPlus, FaEdit, FaTrash, FaArrowLeft, FaVideo, FaBook, FaComments, FaPencilAlt, FaLanguage, FaFileAlt, FaListOl, FaSpellCheck } from 'react-icons/fa';
import '@/styles/admin/LessonManagement.css';

interface LessonManagementProps {
  unit: Unit;
  onBack: () => void;
}

type ExerciseType = 'TRANSLATE' | 'MULTIPLE_CHOICE' | 'FILL_BLANK' | 'LISTENING' | 'SPEAKING' | 'MATCH_PAIRS' | 'BUILD_SENTENCE' | 'SELECT_IMAGE' | 'TAP_WORD';

interface ContentSection {
  hasVideo: boolean;
  hasVocabularies: boolean;
  hasDialogues: boolean;
  hasGrammar: boolean;
  hasExercises: boolean;
}

const LessonManagement: React.FC<LessonManagementProps> = ({ unit, onBack }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    orderIndex: 0,
    duration: 10,
    type: 'video' as LessonType,
    content: ''
  });

  const [contentSections, setContentSections] = useState<ContentSection>({
    hasVideo: false,
    hasVocabularies: false,
    hasDialogues: false,
    hasGrammar: false,
    hasExercises: false
  });

  const [videoData, setVideoData] = useState({ url: '', description: '', duration: 0 });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPublicId, setVideoPublicId] = useState<string | null>(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const [vocabularies, setVocabularies] = useState<Array<{word: string, meaning: string, example: string, imageUrl: string}>>([]);
  const [vocabImageFiles, setVocabImageFiles] = useState<{[key: number]: File | null}>({});
  const [vocabImagePublicIds, setVocabImagePublicIds] = useState<{[key: number]: string}>({});
  const [vocabImageUploading, setVocabImageUploading] = useState<{[key: number]: boolean}>({});
  const [dialogues, setDialogues] = useState<Array<{speaker: string, text: string}>>([]);
  const [grammarData, setGrammarData] = useState({
    topic: '',
    explanation: '',
    formulas: [] as Array<{
      type: string,
      formula: string,
      description: string,
      verbType: string,
      examples: Array<{sentence: string, translation: string}>
    }>
  });
  const [exercises, setExercises] = useState<Array<{
    question: string,
    type: ExerciseType,
    metadata: Array<{content: string, isCorrect: boolean}>
  }>>([]);

  const uploadVideo = async (file: File) => {
    setVideoUploading(true);
    try {
      const result = await uploadService.uploadVideo(file);
      if (result) {
        setVideoData({ ...videoData, url: result.url });
        setVideoPublicId(result.publicId);
        return result;
      }
    } catch (error: any) {
      alert('Upload video failed: ' + (error.message || 'Unknown error'));
    } finally {
      setVideoUploading(false);
    }
  };

  const deleteVideo = async (publicId: string) => {
    try {
      await uploadService.deleteVideo(publicId);
      setVideoFile(null);
      setVideoPublicId(null);
      setVideoData({ ...videoData, url: '' });
      const input = document.getElementById('video-upload') as HTMLInputElement;
      if (input) input.value = '';
    } catch (error: any) {
      alert('Delete video failed: ' + (error.message || 'Unknown error'));
    }
  };

  const uploadVocabImage = async (file: File, index: number) => {
    setVocabImageUploading({...vocabImageUploading, [index]: true});
    try {
      const result = await uploadService.uploadImage(file);
      if (result) {
        const newVocabs = [...vocabularies];
        newVocabs[index].imageUrl = result.url;
        setVocabularies(newVocabs);
        setVocabImagePublicIds({...vocabImagePublicIds, [index]: result.publicId});
        return result;
      }
    } catch (error: any) {
      alert('Upload image failed: ' + (error.message || 'Unknown error'));
    } finally {
      const newUploading = {...vocabImageUploading};
      delete newUploading[index];
      setVocabImageUploading(newUploading);
    }
  };

  const deleteVocabImage = async (publicId: string, index: number) => {
    try {
      await uploadService.deleteImage(publicId);
      const newFiles = {...vocabImageFiles};
      delete newFiles[index];
      setVocabImageFiles(newFiles);
      
      const newPublicIds = {...vocabImagePublicIds};
      delete newPublicIds[index];
      setVocabImagePublicIds(newPublicIds);
      
      const newVocabs = [...vocabularies];
      newVocabs[index].imageUrl = '';
      setVocabularies(newVocabs);
      
      const input = document.getElementById(`vocab-image-${index}`) as HTMLInputElement;
      if (input) input.value = '';
    } catch (error: any) {
      alert('Delete image failed: ' + (error.message || 'Unknown error'));
    }
  };

  const getLessonIcon = (type: LessonType | null) => {
    if (!type) return <FaBook />;
    switch (type) {
      case 'video': return <FaVideo />;
      case 'grammar': return <FaBook />;
      case 'dialogue': return <FaComments />;
      case 'exercise': return <FaPencilAlt />;
      case 'vocabulary': return <FaLanguage />;
      case 'reading': return <FaFileAlt />;
      default: return <FaBook />;
    }
  };

  const getLessonTypeColor = (type: LessonType | null) => {
    if (!type) return 'type-grammar';
    const colors: Record<LessonType, string> = {
      video: 'type-video',
      grammar: 'type-grammar',
      dialogue: 'type-dialogue',
      exercise: 'type-exercise',
      vocabulary: 'type-vocabulary',
      reading: 'type-reading'
    };
    return colors[type] || 'type-grammar';
  };

  const handleOpenModal = (lesson?: Lesson) => {
    if (lesson) {
      console.log('[LessonManagement] Opening edit modal for lesson:', lesson);
      console.log('[LessonManagement] Lesson content:', lesson.content);
      console.log('[LessonManagement] Content type:', typeof lesson.content);
      
      setEditingLesson(lesson);
      setFormData({
        title: lesson.title,
        orderIndex: lesson.orderIndex,
        duration: lesson.duration,
        type: lesson.type || 'video',
        content: lesson.content ? JSON.stringify(lesson.content, null, 2) : ''
      });

      // Reset all sections first
      const newSections = {
        hasVideo: false,
        hasVocabularies: false,
        hasDialogues: false,
        hasGrammar: false,
        hasExercises: false
      };
      setVideoData({ url: '', description: '', duration: 0 });
      setVocabularies([]);
      setDialogues([]);
      setGrammarData({ topic: '', explanation: '', formulas: [] });
      setExercises([]);

      // Parse and populate content sections
      // First try to get data from lesson properties directly (API response format)
      const lessonData: any = lesson;
      
      // Check and populate video data
      if (lessonData.video) {
        console.log('[LessonManagement] Found video data:', lessonData.video);
        newSections.hasVideo = true;
        setVideoData({
          url: lessonData.video.url || '',
          description: lessonData.video.description || '',
          duration: lessonData.video.duration || 0
        });
      }

      // Check and populate vocabularies
      if (lessonData.vocabularies && Array.isArray(lessonData.vocabularies) && lessonData.vocabularies.length > 0) {
        console.log('[LessonManagement] Found vocabularies:', lessonData.vocabularies);
        newSections.hasVocabularies = true;
        setVocabularies(lessonData.vocabularies.map((v: any) => ({
          word: v.word || '',
          meaning: v.meaning || '',
          example: v.example || '',
          imageUrl: v.imageUrl || ''
        })));
      }

      // Check and populate dialogues
      if (lessonData.dialogues && Array.isArray(lessonData.dialogues) && lessonData.dialogues.length > 0) {
        console.log('[LessonManagement] Found dialogues:', lessonData.dialogues);
        newSections.hasDialogues = true;
        setDialogues(lessonData.dialogues.map((d: any) => ({
          speaker: d.speaker || '',
          text: d.text || ''
        })));
      }

      // Check and populate grammar
      if (lessonData.grammar) {
        console.log('[LessonManagement] Found grammar:', lessonData.grammar);
        newSections.hasGrammar = true;
        setGrammarData({
          topic: lessonData.grammar.topic || '',
          explanation: lessonData.grammar.explanation || '',
          formulas: (lessonData.grammar.formulas || []).map((f: any) => ({
            type: f.type || '',
            formula: f.formula || '',
            description: f.description || '',
            verbType: f.verbType || 'REGULAR_VERB',
            examples: (f.examples || []).map((e: any) => ({
              sentence: e.sentence || '',
              translation: e.translation || ''
            }))
          }))
        });
      }

      // Check and populate exercises
      if (lessonData.exercises && Array.isArray(lessonData.exercises) && lessonData.exercises.length > 0) {
        console.log('[LessonManagement] Found exercises:', lessonData.exercises);
        newSections.hasExercises = true;
        setExercises(lessonData.exercises.map((ex: any) => ({
          question: ex.question || '',
          type: ex.type || 'MULTIPLE_CHOICE',
          metadata: (ex.metadata || []).map((m: any) => ({
            content: m.content || '',
            isCorrect: m.isCorrect || false
          }))
        })));
      }

      // If no data found in direct properties, try parsing from content field
      if (!newSections.hasVideo && !newSections.hasVocabularies && !newSections.hasDialogues && 
          !newSections.hasGrammar && !newSections.hasExercises && lesson.content) {
        try {
          const content = typeof lesson.content === 'string' 
            ? JSON.parse(lesson.content) 
            : lesson.content;

          console.log('[LessonManagement] Parsed content from content field:', content);

          if (content.video) {
            newSections.hasVideo = true;
            setVideoData({
              url: content.video.url || '',
              description: content.video.description || '',
              duration: content.video.duration || 0
            });
          }

          if (content.vocabularies && Array.isArray(content.vocabularies) && content.vocabularies.length > 0) {
            newSections.hasVocabularies = true;
            setVocabularies(content.vocabularies.map((v: any) => ({
              word: v.word || '',
              meaning: v.meaning || '',
              example: v.example || '',
              imageUrl: v.imageUrl || ''
            })));
          }

          if (content.dialogues && Array.isArray(content.dialogues) && content.dialogues.length > 0) {
            newSections.hasDialogues = true;
            setDialogues(content.dialogues.map((d: any) => ({
              speaker: d.speaker || '',
              text: d.text || ''
            })));
          }

          if (content.grammar) {
            newSections.hasGrammar = true;
            setGrammarData({
              topic: content.grammar.topic || '',
              explanation: content.grammar.explanation || '',
              formulas: content.grammar.formulas || []
            });
          }

          if (content.exercises && Array.isArray(content.exercises) && content.exercises.length > 0) {
            newSections.hasExercises = true;
            setExercises(content.exercises.map((ex: any) => ({
              question: ex.question || '',
              type: ex.type || 'MULTIPLE_CHOICE',
              metadata: ex.metadata || []
            })));
          }
        } catch (error) {
          console.error('[LessonManagement] Error parsing lesson content:', error);
        }
      }

      setContentSections(newSections);
      console.log('[LessonManagement] Final content sections:', newSections);
    } else {
      setEditingLesson(null);
      setFormData({
        title: '',
        orderIndex: unit.lessons.length,
        duration: 10,
        type: 'video',
        content: ''
      });
      // Reset content sections
      setContentSections({
        hasVideo: false,
        hasVocabularies: false,
        hasDialogues: false,
        hasGrammar: false,
        hasExercises: false
      });
      setVideoData({ url: '', description: '', duration: 0 });
      setVocabularies([]);
      setDialogues([]);
      setGrammarData({ topic: '', explanation: '', formulas: [] });
      setExercises([]);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLesson(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const lessonData: any = {
      title: formData.title,
      orderIndex: formData.orderIndex,
      duration: formData.duration,
      unitId: unit.id
    };

    // Add optional content
    if (contentSections.hasVideo && videoData.url) {
      lessonData.video = videoData;
    }
    
    if (contentSections.hasVocabularies && vocabularies.length > 0) {
      lessonData.vocabularies = vocabularies;
    }
    
    if (contentSections.hasDialogues && dialogues.length > 0) {
      lessonData.dialogues = dialogues;
    }
    
    if (contentSections.hasGrammar && grammarData.topic) {
      lessonData.grammar = grammarData;
    }
    
    if (contentSections.hasExercises && exercises.length > 0) {
      lessonData.exercises = exercises;
    }

    try {
      const token = localStorage.getItem('enghub_admin_token');
      const url = editingLesson
        ? `http://localhost:8080/api/v1/lessons/${editingLesson.id}`
        : `http://localhost:8080/api/v1/lessons`;
      
      const method = editingLesson ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(lessonData)
      });

      if (response.ok) {
        window.location.reload();
      } else {
        const error = await response.text();
        alert(`Có lỗi xảy ra: ${error}`);
      }
    } catch (error) {
      console.error('Error saving lesson:', error);
      alert('Có lỗi xảy ra khi lưu lesson');
    }
  };

  const handleDelete = async (lessonId: number) => {
    if (!confirm('Bạn có chắc muốn xóa lesson này?')) return;

    try {
      const token = localStorage.getItem('enghub_admin_token');
      await fetch(`http://localhost:8080/api/v1/lessons/${lessonId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      window.location.reload();
    } catch (error) {
      console.error('Error deleting lesson:', error);
      alert('Có lỗi xảy ra khi xóa lesson');
    }
  };

  const sortedLessons = [...unit.lessons].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="lesson-management">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>
          <FaArrowLeft /> Quay lại
        </button>
      </div>

      <div className="unit-banner">
        <div className="unit-info">
          <h1 className="unit-title">{unit.title}</h1>
          <p className="unit-desc">{unit.description}</p>
        </div>
        <button className="add-btn" onClick={() => handleOpenModal()}>
          <FaPlus /> Thêm Lesson
        </button>
      </div>

      <div className="lessons-list">
        {sortedLessons.length === 0 ? (
          <div className="empty-state">
            <p>Chưa có lesson nào. Hãy tạo lesson đầu tiên!</p>
          </div>
        ) : (
          sortedLessons.map(lesson => (
            <div key={lesson.id} className="lesson-card">
              <div className="lesson-left">
                <div className={`lesson-icon ${getLessonTypeColor(lesson.type)}`}>
                  {getLessonIcon(lesson.type)}
                </div>
                <div className="lesson-info">
                  <h3 className="lesson-title">{lesson.title}</h3>
                  <div className="lesson-meta">
                    <span>Thứ tự: {lesson.orderIndex}</span>
                    <span>• {lesson.duration} phút</span>
                  </div>
                </div>
              </div>

              <div className="lesson-actions">
                <button 
                  className="action-btn edit"
                  onClick={() => handleOpenModal(lesson)}
                >
                  <FaEdit />
                </button>
                <button 
                  className="action-btn delete"
                  onClick={() => handleDelete(lesson.id)}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content lesson-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingLesson ? 'Chỉnh sửa Lesson' : 'Tạo Lesson mới'}</h2>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="lesson-form">
              <div className="form-section">
                <h3>Thông tin cơ bản</h3>
                
                <div className="form-group">
                  <label>Tiêu đề</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ví dụ: Lesson 1 - Introduction"
                    required
                  />
                </div>

                <div className="form-row">
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

                  <div className="form-group">
                    <label>Thời lượng (phút)</label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                      min="1"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Content Type Selection */}
              <div className="form-section">
                <h3>Chọn nội dung cần thêm</h3>
                <div className="content-checkboxes">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={contentSections.hasVideo}
                      onChange={(e) => setContentSections({...contentSections, hasVideo: e.target.checked})}
                    />
                    <span>Video</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={contentSections.hasVocabularies}
                      onChange={(e) => setContentSections({...contentSections, hasVocabularies: e.target.checked})}
                    />
                    <span>Vocabularies</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={contentSections.hasDialogues}
                      onChange={(e) => setContentSections({...contentSections, hasDialogues: e.target.checked})}
                    />
                    <span>Dialogues</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={contentSections.hasGrammar}
                      onChange={(e) => setContentSections({...contentSections, hasGrammar: e.target.checked})}
                    />
                    <span>Grammar</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={contentSections.hasExercises}
                      onChange={(e) => setContentSections({...contentSections, hasExercises: e.target.checked})}
                    />
                    <span>Exercises</span>
                  </label>
                </div>
              </div>

              {/* Video Section */}
              {contentSections.hasVideo && (
                <div className="form-section">
                  <h3><FaVideo /> Video</h3>
                  
                  {/* File Upload */}
                  <div className="form-group">
                    <label>Upload Video</label>
                    <div className="custom-file-upload">
                      <input
                        type="file"
                        id="video-upload"
                        accept="video/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setVideoFile(file);
                            await uploadVideo(file);
                          }
                        }}
                        style={{ display: 'none' }}
                        disabled={videoUploading}
                      />
                      {videoUploading ? (
                        <div className="file-upload-area">
                          <div className="upload-icon-wrapper">
                            <div className="spinner-admin"></div>
                          </div>
                          <h4 className="upload-title">Uploading video...</h4>
                          <p className="upload-subtitle">Please wait</p>
                        </div>
                      ) : !videoFile ? (
                        <div className="file-upload-area">
                          <div className="upload-icon-wrapper">
                            <FaVideo className="upload-cloud-icon" />
                          </div>
                          <h4 className="upload-title">Choose a file or drag & drop it here</h4>
                          <p className="upload-subtitle">MP4 formats, up to 30MB</p>
                          <label htmlFor="video-upload" className="browse-file-btn">
                            Browse File
                          </label>
                        </div>
                      ) : (
                        <div className="file-selected">
                          <FaVideo className="file-icon" />
                          <div className="file-details">
                            <p className="file-name">{videoFile.name}</p>
                            <p className="file-size">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                          </div>
                          <button 
                            type="button" 
                            className="clear-file-btn"
                            onClick={async () => {
                              if (videoPublicId) {
                                await deleteVideo(videoPublicId);
                              } else {
                                setVideoFile(null);
                                const input = document.getElementById('video-upload') as HTMLInputElement;
                                if (input) input.value = '';
                              }
                            }}
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Mô tả</label>
                    <input
                      type="text"
                      value={videoData.description}
                      onChange={(e) => setVideoData({...videoData, description: e.target.value})}
                      placeholder="Introduction video"
                    />
                  </div>
                  <div className="form-group">
                    <label>Thời lượng (giây)</label>
                    <input
                      type="number"
                      value={videoData.duration}
                      onChange={(e) => setVideoData({...videoData, duration: parseInt(e.target.value)})}
                      min="0"
                    />
                  </div>
                </div>
              )}

              {/* Vocabularies Section */}
              {contentSections.hasVocabularies && (
                <div className="form-section">
                  <h3><FaSpellCheck /> Vocabularies</h3>
                  {vocabularies.map((vocab, index) => (
                    <div key={index} className="dynamic-item">
                      <div className="form-row">
                        <div className="form-group">
                          <label>Word</label>
                          <input
                            type="text"
                            value={vocab.word}
                            onChange={(e) => {
                              const newVocabs = [...vocabularies];
                              newVocabs[index].word = e.target.value;
                              setVocabularies(newVocabs);
                            }}
                            placeholder="apple"
                          />
                        </div>
                        <div className="form-group">
                          <label>Meaning</label>
                          <input
                            type="text"
                            value={vocab.meaning}
                            onChange={(e) => {
                              const newVocabs = [...vocabularies];
                              newVocabs[index].meaning = e.target.value;
                              setVocabularies(newVocabs);
                            }}
                            placeholder="quả táo"
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Example</label>
                        <input
                          type="text"
                          value={vocab.example}
                          onChange={(e) => {
                            const newVocabs = [...vocabularies];
                            newVocabs[index].example = e.target.value;
                            setVocabularies(newVocabs);
                          }}
                          placeholder="I eat an apple."
                        />
                      </div>
                      <div className="form-group">
                        <label>Image (optional)</label>
                        <div className="custom-file-upload">
                          <input
                            type="file"
                            id={`vocab-image-${index}`}
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setVocabImageFiles({...vocabImageFiles, [index]: file});
                                await uploadVocabImage(file, index);
                              }
                            }}
                            style={{ display: 'none' }}
                            disabled={vocabImageUploading[index]}
                          />
                          {vocabImageUploading[index] ? (
                            <div className="file-upload-area compact">
                              <div className="upload-icon-wrapper">
                                <div className="spinner-admin"></div>
                              </div>
                              <h4 className="upload-title">Uploading image...</h4>
                              <p className="upload-subtitle">Please wait</p>
                            </div>
                          ) : !vocabImageFiles[index] ? (
                            <div className="file-upload-area compact">
                              <div className="upload-icon-wrapper">
                                <FaFileAlt className="upload-cloud-icon" />
                              </div>
                              <h4 className="upload-title">Choose an image or drag & drop it here</h4>
                              <p className="upload-subtitle">JPG, PNG, GIF formats, up to 10MB</p>
                              <label htmlFor={`vocab-image-${index}`} className="browse-file-btn">
                                Browse File
                              </label>
                            </div>
                          ) : (
                            <div className="file-selected">
                              <FaFileAlt className="file-icon" />
                              <div className="file-details">
                                <p className="file-name">{vocabImageFiles[index].name}</p>
                                <p className="file-size">{(vocabImageFiles[index].size / 1024).toFixed(2)} KB</p>
                              </div>
                              <button 
                                type="button" 
                                className="clear-file-btn"
                                onClick={async () => {
                                  if (vocabImagePublicIds[index]) {
                                    await deleteVocabImage(vocabImagePublicIds[index], index);
                                  } else {
                                    const newFiles = {...vocabImageFiles};
                                    delete newFiles[index];
                                    setVocabImageFiles(newFiles);
                                    const input = document.getElementById(`vocab-image-${index}`) as HTMLInputElement;
                                    if (input) input.value = '';
                                  }
                                }}
                              >
                                ×
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => setVocabularies(vocabularies.filter((_, i) => i !== index))}
                      >
                        Xóa
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="add-item-btn"
                    onClick={() => setVocabularies([...vocabularies, {word: '', meaning: '', example: '', imageUrl: ''}])}
                  >
                    + Thêm Vocabulary
                  </button>
                </div>
              )}

              {/* Dialogues Section */}
              {contentSections.hasDialogues && (
                <div className="form-section">
                  <h3><FaComments /> Dialogues</h3>
                  <div className="dialogue-container">
                    {dialogues.map((dialogue, index) => (
                      <div key={index} className="dialogue-line">
                        <div className="dialogue-number">{index + 1}</div>
                        <div className="dialogue-speaker">
                          <input
                            type="text"
                            value={dialogue.speaker}
                            onChange={(e) => {
                              const newDialogues = [...dialogues];
                              newDialogues[index].speaker = e.target.value;
                              setDialogues(newDialogues);
                            }}
                            placeholder="A"
                          />
                        </div>
                        <div className="dialogue-text">
                          <input
                            type="text"
                            value={dialogue.text}
                            onChange={(e) => {
                              const newDialogues = [...dialogues];
                              newDialogues[index].text = e.target.value;
                              setDialogues(newDialogues);
                            }}
                            placeholder="Hello, how are you?"
                          />
                        </div>
                        <button
                          type="button"
                          className="remove-btn-small"
                          onClick={() => setDialogues(dialogues.filter((_, i) => i !== index))}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="add-item-btn"
                    onClick={() => setDialogues([...dialogues, {speaker: '', text: ''}])}
                  >
                    + Thêm Dialogue
                  </button>
                </div>
              )}

              {/* Grammar Section */}
              {contentSections.hasGrammar && (
                <div className="form-section">
                  <h3><FaBook /> Grammar</h3>
                  <div className="form-group">
                    <label>Topic</label>
                    <input
                      type="text"
                      value={grammarData.topic}
                      onChange={(e) => setGrammarData({...grammarData, topic: e.target.value})}
                      placeholder="Present Simple"
                    />
                  </div>
                  <div className="form-group">
                    <label>Explanation</label>
                    <textarea
                      value={grammarData.explanation}
                      onChange={(e) => setGrammarData({...grammarData, explanation: e.target.value})}
                      placeholder="Giải thích chi tiết về cấu trúc ngữ pháp..."
                      rows={4}
                      style={{ minHeight: '100px' }}
                    />
                  </div>
                  
                  <h4><FaListOl /> Formulas</h4>
                  {grammarData.formulas.map((formula, fIndex) => (
                    <div key={fIndex} className="dynamic-item nested">
                      <div className="form-row">
                        <div className="form-group">
                          <label>Type</label>
                          <input
                            type="text"
                            value={formula.type}
                            onChange={(e) => {
                              const newFormulas = [...grammarData.formulas];
                              newFormulas[fIndex].type = e.target.value;
                              setGrammarData({...grammarData, formulas: newFormulas});
                            }}
                            placeholder="Affirmative"
                          />
                        </div>
                        <div className="form-group">
                          <label>Formula</label>
                          <input
                            type="text"
                            value={formula.formula}
                            onChange={(e) => {
                              const newFormulas = [...grammarData.formulas];
                              newFormulas[fIndex].formula = e.target.value;
                              setGrammarData({...grammarData, formulas: newFormulas});
                            }}
                            placeholder="S + V(s/es)"
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Description</label>
                          <input
                            type="text"
                            value={formula.description}
                            onChange={(e) => {
                              const newFormulas = [...grammarData.formulas];
                              newFormulas[fIndex].description = e.target.value;
                              setGrammarData({...grammarData, formulas: newFormulas});
                            }}
                            placeholder="Use for general truths"
                          />
                        </div>
                        <div className="form-group">
                          <label>Verb Type</label>
                          <select
                            value={formula.verbType}
                            onChange={(e) => {
                              const newFormulas = [...grammarData.formulas];
                              newFormulas[fIndex].verbType = e.target.value;
                              setGrammarData({...grammarData, formulas: newFormulas});
                            }}
                          >
                            <option value="">Select...</option>
                            <option value="REGULAR_VERB">Regular Verb</option>
                            <option value="IRREGULAR_VERB">Irregular Verb</option>
                            <option value="TO_BE">To Be</option>
                          </select>
                        </div>
                      </div>
                      
                      <h5>Examples</h5>
                      {formula.examples.map((example, eIndex) => (
                        <div key={eIndex} className="form-row">
                          <div className="form-group">
                            <input
                              type="text"
                              value={example.sentence}
                              onChange={(e) => {
                                const newFormulas = [...grammarData.formulas];
                                newFormulas[fIndex].examples[eIndex].sentence = e.target.value;
                                setGrammarData({...grammarData, formulas: newFormulas});
                              }}
                              placeholder="He plays soccer."
                            />
                          </div>
                          <div className="form-group">
                            <input
                              type="text"
                              value={example.translation}
                              onChange={(e) => {
                                const newFormulas = [...grammarData.formulas];
                                newFormulas[fIndex].examples[eIndex].translation = e.target.value;
                                setGrammarData({...grammarData, formulas: newFormulas});
                              }}
                              placeholder="Anh ấy chơi bóng đá."
                            />
                          </div>
                          <button
                            type="button"
                            className="remove-btn-small"
                            onClick={() => {
                              const newFormulas = [...grammarData.formulas];
                              newFormulas[fIndex].examples = newFormulas[fIndex].examples.filter((_, i) => i !== eIndex);
                              setGrammarData({...grammarData, formulas: newFormulas});
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="add-item-btn-small"
                        onClick={() => {
                          const newFormulas = [...grammarData.formulas];
                          newFormulas[fIndex].examples.push({sentence: '', translation: ''});
                          setGrammarData({...grammarData, formulas: newFormulas});
                        }}
                      >
                        + Add Example
                      </button>
                      
                      <div className="formula-actions">
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => {
                            const newFormulas = grammarData.formulas.filter((_, i) => i !== fIndex);
                            setGrammarData({...grammarData, formulas: newFormulas});
                          }}
                        >
                          Xóa Formula
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="add-item-btn"
                    onClick={() => {
                      const newFormulas = [...grammarData.formulas, {
                        type: '',
                        formula: '',
                        description: '',
                        verbType: '',
                        examples: []
                      }];
                      setGrammarData({...grammarData, formulas: newFormulas});
                    }}
                  >
                    + Thêm Formula
                  </button>
                </div>
              )}

              {/* Exercises Section */}
              {contentSections.hasExercises && (
                <div className="form-section">
                  <h3><FaPencilAlt /> Exercises</h3>
                  {exercises.map((exercise, index) => (
                    <div key={index} className="dynamic-item">
                      <div className="form-group">
                        <label>Question</label>
                        <input
                          type="text"
                          value={exercise.question}
                          onChange={(e) => {
                            const newExercises = [...exercises];
                            newExercises[index].question = e.target.value;
                            setExercises(newExercises);
                          }}
                          placeholder="She ___ to school."
                        />
                      </div>
                      <div className="form-group">
                        <label>Type</label>
                        <select
                          value={exercise.type}
                          onChange={(e) => {
                            const newExercises = [...exercises];
                            newExercises[index].type = e.target.value as ExerciseType;
                            setExercises(newExercises);
                          }}
                        >
                          <option value="TRANSLATE">Translate</option>
                          <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                          <option value="FILL_BLANK">Fill Blank</option>
                          <option value="LISTENING">Listening</option>
                          <option value="SPEAKING">Speaking</option>
                          <option value="MATCH_PAIRS">Match Pairs</option>
                          <option value="BUILD_SENTENCE">Build Sentence</option>
                          <option value="SELECT_IMAGE">Select Image</option>
                          <option value="TAP_WORD">Tap Word</option>
                        </select>
                      </div>
                      
                      <h5>Metadata (Answers)</h5>
                      {exercise.metadata.map((meta, mIndex) => (
                        <div key={mIndex} className="form-row">
                          <div className="form-group" style={{flex: 2}}>
                            <input
                              type="text"
                              value={meta.content}
                              onChange={(e) => {
                                const newExercises = [...exercises];
                                newExercises[index].metadata[mIndex].content = e.target.value;
                                setExercises(newExercises);
                              }}
                              placeholder="go"
                            />
                          </div>
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={meta.isCorrect}
                              onChange={(e) => {
                                const newExercises = [...exercises];
                                newExercises[index].metadata[mIndex].isCorrect = e.target.checked;
                                setExercises(newExercises);
                              }}
                            />
                            <span>Correct</span>
                          </label>
                          <button
                            type="button"
                            className="remove-btn-small"
                            onClick={() => {
                              const newExercises = [...exercises];
                              newExercises[index].metadata = newExercises[index].metadata.filter((_, i) => i !== mIndex);
                              setExercises(newExercises);
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="add-item-btn-small"
                        onClick={() => {
                          const newExercises = [...exercises];
                          newExercises[index].metadata.push({content: '', isCorrect: false});
                          setExercises(newExercises);
                        }}
                      >
                        + Add Answer
                      </button>
                      
                      <div className="exercise-actions">
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => setExercises(exercises.filter((_, i) => i !== index))}
                        >
                          Xóa Exercise
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="add-item-btn"
                    onClick={() => setExercises([...exercises, {question: '', type: 'MULTIPLE_CHOICE', metadata: []}])}
                  >
                    + Thêm Exercise
                  </button>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={handleCloseModal}>
                  Hủy
                </button>
                <button type="submit" className="submit-btn">
                  {editingLesson ? 'Cập nhật' : 'Tạo Lesson'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonManagement;
