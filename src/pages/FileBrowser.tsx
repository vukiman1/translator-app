import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderOpen, FileText } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import type { SRTFile } from "@/types";

export function FileBrowser() {
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [files, setFiles] = useState<SRTFile[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSelectFolder = async () => {
    try {
      setLoading(true);
      const folderPath = await invoke<string>("select_folder");

      if (folderPath) {
        setSelectedFolder(folderPath);
        const srtFiles = await invoke<SRTFile[]>("list_srt_files", {
          folderPath,
        });
        setFiles(srtFiles);
      }
    } catch (error) {
      console.error("Error selecting folder:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">File Browser</h1>
        <p className="text-muted-foreground">
          Chọn folder và quản lý các file SRT
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chọn Folder</CardTitle>
          <CardDescription>
            Chọn folder chứa các file SRT của bạn
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleSelectFolder}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            <FolderOpen className="mr-2 h-4 w-4" />
            {loading ? "Đang tải..." : "Chọn Folder"}
          </Button>

          {selectedFolder && (
            <div className="p-3 bg-muted rounded-md text-sm">
              <strong>Folder đã chọn:</strong> {selectedFolder}
            </div>
          )}
        </CardContent>
      </Card>

      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Danh sách File SRT</CardTitle>
            <CardDescription>Tìm thấy {files.length} file(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 border rounded-md hover:bg-accent transition-colors"
                >
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
