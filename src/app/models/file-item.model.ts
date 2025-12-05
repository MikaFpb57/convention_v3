export interface FileItem {
  id: string;
  file?: File;      // file present only if uploaded locally
  url: string;      // object URL or remote preview URL
  type: string;     // mime type
  size: number;     // bytes
  name: string;
}