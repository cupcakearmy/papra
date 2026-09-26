import type { Buffer } from 'node:buffer';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { x as exec } from 'tinyexec';
import type { OcrMyPdfConfig, OcrMyPdfOutputType } from './ocrmypdf.types';

export async function isOcrMyPdfCliAvailable({
  binary = 'ocrmypdf',
}: { binary?: string } = {}): Promise<boolean> {
  // OCRmyPDF is a CLI, only available in Node runtimes.
  // eslint-disable-next-line node/prefer-global/process
  const isNode = typeof process !== 'undefined' && Boolean(process?.versions?.node);
  if (!isNode) {
    return false;
  }

  try {
    const result = await exec(binary, ['--version'], { throwOnError: true });

    return result.exitCode === 0;
  } catch {
    return false;
  }
}

export function buildOcrMyPdfArgs({
  inputPath,
  outputPath,
  languages = ['eng'],
  outputType = 'pdfa',
  skipText = true,
  extraArgs = [],
}: {
  inputPath: string;
  outputPath: string;
  languages?: string[];
  outputType?: OcrMyPdfOutputType;
  skipText?: boolean;
  extraArgs?: string[];
}): string[] {
  return [
    inputPath,
    outputPath,
    ...(skipText ? ['--skip-text'] : []),
    '--output-type',
    outputType,
    '-l',
    languages.join('+'),
    ...extraArgs,
  ];
}

export async function ocrPdf({
  pdf,
  config = {},
}: {
  pdf: Uint8Array | Buffer;
  config?: OcrMyPdfConfig;
}): Promise<{ pdf: Buffer }> {
  const { binary = 'ocrmypdf', ...argsConfig } = config;

  // OCRmyPDF needs seekable files, so we round-trip through a temp directory.
  const workingDirectory = await mkdtemp(join(tmpdir(), 'papra-ocrmypdf-'));

  try {
    const inputPath = join(workingDirectory, 'input.pdf');
    const outputPath = join(workingDirectory, 'output.pdf');

    await writeFile(inputPath, pdf);
    await exec(binary, buildOcrMyPdfArgs({ inputPath, outputPath, ...argsConfig }), {
      throwOnError: true,
    });

    const outputBuffer = await readFile(outputPath);

    return { pdf: outputBuffer };
  } finally {
    await rm(workingDirectory, { recursive: true, force: true });
  }
}
