import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import '../pages/AdminDashboard.css';

function NavigationManager() {
  const [navigationItems, setNavigationItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    path: '',
    type: 'internal', // internal, external, category
    order: 0,
    enabled: true
  });

  useEffect(() => {
    fetchNavigationItems();
  }, []);

  const fetchNavigationItems = async () => {
    try {
      const q = query(collection(db, 'navigation'), orderBy('order', 'asc'));
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNavigationItems(items);
    } catch (error) {
      console.error('獲取導覽列項目失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        order: parseInt(formData.order),
        updatedAt: new Date()
      };

      if (editingItem) {
        await updateDoc(doc(db, 'navigation', editingItem.id), data);
        alert('導覽列項目更新成功！');
      } else {
        data.createdAt = new Date();
        await addDoc(collection(db, 'navigation'), data);
        alert('導覽列項目新增成功！');
      }

      resetForm();
      fetchNavigationItems();
    } catch (error) {
      console.error('操作失敗:', error);
      alert('操作失敗，請再試一次');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      path: item.path,
      type: item.type,
      order: item.order,
      enabled: item.enabled
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('確定要刪除此導覽列項目嗎？')) {
      try {
        await deleteDoc(doc(db, 'navigation', id));
        alert('導覽列項目刪除成功！');
        fetchNavigationItems();
      } catch (error) {
        console.error('刪除失敗:', error);
        alert('刪除失敗，請再試一次');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      path: '',
      type: 'internal',
      order: navigationItems.length,
      enabled: true
    });
    setEditingItem(null);
    setShowForm(false);
  };

  const typeOptions = [
    { value: 'internal', label: '內部連結' },
    { value: 'external', label: '外部連結' },
    { value: 'category', label: '分類頁面' }
  ];

  if (loading) {
    return <div className="loading">載入中...</div>;
  }

  return (
    <div className="navigation-manager">
      <div className="section-header">
        <h2>🧭 導覽列管理</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          新增導覽項目
        </button>
      </div>

      {showForm && (
        <div className="form-modal">
          <div className="form-modal-content">
            <div className="form-header">
              <h3>{editingItem ? '編輯導覽項目' : '新增導覽項目'}</h3>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>項目標題</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="例如：首頁、關於我們"
                  required
                />
              </div>

              <div className="form-group">
                <label>連結類型</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  {typeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>連結路徑</label>
                <input
                  type="text"
                  value={formData.path}
                  onChange={(e) => setFormData({...formData, path: e.target.value})}
                  placeholder={
                    formData.type === 'external' ? 'https://example.com' :
                    formData.type === 'category' ? '/category/分類名稱' :
                    '/'
                  }
                  required
                />
                <small className="form-help">
                  {formData.type === 'external' && '請包含 http:// 或 https://'}
                  {formData.type === 'category' && '格式：/category/分類名稱'}
                  {formData.type === 'internal' && '內部頁面路徑，例如：/、/about'}
                </small>
              </div>

              <div className="form-group">
                <label>顯示順序</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({...formData, order: e.target.value})}
                  min="0"
                />
                <small className="form-help">數字越小越靠前</small>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({...formData, enabled: e.target.checked})}
                  />
                  啟用此導覽項目
                </label>
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="btn btn-secondary">
                  取消
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingItem ? '更新' : '新增'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="navigation-list">
        {navigationItems.length === 0 ? (
          <div className="empty-state">
            <p>還沒有自定義導覽項目</p>
            <p>新增第一個導覽項目來覆蓋預設導覽列</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>順序</th>
                  <th>標題</th>
                  <th>類型</th>
                  <th>路徑</th>
                  <th>狀態</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {navigationItems.map(item => (
                  <tr key={item.id}>
                    <td>{item.order}</td>
                    <td>{item.title}</td>
                    <td>
                      <span className={`type-badge type-${item.type}`}>
                        {typeOptions.find(opt => opt.value === item.type)?.label}
                      </span>
                    </td>
                    <td className="path-cell">{item.path}</td>
                    <td>
                      <span className={`status-badge ${item.enabled ? 'enabled' : 'disabled'}`}>
                        {item.enabled ? '啟用' : '停用'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => handleEdit(item)}
                          className="btn btn-sm btn-secondary"
                        >
                          編輯
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="btn btn-sm btn-danger"
                        >
                          刪除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default NavigationManager;
