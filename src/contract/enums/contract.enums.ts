export enum ContractMessageEnum {
  CREATE_SUCCESS = 'Tạo hợp đồng thành công',
  CREATE_ERROR = 'Tạo hợp đồng không thành công',
  UPDATE_ERROR = 'Sửa hợp đồng không thành công',
  SERVICE_NOT_EXISTED = 'Dịch vụ không tồn tại.',
  SERVICE_MUST_HAVE = 'Ít nhất một dịch vụ ở trong hợp đồng.',
  CUSTOMER_NOT_EXISTED = 'Khách hàng không tồn tại.',
  CONTRACT_NOT_EXISTED = 'hợp đồng không tồn tại.',
  AUTHORIZED_ADMIN = 'Chỉ admin mới có thể dùng chức năng này.',
  AUTHORIZED_CALLCENTER = 'Chỉ callcenter mới có thể dùng chức năng này.',
  DATA_NOT_EXIST = 'Dữ liệu không tồn tại.',
}
