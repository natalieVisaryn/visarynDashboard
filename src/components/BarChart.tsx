interface BarChartData {
  key: string;
  value: number;
}

interface BarChartProps {
  data: BarChartData[];
  title: string;
}

export default function BarChart({ data, title }: BarChartProps) {
  const width = 1072;
  const height = 405;
  const titleHeight = 30;
  const titleBottomPadding = 50;
  const padding = { top: 20, right: 20, bottom: 20, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const xAxisLabelHeight = 20;
  // Available height = total height - top padding - bottom padding
  const availableHeight = height - titleHeight - padding.bottom;
  // Title takes ~18px (font size), plus margin bottom
  const titleSpace = 18 + titleBottomPadding;
  // Chart height is available height minus title space and x-axis label space
  const chartHeight = availableHeight - titleSpace - xAxisLabelHeight;
  const yAxisLabelWidth = 50;

  // Calculate max value for scaling
  const maxValue = Math.max(...data.map((d) => d.value), 0);
  const maxValueWithPadding = maxValue * 1.1; // max value + 10%

  // Calculate y-axis label values
  const yAxisLabels = [
    0,
    maxValueWithPadding / 4,
    (maxValueWithPadding / 4) * 2,
    (maxValueWithPadding / 4) * 3,
    maxValueWithPadding,
  ];

  // Calculate bar width and spacing
  const barCount = data.length;
  const barWidth = 20;
  const availableWidth = chartWidth - yAxisLabelWidth;
  const barSpacing =
    barCount > 0 ? (availableWidth - barCount * barWidth) / (barCount + 1) : 0;

  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: "var(--dark-blue)",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        padding: `${titleHeight}px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
      }}
    >
      {/* Title */}
      <div
        style={{
          fontFamily: '"Hero New", sans-serif',
          fontWeight: 700,
          fontStyle: "normal",
          fontSize: "18px",
          lineHeight: "100%",
          letterSpacing: "0%",
          color: "var(--textWhite)",
          marginBottom: `${titleBottomPadding}px`,
        }}
      >
        {title}
      </div>

      {/* Chart Container */}
      <svg
        width={chartWidth}
        height={chartHeight + xAxisLabelHeight}
        style={{ overflow: "visible" }}
      >
        {/* Y-axis labels */}
        {yAxisLabels.map((labelValue, index) => {
          const yPosition =
            chartHeight - (index / (yAxisLabels.length - 1)) * chartHeight;
          return (
            <text
              key={`y-label-${index}`}
              x={0}
              y={yPosition}
              fill="var(--textWhite)"
              fontSize="12px"
              textAnchor="start"
              fontFamily='"Hero New", sans-serif'
              dy="0.35em"
            >
              {Math.round(labelValue).toLocaleString()}
            </text>
          );
        })}

        {/* Horizontal grid lines */}
        {yAxisLabels.map(( index) => {
          const yPosition =
            chartHeight - (index / (yAxisLabels.length - 1)) * chartHeight;
          return (
            <line
              key={`grid-line-${index}`}
              x1={yAxisLabelWidth}
              y1={yPosition}
              x2={chartWidth}
              y2={yPosition}
              stroke="var(--input-field-blue)"
              strokeWidth="1"
            />
          );
        })}

        {/* Bars */}
        {data.map((item, index) => {
          const barHeight =
            maxValueWithPadding > 0
              ? (item.value / maxValueWithPadding) * chartHeight
              : 0;
          const x =
            yAxisLabelWidth + barSpacing + index * (barWidth + barSpacing);
          const y = chartHeight - barHeight;

          return (
            <g key={item.key}>
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="var(--blue)"
              />
              {/* X-axis label */}
              <text
                x={x + barWidth / 2}
                y={chartHeight + 15}
                fill="var(--textWhite)"
                fontSize="12px"
                textAnchor="middle"
                fontFamily='"Hero New", sans-serif'
              >
                {item.key}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
