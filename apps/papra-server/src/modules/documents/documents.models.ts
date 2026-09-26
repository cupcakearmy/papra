import type { PartialBy } from '@corentinth/chisels';
import type { DbSelectableDocument } from './documents.types';
import filenamify from 'filenamify';
import { getExtension } from '../shared/files/file-names';
import { omit } from '../shared/objects';
import { generateId } from '../shared/random/ids';
import { isDefined } from '../shared/utils';
import { ORIGINAL_DOCUMENTS_STORAGE_KEY, OCR_DOCUMENTS_STORAGE_KEY } from './documents.constants';

export function joinStorageKeyParts(...parts: string[]) {
  return parts.join('/');
}

export function buildOriginalDocumentKey({
  documentId,
  organizationId,
  fileName,
}: {
  documentId: string;
  organizationId: string;
  fileName: string;
}) {
  const { extension } = getExtension({ fileName });

  const newFileName = isDefined(extension) ? `${documentId}.${extension}` : documentId;

  const originalDocumentStorageKey = joinStorageKeyParts(
    organizationId,
    ORIGINAL_DOCUMENTS_STORAGE_KEY,
    newFileName,
  );

  return { originalDocumentStorageKey };
}

export function generateDocumentId() {
  return generateId({ prefix: 'doc' });
}

export function buildOcrDocumentKey({
  documentId,
  organizationId,
}: {
  documentId: string;
  organizationId: string;
}) {
  const ocrStorageKey = joinStorageKeyParts(
    organizationId,
    OCR_DOCUMENTS_STORAGE_KEY,
    `${documentId}.pdf`,
  );

  return { ocrStorageKey };
}

export function isDocumentSizeLimitEnabled({ maxUploadSize }: { maxUploadSize: number }) {
  return maxUploadSize > 0;
}

export function formatDocumentForApi<T extends PartialBy<DbSelectableDocument, 'content'>>({
  document,
}: {
  document: T;
}) {
  return omit(document, [
    'fileEncryptionAlgorithm',
    'fileEncryptionKeyWrapped',
    'fileEncryptionKekVersion',
    'originalStorageKey',
    'ocrStorageKey',
    'ocrFileEncryptionKeyWrapped',
    'ocrFileEncryptionKekVersion',
    'ocrFileEncryptionAlgorithm',
  ]);
}

export function formatDocumentsForApi<T extends PartialBy<DbSelectableDocument, 'content'>>({
  documents,
}: {
  documents: T[];
}) {
  return documents.map((document) => formatDocumentForApi({ document }));
}

export function ensureSafeFileName(fileName: string) {
  return filenamify(fileName, { replacement: '_' });
}
