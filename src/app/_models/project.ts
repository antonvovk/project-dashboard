export interface Project {
    id: string;
    name: string;
    springBootVersion: string;
    pomVersion: string;
    javaVersion: string;
    latestTag: string;
    latestPipelineUrl: string;
    latestPipelineStatus: string;
}
