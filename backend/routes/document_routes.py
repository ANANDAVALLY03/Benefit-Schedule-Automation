
import hashlib
import uuid
from pathlib import Path

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile
)
from sqlalchemy.orm import Session
from sqlalchemy import select

from database.connection import get_db
from models.models import Document, Plan, PlanVersion
from schemas.document import DocumentResponse


router = APIRouter(
    prefix="/api/documents",
    tags=["Documents"]
)

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads" / "documents"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {
    ".pdf", ".docx", ".doc", ".xlsx", ".xls"
}

MAX_FILE_SIZE = 20 * 1024 * 1024


@router.post(
    "/upload",
    response_model=DocumentResponse,
    status_code=201
)
def upload_document(
    plan_id: int = Form(...),
    version_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    extension = Path(file.filename or "").suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format"
        )

    plan = db.get(Plan, plan_id)

    if not plan:
        raise HTTPException(
            status_code=404,
            detail="Plan not found"
        )

    version = db.get(PlanVersion, version_id)

    if not version:
        raise HTTPException(
            status_code=404,
            detail="Plan version not found"
        )

    if version.plan_id != plan_id:
        raise HTTPException(
            status_code=400,
            detail="Version does not belong to this plan"
        )

    stored_file_name = f"{uuid.uuid4().hex}{extension}"
    file_path = UPLOAD_DIR / stored_file_name

    file_size = 0
    checksum = hashlib.sha256()

    try:
        with file_path.open("wb") as destination:
            while chunk := file.file.read(1024 * 1024):
                file_size += len(chunk)

                if file_size > MAX_FILE_SIZE:
                    raise HTTPException(
                        status_code=413,
                        detail="Maximum file size is 20 MB"
                    )

                checksum.update(chunk)
                destination.write(chunk)

        document = Document(
            plan_id=plan_id,
            version_id=version_id,
            original_file_name=Path(
                file.filename or stored_file_name
            ).name,
            stored_file_name=stored_file_name,
            file_path=str(file_path),
            file_type=extension,
            file_size=file_size,
            status="Uploaded",
            uploaded_by=None,
            sha256=checksum.hexdigest(),
            extracted_text=None
        )

        db.add(document)
        db.commit()
        db.refresh(document)

        return document

    except Exception:
        db.rollback()
        file_path.unlink(missing_ok=True)
        raise

    finally:
        file.file.close()


@router.get(
    "",
    response_model=list[DocumentResponse]
)
def get_documents(
    db: Session = Depends(get_db)
):
    return db.scalars(
        select(Document).order_by(
            Document.document_id.desc()
        )
    ).all()


@router.get(
    "/{document_id}",
    response_model=DocumentResponse
)
def get_document(
    document_id: int,
    db: Session = Depends(get_db)
):
    document = db.get(Document, document_id)

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    return document
