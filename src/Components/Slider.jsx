import React, { useState, useEffect } from 'react';
import sliderImage from '../Components/sliderImage' 
import Arrow from '../Components/Arrow'; 
import Dots from '../Components/Dots'; 
import SliderContent from './SliderContent';
import "./slider.css";

const len = sliderImage.length - 1;

export function Slider(props) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((activeIndex) => (activeIndex === len ? 0 : activeIndex + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, [activeIndex]);

  return (
    <div className="slider-container">
      <SliderContent activeIndex={activeIndex} sliderImage={sliderImage} />
      <Arrow
        prevSlide={() => setActiveIndex(activeIndex < 1 ? len : activeIndex - 1)}
        nextSlide={() => setActiveIndex(activeIndex === len ? 0 : activeIndex + 1)}
      />
      <Dots
        activeIndex={activeIndex}
        sliderImage={sliderImage}
        onclick={(activeIndex) => setActiveIndex(activeIndex)}
      />
    </div>
  );
}