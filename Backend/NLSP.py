import re
import spacy
import pandas as pd # for skill csv
import fitz # for text extraction

# Load the spaCy NLP model
nlp = spacy.load("en_core_web_sm")

# Add EntityRuler for custom skill/entity detection
ruler = nlp.add_pipe("entity_ruler", before="ner")

# Define skill patterns
skill_df = pd.read_csv('Backend/skills.csv')
skills = skill_df['skill'].tolist()
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

def parse_resume_pdf(pdf_path):
    """
    Takes a PDF file path, extracts text, parses the resume, and returns the result as a dictionary.
    """
    resume_text = ""
    doc = fitz.open(pdf_path)
    for page in doc:
        resume_text += page.get_text("text")
    parsed = parse_resume(resume_text)
    return parsed 

# Example usage (for testing only, not run on import)
if __name__ == "__main__":
    pdf_path = "Backend/Sample.pdf"  
    if pdf_path:
        result = parse_resume_pdf(pdf_path)
        for key, value in result.items():
            print(f"{key}: {value}")
