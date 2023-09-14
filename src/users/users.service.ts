import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { UserRepository } from './user.repository'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { responseTemplate } from 'src/app.utils'
import { UserLevel } from './user-level.enum'
import { BumdesProfileDto } from './dto/bumdes-profile.dto'
import * as fs from 'fs'
import { UpdatePasswordDto } from './dto/update-password.dto'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
  ) {}

  async userUmkm() {
    const user = await this.userRepository.find({
      where: {
        level: UserLevel.UMKM,
      },
    })

    return responseTemplate('200', 'success', user)
  }

  async userBumdes(url: string) {
    const user = await this.userRepository.find({
      where: {
        level: UserLevel.BUMDES,
      },
    })

    user.map(item => (item.url_image = `${url}/${item.filename}`))
    return responseTemplate('200', 'success', user)
  }

  async userDetail(id: string, url?: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: id,
      },
    })

    user.url_image = `${url}/${user.filename}`
    if (!user) {
      throw new NotFoundException(`User with id ${id} not Found!`)
    }

    return user
  }

  async updateProfile(updateProfile: UpdateProfileDto) {
    const user = await this.userDetail(updateProfile.id_owner_umkm)
    if (updateProfile.name) user.name = updateProfile.name
    if (updateProfile.phone) user.phone = updateProfile.phone
    if (updateProfile.address) user.address = updateProfile.address
    user.status = updateProfile.status

    await this.userRepository.save(user)

    return responseTemplate('200', 'success', user)
  }

  async updateBumdes(updateProfile: BumdesProfileDto) {
    const user = await this.userDetail(updateProfile.id_bumdes_umkm)
    if (updateProfile.name) user.name = updateProfile.name
    if (updateProfile.phone) user.phone = updateProfile.phone
    if (updateProfile.address) user.address = updateProfile.address
    if (updateProfile.status) user.status = updateProfile.status

    if (updateProfile.file) {
      if (fs.existsSync(user.image)) {
        fs.unlinkSync(user.image)
      }

      user.filename = updateProfile.file.filename
      user.image = updateProfile.file.path
    }
    await this.userRepository.save(user)

    return responseTemplate('200', 'success', user)
  }

  async updatePassword(updatePassword: UpdatePasswordDto) {
    const user = await this.userDetail(updatePassword.id_user)
    const isValid = await user.validatePassword(updatePassword.old_password)
    if (!isValid) {
      return responseTemplate('400', 'Password is Wrong!', [], true)
    }
    const newPassword = await this.userRepository.hashPassword(
      updatePassword.new_password,
      user.salt,
    )
    user.password = newPassword
    await this.userRepository.save(user)

    return responseTemplate('200', 'success', user)
  }

  async deleteUmkm(id: string) {
    const user = await this.userDetail(id)
    await this.userRepository.remove(user)
    return responseTemplate('200', 'success', {})
  }
}