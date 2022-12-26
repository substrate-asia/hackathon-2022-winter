const getTableHeight = (rowCount: number, maxRowCount: number) => {
  const TABLE_HEADER_HEIGHT = 85;
  const TABLE_ROW_HEIGHT = 60;

  return rowCount <= maxRowCount
    ? TABLE_HEADER_HEIGHT + TABLE_ROW_HEIGHT * (rowCount === 0 ? 2 : rowCount)
    : TABLE_HEADER_HEIGHT + TABLE_ROW_HEIGHT * maxRowCount - 30;
};

export default getTableHeight;
