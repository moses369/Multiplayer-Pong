import React, { useRef, useEffect } from "react";

const useScreenSize = () => {
  const screenSize = useRef<number>(0);
  const getScreenSize = () => {
    let vh = window.innerHeight;
    console.log('viewport');
    
    document.documentElement.style.setProperty("--screen-size", `${vh}px`);
    screenSize.current = vh;
  };
  useEffect(() => {
    getScreenSize()
    window.addEventListener("resize", getScreenSize);
    return () => {
      window.removeEventListener("resize", getScreenSize);
    };
  }, []);
  return screenSize;
};

export default useScreenSize;
