import os
import json
import shutil
import asyncio
import uvicorn
import tempfile
from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile
from langchain_qdrant import QdrantVectorStore
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings

load_dotenv()

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
    

            with tempfile.NamedTemporaryFile(delete=False,suffix=".pdf") as tempPdf:
                shutil.copyfileobj(file.file, tempPdf)
                tempFilePath = tempPdf.name

            yield json.dumps({"status": "Reading PDF pages..."}) + "\n"
            await asyncio.sleep(0.1)

            
            loader = PyPDFLoader(tempFilePath)
            documents = loader.load()

            yield json.dumps({"status": "Splitting into chunks..."}) + "\n"
            await asyncio.sleep(0.1)

            # pages = loader.load_and_split()
            textSplitter = RecursiveCharacterTextSplitter(
                chunk_size=1000, chunk_overlap=400
            )
            chunks = textSplitter.split_documents(documents)
            # chunks = textSplitter.split_documents(pages)
            print(f"Loaded {len(chunks)} chunks from the PDF.")

            yield json.dumps({"status": "Making embeddings..."}) + "\n"
            await asyncio.sleep(0.1)

            embeddings = FastEmbedEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

            vectorStore = QdrantVectorStore.from_documents(
                documents=chunks,
                embedding=embeddings,
                collection_name="chatpdf",
                url=os.getenv("QDRANT_URL"),
                api_key=os.getenv("QDRANT_API_KEY"),
                timeout=60
            )


            yield json.dumps({
                "status": "Done!", 
                "complete": True,
                "chunks_created": len(chunks)
            }) + "\n"

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