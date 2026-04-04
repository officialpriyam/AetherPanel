import { useState, useCallback, useRef } from 'react';
import { detectErrors, DetectedError } from '../ErrorDetector';

interface UseErrorDetectionReturn {
    errors: DetectedError[];
    consoleLines: string[];
    addConsoleLine: (line: string) => void;
    getRecentContext: (count?: number) => string[];
    clearErrors: () => void;
    hasRecentErrors: boolean;
}

const MAX_LINES = 500;

export const useErrorDetection = (): UseErrorDetectionReturn => {
    const [errors, setErrors] = useState<DetectedError[]>([]);
    const consoleLinesRef = useRef<string[]>([]);
    const [, forceUpdate] = useState({});

    const addConsoleLine = useCallback((line: string) => {
        // Ensure line is a valid string
        if (typeof line !== 'string') {
            return;
        }

        const validLine = String(line);
        consoleLinesRef.current = [...consoleLinesRef.current.slice(-MAX_LINES + 1), validLine];

        const newErrors = detectErrors([validLine]);
        if (newErrors.length > 0) {
            setErrors((prev) => [
                ...prev.slice(-50),
                ...newErrors.map((e) => ({
                    ...e,
                    lineNumber: consoleLinesRef.current.length - 1,
                })),
            ]);
        }

        forceUpdate({});
    }, []);

    const getRecentContext = useCallback((count: number = 50): string[] => {
        // Filter and ensure all items are strings
        return consoleLinesRef.current.slice(-count).filter((line) => typeof line === 'string' && line !== '');
    }, []);

    const clearErrors = useCallback(() => {
        setErrors([]);
    }, []);

    const hasRecentErrors = errors.length > 0 && errors.some((e) => e.lineNumber > consoleLinesRef.current.length - 20);

    return {
        errors,
        consoleLines: consoleLinesRef.current,
        addConsoleLine,
        getRecentContext,
        clearErrors,
        hasRecentErrors,
    };
};