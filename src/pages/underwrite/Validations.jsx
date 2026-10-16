import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronRight, FileText, RefreshCw, Search, XCircle } from "lucide-react";
import { getProjects, getDocuments, getBenefits, validateDocumentBenefits } from "../../services/apis";

const asArray = (data, key) => Array.isArray(data) ? data : Array.isArray(data?.[key]) ? data[key] : [];
const idOf = (item) => item?.id ?? item?.document_id;
const projectIdOf = (item) => item?.project_id ?? item?.projectId ?? item?.project?.id;
const statusOf = (item) => {
  const status = String(item?.validation_status ?? item?.status ?? "Unverified").trim().toLowerCase();
  if (["valid", "verified", "validated", "passed"].includes(status)) return "passed";
  if (["n/a", "na", "not applicable", "excluded"].includes(status)) return "excluded";
  if (["mismatch", "invalid", "conflict", "failed", "error"].includes(status)) return "error";
  return "review";
};
const summaryOf = (items) => {
  const summary = { total: items.length, passed: 0, review: 0, errors: 0, excluded: 0 };
  items.forEach((item) => {
    const status = statusOf(item);
    if (status === "passed") summary.passed++;
    else if (status === "excluded") summary.excluded++;
    else if (status === "error") summary.errors++;
    else summary.review++;
  });
  summary.percent = summary.total ? Math.round(((summary.passed + summary.excluded) / summary.total) * 100) : 0;
  return summary;
};
const projectName = (project) => project?.project_name || project?.name || project?.client_name || `Project ${project?.id}`;
const documentName = (doc) => doc?.original_filename || doc?.filename || doc?.file_name || `Document ${idOf(doc)}`;

export default function Validations() {
  const navigate = useNavigate();
  const location = useLocation();
  const [projects, setProjects] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [benefitsByDocument, setBenefitsByDocument] = useState({});
  const [documentErrors, setDocumentErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [runningId, setRunningId] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [expandedProject, setExpandedProject] = useState(null);
  const [expandedDocument, setExpandedDocument] = useState(null);

  const selectedDocumentId = new URLSearchParams(location.search).get("documentId") || location.state?.documentId || null;
  const load = useCallback(async (initial = false) => {
    if (initial) setLoading(true);
    else setRefreshing(true);
    setError("");
    try {
      const [projectRows, documentRows] = await Promise.all([getProjects(), getDocuments()]);
      const allProjects = asArray(projectRows, "projects");
      const allDocuments = asArray(documentRows, "documents");
      setProjects(allProjects);
      setDocuments(allDocuments);
      const results = await Promise.allSettled(allDocuments.filter(d => idOf(d) != null).map(async (doc) => ({
        id: String(idOf(doc)),
        data: asArray(await getBenefits(idOf(doc)), "benefits"),
      })));
      const byId = {};
      const failures = {};
      results.forEach((result, index) => {
        const doc = allDocuments.filter(d => idOf(d) != null)[index];
        if (result.status === "fulfilled") byId[result.value.id] = result.value.data;
        else failures[String(idOf(doc))] = result.reason?.message || "Unable to load benefits";
      });
      setBenefitsByDocument(byId);
      setDocumentErrors(failures);
      if (selectedDocumentId) {
        const selected = allDocuments.find(d => String(idOf(d)) === String(selectedDocumentId));
        if (selected) {
          setExpandedDocument(String(selectedDocumentId));
          if (projectIdOf(selected) != null) setExpandedProject(String(projectIdOf(selected)));
        }
      }
    } catch (err) {
      setError(err.message || "Unable to load projects and documents.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedDocumentId]);

  useEffect(() => { load(true); }, [load]);
  useEffect(() => {
    const onFocus = () => load(false);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [load]);

  const groupedProjects = useMemo(() => projects.map(project => {
    const projectId = String(project.id ?? project.project_id);
    const docs = documents.filter(doc => String(projectIdOf(doc)) === projectId);
    const benefits = docs.flatMap(doc => benefitsByDocument[String(idOf(doc))] || []);
    return { ...project, projectId, docs, summary: summaryOf(benefits), loadErrors: docs.filter(doc => documentErrors[String(idOf(doc))]).length };
  }), [projects, documents, benefitsByDocument, documentErrors]);
  const filtered = groupedProjects.filter(project => `${projectName(project)} ${project.projectId}`.toLowerCase().includes(search.toLowerCase()));
  const allSummary = summaryOf(Object.values(benefitsByDocument).flat());
  const runValidation = async (documentId) => {
    setRunningId(String(documentId));
    setError("");
    try {
      await validateDocumentBenefits(documentId);
      await load(false);
    } catch (err) {
      setError(err.message || "Validation failed.");
    } finally {
      setRunningId(null);
    }
  };
  const goToExceptions = (documentId, projectId) => navigate(`/underwriter/exceptions?documentId=${encodeURIComponent(documentId)}`, { state: { documentId, projectId } });
  const pill = (label, count, color) => <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${color}`}>{count} {label}</span>;

  return (
    <div className="min-h-[calc(100vh-5rem)] space-y-5 bg-[#F7F5EF] p-4 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-[#12352B]">Project Validations</h1><p className="mt-1 text-sm text-[#60756B]">Review validation results for every project and document.</p></div>
        <button type="button" onClick={() => load(false)} disabled={loading || refreshing} className="flex items-center gap-2 rounded-lg bg-[#1E5A45] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /> Refresh</button>
      </div>
      {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[["Projects", projects.length, "text-[#12352B]"], ["Total Checks", allSummary.total, "text-[#12352B]"], ["Passed", allSummary.passed, "text-green-700"], ["Needs Review", allSummary.review, "text-amber-700"], ["Errors", allSummary.errors, "text-red-700"]].map(([label, value, color]) => <div key={label} className="rounded-xl border border-[#D5E2DA] bg-white p-4"><p className="text-xs text-[#60756B]">{label}</p><p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p></div>)}
      </div>
      <div className="rounded-xl border border-[#D5E2DA] bg-white p-4"><div className="relative"><Search size={17} className="absolute left-3 top-3 text-[#71837B]" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..." className="h-10 w-full rounded-lg border border-[#D5E2DA] pl-10 pr-3 text-sm outline-none focus:border-[#1E5A45]" /></div></div>
      {loading ? <p className="py-12 text-center text-sm text-[#60756B]">Loading projects and validations...</p> : filtered.length === 0 ? <p className="rounded-xl bg-white p-8 text-center text-sm text-[#60756B]">No projects found.</p> : filtered.map(project => {
        const open = expandedProject === project.projectId;
        return <section key={project.projectId} className="overflow-hidden rounded-xl border border-[#D5E2DA] bg-white shadow-sm">
          <button type="button" onClick={() => setExpandedProject(open ? null : project.projectId)} className="flex w-full flex-wrap items-center justify-between gap-3 p-5 text-left hover:bg-[#F2F7F4]">
            <div className="flex items-center gap-3">{open ? <ChevronDown size={19} /> : <ChevronRight size={19} />}<div><h2 className="font-bold text-[#12352B]">{projectName(project)}</h2><p className="text-xs text-[#71837B]">Project ID: {project.projectId} · {project.docs.length} document(s)</p></div></div>
            <div className="flex flex-wrap items-center gap-2">{pill("passed", project.summary.passed, "bg-green-50 text-green-700")}{pill("review", project.summary.review, "bg-amber-50 text-amber-700")}{pill("errors", project.summary.errors, "bg-red-50 text-red-700")}<span className="font-bold text-[#1E5A45]">{project.summary.percent}%</span></div>
          </button>
          <div className="h-1.5 bg-[#E6ECE9]"><div className="h-full bg-[#1E8E68]" style={{ width: `${project.summary.percent}%` }} /></div>
          {open && <div className="space-y-3 border-t border-[#E5ECE8] p-4">
            {project.docs.length === 0 && <p className="text-sm text-[#71837B]">No documents linked to this project.</p>}
            {project.docs.map(doc => {
              const documentId = String(idOf(doc));
              const benefits = benefitsByDocument[documentId] || [];
              const stats = summaryOf(benefits);
              const docOpen = expandedDocument === documentId;
              return <div key={documentId} className="overflow-hidden rounded-lg border border-[#D5E2DA]">
                <button type="button" onClick={() => setExpandedDocument(docOpen ? null : documentId)} className="flex w-full flex-wrap items-center justify-between gap-3 bg-[#FAFCFB] p-4 text-left"><div className="flex items-center gap-2"><FileText size={17} className="text-[#1E5A45]" /><div><p className="text-sm font-semibold text-[#29483D]">{documentName(doc)}</p><p className="text-xs text-[#71837B]">Document ID: {documentId} · {stats.total} benefit(s)</p></div></div><div className="flex items-center gap-2"><span className="text-xs text-[#60756B]">{stats.percent}% complete</span>{docOpen ? <ChevronDown size={17} /> : <ChevronRight size={17} />}</div></button>
                {docOpen && <div className="p-4"><div className="mb-4 flex flex-wrap items-center justify-between gap-2"><div className="flex flex-wrap gap-2">{pill("passed", stats.passed, "bg-green-50 text-green-700")}{pill("review", stats.review, "bg-amber-50 text-amber-700")}{pill("errors", stats.errors, "bg-red-50 text-red-700")}{pill("N/A", stats.excluded, "bg-slate-100 text-slate-600")}</div><div className="flex flex-wrap gap-2"><button type="button" disabled={runningId === documentId} onClick={() => runValidation(documentId)} className="flex items-center gap-1 rounded-lg border border-[#1E5A45] px-3 py-2 text-xs font-semibold text-[#1E5A45] disabled:opacity-50"><RefreshCw size={14} className={runningId === documentId ? "animate-spin" : ""} /> Re-validate</button><button type="button" onClick={() => goToExceptions(documentId, project.projectId)} className="flex items-center gap-1 rounded-lg bg-[#1E5A45] px-3 py-2 text-xs font-semibold text-white"><AlertTriangle size={14} /> View Exceptions</button></div></div>
                  {documentErrors[documentId] ? <p className="text-sm text-red-700">{documentErrors[documentId]}</p> : benefits.length === 0 ? <p className="text-sm text-[#71837B]">No extracted benefits available for this document.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-[#F2F7F4] text-xs text-[#526C61]"><tr><th className="p-3">Benefit</th><th className="p-3">Category</th><th className="p-3">Validation Reason</th><th className="p-3">Status</th></tr></thead><tbody>{benefits.map((benefit, index) => { const status = statusOf(benefit); return <tr key={benefit.id ?? index} className="border-t border-[#E5ECE8]"><td className="p-3 font-medium text-[#29483D]">{benefit.benefit_name || `Benefit ${index + 1}`}</td><td className="p-3 text-[#60756B]">{benefit.benefit_category || "—"}</td><td className="p-3 text-[#60756B]">{benefit.validation_reason || "—"}</td><td className="p-3">{status === "passed" ? <span className="inline-flex items-center gap-1 text-green-700"><CheckCircle2 size={15} /> Passed</span> : status === "error" ? <span className="inline-flex items-center gap-1 text-red-700"><XCircle size={15} /> Error</span> : status === "excluded" ? <span className="text-slate-600">N/A</span> : <span className="inline-flex items-center gap-1 text-amber-700"><AlertTriangle size={15} /> Needs Review</span>}</td></tr>; })}</tbody></table></div>}
                </div>}
              </div>;
            })}
          </div>}
        </section>;
      })}
      <p className="text-xs text-[#71837B]">Results are loaded from the backend. Validation progress counts Valid and N/A records as completed; N/A records remain separately identified. Project/document associations require project_id on document records.</p>
    </div>
  );
}
