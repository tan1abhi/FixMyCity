import gradio as gr
from fastapi import FastAPI
from gradio_ui import demo
import uvicorn
from fastapi.responses import Response

app = FastAPI()


@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return Response(status_code=204)  # No Content

@app.get("/")
def home():
    return {"message": "Gradio UI is running at /gradio"}

app = gr.mount_gradio_app(app, demo, path="/gradio")

if __name__ == "__main__":
    # Run FastAPI on all network interfaces for deployment
    uvicorn.run("run:app", host="0.0.0.0", port=8000, reload=True)

