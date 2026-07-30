import { Injectable } from '@nestjs/common';
import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import { dirname, join } from 'path';
import PDFDocument from 'pdfkit';

@Injectable()
export class PdfService {
  async createDoctorReport(opts: {
    filePath: string;
    title: string;
    patientName: string;
    from: string;
    to: string;
    summary: Record<string, unknown>;
  }) {
    await mkdir(dirname(opts.filePath), { recursive: true });
    const doc = new PDFDocument({ margin: 50 });
    const stream = createWriteStream(opts.filePath);
    doc.pipe(stream);
    doc.fontSize(20).text('Luna Doctor Report', { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(`Title: ${opts.title}`);
    doc.text(`Patient: ${opts.patientName}`);
    doc.text(`Range: ${opts.from} → ${opts.to}`);
    doc.moveDown();
    doc.text('Summary');
    doc.text(JSON.stringify(opts.summary, null, 2));
    doc.end();
    await new Promise<void>((resolve, reject) => {
      stream.on('finish', () => resolve());
      stream.on('error', reject);
    });
    return opts.filePath;
  }

  reportsDir() {
    return join(process.cwd(), 'uploads', 'reports');
  }
}
