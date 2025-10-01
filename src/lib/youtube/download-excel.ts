import type { ReportStats as BaseReportStats, RowItem as BaseRowItem } from "@/app/(dashboard)/dashboard/youtube/page";
import { saveAs } from "file-saver";
import ExcelJS, { type CellHyperlinkValue } from "exceljs";

type RowItem = Omit<BaseRowItem, "videoId">; // thumbnail 포함됨
type ReportStats = BaseReportStats;

// 날짜 포맷 (2025-10-01 09:30)
const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(new Date(iso))
    .replace(/\./g, "-")
    .replace(/\s/g, " ")
    .trim();

export async function downloadXLSXWithThumb(
  rows: RowItem[],
  stats?: ReportStats,
  filename = "youtube-report.xlsx"
) {
  if (!rows.length) return;

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("영상 리스트");

  // 열 정의
  ws.columns = [
    { header: "No.", key: "no", width: 6 },
    { header: "썸네일", key: "thumb", width: 14 },
    { header: "영상 제목", key: "title", width: 48 },
    { header: "영상 링크", key: "url", width: 54 },
    { header: "업로드 날짜", key: "publishedAt", width: 20 },
    { header: "조회 수", key: "viewCount", width: 14 },
    { header: "좋아요 수", key: "likeCount", width: 14 },
    { header: "댓글 수", key: "commentCount", width: 14 },
    { header: "구분", key: "type", width: 10 },
  ];

  // 헤더 스타일
  ws.getRow(1).font = { bold: true };
  ws.views = [{ state: "frozen", ySplit: 1 }];
  ws.autoFilter = { from: "A1", to: "I1" };

  // 데이터 행 추가
  rows.forEach((r, i) => {
    const row = ws.addRow({
      no: i + 1,
      thumb: "",
      title: r.title,
      url: r.url,
      publishedAt: fmtDate(r.publishedAt),
      viewCount: r.viewCount,
      likeCount: r.likeCount,
      commentCount: r.commentCount,
      type: r.isShort ? "쇼츠" : "롱폼",
    });

    // URL → 하이퍼링크
    const urlCell = row.getCell("url");
    const link: CellHyperlinkValue = {
      text: r.url,
      hyperlink: r.url,
      tooltip: "영상 열기",
    };
    urlCell.value = link;
    urlCell.font = { color: { argb: "FF1155CC" }, underline: true };
  });

  // 숫자 서식 (조회수/좋아요/댓글)
  ws.eachRow((row, rowIndex) => {
    if (rowIndex === 1) return; // header skip
    ["E", "F", "G"].forEach((col) => {
      const cell = row.getCell(col);
      cell.numFmt = "#,##0";
      cell.alignment = { horizontal: "right" };
    });
  });

  // 썸네일 삽입
  const thumbHeight = 60; // px
  const thumbWidth = 106; // 16:9 근사
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (!r.thumbnail) continue;

    const excelRowIndex = i + 2; // 헤더 제외
    ws.getRow(excelRowIndex).height = thumbHeight * 0.75; // px→pt 변환

    try {
      const proxyUrl = `/api/proxy/image?url=${encodeURIComponent(r.thumbnail)}`;
      const res = await fetch(proxyUrl);
      if (!res.ok) continue;
      const buf = await res.arrayBuffer();

      const imageId = wb.addImage({ buffer: buf, extension: "jpeg" });
      ws.addImage(imageId, {
        tl: { col: 1.15, row: excelRowIndex - 0.8 }, // 여백 조금
        ext: { width: thumbWidth, height: thumbHeight },
        editAs: "oneCell",
      });
    } catch (err) {
      console.warn("썸네일 삽입 실패:", err);
    }
  }

  // (선택) 요약 시트
  if (stats) {
    const ws2 = wb.addWorksheet("통계");
    ws2.columns = [
      { header: "항목", key: "k", width: 20 },
      { header: "값", key: "v", width: 20 },
    ];

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

  // 저장
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, filename);
}