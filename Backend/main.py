import os
import json
import shutil
import asyncio
import uvicorn
import tempfile
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from langchain_community.document_loaders import PyPDFLoader


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_methods=["*"],
    allow_headers=["*"],  
)


@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/upload")
async def catch_file(file: UploadFile = File(...)):

    if file is None:
        return {"error": "No file uploaded"}
    
    async def progress():
        tempFilePath = None
        try:
            yield json.dumps({"status": "Processing file..."}) + "\n"
            await asyncio.sleep(0.1)
    
            # this load complete file into server ram ... so for large files it is not recommended
            # content = await file.read()
            # print(f"File name: {file.filename}, Size: {len(content)} bytes")

            with tempfile.NamedTemporaryFile(delete=False,suffix=".pdf") as tempPdf:
                shutil.copyfileobj(file.file, tempPdf)
                tempFilePath = tempPdf.name

            yield json.dumps({"status": "Reading PDF pages..."}) + "\n"
            await asyncio.sleep(0.1)

            
            loader = PyPDFLoader(tempFilePath)

            yield json.dumps({"status": "Splitting into chunks..."}) + "\n"
            await asyncio.sleep(0.1)

            pages = loader.load_and_split()
            print(f"Loaded {len(pages)} pages from the PDF.")

            yield json.dumps({
                "status": "Done!", 
                "complete": True,
                "chunks_created": len(pages)
            }) + "\n"

            # return {
            #     "message": "PDF processed successfully!", 
            #     "chunks_created": len(pages)
            # }
        except Exception as e:
            print(f"Error processing PDF: {e}")
            # return {"error": "Failed to process PDF"}
            yield json.dumps({"error": "Failed to process PDF"}) + "\n"

        finally:
            if os.path.exists(tempFilePath):
                os.remove(tempFilePath)
        
    return StreamingResponse(progress(), media_type="application/json")














if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)