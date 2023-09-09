import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';


import { ProductService } from './product.service';
import { Product, createProductDTO } from '../models/product.model';
import { environment } from 'src/environments/environment';
import { HttpStatusCode } from '@angular/common/http';

describe('ProductService', () => {
  let service: ProductService;
  let httpController : HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule],
      providers:[
        ProductService
      ]
    });
    service = TestBed.inject(ProductService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Test for getAll', () => {
    it('should return a product list  with taxes',(doneFn) =>{
      const mockData: Product[] =[
        {id:'1',title:'primer',price:100,images:['1','2'],
        description:'prueba',category:{id:1,name:'name1'}},
        {id:'2',title:'segundo',price:200,images:['1','2'],
        description:'prueba',category:{id:1,name:'name1'}}
      ];
      const limit = 10;
      const offset = 3;

      service.getAll(limit,offset)
      .subscribe((data) => {
        expect(data).toEqual(mockData);
        expect(data[0].taxes).toEqual(19);
        doneFn();
      });

      const req = httpController.expectOne(`${environment.API_URL}/api/v1/products`);
      req.flush(mockData);
      const params = ( req.request.params);
      expect(params.get('limit')).toEqual(`${limit}`)
      expect(params.get('offset')).toEqual(`${offset}`);
    });
  });
  
  describe('Test for getOne', () =>{
    it('should return a product by Id', (doneFn) =>{
      const muckData: Product = {id:'1',title:'primer',price:100,images:['1','2'],
      description:'prueba',category:{id:1,name:'name1'}};
      const id= 'id1';
      service.getOne(id).subscribe(data=>{
        expect(data).toEqual(muckData);
        doneFn();
      })
      const req = httpController.expectOne(`${environment.API_URL}/api/v1/products/${id}`);
      expect(req.request.method).toEqual('GET');
      req.flush(muckData);
    });
  it('should return errors', (doneFn) =>{
    const productId = '1';
    const msgError = '404 message';
    const mockError = {
      status: HttpStatusCode.NotFound,
      statusText: msgError
    };
    service.getOne(productId)
    .subscribe({
      error: (error) => {
        expect(error).toEqual('El producto no existe');
        doneFn();
      }
    });

    const url = `${environment.API_URL}/api/v1/products/${productId}`;
    const req = httpController.expectOne(url);
    expect(req.request.method).toEqual('GET');
    req.flush(msgError, mockError);
  });
  });

  describe('Test for Create method', ()=>{
    it('should return a product', (doneFn)=>{
      const muckData:Product = {
        id:'1',
        title:'primer',
        price:100,
        images:['1','2'],
       description:'prueba',
       category:{id:1,name:'name1'}
      };
      const dto: createProductDTO = {
        title:'primer',
        price:100,images:['1','2'],
        description:'prueba',
        category:{id:1,name:'name1'},
        categoryId:1
      };
      service.create(dto)
      .subscribe(data=>{
        expect(data).toEqual(muckData);
        doneFn();
      });
      const req= httpController.expectOne(`${environment.API_URL}/api/v1/products`);
      req.flush(muckData);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual(dto);
      
    })
  })
});
