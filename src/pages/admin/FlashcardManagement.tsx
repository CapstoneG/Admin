import React, { useState, useEffect } from 'react';
import '@/styles/admin/FlashcardManagement.css';
import { FaPlus, FaArrowLeft, FaEdit, FaTrash, FaLayerGroup, FaBook } from 'react-icons/fa';
import { flashcardService, type Deck, type Flashcard, type CreateDeckData, type CreateFlashcardData } from '@/services/flashcards';

const FlashcardManagement: React.FC = () => {
  const [view, setView] = useState<'decks' | 'flashcards'>('decks');
  const [systemDecks, setSystemDecks] = useState<Deck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [showDeckModal, setShowDeckModal] = useState(false);
  const [showFlashcardModal, setShowFlashcardModal] = useState(false);
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(null);
  
  // Form states
  const [deckForm, setDeckForm] = useState<CreateDeckData>({ name: '', description: '' });
  const [flashcardForm, setFlashcardForm] = useState<CreateFlashcardData>({
    deckId: 0,
    term: '',
    phonetic: '',
    definition: '',
    partOfSpeech: '',
    exampleSentence: '',
    studySkill: ''
  });

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    try {
      setLoading(true);
      const data = await flashcardService.getDashboard();
      setSystemDecks(data.systemDecks || []);
    } catch (error) {
      console.error('Error fetching decks:', error);
      alert('Không thể tải danh sách deck');
    } finally {
      setLoading(false);
    }
  };

  const fetchFlashcards = async (deckId: number) => {
    try {
      setLoading(true);
      const data = await flashcardService.getFlashcardsByDeck(deckId);
      setFlashcards(data);
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      alert('Không thể tải danh sách flashcard');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDeck = (deck: Deck) => {
    setSelectedDeck(deck);
    setView('flashcards');
    fetchFlashcards(deck.id);
  };

  const handleBackToDecks = () => {
    setView('decks');
    setSelectedDeck(null);
    setFlashcards([]);
  };

  // Deck operations
  const handleCreateDeck = async () => {
    if (!deckForm.name.trim()) {
      alert('Vui lòng nhập tên deck');
      return;
    }
    try {
      await flashcardService.createDeck(deckForm);
      setShowDeckModal(false);
      setDeckForm({ name: '', description: '' });
      fetchDecks();
      alert('Tạo deck thành công!');
    } catch (error) {
      console.error('Error creating deck:', error);
      alert('Không thể tạo deck');
    }
  };

  const handleDeleteDeck = async (deckId: number) => {
    if (!confirm('Bạn có chắc muốn xóa deck này?')) return;
    try {
      await flashcardService.deleteDeck(deckId);
      fetchDecks();
      alert('Xóa deck thành công!');
    } catch (error) {
      console.error('Error deleting deck:', error);
      alert('Không thể xóa deck');
    }
  };

  // Flashcard operations
  const handleOpenFlashcardModal = (flashcard?: Flashcard) => {
    if (flashcard) {
      setEditingFlashcard(flashcard);
      setFlashcardForm({
        deckId: flashcard.deckId,
        term: flashcard.term,
        phonetic: flashcard.phonetic,
        definition: flashcard.definition,
        partOfSpeech: flashcard.partOfSpeech,
        exampleSentence: flashcard.exampleSentence,
        studySkill: flashcard.studySkill || ''
      });
    } else {
      setEditingFlashcard(null);
      setFlashcardForm({
        deckId: selectedDeck?.id || 0,
        term: '',
        phonetic: '',
        definition: '',
        partOfSpeech: '',
        exampleSentence: '',
        studySkill: ''
      });
    }
    setShowFlashcardModal(true);
  };

  const handleSaveFlashcard = async () => {
    if (!flashcardForm.term.trim() || !flashcardForm.definition.trim()) {
      alert('Vui lòng nhập term và definition');
      return;
    }
    try {
      if (editingFlashcard) {
        await flashcardService.updateFlashcard(editingFlashcard.id!, flashcardForm);
        alert('Cập nhật flashcard thành công!');
      } else {
        await flashcardService.createFlashcard(flashcardForm);
        alert('Tạo flashcard thành công!');
        // Cập nhật số lượng thẻ trong deck
        if (selectedDeck) {
          setSelectedDeck({
            ...selectedDeck,
            totalCards: selectedDeck.totalCards + 1
          });
        }
      }
      setShowFlashcardModal(false);
      setEditingFlashcard(null);
      if (selectedDeck) {
        fetchFlashcards(selectedDeck.id);
        fetchDecks(); // Gọi lại API để cập nhật deck list
      }
    } catch (error) {
      console.error('Error saving flashcard:', error);
      alert('Không thể lưu flashcard');
    }
  };

  const handleDeleteFlashcard = async (flashcardId: number) => {
    if (!confirm('Bạn có chắc muốn xóa flashcard này?')) return;
    try {
      await flashcardService.deleteFlashcard(flashcardId);
      // Cập nhật số lượng thẻ trong deck
      if (selectedDeck) {
        setSelectedDeck({
          ...selectedDeck,
          totalCards: Math.max(0, selectedDeck.totalCards - 1)
        });
        fetchFlashcards(selectedDeck.id);
        fetchDecks(); // Gọi lại API để cập nhật deck list
      }
      alert('Xóa flashcard thành công!');
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      alert('Không thể xóa flashcard');
    }
  };

  return (
    <div className="flashcard-management">
      {view === 'decks' ? (
        <>
          {/* Deck View */}
          <div className="section-header">
            <h2><FaLayerGroup /> Quản lý Flashcard Decks</h2>
            <button className="add-btn" onClick={() => setShowDeckModal(true)}>
              <FaPlus /> Tạo Deck Mới
            </button>
          </div>

          {loading ? (
            <div className="loading">Đang tải...</div>
          ) : (
            <>

              {/* System Decks */}
              {systemDecks.length > 0 && (
                <div className="deck-section">
                  <h3 className="section-title">Deck hệ thống ({systemDecks.length})</h3>
                  <div className="deck-grid">
                    {systemDecks.map((deck) => (
                      <div key={deck.id} className="deck-card system">
                        <div className="deck-header">
                          <FaBook className="deck-icon" />
                          <h4>{deck.name}</h4>
                        </div>
                        <p className="deck-description">{deck.description}</p>
                        <div className="deck-stats">
                          <span className="stat">
                            <strong>{deck.totalCards}</strong> thẻ
                          </span>
                        </div>
                        <div className="deck-actions">
                          <button className="btn-view" onClick={() => handleViewDeck(deck)}>
                            Xem chi tiết
                          </button>
                          <button className="btn-delete" onClick={() => handleDeleteDeck(deck.id)}>
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <>
          {/* Flashcard View */}
          <div className="section-header">
            <button className="back-btn" onClick={handleBackToDecks}>
              <FaArrowLeft /> Quay lại
            </button>
            <h2>{selectedDeck?.name}</h2>
            <button className="add-btn" onClick={() => handleOpenFlashcardModal()}>
              <FaPlus /> Thêm Flashcard
            </button>
          </div>

          {loading ? (
            <div className="loading">Đang tải...</div>
          ) : (
            <div className="flashcard-list">
              {flashcards.length === 0 ? (
                <div className="empty-state">
                  <FaLayerGroup size={48} />
                  <p>Chưa có flashcard nào trong deck này</p>
                  <button className="add-btn" onClick={() => handleOpenFlashcardModal()}>
                    <FaPlus /> Thêm Flashcard Đầu Tiên
                  </button>
                </div>
              ) : (
                <div className="flashcard-grid">
                  {flashcards.map((card) => (
                    <div key={card.id} className="flashcard-item">
                      <div className="flashcard-front">
                        <div className="term-section">
                          <h4>{card.term}</h4>
                          {card.phonetic && <span className="phonetic">{card.phonetic}</span>}
                          {card.partOfSpeech && <span className="pos">{card.partOfSpeech}</span>}
                        </div>
                        <div className="definition-section">
                          <p className="definition">{card.definition}</p>
                          {card.exampleSentence && (
                            <p className="example">"{card.exampleSentence}"</p>
                          )}
                        </div>
                      </div>
                      <div className="flashcard-actions">
                        <button className="btn-edit" onClick={() => handleOpenFlashcardModal(card)}>
                          <FaEdit /> Sửa
                        </button>
                        <button className="btn-delete" onClick={() => handleDeleteFlashcard(card.id!)}>
                          <FaTrash /> Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Create Deck Modal */}
      {showDeckModal && (
        <div className="modal-overlay" onClick={() => setShowDeckModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Tạo Deck Mới</h3>
              <button className="close-btn" onClick={() => setShowDeckModal(false)}>
                X
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Tên deck *</label>
                <input
                  type="text"
                  value={deckForm.name}
                  onChange={(e) => setDeckForm({ ...deckForm, name: e.target.value })}
                  placeholder="Nhập tên deck..."
                />
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  value={deckForm.description}
                  onChange={(e) => setDeckForm({ ...deckForm, description: e.target.value })}
                  placeholder="Nhập mô tả deck..."
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowDeckModal(false)}>
                Hủy
              </button>
              <button className="btn-save" onClick={handleCreateDeck}>
                Tạo Deck
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Flashcard Modal */}
      {showFlashcardModal && (
        <div className="modal-overlay" onClick={() => setShowFlashcardModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingFlashcard ? 'Chỉnh sửa Flashcard' : 'Thêm Flashcard Mới'}</h3>
              <button className="close-btn" onClick={() => setShowFlashcardModal(false)}>
                X
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Term (Từ vựng) *</label>
                  <input
                    type="text"
                    value={flashcardForm.term}
                    onChange={(e) => setFlashcardForm({ ...flashcardForm, term: e.target.value })}
                    placeholder="environment"
                  />
                </div>
                <div className="form-group">
                  <label>Phonetic (Phiên âm)</label>
                  <input
                    type="text"
                    value={flashcardForm.phonetic}
                    onChange={(e) => setFlashcardForm({ ...flashcardForm, phonetic: e.target.value })}
                    placeholder="/ɪnˈvaɪrənmənt/"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Part of Speech (Từ loại)</label>
                <select
                  value={flashcardForm.partOfSpeech}
                  onChange={(e) => setFlashcardForm({ ...flashcardForm, partOfSpeech: e.target.value })}
                >
                  <option value="">Chọn từ loại</option>
                  <option value="noun">Noun (Danh từ)</option>
                  <option value="verb">Verb (Động từ)</option>
                  <option value="adjective">Adjective (Tính từ)</option>
                  <option value="adverb">Adverb (Trạng từ)</option>
                  <option value="pronoun">Pronoun (Đại từ)</option>
                  <option value="preposition">Preposition (Giới từ)</option>
                  <option value="conjunction">Conjunction (Liên từ)</option>
                  <option value="interjection">Interjection (Thán từ)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Study Skill (Kỹ năng học)</label>
                <select
                  value={flashcardForm.studySkill}
                  onChange={(e) => setFlashcardForm({ ...flashcardForm, studySkill: e.target.value })}
                >
                  <option value="">Chọn kỹ năng</option>
                  <option value="VOCAB">Vocabulary (Từ vựng)</option>
                  <option value="GRAMMAR">Grammar (Ngữ pháp)</option>
                  <option value="READING">Reading (Đọc hiểu)</option>
                  <option value="LISTENING">Listening (Nghe hiểu)</option>
                  <option value="SPEAKING">Speaking (Nói)</option>
                  <option value="WRITING">Writing (Viết)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Definition (Định nghĩa) *</label>
                <textarea
                  value={flashcardForm.definition}
                  onChange={(e) => setFlashcardForm({ ...flashcardForm, definition: e.target.value })}
                  placeholder="The natural world, including air, water, and land"
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Example Sentence (Câu ví dụ)</label>
                <textarea
                  value={flashcardForm.exampleSentence}
                  onChange={(e) => setFlashcardForm({ ...flashcardForm, exampleSentence: e.target.value })}
                  placeholder="We should protect the environment for future generations."
                  rows={2}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowFlashcardModal(false)}>
                Hủy
              </button>
              <button className="btn-save" onClick={handleSaveFlashcard}>
                {editingFlashcard ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardManagement;
