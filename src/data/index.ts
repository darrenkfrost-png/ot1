export interface Treatment {
  id: string;
  title: string;
  desc: string;
  image: string;
  content: string;
  conditions?: string[];
  benefits?: string[];
  techniques?: string[];
  aftercare?: string[];
  sessionFocus?: string;
}

export interface Practitioner {
  id: string;
  name: string;
  role: string;
  qualifications?: string;
  image: string;
  bio: string;
  philosophy?: string;
  caseStudies?: string[];
  approach?: string;
  specialisations?: string[];
  services?: string[];
}

export const TREATMENTS: Treatment[] = [
  {
    id: 'osteopathy',
    title: 'Osteopathy',
    desc: 'Holistic manual therapy focusing on the body\'s natural ability to heal itself. Effective for back pain, joint problems, and headaches.',
    image: 'https://osteopathyandwellbeing.co.uk/wp-content/uploads/2018/02/4590922.jpg',
    content: `Osteopathy in Herne Bay is a great way to address musculoskeletal issues. With its holistic approach, osteopathy focuses on the body's natural ability to heal itself. Whether you're dealing with back pain, joint problems, or headaches, an osteopath in Herne Bay can provide personalized treatment to help you feel better. Book an appointment today and experience the benefits of osteopathy firsthand! 

While osteopaths are best known for their treatment of back pain, osteopathy can also help with a wide range of other musculoskeletal conditions. When you visit our clinic for the first time, not only is our aim to recognise your symptoms and relieve your pain as quickly as possible, but to also understand what has caused your pain in the first place so we can help prevent it from recurring. We understand that coming to see an osteopath for the first time can be a bit daunting, so we will do our best to make you feel relaxed and at ease by explaining what we are doing and why.`,
    conditions: [
      'Lower back pain', 'Neck pain', 'Shoulder, arm, elbow & wrist pain', 'Arthritic pain',
      'Pregnancy-related pain', 'Sciatica', 'Hip & knee pain', 'Foot & ankle pain',
      'Trapped nerves', 'Migraine prevention', 'Muscle spasm', 'General aches & pains',
      'Sports injuries', 'Circulatory problems'
    ]
  },
  {
    id: 'swedish-massage',
    title: 'Swedish Massage',
    desc: 'The foundation of Western massage, focusing on relaxation, circulation, and muscular tension reduction.',
    image: 'https://osteopathyandwellbeing.co.uk/wp-content/uploads/2018/02/4590924.jpg',
    content: `Swedish massage is the foundation of many Western massage practices. Developed in the nineteenth century by Swedish physiologist Per Henrik Ling, it combines long, flowing strokes, kneading, friction, rhythmic tapping and vibration to loosen tight muscles and improve circulation. 

Unlike deep tissue or sports massage, Swedish massage uses moderate pressure and oils or creams to reduce friction and encourage relaxation. The primary goals are to promote blood flow toward the heart, flush metabolic waste products such as lactic acid, relieve stress and support the body’s natural healing processes. Research suggests that Swedish massage can stimulate the immune system by increasing the production of white blood cells and reducing cortisol levels.`,
    benefits: [
      'Improves blood flow', 'Eases stress and pain', 'Boosts immunity', 
      'Reduces anxiety', 'Improves sleep quality', 'Relieves muscle adhesions'
    ],
    techniques: [
      'Effleurage (long gliding strokes)', 'Petrissage (kneading)', 'Tapotement (rhythmic tapping)', 
      'Friction', 'Vibration'
    ],
    aftercare: [
      'Stay well hydrated', 'Gentle stretching', 'Mindfulness and posture awareness', 
      'Warm baths to enhance benefits'
    ],
    sessionFocus: 'Relaxation and circulation, general muscular tension reduction.'
  },
  {
    id: 'therapeutic-massage',
    title: 'Therapeutic Full-Body & Back Massage',
    desc: 'Customised clinical massage targeting specific regions or conditions like chronic pain and postural imbalances.',
    image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=80&w=800',
    content: `Therapeutic massage is distinguished by its customised approach to target specific regions or conditions. While Swedish massage is generalised, therapeutic massage uses a combination of strokes to address chronic pain, postural imbalances, or recent injuries. 

Sessions begin with a detailed assessment of your daily habits, such as desk work or physical labour, that might contribute to muscle imbalances. The therapist then designs a session plan targeting specific muscle groups like the erector spinae, trapezius, or gluteal muscles.`,
    benefits: [
      'Reduces chronic tension', 'Addresses chronic aches', 'Promotes deep relaxation', 
      'Increases tissue pliability', 'Breaks down adhesions'
    ],
    techniques: [
      'Customised Swedish strokes', 'Trigger point therapy', 'Myofascial release', 
      'Cross-fiber friction', 'Deep kneading'
    ],
    aftercare: [
      'Hydration to release metabolites', 'Daily stretching routines', 'Ergonomic workspace changes', 
      'Heat or cold application as advised'
    ],
    sessionFocus: 'Specific region focus (e.g. back, neck, shoulders) or full-body clinical treatment.'
  },
  {
    id: 'thai-oil-massage',
    title: 'Thai Oil Body Massage',
    desc: 'A fusion of traditional Thai techniques and Western oil massage for flexibility and energy balance.',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800',
    content: `Thai oil body massage is a fusion of traditional Thai massage (Nuad Thai) and Western oil massage. It incorporates rhythmic compressions and stretches along the body\'s "sen lines" (energy pathways) to improve flexibility and energy flow. 

The use of natural oils makes the massage smoother and more relaxing than traditional fully-clothed Thai massage, allowing for longer gliding strokes while retaining the emphasis on assisted yoga-like postures and passive stretching.`,
    benefits: [
      'Improves range of motion', 'Reduces pain', 'Lowers stress levels', 
      'Produces sensation of lightness', 'Balances energy flow'
    ],
    techniques: [
      'Passive stretching', 'Rhythmic compressions', 'Energy line (sen) work', 
      'Palm pressure', 'Forearm gliding'
    ],
    aftercare: [
      'Hydration', 'Gentle self-stretching', 'Listen to your body', 
      'Avoid heavy exercise immediately after'
    ],
    sessionFocus: 'Flexibility and energy balance.'
  },
  {
    id: 'digestive-massage',
    title: 'Digestive / Abdominal Massage',
    desc: 'Specialised support for gastrointestinal function and relief from bloating, constipation, and menstrual discomfort.',
    image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=80&w=800',
    content: `Digestive or abdominal massage is designed to support gastrointestinal function and relieve discomfort associated with conditions like constipation, bloating, and menstrual cramps. 

The massage follows the large intestine\'s path in a specific clockwise motion to encourage peristalsis—the natural wave-like contractions that move food through the intestines. It also helps release muscular and fascial tension in the abdominal area.`,
    benefits: [
      'Eases constipation', 'Reduces bloating', 'Relieves menstrual cramps', 
      'Improves blood flow to digestive organs', 'Emotional tension release'
    ],
    techniques: [
      'Gentle abdominal strokes', 'Circular motions', 'Clockwise kneading', 
      'Deep pressure near pelvic area'
    ],
    aftercare: [
      'Learn home self-massage routines', 'Dietary awareness (high fibre)', 'Mindful eating', 
      'Drink warm water/herbal tea'
    ],
    sessionFocus: 'Stimulates digestion and relieves abdominal discomfort.'
  },
  {
    id: 'pregnancy-massage',
    title: 'Pregnancy Massage',
    desc: 'Safe, gentle support during pregnancy to alleviate tension, reduce swelling, and improve sleep.',
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=800',
    content: `Pregnancy massage adapts Swedish techniques to meet the unique needs of expectant mothers. It uses gentle strokes to alleviate muscular tension, support circulation, reduce swelling (oedema), and improve sleep quality. 

Sessions are performed in safe, comfortable side-lying positions with pillows or bolsters to support the abdomen, hips, and knees. This avoids placing pressure on the vena cava and ensures maximum comfort for both mother and baby.`,
    benefits: [
      'Reduces swelling', 'Relieves back and hip pain', 'Lower stress and anxiety', 
      'Regulates hormone levels', 'Nurtures emotional wellbeing'
    ],
    techniques: [
      'Light Swedish techniques', 'Side-lying positioning', 'Gentle belly strokes (optional)', 
      'Oedema-reducing leg strokes'
    ],
    aftercare: [
      'Hydration and rest', 'Follow obstetric advice', 'Prenatal yoga/walking', 
      'Avoid lying flat on back'
    ],
    sessionFocus: 'Support during pregnancy and relief from associated discomforts.'
  },
  {
    id: 'natural-face-lift',
    title: 'Natural Face Lift Massage',
    desc: 'Rejuvenating blend of acupressure and lymphatic drainage to enhance skin health and release jaw tension.',
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=800',
    content: `Natural face lift massage combines acupressure, lymphatic drainage, and facial reflexology to enhance skin health and promote relaxation. Unlike invasive procedures, it stimulates the skin’s natural regenerative processes by improving circulation and balancing energy flow. 

The treatment targets meridians associated with internal organs to balance the whole body while specifically addressing fine lines, puffiness, and tension in the jaw, neck, and shoulders.`,
    benefits: [
      'Tones skin', 'Reduces wrinkles & puffiness', 'Relieves jaw tension', 
      'Improves skin tone', 'Stimulates collagen production'
    ],
    techniques: [
      'Acupressure', 'Lymphatic drainage', 'Facial reflexology', 
      'Occipital ridge kneading'
    ],
    aftercare: [
      'Hydration', 'Gentle facial self-massage', 'Minimise caffeine', 
      'Maintain balanced antioxidant diet'
    ],
    sessionFocus: 'Facial rejuvenation and energy balance.'
  },
  {
    id: 'indian-head-massage',
    title: 'Indian Head Massage',
    desc: 'An ancient Ayurvedic therapy targeting the scalp, neck, and shoulders to relieve stress and headaches.',
    image: 'https://osteopathyandwellbeing.co.uk/wp-content/uploads/2023/04/Indian-Head-Mass-pic.webp',
    content: `Indian head massage, traditionally known as Champissage, is a holistic therapy that originated in India thousands of years ago as part of Ayurveda. It focuses on the upper body, where we often hold the most tension. 

The treatment involves rhythmic movements and pressure point work on the scalp, face, neck, and shoulders. It is highly effective for relieving stress-related headaches, Improving focus, and promoting hair health by stimulating circulation to the follicles.`,
    benefits: [
      'Reduces headaches', 'Improves circulation', 'Encourages hair growth', 
      'Relieves eye strain', 'Promotes clarity and concentration'
    ],
    techniques: [
      'Gliding scalp strokes', 'Acupressure points (TCM/Ayurveda)', 'Neck & shoulder kneading', 
      'Percussion (tapotement)'
    ],
    aftercare: [
      'Leave oils in hair if used', 'Hydration', 'Mindful posture awareness', 
      'Learn simple scalp self-massage'
    ],
    sessionFocus: 'Release head, neck, and upper-body tension.'
  },
  {
    id: 'thai-foot-massage',
    title: 'Thai Foot Massage',
    desc: 'Invigorating reflexology treatment using hands and wooden sticks to balance energy lines.',
    image: 'https://osteopathyandwellbeing.co.uk/wp-content/uploads/2018/02/foot.jpg',
    content: `Thai foot massage combines elements of reflexology and Thai acupressure. According to traditional Thai medicine, stimulating reflex points on the feet can influence the corresponding organs and systems throughout the body. 

Using hands, fingers, and a traditional wooden stick, the therapist applies pressure to specific points and stretches the foot and lower leg. The treatment is both grounding and refreshing, leaving you with a sense of all-over vitality.`,
    benefits: [
      'Stimulates lymphatic drainage', 'Reduces stiffness', 'Enhances sleep quality', 
      'Grounding and refreshing', 'Detoxifies the body'
    ],
    techniques: [
      'Hand & thumb pressure', 'Wooden stick reflex work', 'Lower leg stretching', 
      'Calf & Achilles gliding'
    ],
    aftercare: [
      'Drink water to flush toxins', 'Gentle walking', 'Simple foot exercises at home', 
      'Avoid alcohol immediately after'
    ],
    sessionFocus: 'Balance energy flow in feet and legs.'
  },
  {
    id: 'hot-stone-massage',
    title: 'Hot Stone Massage',
    desc: 'Luxurious deep relaxation using heated basalt stones to soften muscle tissue and relieve stress.',
    image: 'https://osteopathyandwellbeing.co.uk/wp-content/uploads/2018/02/4590924.jpg',
    content: `Hot stone massage uses smooth, heated basalt stones placed on key points of the body to permeate deep into the muscles. The heat dilates blood vessels, increasing circulation and allowing the therapist to work deeply without needing intense pressure. 

Stones are also used as extensions of the therapist’s hands to perform long, gliding strokes. The combination of heat and massage provides a sense of profound relaxation and can be particularly beneficial for chronic conditions like fibromyalgia or multiple sclerosis.`,
    benefits: [
      'Alleviates pain', 'Improves flexibility', 'Deep stress reduction', 
      'Vasodilation (increased circulation)', 'Reduces muscle spasms'
    ],
    techniques: [
      'Passive heating with warm stones', 'Stone-assisted gliding strokes', 'Chakra point placement', 
      'Alternating cool stones (optional)'
    ],
    aftercare: [
      'Hydration', 'Avoid extreme temperatures (sauna/hot tub)', 'Rest to integrate effects', 
      'Avoid caffeine immediately after'
    ],
    sessionFocus: 'Deep relaxation and muscle release through heat therapy.'
  },
  {
    id: 'sports-massage',
    title: 'Sports Massage',
    desc: 'Vigorous deep tissue work designed for injury prevention, performance optimisation, and recovery.',
    image: 'https://osteopathyandwellbeing.co.uk/wp-content/uploads/2019/03/57134432-sports-massage-image.jpg',
    content: `Sports massage is a specialised form of deep tissue therapy targeting the muscles, tendons, and ligaments involved in athletic performance. It is essential for anyone from professional athletes to weekend warriors. 

Unlike relaxation massage, sports massage is more vigorous and can be tailored for pre-event (invigorating), post-event (recovery), or maintenance care. It addresses trigger points, breaks down scar tissue, and ensures muscles remain pliable for optimal function.`,
    benefits: [
      'Enhances flexibility', 'Reduces muscle fatigue', 'Accelerates recovery time', 
      'Prevents tendon injuries', 'Improves body awareness'
    ],
    techniques: [
      'Deep tissue manipulation', 'Cross-fibre friction', 'Compression & stripping', 
      'Assisted stretching', 'Joint mobilisation'
    ],
    aftercare: [
      'Hydration with electrolytes', 'Active recovery (walking/swimming)', 'Foam rolling', 
      'Ice/heat therapy as recommended'
    ],
    sessionFocus: 'Injury prevention, performance optimisation, and physical recovery.'
  },
  {
    id: 'physiotherapy',
    title: 'Physiotherapy',
    desc: 'Restores movement and function affected by injury, illness or disability.',
    image: 'https://osteopathyandwellbeing.co.uk/wp-content/uploads/2018/02/foot.jpg',
    content: `Physiotherapy helps to restore movement and function when someone is affected by injury, illness or disability. It can also help to reduce your risk of injury or illness in the future. Physiotherapy can be helpful for people of all ages with a wide range of health conditions.

Physiotherapists consider the body as a whole, rather than just focusing on the individual aspects of an injury or illness.`,
    conditions: [
      'Brain or nervous system – such as movement problems resulting from a stroke, MS or Parkinson\'s',
      'Bones, joints and soft tissue – such as back pain, neck pain, shoulder pain and sports injuries',
      'Heart and circulation – such as rehabilitation after a heart attack',
      'Lungs and breathing – such as COPD and cystic fibrosis'
    ]
  },
  {
    id: 'acupuncture',
    title: 'Acupuncture',
    desc: 'Western-style medical acupuncture stimulating sensory nerves to produce natural pain-relieving substances.',
    image: 'https://osteopathyandwellbeing.co.uk/wp-content/uploads/2018/03/needles.jpg',
    content: `Traditional Chinese acupuncture is based on the belief that it can restore the flow of Qi, an energy that flows through your body, while western medical acupuncture is evidence-based and is only administered after a full diagnosis. The difference between western and eastern acupuncture is clearly marked. The western model uses anatomy, physiology and current medical models, while the eastern is philosophy based – much more about yin, yang and Qi. 

Acupuncture can be used as a treatment for a wide range of health problems, including back pain, headaches and migraines, it is a traditional Chinese treatment established over 2,000 years ago. However, here at Osteopathy & Wellbeing, we offer Western-style acupuncture.`,
    benefits: [
      'Chronic (long-term) pain', 'Chronic tension-type headaches', 'Migraines',
      'Joint pain', 'Dental pain', 'Postoperative pain'
    ]
  },
  {
    id: 'hypnotherapy',
    title: 'Hypnotherapy',
    desc: 'Solution-focused therapy mixing psychotherapy and hypnosis to help achieve goals.',
    image: 'https://osteopathyandwellbeing.co.uk/wp-content/uploads/2022/06/combined-hypno.webp',
    content: `Solution-focused hypnotherapy is a forward-looking, talking therapy which mixes psychotherapy and hypnosis to help you make progress towards your goals. This is a very effective and powerful combination and means that most people need a lot fewer sessions than traditional psychotherapy.

I work with clients from all walks of life on reducing anxiety, stress and self-limiting beliefs. I am a specialist experienced in working with depression, fears and phobias, problem-solving, PTSD, sleep issues, work-related stress, performance at work, exam stress and building confidence.`,
    benefits: [
      'Sleep Issues and Insomnia', 'Anxiety', 'IBS – Gut Directed Hypnotherapy',
      'Dental Phobia & Bruxism', 'Weight Management', 'Alcohol Issues',
      'Depression', 'Diabetes', 'Social Media Anxiety', 'Exam Stress or Performance',
      'Procrastination or Decision Making', 'Fear & Phobias'
    ]
  },
  {
    id: 'footcare',
    title: 'Footcare',
    desc: 'Routine care including corns, hard skin, toenail cutting, and diabetic foot care.',
    image: 'https://osteopathyandwellbeing.co.uk/wp-content/uploads/2018/02/4591974.jpg',
    content: `Our feet are our foundation. We often take them for granted but a problem with the health of our feet can really affect our quality of life. It is important to take care of our feet and address any minor problems early to try and prevent them from developing into more major issues.

Routine foot care is offered including: removal of corns and hard skin, toenail cutting, elderly foot care, diabetic foot care, and treatment for problems such as cracked heels, ingrown toenails, verrucae and fungal skin and nails.`,
    benefits: [
      'Removal of corns and hard skin', 'Toenail cutting', 'Elderly foot care',
      'Diabetic foot care', 'Cracked heels', 'Ingrown toenails',
      'Verrucae', 'Fungal skin and nails'
    ]
  }
];

export const PRACTITIONERS: Practitioner[] = [
  {
    id: 'adrian-hatcher',
    name: 'Adrian Hatcher',
    role: 'Principle Osteopath',
    qualifications: 'BSc (Hons) Ost',
    image: 'https://osteopathyandwellbeing.co.uk/wp-content/uploads/2022/03/gm-adrian600-topaz-enhance-6x-faceai-2.webp',
    bio: `As a young man and prior to pursuing a career as an osteopath, Adrian played football at a semi-professional level. In 2001, Adrian was involved in a water sports accident and suffered a serious neck injury, which led him to discover osteopathy as the key to his recovery. 

Following his qualification, Adrian worked at several different clinics before purchasing the business in 2008 and establishing Osteopathy & Wellbeing @CT6. He remains deeply passionate about sports science and rehabilitation. Adrian is known for his ability to translate complex physiological concepts into plain, actionable language, ensuring clients are fully equipped to manage their own long-term health. His commitment is to not just resolve immediate pain, but to identify the biomechanical root causes that lead to recurring issues.`,
    philosophy: 'Adrian believes the human body possesses an innate, intelligent ability to heal when biomechanical restrictions are removed. His treatment philosophy centers on empowerment: providing clients with the understanding of their own mechanics to ensure durable, long-term health rather than temporary relief.',
    caseStudies: [
        'Successfully rehabilitated a semi-professional athlete following a grade 3 ankle sprain, utilizing a phased return-to-play protocol that reduced recovery time by 25%.',
        'Resolved chronic spinal discomfort in a patient with a decade-long history of sedentary postural strain through a combined approach of targeted mobilization, workplace ergonomic adjustments, and customized muscle strengthening.'
    ],
    approach: 'Adrian utilizes a highly structural approach. During an initial consultation, he employs localized orthopedic testing to pinpoint the primary site of restriction, followed by tailored myofascial release, joint articulation, and tailored resistance exercises to restore optimal mechanical function.',
    specialisations: ['Osteopathy', 'Sports Massage', 'Acupuncture', 'Chronic Spinal Patients'],
    services: ['Spinal Adjustment', 'Sports Injury Rehabilitation', 'Dry Needling', 'Posture Correction']
  },
  {
    id: 'leon-benning',
    name: 'Leon Benning',
    role: 'Osteopath & Sports Specialist',
    qualifications: 'M.Ost & Pg Dip Sports & Ex Med',
    image: 'https://osteopathyandwellbeing.co.uk/wp-content/uploads/2023/04/Leon-Picture.jpg',
    bio: `Leon graduated from the London School of Osteopathy and furthered his professional development with a postgraduate diploma in Sports and Exercise Medicine. Beyond his clinical work, he provides active pitchside trauma support for the Canterbury Rugby Club, exposing him to high-intensity injury management in real-time.

He is a firm believer that incremental, sustainable physical activity is the cornerstone of lifelong wellness. His expertise lies in bridging the gap between acute clinical diagnosis and professional-level sports rehabilitation, ensuring clients—whether athletes or office-based professionals—receive the same level of precise care.`,
    philosophy: 'Leon adheres to an evidence-based approach, combining functional movement assessment with sports-specific therapeutic modalities to maximize both health outcomes and human performance.',
    caseStudies: [
        'Coordinated the comprehensive rehabilitation for a high-intensity rugby player who suffered a complex shoulder dislocation, ensuring a safe, accelerated return to competitive play within six months.',
        'Managed the recovery of a marathon runner plagued by recurring calf strains, identifying and correcting underlying biomechanical gait imbalances.'
    ],
    approach: 'His approach integrates acute sports trauma management with long-term rehabilitative strength programming, focusing on restoring stability and capacity to injured structures.',
    specialisations: ['Sports Medicine', 'Dry Needling', 'Sports Massage'],
    services: ['Sports Injury Assessment', 'Pitchside First Aid', 'Dry Needling Therapy', 'Exercise Prescription']
  },
  {
    id: 'keri-browne',
    name: 'Keri Browne',
    role: 'Massage Therapist',
    image: 'https://osteopathyandwellbeing.co.uk/wp-content/uploads/2025/04/Keri-Picture-1-scaled.jpg',
    bio: `Following an extensive, physically demanding career as a professional vocalist and dancer, Keri deeply understands the impact of repetitive strain on the body. She transitioned to massage therapy in 2017, bringing an intuitive understanding of the physical stresses performers endure. 

She holds advanced certifications in Deep Tissue Massage, Sports Massage, and Remedial Back Therapy. Keri thrives on a holistic therapeutic approach, crafting individual sessions that directly address the specific stressors her clients face in their daily lives, helping them restore both physical comfort and well-being.`,
    philosophy: 'Keri views massage as an essential tool to reconnect the mind and body, utilizing therapeutic touch to alleviate physical holdings and encourage a state of deep nervous system regulation.',
    caseStudies: [
        'Helped a retired dancer regain significant hip mobility and reduced chronic muscular tension developed over two decades of professional performance.',
        'Enabled a corporate executive suffering from severe shoulder strain due to static desk work to maintain full range of motion through a consistent monthly remedial maintenance routine.'
    ],
    approach: 'Keri uses an intuitive, empathetic style. She carefully listens to the client’s physical history and responses during treatment, blending gentle tissue release with targeted, deeper work to resolve tension patterns.',
    specialisations: ['Swedish Massage', 'Deep Tissue', 'Sports Massage', 'Remedial Back Therapy'],
    services: ['Swedish Relaxation', 'Deep Tissue Remedial Therapy', 'Sports Injury Recovery']
  },
  {
    id: 'clare-rogers',
    name: 'Clare Rogers',
    role: 'Foot Care Manager',
    qualifications: 'SMAE Institute',
    image: 'https://osteopathyandwellbeing.co.uk/wp-content/uploads/2022/06/Clare-Rogers.webp',
    bio: `Clare trained at the renowned SMAE Institute in Maidenhead and has been providing expert foot care at Osteopathy & Wellbeing @CT6 since 2012. She centers her practice on a preventative, maintenance-based philosophy, helping clients keep their feet healthy, pain-free, and functional over the long term.

Understanding that daily movement is fundamentally predicated on foot health, Clare provides compassionate, meticulous clinical care coupled with practical, personalized advice to help clients manage their foot health effectively at home.`,
    philosophy: 'Clare champions proactive foot health as the indispensable foundation for maintaining autonomy, activity, and independence throughout the aging process.',
    caseStudies: [
        'Treated an elderly patient with recurring, highly painful calluses that significantly restricted their walking, resulting in improved gait, reduced pain scores, and increased daily activity levels.',
        'Provided comprehensive diabetic foot monitoring and management for a client, identifying early-stage skin compromises and providing essential preventive intervention.'
    ],
    approach: 'Clare combines meticulous clinical precision with highly practical, lifestyle-matched advice, respecting that effective foot care must be inherently sustainable for the client.',
    specialisations: ['Diabetic Foot Care', 'Corn Removal', 'Elderly Foot Care'],
    services: ['Corn & Callus Removal', 'Diabetic Foot Screening', 'Routine Nail Care', 'Verruca Treatment']
  },
  {
    id: 'magdalena-lius-youard',
    name: 'Magdalena Lius-Youard',
    role: 'Acupuncturist',
    qualifications: 'MSc Chinese Herbal Medicine',
    image: 'https://osteopathyandwellbeing.co.uk/wp-content/uploads/2025/04/Magdalena-Pic-1.jpg',
    bio: `Magdalena graduated with a degree in acupuncture from the University of Westminster in 2002. She further expanded her skills with an MSc in Chinese Herbal Medicine. Across two decades of dedicated clinical practice, she has successfully addressed a diverse range of complex health conditions, blending ancient wisdom with empirical clinical observation.

She frequently works with clients seeking natural, holistic interventions for chronic, hard-to-manage issues including skin conditions, anxiety disorders, functional digestive impediments, and debilitating migraine syndromes.`,
    philosophy: 'Magdalena views health as a delicate, dynamic equilibrium of internal energy. She utilizes a synthesize approach, harmonizing the body’s internal systems through acupuncture and herbal medicine to facilitate true healing processes.',
    caseStudies: [
        'Guided a client with chronic, frequent migraine episodes through a twelve-week acupuncture treatment course, resulting in a 60% reduction in episode frequency and diminished symptom severity.',
        'Supported a patient through a complex skin condition management program, combining medicinal herbal formulas with strategic acupuncture points to achieve long-term skin clarity.'
    ],
    approach: 'Her diagnostic methodology is deeply rooted in traditional TCM diagnostics, which she then adapts to the unique energetic constitution and lifestyle constraints of each individual patient, ensuring the treatment is deeply personalized.',
    specialisations: ['Acupuncture', 'Chinese Herbal Medicine'],
    services: ['Traditional Acupuncture', 'Chinese Herbal Medicine Consultation', 'Migraine Management']
  },
  {
    id: 'alexandra-gibson',
    name: 'Alexandra Gibson',
    role: 'Clinical Hypnotherapist',
    qualifications: 'HPD DSFH MNCH(Reg)',
    image: 'https://osteopathyandwellbeing.co.uk/wp-content/uploads/2022/06/hypnotherapy-anxiety-insomnia-768x1024.jpg',
    bio: `Alexandra is a modern psychotherapeutic practitioner focusing on helping clients achieve tangible goals using structured, practical interventions. Her toolkit is extensive, incorporating elements from Solution-Focused Brief Therapy (SFBT), Neuro-Linguistic Programming (NLP), and Cognitive Behavioral Therapy (CBT).

Her methodology is grounded in contemporary neuroscience, assisting clients in identifying and neutralizing subconscious roadblocks in a supportive, non-judgmental environment. Her work empowers clients to leverage their own inner resources to overcome persistent challenges.`,
    philosophy: 'Alexandra fundamentally believes in the brain’s inherent neuroplasticity. Her philosophy centers on empowering clients to rewrite their own internal narratives, moving them from a state of being "problem-focused" to consciously "solution-focused".',
    caseStudies: [
        'Enabled a high-achieving student paralyzed by examination anxiety to successfully re-frame their cognitive response, leading to significantly enhanced preparation capability and academic performance.',
        'Assisted a client suffering from long-term chronic insomnia to successfully identify and restructure maladaptive sleep habits through a blend of cognitive reframing and hypnotic relaxation techniques, restoring a healthy sleep cycle.'
    ],
    approach: 'Alexandra provides a neutral, deeply safe space for collaborative exploration, Utilizing neuroscience-informed techniques to help clients systematically identify and move towards their desired state.',
    specialisations: ['Hypnotherapy', 'Sleep Therapy', 'Gut Directed Hypnotherapy'],
    services: ['Solution-Focused Hypnotherapy', 'Anxiety & Stress Management', 'Sleep Therapy']
  }
];
