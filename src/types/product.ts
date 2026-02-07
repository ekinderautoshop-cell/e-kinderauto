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
}

