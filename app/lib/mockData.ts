export type StoreOffer = {
    storeName: string;
    price: number;
    currency: string;
    availability: "Laos" | "Piiratud kogus" | "Tellimisel";
    logoColor: string; // Mock visual distinction
};

export type Product = {
    id: string;
    name: string;
    category: string;
    unit: string;
    unitLabel?: string;
    image: string;
    offers: StoreOffer[];
};

export const PRODUCTS: Product[] = [
    {
        id: "gyproc-normal",
        name: "Kipsplaat Gyproc GN 13 Standard 12.5mm",
        category: "Üldehitus",
        unit: "tk",
        image: "https://images.unsplash.com/photo-1595846519845-68e298c2edd8?auto=format&fit=crop&q=80&w=400",
        offers: [
            { storeName: "Ehituse ABC", price: 8.95, currency: "€", availability: "Laos", logoColor: "bg-red-500" },
            { storeName: "Espak", price: 8.50, currency: "€", availability: "Laos", logoColor: "bg-red-600" },
            { storeName: "Bauhof", price: 9.20, currency: "€", availability: "Laos", logoColor: "bg-orange-500" },
            { storeName: "K-Rauta", price: 8.90, currency: "€", availability: "Laos", logoColor: "bg-blue-600" },
            { storeName: "Decora", price: 8.85, currency: "€", availability: "Piiratud kogus", logoColor: "bg-green-600" },
            { storeName: "Karl Bilder", price: 9.50, currency: "€", availability: "Tellimisel", logoColor: "bg-black" },
        ]
    },
    {
        id: "osb-3",
        name: "OSB-3 Plaat 12mm 2500x1250mm",
        category: "Puitmaterjal",
        unit: "tk",
        image: "https://images.unsplash.com/photo-1518709328224-e0e64c67315a?auto=format&fit=crop&q=80&w=400",
        offers: [
            { storeName: "Espak", price: 14.90, currency: "€", availability: "Laos", logoColor: "bg-red-600" },
            { storeName: "Bauhof", price: 15.50, currency: "€", availability: "Laos", logoColor: "bg-orange-500" },
            { storeName: "K-Rauta", price: 14.20, currency: "€", availability: "Laos", logoColor: "bg-blue-600" },
            { storeName: "Decora", price: 15.00, currency: "€", availability: "Laos", logoColor: "bg-green-600" },
            { storeName: "Karl Bilder", price: 14.80, currency: "€", availability: "Laos", logoColor: "bg-black" },
        ]
    },
    {
        id: "fibo-3",
        name: "Fibo plokk 3 200mm",
        category: "Müür",
        unit: "tk",
        image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=400", // Concrete mock
        offers: [
            { storeName: "Espak", price: 2.85, currency: "€", availability: "Laos", logoColor: "bg-red-600" },
            { storeName: "Bauhof", price: 3.10, currency: "€", availability: "Piiratud kogus", logoColor: "bg-orange-500" },
            { storeName: "K-Rauta", price: 2.95, currency: "€", availability: "Laos", logoColor: "bg-blue-600" },
            { storeName: "Decora", price: 2.90, currency: "€", availability: "Laos", logoColor: "bg-green-600" },
            { storeName: "Karl Bilder", price: 3.20, currency: "€", availability: "Tellimisel", logoColor: "bg-black" },
        ]
    },
    {
        id: "wool-100",
        name: "Kivivill Paroc eXtra 100mm",
        category: "Soojustus",
        unit: "pakk",
        image: "https://images.unsplash.com/photo-1628151015968-3a45c63e2642?auto=format&fit=crop&q=80&w=400",
        offers: [
            { storeName: "Espak", price: 24.50, currency: "€", availability: "Laos", logoColor: "bg-red-600" },
            { storeName: "Bauhof", price: 26.90, currency: "€", availability: "Laos", logoColor: "bg-orange-500" },
            { storeName: "K-Rauta", price: 23.90, currency: "€", availability: "Laos", logoColor: "bg-blue-600" },
            { storeName: "Decora", price: 25.50, currency: "€", availability: "Piiratud kogus", logoColor: "bg-green-600" },
            { storeName: "Karl Bilder", price: 25.00, currency: "€", availability: "Laos", logoColor: "bg-black" },
        ]
    },
    {
        id: "cement",
        name: "Tsement Kunda Standard 35kg",
        category: "Segud",
        unit: "kott",
        image: "https://images.unsplash.com/photo-1560155016-bd4879ae8f21?auto=format&fit=crop&q=80&w=400", // Cement mock
        offers: [
            { storeName: "Espak", price: 5.60, currency: "€", availability: "Laos", logoColor: "bg-red-600" },
            { storeName: "Bauhof", price: 6.20, currency: "€", availability: "Laos", logoColor: "bg-orange-500" },
            { storeName: "K-Rauta", price: 5.85, currency: "€", availability: "Laos", logoColor: "bg-blue-600" },
            { storeName: "Decora", price: 5.90, currency: "€", availability: "Laos", logoColor: "bg-green-600" },
            { storeName: "Karl Bilder", price: 6.50, currency: "€", availability: "Tellimisel", logoColor: "bg-black" },
        ]
    },
    {
        id: "timber",
        name: "Saematerjal 50x100mm C24 6.0m",
        category: "Puitmaterjal",
        unit: "tm",
        unitLabel: "jm",
        image: "https://images.unsplash.com/photo-1545063914-4375429aca5d?auto=format&fit=crop&q=80&w=400",
        offers: [
            { storeName: "Espak", price: 1.85, currency: "€", availability: "Laos", logoColor: "bg-red-600" },
            { storeName: "Bauhof", price: 2.10, currency: "€", availability: "Laos", logoColor: "bg-orange-500" },
            { storeName: "K-Rauta", price: 1.95, currency: "€", availability: "Laos", logoColor: "bg-blue-600" },
            { storeName: "Decora", price: 1.90, currency: "€", availability: "Piiratud kogus", logoColor: "bg-green-600" },
            { storeName: "Karl Bilder", price: 2.20, currency: "€", availability: "Laos", logoColor: "bg-black" },
        ]
    },
];
