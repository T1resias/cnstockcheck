interface Props {
  isTradingDay: boolean;
}

export function TradingStatusBadge({ isTradingDay }: Props) {
  return isTradingDay ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
      交易日
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
      休市
    </span>
  );
}
