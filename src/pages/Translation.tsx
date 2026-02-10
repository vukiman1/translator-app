import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, Play, Square, Trash2 } from "lucide-react";
import { translateMultipleFiles } from "@/lib/translateApi";
import type { SRTFile, FileTranslationState, TranslationStatus } from "@/types";
import { TranslationStatus as Status } from "@/types";

export function Translation() {
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [files, setFiles] = useState<SRTFile[]>([]);
  const [fileStates, setFileStates] = useState<
    Map<string, FileTranslationState>
  >(new Map());

  const [apiKey, setApiKey] = useState<string>("");
  const [sourceLang, setSourceLang] = useState<string>("auto");
  const [targetLang, setTargetLang] = useState<string>("vi");

  const [isTranslating, setIsTranslating] = useState(false);
  const [overallProgress, setOverallProgress] = useState({
    completed: 0,
    total: 0,
  });

  const handleSelectFolder = async () => {
    try {
      const folderPath = await invoke<string>("select_folder");

      if (folderPath) {
        setSelectedFolder(folderPath);
        const srtFiles = await invoke<SRTFile[]>("list_srt_files", {
          folderPath,
        });
        setFiles(srtFiles);

        // Initialize file states
        const newStates = new Map<string, FileTranslationState>();
        srtFiles.forEach((file) => {
          newStates.set(file.path, {
            file,
            status: Status.PENDING,
            progress: 0,
          });
        });
        setFileStates(newStates);
      }
    } catch (error) {
      console.error("Error selecting folder:", error);
    }
  };

  const handleStartTranslation = async () => {
    if (!apiKey.trim()) {
      alert("Vui lòng nhập API key");
      return;
    }

    if (files.length === 0) {
      alert("Không có file nào để dịch");
      return;
    }

    setIsTranslating(true);
    setOverallProgress({ completed: 0, total: files.length });

    try {
      await translateMultipleFiles(
        files.map((f) => f.path),
        apiKey,
        sourceLang,
        targetLang,
        (fileIndex, progress) => {
          // Update individual file progress
          const file = files[fileIndex];
          setFileStates((prev) => {
            const newStates = new Map(prev);
            const state = newStates.get(file.path);
            if (state) {
              newStates.set(file.path, {
                ...state,
                status: Status.TRANSLATING,
                progress,
              });
            }
            return newStates;
          });
        },
        (completed, total) => {
          // Update overall progress
          setOverallProgress({ completed, total });

          // Mark completed files
          if (completed > 0) {
            const completedFile = files[completed - 1];
            setFileStates((prev) => {
              const newStates = new Map(prev);
              const state = newStates.get(completedFile.path);
              if (state) {
                newStates.set(completedFile.path, {
                  ...state,
                  status: Status.COMPLETED,
                  progress: 100,
                });
              }
              return newStates;
            });
          }
        },
      );
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleClearAll = () => {
    setSelectedFolder("");
    setFiles([]);
    setFileStates(new Map());
    setOverallProgress({ completed: 0, total: 0 });
  };

  const getStatusBadge = (status: TranslationStatus) => {
    switch (status) {
      case Status.PENDING:
        return <Badge variant="secondary">Chờ dịch</Badge>;
      case Status.TRANSLATING:
        return <Badge variant="warning">Đang dịch...</Badge>;
      case Status.COMPLETED:
        return <Badge variant="success">Hoàn thành</Badge>;
      case Status.ERROR:
        return <Badge variant="destructive">Lỗi</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Translation</h1>
        <p className="text-muted-foreground">
          Dịch phụ đề SRT sang ngôn ngữ khác bằng Google Translate API
        </p>
      </div>

      {/* Folder Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Chọn Folder</CardTitle>
          <CardDescription>
            Chọn folder chứa các file SRT cần dịch
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleSelectFolder}
            disabled={isTranslating}
            className="w-full sm:w-auto"
          >
            <FolderOpen className="mr-2 h-4 w-4" />
            Chọn Folder
          </Button>

          {selectedFolder && (
            <div className="p-3 bg-muted rounded-md text-sm">
              <strong>Folder:</strong> {selectedFolder}
              <br />
              <strong>Files:</strong> {files.length} file(s)
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cấu hình</CardTitle>
            <CardDescription>Nhập API key và chọn ngôn ngữ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">Google Translate API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={isTranslating}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sourceLang">Ngôn ngữ nguồn</Label>
                <Select
                  id="sourceLang"
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value)}
                  disabled={isTranslating}
                >
                  <option value="auto">Tự động phát hiện</option>
                  <option value="en">English</option>
                  <option value="vi">Tiếng Việt</option>
                  <option value="zh">中文</option>
                  <option value="ja">日本語</option>
                  <option value="ko">한국어</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetLang">Ngôn ngữ đích</Label>
                <Select
                  id="targetLang"
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  disabled={isTranslating}
                >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                  <option value="zh">中文</option>
                  <option value="ja">日本語</option>
                  <option value="ko">한국어</option>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Danh sách Files</CardTitle>
            <CardDescription>
              {overallProgress.completed} / {overallProgress.total} files đã
              hoàn thành
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {files.map((file) => {
              const state = fileStates.get(file.path);
              if (!state) return null;

              return (
                <div
                  key={file.path}
                  className="p-4 border rounded-md space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    {getStatusBadge(state.status)}
                  </div>

                  {state.status === Status.TRANSLATING && (
                    <div className="space-y-1">
                      <Progress value={state.progress} />
                      <p className="text-xs text-muted-foreground text-right">
                        {state.progress}%
                      </p>
                    </div>
                  )}

                  {state.error && (
                    <p className="text-sm text-destructive">{state.error}</p>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {files.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Button
                onClick={handleStartTranslation}
                disabled={isTranslating || !apiKey.trim()}
                className="flex-1"
              >
                <Play className="mr-2 h-4 w-4" />
                {isTranslating ? "Đang dịch..." : "Bắt đầu dịch"}
              </Button>

              <Button
                variant="outline"
                onClick={handleClearAll}
                disabled={isTranslating}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa tất cả
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
