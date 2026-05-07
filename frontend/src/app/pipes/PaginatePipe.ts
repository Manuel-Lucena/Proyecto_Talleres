import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'paginate',
  standalone: true
})
export class PaginatePipe implements PipeTransform {
  /**
   * @param items El array completo de datos (usuarios, etc.)
   * @param pageSize Cuántos elementos quieres ver por página
   * @param currentPage La página actual en la que estás
   */
  transform(items: any[], pageSize: number, currentPage: number): any[] {
    if (!items || items.length === 0) return [];
    
    if (pageSize <= 0) return items;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    return items.slice(startIndex, endIndex);
  }
}