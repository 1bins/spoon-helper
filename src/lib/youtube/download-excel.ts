import type { ReportStats as BaseReportStats, RowItem as BaseRowItem } from "@/app/(dashboard)/dashboard/youtube/page";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";

type RowItem = Omit<BaseRowItem, "videoId">;
type ReportStats = BaseReportStats;

const fmt = (iso: string) => {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

export async function downloadXLSXWithThumb(rows: RowItem[], stats?: ReportStats, filename = "youtube-report.xlsx") {
  if (!rows.length) return;

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("영상 리스트");

  // 썸네일 컬럼 추가
  ws.columns = [
    { header: "No.",          key: "no",          width: 6 },
    { header: "썸네일",        key: "thumb",       width: 14 },
    { header: "영상 제목",     key: "title",       width: 48 },
    { header: "영상 링크",     key: "url",         width: 54 },
    { header: "업로드 날짜",   key: "publishedAt", width: 20 },
    { header: "조회 수",       key: "viewCount",   width: 14 },
    { header: "좋아요 수",     key: "likeCount",   width: 14 },
    { header: "댓글 수",       key: "commentCount",width: 14 },
    { header: "구분",          key: "type",        width: 10 },
  ];

  // 헤더 스타일/고정
  ws.getRow(1).font = { bold: true };
  ws.views = [{ state: "frozen", ySplit: 1 }];
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: 9 } };

  // 행 추가(텍스트/링크)
  rows.forEach((r, i) => {
    const row = ws.addRow({
      no: i + 1,
      thumb: "", // 자리만 잡아두고 나중에 이미지 얹음
      title: r.title,
      url: r.url,
      publishedAt: fmt(r.publishedAt),
      viewCount: r.viewCount,
      likeCount: r.likeCount,
      commentCount: r.commentCount,
      type: r.isShort ? "쇼츠" : "롱폼",
    });

    // 링크 하이퍼링크
    const urlCell = row.getCell("url");
    urlCell.value = { text: r.url, hyperlink: r.url } as any;
    urlCell.font = { color: { argb: "FF1155CC" }, underline: true };
  });

  // 숫자 서식
  ["F","G","H"].forEach(col => {
    for (let r = 2; r <= ws.rowCount; r++) {
      ws.getCell(`${col}${r}`).numFmt = "#,##0";
      ws.getCell(`${col}${r}`).alignment = { horizontal: "right" };
    }
  });

  // 썸네일 삽입 (브라우저 CORS 우회: 서버 프록시 경유)
  const thumbHeight = 60;      // px
  const thumbWidth  = 106;     // 16:9 근사
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];

    // 행 높이를 이미지 높이에 맞춤
    const excelRowIndex = i + 2; // 헤더 다음부터
    ws.getRow(excelRowIndex).height = 48; // 엑셀의 height 단위는 포인트(대략 px*0.75). 60px ≈ 45pt 근사

    if (!r.thumbnail) continue;

    try {
      const proxyUrl = `/api/proxy/image?url=${encodeURIComponent(r.thumbnail)}`;
      const res = await fetch(proxyUrl);
      if (!res.ok) continue;
      const buf = await res.arrayBuffer();

      // jpeg 가정 (유튜브 썸네일은 보통 jpg)
      const imageId = wb.addImage({ buffer: buf, extension: "jpeg" });

      // B열(2번째 컬럼) 셀 영역에 이미지 배치
      // 두 좌표 앵커 대신 크기 기반 배치
      ws.addImage(imageId, {
        tl: { col: 1 + 0.15, row: (excelRowIndex - 1) + 0.2 }, // 약간의 여백
        ext: { width: thumbWidth, height: thumbHeight },
        editAs: "oneCell",
      });
    } catch { /* ignore single image error */ }
  }

  // (선택) 요약 시트
  if (stats) {
    const ws2 = wb.addWorksheet("요약");
    ws2.columns = [{ header: "항목", key: "k", width: 20 }, { header: "값", key: "v", width: 20 }];
    const add = (k: string, v: number | string) => ws2.addRow({ k, v });
    add("총 영상 수", stats.totalVideos);
    add("총 조회 수", stats.sumViews);
    add("총 좋아요 수", stats.sumLikes);
    add("총 댓글 수", stats.sumComments);
    add("조회 수 평균", Math.round(stats.avgViews));
    add("좋아요 수 평균", Math.round(stats.avgLikes));
    add("댓글 수 평균", Math.round(stats.avgComments));
    ws2.getRow(1).font = { bold: true };
    ws2.getColumn(2).numFmt = "#,##0";
  }

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  saveAs(blob, filename);
}