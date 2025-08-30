import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase';
import { validateTitle, sanitizeText } from '../utils/inputValidation';

function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '📝',
    slug: '',
    color: '#3b82f6'
  });

  useEffect(() => {
    Promise.all([fetchCategories(), fetchArticles()]);
  }, []);

  const fetchCategories = async () => {
    try {
      const q = query(collection(db, 'categories'), orderBy('name', 'asc'));
      const querySnapshot = await getDocs(q);
      const categoriesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategories(categoriesData);
    } catch (error) {
      console.error('獲取分類失敗:', error);
      alert('獲取分類失敗');
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'articles'));
      const articlesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setArticles(articlesData);
    } catch (error) {
      console.error('獲取文章失敗:', error);
    }
  };

  // 計算每個分類的文章數量
  const getCategoryArticleCount = (categoryName) => {
    return articles.filter(article => article.category === categoryName).length;
  };

  // 生成 slug（URL 友好的名稱）
  const generateSlug = (name) => {
    return sanitizeText(name)
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fff]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 驗證表單
    const nameValidation = validateTitle(formData.name);
    if (!nameValidation.isValid) {
      alert(`分類名稱驗證失敗: ${nameValidation.error}`);
      return;
    }

    if (formData.description && formData.description.length > 200) {
      alert('描述不能超過 200 個字符');
      return;
    }

    // 檢查分類名稱是否重複
    const existingCategory = categories.find(cat => 
      cat.name === formData.name && cat.id !== editingCategory?.id
    );
    if (existingCategory) {
      alert('分類名稱已存在');
      return;
    }

    setLoading(true);

    try {
      const categoryData = {
        name: sanitizeText(formData.name),
        description: sanitizeText(formData.description),
        icon: formData.icon,
        slug: generateSlug(formData.name),
        color: formData.color,
        updatedAt: new Date()
      };

      if (editingCategory) {
        // 更新分類
        await updateDoc(doc(db, 'categories', editingCategory.id), categoryData);
        alert('分類更新成功！');
      } else {
        // 新增分類
        categoryData.createdAt = new Date();
        await addDoc(collection(db, 'categories'), categoryData);
        alert('分類新增成功！');
      }

      // 重新獲取數據並重置表單
      await fetchCategories();
      resetForm();
    } catch (error) {
      console.error('操作失敗:', error);
      alert('操作失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '📝',
      slug: category.slug || '',
      color: category.color || '#3b82f6'
    });
    setShowForm(true);
  };

  const handleDelete = async (category) => {
    const articleCount = getCategoryArticleCount(category.name);
    
    if (articleCount > 0) {
      const confirmed = window.confirm(
        `此分類下有 ${articleCount} 篇文章。刪除分類後，這些文章將變為未分類。確定要刪除嗎？`
      );
      if (!confirmed) return;
    } else {
      const confirmed = window.confirm(`確定要刪除分類「${category.name}」嗎？`);
      if (!confirmed) return;
    }

    setLoading(true);

    try {
      // 刪除分類
      await deleteDoc(doc(db, 'categories', category.id));

      // 如果有文章使用此分類，將其設為空字符串（未分類）
      if (articleCount > 0) {
        const articlesToUpdate = articles.filter(article => article.category === category.name);
        const updatePromises = articlesToUpdate.map(article => 
          updateDoc(doc(db, 'articles', article.id), { category: '' })
        );
        await Promise.all(updatePromises);
      }

      alert('分類刪除成功！');
      await Promise.all([fetchCategories(), fetchArticles()]);
    } catch (error) {
      console.error('刪除失敗:', error);
      alert('刪除失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: '📝',
      slug: '',
      color: '#3b82f6'
    });
    setEditingCategory(null);
    setShowForm(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // 自動生成 slug
    if (field === 'name') {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }));
    }
  };

  // 常用圖標
  const commonIcons = ['📝', '💻', '🎨', '📚', '🔧', '🌐', '📱', '⚡', '🎯', '💡', '🚀', '🎵', '📷', '🍔', '✈️'];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600">載入中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 標題和新增按鈕 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">分類管理</h2>
          <p className="text-gray-600 mt-1">管理您的文章分類</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center space-x-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>新增分類</span>
        </button>
      </div>

      {/* 表單模態 */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingCategory ? '編輯分類' : '新增分類'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* 分類名稱 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    分類名稱 *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="輸入分類名稱..."
                    required
                  />
                </div>

                {/* 分類描述 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    分類描述
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={3}
                    placeholder="輸入分類描述..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.description.length}/200 字符
                  </p>
                </div>

                {/* 圖標選擇 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    分類圖標
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {commonIcons.map(icon => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => handleInputChange('icon', icon)}
                        className={`w-10 h-10 text-lg border rounded-md hover:bg-gray-100 ${
                          formData.icon === icon ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => handleInputChange('icon', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="或輸入自定義圖標..."
                  />
                </div>

                {/* 顏色選擇 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    主題顏色
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                      className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>

                {/* URL Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL 路徑
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="url-friendly-name"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    用於 URL，會自動生成
                  </p>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {loading ? '處理中...' : editingCategory ? '更新' : '新增'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 分類列表 */}
      {categories.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="text-6xl mb-4">🏷️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">還沒有任何分類</h3>
          <p className="text-gray-600 mb-6">建立您的第一個分類來組織文章</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
          >
            建立第一個分類
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(category => {
            const articleCount = getCategoryArticleCount(category.name);
            return (
              <div
                key={category.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200"
                style={{
                  borderTop: `4px solid ${category.color || '#3b82f6'}`
                }}
              >
                <div className="flex items-center mb-4">
                  <div className="text-2xl mr-3">{category.icon || '📝'}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-xs text-gray-500">/{category.slug}</p>
                  </div>
                </div>
                
                {category.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {category.description}
                  </p>
                )}
                
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500">
                    📄 {articleCount} 篇文章
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 rounded hover:bg-blue-50"
                    >
                      編輯
                    </button>
                    <button
                      onClick={() => handleDelete(category)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 rounded hover:bg-red-50"
                    >
                      刪除
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CategoryManager;
