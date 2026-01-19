
import { categorizeProduct } from './categorization';

const testCases = [
    { name: "Knauf White Kipsplaat 1200x2600mm", expected: "construction", sub: "drywall" },
    { name: "Sakret BETOON S-30", expected: "construction", sub: "concrete" },
    { name: "Isover KL-33 Vill", expected: "construction", sub: "insulation" },
    { name: "Sadolin Bindo 7 seinavärv", expected: "finishing", sub: "paints" },
    { name: "Makita Akutrell", expected: "tools", sub: "general" },
    { name: "Random Unknown Object", expected: "other", sub: "uncategorized" }
];

console.log("Running Categorization Verification...");
let passed = 0;

testCases.forEach(test => {
    const result = categorizeProduct({ name: test.name });
    const isMatch = result.category === test.expected && result.subcategory === test.sub;

    console.log(`[${isMatch ? 'PASS' : 'FAIL'}] "${test.name}" -> ${result.category}/${result.subcategory} (Expected: ${test.expected}/${test.sub})`);

    if (isMatch) passed++;
});

console.log(`Total: ${passed}/${testCases.length} Passed`);
if (passed === testCases.length) {
    console.log("Categorization Verification SUCCESS");
} else {
    console.log("Categorization Verification FAILED");
    process.exit(1);
}
