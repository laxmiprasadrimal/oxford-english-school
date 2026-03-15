import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';

const EventManagement = () => {
  const { token } = useAuth();
  const [events, setEvents] = useState({ upcoming: [], past: [] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '', short_desc: '', details: '', tag: 'academic', day: '', month: '', is_past: false, image: null
  });

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_URL}/events`);
      const data = await res.json();
      setEvents({ upcoming: data.upcomingEvents || [], past: data.pastEvents || [] });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });

    try {
      const url = editingId ? `${API_URL}/events/${editingId}` : `${API_URL}/events`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ title: '', short_desc: '', details: '', tag: 'academic', day: '', month: '', is_past: false, image: null });
        fetchEvents();
      } else {
        alert('Failed to save event');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (event) => {
    setFormData({
      title: event.title,
      short_desc: event.short_desc,
      details: event.details,
      tag: event.tag,
      day: event.day,
      month: event.month,
      is_past: event.is_past,
      image: event.image // Note: We don't refill the file input visually
    });
    setEditingId(event.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      const res = await fetch(`${API_URL}/events/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if(res.ok) fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const openNewModal = () => {
    setEditingId(null);
    setFormData({ title: '', short_desc: '', details: '', tag: 'academic', day: '', month: '', is_past: false, image: null });
    setIsModalOpen(true);
  };

  const renderTable = (eventList, title) => (
    <div style={{ marginBottom: '3rem' }}>
      <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>{title}</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'var(--white-color)', boxShadow: 'var(--card-shadow)' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--primary-color)', color: 'white', textAlign: 'left' }}>
              <th style={{ padding: '15px' }}>Image</th>
              <th style={{ padding: '15px' }}>Title</th>
              <th style={{ padding: '15px' }}>Date</th>
              <th style={{ padding: '15px' }}>Tag</th>
              <th style={{ padding: '15px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {eventList.map(evt => (
              <tr key={evt.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '15px' }}>
                  <img src={evt.image} alt="thumb" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px' }}/>
                </td>
                <td style={{ padding: '15px' }}>{evt.title}</td>
                <td style={{ padding: '15px' }}>{evt.month} {evt.day}</td>
                <td style={{ padding: '15px' }}>{evt.tag}</td>
                <td style={{ padding: '15px' }}>
                  <button onClick={() => handleEdit(evt)} className="btn btn-primary" style={{ padding: '5px 10px', fontSize: '0.9rem', marginRight: '5px' }}>Edit</button>
                  <button onClick={() => handleDelete(evt.id)} className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '0.9rem', borderColor: 'red', color: 'red' }}>Delete</button>
                </td>
              </tr>
            ))}
            {eventList.length === 0 && (
               <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>No events found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Events Management</h2>
        <button className="btn btn-primary" onClick={openNewModal}>+ Add Event</button>
      </div>

      {renderTable(events.upcoming, 'Upcoming Events')}
      {renderTable(events.past, 'Past Events')}

      {/* CRUD Modal */}
      {isModalOpen && (
        <div className="modal show" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal-content" style={{ padding: '2rem', maxWidth: '600px', width: '90%', position: 'relative' }}>
            <span className="close-btn" onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '15px', right: '20px', color: 'black', fontSize: '24px', cursor: 'pointer', zIndex: 10, lineHeight: '1' }}>&times;</span>
            <h3 style={{ marginBottom: '1.5rem', paddingRight: '20px' }}>{editingId ? 'Edit Event' : 'Add New Event'}</h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Event Title (e.g., event_1_title fallback)" required style={inputStyle} />
              <input type="text" name="short_desc" value={formData.short_desc} onChange={handleInputChange} placeholder="Short Description" style={inputStyle} />
              <textarea name="details" value={formData.details} onChange={handleInputChange} placeholder="Detailed Description" rows="4" style={inputStyle}></textarea>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input type="text" name="day" value={formData.day} onChange={handleInputChange} placeholder="Day (e.g., 25)" required style={inputStyle} />
                <input type="text" name="month" value={formData.month} onChange={handleInputChange} placeholder="Month (e.g., NOV)" required style={inputStyle} />
                <select name="tag" value={formData.tag} onChange={handleInputChange} style={inputStyle}>
                  <option value="academic">Academic</option>
                  <option value="sports">Sports</option>
                  <option value="scouts">Scouts</option>
                  <option value="celebration">Celebration</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" name="is_past" id="is_past" checked={formData.is_past} onChange={handleInputChange} />
                <label htmlFor="is_past">Mark as Past Event</label>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Event Image</label>
                <input type="file" name="image" onChange={handleInputChange} accept="image/*" style={inputStyle} required={!editingId} />
                {editingId && typeof formData.image === 'string' && <p style={{ fontSize: '0.8rem', color: 'gray' }}>Leave empty to keep current image.</p>}
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>{editingId ? 'Update Event' : 'Save Event'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const inputStyle = { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' };

export default EventManagement;
