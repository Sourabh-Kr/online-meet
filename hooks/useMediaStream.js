import { useEffect, useRef, useState } from "react";

const useMediaStream = () => {
  const [state, setState] = useState(null);
  const isStream = useRef(false);
  useEffect(() => {
    if (isStream.current) return;
    isStream.current = true;
    (async function init() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        console.log("setting the stream");
        setState(stream);
      } catch (e) {
        console.error("error in generating stream");
      }
    })();
  }, []);

  return { stream: state };
};

export default useMediaStream;
