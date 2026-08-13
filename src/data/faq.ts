export interface FaqItem {
  q: string;
  a: string;
  category: 'Getting started' | 'Your appointment' | 'Safety & regulation' | 'Treatments';
}

/**
 * Questions patients actually ask before booking.
 *
 * Written to be accurate about osteopathy generally and about UK regulation.
 * Nothing here states a price, an opening time or a clinical promise, because
 * those are the clinic's to set and must not be invented.
 */
export const FAQS: FaqItem[] = [
  {
    category: 'Getting started',
    q: 'What is osteopathy?',
    a: 'Osteopathy is a form of manual healthcare that focuses on how the bones, muscles, ligaments and connective tissue work together. Rather than treating a painful spot in isolation, an osteopath assesses how the whole structure is moving and loading, then uses hands-on techniques — stretching, articulation, soft tissue work and joint mobilisation — alongside advice on movement and posture.',
  },
  {
    category: 'Getting started',
    q: 'Do I need a referral from my GP to see an osteopath?',
    a: 'No. In the UK you can book an osteopath directly without a GP referral. If your care is being funded through private medical insurance, your insurer may still require a referral before they will authorise treatment, so it is worth checking your policy first.',
  },
  {
    category: 'Getting started',
    q: 'What kinds of problems do people come in with?',
    a: 'Most commonly back and neck pain, joint pain, sciatica-type symptoms, sports and overuse injuries, postural strain from desk work, headaches associated with neck tension, and stiffness that limits everyday movement. If your symptoms suggest something outside the scope of osteopathic care, you should be told so and directed to the right professional.',
  },
  {
    category: 'Your appointment',
    q: 'What happens at a first appointment?',
    a: 'A first appointment usually begins with a detailed case history: what the problem is, how it started, what makes it better or worse, and your general health and medical background. That is followed by a physical examination — watching how you move, testing ranges of motion, and assessing the affected area. You should then receive an explanation of what has been found and a proposed plan before any treatment begins.',
  },
  {
    category: 'Your appointment',
    q: 'What should I wear?',
    a: 'Comfortable clothing you can move in is ideal. Osteopaths need to see and assess how the area moves, so you may be asked to remove some outer clothing. You are entitled to ask for a chaperone, to bring someone with you, or to wear shorts and a vest top instead — just say so when you arrive or when booking.',
  },
  {
    category: 'Your appointment',
    q: 'Will treatment hurt?',
    a: 'Osteopathic treatment should not be an ordeal. Some techniques applied to tight or inflamed tissue can be briefly uncomfortable, and it is common to feel mild soreness for a day or so afterwards, much like after unfamiliar exercise. Tell your osteopath at any point if something is too much — treatment can be adapted, and consent can be withdrawn at any time.',
  },
  {
    category: 'Your appointment',
    q: 'How many sessions will I need?',
    a: 'It depends on the problem, how long it has been present, and what else is going on in your health and daily life. A recent, straightforward strain may settle in a small number of sessions; a long-standing or recurring problem usually takes longer and involves work you do between appointments. You should be given an honest indication after your first assessment, and a reason if that estimate changes.',
  },
  {
    category: 'Safety & regulation',
    q: 'Are osteopaths regulated?',
    a: 'Yes. In the UK, osteopathy is regulated by law. The General Osteopathic Council (GOsC) maintains the statutory register, and it is a criminal offence to call yourself an osteopath without being registered with them. Registered osteopaths must hold a recognised qualification, carry professional indemnity insurance, and meet continuing professional development requirements. You can check any osteopath on the GOsC register.',
  },
  {
    category: 'Safety & regulation',
    q: 'When should I seek urgent medical help instead of booking?',
    a: 'Some symptoms need emergency assessment rather than an osteopathy appointment. Go to A&E or call 999 if you experience loss of bladder or bowel control, numbness around the saddle area between the legs, sudden severe weakness in the legs, or back pain alongside a high fever, unexplained weight loss, or after a significant injury. These are rare, but they are urgent.',
  },
  {
    category: 'Safety & regulation',
    q: 'Can I have treatment while pregnant?',
    a: 'Many people seek manual therapy during and after pregnancy for back, pelvic and postural discomfort. Techniques and positioning are adapted accordingly. Tell your osteopath that you are pregnant, and how far along, when booking and at the start of your appointment so your care can be adjusted.',
  },
  {
    category: 'Safety & regulation',
    q: 'Is my health information kept private?',
    a: 'Clinical records are confidential and handled in line with UK data protection law. You have the right to ask what is held about you and to request a copy. Information is not shared with anyone outside your care — including your GP — without your consent, other than in the rare circumstances where the law requires it.',
  },
  {
    category: 'Treatments',
    q: 'What is the difference between osteopathy, physiotherapy and sports massage?',
    a: 'There is genuine overlap, and a good practitioner in any of them will refer on when someone else is better placed to help. Broadly: osteopathy assesses how the whole structure moves and loads; physiotherapy leans towards rehabilitation and graded exercise to restore function; sports and therapeutic massage works directly on soft tissue for tension, recovery and mobility. Which suits you depends on your problem, not on which is better.',
  },
  {
    category: 'Treatments',
    q: 'Can I claim treatment on private health insurance?',
    a: 'Many UK insurers cover osteopathy, though the level of cover, whether a referral is needed, and which practitioners are recognised all vary by policy. Check with your insurer before your first appointment, and ask the clinic what documentation they can provide for a claim.',
  },
  {
    category: 'Treatments',
    q: 'What can I do between appointments to help?',
    a: 'Usually more than you would think. Keeping moving within comfortable limits, any specific exercises you have been given, sleep, and adjusting the daily habits that provoke the problem — a desk setup, a lifting technique, a training load — tend to matter as much as the treatment itself. If an exercise makes things worse rather than easier, stop and report it rather than pushing through.',
  },
];
