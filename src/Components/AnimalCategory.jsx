import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function AnimalCategory() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [editFormData, setEditFormData] = useState({
    id: '',
    name: '',
    price: '',
    category_id: '',
    image: null,
  });
  const [showFormCatId, setShowFormCatId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: null,
    category_id: ''
  });

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
      [name]: type === 'file' ? files[0] : value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('price', formData.price);
    data.append('category_id', formData.category_id);
    data.append('image', formData.image);
  
    fetch('http://localhost/animals.php?action=add_item', {
      method: 'POST',
      body: data
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('Item added!');
          setShowFormCatId(null);
          fetchData();
        } else {
          alert(data.error || 'Failed to add item');
        }
      })
      .catch(err => console.error('Error submitting form:', err));
  };
  

  const handleEditClick = (item) => {
    setEditingItem(item.id);
    setEditFormData({
      id: item.id,
      name: item.Name,
      price: item.Price,
      category_id: item.Category_id,
      image: null, 
    });
  };

  const handleEditChange = (e) => {
    const { name, value, type, files } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append('id', editFormData.id);
    data.append('name', editFormData.name);
    data.append('price', editFormData.price);
    data.append('category_id', editFormData.category_id);
    if (editFormData.image) {
      data.append('image', editFormData.image);
    }

    fetch('http://localhost/animals.php?action=edit_item', {
      method: 'POST',
      body: data
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('Item updated!');
          setEditingItem(null);
          fetchData();
        } else {
          alert(data.error || 'Failed to update item');
        }
      })
      .catch(err => console.error('Error updating item:', err));
  };

  const handleDelete = (id) => {
    if(!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }
    const formData1 = new FormData();
    formData1.append('id', id);
    fetch('http://localhost/animals.php?action=delete_item', {
      method: 'POST',
      body: formData1
    }).then(res => res.json())
    .then(data => {
      if (data.success) {
        alert('Item deleted!');
        // setEditingItem(null);
        fetchData();
      } else {
        alert(data.error || 'Failed to delete item');
      }
    })
    .catch(err => console.error('Error deleting item:', err));
  }

  return (
    <div className="container mt-4">
      {categories.length === 0 && <p>Loading categories...</p>}
      {categories.map((category) => {
        const categoryItems = getItemsForCategory(category.id);
        return (
          <div key={category.id} className="mb-4">
            <h2>{category.name}</h2>
            <button className='btn btn-primary mb-2'onClick={() => {
  if (showFormCatId === category.id) {
    setShowFormCatId(null);
    setFormData({
      name: '',
      price: '',
      image: null,
      category_id: ''
    });
  } else {
    setShowFormCatId(category.id);
    setFormData(prev => ({
      ...prev,
      category_id: category.id // ✅ Set this manually
    }));
  }
}}>{category.id === showFormCatId ? 'Close Form' : 'Add Item'} </button>
            {categoryItems.length > 0 ? (
              <div className="row row-cols-1 row-cols-md-3 g-4">
                {categoryItems.map(item => (
                  <div key={item.id} className="col">
                    <div className="card h-100">
                      <img src={`http://localhost/uploads/${item.Image}`} className="card-img-top" alt={item.Name} />
                      <div className="card-body">
                        <h5 className="card-title">{item.Name}</h5>
                        <p className="card-text">Price: ₹{item.Price}</p>
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={() => handleEditClick(item)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">Not available</p>
            )}

            {showFormCatId === category.id && (
              <form onSubmit={handleSubmit} encType="multipart/form-data" className="mb-3">
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  className="form-control mb-2"
                  onChange={handleFormChange}
                  required
                />
                <input
                  type="number"
                  name="price"
                  placeholder="Price"
                  className="form-control mb-2"
                  onChange={handleFormChange}
                  required
                />
                <input
                  type="file"
                  name="image"
                  className="form-control mb-2"
                  onChange={handleFormChange}
                  required
                />
                <input
                  type="hidden"
                  name="category_id"
                  value={category.id}
                  onChange={handleFormChange}
                />
                <button type="submit" className="btn btn-success me-2">Add Item</button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowFormCatId(null)}
                >
                  Cancel
                </button>
              </form>
            )}







            {editingItem && editFormData.category_id === category.id.toString() && (
              <form onSubmit={handleEditSubmit} className="mt-3" encType="multipart/form-data">
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  placeholder="Name"
                  className="form-control mb-2"
                  onChange={handleEditChange}
                  required
                />
                <input
                  type="number"
                  name="price"
                  value={editFormData.price}
                  placeholder="Price"
                  className="form-control mb-2"
                  onChange={handleEditChange}
                  required
                />
                <input
                  type="file"
                  name="image"
                  className="form-control mb-2"
                  onChange={handleEditChange}
                />
                <button type="submit" className="btn btn-success">Update Item</button>
                <button className="btn btn-success" onClick={() => setEditingItem(null)}>Close</button>
              </form>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default AnimalCategory;