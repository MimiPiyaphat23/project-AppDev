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
INSERT INTO `StoreCategory` (`StoreCategoryID`, `StoreCategoryName`) VALUES
(1, 'Food'),
(2, 'Fashion'),
(3, 'Electronics'),
(4, 'Sports');

INSERT INTO `Category` (`CategoryID`, `CategoryName`) VALUES 
(1, 'Beverages'), 
(2, 'Clothing'), 
(3, 'Gadgets');

-- -----------------------------------------------------
-- 3. Insert Mall
-- -----------------------------------------------------
INSERT INTO `Mall` (`MallID`, `MallName`, `Location`, `IsPopular`, `MallImageURL`) 
VALUES 
(1, 'Central Mall', 'Bangkok', 1, 'https://example.com/mall.jpg');

-- -----------------------------------------------------
-- 4. Insert Floors (Fix IDs to match your store data)
-- -----------------------------------------------------
INSERT INTO `Floor` (`FloorID`, `FloorName`, `MallID`, `FloorCode`, `FloorOrder`) VALUES
(1, 'Floor 1', 1, '1', 2),
(2, 'Ground Floor', 1, 'G', 1),
(3, 'Lower Ground', 1, 'LG', 0);

-- -----------------------------------------------------
-- 5. Insert Users (Password: 123456)
-- -----------------------------------------------------
INSERT INTO `User` (`UserID`, `UserName`, `Email`, `PasswordHash`, `RoleID`, `CreatedAt`, `UpdatedAt`, `StoreID`) VALUES
(1, 'admin1', 'admin1@mail.com', '$2b$12$KIXbVfP1z/9rGZ.b.L7MueqU0uV.gK0h5O7fIu.Wv7h0.G.C7.z8.', 1, NOW(), NOW(), NULL),
(2, 'storeOwner1', 'owner1@mail.com', '$2b$12$KIXbVfP1z/9rGZ.b.L7MueqU0uV.gK0h5O7fIu.Wv7h0.G.C7.z8.', 2, NOW(), NOW(), NULL),
(3, 'customer1', 'customer1@mail.com', '$2b$12$KIXbVfP1z/9rGZ.b.L7MueqU0uV.gK0h5O7fIu.Wv7h0.G.C7.z8.', 3, NOW(), NOW(), NULL);

-- -----------------------------------------------------
-- 6. Insert Stores (อ้างอิง UserID = 2)
-- -----------------------------------------------------
INSERT INTO `Store` (
  `StoreID`, `UserID`, `StoreName`, `StoreCategoryName`, `StoreCategoryIcon`, 
  `StoreCategoryID`, `Description`, `Phone`, `OpeningHours`, `LogoURL`, 
  `MallID`, `FloorName`, `FloorID`, `PosX`, `PosY`
) VALUES
(1, 2, 'Store 1', 'Food', 'food-icon.png', 1, 'Description 1', '02-111-1111', '10:00 - 22:00', 'logo1.png', 1, 'Floor 1', 1, 100.0, 200.0),
(2, 2, 'Store 2', 'Fashion', 'fashion-icon.png', 2, 'Description 2', '02-222-2222', '10:00 - 22:00', 'logo2.png', 1, 'Floor 1', 1, 150.0, 250.0),
(3, 2, 'Store 3', 'Electronics', 'elec-icon.png', 3, 'Description 3', '02-333-3333', '10:00 - 22:00', 'logo3.png', 1, 'Floor 1', 1, 200.0, 300.0);

-- -----------------------------------------------------
-- 7. Update User StoreID (อัปเดตกลับให้ Owner มีร้านค้าสังกัด)
-- -----------------------------------------------------
UPDATE `User` SET `StoreID` = 1 WHERE `UserID` = 2;

-- -----------------------------------------------------
-- 8. Insert Products (ของแถม: เพิ่มสินค้าตัวอย่างให้ร้านค้า)
-- -----------------------------------------------------
INSERT INTO `Product` (`ProductID`, `ProductName`, `Price`, `StockQuantity`, `ProductImageURL`, `StoreID`, `CategoryID`, `IsActive`) VALUES
(1, 'Coffee Latte', 65.00, 50, 'latte.png', 1, 1, 1),
(2, 'Black T-Shirt', 299.00, 20, 'shirt.png', 2, 2, 1),
(3, 'Wireless Mouse', 450.00, 15, 'mouse.png', 3, 3, 1);