# CSV Data Processor & Analyzer

A professional tool for processing, validating, and analyzing CSV files with report generation.

## Features

- 📁 Parsing CSV files of any size
- ✅ Data validation using multiple rules
- 📈 Aggregation and statistical analysis
- 📊 JSON report generation
- 🎯 Configurable validation logic
- 📝 Detailed process logging
- 🚀 High performance

## Quick Start

### Installation

```bash
git clone https://github.com/your-username/csv-processor.git
cd csv-processor
npm install
```

### Usage

```bash
npm start
npm start -- --input data/data.csv --output results/report.json
```

### Configuration example

```
INPUT_FILE_PATH=data/data.csv
OUTPUT_FILE_PATH=results/report.json
LOG_LEVEL=info
MAX_FILE_SIZE=1000000
```

## CSV Example

```csv
id,category,country,price,quantity,sold_at
P123,Electronics,US,299.99,2,2024-01-15T10:30:00Z
456,Books,GB,19.99,5,2024-01-15T11:15:00Z
```

## Technologies

- **TypeScript** - static typing
- **Node.js** - runtime

## Architecture

```
src/
├── config/ # Configuration
├── types/ # TypeScript types
├── utils/ # Main logic
│ ├── csv-processor.ts
│ ├── validator.ts
│ ├── aggregator.ts
│ ├── writer.ts
│ └── logger.ts
└── index.ts # Entry point
```

## Example report

```json
{
  "totalLines": 9,
  "validLines": 9,
  "invalidLines": 0,
  "skippedRows": 0,
  "stat": {
    "totalItems": 29,
    "totalRevenue": 2339.71,
    "categoriesCount": 8,
    "countriesCount": 9,
    "categoriesStats": {
      "items": {
        "Books": 5,
        "Clothing": 3,
        "Electronics": 3,
        "Groceries": 10,
        "Home Decor": 1,
        "Jewelry": 1,
        "Sports": 2,
        "Toys": 4
      },
      "revenue": {
        "Books": 99.94,
        "Clothing": 149.97,
        "Electronics": 1199.97,
        "Groceries": 59.96,
        "Home Decor": 129.99,
        "Jewelry": 399.99,
        "Sports": 179.98,
        "Toys": 119.96
      },
      "avgPrice": {
        "Books": 19.99,
        "Clothing": 49.99,
        "Electronics": 449.99,
        "Groceries": 5.99,
        "Home Decor": 129.99,
        "Jewelry": 399.99,
        "Sports": 89.99,
        "Toys": 29.99
      }
    },
    "countriesStats": {
      "items": {
        "AU": 2,
        "CA": 4,
        "DE": 3,
        "ES": 1,
        "FR": 10,
        "GB": 5,
        "IT": 1,
        "JP": 1,
        "US": 2
      },
      "revenue": {
        "AU": 179.98,
        "CA": 119.96,
        "DE": 149.97,
        "ES": 399.99,
        "FR": 59.96,
        "GB": 99.94,
        "IT": 129.99,
        "JP": 599.99,
        "US": 599.98
      },
      "avgPrice": {
        "AU": 89.99,
        "CA": 29.99,
        "DE": 49.99,
        "ES": 399.99,
        "FR": 5.99,
        "GB": 19.99,
        "IT": 129.99,
        "JP": 599.99,
        "US": 299.99
      }
    }
  }
}
```