import React, { useState, useEffect } from 'react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { generateQuizQuestions } from '../services/geminiService';
import { QuizQuestion } from '../types';
import { useAuth } from '../contexts/AuthContext';
import * as db from '../services/db';
import { ReminderBanner } from '../components/common/ReminderBanner';
import { FOCUS_REMINDERS } from '../constants';
import { useSettings } from '../contexts/SettingsContext';
import { useSessionFocus } from '../contexts/SessionFocusContext';
import { Confetti } from '../components/common/Confetti';

const TimerDisplay: React.FC<{ timeLeft: number }> = ({ timeLeft }) => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return (
        <div className="text-9xl font-bold text-center text-gray-800 dark:text-gray-100 my-8 tabular-nums tracking-tighter">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
    );
};

const Quiz: React.FC<{ questions: QuizQuestion[], onFinish: () => void }> = ({ questions, onFinish }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    const handleAnswer = (option: string) => {
        if (selectedAnswer) return;
        
        setSelectedAnswer(option);
        const correct = option === questions[currentQuestionIndex].correctAnswer;
        setIsCorrect(correct);
    };

    const handleNext = () => {
        setSelectedAnswer(null);
        setIsCorrect(null);
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(i => i + 1);
        } else {
            onFinish();
        }
    }

    if (!questions.length) {
        return <p>No questions available.</p>;
    }
    
    const { question, options } = questions[currentQuestionIndex];

    return (
        <div className="w-full max-w-2xl mx-auto">
             <p className="text-center text-gray-500 dark:text-gray-400 mb-2">Question {currentQuestionIndex + 1} of {questions.length}</p>
             <h3 className="text-2xl font-semibold text-center mb-6">{question}</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {options.map(option => {
                     const isSelected = selectedAnswer === option;
                     const isCorrectAnswer = isCorrect !== null && option === questions[currentQuestionIndex].correctAnswer;
                     let buttonClass = 'bg-white hover:bg-gray-100 border-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-500';
                     if (isSelected && isCorrect === true) buttonClass = 'bg-green-500 border-green-500 text-white';
                     if (isSelected && isCorrect === false) buttonClass = 'bg-red-500 border-red-500 text-white';
                     if (!isSelected && isCorrect !== null && isCorrectAnswer) buttonClass = 'bg-green-500 border-green-500 text-white dark:bg-green-600 dark:border-green-600';
                     
                     return (
                        <button key={option} onClick={() => handleAnswer(option)} disabled={!!selectedAnswer} className={`p-4 rounded-lg border-2 text-left transition-colors ${buttonClass}`}>
                            {option}
                        </button>
                     )
                 })}
             </div>
             {selectedAnswer && (
                 <div className="text-center mt-6">
                     <p className={`text-xl font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                         {isCorrect ? 'Correct!' : 'Incorrect!'}
                     </p>
                     <Button onClick={handleNext} className="mt-4">
                        {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                     </Button>
                 </div>
             )}
        </div>
    );
};

export const SessionPage: React.FC = () => {
    const { currentUser: user, refreshUser } = useAuth();
    const { settings } = useSettings();
    const { setSessionActive } = useSessionFocus();

    const [duration, setDuration] = useState(30); // in minutes
    const [timeLeft, setTimeLeft] = useState(duration * 60);
    const [timerStatus, setTimerStatus] = useState<'idle' | 'running' | 'paused'>('idle');
    const [sessionStage, setSessionStage] = useState<'config' | 'active' | 'topic' | 'quiz' | 'complete'>('config');

    const [timeStudied, setTimeStudied] = useState(0); // in seconds
    const [topic, setTopic] = useState('');
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
    const [xpGained, setXpGained] = useState(0);
    
    const [showReminder, setShowReminder] = useState(false);
    const [reminderMessage, setReminderMessage] = useState('');
    const [showConfetti, setShowConfetti] = useState(false);

    const completeSession = (studiedSeconds: number) => {
        setTimeStudied(studiedSeconds);
        setXpGained(Math.floor(studiedSeconds / 60));
        setSessionStage('topic');
        setShowConfetti(true);
    };

    useEffect(() => {
        let interval: number | undefined = undefined;
        if (timerStatus === 'running' && timeLeft > 0) {
            interval = window.setInterval(() => {
                setTimeLeft(time => {
                    const newTime = time - 1;
                    if (settings.sessionReminders && newTime > 0 && newTime < (duration * 60) && newTime % (15 * 60) === 0) {
                        setReminderMessage(FOCUS_REMINDERS[Math.floor(Math.random() * FOCUS_REMINDERS.length)]);
                        setShowReminder(true);
                    }
                    
                    return newTime;
                });
            }, 1000);
        } else if (timerStatus === 'running' && timeLeft === 0) {
            setTimerStatus('idle');
            setSessionActive(false);
            completeSession(duration * 60);
        }
        return () => window.clearInterval(interval);
    }, [timerStatus, timeLeft, duration, settings.sessionReminders, setSessionActive]);

    if (!user) return null;

    const handleStart = () => {
        if (duration <= 0) return;
        setTimeLeft(duration * 60);
        setTimerStatus('running');
        setSessionStage('active');
        setSessionActive(true);
    };

    const handlePause = () => setTimerStatus('paused');
    const handleResume = () => setTimerStatus('running');

    const handleStop = () => {
        const studiedSeconds = (duration * 60) - timeLeft;
        setTimerStatus('idle');
        setSessionActive(false);

        if (studiedSeconds < 60) { // If less than a minute, just go back to config
            reset();
        } else {
            completeSession(studiedSeconds);
        }
    };
    
    const handleFetchQuiz = async () => {
        if (!topic) return;
        setIsLoadingQuiz(true);
        const fetchedQuestions = await generateQuizQuestions(topic, user.learningLanguage);
        setQuestions(fetchedQuestions);
        setIsLoadingQuiz(false);
        setSessionStage('quiz');
    };

    const onQuizFinish = () => {
        db.addSession(user.id, {
            topic,
            duration: Math.round(timeStudied / 60),
            xpGained: xpGained,
        });
        refreshUser();
        setSessionStage('complete');
    }

    const reset = () => {
        setSessionStage('config');
        setTimerStatus('idle');
        setTopic('');
        setQuestions([]);
        setDuration(30);
        setShowConfetti(false);
    }
    
    return (
        <div className="p-4 text-center">
             {timerStatus === 'running' && showReminder && (
                <ReminderBanner 
                    message={reminderMessage} 
                    onDismiss={() => setShowReminder(false)}
                />
            )}
            {sessionStage === 'config' && (
                <Card className="max-w-md mx-auto animate-slideInUp">
                    <h2 className="text-2xl font-bold mb-4">Start a new session</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Choose your focused study duration.</p>
                    
                    <div className="mb-6">
                        <label htmlFor="duration-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">How many minutes?</label>
                        <input
                            id="duration-input"
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value, 10) || 1))}
                            className="w-full max-w-xs mx-auto px-4 py-2 border border-gray-300 rounded-lg text-center dark:bg-gray-700 dark:border-gray-600"
                            min="1"
                        />
                    </div>

                    <div className="flex justify-center space-x-4 mb-8">
                        {[25, 50, 75].map(min => (
                            <button key={min} onClick={() => setDuration(min)} className={`px-4 py-2 rounded-full border-2 transition-colors ${duration === min ? 'bg-indigo-600 text-white border-indigo-600' : 'text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                {min} min
                            </button>
                        ))}
                    </div>
                    <Button onClick={handleStart} disabled={duration <= 0}>Start Session</Button>
                </Card>
            )}
            
            {sessionStage === 'active' && (
                 <Card className="max-w-md mx-auto animate-fadeIn">
                     <h2 className="text-2xl font-bold mb-4">{timerStatus === 'paused' ? 'Session Paused' : 'Stay Focused!'}</h2>
                     <TimerDisplay timeLeft={timeLeft} />
                     <div className="flex flex-col items-center space-y-4">
                        {timerStatus === 'running' ? (
                            <Button onClick={handlePause} variant="secondary" className="!w-48">Pause</Button>
                        ) : (
                            <Button onClick={handleResume} variant="primary" className="!w-48">Resume</Button>
                        )}
                         <Button onClick={handleStop} variant="ghost" className="!text-red-500 hover:!bg-red-100 dark:hover:!bg-red-900/40">End Session</Button>
                     </div>
                 </Card>
            )}
            
             {sessionStage === 'topic' && (
                 <>
                    {showConfetti && <Confetti />}
                    <Card className="max-w-md mx-auto animate-slideInUp">
                        <h2 className="text-2xl font-bold mb-4">Session Complete! Great job.</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">You studied for {Math.round(timeStudied/60)} minutes. What topic did you cover?</p>
                        <input 
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder={`e.g., ${user.learningLanguage} Interfaces`}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        />
                        <Button onClick={handleFetchQuiz} disabled={isLoadingQuiz || !topic}>
                            {isLoadingQuiz ? 'Generating...' : 'Take a Quick Quiz'}
                        </Button>
                    </Card>
                 </>
             )}
             
            {sessionStage === 'quiz' && (
                <Card className="animate-slideInUp">
                     <h2 className="text-3xl font-bold mb-2">Knowledge Check</h2>
                     <p className="text-gray-600 dark:text-gray-400 mb-8">Let's see what you've learned about "{topic}"!</p>
                     <Quiz questions={questions} onFinish={onQuizFinish} />
                </Card>
            )}

            {sessionStage === 'complete' && (
                 <Card className="max-w-md mx-auto animate-fadeIn">
                     <span className="text-6xl" role="img" aria-label="trophy">🏆</span>
                     <h2 className="text-3xl font-bold my-4">Well Done!</h2>
                     <p className="text-gray-600 dark:text-gray-400 mb-6">You've completed your session and quiz. You've earned <span className="font-bold text-yellow-500">{xpGained} XP</span>!</p>
                     <Button onClick={reset}>Start Another Session</Button>
                 </Card>
            )}
        </div>
    );
};