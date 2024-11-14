import Table, { Column } from "@/components/Table/Table.tsx";
import { Cell, Legend, Pie, PieChart, Tooltip } from "recharts";
import { FaClock, FaFileAlt } from "react-icons/fa";
import { formatBytes } from "@/utils/format-bytes.ts";
import { memo, ReactNode } from "react";
import {
  FileMetrics,
  OverallMetrics,
} from "@/components/Converter/utils/ConversionMetricsManager/ConversionMetricsManager.ts";
import { useConversion } from "@/components/Converter/context/ConvertionContext/ConvertionContext.tsx";

interface MetricCardProps {
  readonly icon: ReactNode;
  readonly title: string;
  readonly children: ReactNode;
}
const MetricCard = ({ icon, title, children }: MetricCardProps) => (
  <div className="bg-white dark:bg-dark-100 p-6 rounded-lg shadow-lg">
    <div className="flex items-center gap-3 mb-2">
      {icon}
      <h4 className="text-lg font-medium text-neutral-800 dark:text-neutral-50">
        {title}
      </h4>
    </div>
    {children}
  </div>
);

interface MetricsPieChartProps {
  readonly data: any[];
}
const MetricsPieChart = ({ data }: MetricsPieChartProps) => {
  const dataWithIds = data.map((entry) => ({
    ...entry,
    id: crypto.randomUUID(),
  }));
  return (
    <PieChart width={300} height={300}>
      <Pie
        data={data}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={100}
        label
      >
        {dataWithIds.map((entry) => (
          <Cell key={entry.id} fill={entry.color} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  );
};

interface MetricsCardProps {
  readonly metrics: OverallMetrics;
}
const MetricsCards = ({ metrics }: MetricsCardProps) => {
  const {
    longestConversion,
    shortestConversion,
    averageConversionTime,
    totalSourceSizeInBytes,
    totalConvertedSizeInBytes,
    totalSizeReduction,
  } = metrics;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <MetricCard
        icon={<FaClock className="text-primary-500 w-5 h-5" />}
        title="Longest Conversion"
      >
        {longestConversion ? (
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            File: <strong>{longestConversion.sourceFileName}</strong>
            <br />
            Time: <strong>{longestConversion.timeTaken} ms</strong>
          </p>
        ) : (
          <p className="text-sm text-neutral-500">No data available</p>
        )}
      </MetricCard>

      <MetricCard
        icon={<FaClock className="text-primary-500 w-5 h-5" />}
        title="Shortest Conversion"
      >
        {shortestConversion ? (
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            File: <strong>{shortestConversion.sourceFileName}</strong>
            <br />
            Time: <strong>{shortestConversion.timeTaken} ms</strong>
          </p>
        ) : (
          <p className="text-sm text-neutral-500">No data available</p>
        )}
      </MetricCard>

      <MetricCard
        icon={<FaClock className="text-primary-500 w-5 h-5" />}
        title="Average Conversion Time"
      >
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          {averageConversionTime !== null
            ? `${averageConversionTime.toFixed(2)} ms`
            : "No data available"}
        </p>
      </MetricCard>

      <MetricCard
        icon={<FaFileAlt className="text-primary-500 w-5 h-5" />}
        title="Total Unconverted Size"
      >
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          {formatBytes(totalSourceSizeInBytes)}
        </p>
      </MetricCard>

      <MetricCard
        icon={<FaFileAlt className="text-primary-500 w-5 h-5" />}
        title="Total Converted Size"
      >
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          {formatBytes(totalConvertedSizeInBytes)}
        </p>
      </MetricCard>

      <MetricCard
        icon={<FaFileAlt className="text-primary-500 w-5 h-5" />}
        title="Total Size Reduction"
      >
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          {totalSizeReduction.percentage}%{" "}
          {formatBytes(totalSizeReduction.bytes)}
        </p>
      </MetricCard>
    </div>
  );
};

const ConversionMetricsOverview = () => {
  const { conversionState } = useConversion();
  const metricsManager = conversionState.conversionMetrics;

  const overallMetrics = metricsManager.getOverallMetrics();
  const fileMetrics = metricsManager.getAllFileMetrics();

  const shouldRenderMetrics =
    fileMetrics.length && !conversionState.conversionInProgress;

  if (!shouldRenderMetrics) {
    return null;
  }

  const { counters } = overallMetrics;

  const columns: Array<Column<any>> = [
    { key: "sourceFileName", header: "Source File Name" },
    {
      key: "sourceFileSize",
      header: "Source File Size",
      render: (value) => `${(value / 1024).toFixed(2)} KB`,
    },
    {
      key: "convertedFileSize",
      header: "Converted File Size",
      render: (value) => `${(value / 1024).toFixed(2)} KB`,
    },
    {
      key: "sizeChangePercentage",
      header: "Size Change (%)",
      render: (value) => `${value.toFixed(2)}%`,
    },
    {
      key: "timeTaken",
      header: "Time Taken (ms)",
      render: (value) => (value !== null ? `${value} ms` : "N/A"),
    },
  ];

  const pieData = [
    counters.success && {
      name: "Success",
      value: counters.success,
      color: "#66C266",
    },
    counters.error.TIMEOUT && {
      name: "Timed Out",
      value: counters.error.TIMEOUT,
      color: "#FFB94D",
    },
    counters.error.CONVERSION_FAILED && {
      name: "Failed",
      value: counters.error.CONVERSION_FAILED,
      color: "#F56969",
    },
  ].filter(Boolean);

  return (
    <div className="p-6 bg-neutral-100 dark:bg-dark-50">
      <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
        Conversion Metrics
      </h2>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        Overview of your recent conversion tasks and metrics.
      </p>

      <div className="mb-8 flex flex-col items-center lg:flex-row lg:justify-around gap-8">
        <MetricsPieChart data={pieData} />
        <MetricsCards metrics={overallMetrics} />
      </div>

      <div>
        <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50 mb-4">
          File Conversion Details
        </h3>
        <Table
          data={fileMetrics}
          columns={columns}
          initialPageSize={10}
          dataKeyExtractor={(metrics: FileMetrics) => metrics.sourceFileName}
        />
      </div>
    </div>
  );
};

export default memo(ConversionMetricsOverview);
