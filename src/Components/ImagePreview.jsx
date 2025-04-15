// components/ImagePreview.js
const ImagePreview = ({ src, onDelete }) => (
    <div style={{ position: 'relative' }}>
      <img
        src={src}
        alt="Preview"
        style={{
          height: '100px',
          width: '100px',
          objectFit: 'cover',
          borderRadius: '8px',
        }}
      />
      <button
        type="button"
        onClick={onDelete}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          backgroundColor: 'rgba(255, 0, 0, 0.7)',
          borderRadius: '50%',
          width: '24px',
          height: '24px',
          color: '#fff',
          border: 'none',
        }}
      >
        &times;
      </button>
    </div>
  );
  
  export default ImagePreview;
  