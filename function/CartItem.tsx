// types.ts atau cartTypes.ts (atau nama file sesuai keinginan Anda)

export interface Size {
    size: string;
    price: string;
  }
  
  export interface CartItem {
    id: number;
    name: string;
    image: string;
    sizes: Size[];
    qty: number;
    price: string;
  }
  