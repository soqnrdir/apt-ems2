import { ICRUDRecord } from '@daos/CRUDDao'

class User implements ICRUDRecord {
  public id: string
  public at: Date
  public userId: string
  public name: string
  public email: string
  public password?: string
  public division: string
  public phone: string
  public perms: string
  public lastLogin: Date | null

  constructor(user: null | User) {
    if (user === null) {
      this.id = ''
      this.at = new Date()
      this.userId = ''
      this.name = ''
      this.email = ''
      this.password = ''
      this.division = ''
      this.phone = ''
      this.perms = ''
      this.lastLogin = null
    } else {
      this.id = user.id
      this.at = user.at
      this.userId = user.userId
      this.name = user.name
      this.email = user.email
      this.password = user.password
      this.division = user.division
      this.phone = user.phone
      this.perms = user.perms
      this.lastLogin = user.lastLogin
    }
  }
}

export default User
