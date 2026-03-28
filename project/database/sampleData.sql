-- -----------------------------------------------------
-- Sample Data for MallMAP
-- -----------------------------------------------------

USE `MallMAP`;

-- ปิดการเช็ค Foreign Key ชั่วคราว เพื่อล้างข้อมูลเก่า
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE `FavoriteProduct`;
TRUNCATE TABLE `FavoriteStore`;
TRUNCATE TABLE `Product`;
TRUNCATE TABLE `Store`;
TRUNCATE TABLE `Floor`;
TRUNCATE TABLE `Mall`;
TRUNCATE TABLE `User`;
TRUNCATE TABLE `Role`;
TRUNCATE TABLE `StoreCategory`;
TRUNCATE TABLE `Category`;

-- เปิดการเช็ค Foreign Key กลับมาเหมือนเดิม
SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------
-- 1. Insert Roles
-- -----------------------------------------------------
INSERT INTO `Role` (`RoleID`, `RoleName`) VALUES 
(1, 'admin'), 
(2, 'seller'), 
(3, 'user');

-- -----------------------------------------------------
-- 2. Insert Store Categories & Product Categories
-- -----------------------------------------------------
INSERT INTO `StoreCategory` (`StoreCategoryName`) VALUES
('Food'),
('Fashion'),
('Electronics'),
('Sports');

INSERT INTO `Category` (`CategoryName`) VALUES 
('Beverages'), 
('Clothing'), 
('Gadgets');

-- -----------------------------------------------------
-- 3. Insert Mall
-- -----------------------------------------------------
INSERT INTO `Mall` (`MallName`, `Location`, `IsPopular`, `MallImageURL`) 
VALUES 
('Central Mall', 'Bangkok', 1, 'https://example.com/mall.jpg');

-- -----------------------------------------------------
-- 4. Insert Floors (Fix IDs to match your store data)
-- -----------------------------------------------------
INSERT INTO `Floor` (`FloorName`, `MallID`, `FloorCode`, `FloorOrder`, `StoreCount`) VALUES 
('Floor 1', 1, '1F', 1, 3);

-- -----------------------------------------------------
-- 5. Insert Users (Password: 123456)
-- -----------------------------------------------------
INSERT INTO `User` (`UserName`, `Email`, `PasswordHash`, `RoleID`, `CreatedAt`, `UpdatedAt`, `StoreID`) VALUES
(1, 'admin1', 'admin1@mail.com', '$2b$12$KIXbVfP1z/9rGZ.b.L7MueqU0uV.gK0h5O7fIu.Wv7h0.G.C7.z8.', 1, NOW(), NOW(), NULL),
(2, 'storeOwner1', 'owner1@mail.com', '$2b$12$KIXbVfP1z/9rGZ.b.L7MueqU0uV.gK0h5O7fIu.Wv7h0.G.C7.z8.', 2, NOW(), NOW(), NULL),
(3, 'customer1', 'customer1@mail.com', '$2b$12$KIXbVfP1z/9rGZ.b.L7MueqU0uV.gK0h5O7fIu.Wv7h0.G.C7.z8.', 3, NOW(), NOW(), NULL);

-- -----------------------------------------------------
-- 6. Insert Stores (อ้างอิง UserID = 2)
-- -----------------------------------------------------

INSERT INTO `Store` (
  `UserID`, `StoreName`, `StoreCategoryName`, `StoreCategoryIcon`, 
  `StoreCategoryID`, `Description`, `Phone`, `OpeningHours`, `LogoURL`, 
  `MallID`, `FloorName`, `FloorID`, `PosX`, `PosY`
) VALUES
(2, 'Store 4', 'Fashion', 'fashion-icon.png', 2, 'Description 4', '02-444-4444', '10:00 - 22:00', 'logo4.png', 1, 'Floor 1', 1, 150.0, 250.0);
-- -----------------------------------------------------
-- 7. Update User StoreID (อัปเดตกลับให้ Owner มีร้านค้าสังกัด)
-- -----------------------------------------------------
UPDATE `User` SET `StoreID` = 1 WHERE `UserID` = 2;

-- -----------------------------------------------------
-- 8. Insert Products (ของแถม: เพิ่มสินค้าตัวอย่างให้ร้านค้า)
-- -----------------------------------------------------
INSERT INTO `Product` (`ProductName`, `Price`, `StockQuantity`, `ProductImageURL`, `StoreID`, `CategoryID`, `IsActive`) VALUES
('Coffee Latte', 65.00, 50, 'latte.png', 1, 1, 1),
('Black T-Shirt', 299.00, 20, 'shirt.png', 2, 2, 1),
('Wireless Mouse', 450.00, 15, 'mouse.png', 3, 3, 1);