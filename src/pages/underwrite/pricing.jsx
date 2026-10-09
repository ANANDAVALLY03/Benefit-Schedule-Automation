import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calculator,
  Save,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ArrowRight,
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
  {
    id: 6,
    name: "Hospital Room",
    current: "$12,000",
    option1: "$15,000",
    option2: "$20,000",
    option3: "$25,000",
  },
];

function Pricing() {
  const navigate = useNavigate();

  const [benefits] = useState(initialBenefits);
  const [commission, setCommission] = useState("5");
  const [selectedOption, setSelectedOption] = useState("option2");
  const [saved, setSaved] = useState(false);

  const premiums = {
    option1: "$1,250",
    option2: "$1,480",
    option3: "$1,720",
  };

  const commissionValue = Number(commission);

  const validCommission =
    commission.trim() !== "" &&
    Number.isFinite(commissionValue) &&
    commissionValue >= 0 &&
    commissionValue <= 10;

  const savePricing = () => {
    if (!validCommission) {
      return;
    }

    // Frontend save confirmation.
    // Connect your save API here when backend persistence is available.
    setSaved(true);
  };

  const goBack = () => {
    navigate("/underwriter/options");
  };

  const proceedWithUnderwriting = () => {
    navigate("/underwriter/work");
  };

  const handleCommissionChange = (event) => {
    setCommission(event.target.value);
    setSaved(false);
  };

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
    setSaved(false);
  };

  return (
    <div className="min-h-full bg-[#f6f8f7]">
      {/* PAGE HEADER */}
      <div className="px-7 pb-4 pt-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#dcefe9]">
              <Calculator size={22} className="text-[#006653]" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-[#073f35]">
                Pricing
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Calculate and review premiums for each coverage option
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-[#fff1d7] px-4 py-2 text-sm font-medium text-[#a56600]">
              Underwriting In Progress
            </span>

            <span className="text-sm text-gray-500">
              v0.2 · Draft
            </span>
          </div>
        </div>
      </div>

      {/* PROJECT INFORMATION */}
      <div className="px-7">
        <div className="rounded-xl border border-[#d7e1de] bg-white p-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
            <InfoItem label="Client" value="ABC Corporation" />
            <InfoItem label="Source Insurer" value="Sagicor" />
            <InfoItem label="Reference" value="#SCH-1024" />
            <InfoItem label="Version" value="v0.2 · Draft" />
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="space-y-6 p-7">
        {/* PRICING CONFIGURATION */}
        <div className="rounded-xl border border-[#d7e1de] bg-white">
          <div className="border-b border-[#d7e1de] px-6 py-5">
            <h2 className="text-lg font-semibold text-[#073f35]">
              Pricing Configuration
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Configure the commission used for the premium calculation.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-3">
            <div>
              <label
                htmlFor="commission"
                className="text-sm font-medium text-gray-600"
              >
                Commission Rate
              </label>

              <div className="relative mt-2">
                <input
                  id="commission"
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  value={commission}
                  onChange={handleCommissionChange}
                  className="w-full rounded-lg border border-[#cddbd6] px-4 py-3 pr-10 focus:border-[#00866c] focus:outline-none focus:ring-2 focus:ring-[#bde5d8]"
                />

                <span className="absolute right-4 top-3 text-gray-400">
                  %
                </span>
              </div>

              <p className="mt-2 text-xs text-gray-400">
                Allowed range: 0% – 10%
              </p>

              {!validCommission && (
                <p className="mt-2 text-xs text-red-600">
                  Enter a commission rate between 0% and 10%.
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="coverageTier"
                className="text-sm font-medium text-gray-600"
              >
                Coverage Tier
              </label>

              <div className="relative mt-2">
                <select
                  id="coverageTier"
                  value={selectedOption}
                  onChange={handleOptionChange}
                  className="w-full appearance-none rounded-lg border border-[#cddbd6] bg-white px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-[#bde5d8]"
                >
                  <option value="option1">Option 1</option>
                  <option value="option2">Option 2</option>
                  <option value="option3">Option 3</option>
                </select>

                <ChevronDown
                  size={17}
                  className="pointer-events-none absolute right-4 top-3.5 text-gray-400"
                />
              </div>
            </div>

            <div className="rounded-lg bg-[#eef8f4] p-4">
              <p className="text-xs text-gray-500">
                Calculation Rule
              </p>

              <p className="mt-2 text-sm font-semibold text-[#006653]">
                Benefit Value × Commission
              </p>

              <p className="mt-2 text-xs text-gray-500">
                Applied across all three coverage tiers.
              </p>
            </div>
          </div>
        </div>

        {/* PREMIUM SUMMARY */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-[#073f35]">
              Premium Summary
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Premiums calculated for each proposal option.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <PremiumCard
              title="Option 1"
              amount={premiums.option1}
              selected={selectedOption === "option1"}
              onClick={() => {
                setSelectedOption("option1");
                setSaved(false);
              }}
            />

            <PremiumCard
              title="Option 2"
              amount={premiums.option2}
              selected={selectedOption === "option2"}
              onClick={() => {
                setSelectedOption("option2");
                setSaved(false);
              }}
            />

            <PremiumCard
              title="Option 3"
              amount={premiums.option3}
              selected={selectedOption === "option3"}
              onClick={() => {
                setSelectedOption("option3");
                setSaved(false);
              }}
            />
          </div>
        </div>

        {/* PREMIUM BREAKDOWN */}
        <div className="overflow-hidden rounded-xl border border-[#d7e1de] bg-white">
          <div className="border-b border-[#d7e1de] px-6 py-5">
            <h2 className="text-lg font-semibold text-[#073f35]">
              Premium Breakdown
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Review benefit values across all coverage tiers.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="bg-[#f4f8f6]">
                  <th className="border-b px-5 py-4 text-left text-xs font-semibold text-gray-600">
                    Benefit
                  </th>
                  <th className="border-b px-4 py-4 text-left text-xs font-semibold text-gray-600">
                    Current
                  </th>
                  <th className="border-b px-4 py-4 text-left text-xs font-semibold text-[#006653]">
                    Option 1
                  </th>
                  <th className="border-b px-4 py-4 text-left text-xs font-semibold text-[#006653]">
                    Option 2
                  </th>
                  <th className="border-b px-4 py-4 text-left text-xs font-semibold text-[#006653]">
                    Option 3
                  </th>
                </tr>
              </thead>

              <tbody>
                {benefits.map((benefit) => (
                  <tr
                    key={benefit.id}
                    className="hover:bg-[#fafcfb]"
                  >
                    <td className="border-b px-5 py-4 text-sm font-medium text-[#073f35]">
                      {benefit.name}
                    </td>

                    <td className="border-b px-4 py-4 text-sm text-gray-500">
                      {benefit.current}
                    </td>

                    <td
                      className={`border-b px-4 py-4 text-sm ${
                        selectedOption === "option1"
                          ? "font-semibold text-[#006653]"
                          : "text-gray-700"
                      }`}
                    >
                      {benefit.option1}
                    </td>

                    <td
                      className={`border-b px-4 py-4 text-sm ${
                        selectedOption === "option2"
                          ? "font-semibold text-[#006653]"
                          : "text-gray-700"
                      }`}
                    >
                      {benefit.option2}
                    </td>

                    <td
                      className={`border-b px-4 py-4 text-sm ${
                        selectedOption === "option3"
                          ? "font-semibold text-[#006653]"
                          : "text-gray-700"
                      }`}
                    >
                      {benefit.option3}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CALCULATION SUMMARY */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* SELECTED PRICING */}
          <div className="rounded-xl border border-[#d7e1de] bg-white p-6">
            <h2 className="font-semibold text-[#073f35]">
              Selected Pricing
            </h2>

            <div className="mt-5 rounded-xl bg-[#eef8f4] p-5">
              <div className="flex justify-between">
                <div>
                  <p className="text-xs text-gray-500">
                    Selected Option
                  </p>

                  <p className="mt-1 text-xl font-bold text-[#006653]">
                    {selectedOption === "option1"
                      ? "Option 1"
                      : selectedOption === "option2"
                      ? "Option 2"
                      : "Option 3"}
                  </p>
                </div>

                <CheckCircle2
                  size={26}
                  className="text-[#009879]"
                />
              </div>

              <div className="mt-5 border-t border-[#cce9df] pt-4">
                <p className="text-xs text-gray-500">
                  Estimated Premium
                </p>

                <p className="mt-1 text-3xl font-bold text-[#073f35]">
                  {premiums[selectedOption]}
                </p>
              </div>

              <div className="mt-4">
                <p className="text-xs text-gray-500">
                  Commission
                </p>

                <p className="mt-1 text-sm font-semibold text-[#073f35]">
                  {commission}%
                </p>
              </div>
            </div>
          </div>

          {/* PRICING VALIDATION */}
          <div className="rounded-xl border border-[#d7e1de] bg-white p-6">
            <h2 className="font-semibold text-[#073f35]">
              Pricing Validation
            </h2>

            <div className="mt-5 space-y-4">
              <ValidationRow
                label="Commission rate"
                value={validCommission ? `${commission}%` : "Invalid"}
                success={validCommission}
                warning={!validCommission}
              />

              <ValidationRow
                label="Option 1 premium"
                value="Calculated"
                success
              />

              <ValidationRow
                label="Option 2 premium"
                value="Calculated"
                success
              />

              <ValidationRow
                label="Option 3 premium"
                value="Calculated"
                success
              />

              <ValidationRow
                label="Pending Change Requests"
                value="1"
                warning
              />
            </div>
          </div>
        </div>

        {/* PRICING NOTICE */}
        <div className="rounded-xl border border-[#f0dfbd] bg-[#fff9ee] p-5">
          <div className="flex gap-3">
            <AlertTriangle
              size={20}
              className="shrink-0 text-orange-500"
            />

            <div>
              <p className="text-sm font-semibold text-[#765000]">
                Pricing Rule Notice
              </p>

              <p className="mt-1 text-xs text-gray-600">
                Premium calculation shown here is a frontend prototype.
                The final calculation formula must follow the approved
                business rules.
              </p>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="rounded-xl border border-[#d7e1de] bg-white p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <button
              type="button"
              onClick={goBack}
              className="flex items-center justify-center gap-2 rounded-lg border border-[#006653] px-5 py-3 text-sm font-medium text-[#006653] hover:bg-[#eef8f4]"
            >
              <ArrowLeft size={18} />
              Back to Options
            </button>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={savePricing}
                disabled={!validCommission}
                className="flex items-center justify-center gap-2 rounded-lg bg-[#006653] px-6 py-3 text-sm font-medium text-white hover:bg-[#005344] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save size={18} />
                {saved ? "Pricing Saved" : "Save Pricing"}
              </button>

              {saved && (
                <button
                  type="button"
                  onClick={proceedWithUnderwriting}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#073f35] px-6 py-3 text-sm font-medium text-white hover:bg-[#052f28]"
                >
                  Proceed with Underwriting
                  <ArrowRight size={18} />
                </button>
              )}
            </div>
          </div>

          {saved && (
            <p
              role="status"
              className="mt-4 text-sm font-medium text-[#00856b]"
            >
              <CheckCircle2
                size={16}
                className="mr-1 inline"
              />
              Pricing saved successfully. You can now proceed to
              underwriting.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* INFO ITEM */
function InfoItem({ label, value }) {
  return (
    <div>
      <p className="mb-1 text-xs text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-[#073f35]">{value}</p>
    </div>
  );
}

/* PREMIUM CARD */
function PremiumCard({ title, amount, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full rounded-xl border bg-white p-6 text-left transition ${
        selected
          ? "border-[#009879] ring-2 ring-[#d8f1e8]"
          : "border-[#d7e1de] hover:border-[#009879]"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">Coverage Tier</p>
          <h3 className="mt-1 text-lg font-semibold text-[#073f35]">
            {title}
          </h3>
        </div>

        {selected && (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#009879]">
            <CheckCircle2 size={17} className="text-white" />
          </div>
        )}
      </div>

      <div className="mt-6">
        <p className="text-xs text-gray-500">Estimated Premium</p>
        <p className="mt-1 text-3xl font-bold text-[#073f35]">
          {amount}
        </p>
      </div>

      <div
        className={`mt-5 text-sm font-medium ${
          selected ? "text-[#006653]" : "text-gray-500"
        }`}
      >
        {selected ? "Selected for proposal" : "Select this option"}
      </div>
    </button>
  );
}

/* VALIDATION ROW */
function ValidationRow({ label, value, success, warning }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        {success && (
          <CheckCircle2 size={17} className="text-[#009879]" />
        )}

        {warning && (
          <AlertTriangle size={17} className="text-orange-500" />
        )}

        <span className="text-sm text-gray-600">{label}</span>
      </div>

      <span
        className={`text-xs font-medium ${
          success ? "text-[#00856b]" : "text-orange-600"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export default Pricing;
