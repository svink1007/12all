import BaseService from './BaseService';

export class ArticlesService extends BaseService {
  static getAll() {
    return this.getWithAuthIfApplicable('/articles?_sort=id:DESC')
  }

  static getAllLimit(limit: number) {
    return this.getWithAuthIfApplicable(`/articles?_sort=id:DESC&_limit=${limit}`)
  }

  static getArticle(id: string) {
    return this.get(`/articles?id=${id}`);
  }
}
