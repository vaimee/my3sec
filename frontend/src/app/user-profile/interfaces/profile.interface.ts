import { ProfileData } from "app/shared/interfaces";
import { Skill } from "./skill.interface";
import { Certificate } from "./certificate.interface";
import { Project } from "./project.interface";
import { Observable } from "rxjs";

export interface Profile extends Omit<ProfileData, 'regulationCheckbox'> {
    id: string;
    walletAddress: string;
    energy$: Observable<number>;
    endorsers$: Observable<string[]>;
    skills: Skill[];
    certificates: Certificate[];
    projects: Project[];
}