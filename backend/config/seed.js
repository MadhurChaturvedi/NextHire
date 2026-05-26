const CareerRole = require('../models/CareerRole');

const rolesData = [
  {
    roleName: "Full Stack Developer",
    requiredSkills: ["react", "node.js", "javascript", "express", "html", "css", "mongodb", "sql", "git", "rest api", "typescript"],
    roadmap: [
      { step: 1, title: "TypeScript Mastery", description: "Learn advanced TypeScript types, interfaces, generics, and compiler options.", resources: "TypeScript Official HandBook, Execute TypeScript with Node" },
      { step: 2, title: "Next.js & SSR", description: "Master Next.js App Router, Server Actions, Server-Side Rendering (SSR), and Static Site Generation (SSG).", resources: "Next.js official tutorial, Vercel documentation" },
      { step: 3, title: "Database Optimization", description: "Learn SQL indexing, MongoDB aggregation framework, transactions, and caching with Redis.", resources: "MongoDB University, High-Performance MySQL" },
      { step: 4, title: "System Design & Scalability", description: "Study vertical vs horizontal scaling, load balancing, message queues (RabbitMQ/Kafka), and microservices.", resources: "System Design Primer, ByteByteGo" }
    ],
    recommendedProjects: [
      { title: "Real-time Collaborative Board", description: "A collaborative canvas tool utilizing WebSockets, React, Node.js, and Redis for instant updates.", techStack: "React, Node.js, Socket.io, Redis" },
      { title: "Microservices E-commerce", description: "An e-commerce platform split into Auth, Product, and Order services with Docker, RabbitMQ, and MongoDB.", techStack: "Express, MongoDB, RabbitMQ, Docker, Gateway" }
    ],
    recommendedCertifications: [
      "AWS Certified Developer - Associate",
      "Meta Back-End Developer Professional Certificate",
      "MongoDB Certified Developer Associate"
    ]
  },
  {
    roleName: "Data Scientist",
    requiredSkills: ["python", "sql", "pandas", "numpy", "scikit-learn", "statistics", "probability", "data visualization", "tableau", "powerbi", "matplotlib", "seaborn", "spark"],
    roadmap: [
      { step: 1, title: "Advanced Statistics & Hypothesis Testing", description: "Deepen your knowledge on A/B testing, regression analysis, ANOVA, and probability distributions.", resources: "Khan Academy Statistics, OpenIntro Statistics" },
      { step: 2, title: "SQL & ETL Pipelines", description: "Master complex subqueries, window functions, and setting up ETL pipelines using Airflow.", resources: "SQL Zoo, Mode Analytics SQL Tutorial" },
      { step: 3, title: "Machine Learning Engineering", description: "Learn tuning hyper-parameters, cross-validation, feature engineering, and model evaluation metrics.", resources: "Scikit-Learn documentation, Hands-On Machine Learning book" },
      { step: 4, title: "Big Data Technologies", description: "Understand distributed computing basics using Apache Spark/PySpark.", resources: "Databricks Academy Spark tutorial" }
    ],
    recommendedProjects: [
      { title: "Customer Churn Prediction Engine", description: "Analyze subscription data, build classification models (XGBoost, Random Forest), evaluate using ROC-AUC, and write a report.", techStack: "Python, Pandas, Scikit-learn, Seaborn" },
      { title: "ETL Sales Dashboard", description: "Build an automated ETL pipeline that loads raw CSVs into PostgreSQL and visualizes insights on an interactive dashboard.", techStack: "SQL, PostgreSQL, Python, Airflow, Tableau" }
    ],
    recommendedCertifications: [
      "IBM Data Science Professional Certificate",
      "Google Data Analytics Professional Certificate",
      "Microsoft Certified: Power BI Data Analyst Associate"
    ]
  },
  {
    roleName: "ML Engineer",
    requiredSkills: ["python", "tensorflow", "pytorch", "machine learning", "deep learning", "git", "docker", "mlops", "sql", "scikit-learn", "pandas", "numpy", "nlp", "computer vision"],
    roadmap: [
      { step: 1, title: "Deep Learning Foundation", description: "Learn neural network theory, backpropagation, CNNs, RNNs, and Transformers.", resources: "Deep Learning Specialization by Andrew Ng, PyTorch Tutorials" },
      { step: 2, title: "MLOps & Model Deployment", description: "Build APIs using FastAPI to serve models, run inference in Docker containers, and set up CI/CD.", resources: "MLOps Guide, Made With ML" },
      { step: 3, title: "Model Optimization & Quantization", description: "Learn models pruning, quantization, ONNX runtime conversion to speed up inference.", resources: "PyTorch Quantization guide" },
      { step: 4, title: "Kubernetes & Scalable ML", description: "Orchestrate multi-container ML pipelines with Kubeflow on Kubernetes.", resources: "Kubeflow documentation" }
    ],
    recommendedProjects: [
      { title: "Real-time Object Detection API", description: "Deploy a YOLO model using PyTorch and FastAPI, with optimized Docker configuration for fast inference.", techStack: "Python, PyTorch, OpenCV, FastAPI, Docker" },
      { title: "Fine-Tuning LLM for Q&A", description: "Fine-tune a small LLM (like Llama-3 or Mistral) on a custom dataset using PEFT/LoRA and Hugging Face.", techStack: "Python, HuggingFace, PyTorch, Transformers, PEFT" }
    ],
    recommendedCertifications: [
      "Google Cloud Professional Machine Learning Engineer",
      "AWS Certified Machine Learning - Specialty",
      "TensorFlow Developer Certificate"
    ]
  },
  {
    roleName: "Java Developer",
    requiredSkills: ["java", "spring boot", "spring", "hibernate", "sql", "rest api", "git", "maven", "microservices", "junit", "postgresql", "mysql"],
    roadmap: [
      { step: 1, title: "Java Concurrency & Internals", description: "Learn JVM tuning, garbage collection mechanisms, multithreading, and Java concurrency API.", resources: "Java Concurrency in Practice, Baeldung Java" },
      { step: 2, title: "Spring Boot Microservices", description: "Build resilient architectures with Spring Cloud, Eureka Discovery, API Gateway, and Feign Clients.", resources: "Spring Cloud Guides, Java Brains Microservices" },
      { step: 3, title: "Security & OAuth2", description: "Secure Spring Boot REST APIs using JWT tokens, Spring Security, and OAuth2 integration.", resources: "Spring Security documentation" },
      { step: 4, title: "Containerization & Deployment", description: "Dockerize Java applications, create multi-stage builds, and deploy on AWS or Kubernetes.", resources: "Docker official guide for Spring Boot" }
    ],
    recommendedProjects: [
      { title: "Distributed Banking Application", description: "A microservices banking system using Spring Cloud Config, Eureka registry, API Gateway, and PostgreSQL.", techStack: "Java, Spring Boot, Spring Cloud, PostgreSQL, Docker" },
      { title: "High-Throughput Order Management", description: "An order processor using Kafka queues, Hibernate ORM caching, Redis cache, and JUnit/Mockito tests.", techStack: "Java, Spring Boot, Kafka, Redis, Hibernate" }
    ],
    recommendedCertifications: [
      "Oracle Certified Professional: Java SE Developer",
      "Spring Certified Professional"
    ]
  },
  {
    roleName: "DevOps Engineer",
    requiredSkills: ["docker", "kubernetes", "linux", "unix", "jenkins", "aws", "gcp", "terraform", "git", "github actions", "ci/cd", "ansible", "prometheus", "grafana", "nginx", "bash", "python"],
    roadmap: [
      { step: 1, title: "Linux Administration & Bash Scripting", description: "Master command line, process management, networking troubleshooting, and automation scripting.", resources: "Linux Journey, Advanced Bash Scripting Guide" },
      { step: 2, title: "Infrastructure as Code (IaC)", description: "Learn Terraform for cloud resource management on AWS, workspace modularization, and state management.", resources: "Terraform Up & Running, HashiCorp Learn" },
      { step: 3, title: "Kubernetes Administration", description: "Understand Kubernetes architecture, Pods, Services, Deployments, ConfigMaps, Secrets, Ingress, and Helm.", resources: "Mumshad's CKA course, Kubernetes docs" },
      { step: 4, title: "Monitoring, Alerting & Logging", description: "Set up Prometheus for metric gathering, Grafana for dashboard visualizations, and Loki/ELK for logging.", resources: "Prometheus & Grafana official docs" }
    ],
    recommendedProjects: [
      { title: "Auto-scaling AWS Infrastructure", description: "Deploy a secure VPC with private and public subnets, ASG, Load Balancers, and RDS using Terraform.", techStack: "Terraform, AWS, VPC, EC2, RDS" },
      { title: "Multi-stage CI/CD Pipeline", description: "Build a pipeline in GitHub Actions/Jenkins that tests a Node app, builds a Docker image, pushes to ECR, and deploys to EKS.", techStack: "Jenkins, GitHub Actions, Docker, AWS EKS, Slack Notification" }
    ],
    recommendedCertifications: [
      "AWS Certified DevOps Engineer - Professional",
      "Certified Kubernetes Administrator (CKA)",
      "HashiCorp Certified: Terraform Associate"
    ]
  }
];

const seedRoles = async () => {
  try {
    const count = await CareerRole.countDocuments();
    if (count === 0) {
      await CareerRole.insertMany(rolesData);
      console.log('Career Roles pre-populated successfully!');
    } else {
      console.log('Career Roles already populated.');
    }
  } catch (error) {
    console.error('Error seeding career roles:', error.message);
  }
};

module.exports = seedRoles;
