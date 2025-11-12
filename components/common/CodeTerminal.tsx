import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { executeJavaCode } from '../../services/geminiService';
import { CodeExecutionResult } from '../../types';

const PlayIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
);

const initialCode = `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Commitly!");
    }
}`;

interface CodeTerminalProps {
    onExecutionComplete?: (code: string, result: CodeExecutionResult) => void;
}

export const CodeTerminal: React.FC<CodeTerminalProps> = ({ onExecutionComplete }) => {
    const [code, setCode] = useState(initialCode);
    const [result, setResult] = useState<CodeExecutionResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleRunCode = async () => {
        setIsLoading(true);
        setResult(null);
        const executionResult = await executeJavaCode(code);
        setResult(executionResult);
        setIsLoading(false);
        if (onExecutionComplete) {
            onExecutionComplete(code, executionResult);
        }
    };

    return (
        <Card className="max-w-4xl mx-auto animate-fadeIn">
            <h2 className="text-2xl font-bold mb-4">Java Sandbox</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="code-editor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Your Code
                    </label>
                    <textarea
                        id="code-editor"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full h-80 p-3 font-mono text-sm bg-gray-900 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500"
                        placeholder="Enter your Java code here..."
                        spellCheck="false"
                    />
                </div>
                <div>
                    <label htmlFor="output-panel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Output
                    </label>
                    <div
                        id="output-panel"
                        className={`w-full h-80 p-3 font-mono text-sm border rounded-lg overflow-y-auto ${
                            result?.error 
                                ? 'bg-red-100 border-red-300 text-red-900 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300'
                                : 'bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200'
                        }`}
                    >
                        {isLoading && <p>Executing...</p>}
                        {!isLoading && !result && <p className="text-gray-400">Click "Run Code" to see the output.</p>}
                        {result?.output && <pre>{result.output}</pre>}
                        {result?.error && <pre>{result.error}</pre>}
                    </div>
                </div>
            </div>
            <div className="mt-4 flex justify-end">
                <Button onClick={handleRunCode} disabled={isLoading || !code.trim()}>
                    <PlayIcon className="w-5 h-5 mr-2" />
                    {isLoading ? 'Running...' : 'Run Code'}
                </Button>
            </div>
        </Card>
    );
};