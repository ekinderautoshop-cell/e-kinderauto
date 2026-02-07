/** Nur diese Kategorien aus der Produkt-DB anzeigen (Sidebar + Filter). */
export const ALLOWED_CATEGORY_NAMES = [
    'Kinderfahrzeuge',
    'RC Panzer und Militär',
    'Baufahrzeuge',
    'Elektro Kinderfahrzeuge (Oldtimer)',
    'Elektro Kinderfahrzeuge (mit Lizenz)',
    'Polizei/Feuerwehr',
    'XXL Fahrzeuge',
    'Elektro Kindermotorräder',
    'E-Scooters und Quads',
    '2 Sitzer Coco',
    'RC Modellbau',
    'Elektronik',
    'Kleine E-Scooter',
    'E-Scooters und E-Bikes',
    'Coco Bikes - Chopper',
    'E-Scooter Dezent',
] as const;

/** Reihenfolge der Kategorien (nur erlaubte aus der DB). */
export const categoryOrder: { name: string; slug: string }[] = ALLOWED_CATEGORY_NAMES.map((name) => ({
    name,
    slug: categoryToSlug(name),
}));

/** Slug aus Kategoriename (für URL-Filter). */
export function categoryToSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/\//g, '-')
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/ß/g, 'ss')
        .replace(/[^a-z0-9-]/g, '');
}

/** Erste Kategorien für Startseite-Kacheln (visuell). */
export const categories = [
    {
        id: 'kinderfahrzeuge',
        name: 'Kinderfahrzeuge',
        image: 'https://images.unsplash.com/photo-1532906619279-a764d0263f4e?q=80&w=800&auto=format&fit=crop',
        slug: '/produkte?kategorie=kinderfahrzeuge'
    },
    {
        id: 'rc-panzer',
        name: 'RC Panzer & Militär',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop',
        slug: '/produkte?kategorie=rc-panzer-und-militaer'
    },
    {
        id: 'kindermotorraeder',
        name: 'Elektro Kindermotorräder',
        image: 'https://images.unsplash.com/photo-1558981806-ec527fa84f3d?q=80&w=800&auto=format&fit=crop',
        slug: '/produkte?kategorie=elektro-kindermotorraeder'
    }
];

/** Bilder pro Kategorie-Slug für die Kategorien-Unterseite (fehlende = Platzhalter). */
const categoryImageBySlug: Record<string, string> = {
    'kinderfahrzeuge': 'https://images.unsplash.com/photo-1532906619279-a764d0263f4e?q=80&w=800&auto=format&fit=crop',
    'rc-panzer-und-militaer': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop',
    'baufahrzeuge': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=800&auto=format&fit=crop',
    'elektro-kinderfahrzeuge-oldtimer': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop',
    'elektro-kinderfahrzeuge-mit-lizenz': 'https://images.unsplash.com/photo-1532906619279-a764d0263f4e?q=80&w=800&auto=format&fit=crop',
    'polizei-feuerwehr': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=800&auto=format&fit=crop',
    'xxl-fahrzeuge': 'https://images.unsplash.com/photo-1532906619279-a764d0263f4e?q=80&w=800&auto=format&fit=crop',
    'elektro-kindermotorraeder': 'https://images.unsplash.com/photo-1558981806-ec527fa84f3d?q=80&w=800&auto=format&fit=crop',
    'e-scooters-und-quads': 'https://images.unsplash.com/photo-1558981806-ec527fa84f3d?q=80&w=800&auto=format&fit=crop',
    '2-sitzer-coco': 'https://images.unsplash.com/photo-1532906619279-a764d0263f4e?q=80&w=800&auto=format&fit=crop',
    'rc-modellbau': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop',
    'elektronik': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop',
    'kleine-e-scooter': 'https://images.unsplash.com/photo-1558981806-ec527fa84f3d?q=80&w=800&auto=format&fit=crop',
    'e-scooters-und-e-bikes': 'https://images.unsplash.com/photo-1558981806-ec527fa84f3d?q=80&w=800&auto=format&fit=crop',
    'coco-bikes--chopper': 'https://images.unsplash.com/photo-1558981806-ec527fa84f3d?q=80&w=800&auto=format&fit=crop',
    'e-scooter-dezent': 'https://images.unsplash.com/photo-1558981806-ec527fa84f3d?q=80&w=800&auto=format&fit=crop',
};

const DEFAULT_CATEGORY_IMAGE = 'https://images.unsplash.com/photo-1532906619279-a764d0263f4e?q=80&w=800&auto=format&fit=crop';

/** Bild-URL für eine Kategorie (z. B. für Hintergrund hinter Produktkarten). */
export function getCategoryImageUrl(categoryName: string): string {
    const slug = categoryToSlug(categoryName);
    return categoryImageBySlug[slug] ?? DEFAULT_CATEGORY_IMAGE;
}

/** Einfacher Hash für deterministische Auswahl (gleiche Karte = gleicher Hintergrund). */
function simpleHash(str: string): number {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    return Math.abs(h);
}

/**
 * Liefert die Bild-URL eines zufälligen (deterministisch gewählten) Produkts aus derselben Kategorie.
 * Das aktuelle Produkt wird ausgeschlossen. Fallback: Kategorie-Platzhalterbild.
 */
export function getRandomProductImageFromCategory(
    categoryName: string,
    allProducts: import('../types/product').Product[],
    excludeProductId?: string
): string {
    const withImage = allProducts.filter(
        (p) =>
            p.category === categoryName &&
            p.image?.trim() &&
            p.id !== excludeProductId
    );
    if (withImage.length === 0) return getCategoryImageUrl(categoryName);
    const index = simpleHash(excludeProductId ?? categoryName) % withImage.length;
    return withImage[index].image;
}

/** Alle Kategorien mit Bild für die Kategorien-Unterseite. */
export const categoriesWithImages = categoryOrder.map((c) => ({
    name: c.name,
    slug: c.slug,
    image: categoryImageBySlug[c.slug] ?? DEFAULT_CATEGORY_IMAGE,
    url: `/produkte?kategorie=${encodeURIComponent(c.slug)}`,
}));

export const testimonials = [
    {
        id: 1,
        name: 'Julia M.',
        text: 'Mein Sohn liebt sein neues Auto! Die Lieferung war super schnell und der Aufbau kinderleicht.',
        rating: 5,
        image: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
        id: 2,
        name: 'Markus Weber',
        text: 'Top Qualität. Der Akku hält wirklich lange, wir sind begeistert.',
        rating: 5,
        image: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
        id: 3,
        name: 'Sarah K.',
        text: 'Der Kundenservice war sehr hilfreich bei der Auswahl. Gerne wieder!',
        rating: 5,
        image: 'https://randomuser.me/api/portraits/women/68.jpg'
    }
];

