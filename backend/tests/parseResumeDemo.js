const fs = require("fs");
const path = require("path");
const { parse } = require("../utils/mockAi");

// Use the pasted resume content from the user
const resumeText = `Madhur Chaturvedi
+91-6265526730 | madhurchaturvedi2000@gmail.com | LinkedIn | GitHub | Portfolio | Gwalior, India
SUMMARY
Software Engineer and Full Stack Developer with hands-on experience building scalable web applications using the MERN stack
and modern backend technologies. Currently pursuing an M.Tech in Computer Science. Passionate about AI/ML, NLP, and
designing efficient, high-performance software systems with clean, maintainable architecture.

EXPERIENCE
Zummit Infolabs May 2024 – Oct 2024
Back End Developer Intern Remote | Bengaluru, Karnataka, India
• Developed and maintained scalable REST APIs and backend services for therapist-focused web applications used by
clinical staff and clients
• Built secure server-side applications using Node.js, Express.js, MongoDB, and JavaScript

Linear AmpTech Nov 2022 – Feb 2023
Software Engineer Trainee Associated with IIT Roorkee
• Built and maintained full-stack web applications using Node.js, React.js, Express.js, and MongoDB

PROJECTS
NextHire – AI Resume Analyzer (Minor Project) | MERN Stack, Python, FastAPI | GitHub | Live 2026
• Built an AI-powered career platform using MongoDB, Express.js, React.js, Node.js, Python, and FastAPI

SKILLS
Languages: Python, JavaScript, HTML, CSS, SQL, C++
Frameworks & Libraries: React.js, Node.js, Express.js, Next.js
Databases: MongoDB, MySQL, PostgreSQL
TOOLS & PLATFORMS: Git, GitHub, VS Code, Postman, JWT, REST APIs

EDUCATION
Amity University, Gwalior Aug 2025 – Present
Master of Technology (M.Tech) in Computer Science
`;

const tmpPath = path.join(__dirname, "tmp_resume.txt");
fs.writeFileSync(tmpPath, resumeText, "utf8");

(async () => {
  const parsed = await parse(tmpPath);
  console.log("Parsed result:");
  console.dir(parsed, { depth: 3 });
  fs.unlinkSync(tmpPath);
})();
