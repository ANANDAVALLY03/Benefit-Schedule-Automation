import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calculator,
  Save,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
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

  const [selectedOption, setSelectedOption] =
    useState("option2");

  const [saved, setSaved] = useState(false);

  const premiums = {
    option1: "$1,250",
    option2: "$1,480",
    option3: "$1,720",
  };

  const savePricing = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const goBack = () => {
    navigate("/underwriter/options");
  };

  return (
    <div className="min-h-full bg-[#f6f8f7]">

      {/* PAGE HEADER */}
      <div className="px-7 pt-6 pb-4">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-xl bg-[#dcefe9] flex items-center justify-center">

              <Calculator
                size={22}
                className="text-[#006653]"
              />

            </div>

            <div>

              <h1 className="text-2xl font-semibold text-[#073f35]">
                Pricing
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Calculate and review premiums for each coverage option
              </p>

            </div>

          </div>


          <div className="flex items-center gap-3">

            <span className="px-4 py-2 rounded-full bg-[#fff1d7] text-[#a56600] text-sm font-medium">
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

        <div className="bg-white border border-[#d7e1de] rounded-xl p-5">

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

            <InfoItem
              label="Client"
              value="ABC Corporation"
            />

            <InfoItem
              label="Source Insurer"
              value="Sagicor"
            />

            <InfoItem
              label="Reference"
              value="#SCH-1024"
            />

            <InfoItem
              label="Version"
              value="v0.2 · Draft"
            />

          </div>

        </div>

      </div>


      {/* CONTENT */}
      <div className="p-7 space-y-6">


        {/* COMMISSION */}
        <div className="bg-white border border-[#d7e1de] rounded-xl">

          <div className="px-6 py-5 border-b border-[#d7e1de]">

            <h2 className="text-lg font-semibold text-[#073f35]">
              Pricing Configuration
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Configure the commission used for the premium calculation.
            </p>

          </div>


          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">

            <div>

              <label className="text-sm font-medium text-gray-600">
                Commission Rate
              </label>

              <div className="relative mt-2">

                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  value={commission}
                  onChange={(e) =>
                    setCommission(e.target.value)
                  }
                  className="w-full px-4 py-3 pr-10 border border-[#cddbd6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bde5d8] focus:border-[#00866c]"
                />

                <span className="absolute right-4 top-3 text-gray-400">
                  %
                </span>

              </div>

              <p className="text-xs text-gray-400 mt-2">
                Allowed range: 0% – 10%
              </p>

            </div>


            <div>

              <label className="text-sm font-medium text-gray-600">
                Coverage Tier
              </label>

              <div className="relative mt-2">

                <select
                  value={selectedOption}
                  onChange={(e) =>
                    setSelectedOption(e.target.value)
                  }
                  className="appearance-none w-full px-4 py-3 pr-10 border border-[#cddbd6] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#bde5d8]"
                >

                  <option value="option1">
                    Option 1
                  </option>

                  <option value="option2">
                    Option 2
                  </option>

                  <option value="option3">
                    Option 3
                  </option>

                </select>

                <ChevronDown
                  size={17}
                  className="absolute right-4 top-3.5 text-gray-400 pointer-events-none"
                />

              </div>

            </div>


            <div className="bg-[#eef8f4] rounded-lg p-4">

              <p className="text-xs text-gray-500">
                Calculation Rule
              </p>

              <p className="text-sm font-semibold text-[#006653] mt-2">
                Benefit Value × Commission
              </p>

              <p className="text-xs text-gray-500 mt-2">
                Applied across all three coverage tiers.
              </p>

            </div>

          </div>

        </div>


        {/* PREMIUM CARDS */}
        <div>

          <div className="mb-4">

            <h2 className="text-lg font-semibold text-[#073f35]">
              Premium Summary
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Premiums calculated for each proposal option.
            </p>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            <PremiumCard
              title="Option 1"
              amount={premiums.option1}
              selected={selectedOption === "option1"}
              onClick={() =>
                setSelectedOption("option1")
              }
            />

            <PremiumCard
              title="Option 2"
              amount={premiums.option2}
              selected={selectedOption === "option2"}
              onClick={() =>
                setSelectedOption("option2")
              }
            />

            <PremiumCard
              title="Option 3"
              amount={premiums.option3}
              selected={selectedOption === "option3"}
              onClick={() =>
                setSelectedOption("option3")
              }
            />

          </div>

        </div>


        {/* PREMIUM BREAKDOWN */}
        <div className="bg-white border border-[#d7e1de] rounded-xl overflow-hidden">

          <div className="px-6 py-5 border-b border-[#d7e1de]">

            <h2 className="text-lg font-semibold text-[#073f35]">
              Premium Breakdown
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Review benefit values across all coverage tiers.
            </p>

          </div>


          <div className="overflow-x-auto">

            <table className="w-full min-w-[850px]">

              <thead>

                <tr className="bg-[#f4f8f6]">

                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-600 border-b">
                    Benefit
                  </th>

                  <th className="text-left px-4 py-4 text-xs font-semibold text-gray-600 border-b">
                    Current
                  </th>

                  <th className="text-left px-4 py-4 text-xs font-semibold text-[#006653] border-b">
                    Option 1
                  </th>

                  <th className="text-left px-4 py-4 text-xs font-semibold text-[#006653] border-b">
                    Option 2
                  </th>

                  <th className="text-left px-4 py-4 text-xs font-semibold text-[#006653] border-b">
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

                    <td className="px-5 py-4 border-b text-sm font-medium text-[#073f35]">
                      {benefit.name}
                    </td>

                    <td className="px-4 py-4 border-b text-sm text-gray-500">
                      {benefit.current}
                    </td>

                    <td
                      className={`px-4 py-4 border-b text-sm ${
                        selectedOption === "option1"
                          ? "font-semibold text-[#006653]"
                          : "text-gray-700"
                      }`}
                    >
                      {benefit.option1}
                    </td>

                    <td
                      className={`px-4 py-4 border-b text-sm ${
                        selectedOption === "option2"
                          ? "font-semibold text-[#006653]"
                          : "text-gray-700"
                      }`}
                    >
                      {benefit.option2}
                    </td>

                    <td
                      className={`px-4 py-4 border-b text-sm ${
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">


          {/* SELECTED */}

          <div className="bg-white border border-[#d7e1de] rounded-xl p-6">

            <h2 className="font-semibold text-[#073f35]">
              Selected Pricing
            </h2>

            <div className="mt-5 bg-[#eef8f4] rounded-xl p-5">

              <div className="flex justify-between">

                <div>

                  <p className="text-xs text-gray-500">
                    Selected Option
                  </p>

                  <p className="text-xl font-bold text-[#006653] mt-1">

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


              <div className="mt-5 pt-4 border-t border-[#cce9df]">

                <p className="text-xs text-gray-500">
                  Estimated Premium
                </p>

                <p className="text-3xl font-bold text-[#073f35] mt-1">
                  {premiums[selectedOption]}
                </p>

              </div>


              <div className="mt-4">

                <p className="text-xs text-gray-500">
                  Commission
                </p>

                <p className="text-sm font-semibold text-[#073f35] mt-1">
                  {commission}%
                </p>

              </div>

            </div>

          </div>


          {/* VALIDATION */}

          <div className="bg-white border border-[#d7e1de] rounded-xl p-6">

            <h2 className="font-semibold text-[#073f35]">
              Pricing Validation
            </h2>

            <div className="mt-5 space-y-4">

              <ValidationRow
                label="Commission rate"
                value={`${commission}%`}
                success
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


        {/* WARNING */}

        <div className="bg-[#fff9ee] border border-[#f0dfbd] rounded-xl p-5">

          <div className="flex gap-3">

            <AlertTriangle
              size={20}
              className="text-orange-500 shrink-0"
            />

            <div>

              <p className="text-sm font-semibold text-[#765000]">
                Pricing Rule Notice
              </p>

              <p className="text-xs text-gray-600 mt-1">
                Premium calculation shown here is a frontend
                prototype. The final calculation formula must
                follow the approved business rules.
              </p>

            </div>

          </div>

        </div>


        {/* ACTIONS */}

        <div className="bg-white border border-[#d7e1de] rounded-xl p-5">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <button
              onClick={goBack}
              className="flex items-center justify-center gap-2 px-5 py-3 border border-[#006653] text-[#006653] rounded-lg hover:bg-[#eef8f4] text-sm font-medium"
            >

              <ArrowLeft size={18} />

              Back to Options

            </button>


            <button
              onClick={savePricing}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#006653] text-white rounded-lg hover:bg-[#005344] text-sm font-medium"
            >

              <Save size={18} />

              {saved
                ? "Pricing Saved"
                : "Save Pricing"}

            </button>

          </div>

        </div>

      </div>

    </div>
  );
}


/* ============================================================
   INFO ITEM
   ============================================================ */

function InfoItem({
  label,
  value,
}) {
  return (
    <div>

      <p className="text-xs text-gray-500 mb-1">
        {label}
      </p>

      <p className="text-sm font-semibold text-[#073f35]">
        {value}
      </p>

    </div>
  );
}


/* ============================================================
   PREMIUM CARD
   ============================================================ */

function PremiumCard({
  title,
  amount,
  selected,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`relative text-left bg-white rounded-xl border p-6 w-full transition ${
        selected
          ? "border-[#009879] ring-2 ring-[#d8f1e8]"
          : "border-[#d7e1de] hover:border-[#009879]"
      }`}
    >

      <div className="flex items-center justify-between">

        <div>

          <p className="text-xs text-gray-500">
            Coverage Tier
          </p>

          <h3 className="text-lg font-semibold text-[#073f35] mt-1">
            {title}
          </h3>

        </div>


        {selected && (
          <div className="w-7 h-7 rounded-full bg-[#009879] flex items-center justify-center">

            <CheckCircle2
              size={17}
              className="text-white"
            />

          </div>
        )}

      </div>


      <div className="mt-6">

        <p className="text-xs text-gray-500">
          Estimated Premium
        </p>

        <p className="text-3xl font-bold text-[#073f35] mt-1">
          {amount}
        </p>

      </div>


      <div
        className={`mt-5 text-sm font-medium ${
          selected
            ? "text-[#006653]"
            : "text-gray-500"
        }`}
      >
        {selected
          ? "Selected for proposal"
          : "Select this option"}
      </div>

    </button>
  );
}


/* ============================================================
   VALIDATION ROW
   ============================================================ */

function ValidationRow({
  label,
  value,
  success,
  warning,
}) {
  return (
    <div className="flex items-center justify-between">

      <div className="flex items-center gap-2">

        {success && (
          <CheckCircle2
            size={17}
            className="text-[#009879]"
          />
        )}

        {warning && (
          <AlertTriangle
            size={17}
            className="text-orange-500"
          />
        )}

        <span className="text-sm text-gray-600">
          {label}
        </span>

      </div>


      <span
        className={`text-xs font-medium ${
          success
            ? "text-[#00856b]"
            : "text-orange-600"
        }`}
      >
        {value}
      </span>

    </div>
  );
}


export default Pricing;