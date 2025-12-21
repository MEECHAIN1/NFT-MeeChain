import React, { useEffect, useState } from 'react';

interface NotificationProps {
    message: string | null;
    onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (message) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                // Allow time for fade-out animation before calling onClose
                setTimeout(onClose, 300);
            }, 3000); // Notification visible for 3 seconds

            return () => clearTimeout(timer);
        }
    }, [message, onClose]);

    if (!message && !isVisible) {
        return null;
    }

    return (
        <div
            className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-in-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'
            }`}
            role="alert"
        >
            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-lg rounded-full shadow-2xl px-5 py-3 border border-white/50">
                <span className="text-green-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </span>
                <p className="font-semibold text-slate-700">{message}</p>
            </div>
        </div>
    );
};

export default Notification;
