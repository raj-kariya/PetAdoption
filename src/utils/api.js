export const fetchApi = async (url, options = {}) => {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
};

export const renderImages = (images) => {
    const parsedImages = typeof images === 'string' ? JSON.parse(images) : images;
    const imageArray = Array.isArray(parsedImages) ? parsedImages : [parsedImages];
    return imageArray.map((img, idx) => (
        <Carousel.Item key={idx}>
            <img src={`http://localhost/uploads/${img}`} alt={`Image ${idx}`} className="d-block w-100" style={{ maxHeight: '580px', objectFit: 'cover' }} />
        </Carousel.Item>
    ));
};
