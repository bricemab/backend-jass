type dataType = { [key: string]: any };

class GlobalStore {
  data: dataType;

  constructor() {
    this.data = {};
  }

  addItem(key: string, item: any) {
    this.data[key] = item;
  }

  getItem<ResponseType>(key: string): ResponseType {
    return this.data[key];
  }
}

const store = new GlobalStore();
export default store;
