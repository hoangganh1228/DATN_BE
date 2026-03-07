import { DataSource } from 'typeorm';

export async function seedRoles(dataSource: DataSource): Promise<void> {
  await dataSource.query(`
    INSERT INTO \`roles\` (\`name\`, \`description\`)
    VALUES
      ('admin',    'Quản trị viên toàn quyền hệ thống'),
      ('staff',    'Nhân viên quản lý sản phẩm và đơn hàng'),
      ('customer', 'Khách hàng mặc định khi đăng ký tài khoản')
    ON DUPLICATE KEY UPDATE
      \`description\` = VALUES(\`description\`),
      \`updated_at\`  = CURRENT_TIMESTAMP;
  `);
}