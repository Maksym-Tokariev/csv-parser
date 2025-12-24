# CSV Data Processor & Analyzer

A professional tool for processing, validating, and analyzing CSV files with report generation.

## Features

- Parsing CSV files of any size
- Data validation using multiple rules
- Aggregation and statistical analysis
- JSON report generation
- Configurable validation logic
- Detailed process logging
- High performance

## Quick Start

### Installation

```bash
git clone https://github.com/Maksym-Tokariev/csv-parser.git
cd csv-processor
npm install
```

### Usage

```bash
npm start
npm start -- --input data/data.csv --output results/report.json
```
### Quick Start

### Basic Usage
```ts
import { Parser } from 'csv-parser-analytics';

// Create parser with default configuration
const parser = Parser.create();

// Process CSV file
await parser
    .parse('data/data.csv')
    .aggregate()
    .write('results/report.json');

console.log('Processing completed!');
```

#### Configuration example

```ts
import { Parser } from 'package';

async function processSalesData() {
    const parser = Parser.create({
        paths: {
            resultsDir: './reports',
            resultFileName: 'sales-report.json'
        },
        logging: {
            level: 'info',
            showTimestamp: true,
            showContext: true
        },
        aggregation: {
            calculateTotalRevenue: true,
            calculateDimensionStats: true,
            fractionDigits: 2
        }
    });

    try {
        await parser
            .parse('sales.csv')
            .aggregate()
            .write();

        const result = parser.getResult();
        console.log(`Raw parsed: ${result.totalLines}`);
        console.log(`Raw validated: ${result.validLines}`);
        
        const config = parser.getConfig();
        console.log('Current config: ', config);
    } catch (error) {
        console.error('Error handling:', error);
    }
}
```

## Default config example

```
{
  paths: {
    resultsDir: './results',                    // Output directory
    resultFileName: 'report.json',              // Report filename
    outputFormat: 'json'                        // Output format
  },
  parsing: {
    columns: [                                  // Expected CSV columns
      'id',
      'category',
      'country',
      'price',
      'quantity',
      'sold_at'
    ],
    numberOfColumns: 6,                         // Number of columns
    maxLineSize: 30,                           // Maximum line length
    dateFormat: 'YYYY-MM-DDTHH:MM:SSZ',        // Date format
    idPrefix: 'P',                             // ID prefix (e.g., P123)
    separator: ','                             // CSV separator
  },
  validation: {
    validateId: true,                          // Validate ID format (P + numbers)
    validatePrice: true,                       // Validate price format
    validateQuantity: true,                    // Validate quantity format
    validateSoldAt: true,                      // Validate date format
    validateStringValues: true,                // Validate string fields
    validateEmptyLines: true,                  // Check for empty lines
    maxQuantity: 1000000,                      // Maximum quantity value
    maxPrice: 1000000,                         // Maximum price value
    specialCharsRegEx: /[@#$%^*()_+=[\]{}|;:"<>?~]/, // Special chars regex
  digitsRegExp: /\d/,                          // Digit regex
  isoRegExp: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/, // ISO date regex
  positiveIntegerRegex: /^(0|[1-9]\d*)$/,       // Positive integer regex
  floatNumberRegEx: /^\d+(\.\d+)?$/,            // Float number regex
  hasHeader: true                               // CSV has header row
  },
  aggregation: {
    aggregate: true,                            // Enable aggregation
    calculateTotalItems: true,                  // Calculate total items
    calculateTotalRevenue: true,                // Calculate total revenue
    calculateDimensionStats: true,              // Calculate category/country stats
    fractionDigits: 2                           // Decimal places for monetary values
  },
  logging: {
    level: 'info',                              // Log level: debug|info|warn|error|none
    showTimestamp: true,                        // Show timestamps
    showLevel: true,                            // Show log level
    showContext: true,                          // Show class context
    maxMessageLen: 1000                         // Maximum log message length
  }
  }
```
#### Available Separators
```ts
// Supported CSV separators
SEPARATORS = {
    COMMA: ',',        // Standard comma
    SEMICOLON: ';',    // Semicolon
    SPACE: ' ',        // Space
    VERTICAL_LINE: '|' // Pipe
}
```

#### Log Levels
```ts
LOG_LEVEL = {
    DEBUG: 'debug',    // Detailed debug information
    INFO: 'info',      // General processing information
    WARN: 'warn',      // Warnings and validation issues
    ERROR: 'error',    // Processing errors
    NONE: 'none'       // No logging
}
```

## CSV Example

### Expected CSV Structure
```csv
id,category,country,price,quantity,sold_at
P123,Electronics,US,299.99,2,2024-01-15T10:30:00Z
456,Books,GB,19.99,5,2024-01-15T11:15:00Z
```

## Field Requirements

| Field    | Format       | Validation Rules                               |
|----------|--------------|------------------------------------------------|
| id	      | String       | 	Starts with 'P' prefix followed by numbers    |
| category | 	String      | 	No digits or special characters               |
| country  | 	String	     | No digits or special characters                |
| price	   | Float        | 	Positive number, max 1,000,000                |
| quantity | Integer      | 	Positive integer, max 1,000,000               |
| sold_at  | 	DateTime    | 	ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ)        |

## Technologies

- **TypeScript** - static typing
- **Node.js** - runtime
## Architecture

```
src/
├── config/               # Configuration constants and defaults
│   ├── constants.ts      # Application constants
│   ├── default-config.ts # Default configuration
│   ├── logging.ts        # Logging configuration
│   └── validation.ts     # Validation constants
├── interfaces/           # TypeScript interfaces
│   └── iconfig-service.ts # Service interfaces
├── services/            # Core business logic
│   ├── aggregator.ts    # Data aggregation service
│   ├── config-service.ts # Configuration management
│   ├── csv-processor.ts # CSV parsing service
│   ├── error-reporter.ts # Error reporting service
│   ├── logger.ts        # Logging service
│   ├── services-factory.ts # Service factory
│   ├── validator.ts     # Validation service
│   └── writer.ts        # Report writing service
├── types/              # TypeScript type definitions
│   ├── config-types.ts # Configuration types
│   ├── parsing-types.ts # Parsing-related types
│   ├── stat-types.ts   # Statistics types
│   └── validation-types.ts # Validation types
├── utils/              # Utility functions
│   └── context.ts      # Context utilities
└── index.ts           # Main entry point       
```

## Example report

```json
{
  "totalLines": 100,
  "validLines": 95,
  "invalidLines": 5,
  "skippedRows": 5,
  "stat": {
    "totalItems": 150,
    "totalRevenue": 15499.50,
    "categoriesCount": 5,
    "countriesCount": 3,
    "categoriesStats": {
      "items": { "Electronics": 50, "Books": 100 },
      "revenue": { "Electronics": 14999.50, "Books": 500.00 },
      "avgPrice": { "Electronics": 299.99, "Books": 19.99 }
    },
    "countriesStats": {
      "items": { "USA": 80, "UK": 70 },
      "revenue": { "USA": 11999.60, "UK": 3499.90 },
      "avgPrice": { "USA": 299.99, "UK": 19.99 }
    }
  }
}
```