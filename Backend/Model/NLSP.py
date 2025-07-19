import re
import spacy
import pandas as pd # for skill csv
import fitz # for text extraction
import json
import sys

# Load the spaCy NLP model
nlp = spacy.load("en_core_web_lg")

# Add EntityRuler for custom skill/entity detection
ruler = nlp.add_pipe("entity_ruler", before="ner")

# Define skill patterns
skill_df = pd.read_csv('./Model/skills.csv')
skills = skill_df['skill'].tolist()
patterns = [{"label": "SKILL", "pattern": skill} for skill in skills]
ruler.add_patterns(patterns)

# Define education patterns
education_df = pd.read_csv('./Model/Education.csv')
education_names = list(education_df['education'].dropna())
education_abbrs = list(education_df['abbreviation'].dropna())
education_levels = dict()
for _, row in education_df.iterrows():
    education_levels[row['education']] = row['level']
    education_levels[row['abbreviation']] = row['level']
education_list = education_names + education_abbrs
education_patterns = [{"label": "EDUCATION", "pattern": edu} for edu in education_list]
ruler.add_patterns(education_patterns)


# Resume parser function
def parse_resume(text,Jd_skill,Hr_company_name):
    text = re.sub(r"\s+", " ", text) 
    doc = nlp(text)
    parsed_data = {}

    # 1. Regex-based fields
    parsed_data["Email"] = re.findall(r'\S+@\S+', text)[0] if re.findall(r'\S+@\S+', text) else None
    parsed_data["Phone"] = re.findall(r'\+?\d[\d\s-]{8,}', text)[0] if re.findall(r'\+?\d[\d\s-]{8,}', text) else None
    parsed_data["LinkedIn"] = re.findall(r'linkedin\.com\/[^\s]+', text)[0] if re.findall(r'linkedin\.com\/[^\s]+', text) else None
    parsed_data["GitHub"] = re.findall(r'github\.com\/[^\s]+', text)[0] if re.findall(r'github\.com\/[^\s]+', text) else None

    # 2. Extract Skills from custom SKILL entity label
    parsed_data["Skills"] = sorted(list(set([ent.text for ent in doc.ents if ent.label_ == "SKILL"])))

    # 3. Extract Education from custom EDUCATION entity label
    found_educations = [ent.text for ent in doc.ents if ent.label_ == "EDUCATION"]
    # Find the highest education based on the 'level' in education_levels
    if not found_educations :
        parsed_data["Education"] = None    
    else:
        highest_level = -1
        for edu in found_educations:
            level = int(education_levels.get(edu))
            if level is not None and level > highest_level:
                highest_level = level
                highest_education = edu
        parsed_data["Education"] = highest_education

    if not Jd_skill:
        parsed_data["Match_skill"] = 0  # Avoid division by zero
    else:
        matched_skills = set([s.lower() for s in parsed_data["Skills"]]).intersection(set(Jd_skill))
         # Find the highest education based on the order in education_list
        parsed_data["Match_skill"] = len(matched_skills) / len(set(Jd_skill)) * 100

    # Check if Hr_company_name is present in the resume text (case-insensitive)
    if Hr_company_name:
        parsed_data["Company_Match"] = Hr_company_name.lower() in text.lower()
    else:
        parsed_data["Company_Match"] = False
    
    text=text[:300]
    email = parsed_data.get("Email", "") or ""
    linkedin = parsed_data.get("LinkedIn", "") or ""
    github = parsed_data.get("GitHub", "") or ""
    for pattern in ([email, linkedin, github] + skills):
        if pattern:
            text = text.replace(pattern, '')
    text_cleaned = re.sub(r'\s+', ' ', text).strip()
    
    doc_name = nlp(text_cleaned)
    for ent in doc_name.ents:
        if ent.label_ == "PERSON":
            name_candidate = ent.text.strip()

            # Remove special characters and digits, keep only letters and spaces
            cleaned_name = re.sub(r'[^A-Za-z ]+', '', name_candidate).strip()
            cleaned_name = re.sub(r'\s+', ' ', cleaned_name)

            if 1 <= len(cleaned_name.split()) < 3:
                parsed_data["Name"] = cleaned_name
                break
            else:
                break #check only for first person
    else:
        parsed_data["Name"] = None

    return parsed_data

def parse_resume_pdf(pdf_path, Jd_skill, Hr_company_name):
    """
    Takes a PDF file path, extracts text, parses the resume, and returns the result as a dictionary.
    """
    resume_text = ""
    doc = fitz.open(pdf_path)
    for page in doc:
        resume_text += page.get_text()
    parsed = parse_resume(resume_text,Jd_skill,Hr_company_name)
    return parsed 

if __name__ == "__main__":
    # Check if file path is provided as command line argument
    if len(sys.argv) < 3:
        error_result = {"error": "No file path provided. Usage: python NLSP.py <file_path>"}
        print(json.dumps(error_result))
        sys.exit(1)
    
    pdf_path =sys.argv[1] #  Get file path from command line argument
    
    # Handle both JSON string and comma-separated string formats
    skills_input = sys.argv[2]
    try:
        # Try to parse as JSON first
        Jd_skill = json.loads(skills_input)
    except json.JSONDecodeError:
        # If JSON parsing fails, treat as comma-separated string
        Jd_skill = [skill.strip() for skill in skills_input.split(',')]
    
    # Convert each skill to lowercase
    Jd_skill = [skill.lower() for skill in Jd_skill]
    Hr_company_name = sys.argv[3]

    try:
        result = parse_resume_pdf(pdf_path, Jd_skill, Hr_company_name)
        # Output result as JSON
        print(json.dumps(result, indent=2))
    except Exception as e:
        error_result = {"error": f"Failed to process file: {str(e)}"}
        print(json.dumps(error_result))
        sys.exit(1)
