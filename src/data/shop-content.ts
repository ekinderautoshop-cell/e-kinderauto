/** Kategorien wie auf e-kinderauto.de (für Startseite-Kacheln und Sidebar-Reihenfolge). */
export const categoryOrder: { name: string; slug: string }[] = [
    { name: 'Kinderfahrzeuge', slug: 'kinderfahrzeuge' },
    { name: 'RC Panzer und Militär', slug: 'rc-panzer-und-militaer' },
    { name: 'Baufahrzeuge', slug: 'baufahrzeuge' },
    { name: 'Elektro Kinderfahrzeuge (Oldtimer)', slug: 'elektro-kinderfahrzeuge-oldtimer' },
    { name: 'Elektro Kinderfahrzeuge (mit Lizenz)', slug: 'elektro-kinderfahrzeuge-mit-lizenz' },
    { name: 'Polizei/Feuerwehr', slug: 'polizei-feuerwehr' },
    { name: 'Ersatzteile-Zubehör', slug: 'ersatzteile-zubehoer' },
    { name: 'Ersatzteile', slug: 'ersatzteile' },
    { name: 'XXL Fahrzeuge', slug: 'xxl-fahrzeuge' },
    { name: 'Elektro Kindermotorräder', slug: 'elektro-kindermotorraeder' },
    { name: 'E-Scooters und Quads', slug: 'e-scooters-und-quads' },
    { name: '2 Sitzer Coco', slug: '2-sitzer-coco' },
    { name: 'Outdoor Spielzeuge', slug: 'outdoor-spielzeuge' },
    { name: 'RC Modellbau', slug: 'rc-modellbau' },
    { name: 'Elektronik', slug: 'elektronik' },
    { name: 'Tierzubehör', slug: 'tierzubehoer' },
    { name: 'Kleine E-Scooter', slug: 'kleine-e-scooter' },
    { name: 'E-Scooters und E-Bikes', slug: 'e-scooters-und-e-bikes' },
    { name: 'Coco Bikes - Chopper', slug: 'coco-bikes-chopper' },
    { name: 'E-Scooter Dezent', slug: 'e-scooter-dezent' },
];

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

