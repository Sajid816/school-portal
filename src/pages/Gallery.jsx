import { useState, useEffect } from 'react';

// 1. Independent Slideshow Component for each group
function GroupSlideshow({ title, images }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Cycles through the pictures automatically every 3 seconds
  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); 
    return () => clearInterval(interval);
  }, [images.length]);

  if (!images || images.length === 0) return null;

  return (
    <div style={{ 
      background: 'rgba(255, 255, 255, 0.1)', 
      border: '1px solid rgba(255,255,255,0.2)', 
      borderRadius: '12px', 
      padding: '15px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#fff', borderBottom: '2px solid #0056b3', paddingBottom: '5px' }}>
        {title}
      </h3>
      
      <div style={{ 
        width: '100%', 
        aspectRatio: '16/9', 
        overflow: 'hidden', 
        borderRadius: '8px',
        position: 'relative',
        background: '#000'
      }}>
        <img 
          src={images[currentIndex].url} 
          alt={`${title} slide ${currentIndex + 1}`} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        
        {/* Optional: Slide counter at the bottom */}
        <div style={{ 
          position: 'absolute', 
          bottom: '10px', 
          right: '10px', 
          background: 'rgba(0,0,0,0.6)', 
          color: 'white', 
          padding: '2px 8px', 
          borderRadius: '4px',
          fontSize: '0.8rem' 
        }}>
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
}

// 2. Main Gallery Viewer Component
function Gallery() {
  const [groupedImages, setGroupedImages] = useState({});

  // Example fetch simulation - replace this with your Firebase fetch logic
  useEffect(() => {
    fetchGalleryData();
  }, []);

  const fetchGalleryData = async () => {
    // Assuming your raw data from Firebase looks something like this:
    const rawData = [
      { id: 1, title: 'Branch-1', url: 'https://via.placeholder.com/600x400?text=Branch+1+-+Pic+1' },
      { id: 2, title: 'Branch-1', url: 'https://via.placeholder.com/600x400?text=Branch+1+-+Pic+2' },
      { id: 3, title: 'Branch-1', url: 'https://via.placeholder.com/600x400?text=Branch+1+-+Pic+3' },
      { id: 4, title: 'Branch-2', url: 'https://via.placeholder.com/600x400?text=Branch+2+-+Pic+1' },
      { id: 5, title: 'Branch-2', url: 'https://via.placeholder.com/600x400?text=Branch+2+-+Pic+2' },
      { id: 6, title: 'Sports Day', url: 'https://via.placeholder.com/600x400?text=Sports+Day+-+Pic+1' },
    ];

    // Group the raw data by 'title'
    const groups = rawData.reduce((acc, image) => {
      if (!acc[image.title]) {
        acc[image.title] = [];
      }
      acc[image.title].push(image);
      return acc;
    }, {});

    setGroupedImages(groups);
  };

  return (
    <div style={{ padding: '40px 20px', width: '100%', boxSizing: 'border-box', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ color: 'white', textAlign: 'center', marginBottom: '30px' }}>School Gallery</h2>
      
      {/* This grid forces exactly 2 items per row. 
        It will drop to 1 item per row automatically on smaller phone screens. 
      */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '30px' 
      }}>
        {Object.entries(groupedImages).map(([title, images]) => (
          <GroupSlideshow key={title} title={title} images={images} />
        ))}
      </div>
    </div>
  );
}

export default Gallery;