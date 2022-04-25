import { ICRUDRecord } from '@daos/CRUDDao'

class Admin implements ICRUDRecord {

  public id: string
  public at: Date
  public adminId: string
  public name: string
  public email: string
  public password?: string
  public division: string
  public phone: string
  public perms: string
  public lastLogin: Date | null

  constructor(admin: null | Admin) {
    if (admin === null) {
      this.id = ''
      this.at = new Date()
      this.adminId = ''
      this.name = ''
      this.email = ''
      this.phone = ''
      this.password = ''
      this.division = ''
      this.perms = ''
      this.lastLogin = null
    } else {
      this.id = admin.id
      this.at = admin.at
      this.adminId = admin.adminId
      this.name = admin.name
      this.email = admin.email
      this.division = admin.division
      this.phone = admin.phone
      this.password = admin.password
      this.perms = admin.perms
      this.lastLogin = admin.lastLogin
    }
  }
}

export default Admin
