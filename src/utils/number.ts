/**
 * 将数字转换为指定精度的字符串，并去除多余的 0
 */
export const getFullNum = (num: number, fixed = 18): string => {
  // 若不是有限数值，直接返回 'NaN'（也可按需改成返回空字符串或其他提示）
  if (!Number.isFinite(num)) {
    return "NaN";
  }
  // toFixed 不会出现科学计数法，直接去除小数末尾多余的 0 即可
  return num
    .toFixed(fixed)
    .replace(/\.?0+$/, ""); // 移除小数点及之后的多余 0
};

/**
 * 将数字按照其大小转为带 “K”/“M”/或原数值的形式显示
 */
export const mFormatter = (num: number, fixed = 2): string => {
  if (Math.abs(num) < 1_000) {
    // 小于 1000 直接用千分位格式
    return toThousands(num, fixed);
  } else if (Math.abs(num) < 1_000_000) {
    // 小于 100 万使用 K
    return kFormatter(num, fixed);
  } else {
    // 否则使用 M
    return `${(num / 1_000_000).toFixed(fixed)}M`;
  }
};

/**
 * 将数值转化为 K 结尾的字符串 (如 1,234 => 1.2K)
 */
export const kFormatter = (num: number, fixed = 1): string => {
  const absVal = Math.abs(num);
  const sign = Math.sign(num);

  if (absVal >= 1000) {
    return `${sign * parseFloat((absVal / 1000).toFixed(fixed))}K`;
  }
  return `${sign * parseFloat(absVal.toFixed(fixed))}`;
};

/**
 * 将数字格式化为带千分位的形式，并可保留指定小数位，
 * 但会去除末尾无意义的零，如 1000 => 1,000；1234.5000 => 1,234.5
 */
export const toThousands = (num: number, fixed = 4): string => {
  // 直接特殊处理 num === 0 的情况
  if (num === 0) {
    return "0";
  }

  // 按给定精度转换为字符串
  const [integerPart, decimalPart = ""] = num.toFixed(fixed).split(".");

  // 给整数部分加上千分位逗号
  const formattedInteger = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ","
  );

  // 去除小数部分的多余 0
  const trimmedDecimal = decimalPart.replace(/0+$/, "");

  // 若小数部分全部是 0 则只返回整数部分
  return trimmedDecimal ? `${formattedInteger}.${trimmedDecimal}` : formattedInteger;
};
