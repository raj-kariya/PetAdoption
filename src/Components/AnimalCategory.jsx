import { useEffect, useState, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button } from 'react-bootstrap';
import LoaderOverlay from './LoaderOverlay';
import ItemCard from './ItemCard';
import ImagePreview from './ImagePreview';
import { runWithLoader } from '../utils/runwithLoaders';

function AnimalCategory() {
  const fileInputRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    price: '',
    category_id: '',
    image: [],
    existingImages: [],
  });
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedItem, setSelectedItem] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await runWithLoader(async () => {
      const response = await fetch('http://localhost/animals.php?action=get_all');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setCategories(data.categories || []);
      setItems(data.items || []);
    }, setFetchLoading);
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      price: '',
      category_id: '',
      image: [],
      existingImages: [],
    });
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const handleFormChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const newFiles = Array.from(files);
      setFormData(prev => ({
        ...prev,
        image: [...prev.image, ...newFiles],
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEditClick = (item) => {
    let images = [];
    try {
      images = JSON.parse(item.Image);
      if (!Array.isArray(images)) images = [images];
    } catch {
      images = item.Image ? [item.Image] : [];
    }

    setSelectedItem(item);
    setFormData({
      id: item.id,
      name: item.Name,
      price: item.Price,
      category_id: item.Category_id,
      image: [],
      existingImages: images,
    });
    setModalType('edit');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    await runWithLoader(async () => {
      await fetch('http://localhost/animals.php?action=delete_item', {
        method: 'POST',
        body: new URLSearchParams({ id }),
      });
      fetchData();
    }, setFetchLoading);
  };

  const handleExistingImageDelete = async (index) => {
    const imageToDelete = formData.existingImages[index];
    await runWithLoader(async () => {
      await fetch('http://localhost/animals.php?action=delete_image', {
        method: 'POST',
        body: new URLSearchParams({ image: imageToDelete, item_id: formData.id }),
      });

      setFormData(prev => ({
        ...prev,
        existingImages: prev.existingImages.filter((_, i) => i !== index),
      }));

      if (selectedItem) {
        let updatedImages = selectedItem.Image;
        try {
          updatedImages = JSON.parse(updatedImages);
          if (!Array.isArray(updatedImages)) updatedImages = [updatedImages];
          updatedImages = updatedImages.filter((_, i) => i !== index);
          selectedItem.Image = JSON.stringify(updatedImages);
          setSelectedItem({ ...selectedItem });
        } catch (err) {
          console.log(err);
        }
      }
    }, setFetchLoading);
  };

  const handleImageDelete = async (index) => {
    await runWithLoader(async () => {
      const newImages = formData.image.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, image: newImages }));
      if (newImages.length === 0 && fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    }, setFetchLoading);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await runWithLoader(async () => {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('price', formData.price);
      data.append('category_id', formData.category_id);

      if (formData.image.length) {
        formData.image.forEach(img => data.append('images[]', img));
      }

      if (modalType === 'edit') {
        data.append('id', formData.id);
        formData.existingImages.forEach(img => data.append('existingImages[]', img));
      }

      const response = await fetch(`http://localhost/animals.php?action=${modalType === 'edit' ? 'edit_item' : 'add_item'}`, {
        method: 'POST',
        body: data,
      });

      const result = await response.json();
      if (result.success) {
        resetForm();
        fetchData();
        setShowModal(false);
      } else {
        alert(result.error || 'Something went wrong');
      }
    }, setFetchLoading);
  };

  return (
    <div className="container mt-4">
      {fetchLoading && <LoaderOverlay />}
      <div className="d-flex justify-content-end mb-3">
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setModalType('add');
            setShowModal(true);
          }}
        >
          Add Item
        </button>
      </div>

      {categories.map(category => {
        const itemsForCategory = items.filter(i => i.Category_id === category.id);
        return (
          <div key={category.id} className="mb-4">
            <h2>{category.name}</h2>
            {itemsForCategory.length ? (
              <div className="row row-cols-1 row-cols-md-3 g-4">
                {itemsForCategory.map(item => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onEdit={handleEditClick}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted">Not available</p>
            )}
          </div>
        );
      })}

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{modalType === 'add' ? 'Add Item' : 'Edit Item'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <select
              name="category_id"
              className="form-control mb-2"
              value={formData.category_id}
              onChange={handleFormChange}
              required
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <input
              type="text"
              name="name"
              placeholder="Name"
              className="form-control mb-2"
              value={formData.name}
              onChange={handleFormChange}
              required
            />

            <input
              type="number"
              name="price"
              placeholder="Price"
              className="form-control mb-2"
              value={formData.price}
              onChange={handleFormChange}
              required
            />

            <input
              type="file"
              name="image"
              multiple
              ref={fileInputRef}
              className="form-control mb-2"
              onChange={handleFormChange}
              accept="image/*"
              required={modalType === 'add'}
            />

            {formData.existingImages.length > 0 && (
              <div className="mb-2 d-flex flex-wrap gap-2">
                {formData.existingImages.map((img, idx) => (
                  <ImagePreview
                    key={idx}
                    src={`http://localhost/uploads/${img}`}
                    onDelete={() => handleExistingImageDelete(idx)}
                  />
                ))}
              </div>
            )}

            {formData.image.length > 0 && (
              <div className="mb-2 d-flex flex-wrap gap-2">
                {formData.image.map((file, idx) => (
                  <ImagePreview
                    key={idx}
                    src={URL.createObjectURL(file)}
                    onDelete={() => handleImageDelete(idx)}
                  />
                ))}
              </div>
            )}

            <Button type="submit" variant="success">
              {modalType === 'add' ? 'Add Item' : 'Update Item'}
            </Button>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default AnimalCategory;
