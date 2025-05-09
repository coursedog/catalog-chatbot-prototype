# CSV Parsing 101: Best Practices for Coursedog Data Integration

## Table of Contents
1. [Introduction](#introduction)
2. [CSV File Structure](#csv-file-structure)
3. [Data Types and Formatting](#data-types-and-formatting)
4. [CSV to JSON Mapping](#csv-to-json-mapping)
5. [Common CSV Parsing Workflows](#common-csv-parsing-workflows)
6. [Handling Special Cases](#handling-special-cases)
7. [Troubleshooting](#troubleshooting)
8. [Appendix: Example CSV Templates](#appendix-example-csv-templates)

## Introduction

This guide provides comprehensive information on CSV (Comma-Separated Values) parsing for integration with the Coursedog platform. Whether you're importing course data, program information, or user details, following these best practices will ensure smooth data integration and minimize errors.

CSV files are a common format for exchanging data between systems due to their simplicity and universal support. However, proper formatting is crucial for successful data imports into Coursedog.

## CSV File Structure

### Basic Structure

A CSV file consists of:
- A header row defining column names
- Data rows containing the actual values
- Commas (or other delimiters) separating individual values
- Optional quotes around values containing special characters

### Header Requirements

- **Use Clear, Consistent Headers**: Header names should match Coursedog's expected field names
- **Avoid Special Characters**: Keep header names simple, using only letters, numbers, and underscores
- **Case Sensitivity**: Header names are case-sensitive in Coursedog
- **Required Headers**: Each entity type has specific required headers (see entity-specific sections below)

### Example of Well-Structured CSV

```csv
code,subject,course_number,title,description,credits
ACCT2000,ACCT,2000,Principles of Accounting,Introduction to accounting principles and practices,3
BIOL1010,BIOL,1010,Introduction to Biology,Basic concepts in biology,4
```

### Common Structural Issues to Avoid

- Missing header row
- Inconsistent number of columns across rows
- Mixing different delimiters (e.g., commas and semicolons)
- Unescaped quotes or special characters
- Byte Order Mark (BOM) characters at the beginning of the file
- Inconsistent line endings (mixing CRLF and LF)

## Data Types and Formatting

### Text Fields

- **Basic Text**: Simple text fields require no special formatting
- **Long Text/Descriptions**: For fields containing paragraphs, ensure proper escaping of quotes and commas
- **Codes and IDs**: Keep consistent formatting (e.g., all uppercase, no spaces)

### Numeric Fields

- **Integers**: Use plain numbers without commas or currency symbols (e.g., `42` not `$42` or `42.00`)
- **Decimals**: Use period as decimal separator (e.g., `3.5` not `3,5`)
- **Credits**: For course credits, use decimal format for fractional credits (e.g., `3.5` for 3.5 credits)

### Date and Time Fields

- **Standard Format**: Use ISO 8601 format (YYYY-MM-DD) for dates
- **Time Format**: Use 24-hour format (HH:MM) for times
- **Timestamps**: Use ISO 8601 format (YYYY-MM-DDTHH:MM:SS) for timestamps

### Boolean Fields

- Use `true`/`false` or `1`/`0` consistently (Coursedog accepts both formats)

### List Fields

- For fields that accept multiple values, use pipe character (`|`) as separator
- Example: `Monday|Wednesday|Friday` for days of the week

### Relationship Fields

- When referencing other entities, use their unique identifier (usually code or ID)
- Ensure referenced entities exist in the system or are included in your import

## CSV to JSON Mapping

Coursedog internally represents data as JSON objects. Understanding this mapping helps create better CSV imports.

### Basic Mapping Principles

1. Each CSV row becomes a JSON object
2. CSV headers become JSON property names
3. Nested properties use dot notation in headers
4. Arrays use indexed notation or delimiters

### Example Mapping

CSV:
```csv
code,title,credits,customFields.department,customFields.level
MATH101,College Algebra,3,Mathematics,Undergraduate
```

JSON:
```json
{
  "code": "MATH101",
  "title": "College Algebra",
  "credits": 3,
  "customFields": {
    "department": "Mathematics",
    "level": "Undergraduate"
  }
}
```

### Handling Complex Data Structures

#### Nested Objects

Use dot notation in headers to represent nested objects:

```csv
code,instructor.firstName,instructor.lastName,instructor.email
MATH101,John,Doe,john.doe@example.com
```

#### Arrays

For simple arrays, use pipe-delimited values:

```csv
code,title,meetingDays
MATH101,College Algebra,Monday|Wednesday|Friday
```

For complex arrays (arrays of objects), use indexed notation:

```csv
code,sections[0].crn,sections[0].capacity,sections[1].crn,sections[1].capacity
MATH101,12345,30,12346,25
```

## Common CSV Parsing Workflows

### Course Data Import

Required fields:
- `code` - Unique course code (e.g., "MATH101")
- `subject` - Subject code (e.g., "MATH")
- `courseNumber` - Course number (e.g., "101")
- `title` - Course title
- `credits` - Number of credits

Optional but recommended fields:
- `description` - Course description
- `prerequisites` - Course prerequisites
- `corequisites` - Course corequisites
- `customFields.*` - Any custom fields configured in your instance

### Program Data Import

Required fields:
- `code` - Unique program code
- `title` - Program title
- `type` - Program type (e.g., "Major", "Minor", "Certificate")

Optional but recommended fields:
- `description` - Program description
- `department` - Department offering the program
- `totalCredits` - Total credits required
- `customFields.*` - Any custom fields configured in your instance

### User Data Import

Required fields:
- `email` - User's email address (must be unique)
- `firstName` - User's first name
- `lastName` - User's last name
- `role` - User's role in the system

Optional but recommended fields:
- `department` - User's department
- `title` - User's title
- `phone` - User's phone number
- `customFields.*` - Any custom fields configured in your instance

## Handling Special Cases

### Special Characters and Escaping

- **Quotes**: Enclose fields containing commas or quotes in double quotes
- **Double Quotes**: Escape double quotes within quoted fields by doubling them (`""`)
- **Line Breaks**: For multi-line text, enclose the entire field in quotes

Example:
```csv
code,title,description
ENGL101,Composition,"Introduction to academic writing, including ""quoted"" material and multiple
paragraphs of text."
```

### International Characters and Encoding

- **Use UTF-8 Encoding**: Always save CSV files with UTF-8 encoding
- **Avoid BOM**: Do not include Byte Order Mark (BOM) in your CSV files
- **Test Special Characters**: Verify that special characters (accents, non-Latin alphabets) import correctly

### Large Datasets

- **Split Large Files**: For very large datasets, consider splitting into multiple smaller CSV files
- **Incremental Imports**: Import data in logical batches (e.g., by department or term)
- **Validate Before Import**: Run validation checks on your CSV before importing

## Troubleshooting

### Common Import Errors

| Error | Possible Causes | Solution |
|-------|----------------|----------|
| Missing required field | Header missing or misspelled | Check header names against required fields |
| Invalid format | Data doesn't match expected format | Verify data types and formatting |
| Duplicate key | Attempting to import duplicate records | Ensure unique identifiers are truly unique |
| Reference not found | Referencing non-existent entity | Import referenced entities first or check references |
| Encoding issues | File not saved as UTF-8 | Resave file with UTF-8 encoding |

### Validation Strategies

1. **Pre-validation**: Use spreadsheet software to check for:
   - Missing values in required fields
   - Consistent data formats
   - Proper escaping of special characters

2. **Test Imports**: Test with a small subset of data before full import

3. **Post-import Verification**: After import, verify:
   - Record counts match expected numbers
   - Sample records contain correct data
   - Relationships are properly established

## Appendix: Example CSV Templates

### Course Template

```csv
code,subject,courseNumber,title,description,credits,prerequisites,corequisites
MATH101,MATH,101,College Algebra,"Introduction to algebraic concepts, including equations and inequalities",3,,
PHYS201,PHYS,201,Physics I,"Mechanics, thermodynamics, and waves",4,MATH101,
CHEM101,CHEM,101,General Chemistry,"Basic principles of chemistry",4,,CHEM101L
```

### Program Template

```csv
code,title,type,description,department,totalCredits
BSCS,Bachelor of Science in Computer Science,Major,"Comprehensive program covering software development, algorithms, and computer systems",Computer Science,120
MINMATH,Mathematics Minor,Minor,"Supplementary program in mathematical concepts",Mathematics,18
```

### User Template

```csv
email,firstName,lastName,role,department,title,phone
jsmith@example.edu,John,Smith,Faculty,Computer Science,Professor,555-123-4567
agarcia@example.edu,Ana,Garcia,Staff,Registrar,Assistant Director,555-987-6543
```

---

This guide covers the fundamental aspects of CSV parsing for Coursedog integration. For specific questions or advanced use cases, please contact Coursedog support.
