from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .server.service.chat_service import chat_router
from .server.service.colophon_service import colophon_router
from .server.service.graph.graph_zang_service import zang_graph_router
from .server.service.graph.graph_zhi_service import zhi_graph_router
from .server.service.hybrid_service import hybrid_router
from .server.service.individual_service import individual_router
from .server.service.pdf_service import pdf_router
from .server.service.preface_and_postscript_service import preface_and_postscript_router
from .server.service.story_service import story_router
from .server.service.user_service import user_router

app = FastAPI()

main_router = APIRouter(prefix="/api")
main_router.include_router(colophon_router)
main_router.include_router(story_router)
main_router.include_router(preface_and_postscript_router)
main_router.include_router(individual_router)
main_router.include_router(pdf_router)
main_router.include_router(zhi_graph_router)
main_router.include_router(chat_router)
main_router.include_router(hybrid_router)
main_router.include_router(zang_graph_router)
main_router.include_router(user_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(main_router)
