# Question Import Guide

## Overview

Teachers can now import quiz questions from Excel, JSON, or CSV files instead of manually entering them. After importing, teachers assign marks to each question and set the quiz duration.

## Supported File Formats

1. **Excel** (.xlsx, .xls)
2. **JSON** (.json)
3. **CSV** (.csv)

## File Format Requirements

### Excel/CSV Format

Required columns:

- **Question** or **Question Text**: The question text
- **Type**: Question type (mcq, short_answer, long_answer)
- **Option1, Option2, Option3, Option4** (for MCQ): Answer options
- **Correct Answer**: The correct answer
- **Marks** (optional): Can be assigned later in the UI

Example Excel structure:

```
Question                    | Type | Option1 | Option2 | Option3 | Option4 | Correct Answer
What is 2+2?               | mcq  | 3       | 4       | 5       | 6       | 4
Explain JavaScript         | short_answer |        |        |        |        | JavaScript is a programming language
```

### JSON Format

Two formats are supported:

**Format 1: Array of questions**

```json
[
  {
    "question_text": "What is 2+2?",
    "question_type": "mcq",
    "options": ["3", "4", "5", "6"],
    "correct_answer": "4",
    "marks": 5
  },
  {
    "question_text": "Explain JavaScript",
    "question_type": "short_answer",
    "correct_answer": "JavaScript is a programming language",
    "marks": 10
  }
]
```

**Format 2: Object with questions array**

```json
{
  "questions": [
    {
      "question_text": "What is 2+2?",
      "question_type": "mcq",
      "options": ["3", "4", "5", "6"],
      "correct_answer": "4"
    }
  ]
}
```

### CSV Format

CSV should have headers in the first row:

```csv
Question,Type,Option1,Option2,Option3,Option4,Correct Answer
What is 2+2?,mcq,3,4,5,6,4
Explain JavaScript,short_answer,,,,"JavaScript is a programming language"
```

## How to Use

1. **Navigate to Quizzes** page in Teacher Dashboard
2. **Select a Subject**
3. Click **"Import Questions from File"** button
4. **Upload your file** (Excel, JSON, or CSV)
5. **Review imported questions** - All questions from the file will be displayed
6. **Fill in quiz information**:
   - Select Experiment
   - Enter Quiz Title
   - Set Duration (optional)
   - Set Start/End Dates (optional)
7. **Assign marks** to each question (required)
8. **Click "Create Quiz"** to create the quiz with all imported questions

## Features

- ✅ Supports multiple file formats (Excel, JSON, CSV)
- ✅ Automatic question type detection
- ✅ Option parsing for MCQ questions
- ✅ Marks assignment interface
- ✅ Total marks calculation
- ✅ Validation before quiz creation

## Notes

- Questions without marks assigned will be excluded from the quiz
- MCQ questions require options to be provided
- The correct answer should match one of the options for MCQ questions
- Question types: `mcq`, `short_answer`, `long_answer`











