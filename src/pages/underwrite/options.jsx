import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  AlertTriangle,
  Save,
  ArrowRight,
} from "lucide-react";


/* ============================================================
   BENEFIT DATA
   ============================================================ */

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


/* ============================================================
   PREMIUM DATA
   ============================================================ */

const premiumData = {
  option1: "$1,250",
  option2: "$1,480",
  option3: "$1,720",
};


/* ============================================================
   MAIN COMPONENT
   ============================================================ */

function Options() {
  const navigate = useNavigate();

  const [benefits, setBenefits] =
    useState(initialBenefits);

  // Option 2 selected by default
  const [selectedOption, setSelectedOption] =
    useState("option2");

  const [saved, setSaved] =
    useState(false);


  /* ==========================================================
     UPDATE BENEFIT
     ========================================================== */

  const updateBenefit = (
    id,
    field,
    value
  ) => {
    setBenefits((previous) =>
      previous.map((benefit) =>
        benefit.id === id
          ? {
              ...benefit,
              [field]: value,
            }
          : benefit
      )
    );

    setSaved(false);
  };


  /* ==========================================================
     SAVE OPTIONS
     ========================================================== */

  const saveOptions = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };


  /* ==========================================================
     CONTINUE TO PRICING
     ========================================================== */

  const continueToPricing = () => {
    navigate("/underwriter/pricing");
  };


  return (
    <div className="min-h-full bg-[#f6f8f7]">

      {/* ======================================================
          PAGE HEADER
          ====================================================== */}

      <div className="px-7 pt-6 pb-4">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          {/* LEFT SIDE */}

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
                Compare and configure benefit coverage options
              </p>

            </div>

          </div>


          {/* RIGHT SIDE */}

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


      {/* ======================================================
          PROJECT INFORMATION
          ====================================================== */}

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
              label="Status"
              value="Underwriting In Progress"
            />

          </div>

        </div>

      </div>


      {/* ======================================================
          MAIN CONTENT
          ====================================================== */}

      <div className="p-7 space-y-6">


        {/* ====================================================
            PROPOSAL OPTIONS
            ==================================================== */}

        <div>

          <div className="mb-4">

            <h2 className="text-lg font-semibold text-[#073f35]">
              Proposal Options
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Select the coverage option you want to configure.
            </p>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">


            {/* OPTION 1 */}

            <OptionCard
              title="Option 1"
              premium={premiumData.option1}
              description="Standard coverage"
              selected={
                selectedOption === "option1"
              }
              onSelect={() =>
                setSelectedOption("option1")
              }
            />


            {/* OPTION 2 */}

            <OptionCard
              title="Option 2"
              premium={premiumData.option2}
              description="Enhanced coverage"
              selected={
                selectedOption === "option2"
              }
              onSelect={() =>
                setSelectedOption("option2")
              }
              recommended
            />


            {/* OPTION 3 */}

            <OptionCard
              title="Option 3"
              premium={premiumData.option3}
              description="Maximum coverage"
              selected={
                selectedOption === "option3"
              }
              onSelect={() =>
                setSelectedOption("option3")
              }
            />

          </div>

        </div>


        {/* ====================================================
            BENEFIT COMPARISON
            ==================================================== */}

        <div className="bg-white border border-[#d7e1de] rounded-xl overflow-hidden">

          <div className="px-6 py-5 border-b border-[#d7e1de]">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

              <div>

                <h2 className="text-lg font-semibold text-[#073f35]">
                  Benefit Comparison
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Current coverage compared with the three proposal options.
                </p>

              </div>

              <span className="text-xs bg-[#e5f6ef] text-[#00785f] px-3 py-1.5 rounded-full">
                6 Benefits
              </span>

            </div>

          </div>


          <div className="overflow-x-auto">

            <table className="w-full min-w-[950px] border-collapse">

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

                  <th className="text-center px-4 py-4 text-xs font-semibold text-gray-600 border-b">
                    Selected
                  </th>

                </tr>

              </thead>


              <tbody>

                {benefits.map((benefit) => (

                  <tr
                    key={benefit.id}
                    className="hover:bg-[#fafcfb]"
                  >

                    {/* BENEFIT */}

                    <td className="px-5 py-4 border-b">

                      <p className="text-sm font-medium text-[#073f35]">
                        {benefit.name}
                      </p>

                    </td>


                    {/* CURRENT */}

                    <td className="px-4 py-4 border-b">

                      <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
                        {benefit.current}
                      </div>

                    </td>


                    {/* OPTION 1 */}

                    <td className="px-4 py-4 border-b">

                      <input
                        value={benefit.option1}
                        onChange={(e) =>
                          updateBenefit(
                            benefit.id,
                            "option1",
                            e.target.value
                          )
                        }
                        className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#bde5d8] ${
                          selectedOption === "option1"
                            ? "border-[#009879] bg-[#f1faf7]"
                            : "border-[#d7e1de]"
                        }`}
                      />

                    </td>


                    {/* OPTION 2 */}

                    <td className="px-4 py-4 border-b">

                      <input
                        value={benefit.option2}
                        onChange={(e) =>
                          updateBenefit(
                            benefit.id,
                            "option2",
                            e.target.value
                          )
                        }
                        className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#bde5d8] ${
                          selectedOption === "option2"
                            ? "border-[#009879] bg-[#f1faf7]"
                            : "border-[#d7e1de]"
                        }`}
                      />

                    </td>


                    {/* OPTION 3 */}

                    <td className="px-4 py-4 border-b">

                      <input
                        value={benefit.option3}
                        onChange={(e) =>
                          updateBenefit(
                            benefit.id,
                            "option3",
                            e.target.value
                          )
                        }
                        className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#bde5d8] ${
                          selectedOption === "option3"
                            ? "border-[#009879] bg-[#f1faf7]"
                            : "border-[#d7e1de]"
                        }`}
                      />

                    </td>


                    {/* SELECTED */}

                    <td className="px-4 py-4 border-b text-center">

                      <div className="flex justify-center">

                        <Check
                          size={19}
                          className="text-[#009879]"
                        />

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>


        {/* ====================================================
            SELECTED OPTION + PREMIUM
            ==================================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">


          {/* SELECTED OPTION */}

          <div className="bg-white border border-[#d7e1de] rounded-xl p-6">

            <h2 className="font-semibold text-[#073f35]">
              Selected Option
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Current option selected for proposal configuration.
            </p>


            <div className="mt-5 bg-[#eef8f4] border border-[#cce9df] rounded-xl p-5">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs text-gray-500">
                    Selected Coverage
                  </p>

                  <p className="text-xl font-bold text-[#006653] mt-1">

                    {selectedOption === "option1"
                      ? "Option 1"
                      : selectedOption === "option2"
                      ? "Option 2"
                      : "Option 3"}

                  </p>

                </div>


                <div className="w-11 h-11 rounded-full bg-[#d5f0e6] flex items-center justify-center">

                  <Check
                    size={23}
                    className="text-[#00856b]"
                  />

                </div>

              </div>


              <div className="mt-5 pt-4 border-t border-[#cce9df]">

                <p className="text-xs text-gray-500">
                  Estimated Premium
                </p>

                <p className="text-2xl font-bold text-[#073f35] mt-1">
                  {premiumData[selectedOption]}
                </p>

              </div>

            </div>

          </div>


          {/* PREMIUM SUMMARY */}

          <div className="bg-white border border-[#d7e1de] rounded-xl p-6">

            <h2 className="font-semibold text-[#073f35]">
              Premium Summary
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Estimated premiums for each coverage tier.
            </p>


            <div className="mt-5 space-y-3">

              <PremiumRow
                label="Option 1"
                amount="$1,250"
                selected={
                  selectedOption === "option1"
                }
              />

              <PremiumRow
                label="Option 2"
                amount="$1,480"
                selected={
                  selectedOption === "option2"
                }
              />

              <PremiumRow
                label="Option 3"
                amount="$1,720"
                selected={
                  selectedOption === "option3"
                }
              />

            </div>

          </div>

        </div>


        {/* ====================================================
            EXCEPTIONS
            ==================================================== */}

        <div className="bg-white border border-[#d7e1de] rounded-xl">

          <div className="px-6 py-5 border-b border-[#d7e1de]">

            <div className="flex items-center gap-2">

              <AlertTriangle
                size={20}
                className="text-orange-500"
              />

              <div>

                <h2 className="font-semibold text-[#073f35]">
                  Exceptions
                </h2>

                <p className="text-xs text-gray-500 mt-1">
                  Items requiring attention before proposal generation.
                </p>

              </div>

            </div>

          </div>


          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">

            <ExceptionCard
              title="Pending Change Request"
              description="Maternity benefit requires review."
            />

            <ExceptionCard
              title="N/A Benefit"
              description="N/A values will be hidden from the client-facing proposal."
            />

          </div>

        </div>


        {/* ====================================================
            ACTION BAR
            ==================================================== */}

        <div className="bg-white border border-[#d7e1de] rounded-xl p-5">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>

              <p className="text-sm font-medium text-[#073f35]">
                Option Configuration
              </p>

              <p className="text-xs text-gray-500 mt-1">
                Save your changes before continuing to pricing.
              </p>

            </div>


            <div className="flex flex-col sm:flex-row gap-3">

              <button
                onClick={saveOptions}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-[#006653] text-[#006653] hover:bg-[#eef8f4] text-sm font-medium"
              >

                <Save size={18} />

                {saved
                  ? "Options Saved"
                  : "Save Options"}

              </button>


              <button
                onClick={continueToPricing}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#006653] hover:bg-[#005344] text-white text-sm font-medium"
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


/* ============================================================
   OPTION CARD
   ============================================================ */

function OptionCard({
  title,
  premium,
  description,
  selected,
  onSelect,
  recommended,
}) {

  return (

    <div
      className={`bg-white rounded-xl border p-5 transition ${
        selected
          ? "border-[#009879] ring-2 ring-[#d8f1e8]"
          : "border-[#d7e1de]"
      }`}
    >

      {/* TOP SECTION */}

      <div className="flex items-start justify-between">

        <div>

          <p className="text-xs text-gray-500">
            Coverage Tier
          </p>

          <h3 className="text-lg font-semibold text-[#073f35] mt-1">
            {title}
          </h3>

        </div>


        {/* RIGHT SIDE */}

        <div className="flex flex-col items-center">

          {/* GREEN TICK ONLY WHEN SELECTED */}

          {selected && (

            <div className="w-7 h-7 rounded-full bg-[#009879] flex items-center justify-center">

              <Check
                size={17}
                strokeWidth={3}
                className="text-white"
              />

            </div>

          )}


          {/* RECOMMENDED ALWAYS VISIBLE */}

          {recommended && (

            <span className="mt-2 bg-[#e5f6ef] text-[#00785f] text-[11px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap">

              Recommended

            </span>

          )}

        </div>

      </div>


      {/* DESCRIPTION */}

      <p className="text-sm text-gray-500 mt-4">
        {description}
      </p>


      {/* PREMIUM */}

      <div className="mt-5">

        <p className="text-xs text-gray-500">
          Estimated Premium
        </p>

        <p className="text-2xl font-bold text-[#073f35] mt-1">
          {premium}
        </p>

      </div>


      {/* SELECT BUTTON */}

      <button
        onClick={onSelect}
        className={`w-full mt-5 py-2.5 rounded-lg text-sm font-medium ${
          selected
            ? "bg-[#006653] text-white"
            : "border border-[#006653] text-[#006653] hover:bg-[#eef8f4]"
        }`}
      >

        {selected
          ? "Selected"
          : "Select Option"}

      </button>

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
   PREMIUM ROW
   ============================================================ */

function PremiumRow({
  label,
  amount,
  selected,
}) {

  return (

    <div
      className={`flex items-center justify-between px-4 py-3 rounded-lg border ${
        selected
          ? "border-[#009879] bg-[#eef8f4]"
          : "border-[#dce5e2]"
      }`}
    >

      <div className="flex items-center gap-2">

        {selected && (

          <Check
            size={17}
            className="text-[#009879]"
          />

        )}

        <span className="text-sm text-gray-700">
          {label}
        </span>

      </div>


      <span className="font-semibold text-[#073f35]">
        {amount}
      </span>

    </div>

  );
}


/* ============================================================
   EXCEPTION CARD
   ============================================================ */

function ExceptionCard({
  title,
  description,
}) {

  return (

    <div className="flex gap-3 bg-[#fff9ee] border border-[#f0dfbd] rounded-lg p-4">

      <AlertTriangle
        size={19}
        className="text-orange-500 shrink-0"
      />

      <div>

        <p className="text-sm font-medium text-[#765000]">
          {title}
        </p>

        <p className="text-xs text-gray-500 mt-1">
          {description}
        </p>

      </div>

    </div>

  );
}


export default Options;