import { useState } from "react";

const initialBenefits = [
  {
    name: "Doctor Visit",
    current: "$50",
    option1: "$30",
    option2: "$20",
    option3: "$10",
  },
  {
    name: "Specialist (Referred)",
    current: "80%",
    option1: "80%",
    option2: "90%",
    option3: "100%",
  },
  {
    name: "Dental Annual Limit",
    current: "$1,000",
    option1: "$1,500",
    option2: "$2,000",
    option3: "$2,500",
  },
  {
    name: "Optical Annual Limit",
    current: "$500",
    option1: "$750",
    option2: "$1,000",
    option3: "$1,500",
  },
  {
    name: "Maternity",
    current: "N/A",
    option1: "N/A",
    option2: "$5,000",
    option3: "$7,500",
  },
];

function ProposalSalesReview() {
  const [version, setVersion] = useState("v1.0");

  const [status, setStatus] = useState(
    "Awaiting Sales Review"
  );

  const [decision, setDecision] = useState("");

  const [comments, setComments] = useState("");

  const [showChanges, setShowChanges] = useState(false);

  const [history, setHistory] = useState([
    {
      version: "v1.0",
      status: "Awaiting Sales Review",
      date: new Date().toLocaleString(),
    },
  ]);

  const generateRevision = () => {
    const currentNumber = Number(
      version.replace("v1.", "")
    );

    const newVersion = `v1.${currentNumber + 1}`;

    setVersion(newVersion);

    setStatus("Awaiting Sales Review");

    setDecision("");

    setComments("");

    setShowChanges(false);

    setHistory((prev) => [
      ...prev,
      {
        version: newVersion,
        status: "Awaiting Sales Review",
        date: new Date().toLocaleString(),
      },
    ]);
  };

  const handleApprove = () => {
    setDecision("Approve");

    setStatus("Awaiting Client Approval");

    setHistory((prev) => [
      ...prev,
      {
        version,
        status: "Awaiting Client Approval",
        date: new Date().toLocaleString(),
      },
    ]);
  };

  const handleChanges = () => {
    if (!comments.trim()) {
      alert("Please enter revision notes.");
      return;
    }

    setDecision("Changes");

    setStatus("Revision Requested");

    setHistory((prev) => [
      ...prev,
      {
        version,
        status: "Revision Requested",
        date: new Date().toLocaleString(),
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb]">

      {/* HEADER */}
      <header className="bg-white border-b px-8 py-4 flex items-center justify-between">

        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Canopy
          </h1>

          <p className="text-sm text-gray-500">
            Benefit Schedule Automation
          </p>
        </div>

        <div className="text-right">

          <p className="text-sm font-medium text-gray-700">
            Sales Review
          </p>

          <p className="text-xs text-gray-500">
            Proposal Review Portal
          </p>

        </div>

      </header>


      {/* MAIN */}
      <main className="p-8 max-w-[1500px] mx-auto">

        {/* PROJECT HEADER */}
        <div className="bg-white rounded-xl border p-6 mb-6">

          <div className="flex justify-between items-start">

            <div>

              <p className="text-sm text-gray-500">
                Project
              </p>

              <h2 className="text-2xl font-bold text-gray-800">
                ABC Corporation
              </h2>

              <div className="flex gap-6 mt-3 text-sm">

                <span>
                  <b>Reference:</b> CAN-2026-001
                </span>

                <span>
                  <b>Insurer:</b> Sagicor
                </span>

                <span>
                  <b>Version:</b> {version}
                </span>

              </div>

            </div>


            {/* STATUS */}
            <div className="text-right">

              <span
                className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                  status === "Awaiting Sales Review"
                    ? "bg-yellow-100 text-yellow-700"
                    : status === "Awaiting Client Approval"
                    ? "bg-green-100 text-green-700"
                    : status === "Revision Requested"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {status}
              </span>

              <p className="text-xs text-gray-400 mt-2">
                Current proposal: {version}
              </p>

            </div>

          </div>

        </div>


        {/* TWO COLUMN LAYOUT */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-6">


          {/* PDF PREVIEW */}
          <div className="bg-white border rounded-xl overflow-hidden">

            <div className="border-b px-6 py-4 flex justify-between items-center">

              <div>

                <h2 className="font-semibold text-gray-800">
                  Proposal PDF
                </h2>

                <p className="text-xs text-gray-500">
                  Client-facing proposal · {version}
                </p>

              </div>


              <button
                onClick={() =>
                  alert("PDF download prototype")
                }
                className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
              >
                ↓ Download PDF
              </button>

            </div>


            {/* FAKE PDF */}
            <div className="p-8 bg-gray-100">

              <div className="bg-white shadow-lg max-w-[850px] mx-auto min-h-[900px] p-10">

                {/* PDF HEADER */}
                <div className="border-b pb-6 mb-6">

                  <h1 className="text-3xl font-bold text-gray-800">
                    CANOPY
                  </h1>

                  <p className="text-gray-500 mt-1">
                    Benefit Schedule Proposal
                  </p>

                </div>


                <div className="grid grid-cols-2 gap-4 mb-8 text-sm">

                  <div>
                    <p className="text-gray-500">
                      Client
                    </p>

                    <p className="font-semibold">
                      ABC Corporation
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">
                      Source Insurer
                    </p>

                    <p className="font-semibold">
                      Sagicor
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">
                      Proposal Version
                    </p>

                    <p className="font-semibold">
                      {version}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">
                      Date
                    </p>

                    <p className="font-semibold">
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>

                </div>


                {/* BENEFIT TABLE */}
                <div className="overflow-x-auto">

                  <table className="w-full border-collapse text-sm">

                    <thead>

                      <tr className="bg-gray-100">

                        <th className="border p-3 text-left">
                          Benefit
                        </th>

                        <th className="border p-3">
                          Current
                        </th>

                        <th className="border p-3">
                          Option 1
                        </th>

                        <th className="border p-3">
                          Option 2
                        </th>

                        <th className="border p-3">
                          Option 3
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {initialBenefits
                        .filter(
                          (benefit) =>
                            benefit.current !== "N/A"
                        )
                        .map((benefit, index) => (

                          <tr key={index}>

                            <td className="border p-3 font-medium">
                              {benefit.name}
                            </td>

                            <td className="border p-3 text-center">
                              {benefit.current}
                            </td>

                            <td className="border p-3 text-center">
                              {benefit.option1}
                            </td>

                            <td className="border p-3 text-center">
                              {benefit.option2}
                            </td>

                            <td className="border p-3 text-center">
                              {benefit.option3}
                            </td>

                          </tr>

                        ))}

                    </tbody>

                  </table>

                </div>


                <div className="mt-10 border-t pt-5 text-xs text-gray-400">

                  This proposal was generated by the
                  Canopy Benefit Schedule Automation platform.

                </div>

              </div>

            </div>

          </div>


          {/* SALES PANEL */}
          <div className="space-y-6">


            {/* DECISION CARD */}
            <div className="bg-white border rounded-xl p-6">

              <h2 className="font-semibold text-gray-800">
                Sales Decision
              </h2>

              <p className="text-sm text-gray-500 mt-1 mb-5">
                Review the proposal and select an action.
              </p>


              {/* APPROVE */}
              <button
                onClick={handleApprove}
                disabled={
                  status !== "Awaiting Sales Review"
                }
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white py-3 rounded-lg font-medium"
              >
                ✓ Approve Proposal
              </button>


              {/* CHANGES */}
              <button
                onClick={() => setShowChanges(true)}
                disabled={
                  status !== "Awaiting Sales Review"
                }
                className="w-full mt-3 border border-orange-400 text-orange-600 hover:bg-orange-50 disabled:border-gray-300 disabled:text-gray-400 py-3 rounded-lg font-medium"
              >
                Request Changes
              </button>


              {/* CHANGE FORM */}
              {showChanges && (
                <div className="mt-5">

                  <label className="text-sm font-medium">
                    Revision Notes
                  </label>

                  <textarea
                    value={comments}
                    onChange={(e) =>
                      setComments(e.target.value)
                    }
                    rows={5}
                    placeholder="Enter the changes required from the Underwriter..."
                    className="w-full border rounded-lg p-3 mt-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <button
                    onClick={handleChanges}
                    className="w-full mt-3 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg"
                  >
                    Send Changes to Underwriter
                  </button>

                </div>
              )}

            </div>


            {/* CURRENT STATUS */}
            <div className="bg-white border rounded-xl p-6">

              <h2 className="font-semibold text-gray-800 mb-4">
                Proposal Status
              </h2>

              <div className="space-y-4">

                <StatusStep
                  label="Underwriting"
                  completed
                />

                <StatusStep
                  label="PDF Generated"
                  completed
                />

                <StatusStep
                  label="Sales Review"
                  active={
                    status ===
                    "Awaiting Sales Review"
                  }
                  completed={
                    status !==
                    "Awaiting Sales Review"
                  }
                />

                <StatusStep
                  label="Client Approval"
                  active={
                    status ===
                    "Awaiting Client Approval"
                  }
                />

                <StatusStep
                  label="Final Lock"
                />

              </div>

            </div>


            {/* VERSION HISTORY */}
            <div className="bg-white border rounded-xl p-6">

              <h2 className="font-semibold text-gray-800 mb-4">
                Version History
              </h2>

              <div className="space-y-3">

                {history.map((item, index) => (

                  <div
                    key={index}
                    className="border-b pb-3 last:border-0"
                  >

                    <div className="flex justify-between">

                      <span className="font-medium text-sm">
                        {item.version}
                      </span>

                      <span className="text-xs text-gray-400">
                        {item.date}
                      </span>

                    </div>

                    <p className="text-xs text-gray-500 mt-1">
                      {item.status}
                    </p>

                  </div>

                ))}

              </div>

            </div>

          </div>

        </div>


        {/* REVISION RESULT */}
        {status === "Revision Requested" && (

          <div className="mt-6 bg-orange-50 border border-orange-200 rounded-xl p-6">

            <div className="flex justify-between items-center">

              <div>

                <h3 className="font-semibold text-orange-800">
                  Revision Requested
                </h3>

                <p className="text-sm text-orange-700 mt-1">
                  The proposal has been sent back to the
                  Underwriter.
                </p>

                <p className="text-sm mt-2">
                  <b>Sales Notes:</b> {comments}
                </p>

              </div>


              <button
                onClick={generateRevision}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg"
              >
                Generate Revised PDF
              </button>

            </div>

          </div>

        )}


        {/* APPROVED RESULT */}
        {status === "Awaiting Client Approval" && (

          <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-6">

            <h3 className="font-semibold text-green-800">
              ✓ Sales Approved
            </h3>

            <p className="text-sm text-green-700 mt-1">
              Proposal {version} has been approved by
              Sales and is ready for client approval.
            </p>

          </div>

        )}

      </main>

    </div>
  );
}


function StatusStep({
  label,
  active = false,
  completed = false,
}) {
  return (
    <div className="flex items-center gap-3">

      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
          completed
            ? "bg-green-500 text-white"
            : active
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-500"
        }`}
      >
        {completed ? "✓" : ""}
      </div>

      <span
        className={`text-sm ${
          active
            ? "font-semibold text-blue-600"
            : "text-gray-600"
        }`}
      >
        {label}
      </span>

    </div>
  );
}

export default ProposalSalesReview;