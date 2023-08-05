import { JsxVideoProps } from "../types/jsx";

type WebcamVideoProps = {
  stream: MediaStream | null;
} & JsxVideoProps;
const WebcamVideo = ({ stream, ...props }: WebcamVideoProps) => {
  return (
    <div className="webcam my-2">
      <video
        className="w-100"
        {...props}
        autoPlay
        playsInline
        ref={(video) => {
          if (video && stream) {
            video.srcObject = stream;
            video.play();
          }
        }}
      />
    </div>
  );
};

export default WebcamVideo;
