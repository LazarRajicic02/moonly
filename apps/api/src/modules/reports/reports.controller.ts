import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { ReportsService } from './reports.service';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

class ReportDto {
  @IsOptional() @IsString() title?: string;
  @IsDateString() from!: string;
  @IsDateString() to!: string;
}

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.reports.list(user.id);
  }

  @Post('doctor')
  create(@CurrentUser() user: AuthUser, @Body() dto: ReportDto) {
    return this.reports.create(user.id, dto);
  }

  @Get(':id/pdf')
  async pdf(@CurrentUser() user: AuthUser, @Param('id') id: string, @Res() res: Response) {
    const report = await this.reports.getFile(user.id, id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="luna-report-${id}.pdf"`);
    createReadStream(report.storagePath!).pipe(res);
  }
}
