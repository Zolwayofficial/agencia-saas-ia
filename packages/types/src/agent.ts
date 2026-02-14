export interface OpenClawConfig {
    taskId: string;
    model: string;
    maxSteps: number;
    timeout: number;
    organizationId: string;
}

export interface TaskResult {
    status: 'success' | 'error' | 'timeout';
    output: string;
    stepsUsed: number;
    durationMs: number;
}
