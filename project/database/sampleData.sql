-- -----------------------------------------------------
-- Sample Data for MallMAP
-- -----------------------------------------------------

USE `MallMAP`;

-- ปิดการเช็ค Foreign Key ชั่วคราว เพื่อล้างข้อมูลเก่าได้ง่ายๆ
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
INSERT INTO MallMAP.Role (RoleName)
VALUES ('admin'), ('seller'), ('user');

-- -----------------------------------------------------
-- 2. Insert Users (Password: 123456)
-- -----------------------------------------------------
INSERT INTO `User` (`UserName`, `Email`, `PasswordHash`, `RoleID`, `CreatedAt`, `UpdatedAt`, `StoreID`) VALUES
('admin1', 'admin1@mail.com', '$2b$12$KIXbVfP1z/9rGZ.b.L7MueqU0uV.gK0h5O7fIu.Wv7h0.G.C7.z8.', 1, NOW(), NOW(), NULL),
('storeOwner1', 'owner1@mail.com', '$2b$12$KIXbVfP1z/9rGZ.b.L7MueqU0uV.gK0h5O7fIu.Wv7h0.G.C7.z8.', 2, NOW(), NOW(), 1),
('customer1', 'customer1@mail.com', '$2b$12$KIXbVfP1z/9rGZ.b.L7MueqU0uV.gK0h5O7fIu.Wv7h0.G.C7.z8.', 3, NOW(), NOW(), NULL);

-- -----------------------------------------------------
-- 3. Insert Store Categories
-- -----------------------------------------------------
INSERT INTO `StoreCategory` (`StoreCategoryName`) VALUES
('Food'),
('Fashion'),
('Electronics');

-- -----------------------------------------------------
-- 4. Insert Mall
-- -----------------------------------------------------
INSERT INTO `Mall` (`MallName`, `Location`, `IsPopular`, `MallImageURL`) 
VALUES 
('Central Mall', 'Bangkok', 1, 'https://example.com/mall.jpg');

INSERT INTO MallMAP.Floor (FloorName, MallID, FloorCode, FloorOrder)
VALUES
('Lower Ground', 1, 'LG', 0),
('Ground Floor', 1, 'G', 1),
('Floor 1', 1, '1', 2);

INSERT INTO MallMAP.StoreCategory (StoreCategoryName)
VALUES ('Sports'), ('Food'), ('Electronics'), ('Clothing');
-- -----------------------------------------------------
-- 2. Insert Users (Password: 123456)
-- -----------------------------------------------------
INSERT INTO MallMAP.User (
    UserName,
    Email,
    PasswordHash,
    RoleID
)
VALUES (
    'seller1',
    'seller1@email.com',
    '1234',
    2
);

INSERT INTO MallMAP.Store (
    UserID,
    StoreName,
    StoreCategoryID,
    StoreCategoryName,
    StoreCategoryIcon,
    MallID,
    FloorID,
    PosX,
    PosY
)
VALUES (
    1,
    'Nike Store',
    1,
    'Sports',
    'shoe',
    1,
    2,
    50,
    40
);