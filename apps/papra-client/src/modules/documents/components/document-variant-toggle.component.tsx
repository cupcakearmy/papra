import type { Component } from 'solid-js';
import { Show } from 'solid-js';
import { useI18n } from '@/modules/i18n/i18n.provider';
import { ToggleGroup, ToggleGroupItem } from '@/modules/ui/components/toggle-group';

export type DocumentVariant = 'original' | 'ocr';

export const DocumentVariantToggle: Component<{
  value: DocumentVariant;
  onChange: (value: DocumentVariant) => void;
  hasOcr: boolean;
}> = (props) => {
  const { t } = useI18n();

  return (
    <Show when={props.hasOcr}>
      <ToggleGroup
        multiple={false}
        value={props.value}
        onChange={(value) => value && props.onChange(value as DocumentVariant)}
        variant="outline"
        size="sm"
      >
        <ToggleGroupItem value="original">{t('documents.variant.original')}</ToggleGroupItem>
        <ToggleGroupItem value="ocr">{t('documents.variant.ocr')}</ToggleGroupItem>
      </ToggleGroup>
    </Show>
  );
};
