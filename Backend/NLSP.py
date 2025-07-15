import re
import spacy
import pandas as pd # for skill csv
import fitz # for text extraction
import json
import sys

# Load the spaCy NLP model
nlp = spacy.load("en_core_web_sm")

# Add EntityRuler for custom skill/entity detection
ruler = nlp.add_pipe("entity_ruler", before="ner")

# Define skill patterns
skill_df = pd.read_csv('./skills.csv')
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
    # Check if file path is provided as command line argument
    if len(sys.argv) < 2:
        error_result = {"error": "No file path provided. Usage: python NLSP.py <file_path>"}
        print(json.dumps(error_result))
        sys.exit(1)
    
    pdf_path = sys.argv[1]  # Get file path from command line argument
    
    try:
        result = parse_resume_pdf(pdf_path)
        # Output result as JSON
        print(json.dumps(result, indent=2))
    except Exception as e:
        error_result = {"error": f"Failed to process file: {str(e)}"}
        print(json.dumps(error_result))
        sys.exit(1)
