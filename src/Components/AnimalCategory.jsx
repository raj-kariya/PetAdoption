import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button } from 'react-bootstrap';

function AnimalCategory() {
    const [categories, setCategories] = useState([]);
    const [items, setItems] = useState([]);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        price: '',
        category_id: '',
        image: null,
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

    const handleFormChange = (e) => {
        const { name, value, type, files } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'file' ? files[0] : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            data.append(key, value);
        });

        const action = modalType === 'add' ? 'add_item' : 'edit_item';
        fetch(`http://localhost/animals.php?action=${action}`, {
            method: 'POST',
            body: data,
        })
            .then(res => res.json())
            .then(result => {
                if (result.success) {
                    alert(`Item ${modalType === 'add' ? 'added' : 'updated'}!`);
                    setShowModal(false);
                    fetchData();
                    setFormData({ id: '', name: '', price: '', category_id: '', image: null });
                } else {
                    alert(result.error || `Failed to ${modalType === 'add' ? 'add' : 'update'} item`);
                }
            })
            .catch(err => console.error(`Error ${modalType === 'add' ? 'adding' : 'updating'} item:`, err));
    };

    const handleEditClick = (item) => {
        setSelectedItem(item);
        setFormData({
            id: item.id,
            name: item.Name,
            price: item.Price,
            category_id: item.Category_id,
            image: null,
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
                                            <img src={`http://localhost/uploads/${item.Image}`} className="card-img-top" alt={item.Name} />
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
                        <input type="text" name="name" placeholder="Name" className="form-control mb-2" onChange={handleFormChange} value={formData.name} required />
                        <input type="number" name="price" placeholder="Price" className="form-control mb-2" onChange={handleFormChange} value={formData.price} required />
                        <input type="file" name="image" className="form-control mb-2" onChange={handleFormChange} />
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

                        <Button type="submit" variant="success">{modalType === 'add' ? 'Add Item' : 'Update Item'}</Button>
                    </form>
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default AnimalCategory;