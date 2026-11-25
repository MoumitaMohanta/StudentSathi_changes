import '../config/loadEnv.js';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Alumni from '../models/Alumni.js';

// ---------- ALUMNI DATA ----------
// 6 CSE, 2 ECE, 1 MECH, 1 EE — deliberately varied so recommendations differ
const alumniData = [
  // ----- CSE (6) -----
  {
    firstName: 'Aarav',
    lastName: 'Sharma',
    email: 'aarav.sharma@alumni.test',
    branch: 'CSE',
    graduationYear: 2020,
    currentRole: 'Backend Engineer',
    currentCompany: 'Google',
    specialization: 'Distributed Systems',
    skills: ['Node.js', 'PostgreSQL', 'Kubernetes', 'System Design', 'Go'],
    bio: 'Backend engineer working on large-scale distributed systems. Happy to help with system design and backend interviews.',
    advice: 'Focus on fundamentals: OS, DBMS, and one language deeply. Projects matter more than CGPA.',
    linkedinProfile: 'https://linkedin.com/in/aarav-sharma',
    isVerified: true,
    isFeatured: true,
  },
  {
    firstName: 'Priya',
    lastName: 'Mehta',
    email: 'priya.mehta@alumni.test',
    branch: 'CSE',
    graduationYear: 2021,
    currentRole: 'Data Scientist',
    currentCompany: 'Amazon',
    specialization: 'Machine Learning',
    skills: ['Python', 'PyTorch', 'SQL', 'Statistics', 'MLOps'],
    bio: 'Data scientist working on recommendation systems. Interested in mentoring students entering ML.',
    advice: 'Build a strong math foundation. Learn to read research papers early.',
    linkedinProfile: 'https://linkedin.com/in/priya-mehta',
    isVerified: true,
    isFeatured: true,
  },
  {
    firstName: 'Rohan',
    lastName: 'Gupta',
    email: 'rohan.gupta@alumni.test',
    branch: 'CSE',
    graduationYear: 2019,
    currentRole: 'Full Stack Developer',
    currentCompany: 'Flipkart',
    specialization: 'Web Development',
    skills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'AWS'],
    bio: 'Full stack developer. Love building products end-to-end. Can guide on web dev career paths.',
    advice: 'Ship side projects. A working product teaches more than any course.',
    linkedinProfile: 'https://linkedin.com/in/rohan-gupta',
    isVerified: true,
    isFeatured: false,
  },
  {
    firstName: 'Sneha',
    lastName: 'Reddy',
    email: 'sneha.reddy@alumni.test',
    branch: 'CSE',
    graduationYear: 2022,
    currentRole: 'Software Engineer',
    currentCompany: 'Microsoft',
    specialization: 'Cloud Computing',
    skills: ['Azure', 'C#', 'Kubernetes', 'Microservices', 'Docker'],
    bio: 'Cloud engineer at Microsoft. Interested in helping students break into big tech.',
    advice: 'DSA is non-negotiable. Practice consistently, not in bursts.',
    linkedinProfile: 'https://linkedin.com/in/sneha-reddy',
    isVerified: true,
    isFeatured: false,
  },
  {
    firstName: 'Vikram',
    lastName: 'Singh',
    email: 'vikram.singh@alumni.test',
    branch: 'CSE',
    graduationYear: 2018,
    currentRole: 'ML Engineer',
    currentCompany: 'NVIDIA',
    specialization: 'Deep Learning',
    skills: ['Python', 'CUDA', 'TensorFlow', 'Deep Learning', 'C++'],
    bio: 'ML engineer working on GPU-accelerated training. Interested in mentoring ML researchers.',
    advice: 'Get comfortable with low-level concepts. They differentiate you at senior levels.',
    linkedinProfile: 'https://linkedin.com/in/vikram-singh',
    isVerified: true,
    isFeatured: false,
  },
  {
    firstName: 'Ananya',
    lastName: 'Bose',
    email: 'ananya.bose@alumni.test',
    branch: 'CSE',
    graduationYear: 2021,
    currentRole: 'Database Engineer',
    currentCompany: 'Oracle',
    specialization: 'Database Systems',
    skills: ['SQL', 'PL/SQL', 'Database Design', 'Oracle DB', 'Query Optimization'],
    bio: 'Database engineer. Can help with DBMS concepts, normalization, and query tuning.',
    advice: 'DBMS is underrated. It shows up everywhere — know your fundamentals cold.',
    linkedinProfile: 'https://linkedin.com/in/ananya-bose',
    isVerified: true,
    isFeatured: true,
  },

  // ----- ECE (2) -----
  {
    firstName: 'Karthik',
    lastName: 'Iyer',
    email: 'karthik.iyer@alumni.test',
    branch: 'ECE',
    graduationYear: 2020,
    currentRole: 'Embedded Systems Engineer',
    currentCompany: 'Qualcomm',
    specialization: 'VLSI Design',
    skills: ['Verilog', 'VLSI', 'C', 'Embedded C', 'FPGA'],
    bio: 'Embedded engineer working on SoC design. Interested in mentoring ECE students.',
    advice: 'Learn both hardware and software. The intersection is where the best opportunities lie.',
    linkedinProfile: 'https://linkedin.com/in/karthik-iyer',
    isVerified: true,
    isFeatured: false,
  },
  {
    firstName: 'Divya',
    lastName: 'Nair',
    email: 'divya.nair@alumni.test',
    branch: 'ECE',
    graduationYear: 2022,
    currentRole: 'Signal Processing Engineer',
    currentCompany: 'Texas Instruments',
    specialization: 'Signal Processing',
    skills: ['MATLAB', 'DSP', 'Python', 'Communication Systems', 'C++'],
    bio: 'DSP engineer. Interested in helping juniors navigate ECE career paths.',
    advice: 'Do at least one project that combines signal processing with ML. It is a growing area.',
    linkedinProfile: 'https://linkedin.com/in/divya-nair',
    isVerified: true,
    isFeatured: false,
  },

  // ----- MECH (1) -----
  {
    firstName: 'Arjun',
    lastName: 'Verma',
    email: 'arjun.verma@alumni.test',
    branch: 'MECH',
    graduationYear: 2021,
    currentRole: 'Design Engineer',
    currentCompany: 'Tata Motors',
    specialization: 'Automotive Design',
    skills: ['SolidWorks', 'CATIA', 'ANSYS', 'FEA', 'GD&T'],
    bio: 'Automotive design engineer. Happy to help with CAD and design fundamentals.',
    advice: 'Master one CAD tool deeply. Interviewers care about depth, not breadth.',
    linkedinProfile: 'https://linkedin.com/in/arjun-verma',
    isVerified: true,
    isFeatured: false,
  },

  // ----- EE (1) -----
  {
    firstName: 'Meera',
    lastName: 'Joshi',
    email: 'meera.joshi@alumni.test',
    branch: 'EE',
    graduationYear: 2020,
    currentRole: 'Power Systems Engineer',
    currentCompany: 'Siemens',
    specialization: 'Power Electronics',
    skills: ['MATLAB', 'Simulink', 'Power Systems', 'SCADA', 'Control Systems'],
    bio: 'Power systems engineer at Siemens. Interested in mentoring EE students.',
    advice: 'Learn simulation tools early. They are the industry standard.',
    linkedinProfile: 'https://linkedin.com/in/meera-joshi',
    isVerified: true,
    isFeatured: false,
  },
];

// ---------- STUDENT DATA ----------
// Varied profiles so personalization can be demonstrated
const studentData = [
  {
    firstName: 'Test',
    lastName: 'Student',
    email: 'student@test.com',
    password: 'password123',
    branch: 'CSE',
    semester: 5,
    rollNumber: 'CSE21001',
    cgpa: 8.5,
    bio: 'Interested in databases and backend engineering. Looking to build scalable systems.',
    interests: ['databases', 'backend development', 'system design'],
    targetRole: 'Backend Engineer',
    skills: [{ name: 'SQL' }, { name: 'MongoDB' }, { name: 'Node.js' }],
  },
  {
    firstName: 'Aisha',
    lastName: 'Khan',
    email: 'aisha@test.com',
    password: 'password123',
    branch: 'CSE',
    semester: 3,
    rollNumber: 'CSE23042',
    cgpa: 9.1,
    bio: 'Fascinated by machine learning and data science. Want to become an ML engineer.',
    interests: ['machine learning', 'data science', 'deep learning'],
    targetRole: 'Machine Learning Engineer',
    skills: [{ name: 'Python' }, { name: 'Pandas' }, { name: 'NumPy' }],
  },
  {
    firstName: 'Rahul',
    lastName: 'Das',
    email: 'rahul@test.com',
    password: 'password123',
    branch: 'ECE',
    semester: 5,
    rollNumber: 'ECE21015',
    cgpa: 7.8,
    bio: 'Embedded systems enthusiast. Interested in VLSI and hardware design.',
    interests: ['embedded systems', 'VLSI', 'signal processing'],
    targetRole: 'Embedded Systems Engineer',
    skills: [{ name: 'C' }, { name: 'Verilog' }, { name: 'MATLAB' }],
  },
];

// ---------- SEED FUNCTION ----------
const seed = async () => {
  await connectDB();
  console.log('✓ MongoDB connected\n');

  // --- Seed Alumni ---
  console.log('--- Seeding Alumni ---');
  let alumniInserted = 0;
  for (const a of alumniData) {
    try {
      const exists = await Alumni.findOne({ email: a.email });
      if (exists) {
        console.log(`  skip: ${a.firstName} ${a.lastName} (already exists)`);
        continue;
      }
      await Alumni.create(a);
      alumniInserted++;
      console.log(`  ✓ ${a.firstName} ${a.lastName} [${a.branch}]`);
    } catch (err) {
      console.error(`  ✗ ${a.firstName} ${a.lastName}: ${err.message}`);
    }
  }
  console.log(`\nAlumni inserted: ${alumniInserted}/${alumniData.length}\n`);

  // --- Seed Students ---
  console.log('--- Seeding Students ---');
  let studentsInserted = 0;
  for (const s of studentData) {
    try {
      const exists = await User.findOne({ email: s.email });
      if (exists) {
        console.log(`  skip: ${s.firstName} ${s.lastName} (already exists)`);
        continue;
      }
      // User model hashes password in pre-save hook, so just create
      await User.create({ ...s, role: 'student' });
      studentsInserted++;
      console.log(`  ✓ ${s.firstName} ${s.lastName} [${s.branch} · Sem ${s.semester}]`);
    } catch (err) {
      console.error(`  ✗ ${s.firstName} ${s.lastName}: ${err.message}`);
    }
  }
  console.log(`\nStudents inserted: ${studentsInserted}/${studentData.length}`);

  console.log('\n✓ Seed complete');
  console.log('\nNext step: run the embedding scripts to make these searchable:');
  console.log('  node scripts/buildItemEmbeddings.js');
  console.log('  node scripts/buildUserEmbeddings.js\n');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});