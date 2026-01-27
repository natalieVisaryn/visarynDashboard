
interface BlurbProps {
  title: string;
  paragraph: string;
  subtext: string;
}

export default function Blurb({ title, paragraph, subtext }: BlurbProps) {
  return (
    <div
      style={{
        width: "524px",
        height: "162px",
        backgroundColor: "var(--dark-blue)",
        marginTop: "16px",
        marginBottom: "16px",
        marginRight: "8px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        paddingTop: "25px",
        paddingBottom: "25px",
        paddingLeft: "20px",
        paddingRight: "20px",
      }}
    >
      {/* Title */}
      <div
        style={{
          fontFamily: '"Hero New", sans-serif',
          fontWeight: 700,
          fontSize: "18px",
          lineHeight: "100%",
          color: "var(--textWhite)",
          marginBottom: "25px",
        }}
      >
        {title}
      </div>

      {/* Paragraph */}
      <div
        style={{
          fontFamily: '"Hero New", sans-serif',
          fontWeight: 400,
          fontSize: "14px",
          lineHeight: "120%",
          color: "var(--text-grey-white)",
          marginBottom: "3px",
          flex: 1,
        }}
      >
        {paragraph}
      </div>

      {/* Subtext */}
      <div
        style={{
          fontFamily: '"Hero New", sans-serif',
          fontWeight: 400,
          fontSize: "13px",
          lineHeight: "120%",
          color: "var(--textGrey)",
        }}
      >
        {subtext}
      </div>
    </div>
  );
}
