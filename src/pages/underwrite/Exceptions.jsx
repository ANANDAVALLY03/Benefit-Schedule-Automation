import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertTriangle, ArrowRight, CheckCircle2, FileWarning,
  GitPullRequest, Map, RefreshCw, Search, X, XCircle,
} from "lucide-react";
import { getBenefits, resolveBenefit } from "../../services/apis";

const normalizeStatus = (value) => String(value ?? "Unverified").trim().toLowerCase();
const isCleared = (value) => ["valid", "passed", "approved", "n/a", "na", "not applicable"].includes(normalizeStatus(value));
const isError = (value) => ["mismatch", "invalid", "error", "failed", "blocking"].includes(normalizeStatus(value));

const actions = [
  { label: "Map to Existing", value: "map_existing", description: "Map this benefit to an existing CANOPY master entry." },
  { label: "Mark as N/A", value: "mark_na", description: "Exclude this benefit where not applicable." },
  { label: "Raise Change Request", value: "raise_change_request", description: "Request approval to add a benefit to the master." },
  { label: "Mark for Re-validation", value: "revalidate", description: "Request another validation after correcting the underlying data." },
];

function InfoItem({ label, value }) {
  return <div><p className="text-[11px] font-semibold uppercase tracking-wide text-[#71837B]">{label}</p><p className="mt-1 break-words text-sm font-semibold text-[#12352B]">{value == null || value === "" ? "N/A" : String(value)}</p></div>;
}

export default function Exceptions() {
  const navigate = useNavigate();
  const location = useLocation();
  const documentId = new URLSearchParams(location.search).get("documentId") || location.state?.documentId || sessionStorage.getItem("lastDocumentId");
  const [documentBenefits, setDocumentBenefits] = useState([]);
  const [benefitsLoading, setBenefitsLoading] = useState(false);
  const [benefitsLoadError, setBenefitsLoadError] = useState("");
  const [selectedException, setSelectedException] = useState(null);
  const [selectedAction, setSelectedAction] = useState("");
  const [notes, setNotes] = useState("");
  const [mappedToBenefit, setMappedToBenefit] = useState("");
  const [savingResolution, setSavingResolution] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const loadBenefits = useCallback(async () => {
    if (!documentId) {
      setDocumentBenefits([]);
      setBenefitsLoadError("No document selected. Open a document from Benefits first.");
      return;
    }
    setBenefitsLoading(true);
    setBenefitsLoadError("");
    try {
      const response = await getBenefits(Number(documentId));
      const records = Array.isArray(response?.benefits) ? response.benefits : Array.isArray(response) ? response : null;
      if (!records) throw new Error("Unexpected benefits API response format.");
      setDocumentBenefits(records);
    } catch (error) {
      setBenefitsLoadError(error?.message || "Unable to load extracted benefits.");
      setDocumentBenefits([]);
    } finally {
      setBenefitsLoading(false);
    }
  }, [documentId]);

  useEffect(() => { loadBenefits(); }, [loadBenefits]);
  useEffect(() => {
    const refresh = () => { if (documentId) loadBenefits(); };
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [documentId, loadBenefits]);

  const exceptions = useMemo(() => documentBenefits.map((benefit, index) => {
    const status = benefit.validation_status ?? benefit.status ?? "Unverified";
    const manuallyAdded = Boolean(benefit.is_manually_added);
    return {
      id: `benefit-${benefit.id ?? index}`,
      benefitId: benefit.id,
      benefit: benefit.benefit_name || `Benefit ${index + 1}`,
      sourceColumn: benefit.benefit_category || benefit.benefit_name || "Extracted benefit",
      type: manuallyAdded ? "New Benefit" : "Validation",
      status: isError(status) ? "Blocking" : "Pending",
      benefitStatus: status,
      priority: isError(status) ? "High" : "Medium",
      description: benefit.validation_reason || "This benefit needs review against the source schedule.",
      phase: manuallyAdded ? "Mapping Review" : "Validation",
      createdAt: benefit.created_at ? String(benefit.created_at).slice(0, 10) : "Current document",
      record: benefit,
      cleared: isCleared(status),
    };
  }).filter(item => !item.cleared), [documentBenefits]);

  const counts = {
    all: exceptions.length,
    unmapped: exceptions.filter(x => x.type === "Unmapped").length,
    changeRequest: exceptions.filter(x => x.type === "New Benefit").length,
    validation: exceptions.filter(x => x.type === "Validation").length,
    blocking: exceptions.filter(x => x.status === "Blocking").length,
  };
  const filtered = exceptions.filter(item => {
    const matchesFilter = activeFilter === "All" || (activeFilter === "Blocking" ? item.status === "Blocking" : item.type === activeFilter);
    const query = searchTerm.trim().toLowerCase();
    return matchesFilter && [item.benefit, item.sourceColumn, item.type, item.status, item.description].some(value => String(value).toLowerCase().includes(query));
  });

  const closeModal = () => {
    setSelectedException(null);
    setSelectedAction("");
    setNotes("");
    setMappedToBenefit("");
  };
  const openModal = (item) => {
    setSelectedException(item);
    setSelectedAction("");
    setNotes("");
    setMappedToBenefit("");
    setBenefitsLoadError("");
  };

  const handleResolve = async () => {
    if (!selectedException || !selectedAction || !documentId || selectedException.benefitId == null) {
      setBenefitsLoadError("Select an action and a saved benefit record before continuing.");
      return;
    }
    if (selectedAction === "map_existing" && !mappedToBenefit.trim()) {
      setBenefitsLoadError("Enter the target benefit for mapping.");
      return;
    }
    setSavingResolution(true);
    setBenefitsLoadError("");
    try {
      await resolveBenefit(Number(documentId), Number(selectedException.benefitId), {
        action: selectedAction,
        mapped_to_benefit: selectedAction === "map_existing" ? mappedToBenefit.trim() : null,
        notes: notes.trim() || null,
        resolved_by: "Underwriter", // Replace with authenticated user's identity when available.
      });
      // Always reload the authoritative status. A change request or revalidation
      // action is not necessarily a passed validation.
      await loadBenefits();
      closeModal();
    } catch (error) {
      setBenefitsLoadError(error?.message || "Unable to save the resolution. Please try again.");
    } finally {
      setSavingResolution(false);
    }
  };

  const goToValidations = () => {
    if (!documentId || benefitsLoading || benefitsLoadError || exceptions.length > 0) return;
    navigate(`/underwriter/validations?documentId=${encodeURIComponent(documentId)}`, {
      state: { ...location.state, documentId },
    });
  };

  const summary = [
    { label: "All Exceptions", count: counts.all, filter: "All", Icon: AlertTriangle },
    { label: "Unmapped", count: counts.unmapped, filter: "Unmapped", Icon: Map },
    { label: "Change Requests", count: counts.changeRequest, filter: "New Benefit", Icon: GitPullRequest },
    { label: "Validation", count: counts.validation, filter: "Validation", Icon: XCircle },
    { label: "Blocking", count: counts.blocking, filter: "Blocking", Icon: FileWarning },
  ];

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#F7F5EF] p-4 lg:p-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FBE8C5] text-[#B87912]"><AlertTriangle size={23} /></div>
          <div><h1 className="text-2xl font-bold text-[#12352B]">Exceptions</h1><p className="mt-1 text-sm text-[#60756B]">Review and resolve items that require attention before proceeding.</p></div>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-[#FFF0D8] px-4 py-2 text-xs font-bold text-[#B87912]">{counts.all} Active Exceptions</span>
          <span className="text-xs text-[#71837B]">Document #{documentId || "Not selected"}</span>
          <button type="button" onClick={loadBenefits} disabled={benefitsLoading} className="flex items-center gap-2 rounded-lg border border-[#D5E2DA] bg-white px-3 py-2 text-xs font-semibold text-[#1E5A45] disabled:opacity-50"><RefreshCw size={15} /> {benefitsLoading ? "Loading..." : "Refresh"}</button>
        </div>
      </header>

      {benefitsLoadError && <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{benefitsLoadError}</div>}

      <section className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {summary.map(({ label, count, filter, Icon }) => (
          <button key={label} type="button" onClick={() => setActiveFilter(filter)} className={`rounded-xl border p-4 text-left transition-colors ${activeFilter === filter ? "border-[#9FCBB0] bg-[#E8F2EC]" : "border-[#D5E2DA] bg-white hover:bg-[#F2F7F4]"}`}>
            <div className="flex items-start justify-between"><div><p className="text-xs font-semibold text-[#60756B]">{label}</p><p className={`mt-2 text-2xl font-bold ${filter === "Blocking" ? "text-[#C94C4C]" : "text-[#12352B]"}`}>{count}</p><p className="mt-1 text-[11px] text-[#71837B]">Active</p></div><Icon size={20} className="text-[#1E5A45]" /></div>
          </button>
        ))}
      </section>

      <section className="overflow-hidden rounded-xl border border-[#D5E2DA] bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D5E2DA] p-5">
          <div><h2 className="text-sm font-bold text-[#12352B]">Active Exceptions</h2><p className="mt-1 text-xs text-[#71837B]">Only unresolved benefits from the current document appear here.</p></div>
          <div className="relative"><Search size={16} className="absolute left-3 top-3 text-[#71837B]" /><input value={searchTerm} onChange={event => setSearchTerm(event.target.value)} placeholder="Search exceptions..." className="h-10 rounded-lg border border-[#D5E2DA] bg-[#F7F5EF] pl-9 pr-4 text-sm outline-none focus:border-[#1E5A45]" /></div>
        </div>
        <div className="flex flex-wrap gap-2 border-b border-[#E5ECE8] px-5 py-3">
          {["All", "Unmapped", "New Benefit", "Validation", "Blocking"].map(filter => <button key={filter} type="button" onClick={() => setActiveFilter(filter)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${activeFilter === filter ? "bg-[#1E5A45] text-white" : "bg-[#F2F7F4] text-[#526C61] hover:bg-[#E8F2EC]"}`}>{filter}</button>)}
        </div>
        {benefitsLoading ? <p className="p-10 text-center text-sm text-[#60756B]">Loading exceptions...</p> : benefitsLoadError ? <p className="p-10 text-center text-sm text-red-600">Unable to display exceptions until the records load.</p> : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center"><CheckCircle2 size={28} className="mx-auto text-[#1E8E68]" /><h3 className="mt-4 text-sm font-bold text-[#12352B]">{counts.all === 0 ? "No active exceptions" : "No matching exceptions"}</h3><p className="mt-1 text-xs text-[#71837B]">{counts.all === 0 ? "All current benefit checks are cleared, or no records are available." : "Try another filter or search."}</p></div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left"><thead className="bg-[#F2F7F4] text-xs text-[#526C61]"><tr>{["Benefit", "Exception Type", "Source Column", "Phase", "Priority", "Status", "Action"].map(h => <th key={h} className="px-5 py-3">{h}</th>)}</tr></thead><tbody>{filtered.map(item => <tr key={item.id} className="border-t border-[#E5ECE8] text-sm text-[#526C61] hover:bg-[#FAFCFB]"><td className="px-5 py-4"><p className="font-semibold text-[#29483D]">{item.benefit}</p><p className="mt-1 text-[11px] text-[#87958F]">Created {item.createdAt}</p></td><td className="px-5 py-4">{item.type}</td><td className="px-5 py-4">{item.sourceColumn}</td><td className="px-5 py-4">{item.phase}</td><td className={`px-5 py-4 font-semibold ${item.priority === "High" ? "text-red-600" : "text-amber-600"}`}>{item.priority}</td><td className={`px-5 py-4 font-semibold ${item.status === "Blocking" ? "text-red-600" : "text-amber-600"}`}>{item.status}</td><td className="px-5 py-4"><button type="button" onClick={() => openModal(item)} className="flex items-center gap-1 rounded-lg border border-[#1E5A45] px-3 py-2 text-xs font-semibold text-[#1E5A45] hover:bg-[#E8F2EC]">Review <ArrowRight size={14} /></button></td></tr>)}</tbody></table></div>
        )}
      </section>

      <footer className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#D5E2DA] bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3"><CheckCircle2 size={20} className="text-[#1E8E68]" /><div><p className="text-sm font-semibold text-[#12352B]">Exception status</p><p className="mt-1 text-xs text-[#71837B]">{benefitsLoading ? "Checking..." : counts.all === 0 ? "No unresolved exceptions in loaded records." : `${counts.all} exception(s) still require attention.`}</p></div></div>
        <button type="button" onClick={goToValidations} disabled={!documentId || benefitsLoading || Boolean(benefitsLoadError) || documentBenefits.length === 0 || counts.all > 0} className="flex items-center gap-2 rounded-lg bg-[#1E5A45] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#164A38] disabled:cursor-not-allowed disabled:bg-[#CBD6D0] disabled:text-[#71837B]">Continue to Validations <ArrowRight size={17} /></button>
      </footer>

      {selectedException && <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/50 p-3 sm:p-5" role="presentation"><div role="dialog" aria-modal="true" aria-label="Review Exception" className="mx-auto my-4 flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-[#D5E2DA] px-5 py-4"><div><h2 className="font-bold text-[#12352B]">Review Exception</h2><p className="mt-1 text-xs text-[#71837B]">{selectedException.benefit}</p></div><button type="button" onClick={closeModal} disabled={savingResolution} aria-label="Close" className="rounded-lg p-2 hover:bg-[#E8F2EC]"><X size={19} /></button></div>
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-4"><InfoItem label="Exception Type" value={selectedException.type} /><InfoItem label="Status" value={selectedException.status} /><InfoItem label="Source Column" value={selectedException.sourceColumn} /><InfoItem label="Phase" value={selectedException.phase} /></div>
          <div className="rounded-lg border border-[#D5E2DA] bg-[#F7F5EF] p-4"><p className="text-xs font-semibold text-[#526C61]">Description</p><p className="mt-1 text-sm text-[#385348]">{selectedException.description}</p></div>
          <div className="overflow-hidden rounded-lg border border-[#D5E2DA]"><h3 className="border-b border-[#D5E2DA] bg-[#F2F7F4] px-4 py-3 text-sm font-bold text-[#12352B]">Extracted Benefit Details · Document #{documentId}</h3><div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">{[
            ["Benefit", "benefit_name"], ["Category", "benefit_category"], ["Limit", "limits"], ["Percentage", "percentages"], ["Visits", "visits"], ["Deductible", "deductibles"], ["Copay / UCR", "copay_ucr"], ["Treatment", "benefit_treatment"], ["Extraction confidence", "extraction_confidence"], ["Benefit record ID", "id"], ["Validation status", "validation_status"], ["Validation reason", "validation_reason"],
          ].map(([label, key]) => <InfoItem key={key} label={label} value={selectedException.record[key]} />)}<div className="sm:col-span-2"><InfoItem label="Source excerpt" value={selectedException.record.source_excerpt} /></div><div className="sm:col-span-2"><p className="text-[11px] font-semibold uppercase text-[#71837B]">Other attributes</p><pre className="mt-1 whitespace-pre-wrap break-words text-xs text-[#385348]">{selectedException.record.other_attributes ? JSON.stringify(selectedException.record.other_attributes, null, 2) : "N/A"}</pre></div></div></div>
          <div><h3 className="mb-3 text-sm font-bold text-[#12352B]">Choose an action</h3><div className="space-y-2">{actions.map(action => <button type="button" key={action.value} onClick={() => setSelectedAction(action.value)} className={`w-full rounded-lg border p-3.5 text-left ${selectedAction === action.value ? "border-[#1E5A45] bg-[#E8F2EC]" : "border-[#D5E2DA] hover:bg-[#FAFCFB]"}`}><div className="flex items-center gap-3"><span className={`h-4 w-4 shrink-0 rounded-full border ${selectedAction === action.value ? "border-4 border-[#1E5A45]" : "border-[#A8B6AF]"}`} /><div><p className="text-sm font-semibold text-[#12352B]">{action.label}</p><p className="mt-1 text-xs text-[#71837B]">{action.description}</p></div></div></button>)}</div></div>
          {selectedAction === "map_existing" && <div><label htmlFor="mapped-benefit" className="mb-2 block text-xs font-semibold text-[#526C61]">Existing target benefit</label><input id="mapped-benefit" value={mappedToBenefit} onChange={event => setMappedToBenefit(event.target.value)} className="w-full rounded-lg border border-[#D5E2DA] p-3 text-sm" placeholder="Enter existing benefit name or mapping reference" /></div>}
          <div><label htmlFor="resolution-notes" className="mb-2 block text-xs font-semibold text-[#526C61]">Resolution notes (optional)</label><textarea id="resolution-notes" rows={3} value={notes} onChange={event => setNotes(event.target.value)} className="w-full rounded-lg border border-[#D5E2DA] p-3 text-sm" placeholder="Explain your decision..." /></div>
          {benefitsLoadError && <p role="alert" className="text-sm text-red-600">{benefitsLoadError}</p>}
        </div>
        <div className="flex shrink-0 justify-end gap-3 border-t border-[#D5E2DA] bg-white px-5 py-4"><button type="button" onClick={closeModal} disabled={savingResolution} className="rounded-lg border border-[#D5E2DA] px-4 py-2 text-sm font-semibold text-[#526C61]">Cancel</button><button type="button" onClick={handleResolve} disabled={!selectedAction || savingResolution} className="rounded-lg bg-[#1E5A45] px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{savingResolution ? "Saving..." : "Save Decision"}</button></div>
      </div></div>}
    </div>
  );
}
