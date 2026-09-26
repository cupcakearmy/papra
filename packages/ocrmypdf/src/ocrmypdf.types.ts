export type OcrMyPdfOutputType = 'pdf' | 'pdfa' | 'pdfa-1' | 'pdfa-2' | 'pdfa-3';

export type OcrMyPdfConfig = {
  /** Path or name of the OCRmyPDF binary. A bare name is resolved from PATH. @default 'ocrmypdf' */
  binary?: string;
  /** Tesseract language codes passed via `-l` (joined with `+`). @default ['eng'] */
  languages?: string[];
  /** OCRmyPDF `--output-type`. @default 'pdfa' */
  outputType?: OcrMyPdfOutputType;
  /** Pass `--skip-text`: pages that already contain text are skipped instead of failing. @default true */
  skipText?: boolean;
  /** Raw extra arguments appended to the OCRmyPDF invocation. */
  extraArgs?: string[];
};
