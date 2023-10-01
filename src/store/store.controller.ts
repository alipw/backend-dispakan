import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import { FileInterceptor } from '@nestjs/platform-express'
import * as multer from 'multer'
import * as fs from 'fs'
import * as path from 'path'
import { Request, Response } from 'express'
import { AuthGuard } from '@nestjs/passport'
import { StoreService } from './store.service'
import { CreateStoreDto } from './dto/create-store.dto'
import { responseTemplate } from 'src/app.utils'
import { FilterStoreDto } from './dto/filter-all.dto'

@ApiTags('UMKM')
@Controller('store')
export class StoreController {
  constructor(private storeService: StoreService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async allStore(@Query() request: FilterStoreDto) {
    const result = await this.storeService.allStore(request)
    return result
  }

  @Post('upload')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        files: 1,
        fileSize: 1024 * 1024,
      },
    }),
  )
  async uploadFile(
    @Body() data: CreateStoreDto,
    @UploadedFile('file') file: Express.Multer.File,
  ) {
    data.file = file
    const result = await this.storeService.uploadStore(data)
    return result
  }

  @Post('update/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        files: 1,
        fileSize: 1024 * 1024,
      },
    }),
  )
  async updateFile(
    @Param('id') id: string,
    @Body() data: CreateStoreDto,
    @UploadedFile('file') file: Express.Multer.File,
  ) {
    data.file = file
    const result = await this.storeService.updateStore(data, id)
    return result
  }

  @Get('detail/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async detailStore(@Param('id') id: string) {
    const result = await this.storeService.detailStore(id)
    return result
  }

  @Get('delete/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async deleteStore(@Param('id') id: string) {
    const result = await this.storeService.deleteStore(id)
    return result
  }
}
