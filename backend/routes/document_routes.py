
import hashlib
import uuid
from pathlib import Path

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile
)
from sqlalchemy import select
from sqlalchemy.orm import Session

from database.connection import get_db
from models.models import Document, Plan, PlanVersion
from schemas.document import DocumentResponse


router = APIRouter(
    prefix="/api/documents",
    tags=["Documents"]
)

# Folder for uploaded documents
BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads" / "documents"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Supported document types
ALLOWED_EXTENSIONS = {
    ".pdf", ".docx", ".doc", ".xlsx", ".xls"
}

MAX_FILE_SIZE = 20 * 1024 * 1024


# -----------------------------------------
# 1. UPLOAD DOCUMENT
# -----------------------------------------
@router.post(
    "/upload",
    response_model=DocumentResponse,
    status_code=201
)
def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Get original filename safely
    original_filename = Path(
        (file.filename or "").replace("\\", "/")
    ).name

    extension = Path(original_filename).suffix.lower()

    # Validate file extension
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only PDF, Word and Excel files are allowed"
        )

    # Generate unique filename
    stored_file_name = f"{uuid.uuid4().hex}{extension}"
    file_path = UPLOAD_DIR / stored_file_name

    file_size = 0
    checksum = hashlib.sha256()

    try:
        # Step 1: Save uploaded file
        with file_path.open("wb") as destination:
            while True:
                chunk = file.file.read(1024 * 1024)

                if not chunk:
                    break

                file_size += len(chunk)

                if file_size > MAX_FILE_SIZE:
                    raise HTTPException(
                        status_code=413,
                        detail="Maximum file size is 20 MB"
                    )

                checksum.update(chunk)
                destination.write(chunk)

        if file_size == 0:
            raise HTTPException(
                status_code=400,
                detail="Cannot upload an empty file"
            )

        # Step 2: Create Plan automatically
        plan = Plan(
            plan_name=Path(original_filename).stem,
            client_name="Pending Identification",
            status="Draft",
            created_by=None,
            updated_by=None
        )

        db.add(plan)
        db.flush()

        # PostgreSQL generates this ID
        plan_id = plan.plan_id

        # Step 3: Create Plan Version automatically
        plan_version = PlanVersion(
            plan_id=plan_id,
            version_number=1,
            version_status="Draft",
            change_summary="Initial document upload",
            created_by=None
        )

        db.add(plan_version)
        db.flush()

        # PostgreSQL generates this ID
        version_id = plan_version.version_id

        # Step 4: Save document information
        document = Document(
            plan_id=plan_id,
            version_id=version_id,
            original_file_name=original_filename,
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

        # Step 5: Save all three records
        db.commit()
        db.refresh(document)

        return document

    except HTTPException:
        db.rollback()
        file_path.unlink(missing_ok=True)
        raise

    except Exception:
        db.rollback()
        file_path.unlink(missing_ok=True)
        raise

    finally:
        file.file.close()


# -----------------------------------------
# 2. GET ALL DOCUMENTS
# -----------------------------------------
@router.get(
    "",
    response_model=list[DocumentResponse]
)
def get_documents(
    db: Session = Depends(get_db)
):
    documents = db.scalars(
        select(Document).order_by(
            Document.document_id.desc()
        )
    ).all()

    return documents


# -----------------------------------------
# 3. GET DOCUMENT BY ID
# -----------------------------------------
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
