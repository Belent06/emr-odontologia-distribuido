import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { FilesService } from './app.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Files')
@Controller() // Dejamos la ruta vacía porque el Gateway pondrá el prefijo /files
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('presigned-url')
  async getUploadUrl(
    @Body() body: { fileName: string; fileType: string; patientId: string },
  ) {
    return this.filesService.generatePresignedUploadUrl(
      body.fileName,
      body.fileType,
      body.patientId,
    );
  }

  @Post('confirm')
  async confirmUpload(@Body() body: any) {
    return this.filesService.saveFileMetadata(body);
  }

  @Get('patient/:id')
  async getPatientFiles(@Param('id') id: string) {
    return this.filesService.getFilesByPatient(id);
  }
}
