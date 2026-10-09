import React, { useState } from "react";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  FileText,
  Lock,
  MessageSquare,
  RotateCcw,
  Send,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";

const initialBenefits = [
  {
    id: 1,
    name: "Doctor Visit",
    current: "$50",
    option1: "$30",
    option2: "$20",
    option3: "$10",
  },
  {
    id: 2,
    name: "Specialist (Referred)",
    current: "80%",
    option1: "80%",
    option2: "90%",
    option3: "100%",
  },
  {
    id: 3,
    name: "Dental Annual Limit",
    current: "$1,000",
    option1: "$1,500",
    option2: "$2,000",
    option3: "$2,500",
  },
  {
    id: 4,
    name: "Optical Annual Limit",
    current: "$500",
    option1: "$750",
    option2: "$1,000",
    option3: "$1,500",
  },
  {
    id: 5,
    name: "Maternity",
    current: "N/A",
    option1: "N/A",
    option2: "$5,000",
    option3: "$7,500",
  },
];

const ProposalSalesReview = () => {
  const [version, setVersion] = useState("v1.0");
  const [status, setStatus] = useState("Awaiting Sales Review");
  const [comments, setComments] = useState("");
  const [showChanges, setShowChanges] = useState(false);

  const [history, setHistory] = useState([
    {
      version: "v1.0",
      status: "Awaiting Sales Review",
      date: "08 Oct 2026, 10:30 AM",
    },
  ]);

  const clientBenefits = initialBenefits.filter(
    (benefit) => benefit.current !== "N/A"
  );

  const handleApprove = () => {
    setStatus("Sales Approved");

    setHistory((previous) => [
      ...previous,
      {
        version,
        status: "Sales Approved",
        date: new Date().toLocaleString("en-IN"),
      },
    ]);
  };

  const handleChanges = () => {
    if (!comments.trim()) {
      alert("Please enter a comment before returning the proposal.");
      return;
    }

    setStatus("Revision Requested");

    setHistory((previous) => [
      ...previous,
      {
        version,
        status: "Revision Requested",
        date: new Date().toLocaleString("en-IN"),
      },
    ]);
  };

  const generateRevision = () => {
    const currentVersionNumber =
      parseInt(version.replace("v1.", ""), 10) || 0;

    const newVersion = `v1.${currentVersionNumber + 1}`;

    setVersion(newVersion);
    setStatus("Awaiting Sales Review");
    setComments("");
    setShowChanges(false);

    setHistory((previous) => [
      ...previous,
      {
        version: newVersion,
        status: "New Revision Created",
        date: new Date().toLocaleString("en-IN"),
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#24302B]">
      {/* ========================================================= */}
      {/* TOP HEADER */}
      {/* ========================================================= */}

      <header className="sticky top-0 z-50 border-b border-white/10 bg-gradient-to-r from-[#12352B] to-[#1E5A45] text-white shadow-lg">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4">
          <div>
            <div className="text-2xl font-bold tracking-wide">
              CANOPY
            </div>

            <div className="text-xs text-[#DCEFE3]">
              Benefit Intelligence Platform
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold">John Doe</p>
              <p className="text-xs text-[#DCEFE3]">Sales</p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <User size={20} />
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* MAIN CONTAINER */}
      {/* ========================================================= */}

      <main className="mx-auto max-w-[1600px] px-6 py-6">
        {/* BACK BUTTON */}

        <button
          type="button"
          className="mb-5 flex items-center gap-2 text-sm font-medium text-[#1E5A45] hover:text-[#12352B]"
        >
          <ArrowLeft size={18} />
          Back to Proposals
        </button>

        {/* ========================================================= */}
        {/* PROJECT HEADER */}
        {/* ========================================================= */}

        <section className="mb-6 rounded-2xl border border-[#D7E5DC] bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <h1 className="text-2xl font-bold text-[#12352B]">
                  ABC Corporation
                </h1>

                <span className="rounded-full bg-[#FFF3D6] px-3 py-1 text-xs font-semibold text-[#9A6800]">
                  {status}
                </span>
              </div>

              <div className="flex flex-wrap gap-5 text-sm text-gray-600">
                <span>
                  <strong>Insurer:</strong> Sagicor
                </span>

                <span>
                  <strong>Proposal:</strong> Benefit Schedule
                </span>

                <span>
                  <strong>Version:</strong> {version}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-[#F0F7F2] px-4 py-3">
              <ShieldCheck
                size={22}
                className="text-[#1E5A45]"
              />

              <div>
                <p className="text-xs text-gray-500">
                  Review Role
                </p>

                <p className="font-semibold text-[#12352B]">
                  Sales Reviewer
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* DOCUMENT REVIEW AREA */}
        {/* ========================================================= */}

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* ======================================================= */}
          {/* LEFT - ORIGINAL BROKER PDF */}
          {/* ======================================================= */}

          <div className="overflow-hidden rounded-2xl border border-[#D7E5DC] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 bg-[#12352B] px-5 py-4 text-white">
              <div className="flex items-center gap-3">
                <FileText size={20} />

                <div>
                  <h2 className="font-semibold">
                    Original Broker / Carrier Document
                  </h2>

                  <p className="text-xs text-[#DCEFE3]">
                    Uploaded source document
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-white/15 px-3 py-1 text-xs">
                Original PDF
              </span>
            </div>

            {/* ACTUAL PDF VIEWER */}

            <div className="h-[720px] bg-[#E5E7EB] p-3">
              <iframe
                src="/documents/broker-sample.pdf"
                title="Original Broker Benefit Schedule"
                className="h-full w-full rounded-lg border border-gray-300 bg-white"
              />
            </div>

            <div className="border-t border-gray-200 bg-[#F8FAF9] px-5 py-4">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle
                  size={17}
                  className="text-[#1E5A45]"
                />

                <span>
                  This is the original document uploaded by the broker/carrier.
                </span>
              </div>
            </div>
          </div>

          {/* ======================================================= */}
          {/* RIGHT - LOCKED CLIENT / SALES PROPOSAL */}
          {/* ======================================================= */}

          <div className="overflow-hidden rounded-2xl border border-[#D7E5DC] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#DCEFE3]">
                  <Lock
                    size={18}
                    className="text-[#1E5A45]"
                  />
                </div>

                <div>
                  <h2 className="font-semibold text-[#12352B]">
                    Locked Client / Sales Proposal
                  </h2>

                  <p className="text-xs text-gray-500">
                    System generated proposal
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-[#DCEFE3] px-3 py-1 text-xs font-semibold text-[#1E5A45]">
                LOCKED
              </span>
            </div>

            {/* LOCKED PROPOSAL DOCUMENT */}

            <div className="h-[720px] overflow-y-auto bg-[#E5E7EB] p-6">
              <div className="mx-auto min-h-full max-w-[760px] rounded-lg bg-white shadow-md">
                {/* PROPOSAL HEADER */}

                <div className="border-b-4 border-[#1E5A45] px-8 py-7">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-[#12352B]">
                        CANOPY
                      </h1>

                      <p className="mt-1 text-xs uppercase tracking-widest text-gray-500">
                        Benefit Proposal
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-[#F0F7F2] px-3 py-1 text-xs font-semibold text-[#1E5A45]">
                        <Lock size={13} />
                        Locked
                      </div>

                      <p className="text-xs text-gray-500">
                        Version {version}
                      </p>
                    </div>
                  </div>
                </div>

                {/* CLIENT INFORMATION */}

                <div className="grid grid-cols-2 gap-6 border-b border-gray-200 px-8 py-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Client
                    </p>

                    <p className="mt-1 font-semibold text-gray-800">
                      ABC Corporation
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Insurer
                    </p>

                    <p className="mt-1 font-semibold text-gray-800">
                      Sagicor
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Proposal Date
                    </p>

                    <p className="mt-1 text-sm text-gray-700">
                      08 October 2026
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Proposal Version
                    </p>

                    <p className="mt-1 text-sm text-gray-700">
                      {version}
                    </p>
                  </div>
                </div>

                {/* BENEFITS */}

                <div className="px-8 py-6">
                  <h3 className="mb-4 text-lg font-bold text-[#12352B]">
                    Selected Benefits
                  </h3>

                  <div className="overflow-hidden rounded-lg border border-gray-200">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-[#12352B] text-left text-white">
                          <th className="px-4 py-3">
                            Benefit
                          </th>

                          <th className="px-4 py-3">
                            Selected
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {clientBenefits.map((benefit) => (
                          <tr
                            key={benefit.id}
                            className="border-b border-gray-200 last:border-0"
                          >
                            <td className="px-4 py-3 font-medium text-gray-700">
                              {benefit.name}
                            </td>

                            <td className="px-4 py-3 font-semibold text-[#1E5A45]">
                              {benefit.option1}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* OPTION */}

                <div className="mx-8 rounded-xl border border-[#BBDAC6] bg-[#F0F7F2] p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#1E5A45]">
                        Selected Option
                      </p>

                      <p className="mt-1 text-xl font-bold text-[#12352B]">
                        Option 1
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        Premium
                      </p>

                      <p className="text-2xl font-bold text-[#12352B]">
                        $25,000
                      </p>
                    </div>
                  </div>
                </div>

                {/* FOOTER */}

                <div className="mt-8 border-t border-gray-200 px-8 py-6">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Lock size={13} />

                    <span>
                      This proposal is system generated and locked.
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-gray-400">
                    Any requested changes must be returned to underwriting.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SALES REVIEW SUMMARY */}
        {/* ========================================================= */}

        <section className="mt-6 rounded-2xl border border-[#D7E5DC] bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-[#12352B]">
              Sales Review
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Compare the original broker document with the locked proposal
              before approving.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* CARD 1 */}

            <div className="rounded-xl border border-gray-200 bg-[#F8FAF9] p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#DCEFE3]">
                <FileText
                  size={20}
                  className="text-[#1E5A45]"
                />
              </div>

              <p className="text-xs uppercase tracking-wide text-gray-500">
                Broker Document
              </p>

              <p className="mt-1 font-semibold text-[#12352B]">
                Original PDF
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Source document uploaded by broker/carrier.
              </p>
            </div>

            {/* CARD 2 */}

            <div className="rounded-xl border border-gray-200 bg-[#F8FAF9] p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#DCEFE3]">
                <Lock
                  size={20}
                  className="text-[#1E5A45]"
                />
              </div>

              <p className="text-xs uppercase tracking-wide text-gray-500">
                Sales Proposal
              </p>

              <p className="mt-1 font-semibold text-[#12352B]">
                Locked {version}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                System-generated proposal based on approved benefits.
              </p>
            </div>

            {/* CARD 3 */}

            <div className="rounded-xl border border-gray-200 bg-[#F8FAF9] p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#DCEFE3]">
                <Clock
                  size={20}
                  className="text-[#1E5A45]"
                />
              </div>

              <p className="text-xs uppercase tracking-wide text-gray-500">
                Review Status
              </p>

              <p className="mt-1 font-semibold text-[#12352B]">
                {status}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Current sales workflow status.
              </p>
            </div>
          </div>

          {/* ======================================================= */}
          {/* ACTION AREA */}
          {/* ======================================================= */}

          <div className="mt-6 rounded-xl border border-gray-200 bg-[#F8FAF9] p-5">
            <div className="flex items-center gap-2">
              <MessageSquare
                size={19}
                className="text-[#1E5A45]"
              />

              <h3 className="font-semibold text-[#12352B]">
                Sales Decision
              </h3>
            </div>

            <p className="mt-2 text-sm text-gray-500">
              If the proposal is correct, approve it. If something needs to
              be corrected, return it to underwriting with a comment.
            </p>

            {/* COMMENT */}

            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Comment
                <span className="ml-1 text-[#D95C5C]">
                  *
                </span>
              </label>

              <textarea
                value={comments}
                onChange={(event) =>
                  setComments(event.target.value)
                }
                placeholder="Enter a comment if changes are required..."
                rows={4}
                className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1E5A45] focus:ring-2 focus:ring-[#DCEFE3]"
              />
            </div>

            {/* BUTTONS */}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleChanges}
                className="flex items-center justify-center gap-2 rounded-lg border border-[#D95C5C] px-5 py-3 text-sm font-semibold text-[#D95C5C] transition hover:bg-[#FFF1F1]"
              >
                <RotateCcw size={17} />
                Return to Underwriting
              </button>

              <button
                type="button"
                onClick={handleApprove}
                className="flex items-center justify-center gap-2 rounded-lg bg-[#1E5A45] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#12352B]"
              >
                <CheckCircle size={17} />
                Approve Proposal
              </button>
            </div>
          </div>

          {/* ======================================================= */}
          {/* APPROVAL MESSAGE */}
          {/* ======================================================= */}

          {status === "Sales Approved" && (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#BBDAC6] bg-[#F0F7F2] p-5">
              <CheckCircle
                size={22}
                className="mt-0.5 text-[#1E5A45]"
              />

              <div>
                <h3 className="font-semibold text-[#12352B]">
                  Proposal Approved
                </h3>

                <p className="mt-1 text-sm text-gray-600">
                  Sales has approved {version}. The approved master can now
                  continue to the next workflow stage.
                </p>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* REVISION REQUESTED MESSAGE */}
          {/* ======================================================= */}

          {status === "Revision Requested" && (
            <div className="mt-5 rounded-xl border border-[#F2C7C7] bg-[#FFF6F6] p-5">
              <div className="flex items-start gap-3">
                <XCircle
                  size={22}
                  className="mt-0.5 text-[#D95C5C]"
                />

                <div>
                  <h3 className="font-semibold text-[#7A2929]">
                    Revision Requested
                  </h3>

                  <p className="mt-1 text-sm text-gray-600">
                    The proposal has been returned to underwriting.
                  </p>

                  <div className="mt-3 rounded-lg bg-white p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Sales Comment
                    </p>

                    <p className="mt-1 text-sm text-gray-700">
                      {comments}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={generateRevision}
                className="mt-4 flex items-center gap-2 rounded-lg bg-[#1E5A45] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#12352B]"
              >
                <Send size={16} />
                Create New Revision
              </button>
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* WORKFLOW */}
        {/* ========================================================= */}

        <section className="mt-6 rounded-2xl border border-[#D7E5DC] bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#12352B]">
              Proposal Workflow
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Current lifecycle of this proposal.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {/* STEP 1 */}

            <div className="relative rounded-xl border border-[#BBDAC6] bg-[#F0F7F2] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1E5A45] text-white">
                  <CheckCircle size={18} />
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Step 1
                  </p>

                  <p className="font-semibold text-[#12352B]">
                    Underwriting
                  </p>
                </div>
              </div>

              <p className="mt-3 text-xs text-gray-500">
                Benefits reviewed and options created.
              </p>
            </div>

            {/* STEP 2 */}

            <div className="relative rounded-xl border border-[#BBDAC6] bg-[#F0F7F2] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1E5A45] text-white">
                  <CheckCircle size={18} />
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Step 2
                  </p>

                  <p className="font-semibold text-[#12352B]">
                    PDF Generated
                  </p>
                </div>
              </div>

              <p className="mt-3 text-xs text-gray-500">
                Locked client/sales PDF generated.
              </p>
            </div>

            {/* STEP 3 */}

            <div className="relative rounded-xl border border-[#E7D39D] bg-[#FFF9EA] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E7A83B] text-white">
                  <Clock size={18} />
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Step 3
                  </p>

                  <p className="font-semibold text-[#7A5600]">
                    Sales Review
                  </p>
                </div>
              </div>

              <p className="mt-3 text-xs text-gray-500">
                Sales approves or returns the proposal.
              </p>
            </div>

            {/* STEP 4 */}

            <div className="relative rounded-xl border border-gray-200 bg-gray-50 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-300 text-gray-600">
                  <Lock size={17} />
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Step 4
                  </p>

                  <p className="font-semibold text-gray-700">
                    Master Locked
                  </p>
                </div>
              </div>

              <p className="mt-3 text-xs text-gray-500">
                Approved master becomes locked.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* VERSION HISTORY */}
        {/* ========================================================= */}

        <section className="mt-6 rounded-2xl border border-[#D7E5DC] bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-[#12352B]">
              Version History
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Every sales decision and revision is recorded.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#12352B] text-left text-white">
                  <th className="px-5 py-3">
                    Version
                  </th>

                  <th className="px-5 py-3">
                    Status
                  </th>

                  <th className="px-5 py-3">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {history.map((item, index) => (
                  <tr
                    key={`${item.version}-${index}`}
                    className="border-b border-gray-200 last:border-0"
                  >
                    <td className="px-5 py-4 font-semibold text-[#12352B]">
                      {item.version}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.status === "Sales Approved"
                            ? "bg-[#DCEFE3] text-[#1E5A45]"
                            : item.status === "Revision Requested"
                            ? "bg-[#FFF1F1] text-[#D95C5C]"
                            : item.status === "New Revision Created"
                            ? "bg-[#EAF1FF] text-[#315A9A]"
                            : "bg-[#FFF3D6] text-[#9A6800]"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-gray-500">
                      {item.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ========================================================= */}
        {/* AUDIT */}
        {/* ========================================================= */}

        <section className="mt-6 rounded-2xl border border-[#D7E5DC] bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-[#12352B]">
              Sales Review Audit
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Audit information for this proposal.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Reviewed By
              </p>

              <p className="mt-1 font-semibold text-gray-800">
                John Doe
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Role
              </p>

              <p className="mt-1 font-semibold text-gray-800">
                Sales
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Current Version
              </p>

              <p className="mt-1 font-semibold text-gray-800">
                {version}
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* FOOTER */}
        {/* ========================================================= */}

        <footer className="py-8 text-center text-xs text-gray-500">
          CANOPY Benefit Intelligence Platform
          <span className="mx-2">•</span>
          Benefit Schedule Automation
        </footer>
      </main>
    </div>
  );
};

export default ProposalSalesReview;