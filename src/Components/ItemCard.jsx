// components/ItemCard.js
import { Carousel } from 'react-bootstrap';

const ItemCard = ({ item, onEdit, onDelete }) => {
  let images = [];

  try {
    images = JSON.parse(item.Image);
    if (!Array.isArray(images)) images = [images];
  } catch {
    images = item.Image ? [item.Image] : [];
  }

  return (
    <div className="col">
      <div className="card h-100">
        <Carousel interval={null} indicators={false}>
          {images.map((img, idx) => (
            <Carousel.Item key={idx}>
              <img
                src={`http://localhost/uploads/${img}`}
                alt={`Image of ${item.Name}`}
                className="d-block w-100"
                style={{ maxHeight: '580px', objectFit: 'cover' }}
              />
            </Carousel.Item>
          ))}
        </Carousel>
        <div className="card-body">
          <h5 className="card-title">{item.Name}</h5>
          <p className="card-text">Price: ₹{item.Price}</p>
          <button className="btn btn-warning btn-sm me-2" onClick={() => onEdit(item)}>
            Edit
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => onDelete(item.id)}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
