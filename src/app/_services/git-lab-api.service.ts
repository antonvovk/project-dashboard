import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {catchError, map, of} from "rxjs";

@Injectable()
export class GitLabApiService {

    private readonly GITLAB_URL = 'https://gitlab.com/api';
    private readonly GITLAB_PROJECTS_URL = `${this.GITLAB_URL}/v4/projects`;

    constructor(private readonly http: HttpClient) {
    }

    public getProjects() {
        return this.http.get<any[]>(`${this.GITLAB_PROJECTS_URL}?membership=true&with_programming_language=java&simple=true`)
            .pipe(catchError(err => {
                return of(<any[]>[]);
            }));
    }

    public getProjectPom(projectId: number) {
        return this.http.get(`${this.GITLAB_PROJECTS_URL}/${projectId}/repository/files/pom.xml/raw?ref=main`,
            {
                responseType: 'text'
            })
            .pipe(
                catchError(err => {
                    return of('');
                }),
                map(data => ({
                    projectId: projectId,
                    pom: data
                }))
            );
    }

    public getProjectTags(projectId: number) {
        return this.http.get<any[]>(`${this.GITLAB_PROJECTS_URL}/${projectId}/repository/tags`)
            .pipe(
                catchError(err => {
                    return of(<any>{});
                }),
                map(data => ({
                    projectId: projectId,
                    tag: data[0]
                }))
            );
    }

    public getLatestPipeline(projectId: number) {
        return this.http.get<any>(`${this.GITLAB_PROJECTS_URL}/${projectId}/pipelines/latest?ref=main`)
            .pipe(
                catchError(err => {
                    return of(<any>{});
                }),
                map(data => ({
                    projectId: projectId,
                    pipeline: data
                }))
            );
    }
}
