import React, { useState, useEffect } from "react";

export default function Forex() {
    const [base, setBase] = useState("USD");
    const [baseAmt, setBaseAmt] = useState(1);
    const currencyTypes = ["USD", "GBP", "EUR", "JPY"];
    const [currencyVals, setCurrencyVals] = useState(
        currencyTypes.map(() => "...")
    );
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAllRates() {
            setLoading(true);

            const updatedVals = [...currencyVals];

            const quotesToFetch = currencyTypes.filter((q) => q !== base);
            let data = null;

            if (quotesToFetch.length > 0) {
                const symbols = quotesToFetch.join(",");
                const url = `https://api.frankfurter.dev/v1/latest?base=${base}&symbols=${symbols}`;
                const response = await fetch(url);
                if (response.ok) {
                    data = await response.json();
                }
            }

            currencyTypes.forEach((quote, index) => {
                if (quote === base) {
                    updatedVals[index] = baseAmt.toFixed(4);
                } else if (data?.rates?.[quote] != null) {
                    updatedVals[index] = (baseAmt * (1 * data.rates[quote])).toFixed(4);
                } else {
                    updatedVals[index] = "error";
                }
            });

            setCurrencyVals(updatedVals);
            setLoading(false);
        }

        fetchAllRates();
    }, [base]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <h1 ClassName="text-3xl font-bold text-gray-800">Currency Converter</h1>
                        <p>
                            {baseAmt} {base} Equals:
                        </p>
                        {loading ? (
                            <p className="text-blue-600">Loading conversions...</p>
                        ) : (
                            <ul className="text-sm text-blue-700 space-y-1">
                                {currencyTypes.map((currency, index) => (
                                    <li key={currency}>
                                        {currency}: {currencyVals[index]}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}