import { CSVProcessor } from './utils/csv-processor';

async function main(): Promise<void> {
    try {
        console.log('Start parsing');
        const processor = new CSVProcessor();
        const res = await processor.parseCSV();

        console.log('\n=== Parsing Results ===');
        console.log(`Total lines processed: ${res.totalLines}`);
        console.log(`Valid records: ${res.validLines}`);
        console.log(`Invalid lines: ${res.invalidLines}`);
        console.log(`✅ Objects read: ${res.records.length}`);


        if (res.records.length === 0) {
            console.warn('No valid data found in CSV file');
        }

        if (res.validLines === 0 && res.totalLines > 0) {
            console.warn('All lines in CSV file were invalid');
        }

    } catch (error) {
        console.error('Error processing CSV file:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}

main();
