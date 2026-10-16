import os
import json
import shutil
import asyncio
import uvicorn
import tempfile
from openai import OpenAI
from pydantic import BaseModel
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.http import models as rest
from langchain_qdrant import QdrantVectorStore
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, File, UploadFile,Form
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

client = OpenAI(
    api_key=os.getenv("GEMINI_API_KEY"),
    base_url="https://generativelanguage.googleapis.com/v1beta/"
)

class ChatRequest(BaseModel):
    question: str
    conversation_id: str

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/upload")
async def catch_file(
    file: UploadFile = File(...),
    conversation_id: str = Form(...)
    ):

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
            
            for chunk in chunks:
                chunk.metadata["conversation_id"] = conversation_id
                
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

            q_client = QdrantClient(
                url=os.getenv("QDRANT_URL"),
                api_key=os.getenv("QDRANT_API_KEY")
            )

            q_client.create_payload_index(
                collection_name="chatpdf",
                field_name="metadata.conversation_id",
                field_schema=rest.PayloadSchemaType.KEYWORD,
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

@app.post("/chat")
async def chatWithPdf(request: ChatRequest):
    try:

        question = request.question.strip()

        embeddings = FastEmbedEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

        vector_db = QdrantVectorStore.from_existing_collection(
            embedding=embeddings,
            collection_name="chatpdf",
            url=os.getenv("QDRANT_URL"),
            api_key=os.getenv("QDRANT_API_KEY")
        )

        
        # searchResult = vector_db.similarity_search(query=question)
        searchResult = vector_db.similarity_search(
            query=question,
            filter=rest.Filter(
                must=[
                    rest.FieldCondition(
                        key="metadata.conversation_id",
                        match=rest.MatchValue(value=request.conversation_id),
                    )
                ]
            )
        )
        context = "\n\n\n".join([f"Page Content: {result.page_content}\nPage Number: {result.metadata['page_label']}\nFile Location: {result.metadata['source']}" for result in searchResult])


        SYSTEM_PROMPT = f"""
        You are a helpfull AI Assistant who answers user query based on the available context retrieved from a PDF file along with page_contents and page number.

        You should only answer the user based on the following context and navigate the user to open the right page number to know more.

        You should give good formatted markdown response with new lines, small or big headings based on markdown, numbers in lists, and proper line breaks, code blocks, tables, and lists if needed. You should not answer the user based on your own knowledge or any other source of information. You should only answer based on the context provided below.

        Context:
        {context}
        """

        
        response = client.chat.completions.create(
            model="gemini-3.5-flash-lite",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": question}
            ]
        )

        return {"answer": response.choices[0].message.content}

    except Exception as e:
        print(f"Error during chat: {e}")
        return {"error": "Failed to process chat request"}









if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)