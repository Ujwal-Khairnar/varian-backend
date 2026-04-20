require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

const CHALLENGES = [
  { icon: 'data',       label: 'CHALLENGE', text: "Our clinic's data is scattered, unstructured and decentralised", sort_order: 0 },
  { icon: 'capacity',   label: 'CHALLENGE', text: 'Inadequate capacity to meet the increasing patient load', sort_order: 1 },
  { icon: 'continuity', label: 'CHALLENGE', text: 'Inadequate continuity of care', sort_order: 2 },
  { icon: 'growth',     label: 'CHALLENGE', text: "We need to grow our current operation to meet increasing demands but don't know where to start", sort_order: 3 },
  { icon: 'pathway',    label: 'CHALLENGE', text: 'Our patient pathway is over-complicated', sort_order: 4 },
  { icon: 'quality',    label: 'CHALLENGE', text: 'We struggle to maintain consistent quality across our departments', sort_order: 5 },
  { icon: 'reporting',  label: 'CHALLENGE', text: 'Reporting and compliance takes too much manual effort', sort_order: 6 },
];

const ROOT_CAUSES = {
  data:       ['Manual data entry', 'Lack of access to all the data needed', 'Unfamiliarity with using data-driven oncology specific insights to guide clinical and business goals', 'Missing data due to minimal interfacing capabilities from disparate systems'],
  capacity:   ['Inefficient scheduling processes', 'Lack of automated workflows', 'Manual administrative tasks consuming clinical time', 'Poor resource utilization visibility'],
  continuity: ['Disconnected patient information across systems', 'Poor care pathway standardization', 'Lack of patient engagement tools', 'Incomplete clinical documentation'],
  growth:     ['No clear operational performance baseline', 'Lack of scalable infrastructure', 'Limited data-driven decision making', 'Inefficient existing workflows blocking growth'],
  pathway:    ['Too many manual handoffs between teams', 'Lack of standardized care protocols', 'Poor visibility of patient journey status', 'Redundant documentation steps'],
  quality:    ['No standardized treatment protocols', 'Inconsistent data entry practices', 'Limited quality metrics visibility', 'Accreditation preparation challenges'],
  reporting:  ['Data spread across multiple disconnected systems', 'No automated reporting workflows', 'Manual data extraction and reconciliation', 'Lack of pre-built analytics models'],
};

const CHALLENGE_SOLUTIONS = {
  data:       ['aria-core', 'insightive-gen2', 'interoperability-services', 'oars', 'database-consolidation'],
  capacity:   ['aria-core', 'aria-core-mobile', 'insightive-gen2', 'workflow-optimization', 'pre-designed-configuration'],
  continuity: ['aria-core', 'aria-core-mobile', 'noona', 'eclipse', 'workflow-optimization'],
  growth:     ['insightive-gen2', 'oars', 'pre-designed-configuration', 'database-consolidation', 'workflow-optimization'],
  pathway:    ['aria-core', 'eclipse', 'noona', 'workflow-optimization', 'pre-designed-configuration'],
  quality:    ['eclipse', 'aria-core', 'insightive-gen2', 'oars', 'interoperability-services'],
  reporting:  ['insightive-gen2', 'oars', 'interoperability-services', 'aria-core', 'database-consolidation'],
};

// ── LOCATIONS with full rich data ─────────────────────────────────────────────
// image_url      = small card thumbnail (shown in globe pin popup)
// hero_image_url = large banner image (shown in detail page)
// Replace the S3 URLs below with your actual uploaded image URLs after uploading to S3
// Until you upload to S3, Unsplash URLs are used as fallback

const LOCATIONS = [
  {
    name:              'Beatson West of Scotland Cancer Centre, UK',
    lat:               55.37,
    lng:               -3.43,
    image_url:         'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&q=80',
    hero_image_url:    'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=1200&q=90',
    stat:              'Standardized and improved',
    stat_desc:         'Patient Care',
    story_title:       'Transforming oncology workflows at Beatson',
    partnership_years: 7,
    sort_order:        0,
    challenges: [
      'Manual data entry across multiple disconnected systems',
      'Inconsistent care pathways between departments',
      'Limited visibility into treatment outcomes across the network',
    ],
    valueAdds: [
      'Implemented ARIA CORE across all oncology departments',
      'Standardised care pathways reducing clinical variation by 40%',
      'Real-time dashboards giving clinical leadership instant visibility',
    ],
    testimonial: {
      quote:       'ARIA CORE transformed how we manage patient data. The integration between departments is seamless and our staff now spend more time on patient care.',
      person_name: 'Beatson Cancer Centre',
      person_role: 'Clinical Director',
    },
  },
  {
    name:              'Institut Curie, Paris, France',
    lat:               48.85,
    lng:               2.35,
    image_url:         'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&q=80',
    hero_image_url:    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&q=90',
    stat:              '214 fields',
    stat_desc:         'no longer need completion',
    story_title:       'Eliminating 214 manual data fields at Institut Curie',
    partnership_years: 5,
    sort_order:        1,
    challenges: [
      'Over 214 fields requiring manual data entry per patient encounter',
      'Data silos between radiology and oncology teams',
      'Reporting taking up to 3 days to compile from disparate systems',
    ],
    valueAdds: [
      '214 manual data fields eliminated through automated data capture',
      'Full EMR integration with existing hospital systems',
      'Same-day reporting replacing a 3-day manual process',
    ],
    testimonial: {
      quote:       'The reduction in manual data entry has been remarkable. Our clinical staff can now focus entirely on patient care rather than paperwork.',
      person_name: 'Institut Curie',
      person_role: 'Head of Medical Informatics',
    },
  },
  {
    name:              'Charité – Universitätsmedizin Berlin, Germany',
    lat:               52.52,
    lng:               13.40,
    image_url:         'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400&q=80',
    hero_image_url:    'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1200&q=90',
    stat:              '176 fields',
    stat_desc:         'no longer need completion',
    story_title:       'Streamlining 176 data fields at Charité Berlin',
    partnership_years: 6,
    sort_order:        2,
    challenges: [
      '176 redundant data fields consuming clinical time every day',
      'Complex multi-campus coordination with inconsistent workflows',
      'Compliance reporting requiring excessive manual effort',
    ],
    valueAdds: [
      '176 data fields automated through system integration',
      'Multi-site workflow standardisation across all Charité campuses',
      'Automated compliance reporting saving 20+ staff hours per week',
    ],
    testimonial: {
      quote:       'Working with Varian has allowed us to focus on what matters most — our patients. The workflow improvements have been transformational for our entire organisation.',
      person_name: 'Charité Berlin',
      person_role: 'Department Head, Radiation Oncology',
    },
  },
  {
    name:              'Karolinska University Hospital, Stockholm',
    lat:               59.32,
    lng:               18.06,
    image_url:         'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=400&q=80',
    hero_image_url:    'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=1200&q=90',
    stat:              '143 fields',
    stat_desc:         'no longer need completion',
    story_title:       'Long term partnership: A new era starts at NKS',
    partnership_years: 9,
    sort_order:        3,
    challenges: [
      'Disconnected patient information across clinical systems',
      'Manual handoffs between radiotherapy and oncology teams',
      'Limited patient engagement and monitoring between clinic visits',
    ],
    valueAdds: [
      'Monthly meetings of Varian team with decision-making committee to find solution together and collect relative data from different systems in ARI',
      'Challenge status quo and foster new technology adoption — Workflow Optimisation: offline adaptive, workflow implementation and InSightive support',
      'Modality-specific needs planning on a regular basis, with on-site meetings between Varian AOS team and NKS',
    ],
    testimonial: {
      quote:       'Five years ago, we started to work with Advanced Oncology Solutions as a part of a multiyear project and the first project was to get our external radiotherapy department paperless. We have worked with an AOS implementation specialist from day 1 and have clinical solutions [the AOS implementation specialists] involved in monthly management meeting to advise on clinical workflow and have ongoing bigger projects.',
      person_name: 'NKS',
      person_role: 'Head of Physics',
    },
  },
  {
    name:              'Landspítali University Hospital, Iceland',
    lat:               64.96,
    lng:               -19.02,
    image_url:         'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&q=80',
    hero_image_url:    'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1200&q=90',
    stat:              '135 fields',
    stat_desc:         'no longer need completion',
    story_title:       'Building oncology excellence in Iceland',
    partnership_years: 4,
    sort_order:        4,
    challenges: [
      'No centralised oncology information system — all data siloed',
      'Manual scheduling causing capacity bottlenecks across departments',
      'Patient outcomes not systematically tracked or analysed',
    ],
    valueAdds: [
      'Full ARIA CORE deployment as first dedicated oncology information system',
      'Automated scheduling reducing patient wait times by 30%',
      'Systematic outcome tracking enabling data-driven treatment decisions',
    ],
    testimonial: {
      quote:       'Implementing ARIA CORE was a major step forward for oncology care in Iceland. We now have the digital infrastructure to deliver world-class cancer treatment.',
      person_name: 'Landspítali University Hospital',
      person_role: 'Chief Medical Officer',
    },
  },
];

// ── CHALLENGE CARD IMAGES ──────────────────────────────────────────────────────
// These are background/illustration images shown on each challenge card
// Replace S3 URLs after uploading your own images to S3
// Format: { icon: 'challenge_icon', image_url: 'url', alt_text: 'description' }

const CHALLENGE_IMAGES = [
  {
    icon:      'data',
    image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
    alt_text:  'Data analytics and clinical information systems',
  },
  {
    icon:      'capacity',
    image_url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80',
    alt_text:  'Hospital capacity and patient load management',
  },
  {
    icon:      'continuity',
    image_url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80',
    alt_text:  'Continuity of patient care across departments',
  },
  {
    icon:      'growth',
    image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80',
    alt_text:  'Clinical operational growth and expansion',
  },
  {
    icon:      'pathway',
    image_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80',
    alt_text:  'Patient care pathway optimisation',
  },
  {
    icon:      'quality',
    image_url: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=600&q=80',
    alt_text:  'Clinical quality and consistency management',
  },
  {
    icon:      'reporting',
    image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
    alt_text:  'Clinical reporting and compliance automation',
  },
];

const SOLUTION_META = [
  { id: 'aria-core',                name: 'ARIA CORE',                 subtitle: 'Comprehensive oncology information system',               is_aos: 0, icon: 'aria-core',        sort_order: 0 },
  { id: 'aria-core-mobile',         name: 'ARIA CORE Mobile',          subtitle: 'Mobile access to ARIA CORE functionality',               is_aos: 0, icon: 'aria-core-mobile', sort_order: 1 },
  { id: 'database-consolidation',   name: 'Database Consolidation',    subtitle: 'Consolidate Processes between Multiple Databases',       is_aos: 1, icon: 'aos',              sort_order: 2 },
  { id: 'eclipse',                  name: 'Eclipse',                   subtitle: 'Advanced treatment planning system',                    is_aos: 0, icon: 'eclipse',           sort_order: 3 },
  { id: 'insightive-gen2',          name: 'InSightive Gen2',           subtitle: 'Next-generation oncology analytics platform',            is_aos: 0, icon: 'insightive',       sort_order: 4 },
  { id: 'interoperability-services',name: 'Interoperability Services', subtitle: 'Interface workflow development and customization',       is_aos: 1, icon: 'aos',              sort_order: 5 },
  { id: 'noona',                    name: 'Noona',                     subtitle: 'Patient engagement and remote monitoring platform',      is_aos: 0, icon: 'noona',            sort_order: 6 },
  { id: 'oars',                     name: 'OARS',                      subtitle: 'Empowering you to leverage existing data and tools',     is_aos: 1, icon: 'aos',              sort_order: 7, left_label: 'Benefits', right_label: "What's Included" },
  { id: 'pre-designed-configuration',name:'Pre-Designed Configuration',subtitle: 'Establish Efficient Workflows for New ARIA Installations',is_aos: 1, icon: 'aos',             sort_order: 8 },
  { id: 'workflow-optimization',    name: 'Workflow Optimization',     subtitle: 'Establish efficient workflows for existing ARIA sites',  is_aos: 1, icon: 'aos',              sort_order: 9 },
];

const FEATURE_SOLUTIONS = [
  {
    solutionId: 'aria-core',
    features: [
      {
        label: 'Interoperability', heading: 'Seamless System Integration',
        body: 'ARIA CORE connects effortlessly with your existing hospital infrastructure, enabling bidirectional data exchange across EMR, LIS, RIS, and scheduling systems — reducing manual entry and ensuring data integrity.',
        bullets: ['HL7 and FHIR-compliant interface engine', 'Bidirectional EMR integration (Epic, Cerner, and more)', 'Real-time data synchronisation across departments', 'Automated order import and result export', 'Configurable interface mapping and routing rules'],
      },
      {
        label: 'Dynamic Documents', heading: 'Intelligent Document Generation',
        body: 'Create, manage, and distribute clinical documents automatically based on care events, patient demographics, and treatment milestones — eliminating manual paperwork and standardising documentation.',
        bullets: ['Auto-generated treatment summaries and letters', 'Template-based document builder with merge fields', 'Electronic signature and approval workflows', 'Multi-language document support', 'Version control and audit trail for all documents'],
      },
      {
        label: 'Questionnaires', heading: 'Patient-Reported Outcomes Collection',
        body: 'Digitise the intake and follow-up experience with configurable questionnaires that capture patient-reported outcomes, symptoms, and quality-of-life data at every stage of the care journey.',
        bullets: ['Configurable PRO and symptom questionnaires', 'Automated triggers based on care path milestones', 'Patient-facing portal and tablet delivery', 'Validated tools: FACT-G, EQ-5D, PHQ-9, and more', 'Real-time scoring and clinical alert thresholds'],
      },
      {
        label: 'Care Path Templates', heading: 'Standardised Care Pathway Management',
        body: 'Define, deploy, and monitor evidence-based care pathways across your department. Ensure every patient receives consistent, protocol-driven care.',
        bullets: ['Drag-and-drop care path template builder', 'Task assignment, due dates, and escalation rules', 'Deviation tracking and variance reporting', 'Multi-disciplinary team collaboration tools', 'Real-time pathway progress dashboards'],
      },
      {
        label: 'Encounters Workspace', heading: 'Unified Clinical Encounter Management',
        body: 'A single, consolidated workspace that gives clinicians everything they need during patient encounters — from history and imaging links to order entry and documentation.',
        bullets: ['Consolidated patient timeline and visit history', 'In-context order entry and clinical decision support', 'Integrated imaging viewer with DICOM support', 'Encounter note templates and free-text dictation', 'Role-based workspace customisation per clinician'],
      },
      {
        label: 'Scheduling', heading: 'Advanced Appointment & Resource Scheduling',
        body: 'Optimise clinic throughput with an intelligent scheduling engine that manages appointments, resources, equipment, and staff across your entire oncology service.',
        bullets: ['Multi-resource scheduling: rooms, equipment, staff', 'Conflict detection and intelligent slot suggestions', 'Patient and provider appointment notifications', 'Waitlist management and cancellation fill logic', 'Scheduling analytics and capacity reporting'],
      },
      {
        label: 'Activity Capture', heading: 'Automated Clinical Activity & Billing Capture',
        body: 'Ensure no billable activity is missed with intelligent, automated capture of clinical services, procedures, and encounters — reducing revenue leakage and administrative burden.',
        bullets: ['Real-time activity capture linked to clinical events', 'Configurable charge codes and billing rules', 'Reconciliation dashboards for finance teams', 'Integration with hospital billing systems', 'Audit-ready activity logs per patient and provider'],
      },
      {
        label: 'Treatment Summary', heading: 'Automated End-of-Treatment Summaries',
        body: 'Generate comprehensive, customisable treatment summaries at the conclusion of care — providing patients, GPs, and referring physicians with a clear record.',
        bullets: ['Auto-populated from ARIA CORE treatment data', 'Configurable templates per tumour stream or site', 'One-click electronic delivery to referring providers', 'Patient-friendly language summary option', 'Regulatory and accreditation compliance support'],
      },
    ],
  },
  {
    solutionId: 'aria-core-mobile',
    features: [
      {
        label: 'Patient Information', heading: 'Full Patient Record at Your Fingertips',
        body: 'Access the complete patient chart from your smartphone or tablet — demographics, diagnoses, treatment history, and upcoming appointments.',
        bullets: ['Complete patient demographics and clinical history', 'Real-time synchronisation with ARIA CORE', 'Secure biometric login (Face ID / fingerprint)', 'Offline access to recently viewed patient records', 'Role-based record access controls'],
      },
      {
        label: 'Test Results', heading: 'Instant Access to Lab & Diagnostic Results',
        body: 'Receive, review, and act on lab results, pathology reports, and diagnostic findings the moment they are available.',
        bullets: ['Push notifications for critical and abnormal results', 'Full lab history with trend graphs', 'Pathology and radiology report viewer', 'Result acknowledgment and sign-off on mobile', 'Direct messaging to ordering team from result view'],
      },
      {
        label: 'Provider Schedule', heading: 'Real-Time Provider Schedule Management',
        body: 'View and manage your daily schedule from your mobile device — see appointments, review patient details before each encounter, and receive real-time updates.',
        bullets: ['Day, week, and clinic-session schedule views', 'Patient pre-read: diagnosis, last visit, active issues', 'Late arrival and cancellation push alerts', 'Direct link from schedule to patient record', 'Multi-provider schedule view for team leaders'],
      },
      {
        label: 'Notes Dictation', heading: 'Voice-to-Text Clinical Note Dictation',
        body: 'Dictate clinical notes hands-free using built-in speech recognition — saving time on documentation and allowing clinicians to capture detailed encounter notes immediately.',
        bullets: ['Medical vocabulary-optimised speech recognition', 'Dictate into any ARIA CORE note field', 'Auto-formatting of punctuation and paragraphs', 'Review and edit transcription before saving', 'Supports multiple languages and accents'],
      },
      {
        label: 'Photos', heading: 'Clinical Photo Capture & Management',
        body: 'Capture, annotate, and attach clinical photographs directly to patient records from your mobile device — supporting wound care, skin toxicity assessment, and visual treatment response monitoring.',
        bullets: ['In-app camera with automatic patient association', 'Annotation tools: arrows, measurements, text', 'Before/after comparison views over time', 'Photos stored securely in ARIA CORE record', 'HIPAA and GDPR-compliant image handling'],
      },
    ],
  },
  {
    solutionId: 'eclipse',
    features: [
      {
        label: 'RapidPlan', heading: 'Knowledge-Based Treatment Planning',
        body: 'RapidPlan uses machine learning trained on your best historical plans to automatically generate high-quality DVH predictions and optimised treatment plans.',
        bullets: ['AI-powered DVH prediction from institutional models', 'Automated plan optimisation guided by predictions', 'Site-specific model training on your best plans', 'Significant reduction in planning time per case', 'Continuous model improvement as new plans are added'],
      },
      {
        label: 'Plan Evaluation', heading: 'Comprehensive Dose Plan Evaluation',
        body: 'Evaluate treatment plans against DVH criteria, institutional protocols, and evidence-based dose constraints — ensuring every plan meets clinical standards before it reaches the treatment machine.',
        bullets: ['DVH-based plan evaluation against protocol goals', 'Automated scoring against ICRU and institutional criteria', 'Side-by-side plan comparison tools', 'Plan normalisation and dose scaling utilities', 'Evaluation reports exportable for peer review'],
      },
      {
        label: 'Standardize Protocols', heading: 'Department-Wide Protocol Standardisation',
        body: 'Define and enforce consistent treatment planning protocols across your department — ensuring every planner follows the same dose objectives, beam arrangements, and approval workflows.',
        bullets: ['Centralised protocol library with version control', 'Protocol-based plan template generation', 'Mandatory constraint checking before plan approval', 'Deviation flagging with clinical justification capture', 'Protocol compliance reporting for audit purposes'],
      },
      {
        label: 'ESAPI', heading: 'Automate & Extend Eclipse with Custom Scripts',
        body: 'The Eclipse Scripting API enables your physics and informatics teams to build custom automation, quality assurance tools, and workflow integrations.',
        bullets: ['Python and C# scripting support', 'Automate plan checks and QA workflows', 'Custom dose reporting and plan comparison scripts', 'Integration with third-party treatment planning tools', 'Community script library and Varian developer support'],
      },
      {
        label: 'Quicklinks', heading: 'Fast Access to Frequently Used Functions',
        body: 'Quicklinks give Eclipse users a customisable shortcut bar that puts the most-used functions, tools, and workflows at their fingertips.',
        bullets: ['User-configurable shortcut toolbar', 'One-click access to common plan functions', 'Department-level default configuration', 'Context-sensitive links that adapt to current task', 'Reduces average navigation time by up to 40%'],
      },
    ],
  },
  {
    solutionId: 'insightive-gen2',
    features: [
      {
        label: 'KPIs', heading: 'Key Performance Indicator Dashboards',
        body: 'Monitor the metrics that matter most to your department — from treatment start times and machine utilisation to patient wait times and staff productivity.',
        bullets: ['30+ pre-built oncology-specific KPIs', 'Configurable targets and traffic-light indicators', 'Real-time and daily KPI snapshots', 'Drill-down from KPI to individual patient or event', 'Automated KPI reports distributed to leadership'],
      },
      {
        label: 'Dashboards', heading: 'Configurable Operational Dashboards',
        body: 'Build and share custom dashboards tailored to every role in your organisation — from the clinical team monitoring daily throughput to the executive team tracking strategic performance metrics.',
        bullets: ['Drag-and-drop dashboard builder', 'Role-based default dashboard configurations', '30+ chart types: bar, line, scatter, heat map, funnel', 'Live data refresh with configurable intervals', 'Shareable dashboard links and scheduled PDF exports'],
      },
      {
        label: 'Activity Analysis', heading: 'Deep Departmental Activity Analytics',
        body: 'Understand exactly how your department is performing with granular activity analysis across appointments, treatments, procedures, and staff.',
        bullets: ['Real-time and historical activity dashboards', 'Breakdown by site, modality, provider, and tumour stream', 'Trend analysis with week-on-week comparisons', 'Scheduled activity vs. actual completion tracking', 'Export-ready reports for management reporting'],
      },
      {
        label: 'Toxicity Timeline', heading: 'Patient Toxicity Tracking Over Time',
        body: 'Visualise the complete toxicity profile for individual patients and cohorts — identifying patterns in adverse events and correlating them with treatment parameters.',
        bullets: ['CTCAE-graded toxicity timeline per patient', 'Cohort-level toxicity heat maps', 'Correlation analysis: toxicity vs. dose and fractionation', 'Automated alerts for grade 3+ toxicity patterns', 'Toxicity data feeds into multi-site benchmarking'],
      },
      {
        label: 'Data Quality Analysis', heading: 'Proactive Data Quality Management',
        body: 'Identify and resolve data quality issues before they impact reporting, billing, or clinical decisions — with automated completeness checks and validation alerts.',
        bullets: ['Automated completeness checks across key data fields', 'Configurable validation rules per data type', 'Data quality scorecards by site and department', 'Actionable worklists for data remediation teams', 'Trend tracking to measure data quality improvement'],
      },
      {
        label: 'Pre-connected DaaS Models', heading: 'Ready-to-Use Data-as-a-Service Analytics Models',
        body: 'Jump-start your analytics programme with pre-built, clinically validated models that connect directly to your ARIA data.',
        bullets: ['15+ pre-built oncology analytics models', 'Zero configuration required — plug-and-play deployment', 'Referral management and conversion tracking', 'Patient volume and capacity forecasting models', 'Resource utilisation and time management models'],
      },
    ],
  },
  {
    solutionId: 'noona',
    features: [
      {
        label: 'Symptom Management', heading: 'Remote Symptom Tracking & Clinical Alerts',
        body: 'Continuously monitor patient-reported symptoms between clinic visits using validated PRO tools — automatically alerting care teams when symptom scores reach clinical intervention thresholds.',
        bullets: ['Daily symptom check-ins via app or SMS', 'CTCAE and PROMS-based symptom questionnaires', 'Automated care team alerts for high-grade symptoms', 'Symptom trend graphs for clinical review', 'Integration with ARIA CORE for longitudinal records'],
      },
      {
        label: 'Secure Messaging', heading: 'HIPAA-Compliant Patient-Provider Messaging',
        body: 'Enable safe, two-way communication between patients and care teams through secure messaging — reducing unnecessary phone calls while keeping patients connected.',
        bullets: ['End-to-end encrypted patient-provider messaging', 'Threaded conversations by clinical topic', 'Care team group messaging for coordinated responses', 'Read receipts and response time tracking', 'Automated out-of-hours message routing'],
      },
      {
        label: 'Patient Appointments', heading: 'Online Appointment Booking & Reminders',
        body: 'Empower patients to manage their own appointments through a secure, easy-to-use patient portal — reducing no-shows and freeing up administrative staff.',
        bullets: ['24/7 online appointment booking and cancellation', 'Automated SMS and email appointment reminders', 'Pre-appointment preparation instructions', 'Integrated with ARIA CORE scheduling', 'Appointment history and upcoming visit summary'],
      },
      {
        label: 'Patient Education', heading: 'Personalised Patient Education Content',
        body: 'Deliver the right educational content to the right patient at the right time — automatically triggered by diagnosis, treatment phase, or care path milestone.',
        bullets: ['Library of 200+ oncology education articles and videos', 'Automated delivery based on care path triggers', 'Multi-language content support', 'Patient comprehension tracking and quiz tools', 'Customisable content for your institution'],
      },
      {
        label: 'Results', heading: 'Patient Lab & Test Result Delivery',
        body: 'Give patients timely, secure access to their test results through the Noona app — paired with clear explanations and the ability to message their care team with questions.',
        bullets: ['Secure result release with configurable hold periods', 'Plain-language result explanations for patients', 'Abnormal result alerts with care team notification', 'Historical result trends visible to patients', 'One-tap secure messaging from the result view'],
      },
      {
        label: 'Interfacing', heading: 'EHR & System Integration',
        body: 'Noona integrates seamlessly with ARIA CORE and major EHR systems — ensuring patient data flows automatically between clinical and patient-facing platforms.',
        bullets: ['Native ARIA CORE bidirectional integration', 'Epic, Cerner, and other EHR connectivity', 'HL7 FHIR API for custom integrations', 'Automated PRO data import to ARIA CORE', 'Single patient identity across all connected systems'],
      },
    ],
  },
];

const AOS_SOLUTIONS = [
  {
    id: 'database-consolidation',
    deliverables: [
      'Assess and review current workflow at each of the sites',
      'Document workflows and modifications to help ensure best practice implementation',
      'Modify main ARIA database configuration, including interface configuration',
      'Physicist assistance and guidance in transferring beam data and treatment plans',
      'Change management processes for clinical and IT teams',
    ],
    useCases: [
      'Existing ARIA site that needs workflow assistance in all areas of the application',
      'Existing ARIA sites with new providers or management looking to adopt new processes',
    ],
  },
  {
    id: 'interoperability-services',
    deliverables: [
      'Customized interface and best practice recommendations',
      'Varian testing scripts for specified interfaces',
      'Working alongside physicians for built-in department advocate',
      'Optimize efficiency between systems',
      'Go-live and post go-live support and issue resolution',
    ],
    useCases: [
      'New interfaces being installed on an existing ARIA database',
      'Existing ARIA sites looking to reduce manual entry by modifying existing interfaces',
    ],
  },
  {
    id: 'oars',
    deliverables: [
      'Translating your data into actionable insights while you focus on quality patient care',
      'Improving and evolving your team understanding of your data ecosystem',
      'Aligning data and analytics strategies with business outcomes',
      'Educating your staff on evolved data input strategies to achieve desired data output',
      'Guidance on queries, problem solving, and ability to translate data',
    ],
    useCases: [
      'Customized solution for your data needs',
      'Includes ongoing analytics support with 6 months to multi-year options',
      'Services will primarily be provided remotely',
    ],
  },
  {
    id: 'pre-designed-configuration',
    deliverables: [
      'Assess and review current workflow if using existing oncology information system',
      'Identify clinical goals and requirements',
      'Document workflows and modifications to help ensure best practice implementation',
      'Buildout ARIA database configuration combining clinical needs and standard processes',
      'Consultant participation in change management processes for clinical and IT teams',
    ],
    useCases: [
      'New ARIA Database',
      'New facility opening with a fresh ARIA installation',
      'Clinics converting from a 3rd party OIS to ARIA',
      'Sites replacing their existing ARIA database following a change in ownership',
    ],
  },
  {
    id: 'workflow-optimization',
    deliverables: [
      'Identify clinical goals and requirements',
      'Document workflows and modifications to help ensure best practice implementation',
      'Modify ARIA database configuration combining clinical needs and standard processes',
      'Consultant participation in change management processes for clinical and IT teams',
      'Go-live and post go-live support to help ensure proper workflow adoption',
    ],
    useCases: [
      'Existing customer combining two ARIA databases into one',
      'Existing ARIA customer joining an existing ARIA database',
      'Existing ARIA customer that is expanding and working in the existing ARIA database',
    ],
  },
];

// ── Seed function ─────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Seeding database...');
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Admin user
    const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@1234', 12);
    await conn.query(
      `INSERT IGNORE INTO users (id,email,password,name,role) VALUES (?,?,?,?,?)`,
      [uuidv4(), process.env.ADMIN_EMAIL || 'admin@varian.com', hashed, 'Admin', 'admin']
    );

    // 2. Challenges + root causes
    const challengeIdMap = {};
    for (const ch of CHALLENGES) {
      await conn.query(
        `INSERT INTO challenges (icon,label,text,sort_order)
         VALUES (?,?,?,?)
         ON DUPLICATE KEY UPDATE text=VALUES(text), sort_order=VALUES(sort_order)`,
        [ch.icon, ch.label, ch.text, ch.sort_order]
      );
      const [[row]] = await conn.query(`SELECT id FROM challenges WHERE icon = ?`, [ch.icon]);
      challengeIdMap[ch.icon] = row.id;

      await conn.query(`DELETE FROM root_causes WHERE challenge_id = ?`, [row.id]);
      for (let i = 0; i < ROOT_CAUSES[ch.icon].length; i++) {
        await conn.query(
          `INSERT INTO root_causes (challenge_id, cause_text, sort_order) VALUES (?,?,?)`,
          [row.id, ROOT_CAUSES[ch.icon][i], i]
        );
      }
    }

    // 3. Challenge card images
    console.log('  → Seeding challenge images...');
    for (const ci of CHALLENGE_IMAGES) {
      const challengeId = challengeIdMap[ci.icon];
      if (!challengeId) continue;

      // Check if table exists before inserting
      const [[tableCheck]] = await conn.query(
        `SELECT COUNT(*) AS cnt FROM information_schema.tables
         WHERE table_schema = DATABASE() AND table_name = 'challenge_images'`
      );

      if (tableCheck.cnt > 0) {
        await conn.query(
          `DELETE FROM challenge_images WHERE challenge_id = ?`, [challengeId]
        );
        await conn.query(
          `INSERT INTO challenge_images (challenge_id, image_url, alt_text) VALUES (?,?,?)`,
          [challengeId, ci.image_url, ci.alt_text]
        );
      }
    }

    // 4. Solutions
    for (const sol of SOLUTION_META) {
      await conn.query(
        `INSERT INTO solutions (id,name,subtitle,is_aos,icon,left_label,right_label,sort_order)
         VALUES (?,?,?,?,?,?,?,?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), subtitle=VALUES(subtitle), sort_order=VALUES(sort_order)`,
        [sol.id, sol.name, sol.subtitle, sol.is_aos, sol.icon, sol.left_label||null, sol.right_label||null, sol.sort_order]
      );
    }

    // 5. Challenge ↔ Solution mappings
    for (const [icon, solutionIds] of Object.entries(CHALLENGE_SOLUTIONS)) {
      const cid = challengeIdMap[icon];
      if (!cid) continue;
      await conn.query(`DELETE FROM challenge_solutions WHERE challenge_id = ?`, [cid]);
      for (let i = 0; i < solutionIds.length; i++) {
        await conn.query(
          `INSERT IGNORE INTO challenge_solutions (challenge_id, solution_id, sort_order) VALUES (?,?,?)`,
          [cid, solutionIds[i], i]
        );
      }
    }

    // 6. Locations with full rich data
    console.log('  → Seeding locations with rich data...');
    for (const loc of LOCATIONS) {
      // Check if hero_image_url column exists
      const [[colCheck]] = await conn.query(
        `SELECT COUNT(*) AS cnt FROM information_schema.columns
         WHERE table_schema = DATABASE()
         AND table_name = 'locations'
         AND column_name = 'hero_image_url'`
      );

      if (colCheck.cnt > 0) {
        // Full insert with all new fields
        await conn.query(
          `INSERT INTO locations (name,lat,lng,image_url,hero_image_url,stat,stat_desc,story_title,partnership_years,sort_order)
           VALUES (?,?,?,?,?,?,?,?,?,?)
           ON DUPLICATE KEY UPDATE
             lat=VALUES(lat), lng=VALUES(lng),
             image_url=VALUES(image_url),
             hero_image_url=VALUES(hero_image_url),
             story_title=VALUES(story_title),
             partnership_years=VALUES(partnership_years)`,
          [loc.name, loc.lat, loc.lng, loc.image_url, loc.hero_image_url,
           loc.stat, loc.stat_desc, loc.story_title, loc.partnership_years, loc.sort_order]
        );
      } else {
        // Basic insert without new columns
        await conn.query(
          `INSERT INTO locations (name,lat,lng,image_url,stat,stat_desc,sort_order)
           VALUES (?,?,?,?,?,?,?)
           ON DUPLICATE KEY UPDATE lat=VALUES(lat), lng=VALUES(lng)`,
          [loc.name, loc.lat, loc.lng, loc.image_url, loc.stat, loc.stat_desc, loc.sort_order]
        );
      }

      // Get the location ID
      const [[locRow]] = await conn.query(
        `SELECT id FROM locations WHERE name = ?`, [loc.name]
      );
      if (!locRow) continue;
      const locId = locRow.id;

      // Check and seed location challenges
      const [[lcCheck]] = await conn.query(
        `SELECT COUNT(*) AS cnt FROM information_schema.tables
         WHERE table_schema = DATABASE() AND table_name = 'location_challenges'`
      );

      if (lcCheck.cnt > 0) {
        await conn.query(`DELETE FROM location_challenges  WHERE location_id = ?`, [locId]);
        await conn.query(`DELETE FROM location_value_adds  WHERE location_id = ?`, [locId]);
        await conn.query(`DELETE FROM location_testimonials WHERE location_id = ?`, [locId]);

        for (let i = 0; i < loc.challenges.length; i++) {
          await conn.query(
            `INSERT INTO location_challenges (location_id, challenge, sort_order) VALUES (?,?,?)`,
            [locId, loc.challenges[i], i]
          );
        }

        for (let i = 0; i < loc.valueAdds.length; i++) {
          await conn.query(
            `INSERT INTO location_value_adds (location_id, value_add, sort_order) VALUES (?,?,?)`,
            [locId, loc.valueAdds[i], i]
          );
        }

        await conn.query(
          `INSERT INTO location_testimonials (location_id, quote, person_name, person_role)
           VALUES (?,?,?,?)`,
          [locId, loc.testimonial.quote, loc.testimonial.person_name, loc.testimonial.person_role]
        );
      }
    }

    // 7. Solution features
    console.log('  → Seeding solution features...');
    for (const { solutionId, features } of FEATURE_SOLUTIONS) {
      await conn.query(
        `DELETE sfb FROM solution_feature_bullets sfb
         JOIN solution_features sf ON sf.id = sfb.feature_id
         WHERE sf.solution_id = ?`,
        [solutionId]
      );
      await conn.query(
        `DELETE FROM solution_features WHERE solution_id = ?`, [solutionId]
      );

      for (let i = 0; i < features.length; i++) {
        const f = features[i];
        const [fr] = await conn.query(
          `INSERT INTO solution_features (solution_id, label, heading, body, sort_order)
           VALUES (?, ?, ?, ?, ?)`,
          [solutionId, f.label, f.heading, f.body, i]
        );
        for (let j = 0; j < f.bullets.length; j++) {
          await conn.query(
            `INSERT INTO solution_feature_bullets (feature_id, bullet, sort_order) VALUES (?,?,?)`,
            [fr.insertId, f.bullets[j], j]
          );
        }
      }
    }

    // 8. AOS deliverables + use cases
    console.log('  → Seeding AOS deliverables...');
    for (const sol of AOS_SOLUTIONS) {
      await conn.query(`DELETE FROM solution_deliverables WHERE solution_id = ?`, [sol.id]);
      await conn.query(`DELETE FROM solution_use_cases   WHERE solution_id = ?`, [sol.id]);

      for (let i = 0; i < sol.deliverables.length; i++) {
        await conn.query(
          `INSERT INTO solution_deliverables (solution_id, item_text, sort_order) VALUES (?,?,?)`,
          [sol.id, sol.deliverables[i], i]
        );
      }
      for (let i = 0; i < sol.useCases.length; i++) {
        await conn.query(
          `INSERT INTO solution_use_cases (solution_id, item_text, sort_order) VALUES (?,?,?)`,
          [sol.id, sol.useCases[i], i]
        );
      }
    }

    await conn.commit();
    console.log('✅  Seed complete!');
  } catch (e) {
    await conn.rollback();
    console.error('❌  Seed failed:', e);
    throw e;
  } finally {
    conn.release();
    process.exit(0);
  }
}

seed();