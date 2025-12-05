import { Injectable } from '@angular/core';
import { FileItem } from '../models/file-item.model';

@Injectable({
  providedIn: 'root'
})
export class FilePreviewService {

  createFileItem(file: File): FileItem {
    return {
      id: crypto.randomUUID(),
      file,
      url: URL.createObjectURL(file),
      type: file.type || this.guessTypeFromName(file.name),
      size: file.size,
      name: file.name
    };
  }

  revokeUrl(item: FileItem) {
    try {
      if (item.url && item.url.startsWith('blob:')) {
        URL.revokeObjectURL(item.url);
      }
    } catch (e) {
      // ignore
    }
  }

  guessTypeFromName(name: string): string {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    if (['jpg','jpeg','png','gif','webp','bmp'].includes(ext)) return `image/${ext === 'jpg' ? 'jpeg' : ext}`;
    if (ext === 'pdf') return 'application/pdf';
    if (['doc','docx'].includes(ext)) return 'application/msword';
    if (['xls','xlsx'].includes(ext)) return 'application/vnd.ms-excel';
    return 'application/octet-stream';
  }

  getIconFromType(type: string) {
    if (!type) return 'file';
    if (type.includes('image')) return 'image';
    if (type.includes('pdf')) return 'pdf';
    if (type.includes('word') || type.includes('msword')) return 'doc';
    if (type.includes('excel') || type.includes('sheet')) return 'xls';
    return 'file';
  }

}
