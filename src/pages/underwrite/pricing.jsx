import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Calculator, Save, ArrowLeft, CheckCircle2, AlertTriangle, ChevronDown, ArrowRight } from "lucide-react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");

async function readResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof data.detail === "string" ? data.detail : `Request failed (${response.status})`);
  return data;
}

async function getPricing(documentId) {
  return readResponse(await fetch(`${API_BASE_URL}/api/underwriting/${documentId}/pricing`));
}

async function savePricing(documentId, payload) {
  return readResponse(await fetch(`${API_BASE_URL}/api/underwriting/${documentId}/pricing`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }));
}

function money(value, currencyCode = "USD") {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: currencyCode, maximumFractionDigits: 2 }).format(Number(value || 0));
}

function Pricing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const documentId = searchParams.get("documentId") || sessionStorage.getItem("lastDocumentId");
  const [pricingData, setPricingData] = useState(null);
  const [commission, setCommission] = useState("5");
  const [selectedOptionId, setSelectedOptionId] = useState("");
  const [basePremiums, setBasePremiums] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const options = pricingData?.options || [];
  const commissionValue = Number(commission);
  const validCommission = commission.trim() !== "" && Number.isFinite(commissionValue) && commissionValue >= 0 && commissionValue <= 10;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!documentId) {
        setError("No document selected. Open Pricing from a document or options page.");
        setLoading(false);
        return;
      }
      setLoading(true); setError("");
      try {
        const data = await getPricing(documentId);
        if (cancelled) return;
        setPricingData(data);
        const savedByOption = {};
        for (const p of data.premiums || []) if (!(p.option_id in savedByOption)) savedByOption[p.option_id] = p;
        const initial = {};
        for (const option of data.options || []) initial[option.id] = savedByOption[option.id] ? String(savedByOption[option.id].base_premium) : "";
        setBasePremiums(initial);
        const selected = (data.options || []).find(o => o.is_selected) || (data.options || [])[0];
        setSelectedOptionId(selected ? String(selected.id) : "");
        if (selected && savedByOption[selected.id]) setCommission(String(savedByOption[selected.id].commission_percentage));
      } catch (e) {
        if (!cancelled) setError(e.message || "Unable to load pricing.");
      } finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, [documentId]);

  const calculated = useMemo(() => {
    const result = {};
    for (const option of options) {
      const base = Number(basePremiums[option.id] || 0);
      const commissionAmount = validCommission ? Math.round(base * commissionValue) / 100 : 0;
      result[option.id] = { base, commissionAmount, total: base + commissionAmount };
    }
    return result;
  }, [options, basePremiums, commissionValue, validCommission]);

  const selectedOption = options.find(o => String(o.id) === String(selectedOptionId));
  const selectedCalculation = selectedOption ? calculated[selectedOption.id] : null;

  async function handleSave() {
    setError(""); setSuccess("");
    if (!documentId) return setError("No document selected.");
    if (!validCommission) return setError("Enter a commission rate between 0% and 10%.");
    if (!options.length) return setError("No coverage options found. Create options first.");
    if (!selectedOptionId) return setError("Select one coverage option.");
    if (options.some(o => basePremiums[o.id] === "" || basePremiums[o.id] === undefined || !Number.isFinite(Number(basePremiums[o.id])) || Number(basePremiums[o.id]) < 0)) {
      return setError("Enter a valid base premium for every option.");
    }
    setSaving(true);
    try {
      const result = await savePricing(documentId, {
        commission_percentage: commissionValue,
        currency_code: "USD",
        options: options.map(o => ({ option_id: o.id, base_premium: Number(basePremiums[o.id]), is_selected: String(o.id) === String(selectedOptionId) })),
      });
      setPricingData(await getPricing(documentId));
      setSuccess(result.message || "Pricing saved successfully.");
    } catch (e) { setError(e.message || "Failed to save pricing."); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="p-7 text-sm text-gray-600">Loading pricing...</div>;

  return <div className="min-h-full bg-[#f6f8f7]">
    <div className="px-7 pb-4 pt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#dcefe9]"><Calculator size={22} className="text-[#006653]" /></div><div><h1 className="text-2xl font-semibold text-[#073f35]">Pricing</h1><p className="mt-1 text-sm text-gray-500">Calculate and review premiums for each coverage option</p></div></div>
      <div className="flex items-center gap-3"><span className="rounded-full bg-[#fff1d7] px-4 py-2 text-sm font-medium text-[#a56600]">Underwriting In Progress</span><span className="text-sm text-gray-500">Draft</span></div>
    </div>

    <div className="px-7"><div className="rounded-xl border border-[#d7e1de] bg-white p-5 grid grid-cols-1 gap-5 md:grid-cols-4"><InfoItem label="Document ID" value={documentId || "Not selected"} /><InfoItem label="Coverage Options" value={String(options.length)} /><InfoItem label="Selected Tier" value={selectedOption?.option_name || "Not selected"} /><InfoItem label="Currency" value="USD" /></div></div>

    <div className="space-y-6 p-7">
      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {success && <p role="status" className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800"><CheckCircle2 size={16} className="mr-2 inline" />{success}</p>}

      <section className="rounded-xl border border-[#d7e1de] bg-white">
        <div className="border-b border-[#d7e1de] px-6 py-5"><h2 className="text-lg font-semibold text-[#073f35]">Pricing Configuration</h2><p className="mt-1 text-sm text-gray-500">Enter commission and the base premium for each option.</p></div>
        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-3">
          <div><label htmlFor="commission" className="text-sm font-medium text-gray-600">Commission Rate</label><div className="relative mt-2"><input id="commission" type="number" min="0" max="10" step="0.1" value={commission} onChange={e => { setCommission(e.target.value); setSuccess(""); }} className="w-full rounded-lg border border-[#cddbd6] px-4 py-3 pr-10 focus:border-[#00866c] focus:outline-none focus:ring-2 focus:ring-[#bde5d8]" /><span className="absolute right-4 top-3 text-gray-400">%</span></div><p className="mt-2 text-xs text-gray-400">Allowed range: 0% – 10%</p>{!validCommission && <p className="mt-2 text-xs text-red-600">Enter a commission rate between 0% and 10%.</p>}</div>
          <div><label htmlFor="coverageTier" className="text-sm font-medium text-gray-600">Coverage Tier</label><div className="relative mt-2"><select id="coverageTier" value={selectedOptionId} onChange={e => { setSelectedOptionId(e.target.value); setSuccess(""); }} className="w-full appearance-none rounded-lg border border-[#cddbd6] bg-white px-4 py-3 pr-10">{!options.length && <option value="">No options available</option>}{options.map(o => <option key={o.id} value={String(o.id)}>{o.option_name || `Option ${o.option_number}`}</option>)}</select><ChevronDown size={17} className="pointer-events-none absolute right-4 top-3.5 text-gray-400" /></div></div>
          <div className="rounded-lg bg-[#eef8f4] p-4"><p className="text-xs text-gray-500">Calculation Rule</p><p className="mt-2 text-sm font-semibold text-[#006653]">Base Premium + Commission</p><p className="mt-2 text-xs text-gray-500">Commission is calculated from each base premium.</p></div>
        </div>
      </section>

      <section><div className="mb-4"><h2 className="text-lg font-semibold text-[#073f35]">Premium Summary</h2><p className="mt-1 text-sm text-gray-500">Premiums calculated for each coverage option.</p></div>
        {!options.length ? <div className="rounded-xl border border-[#d7e1de] bg-white p-6 text-sm text-gray-600">No coverage options found. Create options first.</div> : <div className="grid grid-cols-1 gap-5 md:grid-cols-3">{options.map(option => { const selected = String(option.id) === String(selectedOptionId); const calc = calculated[option.id]; return <PremiumCard key={option.id} title={option.option_name || `Option ${option.option_number}`} selected={selected} onClick={() => { setSelectedOptionId(String(option.id)); setSuccess(""); }} basePremium={basePremiums[option.id] ?? ""} onBasePremiumChange={value => { setBasePremiums(prev => ({ ...prev, [option.id]: value })); setSuccess(""); }} amount={money(calc?.total)} />; })}</div>}
      </section>

      <section className="overflow-hidden rounded-xl border border-[#d7e1de] bg-white"><div className="border-b border-[#d7e1de] px-6 py-5"><h2 className="text-lg font-semibold text-[#073f35]">Premium Breakdown</h2><p className="mt-1 text-sm text-gray-500">Base premium, commission, and total for each option.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[650px]"><thead><tr className="bg-[#f4f8f6]">{["Coverage Option", "Base Premium", "Commission", "Total Premium"].map(label => <th key={label} className="px-5 py-4 text-left text-xs font-semibold text-gray-600">{label}</th>)}</tr></thead><tbody>{options.map(o => { const c = calculated[o.id]; return <tr key={o.id} className="hover:bg-[#fafcfb]"><td className="border-t px-5 py-4 text-sm font-medium text-[#073f35]">{o.option_name || `Option ${o.option_number}`}{String(o.id) === String(selectedOptionId) && <span className="ml-2 text-xs text-[#00856b]">Selected</span>}</td><td className="border-t px-4 py-4 text-sm">{money(c?.base)}</td><td className="border-t px-4 py-4 text-sm">{money(c?.commissionAmount)} ({validCommission ? commission : "—"}%)</td><td className="border-t px-4 py-4 text-sm font-semibold text-[#006653]">{money(c?.total)}</td></tr>; })}</tbody></table></div></section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-[#d7e1de] bg-white p-6"><h2 className="font-semibold text-[#073f35]">Selected Pricing</h2><div className="mt-5 rounded-xl bg-[#eef8f4] p-5"><div className="flex justify-between"><div><p className="text-xs text-gray-500">Selected Option</p><p className="mt-1 text-xl font-bold text-[#006653]">{selectedOption?.option_name || "Not selected"}</p></div><CheckCircle2 size={26} className="text-[#009879]" /></div><div className="mt-5 border-t border-[#cce9df] pt-4"><p className="text-xs text-gray-500">Estimated Total Premium</p><p className="mt-1 text-3xl font-bold text-[#073f35]">{selectedCalculation ? money(selectedCalculation.total) : "—"}</p></div><div className="mt-4"><p className="text-xs text-gray-500">Commission</p><p className="mt-1 text-sm font-semibold text-[#073f35]">{validCommission ? `${commission}%` : "Invalid rate"}</p></div></div></section>
        <section className="rounded-xl border border-[#d7e1de] bg-white p-6"><h2 className="font-semibold text-[#073f35]">Pricing Validation</h2><div className="mt-5 space-y-4"><ValidationRow label="Commission rate" value={validCommission ? `${commission}%` : "Invalid"} success={validCommission} warning={!validCommission} /><ValidationRow label="Coverage options" value={options.length ? `${options.length} loaded` : "No options"} success={options.length > 0} warning={!options.length} /><ValidationRow label="Base premiums" value={options.length && options.every(o => basePremiums[o.id] !== "") ? "Entered" : "Incomplete"} success={options.length > 0 && options.every(o => basePremiums[o.id] !== "")} warning={!options.length || options.some(o => basePremiums[o.id] === "")} /><ValidationRow label="Database save" value={success ? "Saved" : "Not saved yet"} success={Boolean(success)} warning={!success} /></div></section>
      </div>

      <div className="rounded-xl border border-[#f0dfbd] bg-[#fff9ee] p-5 flex gap-3"><AlertTriangle size={20} className="shrink-0 text-orange-500" /><div><p className="text-sm font-semibold text-[#765000]">Pricing Rule Notice</p><p className="mt-1 text-xs text-gray-600">This code uses total premium = base premium + commission. Confirm the approved business formula before production use.</p></div></div>

      <div className="rounded-xl border border-[#d7e1de] bg-white p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><button type="button" onClick={() => navigate("/underwriter/options")} className="flex items-center justify-center gap-2 rounded-lg border border-[#006653] px-5 py-3 text-sm font-medium text-[#006653]"><ArrowLeft size={18} />Back to Options</button><div className="flex flex-col gap-3 sm:flex-row"><button type="button" onClick={handleSave} disabled={!validCommission || saving || !options.length} className="flex items-center justify-center gap-2 rounded-lg bg-[#006653] px-6 py-3 text-sm font-medium text-white disabled:opacity-50"><Save size={18} />{saving ? "Saving..." : success ? "Pricing Saved" : "Save Pricing"}</button>{success && <button type="button" onClick={() => navigate("/underwriter/work")} className="flex items-center justify-center gap-2 rounded-lg bg-[#073f35] px-6 py-3 text-sm font-medium text-white">Proceed with Underwriting<ArrowRight size={18} /></button>}</div></div>
    </div>
  </div>;
}

function InfoItem({ label, value }) { return <div><p className="mb-1 text-xs text-gray-500">{label}</p><p className="text-sm font-semibold text-[#073f35]">{value}</p></div>; }
function PremiumCard({ title, selected, onClick, basePremium, onBasePremiumChange, amount }) {
  return <div className={`relative w-full rounded-xl border bg-white p-6 transition ${selected ? "border-[#009879] ring-2 ring-[#d8f1e8]" : "border-[#d7e1de] hover:border-[#009879]"}`}>
    <button type="button" onClick={onClick} className="w-full text-left"><div className="flex items-center justify-between"><div><p className="text-xs text-gray-500">Coverage Tier</p><h3 className="mt-1 text-lg font-semibold text-[#073f35]">{title}</h3></div>{selected && <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#009879]"><CheckCircle2 size={17} className="text-white" /></div>}</div></button>
    <label className="mt-5 block text-xs text-gray-500">Base Premium (INR)<input type="number" min="0" step="0.01" value={basePremium} onChange={e => onBasePremiumChange(e.target.value)} className="mt-2 w-full rounded-lg border border-[#cddbd6] px-3 py-2 text-sm text-[#073f35]" placeholder="Enter base premium" /></label>
    <div className="mt-6"><p className="text-xs text-gray-500">Estimated Total Premium</p><p className="mt-1 text-3xl font-bold text-[#073f35]">{amount}</p></div><div className={`mt-5 text-sm font-medium ${selected ? "text-[#006653]" : "text-gray-500"}`}>{selected ? "Selected for proposal" : "Select this option"}</div>
  </div>;
}
function ValidationRow({ label, value, success, warning }) { return <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2">{success && <CheckCircle2 size={17} className="text-[#009879]" />}{warning && <AlertTriangle size={17} className="text-orange-500" />}<span className="text-sm text-gray-600">{label}</span></div><span className={`text-xs font-medium ${success ? "text-[#00856b]" : "text-orange-600"}`}>{value}</span></div>; }

export default Pricing;
