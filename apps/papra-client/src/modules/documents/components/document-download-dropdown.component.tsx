import type { DropdownMenuTriggerProps } from '@kobalte/core/dropdown-menu';
import type { VariantProps } from 'class-variance-authority';
import type { Component } from 'solid-js';
import type { buttonVariants } from '@/modules/ui/components/button';
import { Show } from 'solid-js';
import { useI18n } from '@/modules/i18n/i18n.provider';
import { Button } from '@/modules/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/modules/ui/components/dropdown-menu';
import { useDownloadDocument } from '../documents.composables';

export const DocumentDownloadDropdown: Component<{
  organizationId: string;
  documentId: string;
  hasOcr: boolean;
  variant?: VariantProps<typeof buttonVariants>['variant'];
  size?: VariantProps<typeof buttonVariants>['size'];
  class?: string;
}> = (props) => {
  const { t } = useI18n();
  const { downloadDocument } = useDownloadDocument();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        as={(triggerProps: DropdownMenuTriggerProps) => (
          <Button variant={props.variant} size={props.size} class={props.class} {...triggerProps}>
            <div class="i-tabler-download size-4 mr-2" />
            {t('documents.actions.download.title')}
            <div class="i-tabler-chevron-down size-3 ml-1" />
          </Button>
        )}
      />
      <DropdownMenuContent>
        <DropdownMenuItem
          class="cursor-pointer"
          onClick={async () =>
            downloadDocument({
              organizationId: props.organizationId,
              documentId: props.documentId,
            })
          }
        >
          <div class="i-tabler-download size-4 mr-2" />
          <span>{t('documents.actions.download.original')}</span>
        </DropdownMenuItem>

        <Show when={props.hasOcr}>
          <DropdownMenuItem
            class="cursor-pointer"
            onClick={async () =>
              downloadDocument({
                organizationId: props.organizationId,
                documentId: props.documentId,
                variant: 'ocr',
              })
            }
          >
            <div class="i-tabler-file-text size-4 mr-2" />
            <span>{t('documents.actions.download.ocr')}</span>
          </DropdownMenuItem>
        </Show>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
