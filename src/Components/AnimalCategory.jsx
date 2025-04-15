import { useEffect, useState, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, ProgressBar } from 'react-bootstrap';
import { Carousel } from 'react-bootstrap';
import LoaderOverlay from './LoaderOverlay';
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
    // Fetch categories and items on mount
    useEffect(() => {
        fetchData();
    }, []);

    const runWithLoader = async (asyncFn) => {
        setFetchLoading(true);
        try {
          await asyncFn();
        } catch (err) {
          console.error(err);
        } finally {
          setFetchLoading(false);
        }
      };      

      const fetchData = async () => {
        await runWithLoader(async () => {
          const response = await fetch('http://localhost/animals.php?action=get_all');
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const data = await response.json();
          setCategories(data.categories || []);
          setItems(data.items || []);
        });
      };
      

    const getItemsForCategory = (catId) => items.filter(item => item.Category_id === catId);

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
              if (updatedImages.length === 1) updatedImages = updatedImages[0];
              selectedItem.Image = JSON.stringify(updatedImages);
              setSelectedItem({ ...selectedItem }); // force re-render
            } catch (err) {
              console.log(err);
            }
          }
        });
      };
      

    const handleImageDelete = async (index) => {
        setFetchLoading(true);
        try {
            const newImages = formData.image.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, image: newImages }));
    
            // Reset file input if no images remain
            if (newImages.length === 0 && fileInputRef.current) {
                fileInputRef.current.value = null;
            }
        } catch (e) {
            console.log('there is some error ' + e);
        } finally {
            setFetchLoading(false);
        }
    };

    const handleFormChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            const newFiles = Array.from(files);
            setFormData(prev => ({
                ...prev,
                image: [...newFiles] // Append new files
            }));
    
            
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.price || !formData.category_id) {
            alert('Please fill out all required fields.');
            return;
        }
        setFetchLoading(true); // Set loading to true here.
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('price', formData.price);
            data.append('category_id', formData.category_id);
    
            if (formData.image && formData.image.length > 0) {
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
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const result = await response.json();
    
            if (result.success) {
                // alert(modalType === 'edit' ? 'Item updated!' : 'Item added!');
                resetForm();
                fetchData();
                setShowModal(false);
            } else {
                alert(result.error || 'Something went wrong');
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('Failed to submit. Please try again.');
        } finally {
            setFetchLoading(false); // Set loading to false here.
        }
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
        if(!window.confirm('Are you sure you want to delete this item?')) return;
        setFetchLoading(true); 
        try {
            await fetch('http://localhost/animals.php?action=delete_item', {
                method: 'POST',
                body: new URLSearchParams({ id }),
            });

            alert('Item deleted!');
            fetchData();
        } catch (err) {
            console.error('Error deleting item:', err);
            alert('Failed to delete item. Please try again.');
        } finally {
            setFetchLoading(false); 
        }
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

            {categories.length === 0 && <p>Loading categories...</p>}

            {categories.map(category => (
                <div key={category.id} className="mb-4">
                    <h2>{category.name}</h2>
                    {getItemsForCategory(category.id).length > 0 ? (
                        <div className="row row-cols-1 row-cols-md-3 g-4">
                            {getItemsForCategory(category.id).map(item => (
                                <div key={item.id} className="col">
                                    <div className="card h-100">
                                        <Carousel interval={null} indicators={false}>
                                        {(() => {
                                            let images = item.Image;
                                            if (typeof images === 'string') {
                                                try {
                                                    images = JSON.parse(images);
                                                } catch (e) {
                                                    images = [images]; // Treat as single image if JSON parsing fails
                                                }
                                            }
                                            if (!Array.isArray(images)) {
                                                images = [images];
                                            }

                                            return images.map((img, idx) => (
                                                <Carousel.Item key={idx}>
                                                    <img
                                                        src={`http://localhost/uploads/${img}`}
                                                        alt={`Image of ${item.Name}`}
                                                        className="d-block w-100"
                                                        style={{ maxHeight: '580px', objectFit: 'cover' }}
                                                    />
                                                </Carousel.Item>
                                            ));
                                        })()}

                                        </Carousel>
                                        <div className="card-body">
                                            <h5 className="card-title">{item.Name}</h5>
                                            <p className="card-text">Price: ₹{item.Price}</p>
                                            <button className="btn btn-warning btn-sm" onClick={() => handleEditClick(item)}>Edit</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>Delete</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted">Not available</p>
                    )}
                </div>
            ))}

            {/* Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{modalType === 'add' ? 'Add Item' : 'Edit Item'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                

                    <form onSubmit={handleSubmit}>
                        {/* Category Dropdown */}
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

                        {/* Name Input */}
                        <input
                            type="text"
                            name="name"
                            placeholder="Name"
                            className="form-control mb-2"
                            value={formData.name}
                            onChange={handleFormChange}
                            required
                        />

                        {/* Price Input */}
                        <input
                            type="number"
                            name="price"
                            placeholder="Price"
                            className="form-control mb-2"
                            value={formData.price}
                            onChange={handleFormChange}
                            required
                        />

                        {/* File Input */}
                        <input
                            type="file"
                            name="image"
                            multiple
                            ref={fileInputRef}
                            className="form-control mb-2"
                            onChange={(e) => {
                                const newFiles = Array.from(e.target.files);
                                setFormData(prev => ({
                                  ...prev,
                                  image: [...prev.image, ...newFiles], 
                                }));
                              }}
                            accept='image/*'
                            required={modalType === 'add'}
                        />

                        {/* Existing Images */}
                        {formData.existingImages.length > 0 && (
                            <div className="mb-2 d-flex flex-wrap gap-2">
                                {formData.existingImages.map((img, idx) => (
                                    <div key={idx} style={{ position: 'relative' }}>
                                        <img
                                            src={`http://localhost/uploads/${img}`}
                                            alt={`Existing ${idx}`}
                                            style={{
                                                height: '100px',
                                                width: '100px',
                                                objectFit: 'cover',
                                                borderRadius: '8px',
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleExistingImageDelete(idx)}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                right: 0,
                                                backgroundColor: 'rgba(255, 0, 0, 0.7)',
                                                borderRadius: '50%',
                                                width: '24px',
                                                height: '24px',
                                                color: '#fff',
                                                borderWidth: 0,
                                            }}
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* New Image Previews */}
                        {Array.isArray(formData.image) && formData.image.length > 0 && (
                            <div className="mb-2 d-flex flex-wrap gap-2">
                                {formData.image.map((file, idx) => (
                                    <div key={idx} style={{ position: 'relative' }}>
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={`Preview ${idx}`}
                                            style={{
                                                height: '100px',
                                                width: '100px',
                                                objectFit: 'cover',
                                                borderRadius: '8px',
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleImageDelete(idx)}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                right: 0,
                                                backgroundColor: 'rgba(255, 0, 0, 0.7)',
                                                borderRadius: '50%',
                                                width: '24px',
                                                height: '24px',
                                                color: '#fff',
                                                borderWidth: 0,
                                            }}
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Submit Button */}
                        <Button type="submit" variant="success">{modalType === 'add' ? 'Add Item' : 'Update Item'}</Button>
                    </form>
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default AnimalCategory;