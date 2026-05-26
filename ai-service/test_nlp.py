from utils import clean_text, extract_contact_info, extract_skills, analyze_resume_ats

def test_nlp_flow():
    dummy_resume = """
    John Doe
    Email: john.doe@example.com
    Phone: +1-555-019-2834
    
    Education
    Bachelor of Science in Computer Science - Stanford University (2018 - 2022)
    
    Experience
    Software Engineer - TechCorp (2022 - Present)
    - Developed backend services using Node.js, Express, and Python.
    - Managed relational databases using MySQL and PostgreSQL.
    - Set up Docker containers and Jenkins pipelines for CI/CD deployments.
    - Worked in Agile/Scrum sprints.
    
    Skills
    Python, Javascript, React, Node.js, Express, MySQL, PostgreSQL, Docker, Git, CI/CD, HTML, CSS, Agile
    """
    
    print("Testing Text Cleaning...")
    cleaned = clean_text(dummy_resume)
    print(f"Cleaned snippet: {cleaned[:100]}...\n")
    
    print("Testing Contact Information Extraction...")
    contact = extract_contact_info(dummy_resume)
    print(f"Contact Info: {contact}\n")
    assert contact["email"] == "john.doe@example.com"
    assert contact["phone"] == "+1-555-019-2834"
    assert "john doe" in contact["name"].lower()
    
    print("Testing Skill Extraction...")
    skills = extract_skills(dummy_resume)
    print(f"Extracted Skills: {skills}\n")
    assert "python" in skills
    assert "react" in skills
    assert "node.js" in skills
    assert "docker" in skills
    
    print("Testing ATS scoring & recommendations for 'Full Stack Developer'...")
    analysis = analyze_resume_ats(dummy_resume, "Full Stack Developer", skills)
    print(f"ATS Score: {analysis['score']['overall']}/100")
    print(f"Matching Skills: {analysis['matchingSkills']}")
    print(f"Missing Skills: {analysis['missingSkills']}")
    print(f"Suggestions: {analysis['suggestions']}\n")
    
    print("All NLP logic tests passed successfully!")

if __name__ == "__main__":
    test_nlp_flow()
