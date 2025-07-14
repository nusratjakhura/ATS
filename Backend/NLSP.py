import re
import spacy

# Load the spaCy NLP model
nlp = spacy.load("en_core_web_sm")

# Add EntityRuler for custom skill/entity detection
ruler = nlp.add_pipe("entity_ruler", before="ner")

# Define skill patterns
skills = [
    "Python", "Django", "React", "OpenCV", "NumPy", "Pandas", "Docker", "Git",
    "SQL", "XGBoost", "LSTM", "PostgreSQL", "MongoDB", "HTML", "CSS", "Bootstrap",
    "JavaScript", "Matplotlib", "Mediapipe", "Prompt Engineering"
]
patterns = [{"label": "SKILL", "pattern": skill} for skill in skills]
ruler.add_patterns(patterns)


# Resume parser function
def parse_resume(text):
    doc = nlp(text)
    parsed_data = {}

    # 1. Extract name (first PERSON entity)
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            parsed_data["Name"] = ent.text
            break

    # 2. Regex-based fields
    parsed_data["Email"] = re.findall(r'\S+@\S+', text)[0] if re.findall(r'\S+@\S+', text) else None
    parsed_data["Phone"] = re.findall(r'\+?\d[\d\s-]{8,}', text)[0] if re.findall(r'\+?\d[\d\s-]{8,}', text) else None
    parsed_data["LinkedIn"] = re.findall(r'linkedin\.com\/[^\s]+', text)[0] if re.findall(r'linkedin\.com\/[^\s]+', text) else None
    parsed_data["GitHub"] = re.findall(r'github\.com\/[^\s]+', text)[0] if re.findall(r'github\.com\/[^\s]+', text) else None

    # 3. Extract Skills from custom SKILL entity label
    parsed_data["Skills"] = sorted(list(set([ent.text for ent in doc.ents if ent.label_ == "SKILL"])))

    # 4. Availability (regex-based simple search)
    avail_match = re.search(r'available.*from\s+(.*?)[\.\n]', text, re.IGNORECASE)
    if avail_match:
        parsed_data["Availability"] = avail_match.group(1).strip()

    return parsed_data


# 👇 Example usage
if __name__ == "__main__":
    # Sample parsed resume text (replace this with real text from PyMuPDF)
    resume_text = '''Om Chaudhary
Nashik, Maharashtra, India
omghanshyam394@gmail.com
—
+91 8010607563
linkedin.com/in/om-chaudhary
—
github.com/Omchaudhary2004
Professional Summary
Final-year IT Engineering student passionate about Generative AI, machine learning, and image processing.
Skilled in Python, data structures, and full-stack development. Experienced in AI projects, model fine-tuning,
and hands-on work with OpenCV and LLMs. Demonstrates leadership, problem-solving abilities, and a con-
tinuous learning mindset.
Education
Bachelor of Engineering in Information Technology
2021 – 2026 (Expected)
MET’s Institute of Engineering, Nashik (SPPU)
CGPA: 7.5 / 10 (Through 5th Semester)
Technical Skills
• Programming: Python, SQL
• AI/ML: Pandas, NumPy, XGBoost, LSTM,Mediapipe, Prompt Engineering
• Image Processing: OpenCV, PIL, Matplotlib
• Web Development: React, Django, HTML, CSS, Bootstrap
• Databases: MySQL, PostgreSQL
• Tools: Git, Docker
Projects
Fern Fractal Hand Control using OpenCV and Matplotlib (2025)
• Developed a dynamic fern fractal generator controlled by hand gesture widening using OpenCV hand
tracking.
• Created visually appealing animations with infinite zoom and color variations for a hallucinogenic effect.
• Enhanced real-time interactivity through Matplotlib animations and threading.
Stock Market Trend Prediction using LSTM and XGBoost (2024)
• Built a hybrid ML model predicting NIFTY index movements using price data, options chain, and news
sentiment.
• Combined LSTM for sequence learning and XGBoost for improved classification accuracy.
ChatApp – Community App for Gamers (2024)(Hakathon runnerup)
• Built a real-time social platform using React, Django, and MongoDB.       
• Integrated CometChat SDK for scalable real-time chat and social feeds.    
• Achieved Runner-up position in the CometChat Hackathon.
Leadership & Achievements
• Secretary, IT Department – Led workshops and managed student technical initiatives.
• Managed 3 entrepreneurial ventures applying leadership and operational management.
• Runner-up, CometChat Hackathon.
Soft Skills
Leadership, Creative Problem Solving, Teamwork, Adaptability
Availability
Available for Internship roles from July 2025.
1
'''

    parsed = parse_resume(resume_text)
    for key, value in parsed.items():
        print(f"{key}: {value}")
