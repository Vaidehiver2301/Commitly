
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

// NEW ICONS
const PauseIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
);

const StopIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="6" y="6" width="12" height="12"></rect></svg>
);

const PlayIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
);


interface TimerUIProps {
    duration: number; // initial duration in minutes
    timeLeft: number; // seconds remaining
    timerStatus: 'idle' | 'running' | 'paused';
    onStart: () => void;
    onPause: () => void;
    onResume: () => void;
    onStop: () => void;
    setDuration: (minutes: number) => void;
}

const TimerUI: React.FC<TimerUIProps> = ({ duration, timeLeft, timerStatus, onStart, onPause, onResume, onStop, setDuration }) => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const radius = 75;
    const circumference = 2 * Math.PI * radius;
    const totalSeconds = duration * 60;
    
    // Ensure progress calculation handles totalSeconds being 0 to avoid NaN or division by zero.
    const progress = totalSeconds > 0 ? timeLeft / totalSeconds : 0;
    const strokeDashoffset = circumference * (1 - progress);

    const isIdle = timerStatus === 'idle';
    const isRunning = timerStatus === 'running';
    const isPaused = timerStatus === 'paused';

    return (
        <Card className="max-w-md mx-auto !p-8 dark:bg-gray-800 flex flex-col items-center">
            {/* Circular Timer Display */}
            <div className="relative w-[180px] h-[180px] flex items-center justify-center mb-8">
                <svg className="w-full h-full transform -rotate-90">
                    {/* Background track */}
                    <circle
                        cx="90"
                        cy="90"
                        r={radius}
                        stroke="#2f3b4d" // A slightly darker grey for the track
                        strokeWidth="12"
                        fill="transparent"
                    />
                    {/* Progress circle */}
                    <circle
                        cx="90"
                        cy="90"
                        r={radius}
                        stroke="#e0e0e0" // Light grey for the progress
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-linear"
                    />
                </svg>
                <div className="absolute text-5xl font-bold text-gray-100 tabular-nums">
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </div>
            </div>

            {/* Control Buttons */}
            <div className="flex space-x-4 mb-8">
                <Button 
                    onClick={isIdle ? onStart : onResume} 
                    disabled={isRunning} // Cannot click Start/Resume if already running
                    className="!bg-[#2f3b4d] text-gray-100 hover:!bg-[#3f4a5b] !shadow-none px-6 py-3 rounded-md !flex !items-center !justify-center"
                >
                    <PlayIcon className="w-5 h-5 mr-2" /> {isPaused ? 'Resume' : 'Start'}
                </Button>
                <Button 
                    onClick={onPause} 
                    disabled={isIdle || isPaused} // Can only pause if running
                    className="!bg-[#2f3b4d] text-gray-100 hover:!bg-[#3f4a5b] !shadow-none px-6 py-3 rounded-md !flex !items-center !justify-center"
                >
                    <PauseIcon className="w-5 h-5 mr-2" /> Pause
                </Button>
                <Button 
                    onClick={onStop} 
                    disabled={isIdle} // Can only stop if running or paused
                    className="!bg-[#2f3b4d] text-gray-100 hover:!bg-[#3f4a5b] !shadow-none px-6 py-3 rounded-md !flex !items-center !justify-center"
                >
                    <StopIcon className="w-5 h-5 mr-2" /> Stop
                </Button>
            </div>

            {/* Minutes Input */}
            <div className="flex items-center space-x-4 bg-[#2f3b4d] p-3 rounded-md">
                <label htmlFor="duration-input" className="text-gray-200 text-lg">Minutes</label>
                <input
                    id="duration-input"
                    type="number"
                    value={duration}
                    onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        const newDuration = Math.max(1, val || 1);
                        setDuration(newDuration);
                        // The useEffect in SessionPage will handle updating timeLeft if timerStatus is 'idle'.
                    }}
                    className="w-24 px-4 py-2 bg-gray-700 text-gray-100 rounded-md text-center border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    min="1"
                    disabled={isRunning} // Cannot change duration while running
                />
            </div>
        </Card>
    );
};

// FIX: Define the Quiz component
interface QuizProps {
  questions: QuizQuestion[];
  onFinish: () => void;
}

const Quiz: React.FC<QuizProps> = ({ questions, onFinish }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setScore(prevScore => prevScore + 1);
    }
    // Move to next question or finish quiz
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setSelectedAnswer(null); // Reset selected answer for next question
    } else {
      setQuizFinished(true);
    }
  };

  const handleFinishQuiz = () => {
    onFinish();
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No quiz questions available.
      </div>
    );
  }

  if (quizFinished) {
    return (
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-4">Quiz Complete!</h3>
        <p className="text-xl mb-4">You scored {score} out of {questions.length}!</p>
        <Button onClick={handleFinishQuiz}>Continue</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-lg font-semibold">Question {currentQuestionIndex + 1} of {questions.length}</p>
      <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{currentQuestion.question}</p>
      <div className="grid grid-cols-1 gap-3">
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerSelect(option)}
            className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors duration-200
              ${selectedAnswer === option
                ? 'bg-indigo-500 text-white border-indigo-500 shadow-md'
                : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200'
              }`}
            disabled={!!selectedAnswer} // Disable options once an answer is selected
          >
            {option}
          </button>
        ))}
      </div>
      <Button 
        onClick={handleSubmitAnswer} 
        disabled={!selectedAnswer} 
        className="w-full"
      >
        {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
      </Button>
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

    // Ensure timeLeft is updated if duration changes while idle
    useEffect(() => {
      if (timerStatus === 'idle') {
        setTimeLeft(duration * 60);
      }
    }, [duration, timerStatus]);


    if (!user) return null;

    const handleStart = () => {
        if (duration <= 0) return;
        setTimeLeft(duration * 60); // Ensure timeLeft is reset to full duration on start
        setTimerStatus('running');
        setSessionStage('active'); // Keep active stage for tracking running status
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
        setDuration(30); // Reset to default duration
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
            {/* Render the new TimerUI for config and active stages */}
            {(sessionStage === 'config' || sessionStage === 'active') && (
                <TimerUI
                    duration={duration}
                    timeLeft={timeLeft}
                    timerStatus={timerStatus}
                    onStart={handleStart}
                    onPause={handlePause}
                    onResume={handleResume}
                    onStop={handleStop}
                    setDuration={setDuration}
                />
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 dark:bg-gray-700 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 dark:text-white"
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
