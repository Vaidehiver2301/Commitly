
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import { useAuth } from '../contexts/AuthContext';
import { generatePracticeSheet, getPixiErrorExplanation, chatWithCommi } from '../services/geminiService';
import { PracticeSheet, CodeExecutionResult, ChatMessage } from '../types';
import { PRACTICE_SHEET_QUOTES, PIXI_WELCOME_MESSAGE } from '../constants';
import { CodeTerminal } from '../components/common/CodeTerminal';
import { PixiAvatar } from '../components/common/PixiAvatar'; // Import the new PixiAvatar component

// Make jspdf available on the window object for TypeScript
declare global {
  interface Window {
    jspdf: any;
  }
}

const DownloadIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
);

const SendIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
);

const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);


export const PracticeSheetsPage: React.FC = () => {
    const { currentUser } = useAuth();
    const [topic, setTopic] = useState('');
    const [numQuestions, setNumQuestions] = useState(10);
    const [isLoading, setIsLoading] = useState(false);
    const [practiceSheet, setPracticeSheet] = useState<PracticeSheet | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'easy' | 'medium' | 'hard'>('easy');

    // Pixi Chatbot States
    const [isPixiChatOpen, setIsPixiChatOpen] = useState(false);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([{ sender: 'commi', message: PIXI_WELCOME_MESSAGE }]);
    const [chatInput, setChatInput] = useState('');
    const [isPixiTyping, setIsPixiTyping] = useState(false);
    const [lastCodeExecuted, setLastCodeExecuted] = useState(''); // To provide code context to Pixi
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Pixi Nudge States
    const [hasPendingPixiError, setHasPendingPixiError] = useState(false);
    const [pendingPixiErrorMessage, setPendingPixiErrorMessage] = useState('');

    const quote = useMemo(() => PRACTICE_SHEET_QUOTES[Math.floor(Math.random() * PRACTICE_SHEET_QUOTES.length)], []);
    
    // Scroll chat to bottom
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim() || !currentUser) return;
        
        setIsLoading(true);
        setError(null);
        setPracticeSheet(null);

        try {
            const sheet = await generatePracticeSheet(topic, currentUser.learningLanguage, numQuestions);
            if (sheet) {
                setPracticeSheet(sheet);
            } else {
                setError("Sorry, I couldn't generate a practice sheet for that topic. Please try another one.");
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadPdf = (difficulty: 'easy' | 'medium' | 'hard') => {
        if (!practiceSheet || !window.jspdf) return;

        const levelData = practiceSheet[difficulty];
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;
        const maxWidth = pageWidth - margin * 2;
        let y = 20;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.text(`Practice Sheet: ${topic}`, margin, y);
        y += 10;

        doc.setFontSize(16);
        doc.text(`Level: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`, margin, y);
        y += 15;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);

        levelData.questions.forEach((q, index) => {
            const lines = doc.splitTextToSize(`${index + 1}. ${q}`, maxWidth);
            const textHeight = lines.length * 7;
            if (y + textHeight > doc.internal.pageSize.getHeight() - 20) {
                doc.addPage();
                y = 20;
            }
            doc.text(lines, margin, y);
            y += textHeight + 2; // Add a little space after each question
        });

        y += 10; // Space before motivation
        if (y > doc.internal.pageSize.getHeight() - 20) {
            doc.addPage();
            y = 20;
        }
        
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(levelData.motivation, margin, y);

        doc.save(`${topic.replace(/\s+/g, '_')}_${difficulty}_sheet.pdf`);
    };

    const handleSendChat = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!chatInput.trim() || isPixiTyping || !currentUser) return;

        const userMessage: ChatMessage = { sender: 'user', message: chatInput };
        setChatHistory(prev => [...prev, userMessage]);
        setChatInput('');
        setIsPixiTyping(true);

        try {
            const pixiResponse = await chatWithCommi(lastCodeExecuted, userMessage.message, chatHistory, currentUser.learningLanguage);
            setChatHistory(prev => [...prev, { sender: 'commi', message: pixiResponse }]);
        } catch (err) {
            console.error("Error sending message to Pixi:", err);
            setChatHistory(prev => [...prev, { sender: 'commi', message: "Sorry, I had trouble connecting. Please try again." }]);
        } finally {
            setIsPixiTyping(false);
        }
    };

    const handleCodeExecutionComplete = async (code: string, result: CodeExecutionResult) => {
        setLastCodeExecuted(code);
        if (result.error && currentUser) {
            // Do not open chat immediately, just set a pending error state and generate explanation
            setHasPendingPixiError(true);
            setIsPixiTyping(true); // Indicate Pixi is processing
            try {
                const pixiErrorExplanation = await getPixiErrorExplanation(code, result.error, currentUser.learningLanguage);
                setPendingPixiErrorMessage(pixiErrorExplanation);
            } catch (err) {
                console.error("Error getting Pixi error explanation:", err);
                setPendingPixiErrorMessage("Pixi couldn't analyze the error right now. Please open the chat and ask manually.");
            } finally {
                setIsPixiTyping(false); // Pixi finished processing
            }
        }
    };

    const handlePixiIconClick = () => {
        // If chat is currently closed and there's a pending error, prepare to show it
        if (!isPixiChatOpen && hasPendingPixiError) {
            const userInitiatedErrorQuery: ChatMessage = { sender: 'user', message: "Hey Pixi, I got an error in the sandbox. Can you help me understand what's wrong?" };
            setChatHistory(prev => [...prev, userInitiatedErrorQuery, { sender: 'commi', message: pendingPixiErrorMessage }]);
            setHasPendingPixiError(false);
            setPendingPixiErrorMessage('');
        }
        setIsPixiChatOpen(!isPixiChatOpen);
    };


    return (
        <div className="p-4 space-y-6">
            <header className="text-center">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-gray-100">AI Practice Sheets</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Generate custom practice problems for any topic.</p>
            </header>

            <Card className="max-w-2xl mx-auto">
                <form onSubmit={handleGenerate} className="space-y-6">
                    <div>
                        <label className="block text-lg font-semibold text-center mb-3">1. Select Number of Questions</label>
                        <div className="flex flex-wrap justify-center gap-2">
                            {[10, 20, 30].map(num => (
                                <button
                                    key={num}
                                    type="button"
                                    onClick={() => setNumQuestions(num)}
                                    disabled={isLoading}
                                    className={`px-5 py-2 rounded-full border-2 transition-colors font-medium ${numQuestions === num ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800'}`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="topic-input" className="block text-lg font-semibold text-center mb-3">2. Enter a Topic</label>
                        <input
                            id="topic-input"
                            type="text"
                            value={topic}
                            onChange={e => setTopic(e.target.value)}
                            placeholder={`e.g., ${currentUser?.learningLanguage} Exception Handling`}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 dark:text-white"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="text-center">
                        <Button type="submit" disabled={isLoading || !topic.trim()}>
                            {isLoading ? 'Generating...' : 'Generate Practice Sheet'}
                        </Button>
                    </div>
                </form>
            </Card>

            {isLoading && (
                <div className="max-w-2xl mx-auto text-center">
                    <p className="mb-2 font-semibold">AI is thinking...</p>
                    <ProgressBar value={50} max={100} className="h-2 animate-pulse" />
                </div>
            )}

            {error && <p className="text-center text-red-500">{error}</p>}
            
            {practiceSheet && !isLoading && (
                <div className="space-y-6">
                    <Card className="max-w-4xl mx-auto animate-fadeIn">
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-center mb-6">
                            <p className="font-semibold text-indigo-700 dark:text-indigo-300 italic">"{quote}"</p>
                        </div>

                        <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                            <nav className="flex flex-wrap space-x-2 sm:space-x-4" aria-label="Tabs">
                                {(['easy', 'medium', 'hard'] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-3 py-2 font-medium text-sm rounded-t-lg transition-colors ${activeTab === tab ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                                    >
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-2xl font-bold">Level: {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
                                <Button variant="secondary" onClick={() => handleDownloadPdf(activeTab)}>
                                    <DownloadIcon className="w-5 h-5 md:mr-2" />
                                    <span className="hidden md:inline">Download PDF</span>
                                </Button>
                            </div>

                            <div className="prose prose-sm dark:prose-invert max-w-none bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                                <ol className="list-decimal pl-5 space-y-2">
                                    {practiceSheet[activeTab].questions.map((q, i) => <li key={i}>{q}</li>)}
                                </ol>
                                <p className="mt-6 text-center text-gray-500 dark:text-gray-400 italic">
                                    {practiceSheet[activeTab].motivation}
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Code Sandbox - now takes full width in this section */}
                    <CodeTerminal onExecutionComplete={handleCodeExecutionComplete} />
                </div>
            )}

            {/* Floating Pixi toggle button */}
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={handlePixiIconClick}
                    className={`relative p-4 bg-primary rounded-full shadow-xl hover:scale-110 transition-transform duration-200 flex items-center justify-center ${ ((hasPendingPixiError || isPixiTyping) && !isPixiChatOpen) ? 'animate-pulse' : '' }`}
                    aria-label="Open Pixi Chat: Tiny helper. Big progress."
                >
                    <PixiAvatar className="!bg-transparent" svgClassName="!text-white" />
                    {hasPendingPixiError && !isPixiChatOpen && (
                        <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-white dark:ring-gray-800">
                            !
                        </span>
                    )}
                </button>
            </div>


            {/* Pixi Chat Window (conditional rendering and animated) */}
            {isPixiChatOpen && (
                <Card className="fixed bottom-6 right-6 w-80 md:w-96 h-[500px] flex flex-col z-50 animate-slideInUp">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <PixiAvatar /> Ask Pixi
                        </h2>
                        <button onClick={() => setIsPixiChatOpen(false)} className="p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400">
                            <CloseIcon className="h-5 w-5" />
                        </button>
                    </div>
                    <div ref={chatContainerRef} className="flex-grow overflow-y-auto space-y-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 mb-4">
                        {chatHistory.map((msg, index) => (
                            <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                                {msg.sender === 'commi' && <PixiAvatar className="flex-shrink-0" />}
                                <div className={`p-3 rounded-xl max-w-[80%] ${
                                    msg.sender === 'user'
                                        ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200'
                                        : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200'
                                }`}>
                                    {msg.message}
                                </div>
                            </div>
                        ))}
                        {isPixiTyping && (
                            <div className="flex items-center gap-3">
                                <PixiAvatar className="flex-shrink-0" />
                                <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200">
                                    <div className="flex items-center space-x-1">
                                        <span className="animate-bounce-slow w-1.5 h-1.5 bg-indigo-600 dark:bg-indigo-300 rounded-full inline-block"></span>
                                        <span className="animate-bounce-slow animation-delay-150 w-1.5 h-1.5 bg-indigo-600 dark:bg-indigo-300 rounded-full inline-block"></span>
                                        <span className="animate-bounce-slow animation-delay-300 w-1.5 h-1.5 bg-indigo-600 dark:bg-indigo-300 rounded-full inline-block"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <form onSubmit={handleSendChat} className="flex gap-2">
                        <textarea
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Ask Pixi about your code or problem..."
                            rows={1}
                            className="flex-grow p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 dark:text-white resize-none"
                            disabled={isPixiTyping}
                        />
                        <Button type="submit" disabled={!chatInput.trim() || isPixiTyping} className="flex-shrink-0">
                            <SendIcon className="w-5 h-5" />
                        </Button>
                    </form>
                </Card>
            )}
        </div>
    );
};