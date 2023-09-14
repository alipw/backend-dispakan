import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import { UsersService } from './users.service'
import { Request, Response } from 'express'
import { AuthGuard } from '@nestjs/passport'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { responseTemplate } from 'src/app.utils'
import * as multer from 'multer'
import * as fs from 'fs'
import * as path from 'path'
import { FileInterceptor } from '@nestjs/platform-express'
import { BumdesProfileDto } from './dto/bumdes-profile.dto'
import { UpdatePasswordDto } from './dto/update-password.dto'

let dir = `public/dispakan/assets/bumdes`
dir = path.join(__dirname, '..', '..', '..', '..', '..', dir)

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    cb(null, dir)
  },

  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + path.basename(file.originalname))
  },
})

@ApiTags('User')
@Controller('user')
export class UsersController {
  constructor(private userService: UsersService) {}
  @Get('ip')
  getIpAddress(@Req() request: Request): string {
    const ipAddress = request.ip
    console.log(request.ips, request.ip)
    return
  }

  @Get('umkm')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async allUmkm() {
    const result = await this.userService.userUmkm()
    return result
  }

  @Get('bumdes')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async allBumdes(@Req() request: Request) {
    const protocol = request.protocol
    const hostname = request.headers.host
    const url = `${protocol}://${hostname}/bumdes/profile/image`
    const result = await this.userService.userBumdes(url)
    return result
  }

  @Get('detail/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async detailUser(@Param('id') id: string, @Req() request: Request) {
    const protocol = request.protocol
    const hostname = request.headers.host
    const url = `${protocol}://${hostname}/bumdes/profile/image`
    const result = await this.userService.userDetail(id, url)
    return responseTemplate('200', 'success', result)
  }

  @Get('delete-umkm/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async deleteUmkm(@Param('id') id: string) {
    const result = await this.userService.deleteUmkm(id)
    return result
  }

  @Post('umkm/profil')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async updateProfilUmkm(@Body() body: UpdateProfileDto) {
    const result = await this.userService.updateProfile(body)
    return result
  }

  @Post('bumdes/profil')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: storage,
    }),
  )
  async updateProfilBumdes(
    @Body() body: BumdesProfileDto,
    @UploadedFile('file') file: Express.Multer.File,
  ) {
    body.file = file
    const result = await this.userService.updateBumdes(body)
    return result
  }
  @Get('bumdes/profile/:img')
  @ApiBearerAuth()
  seeFile(@Param('img') image: string, @Res() res: Response) {
    if (!fs.existsSync(`${dir}/${image}`)) {
      return res.send(
        responseTemplate('400', "Failed file didn't exist", {}, true),
      )
    } else {
      return res.sendFile(image, { root: dir })
    }
  }

  @Post('update/password/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async updatePassword(
    @Body() body: UpdatePasswordDto,
    @Param('id') id: string,
  ) {
    body.id_user = id
    const result = await this.userService.updatePassword(body)
    return result
  }
}