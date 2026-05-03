import { loadPdf, toBlob } from './utils';

export async function fillAndFlattenForm(
  file: File,
  fieldValues: Record<string, string>
): Promise<Blob> {
  const doc = await loadPdf(file);
  const form = doc.getForm();
  const fields = form.getFields();

  for (const field of fields) {
    const name = field.getName();
    const value = fieldValues[name];
    if (value === undefined) continue;
    try {
      if (field.constructor.name === 'PDFTextField') {
        (field as any).setText(value);
      } else if (field.constructor.name === 'PDFCheckBox') {
        if (value === 'true') (field as any).check();
        else (field as any).uncheck();
      } else if (field.constructor.name === 'PDFDropdown') {
        (field as any).select(value);
      } else if (field.constructor.name === 'PDFRadioGroup') {
        (field as any).select(value);
      }
    } catch (e) {
      console.warn(`Could not set field ${name}:`, e);
    }
  }

  form.flatten();
  return toBlob(await doc.save());
}

export async function detectFormFields(
  file: File
): Promise<Array<{ name: string; type: string; options?: string[] }>> {
  const doc = await loadPdf(file);
  const form = doc.getForm();
  const fields = form.getFields();

  return fields.map(field => {
    const type = field.constructor.name
      .replace('PDF', '')
      .replace('Field', '')
      .replace('Group', '');
    const result: { name: string; type: string; options?: string[] } = {
      name: field.getName(),
      type,
    };
    if (type === 'Dropdown' || type === 'RadioGroup') {
      result.options = (field as any).getOptions?.() ?? [];
    }
    return result;
  });
}