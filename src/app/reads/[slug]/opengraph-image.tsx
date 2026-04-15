import { extractIdFromSlug } from "@/lib/Slugify";
import { Read } from "@/types/types";
import { ImageResponse } from "next/og";

// Image metadata
export const alt = "De vous à moi";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Image generation
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const readId = extractIdFromSlug(slug);
  const request = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/reads/${readId}/related`,
    { method: "GET" },
  );
  const response = await request.json();
  const read: Read = response.read;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#0f0f0f",
        fontFamily: "Inter",
        position: "relative",
      }}
    >
      {/* Article cover image as background */}
      {read.imageUrl && (
        <img
          src={read.imageUrl}
          alt={read.title}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.35,
          }}
        />
      )}

      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.85) 100%)",
          display: "flex",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "60px 72px",
          height: "100%",
          gap: "16px",
        }}
      >
        {/* Category / tag */}
        {read.category && (
          <span
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "#a78bfa",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              display: "flex",
            }}
          >
            {read.category}
          </span>
        )}

        {/* Title */}
        <h1
          style={{
            fontSize: 64,
            fontWeight: 600,
            color: "#ffffff",
            lineHeight: 1.1,
            margin: 0,
            display: "flex",
            maxWidth: "900px",
          }}
        >
          {read.title}
        </h1>

        {/* Excerpt / description */}
        {read.description && (
          <p
            style={{
              fontSize: 24,
              color: "rgba(255,255,255,0.65)",
              margin: 0,
              lineHeight: 1.5,
              maxWidth: "800px",
              display: "flex",
            }}
          >
            {read.description}
          </p>
        )}

        {/* Footer row: author + site name */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {read.user?.profileImageUrl && (
              <img
                alt={read.user.firstName}
                src={read.user.profileImageUrl}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            )}
            {read.user?.firstName && (
              <span
                style={{
                  fontSize: 20,
                  color: "rgba(255,255,255,0.8)",
                  display: "flex",
                }}
              >
                {read.user.firstName} {read.user.lastName}
              </span>
            )}
          </div>

          <span
            style={{
              fontSize: 20,
              color: "rgba(255,255,255,0.45)",
              display: "flex",
            }}
          >
            De vous à moi
          </span>
        </div>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
