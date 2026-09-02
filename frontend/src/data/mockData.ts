import { TORContract, SoftwareHouseProfile } from '@/types';

export const INITIAL_SOFTWARE_HOUSE: SoftwareHouseProfile = {
  id: 'sh-001',
  name: 'Somchai Jaidee',
  email: 'contact@techbangkok.co.th',
  companyName: 'TechBangkok Solutions Co., Ltd.',
  taxId: '0105565012345',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  companySize: '25-50 Employees',
  district: 'Chatuchak, Bangkok',
  properties: [
    'ISO 27001 Information Security Certified',
    'ISO 29110 Software Process Certified',
    'Next.js / React / TypeScript Mastery',
    'Node.js & Microservices Architecture',
    'Cloud Native Infrastructure (GCP / AWS)',
    'Enterprise GIS Integration Experience',
    'High Concurrency API Handling (>10k req/sec)',
    'Thai Government Procurement Compliant'
  ],
  technologies: ['Next.js', 'React', 'Node.js', 'Python', 'PostgreSQL', 'MongoDB', 'Docker', 'Google Cloud'],
  certifications: ['ISO 27001', 'ISO 29110', 'CMMI Level 3', 'Google Cloud Certified Professional'],
  minPreferredBudget: 1000000,
  maxPreferredBudget: 50000000,
  notificationsEnabled: true,
  matchedTORIds: ['tor-001', 'tor-002', 'tor-004']
};

export const MOCK_TOR_CONTRACTS: TORContract[] = [
  {
    id: 'tor-002',
    title: 'โครงการพัฒนาระบบฐานข้อมูลบริการสุขภาพกรุงเทพฯ (Bangkok Digital Health Record)',
    contractOwner: 'สำนักการแพทย์ กรุงเทพมหานคร',
    publisherType: 'BMA (กรุงเทพมหานคร)',
    district: 'Pathum Wan',
    price: 12500000,
    priceFormatted: '12,500,000 THB',
    startDate: '01 Jul 2026',
    endDate: '31 May 2027',
    postingDate: '12 May 2026',
    submissionDeadline: '05 Jun 2026',
    category: 'Web & Mobile',
    description: 'พัฒนาระบบเชื่อมโยงระเบียบประวัติผู้ป่วยอิเล็กทรอนิกส์ (EHR) ระหว่างโรงพยาบาลในสังกัด กทม. 11 แห่ง พร้อมระบบจองคิวออนไลน์และแอปพลิเคชันประชาชน',
    thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
    pdfUrl: '/mock-tor-002.pdf',
    pdfPagesCount: 28,
    status: 'Open for Bidding',
    matchedScore: 98,
    properties: [
      { id: 'p5', property: 'มีผลงานพัฒนาระบบบริหารจัดการข้อมูลขนาดใหญ่ (Big Data / EHR)', category: 'experience', required: true, fulfilledBySoftwareHouse: true },
      { id: 'p6', property: 'มีมาตรฐาน ISO 27001 ข้อมูลสุขภาพและการคุ้มครองข้อมูลส่วนบุคคล (PDPA)', category: 'certification', required: true, fulfilledBySoftwareHouse: true },
      { id: 'p7', property: 'สถาปัตยกรรม Microservices พร้อมรองรับ Docker / Kubernetes', category: 'technical', required: true, fulfilledBySoftwareHouse: true },
      { id: 'p8', property: 'มีทุนจดทะเบียนชำระแล้วไม่ต่ำกว่า 5 ล้านบาท', category: 'financial', required: true, fulfilledBySoftwareHouse: true }
    ],
    aiEvaluation: {
      priceScore: 88,
      priceAssessment: 'ราคากลาง 12.5 ล้านบาท ครอบคลุมการฝึกอบรมบุคลากรทางการแพทย์และประกันระบบ 2 ปี',
      qualificationMatchScore: 94,
      riskLevel: 'Medium',
      riskAnalysis: 'ต้องเน้นย้ำมาตรการ PDPA และความปลอดภัยของข้อมูลสุขภาพผู้ป่วยเป็นพิเศษ',
      keyRequirementsExtracted: [
        'มาตรฐาน HL7 / FHIR Health Data Exchange',
        'ระบบยืนยันตัวตน ThaiD / NDID Integration',
        'การเข้ารหัสข้อมูล Data Encryption at Rest & In Transit'
      ],
      aiModel: 'Google Vertex AI Gemini 1.5 Pro',
      evaluatedAt: '2026-05-13 14:15 PM'
    }
  },
  {
    id: 'tor-003',
    title: 'แพลตฟอร์มบริหารจัดการสิ่งแวดล้อมและตรวจวัดฝุ่น PM2.5 เขตจตุจักร (BKK Eco-Monitoring)',
    contractOwner: 'สำนักงานเขตจตุจักร กรุงเทพมหานคร',
    publisherType: 'BMA (กรุงเทพมหานคร)',
    district: 'Chatuchak',
    price: 4800000,
    priceFormatted: '4,800,000 THB',
    startDate: '15 Jun 2026',
    endDate: '15 Dec 2026',
    postingDate: '08 May 2026',
    submissionDeadline: '28 May 2026',
    category: 'AI & Analytics',
    description: 'จัดทำระบบเชื่อมโยงเซนเซอร์ตรวจวัดคุณภาพอากาศแบบ IoT ทั่วเขตจตุจักร พร้อมแบบจำลอง AI พยากรณ์ระดับฝุ่นควันล่วงหน้า 72 ชั่วโมง',
    thumbnail: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=600&q=80',
    pdfUrl: '/mock-tor-003.pdf',
    pdfPagesCount: 18,
    status: 'Open for Bidding',
    matchedScore: 68,
    properties: [
      { id: 'p9', property: 'มีประสบการณ์พัฒนาระบบวิเคราะห์ข้อมูลเวล็จริง (Real-Time Analytics)', category: 'experience', required: true, fulfilledBySoftwareHouse: true },
      { id: 'p10', property: 'สามารถจัดทำ Machine Learning Model พยากรณ์อนุกรมเวลา (Time Series)', category: 'technical', required: true, fulfilledBySoftwareHouse: true },
      { id: 'p11', property: 'มีทีมงานผู้เชี่ยวชาญด้าน Data Science อย่างน้อย 2 คน', category: 'technical', required: false, fulfilledBySoftwareHouse: false }
    ],
    aiEvaluation: {
      priceScore: 90,
      priceAssessment: 'สมเหตุสมผล รวมค่าอุปกรณ์ IoT Gateway และ Cloud Computing Credits 1 ปี',
      qualificationMatchScore: 89,
      riskLevel: 'Low',
      riskAnalysis: 'ความเสี่ยงต่ำ โมเดลปัญญาประดิษฐ์สามารถประยุกต์ใช้ Open-Source Framework มาตรฐานได้',
      keyRequirementsExtracted: [
        'IoT Telemetry Protocol (MQTT / CoAP)',
        'Machine Learning Time-Series Forecasting',
        'Interactive Map Heatmap Visualization'
      ],
      aiModel: 'Google Vertex AI Gemini 1.5 Pro',
      evaluatedAt: '2026-05-09 11:00 AM'
    }
  },
  {
    id: 'tor-004',
    title: 'จ้างเหมาพัฒนาระบบยื่นคำขออนุญาตก่อสร้างออนไลน์ (BMA One-Stop Permitting System)',
    contractOwner: 'สำนักการโยธา กรุงเทพมหานคร',
    publisherType: 'BMA (กรุงเทพมหานคร)',
    district: 'Bang Rak',
    price: 8500000,
    priceFormatted: '8,500,000 THB',
    startDate: '01 Aug 2026',
    endDate: '31 Mar 2027',
    postingDate: '15 May 2026',
    submissionDeadline: '10 Jun 2026',
    category: 'Web & Mobile',
    description: 'ยกระดับการให้บริการยื่นแบบแปลนและขออนุญาตก่อสร้างผ่านช่องทางดิจิทัล 100% พร้อมระบบลงนามอิเล็กทรอนิกส์ (e-Signature) และชำระค่าธรรมเนียมออนไลน์',
    thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
    pdfUrl: '/mock-tor-004.pdf',
    pdfPagesCount: 22,
    status: 'Open for Bidding',
    matchedScore: 70,
    properties: [
      { id: 'p12', property: 'มีผลงานพัฒนาระบบ e-Service หรือ e-Permit ภาคการเมือง/รัฐบาล', category: 'experience', required: true, fulfilledBySoftwareHouse: true },
      { id: 'p13', property: 'รองรับการเชื่อมต่อ Payment Gateway และ e-Tax Invoice/e-Receipt', category: 'technical', required: true, fulfilledBySoftwareHouse: true },
      { id: 'p14', property: 'ได้รับ ISO 27001 Information Security Management', category: 'certification', required: true, fulfilledBySoftwareHouse: true }
    ],
    aiEvaluation: {
      priceScore: 95,
      priceAssessment: 'งบประมาณเหมาะสมกับขอบเขตงาน 8.5 ล้านบาท',
      qualificationMatchScore: 96,
      riskLevel: 'Low',
      riskAnalysis: 'ตรงกับศักยภาพหลักของบริษัท TechBangkok Solutions',
      keyRequirementsExtracted: [
        'BIM & CAD Viewer integration in browser',
        'e-Signature & Digital Stamp Authority',
        'Payment Gateway & QR PromptPay Automatic Audit'
      ],
      aiModel: 'Google Vertex AI Gemini 1.5 Pro',
      evaluatedAt: '2026-05-16 16:45 PM'
    }
  },
  {
    id: 'tor-005',
    title: 'โครงการพัฒนาระบบคลาวด์เนทีฟสำหรับจัดเก็บและวิเคราะห์งบประมาณประจำปี (BMA Cloud Analytics)',
    contractOwner: 'สำนักงบประมาณ กรุงเทพมหานคร',
    publisherType: 'BMA (กรุงเทพมหานคร)',
    district: 'Phra Nakhon',
    price: 18000000,
    priceFormatted: '18,000,000 THB',
    startDate: '01 Oct 2026',
    endDate: '30 Sep 2027',
    postingDate: '11 May 2026',
    submissionDeadline: '15 Jun 2026',
    category: 'Cloud & DevOps',
    description: 'ออกแบบย้ายฐานข้อมูลระบบงบประมาณขึ้นโครงสร้างพื้นฐาน Private Cloud ปลอดภัยสูง พร้อมแดชบอร์ดสรุปผลผู้บริหารด้วย AI Data Insights',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    pdfUrl: '/mock-tor-005.pdf',
    pdfPagesCount: 35,
    status: 'Open for Bidding',
    matchedScore: 59,
    properties: [
      { id: 'p15', property: 'มีผลงานย้ายระบบงานเข้าสู่ Cloud Infrastructure วงเงินไม่น้อยกว่า 5 ล้านบาท', category: 'experience', required: true, fulfilledBySoftwareHouse: true },
      { id: 'p16', property: 'มีบุคลากรระดับ Kubernetes Certified Administrator (CKA)', category: 'technical', required: true, fulfilledBySoftwareHouse: false },
      { id: 'p17', property: 'ทุนจดทะเบียนไม่ต่ำกว่า 10 ล้านบาท', category: 'financial', required: true, fulfilledBySoftwareHouse: true }
    ],
    aiEvaluation: {
      priceScore: 85,
      priceAssessment: 'ราคากลาง 18 ล้านบาท รวมค่าอุปกรณ์ฮาร์ดแวร์เซิร์ฟเวอร์ และใบอนุญาต Cloud Software',
      qualificationMatchScore: 82,
      riskLevel: 'Medium',
      riskAnalysis: 'ต้องการบุคลากรวุฒิบัตร CKA เพิ่มเติมเพื่อเพิ่มโอกาสผ่านการคัดเลือก',
      keyRequirementsExtracted: [
        'Multi-Cloud Disaster Recovery Configuration',
        'AI Data Warehouse & ETL Pipeline',
        'Zero Trust Architecture Implementation'
      ],
      aiModel: 'Google Vertex AI Gemini 1.5 Pro',
      evaluatedAt: '2026-05-12 10:20 AM'
    }
  },
  {
    id: 'tor-006',
    title: 'ระบบทดสอบและเฝ้าระวังความปลอดภัยไซเบอร์ (Bangkok Cybersecurity SOC Platform)',
    contractOwner: 'กระทรวงดิจิทัลเพื่อเศรษฐกิจและสังคม (MDES)',
    publisherType: 'Ministry',
    district: 'Huai Khwang',
    price: 25000000,
    priceFormatted: '25,000,000 THB',
    startDate: '01 Nov 2026',
    endDate: '31 Oct 2027',
    postingDate: '05 May 2026',
    submissionDeadline: '01 Jun 2026',
    category: 'Cybersecurity',
    description: 'จัดตั้งศูนย์ปฏิบัติการเฝ้าระวังความปลอดภัยไซเบอร์ (Security Operations Center) พร้อมระบบตรวจจับการโจมตีอัตโนมัติด้วย AI SIEM',
    thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80',
    pdfUrl: '/mock-tor-006.pdf',
    pdfPagesCount: 40,
    status: 'Open for Bidding',
    matchedScore: 78,
    properties: [
      { id: 'p18', property: 'มีผลงานติดตั้งระบบ SOC หรือ SIEM ให้กับหน่วยงานภาครัฐหรือสถาบันการเงิน', category: 'experience', required: true, fulfilledBySoftwareHouse: false },
      { id: 'p19', property: 'มีผู้เชี่ยวชาญ CISSP หรือ CISM ประจำทีมอย่างน้อย 2 คน', category: 'certification', required: true, fulfilledBySoftwareHouse: false },
      { id: 'p20', property: 'ได้รับ ISO 27001', category: 'certification', required: true, fulfilledBySoftwareHouse: true }
    ],
    aiEvaluation: {
      priceScore: 91,
      priceAssessment: 'วงเงิน 25 ล้านบาท เหมาะสมสำหรับโครงการระดับกระทรวง',
      qualificationMatchScore: 78,
      riskLevel: 'High',
      riskAnalysis: 'ต้องการใบรับรองเฉพาะทางด้าน Security Threat Intelligence (CISSP/CISM) ซึ่งควรหาพันธมิตรจัดตั้ง Consortium',
      keyRequirementsExtracted: [
        'AI Threat Hunting Engine',
        '24/7 Security Operations Center Setup',
        'Penetration Testing & Vulnerability Assessment'
      ],
      aiModel: 'Google Vertex AI Gemini 1.5 Pro',
      evaluatedAt: '2026-05-06 15:10 PM'
    }
  }
];

export const BANGKOK_DISTRICTS = [
  'All Districts',
  'Phra Nakhon',
  'Pathum Wan',
  'Chatuchak',
  'Bang Rak',
  'Huai Khwang',
  'Khlong Toei',
  'Wattana',
  'Bang Khen',
  'Don Mueang'
];

export const TOR_CATEGORIES = [
  'All Categories',
  'Smart City',
  'Web & Mobile',
  'Cloud & DevOps',
  'AI & Analytics',
  'Cybersecurity'
];
