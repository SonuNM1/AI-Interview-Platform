// splits large text into smaller overlapping chunks. Later these chunks will be converted into embeddings

export const chunkText = (
    text: string,
    chunkSize = 1000,
    overlap = 200
): string[] => {
    
    const chunks: string[] = [] ;

    let start = 0 ; 

    while(start < text.length) {
        const end = start + chunkSize ; // calcuate where current chunk should end 

        // extract current chunk 

        const chunk = text.slice(start, end).trim() ; 

        // ignore empty chunks 

        if(chunk.length > 0) {
            chunks.push(chunk)
        }

        // move forward while keeping overlap 

        start += chunkSize - overlap ; 
    }
    return chunks ; 
}

// A chunk is a small piece of a large document. We split documents because AI models work better with smaller pieces of text 

// An embedding is the numerical (vector) representation of text. It lets us compare meaning instead of exact words 