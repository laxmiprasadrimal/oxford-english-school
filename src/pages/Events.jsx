import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { API_URL } from '../config'
const EventCard = ({ event, showViewDetails = true, index, t, onOpenModal }) => (
  <div className={`event-card ${index % 2 === 0 ? 'reveal-left' : 'reveal-right'}`} onClick={() => onOpenModal(event)}>
    <div className="event-date">
      <span className="day">{event.day}</span>
      <span className="month">{event.month}</span>
    </div>
    <div className="event-details">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <span className="event-tag">{t(event.tag)}</span>
          <h4 style={{ margin: '5px 0 10px 0' }}>{event.title.includes('event_') ? t(`${event.title}_title`) : event.title}</h4>
        </div>
        {showViewDetails && (
          <span className="event-tag" style={{ background: 'transparent', border: '1px solid var(--primary-color)', color: 'var(--primary-color)' }}>
            {t('btn_view_details')} <i className="fa-solid fa-arrow-right"></i>
          </span>
        )}
      </div>
      <p style={{ marginBottom: '15px', color: '#666' }}>
        {event.short_desc.includes('event_') ? t(`${event.short_desc}_short_desc`) : event.short_desc}
      </p>
      {event.image && (
        <img
          src={event.image}
          alt="Event Thumbnail"
          style={{ width: '100%', height: 'auto', maxHeight: '300px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #eee', backgroundColor: '#f5f5f5' }}
        />
      )}
    </div>
  </div>
)

function Events() {
  const { t } = useTranslation()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [pastEvents, setPastEvents] = useState([])

  useEffect(() => {
    fetch(`${API_URL}/events`)
      .then(res => res.json())
      .then(data => {
        setUpcomingEvents(data.upcomingEvents || [])
        setPastEvents(data.pastEvents || [])
      })
      .catch(err => console.error("Error fetching events:", err))
  }, [])

  const openModal = (event) => {
    setSelectedEvent(event)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedEvent(null)
  }


  return (
    <>
      <section className="section page-section">
        <div className="container">
          <h2 className="section-title">{t('events_main_heading')}</h2>

          <h3 className="reveal-left" style={{ color: 'var(--primary-color)', marginTop: '3rem' }}>
            {t('upcoming_events_title')}
          </h3>

          <div className="events-container">
            {upcomingEvents.map((event, index) => (
              <EventCard key={event.key} event={event} index={index} t={t} onOpenModal={openModal} />
            ))}
          </div>

          <h3 className="reveal-right" style={{ color: 'var(--primary-color)', marginTop: '4rem' }}>
            {t('past_events_title')}
          </h3>

          <div className="events-container">
            {pastEvents.map((event, index) => (
              <EventCard key={event.key} event={event} showViewDetails={false} index={index} t={t} onOpenModal={openModal} />
            ))}
          </div>
        </div>
      </section>

      {modalOpen && selectedEvent && (
        <div className="modal show" onClick={closeModal} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ margin: '0', animation: 'animatetop 0.4s' }}>
            <div className="modal-header">
              <h4 style={{ margin: 0, color: 'white' }}>{selectedEvent.title.includes('event_') ? t(`${selectedEvent.title}_title`) : selectedEvent.title}</h4>
              <span className="close-btn" onClick={closeModal}>&times;</span>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div className="event-date" style={{ minWidth: '100px', height: 'fit-content' }}>
                  <span className="day">{selectedEvent.day}</span>
                  <span className="month">{selectedEvent.month}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <span className="event-tag">{t(selectedEvent.tag)}</span>
                  <p style={{ marginTop: '10px', fontSize: '1rem', lineHeight: '1.6' }}>
                    {selectedEvent.details.includes('event_') ? t(`${selectedEvent.details}_details`) : selectedEvent.details}
                  </p>
                </div>
              </div>
              <img
                src={selectedEvent.image}
                alt="Event Image"
                style={{ width: '100%', maxHeight: '500px', objectFit: 'contain', borderRadius: '8px', backgroundColor: '#f9f9f9' }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Events
