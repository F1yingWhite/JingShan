from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .server import (
    auth_chat_router,
    auth_colophon_router,
    auth_preface_and_postscript_router,
    auth_user_router,
    chat_router,
    colophon_router,
    hybrid_router,
    individual_router,
    manage_router,
    pdf_router,
    preface_and_postscript_router,
    story_router,
    user_router,
    zang_graph_router,
    zhi_graph_router,
)

app = FastAPI()

main_router = APIRouter(prefix="/api")
main_router.include_router(colophon_router)
main_router.include_router(story_router)
main_router.include_router(preface_and_postscript_router)
main_router.include_router(individual_router)
main_router.include_router(pdf_router)
main_router.include_router(zhi_graph_router)
main_router.include_router(chat_router)
main_router.include_router(auth_chat_router)
main_router.include_router(hybrid_router)
main_router.include_router(zang_graph_router)
main_router.include_router(user_router)
main_router.include_router(auth_user_router)
main_router.include_router(auth_colophon_router)
main_router.include_router(manage_router)
main_router.include_router(auth_preface_and_postscript_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(main_router)
