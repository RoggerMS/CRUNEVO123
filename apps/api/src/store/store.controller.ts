import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { StoreService } from './store.service';
import { CreateProductDto, ProductType } from './dto/create-product.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiTags('store')
@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post('products')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  create(@Request() req: any, @Body() createProductDto: CreateProductDto) {
    return this.storeService.createProduct(req.user.userId, createProductDto);
  }

  @Get('products')
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'type', required: false, enum: ProductType })
  @ApiQuery({ name: 'ownerId', required: false })
  findAll(
    @Query('q') query?: string,
    @Query('type') type?: ProductType,
    @Query('ownerId') ownerId?: string,
  ) {
    return this.storeService.findAll(query, type, ownerId);
  }

  @Get('products/:id')
  findOne(@Param('id') id: string) {
    return this.storeService.findOne(id);
  }

  @Post('products/:id/buy')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  buy(@Request() req: any, @Param('id') id: string) {
    return this.storeService.buy(req.user.userId, id);
  }

  @Get('orders/mine')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  findMyPurchases(@Request() req: any) {
    return this.storeService.findMyPurchases(req.user.userId);
  }
}
