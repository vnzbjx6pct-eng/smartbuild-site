"use client";

import { useState, useEffect } from "react";
import { Check, Truck } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { SmartSuggestion, checkDeliveryEligibility } from "@/app/lib/wolt";
import { CartItem } from "@/components/cart/CartProvider";

interface Props {
    suggestion: SmartSuggestion;
    items: CartItem[];
    onApply: (newItem: CartItem) => void;
    onUndo: () => void;
    originalItem?: CartItem;
    city: string;
}

export default function WoltSmartTip({ suggestion, items, onApply, onUndo, city }: Props) {
    const { t } = useLanguage();
    const itemName = suggestion.itemName;

    // Local Logic for Preview
    const [isEligible, setIsEligible] = useState(false);

    // Initial values
    const originalQty = suggestion.fromQty || 0;
    const recommendedQty = suggestion.toQty || 0;
    const [previewQty, setPreviewQty] = useState(recommendedQty);

    const isQtyReduction = suggestion.type === "REDUCE_QTY";
    const isRemove = suggestion.type === "REMOVE_ITEM";

    // Hypothetical Check
    useEffect(() => {
        // Construct hypothetical cart
        const hypotheticalItems = items.map(item => {
            const isTarget = (item.id || item.name) === suggestion.itemId;
            if (isRemove && isTarget) return { ...item, qty: 0 };
            return isTarget ? { ...item, qty: previewQty } : item;
        }).filter(i => i.qty > 0);

        const check = checkDeliveryEligibility(hypotheticalItems, city);
        setIsEligible(check.eligible);

    }, [previewQty, items, suggestion, isRemove, city]);

    const handleApply = () => {
        const target = items.find(i => (i.id || i.name) === suggestion.itemId);
        if (target) {
            if (isRemove) {
                // Zero qty effectively removes it (CartProvider handles logic usually, or we pass 0)
                onApply({ ...target, qty: 0 });
            } else {
                onApply({ ...target, qty: previewQty });
            }
        }
    };

    return (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 flex flex-col gap-2">
            <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-500/20 rounded-full text-blue-400 shrink-0">
                    <Truck size={18} />
                </div>
                <div className="flex-1">
                    <h4 className="text-sm font-medium text-blue-200">
                        {((t as any).wolt?.tip_inline_general || "Suggestion").replace("{name}", itemName)}
                    </h4>
                    <p className="text-xs text-blue-300/80 mt-0.5">
                        {isQtyReduction
                            ? ((t as any).wolt?.tip_inline_reduce || "Reduce {name}").replace("{name}", itemName).replace("{from}", String(originalQty)).replace("{to}", String(previewQty))
                            : ((t as any).wolt?.tip_inline_move || "Move {name}").replace("{name}", itemName)
                        }
                    </p>
                    {isEligible && (
                        <div className="flex items-center gap-1.5 mt-1 text-emerald-400 text-xs font-medium">
                            <Check size={12} />
                            {(t as any).wolt?.tip_inline_success}
                        </div>
                    )}
                </div>
                <button
                    onClick={handleApply}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors"
                >
                    {(t as any).wolt?.action_inline_apply}
                </button>
            </div>

            {/* Range Slider for Qty (Only if Reduction) */}
            {isQtyReduction && (
                <div className="pl-10 pr-2 pb-1">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">{1}</span>
                        <input
                            type="range"
                            min={1}
                            max={originalQty}
                            value={previewQty}
                            onChange={(e) => setPreviewQty(parseInt(e.target.value))}
                            className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                        />
                        <span className="text-xs text-white font-mono bg-slate-800 px-1.5 py-0.5 rounded">{previewQty}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
