import { useState, useEffect } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import io from "socket.io-client";

const socket = io("https://13.233.225.40.nip.io/", {
  transports: ["websocket"],
});

function App() {
  const [file, setFile] = useState<any>(null);
  const [jobId, setJobId] = useState(null);
  const [flipbookUrl, setFlipbookUrl] = useState(null);
  const [sent, setSent] = useState(false);
  const onDrop = (acceptedFiles: any) => {
    if (acceptedFiles && acceptedFiles.length) {
      const video = acceptedFiles[0];
      const videoElement = document.createElement("video");

      videoElement.preload = "metadata";
      videoElement.onloadedmetadata = function () {
        window.URL.revokeObjectURL(videoElement.src);
        if (videoElement.videoWidth > videoElement.videoHeight) {
          setFile(video);
        } else {
          alert("Please upload a landscape video.");
        }
      };
      videoElement.src = URL.createObjectURL(video);
    }
  };

  useEffect(() => {
    socket.on("zipReady", ({ url }) => {
      setFlipbookUrl(url);
      setSent(false);
    });
  }, [jobId]);

  const handleUpload = async () => {
    setSent(true);
    const formData = new FormData();
    formData.append("video", file);

    try {
      const response = await axios.post(
        "https://13.233.225.40.nip.io/flipbook?count=40",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          params: {
            socketId: socket.id,
          },
        }
      );

      setJobId(response.data.jobId);
    } catch (error) {
      console.error("Error occurred during upload:", error);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <img
        src="https://www.gokapture.com/img/gokapture/favicon.png"
        className="h-20 flex self-center"
      />
      <div className="w-full max-w-4xl flex justify-center items-center flex-col">
        {!file && (
          <div
            {...getRootProps()}
            className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col items-center justify-center border-2 border-dashed border-gray-400 cursor-pointer max-w-xs"
          >
            <input {...getInputProps()} />
            <p className="text-gray-700 text-center">
              Drag 'n' drop a video file here, or click to select a file
            </p>
          </div>
        )}
        {file && (
          <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col items-center justify-center space-y-4">
            <video
              controls
              src={URL.createObjectURL(file)}
              className="w-full rounded-xl shadow-lg"
            />
            <p className="text-gray-700 text-center">{file.name}</p>
          </div>
        )}

        <div className="flex justify-center space-x-4">
          {!flipbookUrl && file && !sent && (
            <button
              onClick={handleUpload}
              className="bg-black hover:bg-black-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
            >
              Upload
            </button>
          )}
          {sent && (
            <h1 className="text-center text-xl text-medium">Processing...</h1>
          )}
        
          {flipbookUrl && (
            <button
              onClick={() => {
                window.open(flipbookUrl, "_blank");
              }}
              className="text-white px-10 py-2 rounded-md bg-black hover:bg-black mt-4"
            >
              Download
            </button>
          )}
          {
            flipbookUrl && <button
            onClick={()=>{
              setFile(null);
              setFlipbookUrl(null);
              setSent(false);
              setJobId(null)
            }}
            className="text-white px-10 py-2 rounded-md bg-red-500 hover:bg-red-600 mt-4"
          >
            Reset
          </button>
          }
        </div>
      </div>
    </div>
  );
}

export default App;
