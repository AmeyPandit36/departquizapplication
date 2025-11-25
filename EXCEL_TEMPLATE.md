# Excel Import Template Guide

## Format for Importing Users

When importing users via Excel, the file should contain the following columns:

### For Teachers

| Teacher ID | Name       | Email            | Password   | Qualification |
| ---------- | ---------- | ---------------- | ---------- | ------------- |
| T001       | John Doe   | john@example.com | teacher123 | M.Tech        |
| T002       | Jane Smith | jane@example.com |            | B.E.          |

**Column Notes:**

- **Teacher ID** (required): Unique identifier for the teacher
- **Name** or **Teacher Name** (required): Full name of the teacher
- **Email** (optional): Email address
- **Password** (optional): If not provided, defaults to `teacher123`
- **Qualification** (optional): Teacher's qualification

### For Students

| Student ID | Name          | Email             | Password   |
| ---------- | ------------- | ----------------- | ---------- |
| S001       | Alice Johnson | alice@example.com | student123 |
| S002       | Bob Williams  | bob@example.com   |            |

**Column Notes:**

- **Student ID** or **User ID** (required): Unique identifier for the student
- **Name** or **Student Name** (required): Full name of the student
- **Email** (optional): Email address
- **Password** (optional): If not provided, defaults to `student123`

## Alternative Column Names

The system accepts these alternative column names:

- For ID: `Teacher ID`, `Student ID`, or `User ID`
- For Name: `Name`, `Teacher Name`, or `Student Name`

## Example Excel File Structure

### Teachers.xlsx

```
Teacher ID | Name          | Email              | Password   | Qualification
-----------|---------------|--------------------|------------|---------------
T001       | John Doe      | john@example.com   | teacher123 | M.Tech
T002       | Jane Smith    | jane@example.com   |            | B.E.
T003       | Bob Johnson   | bob@example.com    | pass123    | Ph.D.
```

### Students.xlsx

```
Student ID | Name          | Email              | Password
-----------|---------------|--------------------|------------
S001       | Alice Johnson | alice@example.com  | student123
S002       | Bob Williams  | bob@example.com    |
S003       | Charlie Brown | charlie@example.com| pass456
```

## Import Process

1. Go to Admin Dashboard
2. Navigate to Teachers or Students section
3. Click "Import Excel" button
4. Select your Excel file (.xlsx or .xls)
5. The system will process the file and show results

## Important Notes

- **File Format**: Only `.xlsx` and `.xls` formats are supported
- **Unique IDs**: Each user ID must be unique across the system
- **Password Security**: Default passwords should be changed after import
- **Subject Assignment**: Users need to be assigned to subjects separately after import
- **Errors**: If some rows fail, check the error messages in the import results

## Troubleshooting

### Common Issues

1. **"User ID already exists"**

   - Each user ID must be unique
   - Check if the user already exists in the system

2. **"Missing required fields"**

   - Ensure User ID and Name columns are present
   - Check for empty cells in required columns

3. **"Invalid file format"**

   - Ensure file is saved as .xlsx or .xls
   - Try opening and re-saving the file in Excel

4. **"Import partially failed"**
   - Check the error messages in the import results
   - Fix the problematic rows and re-import








