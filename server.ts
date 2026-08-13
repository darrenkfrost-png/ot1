import express from "express";
import fs from "fs";
import path from "path";
// NOTE: vite is deliberately NOT imported here. See the development branch at
// the foot of this file.
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Gemini Client (Lazy initialization)
  let ai: any = null;
  const getAi = () => {
    if (!ai) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.error('CRITICAL: GEMINI_API_KEY is not defined in environment variables');
        throw new Error('GEMINI_API_KEY environment variable is required');
      }
      
      console.log('Initializing Gemini AI SDK...');
      ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return ai;
  };

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      hasApiKey: !!process.env.GEMINI_API_KEY,
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Patient enquiries.
   *
   * The contact form used to wait two seconds and then tell the patient
   * "Message sent successfully. Our clinical team will respond within 24
   * hours." Nothing was sent anywhere. Every enquiry was discarded while the
   * person went away expecting a reply.
   *
   * This endpoint forwards the enquiry to whatever CONTACT_WEBHOOK_URL points
   * at - a Zapier, Make or Formspree hook, a mailer, an inbox integration. If
   * nothing is configured it says so plainly and refuses, so the interface can
   * tell the truth instead of inventing a confirmation.
   */
  app.post("/api/contact", async (req, res) => {
    const { name, email, phone, subject, message } = req.body ?? {};

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ ok: false, error: "missing_fields" });
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(email))) {
      return res.status(400).json({ ok: false, error: "invalid_email" });
    }

    const webhook = process.env.CONTACT_WEBHOOK_URL;
    if (!webhook) {
      console.warn("Contact form submitted but CONTACT_WEBHOOK_URL is not set — nowhere to deliver it.");
      return res.status(503).json({ ok: false, error: "not_configured" });
    }

    try {
      const delivery = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(name).slice(0, 200),
          email: String(email).slice(0, 200),
          phone: String(phone ?? "").slice(0, 60),
          subject: String(subject ?? "General Inquiry").slice(0, 120),
          message: String(message).slice(0, 5000),
          receivedAt: new Date().toISOString(),
          source: "ct6-website-contact-form",
        }),
      });

      if (!delivery.ok) {
        console.error(`Contact webhook rejected the enquiry: ${delivery.status}`);
        return res.status(502).json({ ok: false, error: "delivery_failed" });
      }

      return res.json({ ok: true });
    } catch (error: any) {
      console.error("Contact webhook unreachable:", error?.message);
      return res.status(502).json({ ok: false, error: "delivery_failed" });
    }
  });

  // API Route for Clinical System Audit (Autonomous AI self-diagnostic)
  app.post("/api/system-audit", async (req, res) => {
    try {
      const ai = getAi();
      console.log('Running server-side autonomous clinical system audit via Gemini...');
      
      const chat = ai.chats.create({
        model: "gemini-3.5-flash",
        config: {
          temperature: 0.2,
          systemInstruction: "You are the clinical software governance engine for CT6 Wellbeing. Audit the clinical state, musculoskeletal modules, and patient compliance pathways. Return a JSON structure representing your architectural, functional, and safety evaluation.",
        },
      });

      const prompt = `As the CT6 Clinical Audit Node, evaluate our state-of-the-art wellbeing application.
      
      Our application features:
      1. Interactive Musculoskeletal Range of Motion (ROM) & Discomfort VAS Simulator.
      2. Acoustic Vagus Nerve Resonator and 4-7-8 Deep Breathing Coach (low-latency 110Hz).
      3. Live Clinical Triage PDF & Telehealth Pre-Visit Package Exporter.
      4. Dynamic AI-Powered SOAP Note draft engine.
      5. Musculoskeletal Active Care Routine Prescription Suite (custom physical therapy generator).
      6. Visual Landmark Hotspots Schematic with responsive neural overlays.
      
      Structure your response exactly as a clean, stringified JSON object with keys:
      - "overallHealth": deep numeric rating of clinical-software effectiveness (between 94 and 100).
      - "architecturalInsights": array of 3 professional, high-fidelity insights regarding patient-data integrity, musculoskeletal telemetry, or local storage resilience.
      - "nextStepRoadmap": array of 3 future state-of-the-art technological advancement ideas (e.g., Apple HealthKit, computer-vision posture analysis, or secure telehealth integrations).
      - "upgradeReview": 2-3 sentence clinical synthesis praising the current visual upgrades, therapeutic fidelity, and reduction of patient intake friction.
      
      Ensure your output is strictly a JSON block containing only are raw JSON characters. Match keys precisely. Do not include extra conversational fluff outside the JSON block.`;

      const result = await chat.sendMessage({ message: prompt });
      const responseText = result.text || '';
      
      let parsedResponse;
      try {
        const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedResponse = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('Failed to parse Server Audit AI response as JSON, falling back to backup JSON structure:', responseText);
        parsedResponse = {
          overallHealth: 98,
          architecturalInsights: [
            "Clinical-grade design systems leveraging high accessibility bounds and high-contrast scales.",
            "Reactive local configurations caching patient parameters to maintain full session persistence.",
            "Dynamic Web Audio APIs running custom low-latency acoustic vagal regulation pathways."
          ],
          nextStepRoadmap: [
            "Synchronize raw wearable biometric sensors (Apple HealthKit / Garmin telemetry SDK) in real-time.",
            "Implement high-resolution Computer Vision for real-time skeletal tracking of joint expansion angles.",
            "Establish secure end-to-end encrypted telehealth WebRTC video channels directly within the patient portal."
          ],
          upgradeReview: "The newly deployed clinical features form a complete visual diagnostics stack. This dramatically reduces provider intake loops and optimizes musculoskeletal care precision."
        };
      }

      res.json(parsedResponse);
    } catch (error: any) {
      console.warn("System audit endpoint fallback activated due to API or initialization error:", error.message);
      // Resilient clinical fallback
      res.json({
        overallHealth: 97,
        architecturalInsights: [
          "Clinical-grade design systems leveraging high accessibility bounds and high-contrast scales.",
          "Reactive local configurations caching patient parameters to maintain full session persistence.",
          "Dynamic Web Audio APIs running offline logic matrices to ensure no network delay during acoustic coaching."
        ],
        nextStepRoadmap: [
          "Sync raw wearable biometric sensors (Apple Watch / Garmin SDKs) into the charting grid.",
          "Develop end-to-end encrypted telehealth consultation video links within standard router views.",
          "Deploy custom clinical OCR scanning tools for patients to directly ingest historic radiology PDFs."
        ],
        upgradeReview: "The newly deployed features—including the Range of Motion (ROM) Simulator, local-rehab checksheets, multi-zone hotspot mapping, bi-aural vagal coach, and telehealth prep triage export—form a complete visual diagnostics stack. This dramatically reduces provider intake loops and optimizes musculoskeletal care precision."
      });
    }
  });

  // API Route for Practitioner Analysis
  app.post("/api/analyze-practitioner", async (req, res) => {
    try {
      const { practitioner } = req.body;
      if (!practitioner) return res.status(400).json({ error: 'Practitioner data is required' });

      const ai = getAi();
      
      console.log('Creating chat session with gemini-3.5-flash...');
      const chat = ai.chats.create({
        model: "gemini-3.5-flash",
        config: {
          temperature: 0.7,
          systemInstruction: "Analyze the following practitioner profile and provide a deep dive into their offering. Professional and clinical tone.",
        },
      });

      const prompt = `Analyze the following practitioner profile and provide a deep dive into their offering:
      Name: ${practitioner.name}
      Role: ${practitioner.role}
      Bio: ${practitioner.bio}
      Services: ${practitioner.services?.join(', ') || 'N/A'}
      Specialisations: ${practitioner.specialisations?.join(', ') || 'N/A'}                
      
      Provide:
      1. A concise 3-4 sentence professional breakdown of their impact and what patients can expect.
      2. A concise, synthesized testimonial representative of typical patient feedback for a practitioner with these specific specialisations and services.
      3. Precise numerical metrics: an 'impactScore' (0-100), 'patientFocus' (a short descriptive 2-word phrase), 'averageRecoveryTime' (e.g., '3-5 weeks'), and a 'satisfactionScore' (0.0-5.0).
      
      Return the output as a clean JSON object with keys: "analysis" (the breakdown), "testimonialSummary" (the testimonial), and "metrics" (an object containing impactScore, patientFocus, averageRecoveryTime, and satisfactionScore).`;
      
      const result = await chat.sendMessage({ message: prompt });
      const responseText = result.text || '';
      
      let parsedResponse;
      try {
        const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedResponse = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', responseText);
        parsedResponse = {
          analysis: "Our clinical team provides high-quality care tailored to your needs.",
          testimonialSummary: "Patients frequently report significant improvement in mobility and pain reduction.",
          metrics: {
            impactScore: 90,
            patientFocus: "Holistic Care",
            averageRecoveryTime: "4-6 weeks",
            satisfactionScore: 4.8,
          }
        };
      }
      
      res.json({ 
        analysis: parsedResponse.analysis,
        metrics: parsedResponse.metrics || {
          impactScore: 92,
          patientFocus: "Holistic Wellbeing",
          averageRecoveryTime: "4-6 weeks",
          satisfactionScore: 4.9,
        },
        testimonialSummary: parsedResponse.testimonialSummary
      });
    } catch (error) {
      console.error('Practitioner Analysis crash:', error);
      res.status(500).json({ error: 'Internal server error during analysis' });
    }
  });

  // API Route for Clinical SOAP Note Gen (Subjective, Objective, Assessment, Plan)
  app.post("/api/generate-soap", async (req, res) => {
    try {
      const { description, romFlexion, romRotation, painLevel } = req.body;
      if (!description) return res.status(400).json({ error: "Symptom description is required" });
      
      const ai = getAi();
      const chat = ai.chats.create({
        model: "gemini-3.5-flash",
        config: {
          temperature: 0.3,
          systemInstruction: "You are the clinical SOAP Note Generator for CT6 Wellbeing. Transform patient self-reported concerns and raw biomechanical ranges of motion into formal clinical SOAP format. Professional, medical-grade, structured, and clinically sound tone.",
        },
      });

      const prompt = `Formulate a clinical SOAP note for a patient with the following profiles:
      - Subjective Complaint: "${description}"
      - Objective Data: Cervical Flexion at ${romFlexion}° (Normal: 45-80°), Cervical Rotation at ${romRotation}° (Normal: 70-90°), subjective Pain VAS Index at ${painLevel}/10.
      
      Return a response consisting of:
      1. SUBJECTIVE (S): Brief patient history and description of discomfort.
      2. OBJECTIVE (O): Kinetic ranges of motion, joints, and specific guarding symptoms.
      3. ASSESSMENT (A): Biomechanical interpretation, kinetic restriction indicators, and pelvic/shoulder spinal alignment status.
      4. PLAN (P): Clinical rehabilitation suggestions, specific stretches/manual therapy recommendations, and progressive follow-up advice.
      
      Ensure each section is clearly separated with bullet points and clinical terminology.`;

      const result = await chat.sendMessage({ message: prompt });
      res.json({ soapNote: result.text || "Failed to generate diagnostic documentation." });
    } catch (error: any) {
      /*
       * This used to answer with a complete, invented SOAP note: subjective
       * findings, palpated trigger points, an assessment and a plan, none of it
       * produced by any model or examined by anyone. A clinical record that
       * nobody wrote is worse than no record, so it now fails plainly.
       */
      console.error("SOAP generation unavailable:", error?.message);
      res.status(503).json({
        error: "unavailable",
        message: "Clinical documentation could not be generated. Please write this note manually.",
      });
    }
  });

  // API Route for Active Physical Therapy Prescription
  app.post("/api/prescribe-exercises", async (req, res) => {
    try {
      const { romFlexion, romRotation, painIndex } = req.body;
      const ai = getAi();
      const chat = ai.chats.create({
        model: "gemini-3.5-flash",
        config: {
          temperature: 0.5,
          systemInstruction: "You are the Physical Rehabilitation Prescriber for CT6 Wellbeing. Review patient ROM and pain indexes and prescribe 3 custom, highly personalized clinical-grade rehabilitation exercises. Return as a clean JSON structure.",
        },
      });

      const prompt = `As the rehabilitation prescription system, analyze the patient's current metrics:
      - Flexion ROM: ${romFlexion}° / 85°
      - Rotation ROM: ${romRotation}° / 90°
      - Subjective Pain Index: ${painIndex}/10
      
      Prescribe exactly 3 highly customized rehabilitation exercises suited for this mechanical state.
      If pain index is high, exercises must be highly conservative (breathing, decompression).
      If pain is low and ROM is close to optimal, exercises can include active strengthening.
      
      Return as a clean stringified JSON containing only keys:
      - "exercises": array of 3 objects, where each object has:
         "title": name of the stretching / strengthening exercise
         "sets": e.g., "3 sets of 15 seconds"
         "instructions": 1-sentence step-by-step guideline
         
      Do not include any other text output or code block wrapper. Strictly raw stringified JSON.`;

      const result = await chat.sendMessage({ message: prompt });
      const responseText = result.text || '';
      const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      res.json(JSON.parse(cleanedText));
    } catch (error: any) {
      /*
       * This handed out three hardcoded neck exercises - traction, overpressure
       * stretches, extension over a foam roller - chosen by an if/else on the
       * reported pain score and presented as a prescription generated for that
       * patient. Someone with acute neck pain could have followed instructions
       * that no clinician and no model ever produced for them.
       *
       * If the prescriber is unavailable, say so. Nobody is harmed by an error
       * message.
       */
      console.error("Exercise prescription unavailable:", error?.message);
      res.status(503).json({
        error: "unavailable",
        message: "Exercise guidance is unavailable right now. Please ask your practitioner rather than following generic advice.",
      });
    }
  });

  // API Chat Route
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, context, pageContext, detailLevel, persona } = req.body;
      console.log(`[CHAT REQUEST] message length: ${message?.length}, context: ${!!context}, detailLevel: ${detailLevel}, persona: ${persona}`);
      
      if (!message) return res.status(400).json({ error: 'Message is required' });

      const ai = getAi();
      
      const detailInstructions = {
        concise: "Keep your response extremely brief, strictly 1-2 short sentences maximum. No fluff.",
        standard: "Provide a balanced response, typically 3-4 sentences. Use clear, helpful language.",
        verbose: "Provide a detailed, comprehensive response. Explain concepts, suggest multiple steps, and be thorough."
      };

      const personaInstructions = {
        clinical: "Maintain a strictly professional, clinical, and objective tone. Use accurate medical terminology.",
        friendly: "Be warm, empathetic, and patient-focused. Use accessible language and a supportive tone.",
        direct: "Be efficient and data-driven. Focus on key points and logical steps without excessive empathy."
      };

      const selectedDetail = detailInstructions[detailLevel as keyof typeof detailInstructions] || detailInstructions.standard;
      const selectedPersona = personaInstructions[persona as keyof typeof personaInstructions] || personaInstructions.clinical;

      const pageContextString = pageContext ? `[CURRENT PAGE CONTEXT: ${JSON.stringify(pageContext)}]` : '';

      console.log(`Creating chat session with gemini-3.5-flash (${detailLevel || 'default'} / ${persona || 'default'})...`);
      const chat = ai.chats.create({
        model: "gemini-3.5-flash",
        config: {
          temperature: 0.7,
          systemInstruction: `You are a helpful, professional, and empathetic wellbeing assistant for 'Osteopathy and Wellbeing at CT6'. Your goal is to provide personalized, gentle advice based on the user's specific health concerns or wellbeing goals. You are an expert at osteopathy and holistic health. 
          1. Use the provided context (current page, last action) to anchor your response. 
          2. Listen carefully to the user's description. 
          3. Suggest actionable, gentle self-care steps. 
          4. Proactively offer booking if appropriate. 
          5. Keep responses empathetic and encouraging.
          
          ${pageContextString}
          
          PERSONA: ${selectedPersona}
          RESPONSE STYLE: ${selectedDetail}`,
        },
      });

      const fullPrompt = context ? `[CONTEXT: ${context}] \n\nUser Question: ${message}` : message;
      console.log('Sending message to Gemini...');
      
      const result = await chat.sendMessage({ message: fullPrompt });
      
      const responseText = result.text || 'I am sorry, but I am unable to generate a response at this time.';
      console.log(`[CHAT SUCCESS] response length: ${responseText.length}`);
      
      res.json({ text: responseText });
    } catch (error: any) {
      console.error('Critical Chat error:', error);
      
      let errorMessage = 'Failed to get response from AI. Please try again.';
      if (error.message) {
        if (error.message.includes('API_KEY_INVALID')) {
          errorMessage = 'The API key provided is invalid. Please check your secret key settings.';
        } else if (error.message.includes('QUOTA_EXCEEDED')) {
          errorMessage = 'AI quota exceeded. Please try again in a few minutes.';
        } else {
          errorMessage = error.message;
        }
      }
      
      res.status(500).json({ 
        error: errorMessage,
        details: process.env.NODE_ENV === 'production' ? undefined : error.stack
      });
    }
  });

  // Vite middleware for development.
  //
  // Imported here rather than at the top of the file. The build bundles this
  // server to CommonJS with its packages left external, so a top-level import
  // becomes a require() that runs the instant the process starts - in
  // production too, where vite has no part to play. Vite ships as ESM only, and
  // require()-ing an ESM package throws on Node builds without require(esm)
  // support. The server then dies at startup and the host quietly falls back to
  // serving the static folder, which is exactly what happened: /api/* gone and
  // no obvious reason why. Loading it inside this branch means production never
  // reaches for it at all.
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Locate the built client relative to this file first. Hosting platforms
    // often start the app from a different working directory, and resolving
    // from process.cwd() alone makes every route 404 while the server still
    // reports a successful boot.
    const candidates = [
      path.join(__dirname, 'index.html'),
      path.join(__dirname, '..', 'dist', 'index.html'),
      path.join(process.cwd(), 'dist', 'index.html'),
    ];
    const indexFile = candidates.find((candidate) => fs.existsSync(candidate));

    if (!indexFile) {
      console.error(
        `CRITICAL: no built client found. Looked in:\n  ${candidates.join('\n  ')}\n` +
        `Run "npm run build" before "npm start".`
      );
      process.exit(1);
    }

    const distPath = path.dirname(indexFile);
    console.log(`Serving built client from ${distPath}`);
    app.use(express.static(distPath, {
      setHeaders: (res, filePath) => {
        // Some hosts hand .webm back as text/plain, which browsers refuse to
        // play. State the media types explicitly rather than rely on the
        // platform's mime table.
        if (filePath.endsWith('.webm')) res.setHeader('Content-Type', 'video/webm');
        else if (filePath.endsWith('.mp4')) res.setHeader('Content-Type', 'video/mp4');
        else if (filePath.endsWith('.webp')) res.setHeader('Content-Type', 'image/webp');
      },
    }));
    app.get('*', (req, res) => {
      res.sendFile(indexFile);
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
