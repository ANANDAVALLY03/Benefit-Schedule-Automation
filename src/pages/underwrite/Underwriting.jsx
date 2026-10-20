
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Save,
  FileCheck2,
  AlertTriangle,
  Calculator,
  CheckCircle2,
  XCircle,
  Info,
  RefreshCw,
} from "lucide-react";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
).replace(/\/+$/, "");

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail = data?.detail;

    const message = Array.isArray(detail)
      ? detail.map((item) => item.msg || "Validation error").join(", ")
      : typeof detail === "string"
        ? detail
        : data?.message || `Request failed (${response.status})`;

    throw new Error(message);
  }

  return data;
}

function resolveDocumentId() {
  const params = new URLSearchParams(window.location.search);

  const candidate =
    params.get("documentId") ||
    params.get("document_id") ||
    sessionStorage.getItem("lastDocumentId");

  const id = Number(candidate);

  return Number.isInteger(id) && id > 0 ? id : null;
}

function benefitName(item) {
  return (
    item.benefit_name ||
    item.name ||
    item.benefit ||
    item.coverage_name ||
    `Benefit ${item.id ?? ""}`.trim()
  );
}

function currentValue(item) {
  const value = [
    item.limits,
    item.percentages,
    item.visits,
    item.deductibles,
    item.copay_ucr,
    item.benefit_treatment,
    item.proposed_value,
    item.value,
  ].find(
    (value) =>
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
  );

  if (value === undefined) return "";

  return typeof value === "object"
    ? JSON.stringify(value)
    : String(value);
}

/*
 * IMPORTANT:
 * If the underwriter leaves an option field empty,
 * use the corresponding Current Plan value.
 *
 * If a custom value is entered, use that instead.
 */
function getFinalOptionValue(enteredValue, currentPlanValue) {
  if (
    enteredValue === null ||
    enteredValue === undefined ||
    String(enteredValue).trim() === ""
  ) {
    return currentPlanValue ?? "";
  }

  return enteredValue;
}

const inputClass =
  "w-full rounded-lg border border-[#D5E2DA] bg-white px-3 py-2 text-sm text-[#12352B] outline-none focus:border-[#1E5A45] focus:ring-1 focus:ring-[#1E5A45]";

const cardClass = "rounded-xl border border-[#D5E2DA] bg-white";

export default function Underwriting() {
  const [documentId, setDocumentId] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [benefits, setBenefits] = useState([]);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(1);
  const [pricingOptions, setPricingOptions] = useState([]);
  const [commission, setCommission] = useState(5);
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [pendingExceptions, setPendingExceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadWorkspace = useCallback(async (id) => {
    setLoading(true);
    setError("");
    setNotice("");

    try {
      const [
        workspaceData,
        optionsData,
        pricingData,
        benefitsData,
      ] = await Promise.all([
        apiRequest(`/api/underwriting/${id}/workspace`),
        apiRequest(`/api/underwriting/${id}/options`),
        apiRequest(`/api/underwriting/${id}/pricing`),
        apiRequest(`/api/benefits/by-document/${id}`),
      ]);

      setWorkspace(workspaceData);

      const raw = Array.isArray(benefitsData)
        ? benefitsData
        : Array.isArray(benefitsData?.benefits)
          ? benefitsData.benefits
          : Array.isArray(workspaceData?.current_plan)
            ? workspaceData.current_plan
            : [];

      const normalized = raw.map((item, index) => ({
        ...item,
        id: Number(item.id ?? item.benefit_id ?? index + 1),
        benefit: benefitName(item),
        currentPlan: currentValue(item),
      }));

      setBenefits(normalized);

      const savedOptions = Array.isArray(optionsData?.options)
        ? optionsData.options
        : [];

      setOptions(
        [1, 2, 3].map((number) => {
          const found = savedOptions.find(
            (item) =>
              Number(item.id ?? item.option_number) === number
          );

          const values = found?.values || {};

          return {
            id: number,
            name:
              found?.name ||
              found?.option_name ||
              `Option ${number}`,
            values: Object.fromEntries(
              normalized.map((benefit) => [
                String(benefit.id),
                values[String(benefit.id)] ??
                  values[benefit.id] ??
                  "",
              ])
            ),
          };
        })
      );

      setSelectedOption(Number(optionsData?.selected_option || 1));

      const dbOptions = Array.isArray(pricingData?.options)
        ? pricingData.options
        : [];

      const premiums = Array.isArray(pricingData?.premiums)
        ? pricingData.premiums
        : [];

      setPricingOptions(
        [1, 2, 3].map((number) => {
          const dbOption = dbOptions.find(
            (item) => Number(item.option_number) === number
          );

          const premium = premiums.find(
            (item) => Number(item.option_id) === Number(dbOption?.id)
          );

          return {
            optionNumber: number,
            optionId: dbOption?.id ?? null,
            name:
              dbOption?.option_name || `Option ${number}`,
            basePremium:
              premium?.base_premium == null
                ? ""
                : String(premium.base_premium),
            totalPremium: premium?.total_premium ?? null,
          };
        })
      );

      setCommission(
        Number(pricingData?.commission_percentage ?? 5)
      );

      setCurrencyCode(pricingData?.currency_code || "INR");

      setPendingExceptions(
        Array.isArray(workspaceData?.pending_exceptions)
          ? workspaceData.pending_exceptions
          : []
      );

      setSaved(false);
    } catch (err) {
      setError(
        err.message || "Unable to load the underwriting workspace."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = resolveDocumentId();

    setDocumentId(id);

    if (id) {
      loadWorkspace(id);
    } else {
      setLoading(false);
      setError(
        "No document ID found. Open this page from a project/document, " +
          "or provide ?documentId=<numeric ID> in the URL."
      );
    }
  }, [loadWorkspace]);

  const changeValue = (optionNumber, benefitId, value) => {
    setOptions((current) =>
      current.map((option) =>
        option.id === optionNumber
          ? {
              ...option,
              values: {
                ...option.values,
                [String(benefitId)]: value,
              },
            }
          : option
      )
    );

    setSaved(false);
    setNotice("");
  };

  const changeName = (optionNumber, name) => {
    setOptions((current) =>
      current.map((option) =>
        option.id === optionNumber
          ? { ...option, name }
          : option
      )
    );

    setSaved(false);
  };

  const changePremium = (optionNumber, value) => {
    setPricingOptions((current) =>
      current.map((option) =>
        option.optionNumber === optionNumber
          ? { ...option, basePremium: value }
          : option
      )
    );

    setSaved(false);
  };

  /*
   * Resolve all option values.
   * Empty fields inherit Current Plan values.
   */
  const resolvedOptions = useMemo(
    () =>
      options.map((option) => ({
        ...option,
        values: Object.fromEntries(
          benefits.map((benefit) => [
            String(benefit.id),
            getFinalOptionValue(
              option.values[String(benefit.id)],
              benefit.currentPlan
            ),
          ])
        ),
      })),
    [options, benefits]
  );

  const premiumPreview = useMemo(
    () =>
      pricingOptions.map((option) => {
        const base =
          option.basePremium === ""
            ? null
            : Number(option.basePremium);

        const commissionAmount =
          base === null || !Number.isFinite(base)
            ? null
            : (base * Number(commission || 0)) / 100;

        return {
          ...option,
          commissionAmount,
          total:
            commissionAmount === null
              ? null
              : base + commissionAmount,
        };
      }),
    [pricingOptions, commission]
  );

  const money = (value) =>
    value == null ||
    value === "" ||
    !Number.isFinite(Number(value))
      ? "—"
      : new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: currencyCode,
          maximumFractionDigits: 2,
        }).format(Number(value));

  /*
   * Save resolved option values, not the empty input strings.
   */
  const saveDraft = async () => {
    if (!documentId) {
      throw new Error("No document selected.");
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const payloadOptions = resolvedOptions
        .filter((option) => option.name.trim())
        .map((option) => ({
          option_number: option.id,
          name: option.name.trim(),
          values: benefits.map((benefit) => ({
            benefit_id: benefit.id,
            proposed_value: String(
              getFinalOptionValue(
                option.values[String(benefit.id)],
                benefit.currentPlan
              )
            ),
          })),
        }));

      if (!payloadOptions.length) {
        throw new Error(
          "Enter a name for at least one coverage option."
        );
      }

      if (
        !payloadOptions.some(
          (option) => option.option_number === selectedOption
        )
      ) {
        throw new Error(
          "The selected option must have a valid option name."
        );
      }

      await apiRequest(
        `/api/underwriting/${documentId}/options`,
        {
          method: "PUT",
          body: JSON.stringify({
            selected_option: selectedOption,
            options: payloadOptions,
          }),
        }
      );

      /*
       * Options may be recreated by the backend.
       * Fetch fresh database IDs before saving pricing.
       */
      const latestPricingData = await apiRequest(
        `/api/underwriting/${documentId}/pricing`
      );

      const latestDbOptions = Array.isArray(
        latestPricingData?.options
      )
        ? latestPricingData.options
        : [];

      const pricingPayload = pricingOptions
        .filter((item) => item.basePremium !== "")
        .map((item) => {
          const dbOption = latestDbOptions.find(
            (row) =>
              Number(row.option_number) === item.optionNumber
          );

          return dbOption
            ? {
                option_id: Number(dbOption.id),
                base_premium: Number(item.basePremium),
                is_selected:
                  item.optionNumber === selectedOption,
              }
            : null;
        })
        .filter(Boolean);

      if (pricingPayload.length) {
        if (
          pricingPayload.some(
            (item) =>
              !Number.isFinite(item.base_premium) ||
              item.base_premium < 0
          )
        ) {
          throw new Error(
            "Enter valid non-negative base premiums."
          );
        }

        if (
          !pricingPayload.some((item) => item.is_selected)
        ) {
          throw new Error(
            "Enter a base premium for the selected option before saving pricing."
          );
        }

        await apiRequest(
          `/api/underwriting/${documentId}/pricing`,
          {
            method: "PUT",
            body: JSON.stringify({
              commission_percentage: Number(commission),
              currency_code: currencyCode,
              options: pricingPayload,
            }),
          }
        );
      }

      setSaved(true);

      setNotice(
        "Coverage options were saved. Empty benefit fields use their Current Plan values. " +
          "Available pricing was saved."
      );

      /*
       * Do not reload the page state here: doing so would reset
       * the empty inputs and may cause unnecessary UI flickering.
       */
    } catch (err) {
      setError(
        err.message || "Unable to save underwriting changes."
      );

      throw err;
    } finally {
      setSaving(false);
    }
  };

  const validateAndGenerate = async () => {
    setValidating(true);
    setError("");
    setNotice("");

    try {
      if (!benefits.length) {
        throw new Error(
          "No benefits were returned for this document."
        );
      }

      /*
       * Validate resolved values. Empty values inherit Current Plan.
       */
      const selected = resolvedOptions.find(
        (option) => option.id === selectedOption
      );

      if (!selected) {
        throw new Error("Select a valid coverage option.");
      }

      const missing = benefits.filter((benefit) => {
        const value = selected.values[String(benefit.id)];

        return (
          value === null ||
          value === undefined ||
          String(value).trim() === ""
        );
      });

      if (missing.length) {
        throw new Error(
          `The following benefits have no value in the Current Plan either: ${
            missing.map((item) => item.benefit).join(", ")
          }. Please enter values for these benefits.`
        );
      }

      if (pendingExceptions.length) {
        throw new Error(
          "Resolve pending exceptions before generating the proposal."
        );
      }

      await saveDraft();

      setNotice(
        "Validation passed. Empty option fields used Current Plan values, " +
          "and options/pricing were saved. Actual PDF generation is not connected yet."
      );
    } catch (err) {
      /*
       * saveDraft already displays its error.
       * This also handles validation errors.
       */
      setError(err.message || "Validation failed.");
    } finally {
      setValidating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-full bg-[#F7F5EF] p-6 text-[#12352B]">
        Loading underwriting workspace…
      </div>
    );
  }

  return (
    <div className="min-h-full space-y-6 bg-[#F7F5EF] p-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#12352B]">
            Underwriting Workspace
          </h1>

          <p className="mt-1 text-sm text-[#5F7168]">
            Review mapped benefits, maintain up to three coverage
            options, save pricing, and validate proposal readiness.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-2 text-sm font-medium text-[#1E5A45]">
              <CheckCircle2 size={17} />
              Saved
            </span>
          )}

          <button
            type="button"
            onClick={() => documentId && loadWorkspace(documentId)}
            className="inline-flex items-center gap-2 rounded-lg border border-[#D5E2DA] bg-white px-3 py-2.5 text-sm font-semibold text-[#12352B]"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            type="button"
            disabled={saving || !documentId}
            onClick={async () => {
              try {
                await saveDraft();
              } catch {
                // Error is displayed by saveDraft.
              }
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-[#1E5A45] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#164A38] disabled:opacity-60"
          >
            <Save size={17} />
            {saving ? "Saving…" : "Save Draft"}
          </button>
        </div>
      </header>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-[#E5BABA] bg-[#FFF1F1] p-4">
          <XCircle size={20} className="mt-0.5 text-[#C94C4C]" />

          <div>
            <p className="text-sm font-bold text-[#9B3838]">
              Action failed
            </p>

            <p className="mt-1 text-sm text-[#A84A4A]">
              {error}
            </p>
          </div>
        </div>
      )}

      {notice && (
        <div className="flex items-start gap-3 rounded-xl border border-[#D5E2DA] bg-[#E8F2EC] p-4">
          <Info size={18} className="mt-0.5 text-[#1E5A45]" />

          <p className="text-sm text-[#1E5A45]">{notice}</p>
        </div>
      )}

      <section className={`${cardClass} p-5`}>
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6B8076]">
              Project
            </p>

            <h2 className="mt-1 text-lg font-bold text-[#12352B]">
              {workspace?.client_name || `Document ${documentId}`}
            </h2>
          </div>

          <div className="flex flex-wrap gap-8">
            <div>
              <p className="text-xs text-[#6B8076]">Project ID</p>
              <p className="mt-1 text-sm font-semibold text-[#12352B]">
                {workspace?.project_id ?? "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-[#6B8076]">Document ID</p>
              <p className="mt-1 text-sm font-semibold text-[#12352B]">
                {documentId}
              </p>
            </div>

            <div>
              <p className="text-xs text-[#6B8076]">Draft version</p>
              <p className="mt-1 text-sm font-semibold text-[#12352B]">
                {workspace?.draft?.version_label || "Not created"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {pendingExceptions.length > 0 && (
        <section className="flex items-start gap-3 rounded-xl border border-[#E7C875] bg-[#FFF8E6] p-4">
          <AlertTriangle
            size={20}
            className="mt-0.5 text-[#B7791F]"
          />

          <div>
            <p className="text-sm font-bold text-[#7A5413]">
              Pending Exceptions
            </p>

            <p className="mt-1 text-sm text-[#7A641F]">
              {pendingExceptions.length} pending exception(s).
              Resolve them before proposal generation.
            </p>

            <ul className="mt-2 list-inside list-disc text-sm text-[#7A641F]">
              {pendingExceptions.map((item, index) => (
                <li key={item.id ?? index}>
                  {item.benefit_name ||
                    item.benefit ||
                    item.title ||
                    `Exception ${item.id ?? index + 1}`}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className={`${cardClass} overflow-hidden`}>
        <div className="border-b border-[#D5E2DA] px-5 py-4">
          <h2 className="text-lg font-bold text-[#12352B]">
            Benefit Options
          </h2>

          <p className="mt-1 text-sm text-[#6B8076]">
            Leave an option field empty to use the corresponding
            Current Plan value. Enter a value only when you want to
            change that benefit.
          </p>
        </div>

        {!benefits.length ? (
          <p className="p-5 text-sm text-[#6B8076]">
            No benefits were returned. Confirm the document ID and
            Benefits API response.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px]">
              <thead>
                <tr className="border-b border-[#D5E2DA] bg-[#F7F5EF]">
                  {[
                    "Benefit",
                    "Current Plan",
                    "Option 1",
                    "Option 2",
                    "Option 3",
                  ].map((title) => (
                    <th
                      key={title}
                      className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-[#53665D]"
                    >
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {benefits.map((benefit) => (
                  <tr
                    key={benefit.id}
                    className="border-b border-[#E6EEE9] last:border-0"
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-[#12352B]">
                        {benefit.benefit}
                      </p>

                      {benefit.benefit_category && (
                        <p className="mt-1 text-xs text-[#6B8076]">
                          {benefit.benefit_category}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <div className="rounded-lg border border-[#DDE6E0] bg-[#F1F4F1] px-3 py-2 text-sm text-[#53665D]">
                        {benefit.currentPlan || "—"}
                      </div>
                    </td>

                    {[1, 2, 3].map((number) => {
                      const option = options.find(
                        (item) => item.id === number
                      );

                      const enteredValue =
                        option?.values[String(benefit.id)] ?? "";

                      return (
                        <td key={number} className="px-4 py-4">
                          <input
                            className={inputClass}
                            aria-label={`${benefit.benefit} Option ${number}`}
                            value={enteredValue}
                            onChange={(event) =>
                              changeValue(
                                number,
                                benefit.id,
                                event.target.value
                              )
                            }
                            placeholder={
                              benefit.currentPlan
                                ? `Default: ${benefit.currentPlan}`
                                : "Enter coverage"
                            }
                          />

                          {String(enteredValue).trim() === "" &&
                            benefit.currentPlan && (
                              <p className="mt-1 text-xs text-[#6B8076]">
                                Uses Current Plan
                              </p>
                            )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="grid gap-3 border-t border-[#D5E2DA] p-5 md:grid-cols-3">
          {options.map((option) => (
            <div
              key={option.id}
              className="rounded-lg border border-[#D5E2DA] p-3"
            >
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#53665D]">
                Option {option.id} name
              </label>

              <input
                className={inputClass}
                value={option.name}
                maxLength={150}
                onChange={(event) =>
                  changeName(option.id, event.target.value)
                }
              />

              <label className="mt-3 flex items-center gap-2 text-sm text-[#12352B]">
                <input
                  type="radio"
                  name="selected-option"
                  checked={selectedOption === option.id}
                  onChange={() => {
                    setSelectedOption(option.id);
                    setSaved(false);
                  }}
                />
                Selected option
              </label>
            </div>
          ))}
        </div>
      </section>

      <section className={`${cardClass} overflow-hidden`}>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D5E2DA] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8F2EC] text-[#1E5A45]">
              <Calculator size={19} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#12352B]">
                Premium Calculation
              </h2>

              <p className="text-sm text-[#6B8076]">
                Enter a base premium for each saved coverage option.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label
              className="text-sm font-semibold text-[#53665D]"
              htmlFor="commission"
            >
              Commission (%)
            </label>

            <input
              id="commission"
              className={`${inputClass} w-24`}
              type="number"
              min="0"
              max="10"
              step="0.5"
              value={commission}
              onChange={(event) => {
                const value = Number(event.target.value);

                setCommission(
                  Math.min(
                    10,
                    Math.max(
                      0,
                      Number.isFinite(value) ? value : 0
                    )
                  )
                );

                setSaved(false);
              }}
            />

            <label
              className="text-sm font-semibold text-[#53665D]"
              htmlFor="currency"
            >
              Currency
            </label>

            <select
              id="currency"
              className={`${inputClass} w-28`}
              value={currencyCode}
              onChange={(event) => {
                setCurrencyCode(event.target.value);
                setSaved(false);
              }}
            >
              <option value="INR">INR</option>
              <option value="USD">USD</option>
              <option value="CAD">CAD</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto p-5">
          <table className="w-full min-w-[650px]">
            <thead>
              <tr className="border-b border-[#D5E2DA]">
                {[
                  "Coverage option",
                  "Base premium",
                  "Commission amount",
                  "Total premium",
                ].map((title) => (
                  <th
                    key={title}
                    className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-[#53665D]"
                  >
                    {title}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {premiumPreview.map((option) => (
                <tr
                  key={option.optionNumber}
                  className="border-b border-[#E6EEE9] last:border-0"
                >
                  <td className="px-4 py-4">
                    <div className="text-sm font-semibold text-[#12352B]">
                      {option.name}
                    </div>

                    {option.optionNumber === selectedOption && (
                      <span className="mt-1 inline-block text-xs font-semibold text-[#1E5A45]">
                        Selected
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-4">
                    <input
                      className={inputClass}
                      type="number"
                      min="0"
                      step="0.01"
                      value={option.basePremium}
                      onChange={(event) =>
                        changePremium(
                          option.optionNumber,
                          event.target.value
                        )
                      }
                      placeholder="Enter base premium"
                    />
                  </td>

                  <td className="px-4 py-4 text-sm text-[#53665D]">
                    {money(option.commissionAmount)}
                  </td>

                  <td className="px-4 py-4 text-sm font-semibold text-[#12352B]">
                    {money(option.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="mt-3 text-xs text-[#7A8A82]">
            Commission and total are previews. The backend calculates
            and stores final values when pricing is saved.
          </p>
        </div>
      </section>

      <section
        className={`${cardClass} flex flex-wrap items-center justify-between gap-4 p-5`}
      >
        <div>
          <h3 className="text-sm font-bold text-[#12352B]">
            Ready to generate proposal?
          </h3>

          <p className="mt-1 text-sm text-[#6B8076]">
            Empty benefit fields inherit Current Plan values.
            Resolve pending exceptions before proceeding.
          </p>
        </div>

        <button
          type="button"
          disabled={validating || saving || !documentId}
          onClick={validateAndGenerate}
          className="inline-flex items-center gap-2 rounded-lg bg-[#1E5A45] px-5 py-3 text-sm font-semibold text-white hover:bg-[#164A38] disabled:opacity-60"
        >
          <FileCheck2 size={18} />
          {validating
            ? "Validating…"
            : "Validate & Generate PDF"}
        </button>
      </section>
    </div>
  );
}
