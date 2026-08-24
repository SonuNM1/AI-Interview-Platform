declare module "candidate/App" {
  import type { ComponentType } from "react";

  const CandidateApp: ComponentType;

  export default CandidateApp;
}

declare module "recruiter/App" {
  import type { ComponentType } from "react";
  const RecruiterApp: ComponentType; 
  export default RecruiterApp 
}

declare module "mentor/App" {
  import type { ComponentType } from "react";
  const MentorApp: ComponentType ; 
  export default MentorApp; 
}

