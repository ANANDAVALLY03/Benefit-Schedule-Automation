import React, { useMemo, useState } from "react";
import {
  Save,
  FileCheck2,
  AlertTriangle,
  Calculator,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";

const Underwriting = () => {
  const [commission, setCommission] = useState(5);
  const [saved, setSaved] = useState(false);
  const [validationError, setValidationError] = useState("");

  const [benefits, setBenefits] = useState([
    {
      id: 1,
      benefit: "Hospital",
      currentPlan: "$12,000",
      option1: "$15,000",
      option2: "$20,000",
      option3: "$25,000",
      notes: "",
    },
    {
      id: 2,
      benefit: "Dental",
      currentPlan: "80%",
      option1: "90%",
      option2: "90%",
      option3: "100%",
      notes: "",
    },
    {
      id: 3,
      benefit: "Maternity",
      currentPlan: "100%",
      option1: "100%",
      option2: "100%",
      option3: "100%",
      notes: "",
    },
    {
      id: 4,
      benefit: "Vision",
      currentPlan: "90%",
      option1: "90%",
      option2: "100%",
      option3: "100%",
      notes: "",
    },
    {
      id: 5,
      benefit: "Pharmacy",
      currentPlan: "$5,000",
      option1: "$7,500",
      option2: "$10,000",
      option3: "$12,500",
      notes: "",
    },
  ]);

  /*
   * Pending Change Requests / Exceptions
   * According to the CANOPY workflow, pending CR benefits
   * are excluded from the proposal until resolved.
   */
  const [pendingExceptions] = useState([
    {
      id: 1,
      benefit: "Wellness Coverage",
      type: "New Benefit",
      status: "CR Pending",
    },
  ]);

  const handleChange = (id, field, value) => {
    setBenefits((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );

    setSaved(false);
    setValidationError("");
  };

  const handleSaveDraft = () => {
    setSaved(true);
    setValidationError("");
  };

  /*
   * Simple premium calculation for UI demonstration.
   *
   * In the actual backend implementation,
   * premium calculation should come from the API.
   */
  const premiumValues = useMemo(() => {
    const basePremium = 100000;

    const option1 = basePremium * (1 + commission / 100);
    const option2 = basePremium * 1.15 * (1 + commission / 100);
    const option3 = basePremium * 1.3 * (1 + commission / 100);

    return {
      tier1: {
        option1: option1,
        option2: option2,
        option3: option3,
      },
      tier2: {
        option1: option1 * 1.2,
        option2: option2 * 1.2,
        option3: option3 * 1.2,
      },
      tier3: {
        option1: option1 * 1.4,
        option2: option2 * 1.4,
        option3: option3 * 1.4,
      },
    };
  }, [commission]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const validateAndGenerate = () => {
    const incomplete = benefits.filter(
      (item) =>
        !item.currentPlan ||
        !item.option1 ||
        !item.option2 ||
        !item.option3
    );

    if (incomplete.length > 0) {
      setValidationError(
        "Some mandatory benefit fields are incomplete. Complete all option columns before generating the proposal."
      );
      setSaved(false);
      return;
    }

    setValidationError("");
    setSaved(true);

    alert(
      "Validation passed. Proposal PDF generation can now be triggered."
    );
  };

  return (
    <div className="p-6 space-y-6 bg-[#F7F5EF] min-h-full">

      {/* PAGE HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#12352B]">
            Underwriting Workspace
          </h1>

          <p className="mt-1 text-sm text-[#5F7168]">
            Review the current plan, prepare benefit options, calculate
            premiums and validate the proposal.
          </p>
        </div>

        <div className="flex items-center gap-3">

          {saved && (
            <div className="flex items-center gap-2 text-sm font-medium text-[#1E5A45]">
              <CheckCircle2 size={17} />
              Draft saved
            </div>
          )}

          <button
            type="button"
            onClick={handleSaveDraft}
            className="
              inline-flex items-center gap-2
              px-4 py-2.5
              rounded-lg
              bg-[#1E5A45]
              text-white
              text-sm font-semibold
              hover:bg-[#164A38]
              transition-colors
            "
          >
            <Save size={17} />
            Save Draft
          </button>
        </div>
      </div>

      {/* PROJECT INFORMATION */}
      <div className="bg-white border border-[#D5E2DA] rounded-xl p-5">

        <div className="flex items-center justify-between">

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6B8076]">
              Project
            </p>

            <h2 className="mt-1 text-lg font-bold text-[#12352B]">
              Acme Corporation Benefit Schedule
            </h2>
          </div>

          <div className="flex items-center gap-8">

            <div>
              <p className="text-xs text-[#6B8076]">
                Project ID
              </p>

              <p className="mt-1 text-sm font-semibold text-[#12352B]">
                CAN-2026-001
              </p>
            </div>

            <div>
              <p className="text-xs text-[#6B8076]">
                Version
              </p>

              <p className="mt-1 text-sm font-semibold text-[#12352B]">
                v0.1 Mapped
              </p>
            </div>

            <div>
              <p className="text-xs text-[#6B8076]">
                Status
              </p>

              <span
                className="
                  inline-flex
                  mt-1
                  px-2.5 py-1
                  rounded-full
                  text-xs font-semibold
                  bg-[#E8F2EC]
                  text-[#1E5A45]
                "
              >
                Underwriting In Progress
              </span>
            </div>

          </div>
        </div>
      </div>

      {/* EXCEPTION WARNING */}
      {pendingExceptions.length > 0 && (
        <div
          className="
            flex items-start gap-3
            p-4
            rounded-xl
            border
            border-[#E7C875]
            bg-[#FFF8E6]
          "
        >
          <AlertTriangle
            size={20}
            className="text-[#B7791F] mt-0.5 shrink-0"
          />

          <div>
            <p className="text-sm font-bold text-[#7A5413]">
              Pending Exceptions
            </p>

            <p className="mt-1 text-sm text-[#7A641F]">
              {pendingExceptions.length} benefit is currently pending a
              Change Request. Pending benefits will be excluded from the
              proposal until resolved.
            </p>
          </div>
        </div>
      )}

      {/* BENEFIT OPTIONS */}
      <div className="bg-white border border-[#D5E2DA] rounded-xl overflow-hidden">

        <div className="px-5 py-4 border-b border-[#D5E2DA]">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-lg font-bold text-[#12352B]">
                Benefit Options
              </h2>

              <p className="mt-1 text-sm text-[#6B8076]">
                Current plan values are pre-filled from the mapped benefit
                schedule.
              </p>
            </div>

            <div
              className="
                flex items-center gap-2
                px-3 py-2
                rounded-lg
                bg-[#E8F2EC]
                text-[#1E5A45]
              "
            >
              <Info size={16} />

              <span className="text-xs font-medium">
                v0.1 Mapped
              </span>
            </div>

          </div>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1050px]">

            <thead>
              <tr className="bg-[#F7F5EF] border-b border-[#D5E2DA]">

                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-[#53665D]">
                  Benefit
                </th>

                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-[#53665D]">
                  Current Plan
                </th>

                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-[#53665D]">
                  Option 1
                </th>

                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-[#53665D]">
                  Option 2
                </th>

                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-[#53665D]">
                  Option 3
                </th>

                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-[#53665D]">
                  Notes
                </th>

              </tr>
            </thead>

            <tbody>

              {benefits.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-[#E6EEE9] last:border-b-0"
                >

                  <td className="px-5 py-4">

                    <p className="text-sm font-semibold text-[#12352B]">
                      {item.benefit}
                    </p>

                  </td>

                  {/* CURRENT PLAN */}
                  <td className="px-4 py-4">

                    <div
                      className="
                        px-3 py-2
                        rounded-lg
                        bg-[#F1F4F1]
                        border border-[#DDE6E0]
                        text-sm
                        font-medium
                        text-[#53665D]
                      "
                    >
                      {item.currentPlan}
                    </div>

                  </td>

                  {/* OPTION 1 */}
                  <td className="px-4 py-4">

                    <div className="relative">

                      <input
                        type="text"
                        value={item.option1}
                        onChange={(e) =>
                          handleChange(
                            item.id,
                            "option1",
                            e.target.value
                          )
                        }
                        className="
                          w-full
                          px-3 py-2
                          pr-9
                          rounded-lg
                          border border-[#D5E2DA]
                          bg-white
                          text-sm
                          font-medium
                          text-[#12352B]
                          outline-none
                          focus:border-[#1E5A45]
                          focus:ring-1
                          focus:ring-[#1E5A45]
                        "
                      />

                      <ChevronDown
                        size={15}
                        className="
                          absolute
                          right-3
                          top-1/2
                          -translate-y-1/2
                          text-[#6B8076]
                          pointer-events-none
                        "
                      />

                    </div>

                  </td>

                  {/* OPTION 2 */}
                  <td className="px-4 py-4">

                    <div className="relative">

                      <input
                        type="text"
                        value={item.option2}
                        onChange={(e) =>
                          handleChange(
                            item.id,
                            "option2",
                            e.target.value
                          )
                        }
                        className="
                          w-full
                          px-3 py-2
                          pr-9
                          rounded-lg
                          border border-[#D5E2DA]
                          bg-white
                          text-sm
                          font-medium
                          text-[#12352B]
                          outline-none
                          focus:border-[#1E5A45]
                          focus:ring-1
                          focus:ring-[#1E5A45]
                        "
                      />

                      <ChevronDown
                        size={15}
                        className="
                          absolute
                          right-3
                          top-1/2
                          -translate-y-1/2
                          text-[#6B8076]
                          pointer-events-none
                        "
                      />

                    </div>

                  </td>

                  {/* OPTION 3 */}
                  <td className="px-4 py-4">

                    <div className="relative">

                      <input
                        type="text"
                        value={item.option3}
                        onChange={(e) =>
                          handleChange(
                            item.id,
                            "option3",
                            e.target.value
                          )
                        }
                        className="
                          w-full
                          px-3 py-2
                          pr-9
                          rounded-lg
                          border border-[#D5E2DA]
                          bg-white
                          text-sm
                          font-medium
                          text-[#12352B]
                          outline-none
                          focus:border-[#1E5A45]
                          focus:ring-1
                          focus:ring-[#1E5A45]
                        "
                      />

                      <ChevronDown
                        size={15}
                        className="
                          absolute
                          right-3
                          top-1/2
                          -translate-y-1/2
                          text-[#6B8076]
                          pointer-events-none
                        "
                      />

                    </div>

                  </td>

                  {/* NOTES */}
                  <td className="px-4 py-4">

                    <input
                      type="text"
                      value={item.notes}
                      placeholder="Add note..."
                      onChange={(e) =>
                        handleChange(
                          item.id,
                          "notes",
                          e.target.value
                        )
                      }
                      className="
                        w-full
                        px-3 py-2
                        rounded-lg
                        border border-[#D5E2DA]
                        bg-white
                        text-sm
                        text-[#12352B]
                        placeholder:text-[#9AA9A1]
                        outline-none
                        focus:border-[#1E5A45]
                        focus:ring-1
                        focus:ring-[#1E5A45]
                      "
                    />

                  </td>

                </tr>
              ))}

            </tbody>

          </table>
        </div>
      </div>

      {/* PREMIUM CALCULATION */}
      <div className="bg-white border border-[#D5E2DA] rounded-xl overflow-hidden">

        <div className="px-5 py-4 border-b border-[#D5E2DA]">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div
                className="
                  w-9 h-9
                  rounded-lg
                  bg-[#E8F2EC]
                  text-[#1E5A45]
                  flex items-center justify-center
                "
              >
                <Calculator size={19} />
              </div>

              <div>

                <h2 className="text-lg font-bold text-[#12352B]">
                  Premium Calculation
                </h2>

                <p className="text-sm text-[#6B8076]">
                  Configure commission and review estimated premiums.
                </p>

              </div>

            </div>

            <div className="flex items-center gap-3">

              <label className="text-sm font-semibold text-[#53665D]">
                Commission
              </label>

              <div className="relative">

                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  value={commission}
                  onChange={(e) => setCommission(Number(e.target.value))}
                  className="
                    w-24
                    px-3 py-2
                    pr-8
                    rounded-lg
                    border border-[#D5E2DA]
                    text-sm
                    font-semibold
                    text-[#12352B]
                    outline-none
                    focus:border-[#1E5A45]
                    focus:ring-1
                    focus:ring-[#1E5A45]
                  "
                />

                <span
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-sm
                    font-semibold
                    text-[#6B8076]
                  "
                >
                  %
                </span>

              </div>

            </div>

          </div>
        </div>

        <div className="p-5">

          <table className="w-full">

            <thead>
              <tr className="border-b border-[#D5E2DA]">

                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-[#53665D]">
                  Coverage Tier
                </th>

                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-[#53665D]">
                  Option 1
                </th>

                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-[#53665D]">
                  Option 2
                </th>

                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-[#53665D]">
                  Option 3
                </th>

              </tr>
            </thead>

            <tbody>

              <tr className="border-b border-[#E6EEE9]">

                <td className="px-4 py-4 text-sm font-semibold text-[#12352B]">
                  Tier 1
                </td>

                <td className="px-4 py-4 text-right text-sm font-medium text-[#12352B]">
                  {formatCurrency(premiumValues.tier1.option1)}
                </td>

                <td className="px-4 py-4 text-right text-sm font-medium text-[#12352B]">
                  {formatCurrency(premiumValues.tier1.option2)}
                </td>

                <td className="px-4 py-4 text-right text-sm font-medium text-[#12352B]">
                  {formatCurrency(premiumValues.tier1.option3)}
                </td>

              </tr>

              <tr className="border-b border-[#E6EEE9]">

                <td className="px-4 py-4 text-sm font-semibold text-[#12352B]">
                  Tier 2
                </td>

                <td className="px-4 py-4 text-right text-sm font-medium text-[#12352B]">
                  {formatCurrency(premiumValues.tier2.option1)}
                </td>

                <td className="px-4 py-4 text-right text-sm font-medium text-[#12352B]">
                  {formatCurrency(premiumValues.tier2.option2)}
                </td>

                <td className="px-4 py-4 text-right text-sm font-medium text-[#12352B]">
                  {formatCurrency(premiumValues.tier2.option3)}
                </td>

              </tr>

              <tr>

                <td className="px-4 py-4 text-sm font-semibold text-[#12352B]">
                  Tier 3
                </td>

                <td className="px-4 py-4 text-right text-sm font-medium text-[#12352B]">
                  {formatCurrency(premiumValues.tier3.option1)}
                </td>

                <td className="px-4 py-4 text-right text-sm font-medium text-[#12352B]">
                  {formatCurrency(premiumValues.tier3.option2)}
                </td>

                <td className="px-4 py-4 text-right text-sm font-medium text-[#12352B]">
                  {formatCurrency(premiumValues.tier3.option3)}
                </td>

              </tr>

            </tbody>

          </table>

          <p className="mt-3 text-xs text-[#7A8A82]">
            Premium values shown here are illustrative. The final calculation
            should be returned by the backend calculation service.
          </p>

        </div>
      </div>

      {/* VALIDATION RESULT */}
      {validationError && (
        <div
          className="
            flex items-start gap-3
            p-4
            rounded-xl
            border
            border-[#E5BABA]
            bg-[#FFF1F1]
          "
        >
          <XCircle
            size={20}
            className="text-[#C94C4C] mt-0.5"
          />

          <div>

            <p className="text-sm font-bold text-[#9B3838]">
              Validation Failed
            </p>

            <p className="mt-1 text-sm text-[#A84A4A]">
              {validationError}
            </p>

          </div>
        </div>
      )}

      {/* FINAL ACTION */}
      <div
        className="
          bg-white
          border border-[#D5E2DA]
          rounded-xl
          p-5
          flex
          items-center
          justify-between
        "
      >

        <div>

          <h3 className="text-sm font-bold text-[#12352B]">
            Ready to generate proposal?
          </h3>

          <p className="mt-1 text-sm text-[#6B8076]">
            Validate all mandatory fields and option columns before
            generating the proposal PDF.
          </p>

        </div>

        <button
          type="button"
          onClick={validateAndGenerate}
          className="
            inline-flex
            items-center
            gap-2
            px-5
            py-3
            rounded-lg
            bg-[#1E5A45]
            text-white
            text-sm
            font-semibold
            hover:bg-[#164A38]
            transition-colors
          "
        >
          <FileCheck2 size={18} />
          Validate & Generate PDF
        </button>

      </div>

    </div>
  );
};

export default Underwriting;