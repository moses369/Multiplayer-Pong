import React, { useRef, useEffect } from "react";

const useScreenSize = (paddle?: React.RefObject<HTMLDivElement>) => {
  const screenSize = useRef<number>(0);
  const paddleHeightHalf = useRef<number>(0);
  const getScreenSize = () => {
    let vh = window.innerHeight;
    console.log("viewport");
    document.documentElement.style.setProperty("--screen-size", `${vh}px`);
    screenSize.current = vh;
    if (paddle?.current) {
      paddleHeightHalf.current =
        paddle.current.getBoundingClientRect().height / 2 + 4;
    }
  };
  useEffect(() => {
    getScreenSize();
    window.addEventListener("resize", getScreenSize);
    return () => {
      window.removeEventListener("resize", getScreenSize);
    };
  }, []);
  return { viewportHeight: screenSize, paddleHeightHalf };
};

export default useScreenSize;
