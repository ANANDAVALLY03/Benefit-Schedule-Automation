
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getBenefits,
  getCoverageOptions,
  saveCoverageOptions,
} from "../../services/apis";

const COLORS = {
  green: "#006B55",
  dark: "#004C40",
  mint: "#E0F4EC",
  border: "#D4E5DE",
  text: "#173C35",
  muted: "#71847E",
  background: "#F4F8F6",
  white: "#FFFFFF",
  red: "#B42318",
};

function normalizeBenefits(response) {
  const items = Array.isArray(response)
    ? response
    : response?.benefits || response?.data || [];

  return items.map((item, index) => ({
    id: Number(item.id ?? item.benefit_id ?? index + 1),
    name: item.benefit_name ?? item.name ?? `Benefit ${index + 1}`,
    category: item.benefit_category ?? item.category ?? "",
    limits: item.limits ?? "",
    percentages: item.percentages ?? "",
    visits: item.visits ?? "",
    deductibles: item.deductibles ?? "",
    copay: item.copay_ucr ?? "",
    treatment: item.benefit_treatment ?? "",
  }));
}

function currentValue(benefit) {
  return [
    ["Limit", benefit.limits],
    ["Percentage", benefit.percentages],
    ["Visits", benefit.visits],
    ["Deductible", benefit.deductibles],
    ["Copay / UCR", benefit.copay],
    ["Treatment", benefit.treatment],
  ]
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .map(([label, value]) => `${label}: ${value}`)
    .join(" · ") || "Not specified";
}

function newOption(number, benefits) {
  return {
    id: number,
    name: `Option ${number}`,
    values: Object.fromEntries(
      benefits.map((benefit) => [String(benefit.id), ""])
    ),
  };
}

export default function Options() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const documentId =
    searchParams.get("documentId") ||
    sessionStorage.getItem("lastDocumentId");

  const [benefits, setBenefits] = useState([]);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const activeOption = options.find(
    (option) => option.id === selectedOption
  );

  const loadWorkspace = useCallback(async () => {
    if (!documentId) {
      setError("Please open a document from the Documents page first.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const benefitResponse = await getBenefits(Number(documentId));
      const normalized = normalizeBenefits(benefitResponse);

      setBenefits(normalized);

      let restored = [];
      let selected = 1;

      try {
        const configuration = await getCoverageOptions(Number(documentId));

        if (Array.isArray(configuration.options)) {
          restored = configuration.options.map((option) => ({
            id: Number(option.id),
            name: option.name || `Option ${option.id}`,
            values: option.values || {},
          }));

          selected = Number(configuration.selected_option || 1);
        }
      } catch (loadError) {
        // A failed options lookup should not hide extracted benefits.
        console.error("Could not load saved options:", loadError);
      }

      if (restored.length) {
        setOptions(
          restored.slice(0, 3).map((option) => ({
            ...option,
            values: Object.fromEntries(
              normalized.map((benefit) => [
                String(benefit.id),
                option.values?.[String(benefit.id)] ?? "",
              ])
            ),
          }))
        );
        setSelectedOption(selected);
        setSaved(true);
      } else {
        setOptions([]);
        setSelectedOption(1);
        setSaved(false);
      }
    } catch (err) {
      setError(err.message || "Could not load extracted benefits.");
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  const addOption = () => {
    if (options.length >= 3) return;

    const nextNumber = [1, 2, 3].find(
      (number) => !options.some((option) => option.id === number)
    );

    if (!nextNumber) return;

    setOptions((previous) => [
      ...previous,
      newOption(nextNumber, benefits),
    ]);
    setSelectedOption(nextNumber);
    setSaved(false);
    setMessage("");
    setError("");
  };

  const updateOptionName = (optionId, name) => {
    setOptions((previous) =>
      previous.map((option) =>
        option.id === optionId ? { ...option, name } : option
      )
    );
    setSaved(false);
  };

  const updateCoverage = (optionId, benefitId, value) => {
    setOptions((previous) =>
      previous.map((option) =>
        option.id === optionId
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
  };

  const removeOption = (optionId) => {
    const remaining = options.filter((option) => option.id !== optionId);
    setOptions(remaining);

    if (selectedOption === optionId) {
      setSelectedOption(remaining[0]?.id ?? 1);
    }

    setSaved(false);
  };

  const changeCount = useMemo(
    () =>
      Object.values(activeOption?.values || {}).filter(
        (value) => String(value).trim() !== ""
      ).length,
    [activeOption]
  );

  const handleSave = async () => {
    if (!documentId) {
      setError("Please select a document first.");
      return;
    }

    if (!benefits.length) {
      setError("No extracted benefits are available for this document.");
      return;
    }

    if (!options.length) {
      setError("Create at least one option before saving.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await saveCoverageOptions(Number(documentId), {
        selected_option: selectedOption,
        options: options.map((option) => ({
          option_number: option.id,
          name: option.name.trim() || `Option ${option.id}`,
          values: Object.entries(option.values).map(
            ([benefitId, proposedValue]) => ({
              benefit_id: Number(benefitId),
              proposed_value: String(proposedValue ?? ""),
            })
          ),
        })),
      });

      setSaved(true);
      setMessage("Options saved successfully.");
    } catch (err) {
      setSaved(false);
      setError(err.message || "Could not save options.");
    } finally {
      setSaving(false);
    }
  };

  const continueToPricing = () => {
    if (!saved) {
      setError("Save your options before continuing to Pricing.");
      return;
    }

    navigate(
      `/underwriter/pricing?documentId=${encodeURIComponent(documentId)}`
    );
  };

  const cardStyle = {
    background: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 12,
    padding: 20,
  };

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    border: `1px solid ${COLORS.border}`,
    borderRadius: 8,
    padding: "10px 12px",
    color: COLORS.text,
    background: COLORS.white,
    fontSize: 13,
  };

  const buttonStyle = {
    border: `1px solid ${COLORS.green}`,
    borderRadius: 8,
    padding: "10px 15px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 13,
  };

  if (loading) {
    return (
      <div style={{ padding: 32, color: COLORS.text }}>
        Loading document benefits and saved options...
      </div>
    );
  }

  return (
    <div
      style={{
        background: COLORS.background,
        minHeight: "100%",
        padding: "28px",
        color: COLORS.text,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 27, fontWeight: 600 }}>
            Coverage Options
          </h1>
          <p style={{ color: COLORS.muted, marginBottom: 0 }}>
            Review current benefits and create up to three coverage proposals.
          </p>
          <p style={{ fontSize: 12, color: COLORS.muted }}>
            Document ID: {documentId || "Not selected"}
          </p>
        </div>

        <span
          style={{
            background: COLORS.mint,
            color: COLORS.green,
            padding: "10px 15px",
            borderRadius: 22,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          Underwriter Workspace
        </span>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            background: "#FFF1F0",
            border: "1px solid #F4C7C3",
            color: COLORS.red,
            borderRadius: 8,
            padding: 13,
            marginBottom: 18,
          }}
        >
          {error}
        </div>
      )}

      {message && (
        <div
          role="status"
          style={{
            background: COLORS.mint,
            color: COLORS.green,
            borderRadius: 8,
            padding: 13,
            marginBottom: 18,
          }}
        >
          {message}
        </div>
      )}

      <section style={{ ...cardStyle, marginBottom: 22 }}>
        <h2 style={{ marginTop: 0, fontSize: 19 }}>Current Benefits</h2>
        <p style={{ color: COLORS.muted, fontSize: 13 }}>
          Read-only values extracted from the uploaded document. Leave a
          proposed value blank to retain the current coverage.
        </p>

        {!benefits.length ? (
          <div
            style={{
              padding: 24,
              textAlign: "center",
              background: COLORS.background,
              borderRadius: 8,
            }}
          >
            No extracted benefits found. Check the selected document's
            extraction status before creating options.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr style={{ background: COLORS.mint, textAlign: "left" }}>
                  {["Benefit", "Category", "Current Coverage"].map((heading) => (
                    <th
                      key={heading}
                      style={{ padding: 12, borderBottom: `1px solid ${COLORS.border}` }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {benefits.map((benefit) => (
                  <tr key={benefit.id}>
                    <td style={{ padding: 12, borderBottom: `1px solid ${COLORS.border}` }}>
                      <strong>{benefit.name}</strong>
                    </td>
                    <td style={{ padding: 12, borderBottom: `1px solid ${COLORS.border}` }}>
                      {benefit.category || "—"}
                    </td>
                    <td style={{ padding: 12, borderBottom: `1px solid ${COLORS.border}` }}>
                      {currentValue(benefit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section style={{ ...cardStyle, marginBottom: 22 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 19 }}>Underwriter Proposals</h2>
            <p style={{ color: COLORS.muted, fontSize: 13 }}>
              Create at least one and no more than three options.
            </p>
          </div>

          <button
            type="button"
            onClick={addOption}
            disabled={options.length >= 3 || !benefits.length}
            style={{
              ...buttonStyle,
              background:
                options.length >= 3 || !benefits.length
                  ? "#B9D4CB"
                  : COLORS.green,
              color: COLORS.white,
              border: "none",
              cursor:
                options.length >= 3 || !benefits.length
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            + Add Option ({options.length}/3)
          </button>
        </div>

        {options.length === 0 ? (
          <div
            style={{
              border: `1px dashed ${COLORS.border}`,
              borderRadius: 10,
              padding: 28,
              textAlign: "center",
              marginTop: 12,
            }}
          >
            <h3 style={{ marginTop: 0 }}>No proposals created yet</h3>
            <p style={{ color: COLORS.muted, fontSize: 13 }}>
              Load the current benefits, then click Add Option to create your
              first proposal.
            </p>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                margin: "18px 0",
              }}
            >
              {options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedOption(option.id)}
                  style={{
                    ...buttonStyle,
                    background:
                      selectedOption === option.id
                        ? COLORS.green
                        : COLORS.white,
                    color:
                      selectedOption === option.id
                        ? COLORS.white
                        : COLORS.green,
                  }}
                >
                  {option.name || `Option ${option.id}`}
                  {selectedOption === option.id ? " ✓" : ""}
                </button>
              ))}
            </div>

            {activeOption && (
              <div
                style={{
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 10,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: 16,
                    background: COLORS.mint,
                    display: "flex",
                    alignItems: "end",
                    gap: 14,
                    flexWrap: "wrap",
                  }}
                >
                  <label style={{ flex: "1 1 250px", fontSize: 12 }}>
                    Option name
                    <input
                      value={activeOption.name}
                      onChange={(event) =>
                        updateOptionName(activeOption.id, event.target.value)
                      }
                      placeholder="e.g. Enhanced Coverage"
                      style={{ ...inputStyle, marginTop: 6 }}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => removeOption(activeOption.id)}
                    style={{
                      ...buttonStyle,
                      background: COLORS.white,
                      color: COLORS.red,
                      borderColor: "#E6B5B1",
                    }}
                  >
                    Remove Option
                  </button>
                </div>

                <div style={{ padding: 16, overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      minWidth: 620,
                      fontSize: 13,
                    }}
                  >
                    <thead>
                      <tr style={{ textAlign: "left", background: "#F6FAF8" }}>
                        <th style={{ padding: 11 }}>Benefit</th>
                        <th style={{ padding: 11 }}>Current Plan</th>
                        <th style={{ padding: 11 }}>Proposed Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {benefits.map((benefit) => (
                        <tr key={benefit.id}>
                          <td
                            style={{
                              padding: 11,
                              borderTop: `1px solid ${COLORS.border}`,
                              fontWeight: 600,
                            }}
                          >
                            {benefit.name}
                          </td>
                          <td
                            style={{
                              padding: 11,
                              borderTop: `1px solid ${COLORS.border}`,
                              color: COLORS.muted,
                              maxWidth: 280,
                            }}
                          >
                            {currentValue(benefit)}
                          </td>
                          <td
                            style={{
                              padding: 11,
                              borderTop: `1px solid ${COLORS.border}`,
                              minWidth: 200,
                            }}
                          >
                            <input
                              value={
                                activeOption.values[String(benefit.id)] ?? ""
                              }
                              onChange={(event) =>
                                updateCoverage(
                                  activeOption.id,
                                  benefit.id,
                                  event.target.value
                                )
                              }
                              placeholder="Leave blank to retain current"
                              style={inputStyle}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <p style={{ color: COLORS.muted, fontSize: 12 }}>
                    {changeCount} proposed change{changeCount === 1 ? "" : "s"}.
                    The current plan is never modified.
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        <p style={{ color: COLORS.muted, fontSize: 12, marginBottom: 0 }}>
          {options.length >= 3
            ? "Maximum reached: three options."
            : `${3 - options.length} more option${3 - options.length === 1 ? "" : "s"} can be created.`}
        </p>
      </section>

      <div
        style={{
          ...cardStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 14,
          flexWrap: "wrap",
        }}
      >
        <div>
          <strong>Option Configuration</strong>
          <p style={{ marginBottom: 0, fontSize: 12, color: COLORS.muted }}>
            {saved
              ? "Your current configuration is saved."
              : "Save your changes before continuing to pricing."}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading || !benefits.length || !options.length}
            style={{
              ...buttonStyle,
              background: COLORS.white,
              color: COLORS.green,
              opacity:
                saving || loading || !benefits.length || !options.length
                  ? 0.55
                  : 1,
            }}
          >
            {saving ? "Saving..." : "Save Options"}
          </button>

          <button
            type="button"
            onClick={continueToPricing}
            disabled={!saved}
            style={{
              ...buttonStyle,
              background: COLORS.green,
              color: COLORS.white,
              opacity: saved ? 1 : 0.55,
            }}
          >
            Continue to Pricing →
          </button>
        </div>
      </div>
    </div>
  );
}
