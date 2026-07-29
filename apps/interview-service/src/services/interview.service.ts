import Interview, { InterviewStatus } from "../models/interview.model.js";
import crypto from "crypto"

export const createInterviewService = async (data: any) => {
    return await Interview.create(data) ;
}

export const getInterviewByIdService = async (id: string) => {
    console.log("Service id:", id);

    return await Interview.findById(id) ; 
}

// recruiters generally want to see the most recently created interviews first 

export const getAllInterviewsService = async () => {
    return await Interview.find().sort({
        createdAt: -1
    }) ; // -1: newest first, 1 -> oldest first 
}

export const updateInterviewService = async (
    id: string, 
    data: any 
) => {
    return await Interview.findByIdAndUpdate(
        id, 
        data, 
        {
            new: true, 
            runValidators: true 
        }
    )
}

export const deleteInterviewService = async (id: string) => {
    return await Interview.findByIdAndDelete(id) ; 
}

/*
 Publish Interview - an interview is first created as a DRAFT so recruiters can review and modify it. 
 
 Create Interview -> DRAFT -> Update/Delete allowd -> Publish Interview -> PUBLISH -> Candidates can now access it 
*/

// Generating a cryptographically secure token that will be used to create a public interview link for candidates 

export const publishInterviewService = async (id: string) => {

    // fetching interview first to check its current publish state 

    const interview = await Interview.findById(id) ; 

    if(!interview) return null ; 

    // if alredy published and a token exists, reuse it instead of generating a new one 

    if(interview.status === InterviewStatus.PUBLISHED && interview.accessToken) {
        return interview ; 
    }

    // Generating a secure, non-guessable token for the public interview link 

    const accessToken = crypto.randomBytes(32).toString("hex") ; 

    interview.status == InterviewStatus.PUBLISHED ; 
    interview.accessToken = accessToken ; 

    // optional: setting an expiry date in the future if needed 

    interview.expiresAt = undefined ; 

    await interview.save() ; 
    return interview; 
}