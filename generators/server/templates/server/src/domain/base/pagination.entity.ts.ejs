import { BaseEntity } from './base.entity';
import { Type, Expose as JsonProperty } from 'class-transformer';

export class Sort {
  public property: string;
  public direction: 'ASC' | 'DESC' | string;
  constructor(sort: string) {
    if (sort) {
      [this.property, this.direction] = sort.split(',');
    }
  }

  asOrder() {
    const order = {};
    order[this.property] = this.direction;
    return order;
  }
}

// tslint:disable-next-line: max-classes-per-file
export class PageRequest {
  @JsonProperty()
  page: number = 0;
  @JsonProperty()
  size: number = 20;
  @Type(() => Sort)
  sort: Sort = new Sort('id,ASC');

  constructor(page: number | string, size: number | string, sort: string) {
    this.page = +page || this.page;
    this.size = +size || this.size;
    this.sort = sort ? new Sort(sort) : this.sort;
  }
}

// tslint:disable-next-line: max-classes-per-file
export class Page<T extends BaseEntity> {
  constructor(public content: T[], public total: number, public pageable: PageRequest) {}
}
