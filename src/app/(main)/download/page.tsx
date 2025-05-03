"use client";

import { useHeaderSize } from "@/components/header";

import Container from "@/components/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";

export default function DownloadPage() {
  const { height } = useHeaderSize();

  const downloads = [
    {
      platform: "Windows",
      path: "/downloads/urigallery-win.zip",
      size: "11.10MB",
      hash: "60e63ab4387f8925492d2ce3deb4b5c6e2d1e2e7c4335c24035c682c86f2f5c3",
      virusTotalUrl:
        "https://www.virustotal.com/gui/file/60e63ab4387f8925492d2ce3deb4b5c6e2d1e2e7c4335c24035c682c86f2f5c3", // 추후 바이러스 토탈 URL 추가
    },
  ];

  return (
    height > 0 && (
      <Container
        className="flex flex-col items-center justify-center gap-4"
        style={{
          minHeight: `calc(100vh - ${height}px)`,
        }}
      >
        <h1 className="text-2xl font-bold mt-12">다운로드</h1>

        <div className="grid gap-4 w-full max-w-2xl">
          {downloads.map((download) => (
            <Card key={download.platform}>
              <CardHeader>
                <CardTitle>{download.platform}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      실행 파일 크기: {download.size}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      SHA-256: {download.hash}
                    </p>
                    {download.virusTotalUrl && (
                      <a
                        href={download.virusTotalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:underline"
                      >
                        VirusTotal 결과 보기
                      </a>
                    )}
                  </div>
                  <Button
                    onClick={() => window.open(download.path, "_blank")}
                    className="ml-4"
                  >
                    <Download />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <h1 className="text-2xl font-bold mt-12">사용법 (동영상)</h1>
        <video src="/tutorial/video.mp4" autoPlay muted loop />
        <h1 className="text-2xl font-bold mt-12">사용법 (이미지)</h1>
        <img src="/tutorial/1.png" alt="1" />
        <div>다운로드 후 exe 파일을 폴더에 옮겨서 실행</div>
        <img src="/tutorial/2.png" alt="2" />
        <div>
          트레이 아이콘을 오른쪽 클릭 후 OTP 복사를 클릭하여 OTP를 복사 후 메인
          페이지에서 입력
        </div>
      </Container>
    )
  );
}
