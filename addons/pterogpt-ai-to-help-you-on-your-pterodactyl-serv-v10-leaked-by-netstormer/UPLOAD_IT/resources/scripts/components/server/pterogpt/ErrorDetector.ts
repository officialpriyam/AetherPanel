export interface DetectedError {
    line: string;
    lineNumber: number;
    pattern: string;
    severity: 'error' | 'warning';
}

const ERROR_PATTERNS: Array<{ regex: RegExp; name: string; severity: 'error' | 'warning' }> = [
    { regex: /Exception|Error|FATAL|SEVERE|crash/i, name: 'exception', severity: 'error' },
    { regex: /at\s+[\w.$]+\([\w.]+:\d+\)/, name: 'java_stacktrace', severity: 'error' },
    { regex: /Traceback \(most recent call/, name: 'python_traceback', severity: 'error' },
    { regex: /panic:|runtime error:/, name: 'go_panic', severity: 'error' },
    { regex: /ENOENT|EACCES|ECONNREFUSED/, name: 'node_error', severity: 'error' },
    { regex: /OutOfMemoryError|StackOverflow/, name: 'memory_error', severity: 'error' },
    { regex: /Connection refused|timed out/i, name: 'connection_error', severity: 'warning' },
    { regex: /failed to|unable to|cannot/i, name: 'failure', severity: 'warning' },
    { regex: /\[ERROR\]|\[FATAL\]|\[SEVERE\]/i, name: 'log_level', severity: 'error' },
    { regex: /\[WARN(ING)?\]/i, name: 'warning', severity: 'warning' },
];

export const detectErrors = (lines: string[]): DetectedError[] => {
    const errors: DetectedError[] = [];

    lines.forEach((line, index) => {
        for (const pattern of ERROR_PATTERNS) {
            if (pattern.regex.test(line)) {
                errors.push({
                    line,
                    lineNumber: index,
                    pattern: pattern.name,
                    severity: pattern.severity,
                });
                break;
            }
        }
    });

    return errors;
};

export const hasErrors = (lines: string[]): boolean => {
    return lines.some((line) => ERROR_PATTERNS.some((pattern) => pattern.regex.test(line)));
};

export const getErrorContext = (lines: string[], errorIndex: number, contextSize: number = 25): string[] => {
    const start = Math.max(0, errorIndex - contextSize);
    const end = Math.min(lines.length, errorIndex + contextSize + 1);
    return lines.slice(start, end);
};