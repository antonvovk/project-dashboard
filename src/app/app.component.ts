import {Component} from '@angular/core';
import {GitLabApiService} from "./_services/git-lab-api.service";
import {forkJoin} from "rxjs";
import {Project} from "./_models/project";
import {JsonPipe, KeyValuePipe} from "@angular/common";
import {
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatTable
} from "@angular/material/table";
import {MatProgressSpinner} from "@angular/material/progress-spinner";

@Component({
    selector: 'app-root',
    standalone: true,
    providers: [
        GitLabApiService
    ],
    templateUrl: 'app.component.html',
    styleUrl: 'app.component.scss',
    imports: [
        JsonPipe,
        KeyValuePipe,
        MatTable,
        MatColumnDef,
        MatCell,
        MatHeaderCell,
        MatCellDef,
        MatHeaderCellDef,
        MatHeaderRowDef,
        MatRowDef,
        MatRow,
        MatHeaderRow,
        MatProgressSpinner
    ]
})
export class AppComponent {

    displayedColumns = ['id', 'name', 'springBootVersion', 'pomVersion', 'javaVersion', 'latestTag',
        'latestPipeline'
    ];
    projects: { [k: number]: Project; } = {};
    loadingState = 0;

    constructor(private readonly api: GitLabApiService) {
        this.api.getProjects().subscribe({
            next: projects => {
                this.projects = Object.fromEntries(projects.map(project => [project.id, <Project>{
                    id: project.id,
                    name: project.name
                }]));
                this.processProjectPoms(projects);
                this.processProjectTags(projects);
                this.processProjectPipelines(projects);
            }
        })
    }

    getProjects() {
        return Object.values(this.projects);
    }

    private processProjectPoms(projects: any[]) {
        const requests = projects.map(project => this.api.getProjectPom(project.id));
        forkJoin(requests).subscribe({
            next: projectPoms => {
                projectPoms
                    .filter(projectPom => projectPom.pom.length !== 0)
                    .forEach(projectPom => {
                        this.projects[projectPom.projectId].springBootVersion = this.getSpringBootVersion(projectPom.pom);
                        this.projects[projectPom.projectId].pomVersion = this.getPomVersion(projectPom.pom);
                        this.projects[projectPom.projectId].javaVersion = this.getJavaVersion(projectPom.pom);
                    });
            },
            complete: () => {
                ++this.loadingState;
            }
        });
    }

    private processProjectTags(projects: any[]) {
        const requests = projects.map(project => this.api.getProjectTags(project.id));
        forkJoin(requests).subscribe({
            next: projectTags => {
                projectTags
                    .filter(projectPom => projectPom.tag)
                    .forEach(projectTag => {
                        this.projects[projectTag.projectId].latestTag = projectTag.tag.name;
                    });
            },
            complete: () => {
                ++this.loadingState;
            }
        });
    }

    private processProjectPipelines(projects: any[]) {
        const requests = projects.map(project => this.api.getLatestPipeline(project.id));
        forkJoin(requests).subscribe({
            next: projectPipelines => {
                projectPipelines
                    .filter(projectPipeline => projectPipeline.pipeline)
                    .forEach(projectPipeline => {
                        this.projects[projectPipeline.projectId].latestPipelineUrl = projectPipeline.pipeline.web_url;
                        this.projects[projectPipeline.projectId].latestPipelineStatus = projectPipeline.pipeline.status;
                    });
            },
            complete: () => {
                ++this.loadingState;
            }
        });
    }

    private getSpringBootVersion(value: string) {
        return Array.from(value.matchAll(new RegExp(/spring-boot-starter-parent<\/artifactId>\n.*<version>(.*)<\/version>/gm)))[0][1];
    }

    private getPomVersion(value: string) {
        return Array.from(value.matchAll(new RegExp(/<version>(.*-SNAPSHOT)<\/version>/gm)))[0][1];
    }

    private getJavaVersion(value: string) {
        let result = Array.from(value.matchAll(new RegExp(/java\.version>(.*)<\//gm)))[0];
        if (result) {
            return result[1];
        }
        return Array.from(value.matchAll(new RegExp(/source>(.*)<\//gm)))[0][1];
    }
}
