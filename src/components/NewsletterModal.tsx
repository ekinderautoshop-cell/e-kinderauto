import { useState, useEffect } from 'react';
import { FORMSPARK_ACTION } from '../lib/formspark';

export default function NewsletterModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Show modal after 5 seconds if not already subscribed/closed
        const hasSeenNewsletter = localStorage.getItem('hasSeenNewsletter');
        if (!hasSeenNewsletter) {
            const timer = setTimeout(() => {
                setIsOpen(true);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem('hasSeenNewsletter', 'true');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            const res = await fetch(FORMSPARK_ACTION, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({
                    email,
                    _subject: 'Newsletter Anmeldung (Modal) – E-Kinderauto',
                    form_type: 'newsletter_modal',
                }),
            });
            if (!res.ok) throw new Error('Fehler beim Senden');
            setSubmitted(true);
            setTimeout(() => handleClose(), 2000);
        } catch {
            setError('Leider ist etwas schiefgelaufen. Bitte später erneut versuchen.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={handleClose}
            />
            <div className="relative bg-white w-full max-w-2xl grid md:grid-cols-2 overflow-hidden shadow-2xl animate-fade-in-up">
                <button 
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-black z-10"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="hidden md:block relative">
                    <img 
                        src="https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop" 
                        alt="Newsletter" 
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                </div>
                
                <div className="p-8 md:p-12 flex flex-col justify-center text-center md:text-left">
                    {submitted ? (
                        <div className="text-center py-8">
                            <div className="mx-auto w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Vielen Dank!</h3>
                            <p className="text-gray-600">Du hast dich erfolgreich angemeldet.</p>
                        </div>
                    ) : (
                        <>
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Exklusive Angebote</span>
                            <h2 className="text-2xl font-bold mb-4">10% Rabatt sichern</h2>
                            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                                Melde dich für unseren Newsletter an und erhalte sofort einen 10% Gutscheincode für deine erste Bestellung.
                            </p>
                            <form onSubmit={handleSubmit} className="space-y-3">
                                <input
                                    type="email"
                                    required
                                    placeholder="Deine E-Mail Adresse"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={submitting}
                                    className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors disabled:opacity-60"
                                />
                                {error && <p className="text-sm text-red-600">{error}</p>}
                                <button 
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-black text-white px-4 py-3 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-60"
                                >
                                    {submitting ? 'Wird gesendet…' : 'Jetzt Rabatt sichern'}
                                </button>
                            </form>
                            <p className="text-[10px] text-gray-400 mt-4 text-center md:text-left">
                                Mit der Anmeldung stimmst du unseren Datenschutzbestimmungen zu. Jederzeit abbestellbar.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

