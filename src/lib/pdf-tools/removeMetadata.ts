import { loadPdf, toBlob } from './utils';

export async function removeMetadata(file: File): Promise<{ blob: Blob; removed: string[] }> {
  const doc = await loadPdf(file);
  const removed: string[] = [];
  if (doc.getTitle()) { removed.push(\`Title: "\${doc.getTitle()}"\`); }
  if (doc.getAuthor()) { removed.push(\`Author: "\${doc.getAuthor()}"\`); }
  if (doc.getSubject()) { removed.push(\`Subject: "\${doc.getSubject()}"\`); }
  if (doc.getCreator()) { removed.push(\`Creator: "\${doc.getCreator()}"\`); }
  if (doc.getProducer()) { removed.push(\`Producer: "\${doc.getProducer()}"\`); }
  if (doc.getKeywords()) { removed.push(\`Keywords: "\${doc.getKeywords()}"\`); }
  if (doc.getCreationDate()) { removed.push(\`Created: "\${doc.getCreationDate()}"\`); }
  if (doc.getModificationDate()) { removed.push(\`Modified: "\${doc.getModificationDate()}"\`); }

  doc.setTitle('');
  doc.setAuthor('');
  doc.setSubject('');
  doc.setCreator('');
  doc.setProducer('');
  doc.setKeywords([]);
  doc.setCreationDate(new Date(0));
  doc.setModificationDate(new Date(0));

  const blob = toBlob(await doc.save());
  return { blob, removed };
}