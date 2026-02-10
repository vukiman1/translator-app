import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderOpen, Languages } from "lucide-react";
import { Link } from "react-router-dom";

export function Home() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">SRT Translator</h1>
        <p className="text-muted-foreground text-lg">
          Dịch phụ đề SRT nhanh chóng và dễ dàng
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              <CardTitle>File Browser</CardTitle>
            </div>
            <CardDescription>
              Chọn folder và quản lý các file SRT của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/files">
              <Button className="w-full">Mở File Browser</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              <CardTitle>Translation</CardTitle>
            </div>
            <CardDescription>
              Dịch phụ đề sang ngôn ngữ khác bằng API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/translate">
              <Button className="w-full">Bắt đầu dịch</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hướng dẫn sử dụng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>
              Vào <strong>File Browser</strong> để chọn folder chứa file SRT
            </li>
            <li>Chọn file SRT cần dịch</li>
            <li>
              Vào <strong>Translation</strong> để cấu hình và bắt đầu dịch
            </li>
            <li>File đã dịch sẽ được lưu cùng folder với file gốc</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
