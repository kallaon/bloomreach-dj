export interface SessionProperties {
  activity?: string;
  browser?: string;
  cookie?: string;
  device?: string;
  location?: string;
  os?: string;
  path?: string;
  referrer?: string;
  ip?: string;
  country?: string;
  state?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  created?: number;
  last_update?: number;
  duration?: number;
}

export interface PageVisitProperties {
  browser?: string;
  device?: string;
  location?: string;
  os?: string;
  path?: string;
  referrer?: string;
}

export interface PurchaseProperties {
  purchase_status?: string;
  total_price?: number;
  product_list?: string;
  product_ids?: string;
  voucher?: string;
  discount_value?: string;
  currency?: string;
  payment_method?: string;
  purchase_id?: string;
  purchase_source_type?: string;
}

export interface CartUpdateProperties {
  product_id?: string;
  variant_id?: string;
  category_level_1?: string;
  category_level_2?: string;
  category_level_3?: string;
  product_list?: string;
  action?: string;
}

export interface ViewItemProperties {
  product_id?: string;
  variant_id?: string;
  category_level_1?: string;
  category_level_2?: string;
  category_level_3?: string;
}
