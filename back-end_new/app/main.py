from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .server.middlewares.response_middleware import ResponseMiddleware
from .server.service.colophon_service import colophon_router
from .server.service.individual import individual_router
from .server.service.preface_and_postscript_service import preface_and_postscript_router
from .server.service.story_service import story_router

app = FastAPI()


# app.add_middleware(ResponseMiddleware)

main_router = APIRouter(prefix="/api")
main_router.include_router(colophon_router)
main_router.include_router(story_router)
main_router.include_router(preface_and_postscript_router)
main_router.include_router(individual_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(main_router)
