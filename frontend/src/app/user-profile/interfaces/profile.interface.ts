import { ProfileData } from "app/shared/interfaces";
import { Skill } from "./skill.interface";
import { Certificate } from "./certificate.interface";
import { Project } from "./project.interface";

export interface Profile extends Omit<ProfileData, 'regulationCheckbox'> {
    id: number;
    walletAddress: string;
    energy: number;
    endorsers: string[];
    skills: Skill[];
    certificates: Certificate[];
    projects: Project[];
}