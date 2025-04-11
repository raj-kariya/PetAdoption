// App.jsx
import React, { useState,useEffect } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import 'bootstrap/dist/css/bootstrap.min.css';
import AnimalCategory from './Components/AnimalCategory';

function App() {
  const [index, setIndex] = useState(0);
  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };
  const [data, setData] = useState([]);
  const[animalData , setAnimalData] = useState([]);
  useEffect(() => {
    fetch('http://localhost/images.php')
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error('Error fetching data:', err));
  }, []);
  return (
    <>
      <h1>Animal Adoption Website</h1>
      <Carousel activeIndex={index} onSelect={handleSelect}>
        {data.map((slide, i) => (
          <Carousel.Item key={i}>
            <img
              className="d-block w-100"
              src={slide.image}
              alt={slide.altText}
              style={{ width: '500px', height: '800px', objectFit: 'cover' }}
            />
          </Carousel.Item>
        ))}
      </Carousel>
      <AnimalCategory/>
    </>
  );
}

export default App;