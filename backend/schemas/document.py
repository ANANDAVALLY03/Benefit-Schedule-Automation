
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class DocumentResponse(BaseModel):
    document_id: int
    plan_id: int
    version_id: int
    original_file_name: str
    stored_file_name: str
    file_path: str
    file_type: str
    file_size: int
    status: str
    uploaded_by: Optional[int] = None
    uploaded_at: datetime
    sha256: Optional[str] = None
    extracted_text: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
