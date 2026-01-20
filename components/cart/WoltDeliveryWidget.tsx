import { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import type { WoltEstimateResponse, WoltOrderResponse, WoltEligibility } from "@/app/lib/wolt";
import { checkDeliveryEligibility, getSmartSuggestion, CITIES } from "@/app/lib/wolt";
import type { CartItem } from "@/app/types";
import { useCart } from "@/app/components/cart/CartProvider";
import WoltSmartTip from "./WoltSmartTip";

// Normalized cart item type (flat structure with qty, used by Wolt functions)
type NormalizedCartItem = {
    id: string;
    productId: string;
    qty: number;
    name: string;
    weightKg?: number;
    volumeM3?: number;
    lengthCm?: number;
    widthCm?: number;
    heightCm?: number;
    bulky?: boolean;
    fragile?: boolean;
    deliveryClass?: "small" | "medium" | "heavy" | "oversize";
};

type DeliveryMethod = "pickup" | "wolt";

interface WoltState {
    street: string;
    city: string;
    phone: string;
    method: DeliveryMethod;
}

export default function WoltDeliveryWidget({
    items,
    onDeliveryChange
}: {
    items: CartItem[];
    onDeliveryChange: (method: DeliveryMethod) => void;
}) {
    const { t } = useLanguage();
    // Assuming t works as Dictionary, but if strict typing fails we cast to Record<string, any>
    // to match legacy behavior without 'any'.
    const dict = t as unknown as Record<string, unknown>;
    const woltDict = (dict.wolt || {}) as Record<string, string>;

    const { updateQuantity } = useCart();
    const [method, setMethod] = useState<DeliveryMethod>("pickup");
    const [address, setAddress] = useState({ street: "", city: "Tallinn", phone: "" });
    const [estimate, setEstimate] = useState<WoltEstimateResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [order, setOrder] = useState<WoltOrderResponse | null>(null);
    const [eligibilityResult, setEligibilityResult] = useState<WoltEligibility | null>(null);

    // Prepare items for Wolt (flatten structure for compatibility)
    const normalizedItems: NormalizedCartItem[] = useMemo(() => {
        return items.map(item => ({
            ...item.product,
            id: item.id, // Cart item ID
            productId: item.product_id,
            qty: item.quantity,
            name: item.product.name // explicit name
        }));
    }, [items]);

    // Auto-check on load/change
    useEffect(() => {
        const result = checkDeliveryEligibility(normalizedItems, address.city);
        setEligibilityResult(result);
    }, [normalizedItems, address.city]);

    // Load persisted preference
    useEffect(() => {
        const savedCity = localStorage.getItem("sb_wolt_city");
        if (savedCity && CITIES.includes(savedCity)) {
            setAddress(prev => ({ ...prev, city: savedCity }));
        }
    }, []);

    // Persist choice
    const handleCityChange = (newCity: string) => {
        setAddress({ ...address, city: newCity });
        localStorage.setItem("sb_wolt_city", newCity);
    };
    // Tip State (to handle Undo)
    const [lastAction, setLastAction] = useState<{ type: string; itemId: string; originalQty: number } | null>(null);

    // Calc split
    const eligibility = useMemo(() => {
        return checkDeliveryEligibility(normalizedItems, address.city);
    }, [normalizedItems, address.city]);

    const isFullyEligible = eligibility.state === 'eligible';
    const isSplitPossible = eligibility.state === 'partial';

    // Enrich items for rendering
    const enrichedEligibleItems = useMemo(() => {
        return eligibility.eligibleItems.map(ei => {
            const original = normalizedItems.find(i => (i.id) === ei.id);
            return { ...original!, qty: ei.qty };
        });
    }, [eligibility, normalizedItems]);

    const enrichedIneligibleItems = useMemo(() => {
        return eligibility.ineligibleItems.map(ei => {
            const original = normalizedItems.find(i => (i.id) === ei.id);
            return { item: { ...(original || {}), qty: original?.qty || 0, name: original?.name || 'Unknown' }, reasons: ei.reasons };
        });
    }, [eligibility, normalizedItems]);

    // On-the-fly Totals
    const eligibleTotals = useMemo(() => ({
        weight: enrichedEligibleItems.reduce((s, i) => s + (i.weightKg || 0) * i.qty, 0),
        count: enrichedEligibleItems.reduce((s, i) => s + i.qty, 0)
    }), [enrichedEligibleItems]);

    const ineligibleTotals = useMemo(() => ({
        weight: enrichedIneligibleItems.reduce((s, i) => s + (i.item.weightKg || 0) * (i.item.qty || 1), 0), // Use number fallback
        count: enrichedIneligibleItems.reduce((s, i) => s + (i.item.qty || 1), 0)
    }), [enrichedIneligibleItems]);

    const isWoltAvailable = isFullyEligible || isSplitPossible;

    // Analytics: Track Tip Impression
    const suggestion = useMemo(() => {
        if (eligibility.ineligibleItems.length === 0) return null;
        return getSmartSuggestion(normalizedItems);
    }, [normalizedItems, eligibility]);

    useEffect(() => {
        if (method === "wolt" && suggestion && !isFullyEligible) {
            console.log("[ANALYTICS] inline_tip_shown", {
                type: suggestion.type,
                reason: suggestion.reason,
                item: suggestion.itemName
            });
        }
    }, [method, suggestion, isFullyEligible]);

    // Analytics: Track Success
    useEffect(() => {
        if (method === "wolt" && isFullyEligible && lastAction) {
            console.log("[ANALYTICS] inline_tip_success_enabled_wolt", { success: true });
        }
    }, [method, isFullyEligible, lastAction]);

    // Initialize state from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem("sb_wolt_state");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.method && (parsed.method === 'pickup' || isWoltAvailable)) {
                    setMethod(parsed.method);
                    onDeliveryChange(parsed.method);
                } else if (parsed.method === 'wolt' && !isWoltAvailable) {
                    setMethod('pickup');
                    onDeliveryChange('pickup');
                }
                if (parsed.street) setAddress({ street: parsed.street, city: parsed.city || "Pärnu", phone: parsed.phone || "" });
            }
        } catch (e) {
            console.error("Failed to load wolt state", e);
        }
    }, [onDeliveryChange, isWoltAvailable]);

    // Persist state
    useEffect(() => {
        const state: WoltState = { ...address, method };
        localStorage.setItem("sb_wolt_state", JSON.stringify(state));
    }, [address, method]);

    // Helper to calc price (Mock)
    const getQuoteForItems = async (items: unknown[]) => {
        return { price: 5.90 + (items.length * 0.1), eta: 35 };
    };

    const handleEstimate = async () => {
        if (!address.street || !address.phone) return;
        setLoading(true);
        setEstimate(null); // Reset prev estimate
        try {
            await new Promise(r => setTimeout(r, 600)); // Fake network delay

            const result = checkDeliveryEligibility(normalizedItems, address.city);
            setEligibilityResult(result);

            if (result.state === 'eligible' || result.state === 'partial') {
                const pricing = await getQuoteForItems(result.eligibleItems);
                setEstimate({
                    price: pricing.price,
                    eta_minutes: pricing.eta,
                    currency: "EUR",
                    is_demo: true,
                });
            } else {
                setEstimate(null);
            }
        } catch (e) {
            console.error(e);
            alert(woltDict.error_estimate || "Error");
        } finally {
            setLoading(false);
        }
    };

    // ... rest of component ...
    // Skipping handleCreateOrder as it was not changed, but I have to be careful with range.
    // Actually handleCreateOrder uses setOrder etc.
    // I need to make sure I am replacing the block correctly. StartLine was 58 (lastAction).
    // I will include handleCreateOrder in replacement content to be safe or target strict range.
    // My StartLine is 58. I will replace up to line 198 (end of handleEstimate).
    // Wait, the block includes handleUndo.
    // I need to provide `handleCreateOrder` as well if I am replacing a big block.
    // Or just cut out handleUndo?
    // handleUndo is at 132-138.
    // I will replace 57-198.

    const handleCreateOrder = async () => {
        if (!estimate) return;
        setLoading(true);
        try {
            await new Promise(r => setTimeout(r, 1000));
            setOrder({
                tracking_url: "https://wolt.com/track/mock",
                order_id: "mock_order_123",
                eta: "35 min"
            } as unknown as WoltOrderResponse);
        } catch (e) {
            console.error(e);
            alert("Failed to create order");
        } finally {
            setLoading(false);
        }
    };

    if (eligibilityResult === null && !estimate) {
        // Initial state logic
    }

    return (
        <div className="mt-8 rounded-3xl bg-surface p-6 overflow-hidden">
            <h2 className="text-xl text-premium mb-6 flex items-center gap-2">
                {t.cart.title} <span className="text-slate-500 text-base font-normal">(Delivery)</span>
            </h2>

            {/* Delivery Method Selector */}
            <div className="flex gap-4 mb-6">
                <label className={`flex-1 cursor-pointer rounded-xl border p-4 transition-all ${method === 'pickup' ? 'border-emerald-500 bg-emerald-900/20 text-emerald-100 ring-1 ring-emerald-500/50' : 'border-slate-700 bg-slate-800/50 hover:border-emerald-500/50 hover:bg-slate-800'}`}>
                    <input
                        type="radio"
                        name="delivery"
                        value="pickup"
                        checked={method === "pickup"}
                        onChange={() => { setMethod("pickup"); onDeliveryChange("pickup"); }}
                        className="sr-only"
                    />
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🏪</span>
                        <div className="font-bold text-sm md:text-base">{woltDict.method_pickup}</div>
                    </div>
                </label>

                <label className={`flex-1 relative rounded-xl border p-4 transition-all ${!isWoltAvailable ? 'opacity-50 cursor-not-allowed border-slate-800 bg-slate-900' : (method === 'wolt' ? 'cursor-pointer border-blue-500 bg-blue-900/20 text-blue-100 ring-1 ring-blue-500/50' : 'cursor-pointer border-slate-700 bg-slate-800/50 hover:border-blue-500/50 hover:bg-slate-800')}`}>
                    <input
                        type="radio"
                        name="delivery"
                        value="wolt"
                        checked={method === "wolt"}
                        onChange={() => {
                            if (isWoltAvailable) {
                                setMethod("wolt");
                                onDeliveryChange("wolt");
                            }
                        }}
                        disabled={!isWoltAvailable}
                        className="sr-only"
                    />
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🚙</span>
                        <div>
                            <div className="font-bold text-sm md:text-base">{woltDict.method_wolt}</div>
                            {method !== 'wolt' && <div className="text-xs text-slate-400">Powered by Wolt Drive</div>}
                        </div>
                    </div>
                    {/* Eligibility Badge */}
                    {!isFullyEligible && !isSplitPossible && (
                        <div className="absolute -top-2 -right-2 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full border border-red-200">
                            N/A
                        </div>
                    )}
                    {/* Split Badge */}
                    {isSplitPossible && (
                        <div className="absolute -top-2 -right-2 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full border border-amber-200">
                            Partial
                        </div>
                    )}

                    {/* INLINE SMART TIP */}
                    {suggestion && !isFullyEligible && (
                        <div className="w-full mt-2" onClick={e => { e.preventDefault(); e.stopPropagation(); }}>
                            <WoltSmartTip
                                suggestion={suggestion}
                                items={normalizedItems}
                                city={address.city}
                                onApply={(newItem) => {
                                    // newItem has qty, but updateQuantity expects cart item id and quantity
                                    // Find the original cart item ID from normalizedItems
                                    updateQuantity(newItem.id, newItem.qty);
                                }}
                                onUndo={() => {
                                    if (lastAction && lastAction.type === "REDUCE_QTY") {
                                        updateQuantity(lastAction.itemId, lastAction.originalQty);
                                    }
                                    setLastAction(null);
                                }}
                            />
                        </div>
                    )}
                </label>
            </div>

            {/* ERROR VIEW */}
            {!isWoltAvailable && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl">
                    <h3 className="text-sm font-bold text-red-200 flex items-center gap-2 mb-2">{woltDict.ineligible_title}</h3>
                    <div className="text-sm text-red-200/70 mb-3 space-y-1">
                        {enrichedIneligibleItems.map((si, idx) => (
                            <div key={idx}>• {si.item.name} (x{si.item.qty}): {si.reasons.map(r => (woltDict.reasons as unknown as Record<string, string>)?.[r] || r).join(", ")}</div>
                        ))}
                    </div>
                </div>
            )}

            {/* PARTIAL VIEW */}
            {method === "wolt" && isSplitPossible && (
                <div className="mb-6 space-y-4 animate-in fade-in">
                    <div className="bg-amber-900/30 border border-amber-500/50 rounded-xl p-6 text-center">
                        <div className="h-12 w-12 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">⚠️</div>
                        <h3 className="text-lg font-bold text-amber-100 mb-2">{woltDict.split_title || "Tellimus jagatakse kaheks"}</h3>
                        <button className="bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold py-2 px-6 rounded-lg transition-colors shadow-lg shadow-amber-900/40">
                            {woltDict.action_auto_split || "Jaga korv automaatselt"}
                        </button>
                    </div>

                    {/* Eligible Section */}
                    <div className="rounded-xl border border-slate-700/50 overflow-hidden">
                        <div className="bg-slate-800/80 border-b border-slate-700 px-4 py-3 flex justify-between items-center">
                            <h4 className="font-bold text-slate-200 flex items-center gap-2"><span className="text-lg">🚙</span> {woltDict.wolt_eligible_section}</h4>
                            <span className="text-xs font-medium text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-700">
                                {eligibleTotals.weight.toFixed(1)}kg / {eligibleTotals.count} items
                            </span>
                        </div>
                        <div className="p-4 bg-slate-900/50">
                            <ul className="space-y-2 mb-4">
                                {enrichedEligibleItems.map((item, i) => (
                                    <li key={i} className="text-sm flex justify-between text-slate-300">
                                        <span>{item.name}</span>
                                        <span className="font-medium text-slate-100">x{item.qty}</span>
                                    </li>
                                ))}
                            </ul>
                            {/* Form rendered for eligible only */}
                            {!order && (
                                <div className="space-y-4 pt-4 border-t border-slate-800">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 ml-1">{woltDict.addr_street}</label>
                                            <input type="text" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} className="w-full h-12 rounded-xl bg-slate-800 border-2 border-slate-600 text-white text-base px-4 placeholder:text-slate-400 outline-none" placeholder="Riia 12" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 ml-1">{woltDict.addr_phone}</label>
                                            <input type="tel" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} className="w-full h-12 rounded-xl bg-slate-800 border-2 border-slate-600 text-white text-base px-4 placeholder:text-slate-400 outline-none" placeholder="+372 555 5555" />
                                        </div>
                                    </div>
                                    {estimate && (
                                        <div className="bg-blue-900/40 rounded-xl p-4 border border-blue-500/50 flex justify-between items-center shadow-lg">
                                            <div>
                                                <div className="text-xs text-blue-300 font-bold uppercase tracking-wider">{woltDict.est_price}</div>
                                                <div className="text-2xl font-black text-white">{estimate.price.toFixed(2)} €</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl font-black text-white">~{estimate.eta_minutes} min</div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <button onClick={handleEstimate} disabled={!address.street || !address.phone || loading} className="flex-1 bg-white border border-slate-300 text-slate-700 text-sm font-bold py-2 rounded-lg hover:bg-slate-50">{loading ? "..." : woltDict.calc_price}</button>
                                        {estimate && <button onClick={handleCreateOrder} disabled={loading} className="flex-1 bg-blue-600 text-white text-sm font-bold py-2 rounded-lg hover:bg-blue-700">Confirm</button>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Ineligible Section */}
                    <div className="rounded-xl border border-red-900/30 overflow-hidden">
                        <div className="bg-red-950/30 border-b border-red-900/30 px-4 py-3 flex justify-between items-center">
                            <h4 className="font-bold text-red-200 flex items-center gap-2"><span className="text-lg">❌</span> {woltDict.wolt_ineligible_section || "Pickup Only"}</h4>
                            <span className="text-xs font-medium text-red-400 bg-red-950/50 px-2 py-1 rounded border border-red-900/30">
                                {ineligibleTotals.weight.toFixed(1)}kg / {ineligibleTotals.count} items
                            </span>
                        </div>
                        <div className="p-4 bg-red-950/10">
                            <ul className="space-y-2 mb-4">
                                {enrichedIneligibleItems.map((si, i) => (
                                    <li key={i} className="text-sm flex justify-between items-start">
                                        <div>
                                            <span className="text-slate-300">{si.item.name}</span>
                                            <div className="text-[10px] text-red-400">{si.reasons.map(r => (woltDict.reasons as unknown as Record<string, string>)?.[r] || r).join(", ")}</div>
                                        </div>
                                        <span className="font-medium text-slate-400">x{si.item.qty}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* FULLY ELIGIBLE VIEW */}
            {method === "wolt" && isFullyEligible && (
                <div className="animate-in slide-in-from-top-2 fade-in">
                    {!order ? (
                        <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 ml-1">{woltDict.addr_street}</label>
                                        <input type="text" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} className="w-full h-12 rounded-xl bg-slate-800 border-2 border-slate-600 text-white text-base px-4 placeholder:text-slate-400 outline-none" placeholder="Riia 12" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 ml-1">{woltDict.addr_phone}</label>
                                        <input type="tel" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} className="w-full h-12 rounded-xl bg-slate-800 border-2 border-slate-600 text-white text-base px-4 placeholder:text-slate-400 outline-none" placeholder="+372 555 5555" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 ml-1">{woltDict.addr_city}</label>
                                    <div className="relative">
                                        <select
                                            value={address.city}
                                            onChange={(e) => handleCityChange(e.target.value)}
                                            className="w-full h-12 rounded-xl bg-slate-800 border-2 border-slate-600 text-white text-base px-4 appearance-none outline-none cursor-pointer"
                                        >
                                            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            {estimate && (
                                <div className="bg-blue-900/20 rounded-xl p-4 border border-blue-500/30 flex items-center justify-between">
                                    <div><div className="text-xs text-blue-400 font-medium uppercase tracking-wider">{woltDict.est_price}</div><div className="text-2xl font-black text-blue-100">{estimate.price.toFixed(2)} €</div></div>
                                    <div><div className="text-xs text-blue-400 font-medium uppercase tracking-wider">{woltDict.est_time}</div><div className="text-2xl font-black text-blue-100">~{estimate.eta_minutes} min</div></div>
                                </div>
                            )}
                            <div className="flex gap-3 mt-4">
                                <button onClick={handleEstimate} disabled={!address.street || !address.phone || loading} className="flex-1 bg-slate-800 border border-slate-700 text-slate-300 font-bold py-3 rounded-xl hover:bg-slate-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{loading ? "..." : woltDict.calc_price}</button>
                                {estimate && <button onClick={handleCreateOrder} disabled={loading} className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20">{woltDict.confirm_delivery}</button>}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-emerald-900/10 p-6 rounded-2xl border border-emerald-500/20 text-center">
                            <h3 className="text-xl font-bold text-emerald-100 mb-2">Delivery Confirmed!</h3>
                            <a href={order.tracking_url} target="_blank" className="font-bold text-emerald-400 underline">Track Order</a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
