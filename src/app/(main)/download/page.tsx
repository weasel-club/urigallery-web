"use client";

import { useHeaderSize } from "@/components/header";
import image1 from "./1.png";
import image2 from "./2.png";

import Container from "@/components/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";
import Image from "next/image";

export default function DownloadPage() {
  const { height } = useHeaderSize();

  const downloads = [
    {
      platform: "Windows",
      path: "/downloads/urigallery-win.zip",
      size: 11643392,
      hash: "e9a4102da631ef108e282808048f4354ef6cd964c95da0c4bc140f36cf56aacb",
      virusTotalUrl: "https://", // 추후 바이러스 토탈 URL 추가
    },
  ];

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    height > 0 && (
      <Container
        className="flex flex-col items-center justify-center gap-4"
        style={{
          height: `calc(100vh - ${height}px)`,
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
                      실행 파일 크기: {formatFileSize(download.size)}
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

        <h1 className="text-2xl font-bold mt-12">사용법</h1>
        <Image src={image1} alt="1" />
        <div>다운로드 후 exe 파일을 폴더에 옮겨서 실행</div>
        <Image src={image2} alt="2" />
        <div>
          트레이 아이콘을 오른쪽 클릭 후 OTP 복사를 클릭하여 OTP를 복사 후 메인
          페이지에서 입력
        </div>
      </Container>
    )
  );
}
