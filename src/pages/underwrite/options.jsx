import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Check,
  Plus,
  Save,
  ArrowRight,
  Trash2,
  AlertTriangle,
} from "lucide-react";

import { getBenefits } from "../../services/apis";

const MAX_OPTIONS = 3;

const COVERAGE_FIELDS = [
  "limits",
  "percentages",
  "visits",
  "copay_ucr",
  "deductibles",
  "benefit_treatment",
  "other_attributes",
];

const isAvailable = (value) => {
  if (value === null || value === undefined) return false;

  if (typeof value === "string") {
    const text = value.trim();
    return text !== "" && text.toUpperCase() !== "N/A";
  }

  return true;
};

const formatValue = (value) => {
  if (!isAvailable(value)) return "N/A";

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
};

const getPrimaryCoverage = (benefit) => {
  for (const field of COVERAGE_FIELDS) {
    if (isAvailable(benefit[field])) {
      return {
        field,
        value: formatValue(benefit[field]),
      };
    }
  }

  return {
    field: null,
    value: "N/A",
  };
};

const createOption = (id) => ({
  id,
  name: `Option ${id}`,
  values: {},
});

function Options() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const documentId =
    searchParams.get("documentId") ||
    sessionStorage.getItem("lastDocumentId");

  const storageKey = `canopy-simple-coverage-${documentId}`;

  const [benefits, setBenefits] = useState([]);
  const [options, setOptions] = useState([
    createOption(1),
  ]);

  const [selectedOption, setSelectedOption] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");

  // LOAD BENEFITS FROM BACKEND
  useEffect(() => {
    let active = true;

    async function loadBenefits() {
      if (!documentId) {
        setError("Please select a document first.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await getBenefits(Number(documentId));
        const data = response?.data ?? response;

        const records = Array.isArray(data)
          ? data
          : Array.isArray(data?.benefits)
          ? data.benefits
          : [];

        if (!active) return;

        const normalized = records.map((item, index) => {
          const coverage = getPrimaryCoverage(item);

          return {
            id: item.id ?? index + 1,
            name:
              item.benefit_name ||
              item.name ||
              `Benefit ${index + 1}`,
            category: item.benefit_category || "",
            current: coverage.value,
            coverageField: coverage.field,
          };
        });

        setBenefits(normalized);

        const stored = localStorage.getItem(storageKey);

        if (stored) {
          const parsed = JSON.parse(stored);

          if (Array.isArray(parsed.options)) {
            const restored = parsed.options.slice(0, MAX_OPTIONS);

            if (restored.length > 0) {
              setOptions(restored);
              setSelectedOption(
                restored.some(
                  (option) => option.id === parsed.selectedOption
                )
                  ? parsed.selectedOption
                  : restored[0].id
              );
            }
          }
        }
      } catch (err) {
        if (active) {
          setError(
            err?.response?.data?.detail ||
              err?.message ||
              "Unable to load benefits."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadBenefits();

    return () => {
      active = false;
    };
  }, [documentId, storageKey]);

  // CREATE OPTION 2 OR 3
  const addOption = () => {
    if (options.length >= MAX_OPTIONS) return;

    const nextId = [1, 2, 3].find(
      (id) => !options.some((option) => option.id === id)
    );

    if (!nextId) return;

    setOptions((previous) => [
      ...previous,
      createOption(nextId),
    ]);

    setSelectedOption(nextId);
    setDirty(true);
    setSaved(false);
  };

  // REMOVE OPTION
  const removeOption = (id) => {
    if (id === 1) return;

    setOptions((previous) =>
      previous.filter((option) => option.id !== id)
    );

    if (selectedOption === id) {
      setSelectedOption(1);
    }

    setDirty(true);
    setSaved(false);
  };

  // UPDATE PROPOSED COVERAGE
  const updateValue = (optionId, benefitId, value) => {
    setOptions((previous) =>
      previous.map((option) =>
        option.id === optionId
          ? {
              ...option,
              values: {
                ...option.values,
                [benefitId]: value,
              },
            }
          : option
      )
    );

    setDirty(true);
    setSaved(false);
  };

  // UPDATE OPTION NAME
  const updateOptionName = (optionId, name) => {
    setOptions((previous) =>
      previous.map((option) =>
        option.id === optionId
          ? { ...option, name }
          : option
      )
    );

    setDirty(true);
    setSaved(false);
  };

  // COUNT ACTUAL CHANGES
  const getChangesCount = (option) => {
    return benefits.filter((benefit) => {
      const proposed = option.values?.[benefit.id];

      return (
        typeof proposed === "string" &&
        proposed.trim() !== "" &&
        proposed.trim() !== benefit.current
      );
    }).length;
  };

  // SAVE DRAFT
  const saveOptions = () => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          documentId,
          selectedOption,
          options,
        })
      );

      setSaved(true);
      setDirty(false);
      setError("");
    } catch {
      setError("Unable to save options.");
    }
  };

  // CONTINUE TO PRICING
  const continueToPricing = () => {
    if (dirty) {
      setError("Please save your changes first.");
      return;
    }

    if (!localStorage.getItem(storageKey)) {
      setError("Please save your options first.");
      return;
    }

    navigate(
      `/underwriter/pricing?documentId=${encodeURIComponent(
        documentId
      )}`
    );
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500">
        Loading benefits...
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#f6f8f7]">

      {/* PAGE HEADER */}
      <div className="px-7 pt-6 pb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#dcefe9] flex items-center justify-center">
              <Check
                size={22}
                className="text-[#006653]"
              />
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-[#073f35]">
                Coverage Options
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Create and compare proposed benefit coverage
              </p>
            </div>
          </div>

          <span className="px-4 py-2 rounded-full bg-[#fff1d7] text-[#a56600] text-sm font-medium">
            Underwriting In Progress
          </span>

        </div>
      </div>

      <div className="px-7 pb-7 space-y-6">

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
            <AlertTriangle size={18} />
            {error}
          </div>
        )}

        {/* BENEFIT COMPARISON */}
        <div className="bg-white border border-[#d7e1de] rounded-xl overflow-hidden">

          <div className="px-6 py-5 border-b border-[#d7e1de] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div>
              <h2 className="text-lg font-semibold text-[#073f35]">
                Benefit Comparison
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Enter proposed coverage values for each option.
              </p>
            </div>

            <div className="flex items-center gap-3">

              <span className="text-xs bg-[#e5f6ef] text-[#00785f] px-3 py-1.5 rounded-full">
                {benefits.length} Benefits
              </span>

              {options.length < MAX_OPTIONS && (
                <button
                  onClick={addOption}
                  disabled={benefits.length === 0}
                  className="flex items-center gap-2 bg-[#006653] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#005344] disabled:opacity-50"
                >
                  <Plus size={17} />
                  Create Option
                </button>
              )}

            </div>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[650px] border-collapse">

              <thead>
                <tr className="bg-[#f4f8f6]">

                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-600 border-b">
                    Benefit
                  </th>

                  <th className="text-left px-4 py-4 text-xs font-semibold text-gray-600 border-b">
                    Current Plan
                  </th>

                  {options.map((option) => (
                    <th
                      key={option.id}
                      className="text-left px-4 py-4 text-xs font-semibold text-[#006653] border-b"
                    >
                      <div className="flex items-center justify-between gap-3">

                        <span>{option.name}</span>

                        {option.id !== 1 && (
                          <button
                            onClick={() => removeOption(option.id)}
                            title="Remove Option"
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}

                      </div>
                    </th>
                  ))}

                </tr>
              </thead>

              <tbody>
                {benefits.map((benefit) => (
                  <tr
                    key={benefit.id}
                    className="hover:bg-[#fafcfb]"
                  >

                    <td className="px-5 py-4 border-b">
                      <p className="text-sm font-medium text-[#073f35]">
                        {benefit.name}
                      </p>
                    </td>

                    <td className="px-4 py-4 border-b">
                      <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
                        {benefit.current}
                      </div>
                    </td>

                    {options.map((option) => (
                      <td
                        key={option.id}
                        className="px-4 py-4 border-b min-w-[190px]"
                      >
                        <input
                          type="text"
                          value={
                            option.values?.[benefit.id] ?? ""
                          }
                          onChange={(event) =>
                            updateValue(
                              option.id,
                              benefit.id,
                              event.target.value
                            )
                          }
                          placeholder={benefit.current}
                          className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#bde5d8] ${
                            selectedOption === option.id
                              ? "border-[#009879] bg-[#f1faf7]"
                              : "border-[#d7e1de]"
                          }`}
                        />
                      </td>
                    ))}

                  </tr>
                ))}

                {benefits.length === 0 && (
                  <tr>
                    <td
                      colSpan={options.length + 2}
                      className="p-8 text-center text-sm text-gray-500"
                    >
                      No extracted benefits found for this document.
                    </td>
                  </tr>
                )}

              </tbody>
            </table>

          </div>

          <p className="px-5 py-3 text-xs text-gray-400 border-t">
            Leave an option value empty to keep the current coverage.
          </p>

        </div>

        {/* PROPOSAL OPTIONS & PRICING */}
        <div>

          <div className="mb-4">
            <h2 className="text-lg font-semibold text-[#073f35]">
              Proposal Options & Pricing
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Pricing will be calculated after configuring the options.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {options.map((option) => (
              <div
                key={option.id}
                className={`bg-white rounded-xl border p-5 transition ${
                  selectedOption === option.id
                    ? "border-[#009879] ring-2 ring-[#d8f1e8]"
                    : "border-[#d7e1de]"
                }`}
              >

                <div className="flex items-start justify-between">

                  <div>
                    <p className="text-xs text-gray-500">
                      Coverage Proposal
                    </p>

                    <h3 className="text-lg font-semibold text-[#073f35] mt-1">
                      Option {option.id}
                    </h3>
                  </div>

                  {selectedOption === option.id && (
                    <div className="w-7 h-7 rounded-full bg-[#009879] flex items-center justify-center">
                      <Check
                        size={17}
                        className="text-white"
                      />
                    </div>
                  )}

                </div>

                <input
                  type="text"
                  value={option.name}
                  onChange={(event) =>
                    updateOptionName(
                      option.id,
                      event.target.value
                    )
                  }
                  placeholder="Option Name"
                  className="mt-4 w-full px-3 py-2 rounded-lg border border-[#d7e1de] text-sm"
                />

                <p className="text-sm text-gray-500 mt-4">
                  {getChangesCount(option)} proposed changes
                </p>

                <div className="mt-5 pt-4 border-t border-[#d7e1de]">
                  <p className="text-xs text-gray-500">
                    Estimated Premium
                  </p>

                  <p className="text-lg font-semibold text-[#073f35] mt-1">
                    Pricing Pending
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedOption(option.id);
                    setDirty(true);
                    setSaved(false);
                  }}
                  className={`w-full mt-5 py-2.5 rounded-lg text-sm font-medium ${
                    selectedOption === option.id
                      ? "bg-[#006653] text-white"
                      : "border border-[#006653] text-[#006653] hover:bg-[#eef8f4]"
                  }`}
                >
                  {selectedOption === option.id
                    ? "Selected"
                    : "Select Option"}
                </button>

              </div>
            ))}

          </div>
        </div>

        {/* ACTION BAR */}
        <div className="bg-white border border-[#d7e1de] rounded-xl p-5">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div>
              <p className="text-sm font-medium text-[#073f35]">
                Option Configuration
              </p>

              <p className="text-xs text-gray-500 mt-1">
                {saved && !dirty
                  ? "Your draft has been saved."
                  : "Save your options before continuing to pricing."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">

              <button
                onClick={saveOptions}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-[#006653] text-[#006653] hover:bg-[#eef8f4] text-sm font-medium"
              >
                <Save size={18} />

                {saved && !dirty
                  ? "Options Saved"
                  : "Save Options"}
              </button>

              <button
                onClick={continueToPricing}
                disabled={dirty}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#006653] hover:bg-[#005344] text-white text-sm font-medium disabled:opacity-50"
              >
                Continue to Pricing
                <ArrowRight size={18} />
              </button>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Options;