import React, { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

interface ISortableTableProps {
  rowData: any[];
  columnDefs: ColDef[];
  height: number;
}

const SortableTable: React.FC<ISortableTableProps> = ({
  rowData,
  columnDefs,
  height
}) => {
  const defaultColDef = useMemo(() => {
    return {
      sortable: true
    };
  }, []);

  return (
    <div className="ag-theme-alpine h-full">
      <AgGridReact
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        rowData={rowData}
        containerStyle={{
          height
        }}
      />
    </div>
  );
};

export default SortableTable;
