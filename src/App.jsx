import React, { useState, useEffect } from "react";

export default function Forex() {
    const [base, setBase] = useState("USD");
    const [baseAmt, setBaseAmt] = useState(1);
    const [baseFlag, setBaseFlag] = useState('🇺🇸');
    const currencyTypes = ['KRW','JPY','THB','HKD','CNY','MYR','SGD','USD','EUR','GBP','ETH','BTC'];
    const countryFlags = ['🇰🇷','🇯🇵','🇹🇭','🇭🇰','🇨🇳','🇲🇾','🇸🇬','🇺🇸','🇪🇺','🇬🇧','🔷','฿'];
    const cryptoIds = ['ethereum','bitcoin'];
    const cryptoTickers = {'ethereum':'ETH','bitcoin':'BTC'};
    const [rates, setRates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [draftBase, setDraftBase] = useState(base);
    const [draftAmt, setDraftAmt] = useState(String(baseAmt));
    const [draftFlag, setDraftFlag] = useState(String(baseFlag));

    const currencyVals = currencyTypes.map((quote) => {
        if(loading){return "...";}
        if(quote === base){return baseAmt.toFixed(4);}
        if(!rates[quote]||!rates[base]){return "error";}
        return (baseAmt * (rates[quote] / rates[base])).toFixed(4);
    });

    function openModal(newBase, newFlag, curAmt) {
        const parsed = Number(curAmt);
        if (!Number.isFinite(parsed) || parsed <= 0) return;
        setDraftBase(newBase);
        setDraftAmt(String(parsed));
        setDraftFlag(newFlag);
        setIsModalOpen(true);
    }

    function closeModal() {
        setIsModalOpen(false);
    }

    function applyModal() {
        const parsed = Number(draftAmt);
        if (!Number.isFinite(parsed) || parsed <= 0) return;
        setBase(draftBase);
        setBaseAmt(parsed);
        setBaseFlag(draftFlag);
        setIsModalOpen(false);
    }

    useEffect(() => {
        let cancelled=false;

        async function fetchRates() {
            setLoading(true);
            const url_fiat=`https://api.frankfurter.dev/v1/latest?base=USD&symbols=${currencyTypes.join(",")}`;
            const response_fiat=await fetch(url_fiat);
            const data_fiat=await response_fiat.json();

            const url_crypto=`https://api.coingecko.com/api/v3/simple/price?ids=${cryptoIds.join(",")}&vs_currencies=${base}`;
            const response_crypto=await fetch(url_crypto);
            const data_crypto=await response_crypto.json();
            const cryptoRates = {};
            for (const [id, values] of Object.entries(data_crypto)) {
                const ticker = cryptoTickers[id];
                cryptoRates[ticker] = values['usd'];
            }

            setRates({...data_fiat.rates,...cryptoRates,'USD':1.0000});
            if (!cancelled) {
                setLoading(false);
            }
        }
        fetchRates();
        return () => {
            cancelled = true;
        };
    },[]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <div className="flex flex-col items-center gap-2 mb-2">
                        <h1 className="text-3xl font-bold text-gray-800">Forex Converter</h1>
                        <p>
                            {baseAmt} {base} {baseFlag}
                        </p>
                        {loading ? (
                            <p className="text-blue-600">Loading conversions...</p>
                        ) : (
                            <ul className="text-sm text-blue-700 space-y-1">
                                {currencyTypes.map((currency, index) => (
                                    <li key={currency}>
                                        {currency} {countryFlags[index]}:
                                        <button
                                            onClick={() => openModal(currency, countryFlags[index], currencyVals[index])}
                                            className="px-3 py-1 rounded-lg bg-white/70 hover:bg-white shadow-sm border border-gray-200 text-gray-800"
                                            type="button"
                                            disabled={
                                                currencyVals[index] === "..." ||
                                                currencyVals[index] === "error"
                                            }
                                        >
                                            {currencyVals[index]}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
                {/* Modal */}
                {isModalOpen && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center"
                        role="dialog"
                        aria-modal="true"
                        onMouseDown={(e) => {
                            // click outside closes
                            if (e.target === e.currentTarget) closeModal();
                        }}
                    >
                        {/* Backdrop */}
                        <div className="absolute inset-0 bg-black/40" />

                        {/* Panel */}
                        <div className="relative w-full max-w-md mx-4 rounded-2xl bg-white shadow-xl p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                Set base currency & amount
                            </h2>

                            <div className="space-y-4">
                                <div className="text-left">
                                    <label className="block text-sm text-gray-600 mb-1">
                                        Currency
                                    </label>
                                    <select
                                        value={draftBase}
                                        onChange={(e) => setDraftBase(e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 p-2"
                                    >
                                        {currencyTypes.map((c) => (
                                            <option key={c} value={c}>
                                                {c}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="text-left">
                                    <label className="block text-sm text-gray-600 mb-1">
                                        Amount
                                    </label>
                                    <input
                                        value={draftAmt}
                                        onChange={(e) => setDraftAmt(e.target.value)}
                                        inputMode="decimal"
                                        className="w-full rounded-lg border border-gray-200 p-2"
                                        placeholder="e.g. 1.00"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Must be a positive number.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-2">
                                <button
                                    onClick={closeModal}
                                    className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                                    type="button"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={applyModal}
                                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                                    type="button"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}