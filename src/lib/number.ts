export const formatToUSD = (
  value: string | number,
  autoFixed: boolean = false
) => {
  if (autoFixed) {
    if (Number(value) >= 1) {
      value.toString()?.replace(/\d(?=(\d{3})+\.)/g, "$&,");
    }
    const priceScale = -Math.floor(Math.log10(Number(value)) - 1);

    const fixedValue = Number(value)?.toFixed(priceScale < 0 ? 0 : priceScale);
    if (priceScale > 11) {
      return fixedValue
        ?.replace(/\d(?=(\d{3})+\.)/g, "$&,")
        .replace(/.00000000000/, ".00...");
    }
    return fixedValue
      ?.replace(/\d(?=(\d{3})+\.)/g, "$&,")
      .replace(/.00000000/, ".00...");
  }
  return Number(value)?.toLocaleString();
};
