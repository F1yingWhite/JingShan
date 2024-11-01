import { get } from "@/lib/axios";

export function getPdf(pdf_type: string, pdf_id: number, page: number) {
    return get(`/pdf/?pdf_type=${pdf_type}&pdf_id=${pdf_id}&page=${page}`);
}

export function getPdfLength(pdf_type: string, pdf_id: number) {
    return get(`/pdf/length/?pdf_type=${pdf_type}&pdf_id=${pdf_id}`);
}