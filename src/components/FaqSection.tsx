import { useState } from 'react';

export default function FaqSection() {
    const faqs = [
        {
            question: "Wie lange dauert der Versand?",
            answer: "Der Versand dauert in der Regel 2-4 Werktage innerhalb Deutschlands. Wir versenden mit DHL und DPD versichert und mit Tracking-Nummer."
        },
        {
            question: "Sind die Autos vormontiert?",
            answer: "Die Fahrzeuge sind zu ca. 80-90% vormontiert. Lediglich Räder, Lenkrad und Sitz müssen oft noch mit wenigen Handgriffen angebracht werden. Eine deutsche Anleitung liegt bei."
        },
        {
            question: "Wie lange hält der Akku?",
            answer: "Je nach Modell, Untergrund und Gewicht des Kindes hält eine Akkuladung zwischen 45 und 90 Minuten reine Fahrzeit. Die Ladezeit beträgt ca. 8-10 Stunden."
        },
        {
            question: "Gibt es eine Garantie?",
            answer: "Ja, wir gewähren volle 2 Jahre Gewährleistung auf alle unsere Fahrzeuge. Auf den Akku geben wir 6 Monate Garantie."
        }
    ];

    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <div className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-200">
                    <button
                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                        className="w-full flex justify-between items-center py-4 text-left focus:outline-none group"
                    >
                        <span className="font-medium text-lg text-gray-900 group-hover:text-black">{faq.question}</span>
                        <span className={`transform transition-transform duration-200 ${openIndex === index ? 'rotate-180' : ''}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                            </svg>
                        </span>
                    </button>
                    <div 
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            openIndex === index ? 'max-h-48 opacity-100 mb-4' : 'max-h-0 opacity-0'
                        }`}
                    >
                        <p className="text-gray-600 leading-relaxed pr-8">
                            {faq.answer}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}

