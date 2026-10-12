
from sqlalchemy import MetaData
from sqlalchemy.ext.automap import automap_base

from database.connection import engine

# All existing PostgreSQL tables
TABLE_NAMES = (
    "roles",
    "users",
    "benefit_categories",
    "benefit_master",
    "plans",
    "plan_versions",
    "documents",
    "extractions",
    "extracted_values",
    "plan_benefits",
    "plan_options",
    "option_benefits",
    "validation_rules",
    "validation_results",
    "exceptions",
    "pricing",
    "underwriting",
    "underwriting_notes",
    "sales_approvals",
    "sales_approval_history",
    "audit_logs",
    "benefit_dictionary_versions",
    "benefit_dictionary_entries",
    "benefit_dictionary_aliases",
    "validation_runs",
    "renewals",
)

# Read the existing database structure
metadata = MetaData()

metadata.reflect(
    bind=engine,
    schema="public",
    only=TABLE_NAMES
)

# Generate ORM models from PostgreSQL tables
Base = automap_base(metadata=metadata)
Base.prepare()

# User and Role models
Role = Base.classes.roles
User = Base.classes.users

# Benefit models
BenefitCategory = Base.classes.benefit_categories
BenefitMaster = Base.classes.benefit_master

# Plan models
Plan = Base.classes.plans
PlanVersion = Base.classes.plan_versions

# Document and extraction models
Document = Base.classes.documents
Extraction = Base.classes.extractions
ExtractedValue = Base.classes.extracted_values

# Plan benefit and option models
PlanBenefit = Base.classes.plan_benefits
PlanOption = Base.classes.plan_options
OptionBenefit = Base.classes.option_benefits

# Validation models
ValidationRule = Base.classes.validation_rules
ValidationResult = Base.classes.validation_results
ValidationRun = Base.classes.validation_runs

# Exception model
ExceptionRecord = Base.classes.exceptions

# Pricing and underwriting models
Pricing = Base.classes.pricing
Underwriting = Base.classes.underwriting
UnderwritingNote = Base.classes.underwriting_notes

# Sales approval models
SalesApproval = Base.classes.sales_approvals
SalesApprovalHistory = Base.classes.sales_approval_history

# Audit model
AuditLog = Base.classes.audit_logs

# Benefit dictionary models
BenefitDictionaryVersion = Base.classes.benefit_dictionary_versions
BenefitDictionaryEntry = Base.classes.benefit_dictionary_entries
BenefitDictionaryAlias = Base.classes.benefit_dictionary_aliases

# Renewal model
Renewal = Base.classes.renewals
