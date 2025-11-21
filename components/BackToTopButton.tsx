
import React, { useState, useEffect } from 'react';

export default function BackToTopButton(): React.ReactNode {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        if (window.pageYOffset > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    return (
        <div className="fixed bottom-20 right-5 z-50">
            {isVisible && (
                <button
                    onClick={scrollToTop}
                    className="bg-expert-green text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-green-600 transition-all transform hover:scale-110 focus:outline-none"
                    aria-label="Retourner en haut"
                >
                    <i className="fas fa-arrow-up"></i>
                </button>
            )}
        </div>
    );
}
