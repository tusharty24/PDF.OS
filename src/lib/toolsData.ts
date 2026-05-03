export type ToolCategory = 'organize' | 'convert' | 'optimize' | 'security' | 'edit';

export interface Tool {
  id: string;
  name: string;
  title: string; // Added for UI compatibility
  description: string;
  category: ToolCategory;
  icon: string;
  inputType: 'single' | 'multi' | 'images';
  inputLabel: string;
  outputLabel: string;
  pipelineCompatible?: boolean;
}

export const tools: Tool[] = [
  // Popular/Essential Tools First
  { id: 'merge', name: 'Merge Files', title: 'Merge Files', description: 'Combine multiple PDFs into one single document quickly and easily.', category: 'organize', icon: 'layers', inputType: 'multi', inputLabel: 'Drop Files', outputLabel: 'Merged PDF' },
  { id: 'compress', name: 'Shrink Size', title: 'Shrink Size', description: 'Reduce the file size of your PDF without losing too much quality.', category: 'optimize', icon: 'compress', inputType: 'single', inputLabel: 'Select PDF', outputLabel: 'Compressed PDF', pipelineCompatible: true },
  { id: 'split', name: 'Split PDF', title: 'Split PDF', description: 'Break one PDF into multiple files or extract specific pages.', category: 'organize', icon: 'call_split', inputType: 'single', inputLabel: 'Select PDF', outputLabel: 'Split Pages' },
  { id: 'protect', name: 'Lock PDF', title: 'Lock PDF', description: 'Add a password to your document to keep your sensitive info safe.', category: 'security', icon: 'lock', inputType: 'single', inputLabel: 'Secure PDF', outputLabel: 'Protected PDF', pipelineCompatible: true },

  // Organization Tools
  { id: 'remove-pages', name: 'Delete Pages', title: 'Delete Pages', description: 'Remove unwanted pages from your document in just a few clicks.', category: 'organize', icon: 'delete', inputType: 'single', inputLabel: 'Target PDF', outputLabel: 'Cleaned PDF', pipelineCompatible: true },
  { id: 'reorder', name: 'Rearrange Pages', title: 'Rearrange Pages', description: 'Change the order of pages to get your document just right.', category: 'organize', icon: 'reorder', inputType: 'single', inputLabel: 'Select PDF', outputLabel: 'Sorted PDF' },
  { id: 'rotate', name: 'Rotate PDF', title: 'Rotate PDF', description: 'Flip your pages horizontally or vertically if they are upside down.', category: 'organize', icon: 'rotate_right', inputType: 'single', inputLabel: 'Input PDF', outputLabel: 'Rotated PDF', pipelineCompatible: true },

  // Conversion Tools
  { id: 'pdf-to-images', name: 'PDF to Image', title: 'PDF to Image', description: 'Turn your PDF pages into high-quality JPEG or PNG images.', category: 'convert', icon: 'image', inputType: 'single', inputLabel: 'Select PDF', outputLabel: 'Images' },
  { id: 'images-to-pdf', name: 'Images to PDF', title: 'Images to PDF', description: 'Convert your photos and pictures into a single, neat PDF file.', category: 'convert', icon: 'add_photo_alternate', inputType: 'images', inputLabel: 'Drop Images', outputLabel: 'New PDF' },
  { id: 'pdf-to-ai', name: 'PDF to AI', title: 'PDF to AI', description: 'Extract and format PDF text into LLM-optimized JSON for better AI processing.', category: 'convert', icon: 'smart_toy', inputType: 'single', inputLabel: 'Select PDF', outputLabel: 'JSON File' },
  { id: 'pdf-to-text', name: 'PDF to Text', title: 'PDF to Text', description: 'Copy the text out of your PDF to use it in other programs.', category: 'convert', icon: 'short_text', inputType: 'single', inputLabel: 'Select PDF', outputLabel: 'Text File' },
  { id: 'pdf-to-zip', name: 'PDF to ZIP', title: 'PDF to ZIP', description: 'Package your PDF pages into a compressed ZIP folder.', category: 'convert', icon: 'archive', inputType: 'single', inputLabel: 'Select PDF', outputLabel: 'ZIP File' },

  // Security & Editing
  { id: 'unlock', name: 'Unlock PDF', title: 'Unlock PDF', description: 'Remove passwords from PDFs so you can open them anytime.', category: 'security', icon: 'lock_open', inputType: 'single', inputLabel: 'Select PDF', outputLabel: 'Unlocked PDF' },
  { id: 'watermark', name: 'Add Watermark', title: 'Add Watermark', description: 'Stamp your name or company logo on every page for branding.', category: 'security', icon: 'branding_watermark', inputType: 'single', inputLabel: 'Select PDF', outputLabel: 'Branded PDF', pipelineCompatible: true },
  { id: 'remove-metadata', name: 'Clean Data', title: 'Clean Data', description: 'Wipe hidden info like author name and creation date from your file.', category: 'security', icon: 'visibility_off', inputType: 'single', inputLabel: 'Select PDF', outputLabel: 'Cleaned PDF', pipelineCompatible: true },
  { id: 'page-numbers', name: 'Add Numbers', title: 'Add Numbers', description: 'Number your pages automatically at the bottom or top.', category: 'edit', icon: 'format_list_numbered', inputType: 'single', inputLabel: 'Select PDF', outputLabel: 'Numbered PDF', pipelineCompatible: true },
  { id: 'crop', name: 'Crop PDF', title: 'Crop PDF', description: 'Trim the edges of your pages to remove white space or margins.', category: 'edit', icon: 'crop', inputType: 'single', inputLabel: 'Select PDF', outputLabel: 'Cropped PDF', pipelineCompatible: true },
  { id: 'sign', name: 'Sign Document', title: 'Sign Document', description: 'Draw or upload your signature to sign your PDFs digitally.', category: 'edit', icon: 'draw', inputType: 'single', inputLabel: 'Select PDF', outputLabel: 'Signed PDF' },
  { id: 'fill-forms', name: 'Fill Forms', title: 'Fill Forms', description: 'Type directly into PDF forms and save them permanently.', category: 'edit', icon: 'edit_square', inputType: 'single', inputLabel: 'Select PDF', outputLabel: 'Filled PDF' },
  { id: 'redact', name: 'Black Out', title: 'Black Out', description: 'Permanently hide sensitive info by drawing black boxes over it.', category: 'edit', icon: 'ink_eraser', inputType: 'single', inputLabel: 'Select PDF', outputLabel: 'Redacted PDF' },
  { id: 'repair', name: 'Fix PDF', title: 'Fix PDF', description: 'Try to recover data from broken or corrupted PDF files.', category: 'optimize', icon: 'build', inputType: 'single', inputLabel: 'Select PDF', outputLabel: 'Repaired PDF', pipelineCompatible: true },
];

export const toolsData: Record<string, Tool> = tools.reduce((acc, tool) => {
  acc[tool.id] = tool;
  return acc;
}, {} as Record<string, Tool>);

export const pipelineTools = tools.filter(t => t.pipelineCompatible);

export const categories: { id: ToolCategory; label: string; icon: string }[] = [
  { id: 'organize', label: 'Organize', icon: 'folder' },
  { id: 'convert', label: 'Convert', icon: 'sync' },
  { id: 'optimize', label: 'Optimize', icon: 'bolt' },
  { id: 'security', label: 'Security', icon: 'shield' },
  { id: 'edit', label: 'Edit PDF', icon: 'edit' },
];

export function getToolById(id: string): Tool | undefined {
  return tools.find(t => t.id === id);
}

export function getToolsByCategory(category: ToolCategory): Tool[] {
  return tools.filter(t => t.category === category);
}

export const categoryColors: Record<ToolCategory, { bg: string; text: string }> = {
  organize: { bg: 'bg-badge-organize', text: 'text-badge-organize-text' },
  convert: { bg: 'bg-badge-convert', text: 'text-badge-convert-text' },
  optimize: { bg: 'bg-badge-optimize', text: 'text-badge-optimize-text' },
  security: { bg: 'bg-badge-security', text: 'text-badge-security-text' },
  edit: { bg: 'bg-badge-edit', text: 'text-badge-edit-text' },
};
