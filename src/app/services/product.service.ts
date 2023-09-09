import { HttpClient, HttpErrorResponse, HttpParams, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Product, UpdateProductDTO, createProductDTO } from '../models/product.model';
import { Observable, throwError } from 'rxjs';
import { retry, catchError, map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = `${environment.API_URL}/api/v1`;
  
  constructor(
    private http: HttpClient
  ) { }

  getByCategory(categoryId: string, limit?:number, offset?:number){
    let params = new HttpParams();
    if(limit && offset != null){
      params = params.set('limit',limit);
      params = params.set('offset', offset);
    }
    return this.http.get<Product[]>(`${this.apiUrl}/categorias/${categoryId}/products`, {params});
  }

  getAll(limit?:number, offset?:number): Observable<Product[]>{
    let params = new HttpParams();
    if(limit && offset != null){
      params = params.set('limit',limit);
      params = params.set('offset', offset);
    }
    return this.http.get<Product[]>(`${this.apiUrl}/products`, {params})
    .pipe(
      retry(3),
      map(products => products.map(item => {
        return {
          ...item,
          taxes: item.price > 0 ? .19 * item.price : 0
        }
      }))
    );
  }

  getOne(id:string){
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`)
    .pipe(
      catchError((error: HttpErrorResponse) => {
        if(error.status === HttpStatusCode.Conflict){
          return throwError(() => 'Algo esta fallando en el server');
        }
        if(error.status === HttpStatusCode.NotFound){
          return throwError(() => 'El producto no existe');
        }
        if(error.status === HttpStatusCode.Unauthorized){
          return throwError(() => 'No estas permitido');
        }
        return throwError(() => 'Ups algo salio mal');
      })
    )
  }

  create(dto:createProductDTO){
    return this.http.post<Product>(`${this.apiUrl}/products`, dto);
  }

  update(id: string, dto: UpdateProductDTO) {
    return this.http.put<Product>(`${this.apiUrl}/products/${id}`, dto);
  }

  delete(id: string) {
    return this.http.delete<boolean>(`${this.apiUrl}/products/${id}`);
  }

}
