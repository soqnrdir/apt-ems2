
export interface ICRUDRecord {
  id?: string // autoincrement 필드임으로 추가시 id값이 없을수 있음
}

export interface ICRUDDao {
  getOne: (id: string) => Promise<ICRUDRecord | null>
  findOne: (columnName: string, columnValue: string) => Promise<ICRUDRecord | null>
  getAll: () => Promise<ICRUDRecord[]>
  add: (record: ICRUDRecord) => Promise<void>
  update: (record: ICRUDRecord) => Promise<void>
  delete: (id: string) => Promise<void>
}
