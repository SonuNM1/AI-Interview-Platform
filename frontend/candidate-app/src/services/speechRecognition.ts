// browser speech recognition wrapper - converts the candidate's microphone speech into text 

type SpeechRecognitionResult = {
    transcript: string ; 
    isFinal: boolean ; 
}

interface SpeechRecognitionCallbacks {
    onResult?: (result: SpeechRecognitionResult) => void ; 
    onEnd?: () => void ; 
    onError?: (error: string) => void 
}

export function createSpeechRecognition(
    callbacks: SpeechRecognitionCallbacks
) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition ;
    
    if(!SpeechRecognition) {
        throw new Error("Speech recognnition is not supported in this browser.") ; 
    }

    const recognition = new SpeechRecognition() ; 

    // Continue listening while the candidate is speaking 

    recognition.continuous = true ; 

    // return both interim and final transcription 

    recognition.interimResults = true ; 

    recognition.lang = "en-US" ; // use english for the interview 

    recognition.onresult = (event: SpeechRecognitionEvent) => {
        for (let index = event.resultIndex; index < event.results.length ; index++) {
            
            const result = event.results[index] ; 

            const transcript = result[0].transcript ; 

            callbacks.onResult?.({
                transcript, 
                isFinal: result.isFinal 
            })
        }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error: ", event.error) ; 

        callbacks.onError?.(event.error) ; 
    }

    recognition.onend = () => {
        callbacks.onEnd?.() ; 
    }

    return recognition ; 
}