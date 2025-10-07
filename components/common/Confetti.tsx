import React, { useEffect, useState } from 'react';

const CONFETTI_COUNT = 100;

const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];

const ConfettiPiece: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
    <div className="absolute w-2 h-4" style={style}></div>
);

export const Confetti: React.FC = () => {
    const [pieces, setPieces] = useState<React.CSSProperties[]>([]);

    useEffect(() => {
        const newPieces = Array.from({ length: CONFETTI_COUNT }).map(() => ({
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            left: `${Math.random() * 100}%`,
            top: `${-20 + Math.random() * -80}px`, // Start off-screen
            transform: `rotate(${Math.random() * 360}deg)`,
            animation: `fall ${3 + Math.random() * 2}s linear ${Math.random() * 2}s forwards`,
        }));
        setPieces(newPieces);
    }, []);
    
    // Inject keyframes dynamically to avoid global scope pollution
    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = `
            @keyframes fall {
                to {
                    transform: translateY(100vh) rotate(720deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(styleSheet);
        return () => {
            document.head.removeChild(styleSheet);
        }
    }, []);

    return (
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-50 overflow-hidden" aria-hidden="true">
            {pieces.map((style, index) => (
                <ConfettiPiece key={index} style={style} />
            ))}
        </div>
    );
};