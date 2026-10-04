export interface Treatment {
  id: string;
  title: string;
  desc: string;
  image: string;
  content: string;
  /**
   * What the clinic's own service page says this treatment helps with, word
   * for word. The site search matches these ("sciatica" finds Osteopathy).
   */
  conditions?: string[];
  /**
   * The clinic's own list for this treatment, word for word from its service
   * page, shown under "Who is this for?" on the treatment's page. Leave it
   * out rather than write one: a treatment without a list tells the patient
   * to ring the clinic instead of guessing on the clinic's behalf.
   */
  whoFor?: string[];
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
    desc: 'Holistic manual therapy focusing on the body\'s natural ability to heal itself. Commonly used for back pain, joint problems and headaches.',
    image: 'https://osteopathyandwellbeing.co.uk/wp-content/uploads/2018/02/4590922.jpg',
    content: `Osteopathy in Herne Bay is a great way to address musculoskeletal issues. With its holistic approach, osteopathy focuses on the body's natural ability to heal itself. Whether you're dealing with back pain, joint problems, or headaches, an osteopath in Herne Bay can provide personalised treatment to help you feel better. 

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

Unlike deep tissue or sports massage, Swedish massage uses moderate pressure and oils or creams to reduce friction and encourage relaxation. The primary goals are to promote blood flow toward the heart, flush metabolic waste products such as lactic acid, relieve stress and support the body’s natural healing processes.`,
    benefits: [
      'Improves blood flow', 'Eases stress and pain', 'Leaves you refreshed', 
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
    // The clinic names this massage and nothing more: a therapeutic full-body
    // or back massage, built on Swedish (classical) massage. The chronic-pain
    // and injury claims, the "assessment of your daily habits", the technique
    // list (trigger points, myofascial release, cross-fibre friction) and the
    // aftercare advice were written here, not by the clinic, so they are gone.
    desc: 'A therapeutic full-body or back massage, built on classic Swedish massage.',
    image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=80&w=800',
    content: `Massage therapy is used to help manage a health condition or to enhance wellness. It involves working on the soft tissues of the body.

The most common form of massage in Western countries is Swedish, or classical, massage, and it is the core of most massage training. Built on it, you can have a therapeutic full-body massage or a therapeutic back massage.`,
    techniques: [
      'Swedish (classical) massage strokes'
    ],
    sessionFocus: 'A therapeutic massage of the whole body, or of the back.'
  },
  {
    id: 'thai-oil-massage',
    title: 'Thai Oil Body Massage',
    // The clinic says one thing about this massage: it is tailor-made with a
    // blend of aromatic oils to suit your problem areas. The "sen lines",
    // energy, flexibility and pain claims, the stretching techniques and the
    // aftercare were not the clinic's, so they are gone.
    desc: 'A massage tailor-made with a blend of aromatic oils to suit your problem areas.',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800',
    content: `Thai oil body massage is tailor-made for you, using a blend of aromatic oils chosen to suit the needs of your problem areas.`,
    techniques: [
      'Massage with a blend of aromatic oils', 'Focus on your problem areas'
    ],
    sessionFocus: 'Your problem areas, with a blend of aromatic oils chosen to suit them.'
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
    // The clinic's words: not a deep tissue massage; light, relaxing, long
    // strokes which help circulation; can include your bump; designed to make
    // you feel comfortable and at ease. It never said "safe", never mentioned
    // swelling, oedema or sleep, and described no positioning. Telling pregnant
    // women a massage reduces swelling is a safety risk: sudden swelling can be
    // a sign of pre-eclampsia, which needs a midwife, so the page now says so.
    desc: 'Light, relaxing massage with long, gentle strokes, designed to help you feel comfortable and at ease during pregnancy.',
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=800',
    content: `Pregnancy massage is not a deep tissue massage. It uses light, relaxing, long strokes that help circulation, and can include gentle strokes over your bump.

The massage is designed to help you feel comfortable and at ease. If you have sudden swelling of your face, hands or feet, contact your midwife or GP straight away.`,
    benefits: [
      'Helps circulation', 'Helps you feel comfortable and at ease', 'Light, relaxing strokes'
    ],
    techniques: [
      'Light, long strokes', 'Gentle strokes over the bump (optional)'
    ],
    aftercare: [
      'Hydration and rest', "Follow your midwife's advice", 'Avoid lying flat on your back'
    ],
    sessionFocus: 'Light, relaxing massage during pregnancy.'
  },
  {
    id: 'natural-face-lift',
    title: 'Natural Face Lift Massage',
    desc: 'A relaxing blend of acupressure, facial reflexology and lymphatic drainage that leaves skin feeling refreshed.',
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=800',
    content: `Natural face lift massage is a blend of Ayurvedic massage, acupressure, facial reflexology and lymphatic drainage. It is gentle, non-invasive and deeply relaxing. 

It helps soften the appearance of wrinkles and puffiness, eases tension in the jaw, neck and shoulders, and leaves skin looking and feeling refreshed.`,
    benefits: [
      'Softens the look of wrinkles', 'Reduces puffiness', 'Relieves jaw tension', 
      'Improves muscle tone', 'Skin feels refreshed'
    ],
    techniques: [
      'Acupressure', 'Lymphatic drainage', 'Facial reflexology', 
      'Occipital ridge kneading'
    ],
    aftercare: [
      'Hydration', 'Gentle facial self-massage', 'Minimise caffeine', 
      'Maintain balanced antioxidant diet'
    ],
    sessionFocus: 'Facial relaxation and refreshed-looking skin.'
  },
  {
    id: 'indian-head-massage',
    title: 'Indian Head Massage',
    desc: 'An Ayurvedic massage of the scalp, face, neck and shoulders that relieves head, neck and shoulder tension, and can benefit some people with sinus and headache problems.',
    image: 'https://osteopathyandwellbeing.co.uk/wp-content/uploads/2023/04/Indian-Head-Mass-pic.webp',
    content: `Indian head massage, traditionally known as Champissage, is a holistic therapy that originated in India thousands of years ago as part of Ayurveda. It focuses on the upper body, where we often hold the most tension. 

The treatment involves rhythmic movements and pressure point work on the scalp, face, neck, and shoulders. It relieves head, neck and shoulder tension, improves circulation, and may help some people with sinus and headache problems.`,
    benefits: [
      'Relieves neck & shoulder tension', 'Improves circulation', 'May ease sinus problems', 
      'May ease headaches', 'Deeply relaxing'
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
    // The clinic's words: a massage of the feet and lower legs, invigorating
    // and deeply relaxing, using hands-on massage, stretching and acupressure
    // to stimulate reflex points. The claim that foot reflex points affect the
    // body's organs (the reflexology claim UK advertising rules act on), the
    // wooden stick, "energy lines", sleep claims and aftercare were not the
    // clinic's, so they are gone.
    desc: 'A massage of the feet and lower legs: invigorating and deeply relaxing, using massage, stretching and acupressure on reflex points.',
    image: 'https://osteopathyandwellbeing.co.uk/wp-content/uploads/2018/02/foot.jpg',
    content: `Thai foot massage is a massage of the feet and lower legs. It is both invigorating and deeply relaxing, and involves hands-on massage, stretching and acupressure to stimulate reflex points.`,
    benefits: [
      'Invigorating and deeply relaxing', 'Stimulates reflex points'
    ],
    techniques: [
      'Hands-on massage of the feet and lower legs', 'Stretching', 'Acupressure on reflex points'
    ],
    sessionFocus: 'Relaxation for the feet and lower legs.'
  },
  {
    id: 'hot-stone-massage',
    title: 'Hot Stone Massage',
    desc: 'Luxurious deep relaxation using heated basalt stones to soften muscle tissue and relieve stress.',
    image: 'https://osteopathyandwellbeing.co.uk/wp-content/uploads/2018/02/4590924.jpg',
    content: `Hot stone massage uses smooth, heated basalt stones placed on key points of the body to permeate deep into the muscles. The heat dilates blood vessels, increasing circulation and allowing the therapist to work deeply without needing intense pressure. 

Stones are also used as extensions of the therapist’s hands to perform long, gliding strokes. The combination of heat and massage is deeply relaxing.`,
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
    content: `Sports massage is a specialised form of deep tissue therapy targeting the muscles, tendons, and ligaments involved in athletic performance. It suits anyone from professional athletes to weekend players. 

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
    id: 'acupuncture',
    title: 'Acupuncture',
    desc: 'Western-style medical acupuncture stimulating sensory nerves to produce natural pain-relieving substances.',
    image: 'https://osteopathyandwellbeing.co.uk/wp-content/uploads/2018/03/needles.jpg',
    content: `Traditional Chinese acupuncture is based on the belief that it can restore the flow of Qi, an energy that flows through your body, while western medical acupuncture is evidence-based and is only administered after a full diagnosis. The difference between western and eastern acupuncture is clearly marked. The western model uses anatomy, physiology and current medical models, while the eastern is philosophy based – much more about yin, yang and Qi. 

Acupuncture can be used as a treatment for a wide range of health problems, including back pain, headaches and migraines, it is a traditional Chinese treatment established over 2,000 years ago. However, here at Osteopathy & Wellbeing, we offer Western-style acupuncture.\n\nIf you have a bleeding disorder, such as haemophilia, or are taking anticoagulants (blood-thinning medicines), talk to your GP before you have acupuncture.`,
    // The clinic's page: NICE recommends considering acupuncture for the first
    // three; it is also often used for the other three.
    whoFor: [
      'Chronic (long-term) pain', 'Chronic tension-type headaches', 'Migraines',
      'Joint pain', 'Dental pain', 'Postoperative pain'
    ]
  },
  {
    id: 'hypnotherapy',
    title: 'Hypnotherapy',
    desc: 'Solution-focused therapy mixing psychotherapy and hypnosis to help achieve goals.',
    image: 'https://osteopathyandwellbeing.co.uk/wp-content/uploads/2022/06/combined-hypno.webp',
    content: `Solution-focused hypnotherapy is a forward-looking, talking therapy which mixes psychotherapy and hypnosis to help you make progress towards your goals.

Alexandra works with clients from all walks of life on reducing anxiety, stress and self-limiting beliefs, and has experience with depression, fears and phobias, problem-solving, PTSD, sleep issues, work-related stress, performance at work, exam stress and building confidence.`,
    // The clinic's "How Can I Help?" list, less 'Diabetes' (a founder decision, commit ab052c8: do not restore it).
    whoFor: [
      'Sleep Issues and Insomnia', 'Anxiety', 'IBS – Gut Directed Hypnotherapy',
      'Dental Phobia & Bruxism', 'Weight Management', 'Alcohol Issues',
      'Depression', 'Social Media Anxiety', 'Exam Stress or Performance',
      'Procrastination or Decision Making', 'Fear & Phobias'
    ]
  },
  {
    id: 'footcare',
    title: 'Footcare',
    desc: 'Routine care including corns, hard skin, toenail cutting, and diabetic foot care.',
    image: 'https://osteopathyandwellbeing.co.uk/wp-content/uploads/2018/02/4591974.jpg',
    content: `Our feet are our foundation. We often take them for granted but a problem with the health of our feet can really affect our quality of life. It is important to take care of our feet and address any minor problems early to try and prevent them from developing into more major issues.

Routine foot care is offered including: removal of corns and hard skin, toenail cutting, elderly foot care, diabetic foot care, and treatment for problems such as cracked heels, ingrown toenails, verrucae and fungal skin and nails.\n\nPlease see your GP if you think you may have an infection on your feet or in your toenails, as you may need antibiotics to treat it.`,
    // The clinic's list of the routine foot care it offers.
    whoFor: [
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
    role: 'Principal Osteopath',
    qualifications: 'BSc (Hons) Ost',
    image: 'https://osteopathyandwellbeing.co.uk/wp-content/uploads/2022/03/gm-adrian600-topaz-enhance-6x-faceai-2.webp',
    bio: `Adrian played semi-professional football for Tonbridge Angels and then Tunbridge Wells before a water sports accident in 2001 left him with a serious neck injury. Osteopathy helped him recover, and he began studying it the following year.

He graduated from the European School of Osteopathy in 2007 and worked at clinics in Kent and Sussex before joining the Herne Bay practice as an associate. He bought the business in 2008 and now runs Osteopathy & Wellbeing @CT6, a practice of several disciplines under one roof. Outside the clinic he plays veterans' football and competitive squash.`,
    philosophy: `Adrian has a particular interest in patients with long-standing back and neck problems, and puts together maintenance plans to reduce their symptoms and help them get on with life.`,
    approach: `Treatment starts with a case history and examination. Adrian then combines osteopathy with sports massage or acupuncture where it helps, and agrees a plan with you for the visits that follow.`,
    specialisations: ['Osteopathy', 'Sports Massage', 'Acupuncture', 'Chronic Spinal Patients'],
    services: ['Maintenance Plans', 'Sports Injury Rehabilitation', 'Dry Needling', 'Posture Advice']
  },
  {
    id: 'leon-benning',
    name: 'Leon Benning',
    role: 'Osteopath & Sports Specialist',
    qualifications: 'M.Ost & Pg Dip Sports & Ex Med',
    image: 'https://osteopathyandwellbeing.co.uk/wp-content/uploads/2023/04/Leon-Picture.jpg',
    bio: `Leon qualified from the London School of Osteopathy in 2016 and completed a postgraduate diploma in Sports and Exercise Medicine at the University of South Wales in 2017. He joined the clinic shortly after graduating. He is also a qualified sports massage therapist and practises dry needling.

He provides pitchside medical support to Canterbury Rugby Club and has worked with teams including Middlesex County Rugby Union, Medway Dragons Rugby League, London Rugby League and Herne Bay Football Club.`,
    philosophy: `Leon believes sport and exercise medicine is relevant to everyone, not only competitive athletes: it helps people recover from illness and injury and get back to what they enjoy.`,
    approach: `He combines osteopathy with sports massage, dry needling and exercise advice, and works with you towards getting back to your sport, your work or your everyday routine.`,
    specialisations: ['Sports Medicine', 'Dry Needling', 'Sports Massage'],
    services: ['Sports Injury Assessment', 'Pitchside First Aid', 'Dry Needling Therapy', 'Exercise Prescription']
  },
  {
    id: 'keri-browne',
    name: 'Keri Browne',
    role: 'Massage Therapist',
    image: 'https://osteopathyandwellbeing.co.uk/wp-content/uploads/2025/04/Keri-Picture-1-scaled.jpg',
    bio: `After a long career as a professional vocalist and dancer, Keri retrained as a massage therapist in 2017, starting with Swedish full-body massage. She has since qualified in deep tissue massage, sports massage and remedial back therapy.

Outside work she still sings with local bands and as a solo artist, and does Pilates.`,
    philosophy: `Keri likes to work with the whole person, giving each client an individual treatment that makes a real difference to how they feel.`,
    approach: `Each session is shaped around you: relaxing Swedish massage, deeper tissue work, or sports and remedial massage for a particular problem.`,
    specialisations: ['Swedish Massage', 'Deep Tissue', 'Sports Massage', 'Remedial Back Therapy'],
    services: ['Swedish Massage', 'Deep Tissue Massage', 'Sports Massage', 'Remedial Back Therapy']
  },
  {
    id: 'clare-rogers',
    name: 'Clare Rogers',
    role: 'Foot Care Manager',
    qualifications: 'SMAE Institute',
    image: 'https://osteopathyandwellbeing.co.uk/wp-content/uploads/2022/06/Clare-Rogers.webp',
    bio: `Clare trained at the SMAE Institute in Maidenhead and has offered foot care at the clinic since June 2012.

She treats corns and hard skin, cracked heels, ingrown toenails, verrucae and fungal conditions, cuts toenails, and provides elderly and diabetic foot care. Home visits are available for people who cannot get to the clinic.`,
    philosophy: `Many people reach a point where looking after their own feet becomes difficult, because of mobility or eyesight. Clare believes regular professional care helps people stay mobile and active.`,
    approach: `Clare combines treatment with practical advice, so you can look after your feet between appointments.`,
    specialisations: ['Diabetic Foot Care', 'Corn Removal', 'Elderly Foot Care'],
    services: ['Corn & Hard Skin Removal', 'Diabetic Foot Care', 'Toenail Cutting', 'Home Visits']
  },
  {
    id: 'magdalena-lius-youard',
    name: 'Magdalena Lius-Youard',
    role: 'Acupuncturist',
    qualifications: 'MSc Chinese Herbal Medicine',
    image: 'https://osteopathyandwellbeing.co.uk/wp-content/uploads/2025/04/Magdalena-Pic-1.jpg',
    bio: `Magdalena graduated as an acupuncturist from the University of Westminster in 2002 and has been in full-time practice ever since. As well as her degree in acupuncture, she holds an MSc in Chinese Herbal Medicine.

Originally from Sweden, she moved to London in the late 1990s and to the Kent coast in 2012.`,
    philosophy: `Magdalena practises traditional acupuncture and Chinese herbal medicine, looking at your health as a whole rather than at one symptom in isolation.`,
    approach: `People come to her with a wide range of concerns, including skin conditions, anxiety and low mood, digestive and hormonal problems, fertility and pregnancy, migraines, and muscle and joint pain. She will talk through with you whether acupuncture is suitable.`,
    specialisations: ['Acupuncture', 'Chinese Herbal Medicine'],
    services: ['Traditional Acupuncture', 'Chinese Herbal Medicine Consultation', 'Migraine Management']
  },
  {
    id: 'alexandra-gibson',
    name: 'Alexandra Gibson',
    role: 'Clinical Hypnotherapist',
    qualifications: 'HPD DSFH MNCH(Reg) AFSH CNHC',
    image: 'https://osteopathyandwellbeing.co.uk/wp-content/uploads/2022/06/hypnotherapy-anxiety-insomnia-768x1024.jpg',
    bio: `Alexandra is an NCH-registered clinical hypnotherapist. She holds the Hypnotherapy Practitioner Diploma (HPD) and the Diploma in Solution Focused Hypnotherapy (DSFH), and is a member of the Complementary & Natural Healthcare Council (CNHC) and the Association for Solution Focused Hypnotherapy.

She works with people on reducing anxiety, stress and self-limiting beliefs, and has experience helping with insomnia, low mood, fears and phobias, IBS, work-related stress, exam stress and building confidence.`,
    philosophy: `Alexandra puts her clients at the heart of the process. She is non-judgemental, caring and compassionate.`,
    approach: `She works with you to find solutions that are right for you, helping you make the changes you want to make.`,
    specialisations: ['Solution Focused Hypnotherapy', 'Anxiety & Stress', 'Insomnia', 'IBS'],
    services: ['Solution Focused Hypnotherapy', 'Anxiety & Stress', 'Sleep Problems', 'Confidence']
  }
];

/**
 * Who provides each treatment, matched against a practitioner's role and
 * specialisations as the clinic's own practitioner pages state them.
 *
 * Every treatment page used to show the first two practitioners (the two
 * osteopaths) as its specialists, so the Footcare page named osteopaths
 * rather than Clare and the Hypnotherapy page rather than Alexandra.
 *
 * Keyed by treatment id on purpose, never by the treatment's title: /foot/
 * would put Clare on Thai Foot Massage, and /massage/ would credit people
 * with massages no source says they give. Acupuncture is Adrian ("Osteopathy,
 * Sports Massage & Acupuncture") and Magdalena ("Acupuncturist"); Leon's page
 * names dry needling, not acupuncture. A treatment with no entry here is one
 * where neither site names who gives it, and its page says to ring and ask.
 */
const PROVIDED_BY: Record<string, RegExp> = {
  osteopathy: /osteopath/i,
  'sports-massage': /sports massage/i,
  'swedish-massage': /swedish/i,
  acupuncture: /acupunct/i,
  hypnotherapy: /hypno/i,
  footcare: /foot care/i,
};

export function practitionersFor(treatmentId: string): Practitioner[] {
  const match = PROVIDED_BY[treatmentId];
  if (!match) return [];
  return PRACTITIONERS.filter((p) =>
    [p.role, ...(p.specialisations ?? [])].some((s) => match.test(s))
  );
}

/**
 * Parked, not deleted. Physiotherapy has a page on the clinic's own site but no
 * physiotherapist is named there or here, so it is not offered on this site.
 * To bring it back, move this entry into TREATMENTS and restore the
 * 'Physiotherapy' filter tab in TreatmentsPage.
 */
export const PARKED_TREATMENTS: Treatment[] = [
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
  }
];
