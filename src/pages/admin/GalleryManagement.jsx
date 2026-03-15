import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const GalleryManagement = () => {
  const { token } = useAuth();
  const [galleryItems, setGalleryItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '', images: []
  });

  const fetchGallery = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/gallery');
      const data = await res.json();
      setGalleryItems(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? Array.from(files) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!formData.images || formData.images.length === 0) return alert('At least one image is required');
    
    const data = new FormData();
    data.append('title', formData.title);
    formData.images.forEach(file => {
      data.append('images', file);
    });

    try {
      const res = await fetch('http://localhost:5000/api/gallery', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ title: '', images: [] });
        fetchGallery();
      } else {
        alert('Failed to upload image(s)');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Are you sure you want to delete this image?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/gallery/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if(res.ok) fetchGallery();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkDelete = async () => {
    if(selectedIds.length === 0) return;
    if(!window.confirm(`Are you sure you want to delete ${selectedIds.length} image(s)?`)) return;
    try {
      const res = await fetch('http://localhost:5000/api/gallery/bulk-delete', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids: selectedIds })
      });
      if(res.ok) {
        setSelectedIds([]);
        fetchGallery();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const openNewModal = () => {
    setFormData({ title: '', images: [] });
    setIsModalOpen(true);
  };

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Gallery Management</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          {selectedIds.length > 0 && (
            <button className="btn btn-secondary" onClick={handleBulkDelete} style={{ borderColor: 'red', color: 'red' }}>
              <i className="fa-solid fa-trash"></i> Delete Selected ({selectedIds.length})
            </button>
          )}
          <button className="btn btn-primary" onClick={openNewModal}>+ Upload Image(s)</button>
        </div>
      </div>

      <div className="admin-gallery-grid">
        {galleryItems.map(item => (
          <div key={item.id} className="admin-gallery-item" style={{ position: 'relative', border: selectedIds.includes(item.id) ? '2px solid var(--primary-color)' : '1px solid #eee', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', cursor: 'pointer' }} onClick={() => toggleSelection(item.id)}>
            <input 
              type="checkbox" 
              checked={selectedIds.includes(item.id)} 
              onChange={() => {}} // Controlled by div onClick
              style={{ position: 'absolute', top: '10px', left: '10px', transform: 'scale(1.5)', zIndex: 2, cursor: 'pointer' }}
            />
            <img src={item.image} alt={item.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
            <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
              <span style={{ fontSize: '0.9rem', truncate: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '120px' }}>{item.title || 'Untitled'}</span>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="btn btn-secondary" style={{ padding: '3px 8px', fontSize: '0.8rem', color: 'red', borderColor: 'red' }}>
                <i className="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {galleryItems.length === 0 && <p>No images found in gallery.</p>}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="modal show" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal-content" style={{ padding: '2rem', maxWidth: '500px', width: '90%', position: 'relative' }}>
            <span className="close-btn" onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '15px', right: '20px', color: 'black', fontSize: '24px', cursor: 'pointer', zIndex: 10, lineHeight: '1' }}>&times;</span>
            <h3 style={{ marginBottom: '1.5rem', paddingRight: '20px' }}>Upload Gallery Image</h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Optional Title/Caption</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Title..." style={inputStyle} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Select Image(s)</label>
                <input type="file" name="images" multiple onChange={handleInputChange} accept="image/*" style={inputStyle} required />
                {formData.images && formData.images.length > 0 && (
                  <p style={{ marginTop: '5px', fontSize: '0.9rem', color: 'gray' }}>{formData.images.length} file(s) selected.</p>
                )}
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Upload Image</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const inputStyle = { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' };

export default GalleryManagement;
