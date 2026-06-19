import { File, Folder } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface TreeFile {
  path: string;
  size: number;
}

interface FileListProps {
  files: TreeFile[];
  selectedFiles: string[];
  onToggle: (path: string) => void;
}

export function FileList({ files, selectedFiles, onToggle }: FileListProps) {
  return (
    <div className="space-y-2">
      {files.map((file) => {
        const isFolder = !file.path.includes(".");
        const checked = selectedFiles.includes(file.path);

        return (
          <label
            key={file.path}
            className="flex items-center gap-2 rounded-md border p-2 cursor-pointer"
          >
            <Checkbox
              checked={checked}
              onCheckedChange={() => onToggle(file.path)}
              disabled={isFolder}
            />

            {isFolder ? (
              <Folder className="h-4 w-4" />
            ) : (
              <File className="h-4 w-4" />
            )}

            <span className="text-sm truncate">{file.path}</span>
          </label>
        );
      })}
    </div>
  );
}