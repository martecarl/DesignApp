import signal
import io
import numpy as np
import tensorflow as tf
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import uvicorn
from typing import Tuple
from threading import Thread
from torchvision import transforms
from ultralytics import YOLO

app_resnet = FastAPI()
app_cnn = FastAPI()
app_nlp = FastAPI()
app_yolo = FastAPI()

# Enable CORS for both applications
origins = [
    "http://localhost:3000",
    "localhost:3000"
]

app_resnet.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app_cnn.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app_yolo.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app_nlp.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Load ResNet model and class names
model_resnet = tf.keras.models.load_model('G:/MAPUA/124/SKID_final/skid-app/src/Models/classifier_resnet_model.keras')
class_names_resnet = ['Ba-impetigo','VI-chickenpox', 'VI-shingles']

# Load CNN model and class names
model_cnn = tf.keras.models.load_model('G:/MAPUA/124/SKID_final/skid-app/src/Models/model.h5')
class_names_cnn = ['Melanocytic nevi', 'Melanoma', 'Basal cell carcinoma', 'Actinic keratoses', 'Vascular lesions', 'Dermatofibroma', 'Benign keratosis-like lesions']

# Load YOLO model and class names
model_yolo = YOLO('G:/MAPUA/124/SKID_final/skid-app/src/Models/best.pt')
class_names_YOLO = ['Measles', 'Chickenpox', 'Monkeypox', 'Normal']

def read_image_file(data) -> Tuple[np.array, Tuple[int,int]]:
    img = Image.open(io.BytesIO(data)).convert('RGB')
    img_resized = img.resize((244,244), resample=Image.BICUBIC)
    image = np.array(img_resized)
    return image, img_resized.size

@app_resnet.post("/predict")
async def resnet_predict(file:UploadFile = File(...)):
    try:
        image, img_size = read_image_file(await file.read())
        img_batch = np.expand_dims(image, 0)
        predictions= model_resnet.predict(img_batch)
        predicted_class=class_names_resnet[np.argmax(predictions[0])]
        confidence=np.max(predictions[0])
        
        return {'class':predicted_class,'confidence': float(confidence)}
    
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))
        
@app_cnn.post("/predict")
async def cnn_predict(file: UploadFile = File(...)):
    try:
        img = Image.open(io.BytesIO(await file.read())).convert("RGB")
        img = img.resize((125, 100))
        img_array = np.array(img) / 255.0  
        img_array = np.expand_dims(img_array, axis=0)  
        
        predictions = model_cnn.predict(img_array)
        predicted_class_index = np.argmax(predictions)

        if predicted_class_index < len(class_names_cnn):
            predicted_class_name = class_names_cnn[predicted_class_index]
            prediction_accuracy = float(predictions[0][predicted_class_index]) * 1
        else:
            predicted_class_name = "Unknown"
            prediction_accuracy = 0.0
        
        return {"class": predicted_class_name, "confidence": prediction_accuracy}
    
    except Exception as e:
        error_message = f"An error occurred during prediction: {str(e)}"
        raise HTTPException(status_code=500, detail=error_message)
    
@app_yolo.post("/predict")
async def yolo_predict(file: UploadFile = File(...)):
    try:
        # Upload the image
        img = Image.open(io.BytesIO(await file.read())).convert("RGB")
     
        # Predict the class
        results = model_yolo.predict(img)
        names_dict = results[0].names
        probs = results[0].probs.data.tolist()
       
        max_prob_index = np.argmax(probs)
        predicted_disease = names_dict[max_prob_index]
        confidence_level = probs[max_prob_index]
        return {"class": predicted_disease, "confidence": confidence_level}
    
    except Exception as e:
        error_message = f"An error occurred during prediction: {str(e)}"
        raise HTTPException(status_code=500, detail=error_message)

def run_server(app, port):
    uvicorn.run(app, host="127.0.0.1", port=port)

if __name__ == "__main__":
    # Define functions to start each FastAPI application
    def run_yolo():
        run_server(app_yolo, 7000)

    def run_resnet():
        run_server(app_resnet, 9000)

    def run_cnn():
        run_server(app_cnn, 8000)

    # Create separate threads for each FastAPI application
    resnet_thread = Thread(target=run_resnet)
    cnn_thread = Thread(target=run_cnn)
    yolo_thread = Thread(target=run_yolo)

    # Start all threads concurrently
    resnet_thread.start()
    cnn_thread.start()
    yolo_thread.start()

    # Define signal handler to stop servers
    def signal_handler(sig, frame):
        print('Stopping servers...')
        resnet_thread.join()
        cnn_thread.join()
        yolo_thread.join()
        print('Servers stopped.')
        exit(0)

    # Set signal handler for Ctrl+C
    signal.signal(signal.SIGINT, signal_handler)
    print('Press Ctrl+C to stop the servers.')

    # Wait for all threads to finish
    resnet_thread.join()
    cnn_thread.join()
    yolo_thread.join()