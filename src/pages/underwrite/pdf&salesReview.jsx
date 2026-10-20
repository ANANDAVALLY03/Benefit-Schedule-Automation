import React, { useCallback, useEffect, useState } from "react";

import { FileText, Lock, MessageSquare, RotateCcw, ShieldCheck, CheckCircle, RefreshCw } from "lucide-react";



const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000").replace(/\/+$/, "");



async function apiRequest(path, options = {}) {

   const response = await fetch(`${API_BASE_URL}${path}`, {

      ...options,

      headers: { ...(options.body ? { "Content-Type": "application/json" } : {}), ...(options.headers || {}) },

   });

   const data = await response.json().catch(() => ({}));

   if (!response.ok) throw new Error(typeof data.detail === "string" ? data.detail : data.message || `Request failed (${response.status})`);

   return data;

}



function getDocumentId() {

   const params = new URLSearchParams(window.location.search);

   const raw = params.get("documentId") || params.get("document_id") || sessionStorage.getItem("lastDocumentId");

   const id = Number(raw);

   return Number.isInteger(id) && id > 0 ? id : null;

}



export default function ProposalSalesReview() {

   const [documentId, setDocumentId] = useState(getDocumentId);

   const [proposal, setProposal] = useState(null);

   const [comment, setComment] = useState("");

   const [loading, setLoading] = useState(true);

   const [saving, setSaving] = useState(false);

   const [error, setError] = useState("");

   const [notice, setNotice] = useState("");



   const loadProposal = useCallback(async () => {

      if (!documentId) {

         setError("No document ID found. Open this page with ?documentId=<document ID>.");

         setLoading(false);

         return;

      }

      setLoading(true); setError("");

      try { setProposal(await apiRequest(`/api/proposals/${documentId}/latest`)); }

      catch (e) { setProposal(null); setError(e.message || "Unable to load proposal."); }

      finally { setLoading(false); }

   }, [documentId]);



   // Keep the selected document in sync when the user uploads or opens a new PDF.

   // The app stores the latest document ID in sessionStorage when upload succeeds.

   useEffect(() => {

      const syncDocumentId = () => {

         const nextId = getDocumentId();

         setDocumentId((currentId) => (currentId === nextId ? currentId : nextId));

      };



      window.addEventListener("popstate", syncDocumentId);

      window.addEventListener("focus", syncDocumentId);

      window.addEventListener("documentIdChanged", syncDocumentId);



      // Also check once after mount, in case sessionStorage changed during navigation.

      syncDocumentId();



      return () => {

         window.removeEventListener("popstate", syncDocumentId);

         window.removeEventListener("focus", syncDocumentId);

         window.removeEventListener("documentIdChanged", syncDocumentId);

      };

   }, []);



   useEffect(() => { loadProposal(); }, [loadProposal]);



   const submitDecision = async (decision) => {

      if (decision === "changes" && !comment.trim()) {

         setError("Please enter revision notes before returning the proposal.");

         return;

      }

      setSaving(true); setError(""); setNotice("");

      try {

         const result = await apiRequest(`/api/proposals/${documentId}/decision`, {

            method: "POST",

            body: JSON.stringify({ decision, comments: comment, reviewer: "Sales Reviewer" }),

         });

         setNotice(result.message || "Sales decision saved.");

         setComment("");

         await loadProposal();

      } catch (e) { setError(e.message || "Unable to save sales decision."); }

      finally { setSaving(false); }

   };



   const originalPdfUrl = documentId ? `${API_BASE_URL}/api/documents/${documentId}/download-original?inline=true` : "";

   const pdfUrl = documentId ? `${API_BASE_URL}/api/proposals/${documentId}/latest/pdf` : "";

   const status = proposal?.status || "No proposal";

   const canReview = status === "Awaiting Sales Review" || status === "Revision Requested";



   if (loading) return <div className="min-h-screen bg-[#F7F5EF] p-8 text-[#12352B]">Loading proposal…</div>;



   return (

      <div className="min-h-screen bg-[#F7F5EF] text-[#24302B]">

         <header className="sticky top-0 z-20 border-b border-white/10 bg-gradient-to-r from-[#12352B] to-[#1E5A45] text-white shadow-lg">

            <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-4">

               <div><div className="text-2xl font-bold tracking-wide">CANOPY</div><div className="text-xs text-[#DCEFE3]">Benefit Intelligence Platform</div></div>

               <div className="text-right"><p className="text-sm font-semibold">Sales Review</p><p className="text-xs text-[#DCEFE3]">Proposal Review Portal</p></div>

            </div>

         </header>

         <main className="w-full space-y-6 px-6 py-6">

            <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#D7E5DC] bg-white p-6 shadow-sm">

               <div><h1 className="text-2xl font-bold text-[#12352B]">Sales Proposal Review</h1><p className="mt-1 text-sm text-gray-600">Document ID: {documentId || "Not selected"} · Version: {proposal?.version_label || "—"}</p></div>

               <div className="flex items-center gap-3"><span className="rounded-full bg-[#DCEFE3] px-3 py-2 text-sm font-semibold text-[#1E5A45]">{status}</span><button onClick={loadProposal} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"><RefreshCw size={16}/> Refresh</button></div>

            </section>

            {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

            {notice && <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">{notice}</div>}

            {!proposal ? <section className="rounded-2xl border border-[#D7E5DC] bg-white p-8"><FileText className="mb-3 text-[#1E5A45]"/><h2 className="text-lg font-semibold">No generated proposal found</h2><p className="mt-2 text-sm text-gray-600">Return to Underwriting, save your options and pricing, then select Validate & Generate PDF.</p></section> : <>

               <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">

                  <div className="overflow-hidden rounded-2xl border border-[#D7E5DC] bg-white shadow-sm">

                     <div className="flex items-center gap-3 bg-[#12352B] px-5 py-4 text-white"><FileText size={20}/><div><h2 className="font-semibold">Original Client Document</h2><p className="text-xs text-[#DCEFE3]">Uploaded broker/client source PDF</p></div></div>

                     <div className="h-[720px] bg-gray-100 p-3"><iframe key={`original-${documentId}`} title="Original client benefit schedule" src={originalPdfUrl} className="h-full w-full rounded-lg border bg-white" /></div>

                     <div className="border-t px-5 py-3 text-sm text-gray-600">Original uploaded document · ID {documentId}</div>

                  </div>

                  <div className="overflow-hidden rounded-2xl border border-[#D7E5DC] bg-white shadow-sm">

                     <div className="flex items-center gap-3 bg-[#12352B] px-5 py-4 text-white"><FileText size={20}/><div><h2 className="font-semibold">Generated Proposal PDF</h2><p className="text-xs text-[#DCEFE3]">Review this version against the original document</p></div></div>

                     <div className="flex items-start gap-2 border-b border-emerald-100 bg-emerald-50 px-5 py-3 text-xs leading-relaxed text-emerald-800">
                        <Lock size={16} className="mt-0.5 shrink-0 text-emerald-700" aria-hidden="true" />
                        <p>
                           <span className="font-semibold">Locked proposal.</span>{" "}
                           This generated PDF is a read-only version for Sales Review. Compare it with the original client document before approving or requesting changes.
                        </p>
                     </div>

                     <div className="h-[720px] bg-gray-100 p-3"><iframe key={`proposal-${proposal.id}`} title="Generated benefit proposal" src={pdfUrl} className="h-full w-full rounded-lg border bg-white" /></div>

                     <div className="border-t px-5 py-3 text-sm text-gray-600">{proposal.file_name}</div>

                  </div>

               </section>

               <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">

                  <section className="h-full rounded-2xl border border-[#D7E5DC] bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><div className="rounded-lg bg-[#DCEFE3] p-3"><Lock className="text-[#1E5A45]"/></div><div><h2 className="font-semibold text-[#12352B]">Proposal Details</h2><p className="text-sm text-gray-500">Versioned proposal metadata</p></div></div><dl className="mt-5 grid grid-cols-2 gap-4 text-sm"><div><dt className="text-gray-500">Version</dt><dd className="mt-1 font-semibold">{proposal.version_label}</dd></div><div><dt className="text-gray-500">Status</dt><dd className="mt-1 font-semibold">{proposal.status}</dd></div><div><dt className="text-gray-500">Created</dt><dd className="mt-1 font-semibold">{proposal.created_at ? new Date(proposal.created_at).toLocaleString() : "—"}</dd></div><div><dt className="text-gray-500">Reviewed by</dt><dd className="mt-1 font-semibold">{proposal.reviewed_by || "Pending"}</dd></div></dl></section>

                  <section className="h-full rounded-2xl border border-[#D7E5DC] bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><MessageSquare className="text-[#1E5A45]"/><h2 className="font-semibold text-[#12352B]">Sales Decision</h2></div><p className="mt-2 text-sm text-gray-600">Approve this generated PDF or return it to underwriting with revision notes.</p><label className="mt-5 block text-sm font-semibold">Comments / revision notes</label><textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={5} disabled={!canReview || saving} placeholder="Required when requesting changes…" className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#1E5A45]"/><div className="mt-4 flex flex-col gap-3"><button disabled={!canReview || saving} onClick={() => submitDecision("changes")} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-orange-400 px-4 py-3 text-sm font-semibold text-orange-700 disabled:opacity-40"><RotateCcw size={16}/> Return to Underwriting</button><button disabled={!canReview || saving} onClick={() => submitDecision("approve")} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1E5A45] px-4 py-3 text-sm font-semibold text-white disabled:opacity-40"><CheckCircle size={16}/> {saving ? "Saving…" : "Approve Proposal"}</button></div><p className="mt-3 text-xs text-gray-500">Decision is saved to the database. This does not send an email or approve the client proposal.</p></section>

                  <section className="h-full rounded-2xl border border-[#D7E5DC] bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><ShieldCheck className="text-[#1E5A45]"/><div><p className="font-semibold">Review audit</p><p className="text-sm text-gray-500">{proposal.reviewed_at ? `Reviewed ${new Date(proposal.reviewed_at).toLocaleString()}` : "No review decision recorded yet"}</p></div></div><div className="mt-5 border-t border-[#E7EEE9] pt-4 text-sm text-gray-600">{proposal.reviewed_at ? "A sales review decision has been recorded." : "This proposal is awaiting a sales review decision."}</div></section>

               </section>

            </>}

            <footer className="py-4 text-center text-xs text-gray-500">CANOPY Benefit Intelligence Platform · Benefit Schedule Automation</footer>

         </main>

      </div>

   );

}
