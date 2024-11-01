import base64
import io
import pathlib
from typing import Literal

from fastapi import APIRouter, HTTPException
from pdf2image import convert_from_path
from pypdf import PdfReader

from . import ResponseModel

pdf_router = APIRouter(prefix="/pdf")

COLOPHON_PDF_PATH = "./assets/jingshan_scripture_colophon"
PREFACE_AND_POSTSCRIPT_PDF_PATH = "./assets/jingshan_scripture_preface_and_postscript"


@pdf_router.get("/")
async def get_pdf(pdf_type: Literal["colophon", "preface_and_postscript"], pdf_id: int, page: int):
    if pdf_type == "colophon":
        pdf_prefix = COLOPHON_PDF_PATH
    elif pdf_type == "preface_and_postscript":
        pdf_prefix = PREFACE_AND_POSTSCRIPT_PDF_PATH
    else:
        raise HTTPException(status_code=400, detail="pdf_type must be 'colophon' or 'preface_and_postscript'")

    pdf_path = f"{pdf_prefix}/{pdf_id:03}.pdf"
    if not pathlib.Path(pdf_path).exists():
        raise HTTPException(status_code=404, detail="pdf not found")

    pdf_reader = PdfReader(pdf_path)

    if page < 0 or page >= len(pdf_reader.pages):
        raise HTTPException(status_code=400, detail="Invalid page number")

    images = convert_from_path(pdf_path, first_page=page + 1, last_page=page + 1)
    if not images:
        raise HTTPException(status_code=500, detail="Failed to convert PDF page to image")

    # 将图像编码为 Base64
    buffered = io.BytesIO()
    images[0].save(buffered, format="JPEG")
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")

    return ResponseModel(data={"image": img_str})


@pdf_router.get("/length")
async def get_pdf_length(pdf_type: Literal["colophon", "preface_and_postscript"], pdf_id: int):
    if pdf_type == "colophon":
        pdf_prefix = COLOPHON_PDF_PATH
    elif pdf_type == "preface_and_postscript":
        pdf_prefix = PREFACE_AND_POSTSCRIPT_PDF_PATH
    else:
        raise HTTPException(status_code=400, detail="pdf_type must be 'colophon' or 'preface_and_postscript'")

    pdf_path = f"{pdf_prefix}/{pdf_id:03}.pdf"
    if not pathlib.Path(pdf_path).exists():
        raise HTTPException(status_code=404, detail="pdf not found")

    pdf_reader = PdfReader(pdf_path)

    return ResponseModel(data={"length": len(pdf_reader.pages)})
