import Interview, { InterviewStatus } from "../models/interview.model.js";

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

export const publishInterviewService = async (id: string) => {
    return await Interview.findByIdAndUpdate(
        id, 
        {
            status: InterviewStatus.PUBLISHED,
        },
        {
            new: true, 
            runValidators: true 
        }
    )
}