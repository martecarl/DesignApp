import React, { useState } from 'react';
import axios from 'axios';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import { Button, Typography, ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import './imageclassifiers.css'; // Import the CSS file

const theme = createTheme({
  typography: {
    fontFamily: [
      'Poppins',
      'sans-serif',
    ].join(','),
  },
});

const YOLOPrediction = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [predictionResult, setPredictionResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const predictImage = async () => {
    if (!selectedFile) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await axios.post('http://localhost:8000/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const prediction = response.data;
      const predictedClass = prediction.class;
      const confidence = (prediction.confidence * 100).toFixed(2);
      const resultText = `Predicted Class: ${predictedClass}\nConfidence: ${confidence}%`;
      setPredictionResult(resultText);
    } catch (error) {
      console.error('Error predicting image:', error);
      setPredictionResult(`Error during prediction:\n${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="container">
        <div className="contentContainer">
          <div className="formContainer">
            <div className="formHeaderContainer">
              <Typography variant="button" className="formHeader">YOLO Image Classification</Typography>
            </div>

            <div className="formContentContainer">
              <div className="buttonContainer">
                <label htmlFor="fileInput" className="chooseFileButton">
                  Choose File
                </label>
                <input type="file" id="fileInput" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                
                <Button onClick={predictImage} disabled={!selectedFile || loading} variant="contained" className="predictButton">Predict</Button>
                <Link to="/" className="link">
                <Button variant="contained" className="homeButton">Go to Home</Button>
                </Link>

              </div>
              <div className="outputContainer">
                {selectedFile && <img src={URL.createObjectURL(selectedFile)} alt="Uploaded Image" className="image" />}
              </div>
              <Typography variant="body1" className="outputText">Identified Skin Disease:</Typography>
              {loading && <p>Predicting...</p>}
              {predictionResult && <p>{predictionResult}</p>}
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default YOLOPrediction;
