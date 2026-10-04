from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_qdrant import QdrantVectorStore
from dotenv import load_dotenv
import time
import os

load_dotenv()

pdfPath = "Backend/cyberSecurity.pdf"

loader = PyPDFLoader(pdfPath)
documents = loader.load()

textSplitter = RecursiveCharacterTextSplitter(
    chunk_size=1000, chunk_overlap=400
)

chunks = textSplitter.split_documents(documents)

print(f"Number of chunks: {len(chunks)}")

embeddings = GoogleGenerativeAIEmbeddings(
    model="gemini-embedding-2-preview",
    google_api_key=os.getenv("GEMINI_API_KEY")
)

# for more than 80 chunks, add a delay to avoid rate limiting of embeddings API

batch_size = 80
firstBatch = chunks[:batch_size]

vectorStore = QdrantVectorStore.from_documents(
    documents=firstBatch,
    embedding=embeddings,
    collection_name="chatpdf",
    url=os.getenv("QDRANT_URL"),
    api_key=os.getenv("QDRANT_API_KEY"),
    timeout=60
)

for i in range(batch_size, len(chunks), batch_size):
    time.sleep(60)
    nextBatch = chunks[i:i + batch_size]
    print(f"Uploading next batch ({i} to {i + len(nextBatch)})...")
    vectorStore.add_documents(documents=nextBatch)
