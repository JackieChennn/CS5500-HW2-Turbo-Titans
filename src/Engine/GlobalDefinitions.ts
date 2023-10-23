
export const ErrorMessages = {
  partial: "#ERR",
  divideByZero: "#DIV/0!",
  invalidCell: "#REF!",
  invalidFormula: "#ERR",
  invalidNumber: "#ERR",
  invalidOperator: "#ERR",
  missingParentheses: "#ERR",
  emptyFormula: "#EMPTY!", // this is not an error message but we use it to indicate that the cell is empty

}

export const ButtonNames = {
  edit_toggle: "edit-toggle",
  edit: "edit",
  done: "=",
  allClear: "AC",
  clear: "C",
}


export interface CellTransport {
  formula: string[];
  value: number;
  error: string;
  // who is edition
  editing: string;
}

export interface userEditing {
  user: string;
  cell: string;
}

export interface CellTransportMap {
  // cellName -> CellTransport
  [key: string]: CellTransport;
}
export interface DocumentTransport {
  columns: number;
  rows: number;
  // cell_label -> CellTransport
  cells: Map<string, CellTransport>;
  formula: string;
  result: string;
  currentCell: string;
  isEditing: boolean;
  contributingUsers: userEditing[];
}

