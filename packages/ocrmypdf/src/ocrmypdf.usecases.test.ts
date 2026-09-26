import { describe, expect, test } from 'vitest';
import { buildOcrMyPdfArgs } from './ocrmypdf.usecases';

describe('ocrmypdf', () => {
  describe('buildOcrMyPdfArgs', () => {
    test('defaults to pdfa, eng and skip-text', () => {
      expect(buildOcrMyPdfArgs({ inputPath: 'in.pdf', outputPath: 'out.pdf' })).toEqual([
        'in.pdf',
        'out.pdf',
        '--skip-text',
        '--output-type',
        'pdfa',
        '-l',
        'eng',
      ]);
    });

    test('joins multiple languages with +', () => {
      expect(
        buildOcrMyPdfArgs({ inputPath: 'i', outputPath: 'o', languages: ['eng', 'deu'] }),
      ).toContain('eng+deu');
    });

    test('omits --skip-text when disabled', () => {
      expect(buildOcrMyPdfArgs({ inputPath: 'i', outputPath: 'o', skipText: false })).not.toContain(
        '--skip-text',
      );
    });

    test('appends extraArgs', () => {
      expect(
        buildOcrMyPdfArgs({ inputPath: 'i', outputPath: 'o', extraArgs: ['--rotate-pages'] }),
      ).toContain('--rotate-pages');
    });
  });
});
