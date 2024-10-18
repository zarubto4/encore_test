import { PromiseHttp } from "../../../core/http_requests/promise_http_request";
import { ProjectSection, ProjectSectionResult } from "../models/asana_resultsModels";

export class AsanaServiceProjects {
  constructor(protected request: PromiseHttp) {}

  public getProjectSections(project_gid: string): Promise<ProjectSectionResult | null> {
    return new Promise((resolve): void => {
      this.request.get<ProjectSectionResult>("1.0/projects/" + project_gid + "/sections", {}, 200).then((result) => {
        if (result.error) {
          console.log("getProjectSections error:", result.error);
          resolve(new ProjectSectionResult(result.error.message ? result.error.message : "Undefined Error"));
        }

        if (!result.data) {
          console.log("getProjectSections missing data:", result.error, result.data);
          resolve(new ProjectSectionResult("Error"));
        }
        const sectionResult: ProjectSectionResult = result.data as ProjectSectionResult;
        sectionResult.byName = {};
        sectionResult.byId = {};

        sectionResult.data.forEach((section) => {
          if (section.name && section.gid) {
            sectionResult.byName[section.name] = section;
            sectionResult.byId[section.gid] = section;
          }
        });

        resolve(sectionResult);
      });
    });
  }

  public createProjectSections(project_gid: string, name: string): Promise<ProjectSection> {
    const data = {
      data: {
        name: name,
      },
    };

    return new Promise((resolve): void => {
      this.request
        .post<{ data: { gid: string; name: string } }>("1.0/projects/" + project_gid + "/sections", {}, data, 201)
        .then((result) => {
          if (result.error) {
            console.log("createProjectSections error:", result.error);
            return resolve(new ProjectSectionResult(result.error.message ? result.error.message : "Undefined Error"));
          }

          if (!result.data || !result.data.data) {
            console.log("getProjectSections missing data:", result.error, result.data);
            return resolve(new ProjectSectionResult("Error"));
          }

          resolve({
            gid: result.data.data.gid,
            name: result.data.data.name,
          });
        });
    });
  }
}
