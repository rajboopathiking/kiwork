import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get("title") ?? "Learn it. Share it.").slice(0, 100);
  const author = searchParams.get("author")?.slice(0, 30);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "linear-gradient(135deg, #022c22 0%, #064e3b 60%, #065f46 100%)",
          padding: 64,
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "#10b981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff">
              <path d="M9 21h6M12 3a6 6 0 0 0-4 10.47V16h8v-2.53A6 6 0 0 0 12 3Z" />
            </svg>
          </div>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 700, color: "#fff" }}>
            KI<span style={{ color: "#34d399" }}>WORK</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 46,
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.25,
            maxWidth: 1000,
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 24,
            color: "#a7f3d0",
            marginTop: 20,
          }}
        >
          {author ? `Shared by @${author} · a learner helping learners` : "Learn it. Share it. Help others learn it."}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
