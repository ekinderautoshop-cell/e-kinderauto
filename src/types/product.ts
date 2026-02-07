export interface Product {
	id: string;
	name: string;
	description: string;
	price: number;
	image: string;
	/** Alle Bild-URLs (Hauptbild zuerst), für Galerie auf der Detailseite */
	images?: string[];
	category: string;
	inStock: boolean;
	rating?: number;
	/** Lieferzeit aus DB, z. B. "1-bis-3-tage" */
	shippingTime?: string;
	/** Versandkosten in € */
	shippingCost?: number;
	/** Farbe/Variante (aus Name geparst oder später aus DB) */
	color?: string;
}

