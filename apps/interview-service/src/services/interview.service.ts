
import Interview, { InterviewStatus } from "../models/interview.model.js";
import crypto from "crypto"

export const createInterviewService = async (data: any) => {
    return await Interview.create({
        ...data, 
        totalQuestions: data.totalQuestions ?? 10, 
    }) ;
}

export const getInterviewByIdService = async (
    id: string, 
    userId: string 
) => {
    console.log("Service id:", id);

    return await Interview.findOne({
        _id: id, 
        createdBy: userId
    }) ; 
}

// recruiters generally want to see the most recently created interviews first 

export const getAllInterviewsService = async (
    userId: string
) => {
    return await Interview.find({
        createdBy: userId,
    }).sort({
        createdAt: -1
    });
}

export const updateInterviewService = async (
    id: string, 
    userId: string, 
    data: any 
) => {
    return await Interview.findOneAndUpdate(
        {
            _id: id, 
            createdBy: userId
        }, 
        data, 
        {
            new: true, 
            runValidators: true 
        }
    )
}

export const deleteInterviewService = async (
    id: string, 
    userId: string 
) => {
    return await Interview.findOneAndDelete({
        _id: id, 
        createdBy: userId 
    }) ; 
}

/*
 Publish Interview - an interview is first created as a DRAFT so recruiters can review and modify it. 
 
 Create Interview -> DRAFT -> Update/Delete allowd -> Publish Interview -> PUBLISH -> Candidates can now access it 
*/

// Generating a cryptographically secure token that will be used to create a public interview link for candidates 

export const publishInterviewService = async (
    id: string, 
    userId: string
) => {

    // fetching interview first to check its current publish state 

    const interview = await Interview.findOne({
        _id: id, 
        createdBy: userId 
    }) ; 

    if(!interview) return null ; 

    // if alredy published and a token exists, reuse it instead of generating a new one 

    if(interview.status === InterviewStatus.PUBLISHED && interview.accessToken) {
        return interview ; 
    }

    // Generating a secure, non-guessable token for the public interview link 

    const accessToken = crypto.randomBytes(32).toString("hex") ; 

    interview.status = InterviewStatus.PUBLISHED ; 
    interview.accessToken = accessToken ; 

    // optional: setting an expiry date in the future if needed 

    interview.expiresAt = undefined ; 

    await interview.save() ; 
    return interview; 
}