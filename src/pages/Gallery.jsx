import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { API_URL } from '../config'

function Gallery() {
  const { t } = useTranslation()
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImage, setCurrentImage] = useState('')

  const [images, setImages] = useState([])

  useEffect(() => {
    fetch(`${API_URL}/gallery`)
      .then(res => res.json())
      .then(data => setImages(data || []))
      .catch(err => console.error("Error fetching gallery:", err))
  }, [])

  const openLightbox = (image) => {
    setCurrentImage(image)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
    setCurrentImage('')
  }

  return (
    <>
      <section className="section page-section">
        <div className="container">
          <h2 className="section-title">{t('gallery_main_heading')}</h2>
          <p style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 3rem' }}>
            {t('gallery_intro_para')}
          </p>

          <div className="gallery-grid">
            {images.map((item, index) => (
              <div
                key={item.id}
                className={`gallery-item reveal-scale delay-${(index % 5) + 1}`}
                onClick={() => openLightbox(item.image)}
              >
                <img src={item.image} alt={item.title || `Gallery image ${index + 1}`} />
                <div className="overlay">
                  <i className="fas fa-search-plus"></i>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {lightboxOpen && (
        <div className="lightbox active" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <span className="lightbox-close" onClick={closeLightbox}>&times;</span>
            <a
              href={currentImage}
              download
              className="download-button"
              onClick={(e) => e.stopPropagation()}
            >
              <i className="fas fa-download"></i> Download
            </a>
            <img src={currentImage} alt="Lightbox" id="lightboxImage" />
          </div>
        </div>
      )}
    </>
  )
}

export default Gallery
