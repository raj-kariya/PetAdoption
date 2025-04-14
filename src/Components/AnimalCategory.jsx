import { useEffect, useState,useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button } from 'react-bootstrap';
// import { Await } from 'react-router-dom';
import { Carousel } from 'react-bootstrap';
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
    
    useEffect(() => {
        fetchData();
    }, []);
    
    const fetchData = () => {
        fetch('http://localhost/animals.php?action=get_all')
        .then(res => res.json())
        .then(data => {
            setCategories(data.categories || []);
            setItems(data.items || []);
        })
        .catch(err => console.error('Error fetching data:', err));
    };
    
    const getItemsForCategory = (catId) => {
        return items.filter(item => item.Category_id === catId);
    };
    const handleExistingImageDelete = (index) => {
        const imageToDelete = formData.existingImages[index];
      
        
        fetch('http://localhost/animals.php?action=delete_image', {
          method: 'POST',
          body: new URLSearchParams({ image: imageToDelete, item_id: formData.id }),
        });
      
        
        setFormData((prev) => ({
          ...prev,
          existingImages: prev.existingImages.filter((_, i) => i !== index),
        }));
      };
      
      const handleImageDelete = (index) => {
        const newImages = formData.image.filter((_, i) => i !== index);
      
        setFormData((prev) => ({
          ...prev,
          image: newImages,
        }));
      
        
        if (newImages.length === 0 && fileInputRef.current) {
          fileInputRef.current.value = null;
        }
      };
      
      

    const handleFormChange = (e) => {
        const { name, value, type, files } = e.target;
      
        if (type === 'file') {
          setFormData((prev) => ({
            ...prev,
            [name]: files, // stores the full FileList
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            [name]: value,
          }));
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const data1 = new FormData();
        data1.append('name', formData.name);
        data1.append('price', formData.price);
        data1.append('category_id', formData.category_id);
        
        if (formData.image && formData.image.length > 0) {
            for (let i = 0; i < formData.image.length; i++) {
                data1.append('images[]', formData.image[i]);
            }
        }
        
        if (modalType === 'edit') {
            data1.append('id', formData.id);
        }
        
        try {
            const response = await fetch(`http://localhost/animals.php?action=${modalType === 'edit' ? 'edit_item' : 'add_item'}`, {
                method: 'POST',
                body: data1,
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert(modalType === 'edit' ? 'Item updated!' : 'Item added!');
                setShowModal(false);
                fetchData();
            } else {
                alert(data.error || 'Something went wrong');
            }
        } catch (err) {
            console.error('Submit error:', err);
        }
    };
    
    
    const handleEditClick = (item) => {
        let images = [];
      
        try {
          const parsed = JSON.parse(item.Image);
          images = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          // if parsing fails, treat as single image string
          images = item.Image ? [item.Image] : [];
        }
      
        setSelectedItem(item);
        setFormData({
          id: item.id,
          name: item.Name,
          price: item.Price,
          category_id: item.Category_id,
          image: null,
          existingImages: images,
        });
        setModalType('edit');
        setShowModal(true);
      };
      
    
    const handleDelete = (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) {
            return;
        }
        const formData1 = new FormData();
        formData1.append('id', id);
        fetch('http://localhost/animals.php?action=delete_item', {
            method: 'POST',
            body: formData1,
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert('Item deleted!');
                fetchData();
            } else {
                alert(data.error || 'Failed to delete item');
            }
        })
        .catch(err => console.error('Error deleting item:', err));
    };
    
    return (
        <div className="container mt-4">
        <div className="d-flex justify-content-end mb-3">
        <button
        className="btn btn-primary"
        onClick={() => {
            setFormData({
                id: '',
                name: '',
                price: '',
                category_id: '', 
                image: null,
            });
            setModalType('add');
            setShowModal(true);
        }}
        >
        Add Item
        </button>
        </div>
        {categories.length === 0 && <p>Loading categories...</p>}
        {categories.map((category) => {
            const categoryItems = getItemsForCategory(category.id);
            return (
                <div key={category.id} className="mb-4">
                <h2>{category.name}</h2>
                {categoryItems.length > 0 ? (
                    <div className="row row-cols-1 row-cols-md-3 g-4">
                    {categoryItems.map(item => (
                        <div key={item.id} className="col">
                        <div className="card h-100">
                        {/* <img src={`http://localhost/uploads/${item.Image}`} className="card-img-top" alt={item.Name} /> */}
                        
                        {/* We have multiple images so */}
                        
                        
                        <Carousel interval={null} indicators={false}>
                            {(() => {
                                let images = [];
                                try {
                                images = JSON.parse(item.Image);
                                if (!Array.isArray(images)) {
                                    images = [images];
                                }
                                } catch {
                                images = [item.Image];
                                }

                                return images.map((img, idx1) => (
                                <Carousel.Item key={idx1}>
                                    <img
                                    src={`http://localhost/uploads/${img}`}
                                    className="d-block w-100"
                                    alt={`Image of ${item.Name}`}
                                    style={{ maxHeight: '580px', objectFit: 'cover' }}
                                    />
                                </Carousel.Item>
                                ));
                            })()}
                        </Carousel>
                        
                        
                        
                        
                        
                        <div className="card-body">
                        <h5 className="card-title">{item.Name}</h5>
                        <p className="card-text">Price: ₹{item.Price}</p>
                        <button className="btn btn-sm btn-warning" onClick={() => handleEditClick(item)}>Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.id)}>Delete</button>
                        </div>
                        </div>
                        </div>
                    ))}
                    </div>
                ) : (
                    <p className="text-muted">Not available</p>
                )}
                </div>
            );
        })}
        
        <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
        <Modal.Title>{modalType === 'add' ? 'Add Item' : 'Edit Item'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
            <select
            name="category_id"
            className="form-control mb-2"
            onChange={handleFormChange}
            value={formData.category_id}
            required
            >
            <option value="">Select Category</option>
            {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                {cat.name}
                </option>
            ))}
            </select>
            <input type="text" name="name" placeholder="Name" className="form-control mb-2" onChange={handleFormChange} value={formData.name} required />
            <input type="number" name="price" placeholder="Price" className="form-control mb-2" onChange={handleFormChange} value={formData.price} required />
            <input
                type="file"
                name="image"
                className="form-control mb-2"
                multiple
                ref={fileInputRef}
                onChange={(e) => {
                setFormData((prev) => ({ ...prev, image: Array.from(e.target.files) }));
                }}
                required={modalType === 'add'}
            // required={modalType === 'add'}
            />
            {formData.existingImages.length > 0 && (
                <div className="mb-2 d-flex flex-wrap gap-2">
                    {formData.existingImages.map((img, idx) => (
                    <div key={idx} style={{ position: 'relative' }}>
                        <img
                        src={`http://localhost/uploads/${img}`}
                        alt={`Existing ${idx}`}
                        style={{ height: '100px', width: '100px', objectFit: 'cover', borderRadius: '8px' }}
                        />
                        <button
                        type="button"
                        onClick={() => handleExistingImageDelete(idx)}
                        style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            background: 'rgba(255, 0, 0, 0.7)',
                            border: 'none',
                            color: 'white',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            cursor: 'pointer',
                        }}
                        >
                        &times;
                        </button>
                    </div>
                    ))}
                </div>
            )}

            {formData.image && formData.image.length > 0 && (
            <div className="mb-2 d-flex flex-wrap gap-2">
        {formData.image.map((file, idx) => (
        <div key={idx} style={{ position: 'relative' }}>
                <img
                src={URL.createObjectURL(file)}
                alt={`Preview ${idx}`}
                style={{ height: '100px', width: '100px', objectFit: 'cover', borderRadius: '8px' }}
                />
                <button
                type="button"
                onClick={() => handleImageDelete(idx)}
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    background: 'rgba(255, 0, 0, 0.7)',
                    border: 'none',
                    color: 'white',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    cursor: 'pointer',
                }}
                >
                &times;
                </button>
            </div>
            ))}
        </div>
    )}


       
        
        <Button type="submit" variant="success">{modalType === 'add' ? 'Add Item' : 'Update Item'}</Button>
        </form>
        </Modal.Body>
        </Modal>
        </div>
    );
}

export default AnimalCategory;