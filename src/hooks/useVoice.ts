import { useState, useRef, useCallback, useEffect } from 'react';

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

export function useVoice() {
  const [state, setState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis);

  // Initialize SpeechRecognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        
        const currentText = interim || final;
        setTranscript(currentText);
        
        // Barge-in / Interruption Logic: if the user starts speaking over the voice synthesis
        if (currentText && currentText.trim().length > 3) {
             if (synthRef.current && synthRef.current.speaking) {
                 synthRef.current.cancel();
                 // Optionally log barge-in or just smoothly allow them to keep talking
                 console.log("Interrupted synthesis with user voice.");
             }
        }

        if (final) {
          setFinalTranscript(final);
          // If we have a significant final result, we can pause or signal completion
          console.log("Final transcript received:", final);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error === 'not-allowed') {
            setError("PERMISSION_DENIED: Microphone access blocked. Please check your browser's site settings or open in a new tab.");
            setState('error');
        } else if (event.error === 'no-speech') {
            // No speech is a common error, we can just transition back to idle or stay listening
            console.log("No speech detected");
            // Do not set error state, let onend handle the 'idle' transition
        } else if (event.error === 'network') {
            console.warn("NETWORK_ERROR: Speech recognition service unavailable or connection dropped.");
            setError("NETWORK_ERROR: Connection dropped. Please try opening the app in a new tab if you are in an iframe.");
            setState('error');
        } else if (event.error === 'service-not-allowed') {
            setError("SERVICE_BLOCKED: The speech service is not allowed on this device or browser.");
            setState('error');
        } else if (event.error !== 'aborted') {
            setError(`RECOGNITION_ERROR: ${event.error}`);
            setState('error');
        }
        isListeningRef.current = false;
      };
      
      recognition.onend = () => {
         isListeningRef.current = false;
         // Transition to idle if we were listening, allowing parent to see we stopped
         setState((prev) => (prev === 'listening' ? 'idle' : prev));
      };
      
      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      setError("NOT_SUPPORTED: Speech recognition is not available in this browser. Try Chrome or Edge.");
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const requestPermission = useCallback(async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setError(null);
        setState('idle');
        return true;
    } catch (err) {
        console.error("Permission request failed:", err);
        setError("PERMISSION_DENIED: User rejected microphone access.");
        setState('error');
        return false;
    }
  }, []);

  const startListening = useCallback(async () => {
    if (!recognitionRef.current) {
        if (!isSupported) {
            setError("NOT_SUPPORTED: Browser incompatible.");
            setState('error');
        }
        return;
    }
    
    if (isListeningRef.current) {
        return;
    }

    try {
      setError(null);
      setTranscript('');
      setFinalTranscript('');
      
      setState('listening');
      recognitionRef.current.start();
      isListeningRef.current = true;
    } catch (e: any) {
      console.error("Failed to start recognition:", e);
      if (e.name === 'NotAllowedError' || e.message?.includes('Permission denied')) {
          setError("PERMISSION_DENIED: Microphone access blocked. Please allow access in browser settings.");
          setState('error');
      } else if (e instanceof DOMException && e.message.includes('already started')) {
          isListeningRef.current = true;
          setState('listening');
      } else {
        setState('error');
        setError("START_FAILURE: Unable to initialize microphone hardware.");
      }
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListeningRef.current) {
       try {
        recognitionRef.current.stop();
        isListeningRef.current = false;
        setState(prev => prev === 'listening' ? 'idle' : prev);
       } catch (e) {
        console.error("Failed to stop recognition:", e);
       }
    }
  }, []);

  const stopSpeaking = useCallback(() => {
     if (synthRef.current) {
         synthRef.current.cancel();
     }
     setState(prev => prev === 'speaking' ? 'idle' : prev);
  }, []);

  const speak = useCallback((text: string) => {
      // Intentionally not stopping listening so user can interrupt
      setState('speaking');
      
      if (synthRef.current) {
          synthRef.current.cancel(); 
          const sanitizedText = text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/#/g, '');
          const utterance = new SpeechSynthesisUtterance(sanitizedText);
          utterance.onend = () => setState(prev => prev === 'speaking' ? 'idle' : prev);
          utterance.onerror = (e) => { 
            console.error("SpeechSynthesis error:", e);
            // If synthesis fails, don't stay in error state if it might be a temporary permission/focus issue
            setState(prev => prev === 'speaking' ? 'idle' : prev); 
          };
          synthRef.current.speak(utterance);
      } else {
          setState('idle');
      }
  }, []);

  const clearTranscripts = useCallback(() => {
    setTranscript('');
    setFinalTranscript('');
  }, []);

  return { state, transcript, finalTranscript, startListening, stopListening, speak, stopSpeaking, error, clearTranscripts, requestPermission, isSupported };
}
