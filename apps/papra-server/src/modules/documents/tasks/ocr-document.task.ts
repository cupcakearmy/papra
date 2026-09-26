import type { Database } from '../../app/database/database.types';
import type { Config } from '../../config/config.types';
import type { StorageService } from '../../storage/storage.services';
import type { TaskServices } from '../../tasks/tasks.services';
import { Readable } from 'node:stream';
import { isOcrMyPdfCliAvailable, ocrPdf } from '@papra/ocrmypdf';
import { createLogger } from '../../shared/logger/logger';
import { collectStreamToFile } from '../../shared/streams/stream.convertion';
import { buildOcrDocumentKey } from '../documents.models';
import { createDocumentsRepository } from '../documents.repository';

export async function registerOcrDocumentTask({
  taskServices,
  db,
  documentsStorageService,
  config,
}: {
  taskServices: TaskServices;
  db: Database;
  documentsStorageService: StorageService;
  config: Config;
}) {
  const taskName = 'ocr-document';
  const logger = createLogger({ namespace: 'documents:tasks:ocr-document' });

  taskServices.registerTask({
    taskName,
    handler: async ({ data }) => {
      const documentsRepository = createDocumentsRepository({ db });

      // TODO: remove type cast
      const { documentId, organizationId } = data as {
        documentId: string;
        organizationId: string;
      };

      const { document } = await documentsRepository.getDocumentById({
        documentId,
        organizationId,
      });

      if (!document) {
        return;
      }

      if (document.mimeType !== 'application/pdf') {
        return;
      }

      if (!config.documents.isOcrMyPdfEnabled) {
        return;
      }

      const binary = config.documents.ocrMyPdfBinary;

      const isAvailable = await isOcrMyPdfCliAvailable({ binary });

      if (!isAvailable) {
        logger.info({ binary, documentId }, 'OCRmyPDF binary is not available, skipping OCR');
        return;
      }

      const { ocrStorageKey } = buildOcrDocumentKey({ documentId, organizationId });

      try {
        const { fileStream } = await documentsStorageService.getFileStream({
          storageKey: document.originalStorageKey,
          fileEncryptionAlgorithm: document.fileEncryptionAlgorithm,
          fileEncryptionKekVersion: document.fileEncryptionKekVersion,
          fileEncryptionKeyWrapped: document.fileEncryptionKeyWrapped,
        });

        const { file } = await collectStreamToFile({
          fileStream,
          fileName: document.name,
          mimeType: document.mimeType,
        });

        const pdf = Buffer.from(await file.arrayBuffer());

        const { pdf: ocrPdfBuffer } = await ocrPdf({
          pdf,
          config: { binary, languages: config.documents.ocrLanguages },
        });

        if (document.ocrStorageKey) {
          await documentsStorageService.deleteFile({ storageKey: document.ocrStorageKey });
        }

        const { fileEncryptionKeyWrapped, fileEncryptionKekVersion, fileEncryptionAlgorithm } =
          await documentsStorageService.saveFile({
            fileStream: Readable.from(ocrPdfBuffer),
            storageKey: ocrStorageKey,
            mimeType: 'application/pdf',
            fileName: document.name,
          });

        await documentsRepository.updateDocumentOcrFile({
          documentId,
          organizationId,
          ocrStorageKey,
          ocrSize: ocrPdfBuffer.length,
          ocrFileEncryptionKeyWrapped: fileEncryptionKeyWrapped,
          ocrFileEncryptionKekVersion: fileEncryptionKekVersion,
          ocrFileEncryptionAlgorithm: fileEncryptionAlgorithm,
        });

        logger.info({ documentId, organizationId }, 'OCR document created');
      } catch (error) {
        logger.error({ documentId, organizationId, error }, 'Error while OCRing document');

        // Best-effort cleanup, the OCR failure must not fail the job
        try {
          await documentsStorageService.deleteFile({ storageKey: ocrStorageKey });
        } catch (deleteError) {
          logger.error(
            { documentId, organizationId, deleteError },
            'Error while deleting OCR document file after failure',
          );
        }
      }
    },
  });
}
