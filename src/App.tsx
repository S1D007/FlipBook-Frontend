import{ useState, useEffect } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import io from 'socket.io-client';

const socket = io('https://3.108.221.222.nip.io',{
  transports: ['websocket'],
});

function App() {
  const [file, setFile] = useState<any>(null);
  const [jobId, setJobId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [flipbookUrl, setFlipbookUrl] = useState(null);
  const [sent, setSent] = useState(false);
  const onDrop = (acceptedFiles: any) => {
    setFile(acceptedFiles[0]);
  };

  useEffect(() => {
    socket.on('jobProgress', ({ jobId, progress }) => {
      if (jobId === jobId) {
        setProgress(progress);
      }
    });

    socket.on('zipReady', ({ url }) => {
      setFlipbookUrl(url);
      setSent(false);
    });
  }, [jobId]);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('video', file);

    try {
      const response = await axios.post('https://3.108.221.222.nip.io/flipbook?count=40', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: {
          socketId: socket.id,
        },
      });

      setJobId(response.data.jobId);
      setSent(true);
    } catch (error) {
      console.error('Error occurred during upload:', error);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-xs">
        {
          !file && (
            <div {...getRootProps()} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col items-center justify-center border-2 border-dashed border-gray-400 cursor-pointer">
              <input {...getInputProps()} />
              <p className="text-gray-700 text-center">Drag 'n' drop a video file here, or click to select a file</p>
            </div>
          )
        }
        {
          file && (
            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col items-center justify-center">
              <p className="text-gray-700 text-center">{file.name}</p>
            </div>
          )
        }
        <div className="flex justify-center space-x-4">
          {
            file && !sent && (
              <button
                onClick={handleUpload}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="button"
              >
                Upload
              </button>
            )
          }
          {
            sent && (
              <h1 className="text-center">Processing...</h1>
            )
          }
        </div>
        {progress > 0 && <p className="text-center my-4">Job Progress: {progress}%</p>}
        {flipbookUrl && <p className="text-center my-4">Flipbook URL: {flipbookUrl}</p>}
      </div>
    </div>
  );
}

export default App;
