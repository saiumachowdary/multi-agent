from fastapi import FastAPI, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from app.auth import router as auth_router, get_current_user
from app.workflow import run_step_workflow

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)

@app.post("/api/run-step")
async def run_step(
    step: str = Body(...),
    input_data: dict = Body(...),
    user_feedback: str = Body(None),  # Optional feedback for refinement
    user=Depends(get_current_user)
):
    result = run_step_workflow(step, input_data, user_feedback)
    return result
